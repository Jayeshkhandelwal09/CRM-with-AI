const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema({
  // Basic AI Request Information
  feature: {
    type: String,
    required: [true, 'AI feature is required'],
    enum: ['deal_coach', 'persona_builder', 'objection_handler', 'win_loss_explainer'],
    lowercase: true
  },
  requestType: {
    type: String,
    required: [true, 'Request type is required'],
    enum: ['generate', 'analyze', 'suggest', 'explain', 'build', 'feedback'],
    lowercase: true
  },
  
  // User and Context
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'AI log must have a user']
  },
  sessionId: {
    type: String,
    trim: true // For grouping related requests
  },
  
  // Related Entities
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    default: null
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    default: null
  },
  objectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Objection',
    default: null
  },
  
  // Request Data
  inputData: {
    type: mongoose.Schema.Types.Mixed, // Flexible structure for different AI features
    required: [true, 'Input data is required']
  },
  inputTokens: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Response Data
  outputData: {
    type: mongoose.Schema.Types.Mixed, // Flexible structure for different AI responses
    default: null
  },
  outputTokens: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // AI Model Information
  model: {
    type: String,
    default: 'gpt-4',
    trim: true
  },
  modelVersion: {
    type: String,
    trim: true
  },
  temperature: {
    type: Number,
    min: 0,
    max: 2,
    default: 0.7
  },
  
  // Request Status and Timing
  status: {
    type: String,
    required: [true, 'Request status is required'],
    enum: ['pending', 'completed', 'failed', 'timeout', 'rate_limited'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  responseTime: {
    type: Number, // Response time in milliseconds
    min: 0,
    default: null
  },
  
  // Error Information
  errorMessage: {
    type: String,
    trim: true,
    maxlength: [500, 'Error message cannot exceed 500 characters']
  },
  errorCode: {
    type: String,
    trim: true
  },
  
  // User Feedback
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
    },
    wasUseful: {
      type: Boolean,
      default: null
    }
  },
  
  // Usage Tracking
  wasApplied: {
    type: Boolean,
    default: false // Whether the user applied/used the AI suggestion
  },
  appliedDate: {
    type: Date,
    default: null
  },
  viewCount: {
    type: Number,
    default: 1
  },
  
  // Cost Tracking
  estimatedCost: {
    type: Number, // Cost in USD cents
    min: 0,
    default: 0
  },
  
  // Context and Metadata
  userAgent: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  requestSource: {
    type: String,
    enum: ['web', 'mobile', 'api', 'batch'],
    default: 'web'
  },
  
  // RAG and Context Information
  contextUsed: {
    type: Boolean,
    default: false
  },
  contextSources: [{
    type: {
      type: String,
      enum: ['deal', 'contact', 'interaction', 'objection', 'historical_data']
    },
    id: mongoose.Schema.Types.ObjectId,
    relevanceScore: {
      type: Number,
      min: 0,
      max: 1
    }
  }],
  
  // Quality Metrics
  confidence: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: null
  },
  relevanceScore: {
    type: Number,
    min: 0,
    max: 1,
    default: null
  },
  
  // A/B Testing
  experimentId: {
    type: String,
    trim: true
  },
  variant: {
    type: String,
    trim: true
  },
  
  // Data Retention
  retentionDate: {
    type: Date,
    default: function() {
      // Default retention: 1 year from creation
      const oneYear = new Date();
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      return oneYear;
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      // Remove sensitive data from JSON output
      delete ret.ipAddress;
      delete ret.userAgent;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for total tokens used
aiLogSchema.virtual('totalTokens').get(function() {
  return (this.inputTokens || 0) + (this.outputTokens || 0);
});

// Virtual for request duration in seconds
aiLogSchema.virtual('durationSeconds').get(function() {
  if (!this.responseTime) return null;
  return Math.round(this.responseTime / 1000);
});

// Virtual for cost in dollars
aiLogSchema.virtual('costUSD').get(function() {
  return this.estimatedCost / 100; // Convert cents to dollars
});

// Virtual for success status
aiLogSchema.virtual('isSuccess').get(function() {
  return this.status === 'completed';
});

// Virtual for has feedback
aiLogSchema.virtual('hasFeedback').get(function() {
  return this.userFeedback && this.userFeedback.rating !== null;
});

// Indexes for performance
aiLogSchema.index({ userId: 1 });
aiLogSchema.index({ feature: 1 });
aiLogSchema.index({ status: 1 });
aiLogSchema.index({ createdAt: -1 });
aiLogSchema.index({ startTime: -1 });
aiLogSchema.index({ dealId: 1 });
aiLogSchema.index({ contactId: 1 });
aiLogSchema.index({ objectionId: 1 });
aiLogSchema.index({ sessionId: 1 });

// Compound indexes for common queries
aiLogSchema.index({ userId: 1, feature: 1 });
aiLogSchema.index({ userId: 1, createdAt: -1 });
aiLogSchema.index({ userId: 1, status: 1 });
aiLogSchema.index({ feature: 1, status: 1 });
aiLogSchema.index({ feature: 1, createdAt: -1 });
aiLogSchema.index({ dealId: 1, feature: 1 }); // For cleanup jobs

// TTL index for automatic cleanup
aiLogSchema.index({ retentionDate: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
aiLogSchema.pre('save', function(next) {
  // Calculate response time if end time is set
  if (this.endTime && this.startTime && !this.responseTime) {
    this.responseTime = this.endTime - this.startTime;
  }
  
  // Set end time if status is completed or failed and end time is not set
  if ((this.status === 'completed' || this.status === 'failed') && !this.endTime) {
    this.endTime = new Date();
    this.responseTime = this.endTime - this.startTime;
  }
  
  next();
});

// Post-save middleware to update user AI usage
aiLogSchema.post('save', async function(doc) {
  if (doc.isNew && doc.status === 'completed') {
    try {
      const User = require('./User');
      const user = await User.findById(doc.userId);
      if (user) {
        user.incrementAiRequests();
        await user.save();
      }
    } catch (error) {
      console.error('Error updating user AI usage after log save:', error);
    }
  }
});

// Instance method to mark as completed
aiLogSchema.methods.markCompleted = function(outputData, outputTokens = 0) {
  this.status = 'completed';
  this.outputData = outputData;
  this.outputTokens = outputTokens;
  this.endTime = new Date();
  this.responseTime = this.endTime - this.startTime;
};

// Instance method to mark as failed
aiLogSchema.methods.markFailed = function(errorMessage, errorCode = null) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.errorCode = errorCode;
  this.endTime = new Date();
  this.responseTime = this.endTime - this.startTime;
};

// Instance method to add user feedback
aiLogSchema.methods.addFeedback = function(rating, comment = null, wasUseful = null) {
  this.userFeedback = {
    rating: rating,
    comment: comment,
    feedbackDate: new Date(),
    wasUseful: wasUseful
  };
};

// Instance method to mark as applied
aiLogSchema.methods.markAsApplied = function() {
  this.wasApplied = true;
  this.appliedDate = new Date();
};

// Instance method to increment view count
aiLogSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
};

// Instance method to calculate estimated cost
aiLogSchema.methods.calculateCost = function() {
  // Simple cost calculation based on tokens
  // These rates are approximate and should be updated based on actual OpenAI pricing
  const inputCostPer1K = 0.03; // $0.03 per 1K input tokens
  const outputCostPer1K = 0.06; // $0.06 per 1K output tokens
  
  const inputCost = (this.inputTokens / 1000) * inputCostPer1K;
  const outputCost = (this.outputTokens / 1000) * outputCostPer1K;
  
  this.estimatedCost = Math.round((inputCost + outputCost) * 100); // Convert to cents
};

// Static method to find logs by user
aiLogSchema.statics.findByUser = function(userId, limit = 50) {
  return this.find({ userId: userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find logs by feature
aiLogSchema.statics.findByFeature = function(feature, userId = null, limit = 50) {
  const query = { feature: feature };
  if (userId) query.userId = userId;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find recent logs
aiLogSchema.statics.findRecent = function(userId = null, hours = 24) {
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - hours);
  
  const query = { createdAt: { $gte: startTime } };
  if (userId) query.userId = userId;
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get usage statistics
aiLogSchema.statics.getUsageStats = async function(userId = null, startDate = null, endDate = null) {
  const matchStage = {};
  if (userId) matchStage.userId = userId;
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$feature',
        totalRequests: { $sum: 1 },
        successfulRequests: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failedRequests: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        avgResponseTime: { $avg: '$responseTime' },
        totalTokens: { $sum: { $add: ['$inputTokens', '$outputTokens'] } },
        totalCost: { $sum: '$estimatedCost' },
        appliedCount: { $sum: { $cond: ['$wasApplied', 1, 0] } },
        positiveRatings: { 
          $sum: { 
            $cond: [
              { $eq: ['$userFeedback.rating', 'thumbs_up'] }, 
              1, 
              0
            ] 
          } 
        },
        negativeRatings: { 
          $sum: { 
            $cond: [
              { $eq: ['$userFeedback.rating', 'thumbs_down'] }, 
              1, 
              0
            ] 
          } 
        }
      }
    },
    {
      $project: {
        feature: '$_id',
        totalRequests: 1,
        successfulRequests: 1,
        failedRequests: 1,
        avgResponseTime: { $round: ['$avgResponseTime', 2] },
        totalTokens: 1,
        totalCostUSD: { $divide: ['$totalCost', 100] },
        appliedCount: 1,
        positiveRatings: 1,
        negativeRatings: 1,
        successRate: { 
          $multiply: [
            { $divide: ['$successfulRequests', '$totalRequests'] }, 
            100
          ] 
        },
        applicationRate: {
          $multiply: [
            { $divide: ['$appliedCount', '$successfulRequests'] }, 
            100
          ] 
        },
        satisfactionRate: {
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
            null
          ]
        }
      }
    },
    { $sort: { totalRequests: -1 } }
  ]);
  
  return stats;
};

// Static method to get daily usage for a user
aiLogSchema.statics.getDailyUsage = async function(userId, date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const usage = await this.aggregate([
    {
      $match: {
        userId: userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$feature',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const totalCount = usage.reduce((sum, item) => sum + item.count, 0);
  
  return {
    date: date,
    totalRequests: totalCount,
    byFeature: usage,
    remainingRequests: Math.max(0, 100 - totalCount) // Assuming 100 daily limit
  };
};

// Static method to cleanup old logs
aiLogSchema.statics.cleanupOldLogs = async function() {
  const result = await this.deleteMany({
    retentionDate: { $lt: new Date() }
  });
  
  return {
    deletedCount: result.deletedCount,
    cleanupDate: new Date()
  };
};

// Static method to get error analytics
aiLogSchema.statics.getErrorAnalytics = async function(startDate = null, endDate = null) {
  const matchStage = { status: 'failed' };
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = startDate;
    if (endDate) matchStage.createdAt.$lte = endDate;
  }
  
  const errors = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          feature: '$feature',
          errorCode: '$errorCode'
        },
        count: { $sum: 1 },
        latestError: { $max: '$createdAt' },
        sampleMessage: { $first: '$errorMessage' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return errors;
};

const AILog = mongoose.model('AILog', aiLogSchema);

module.exports = AILog; 