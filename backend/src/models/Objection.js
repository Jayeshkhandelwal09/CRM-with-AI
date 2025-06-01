const mongoose = require('mongoose');

const objectionSchema = new mongoose.Schema({
  // Basic Objection Information
  text: {
    type: String,
    required: [true, 'Objection text is required'],
    trim: true,
    maxlength: [1000, 'Objection text cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Objection category is required'],
    enum: ['price', 'budget', 'timing', 'authority', 'need', 'trust', 'competitor', 'features', 'support', 'other'],
    lowercase: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Context Information
  context: {
    type: String,
    trim: true,
    maxlength: [500, 'Context cannot exceed 500 characters']
  },
  dealStage: {
    type: String,
    enum: ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    required: [true, 'Deal stage when objection occurred is required']
  },
  
  // Relationships
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Objection must have an owner']
  },
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: [true, 'Objection must be associated with a deal']
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    default: null // Optional - derived from deal if not provided
  },
  
  // AI Response Information
  aiResponses: [{
    responseText: {
      type: String,
      required: true,
      trim: true,
      maxlength: [300, 'AI response cannot exceed 300 characters']
    },
    approach: {
      type: String,
      enum: ['logical', 'emotional', 'social_proof', 'authority', 'scarcity', 'reciprocity'],
      required: true
    },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    wasUsed: {
      type: Boolean,
      default: false
    },
    userFeedback: {
      rating: {
        type: String,
        enum: ['thumbs_up', 'thumbs_down'],
        default: null
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [200, 'Feedback comment cannot exceed 200 characters']
      },
      feedbackDate: {
        type: Date,
        default: null
      }
    }
  }],
  
  // Resolution Information
  isResolved: {
    type: Boolean,
    default: false
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: [500, 'Resolution cannot exceed 500 characters']
  },
  resolutionDate: {
    type: Date,
    default: null
  },
  actualResponse: {
    type: String,
    trim: true,
    maxlength: [1000, 'Actual response cannot exceed 1000 characters']
  },
  
  // Outcome Tracking
  outcome: {
    type: String,
    enum: ['resolved', 'escalated', 'deal_lost', 'postponed', 'unresolved'],
    default: 'unresolved'
  },
  impactOnDeal: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'deal_killer'],
    default: 'neutral'
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // AI Training Data
  similarObjections: [{
    objectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Objection'
    },
    similarity: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  responseGenerationCount: {
    type: Number,
    default: 0
  },
  
  // Import/Export Tracking
  importSource: {
    type: String,
    trim: true
  },
  importDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for objection age in days
objectionSchema.virtual('ageInDays').get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days to resolution
objectionSchema.virtual('daysToResolution').get(function() {
  if (!this.resolutionDate) return null;
  const diffTime = Math.abs(this.resolutionDate - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for best AI response (highest rated)
objectionSchema.virtual('bestAiResponse').get(function() {
  if (!this.aiResponses || this.aiResponses.length === 0) return null;
  
  // Find response with thumbs_up feedback first
  const thumbsUpResponse = this.aiResponses.find(r => 
    r.userFeedback && r.userFeedback.rating === 'thumbs_up'
  );
  if (thumbsUpResponse) return thumbsUpResponse;
  
  // Otherwise return highest confidence response
  return this.aiResponses.reduce((best, current) => {
    const confidenceOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    return confidenceOrder[current.confidence] > confidenceOrder[best.confidence] ? current : best;
  });
});

// Virtual for response success rate
objectionSchema.virtual('responseSuccessRate').get(function() {
  if (!this.aiResponses || this.aiResponses.length === 0) return 0;
  
  const ratedResponses = this.aiResponses.filter(r => 
    r.userFeedback && r.userFeedback.rating
  );
  
  if (ratedResponses.length === 0) return 0;
  
  const positiveResponses = ratedResponses.filter(r => 
    r.userFeedback.rating === 'thumbs_up'
  );
  
  return Math.round((positiveResponses.length / ratedResponses.length) * 100);
});

// Indexes for performance
objectionSchema.index({ owner: 1 });
objectionSchema.index({ dealId: 1 });
objectionSchema.index({ contactId: 1 });
objectionSchema.index({ category: 1 });
objectionSchema.index({ severity: 1 });
objectionSchema.index({ isResolved: 1 });
objectionSchema.index({ outcome: 1 });
objectionSchema.index({ createdAt: -1 });
objectionSchema.index({ resolutionDate: -1 });

// Compound indexes for common queries
objectionSchema.index({ owner: 1, category: 1 });
objectionSchema.index({ owner: 1, isResolved: 1 });
objectionSchema.index({ owner: 1, dealStage: 1 });
objectionSchema.index({ dealId: 1, createdAt: -1 });
objectionSchema.index({ category: 1, dealStage: 1 });
objectionSchema.index({ severity: 1, isResolved: 1 });

// Text index for search functionality
objectionSchema.index({
  text: 'text',
  context: 'text',
  resolution: 'text',
  actualResponse: 'text',
  tags: 'text'
});

// Pre-save middleware
objectionSchema.pre('save', function(next) {
  // Auto-resolve if resolution is provided
  if (this.isModified('resolution') && this.resolution && !this.isResolved) {
    this.isResolved = true;
    this.resolutionDate = new Date();
    if (this.outcome === 'unresolved') {
      this.outcome = 'resolved';
    }
  }
  
  // Clean up tags - remove empty tags and duplicates
  if (this.isModified('tags')) {
    this.tags = [...new Set(this.tags.filter(tag => tag && tag.trim()))];
  }
  
  next();
});

// Post-save middleware to update deal objection count
objectionSchema.post('save', async function(doc) {
  if (doc.isNew) {
    try {
      const Deal = require('./Deal');
      // You might want to add an objectionsCount field to Deal model
      // await Deal.findByIdAndUpdate(doc.dealId, { $inc: { objectionsCount: 1 } });
    } catch (error) {
      console.error('Error updating deal after objection save:', error);
    }
  }
});

// Instance method to add AI response
objectionSchema.methods.addAiResponse = function(responseData) {
  this.aiResponses.push({
    responseText: responseData.responseText,
    approach: responseData.approach,
    confidence: responseData.confidence,
    generatedAt: new Date()
  });
  this.responseGenerationCount += 1;
};

// Instance method to rate AI response
objectionSchema.methods.rateAiResponse = function(responseIndex, rating, comment = null) {
  if (responseIndex >= 0 && responseIndex < this.aiResponses.length) {
    this.aiResponses[responseIndex].userFeedback = {
      rating: rating,
      comment: comment,
      feedbackDate: new Date()
    };
  }
};

// Instance method to mark as used
objectionSchema.methods.markResponseAsUsed = function(responseIndex) {
  if (responseIndex >= 0 && responseIndex < this.aiResponses.length) {
    this.aiResponses[responseIndex].wasUsed = true;
  }
};

// Instance method to resolve objection
objectionSchema.methods.resolve = function(resolution, outcome = 'resolved', actualResponse = null) {
  this.isResolved = true;
  this.resolution = resolution;
  this.resolutionDate = new Date();
  this.outcome = outcome;
  if (actualResponse) {
    this.actualResponse = actualResponse;
  }
};

// Instance method to add tag
objectionSchema.methods.addTag = function(tag) {
  if (tag && tag.trim() && !this.tags.includes(tag.trim())) {
    this.tags.push(tag.trim());
  }
};

// Instance method to remove tag
objectionSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
};

// Instance method to increment view count
objectionSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
};

// Static method to find objections by owner
objectionSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId }).sort({ createdAt: -1 });
};

// Static method to find objections by deal
objectionSchema.statics.findByDeal = function(dealId) {
  return this.find({ dealId: dealId }).sort({ createdAt: -1 });
};

// Static method to find objections by category
objectionSchema.statics.findByCategory = function(category, ownerId = null) {
  const query = { category: category };
  if (ownerId) query.owner = ownerId;
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find unresolved objections
objectionSchema.statics.findUnresolved = function(ownerId = null) {
  const query = { isResolved: false };
  if (ownerId) query.owner = ownerId;
  return this.find(query).sort({ severity: -1, createdAt: -1 });
};

// Static method to find objections by deal stage
objectionSchema.statics.findByDealStage = function(dealStage, ownerId = null) {
  const query = { dealStage: dealStage };
  if (ownerId) query.owner = ownerId;
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get objection statistics
objectionSchema.statics.getStats = async function(ownerId = null, startDate = null, endDate = null) {
  const matchStage = {};
  if (ownerId) matchStage.owner = ownerId;
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        resolved: { $sum: { $cond: ['$isResolved', 1, 0] } },
        avgResolutionTime: { 
          $avg: { 
            $cond: [
              '$isResolved',
              { $divide: [{ $subtract: ['$resolutionDate', '$createdAt'] }, 86400000] }, // Convert to days
              null
            ]
          }
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return stats;
};

// Static method to find similar objections for AI training
objectionSchema.statics.findSimilar = async function(objectionText, category, limit = 5) {
  // This is a simple text-based similarity search
  // In production, you'd use vector embeddings for better similarity matching
  const query = {
    category: category,
    $text: { $search: objectionText }
  };
  
  return this.find(query)
    .limit(limit)
    .sort({ score: { $meta: 'textScore' } });
};

// Static method to get AI response analytics
objectionSchema.statics.getAiResponseAnalytics = async function(ownerId = null) {
  const matchStage = {};
  if (ownerId) matchStage.owner = ownerId;
  
  const analytics = await this.aggregate([
    { $match: matchStage },
    { $unwind: '$aiResponses' },
    {
      $group: {
        _id: {
          approach: '$aiResponses.approach',
          confidence: '$aiResponses.confidence'
        },
        totalResponses: { $sum: 1 },
        usedResponses: { $sum: { $cond: ['$aiResponses.wasUsed', 1, 0] } },
        positiveRatings: { 
          $sum: { 
            $cond: [
              { $eq: ['$aiResponses.userFeedback.rating', 'thumbs_up'] }, 
              1, 
              0
            ] 
          } 
        },
        negativeRatings: { 
          $sum: { 
            $cond: [
              { $eq: ['$aiResponses.userFeedback.rating', 'thumbs_down'] }, 
              1, 
              0
            ] 
          } 
        }
      }
    },
    {
      $project: {
        approach: '$_id.approach',
        confidence: '$_id.confidence',
        totalResponses: 1,
        usedResponses: 1,
        positiveRatings: 1,
        negativeRatings: 1,
        usageRate: { 
          $multiply: [
            { $divide: ['$usedResponses', '$totalResponses'] }, 
            100
          ] 
        },
        successRate: {
          $cond: [
            { $gt: [{ $add: ['$positiveRatings', '$negativeRatings'] }, 0] },
            { 
              $multiply: [
                { 
                  $divide: [
                    '$positiveRatings', 
                    { $add: ['$positiveRatings', '$negativeRatings'] }
                  ] 
                }, 
                100
              ] 
            },
            0
          ]
        }
      }
    },
    { $sort: { successRate: -1, usageRate: -1 } }
  ]);
  
  return analytics;
};

const Objection = mongoose.model('Objection', objectionSchema);

module.exports = Objection; 