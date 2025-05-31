const mongoose = require('mongoose');

const objectionSchema = new mongoose.Schema({
  // Objection Content
  objectionText: {
    type: String,
    required: [true, 'Objection text is required'],
    trim: true,
    maxlength: [1000, 'Objection text cannot exceed 1000 characters']
  },
  
  // Objection Classification
  category: {
    type: String,
    enum: [
      'price',           // Price/budget concerns
      'timing',          // Not the right time
      'authority',       // Not the decision maker
      'need',            // Don't see the need
      'competition',     // Considering competitors
      'features',        // Missing features/functionality
      'trust',           // Trust/credibility concerns
      'process',         // Internal process issues
      'technical',       // Technical concerns
      'other'
    ],
    required: [true, 'Objection category is required']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Context & Timing
  stage: {
    type: String,
    enum: ['prospecting', 'qualification', 'proposal', 'negotiation'],
    required: [true, 'Deal stage when objection occurred is required']
  },
  raisedAt: {
    type: Date,
    default: Date.now
  },
  
  // Relationships
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: [true, 'Deal reference is required']
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: [true, 'Contact reference is required']
  },
  
  // AI-Generated Responses
  aiResponses: [{
    responseText: {
      type: String,
      required: true,
      maxlength: [2000, 'Response text cannot exceed 2000 characters']
    },
    strategy: {
      type: String,
      enum: [
        'acknowledge_and_redirect',
        'question_the_objection',
        'provide_evidence',
        'reframe_perspective',
        'offer_alternative',
        'create_urgency',
        'social_proof',
        'cost_benefit_analysis'
      ],
      required: true
    },
    tone: {
      type: String,
      enum: ['professional', 'empathetic', 'confident', 'consultative', 'direct'],
      default: 'professional'
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 75
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    // User feedback on AI response
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      used: {
        type: Boolean,
        default: false
      },
      effectiveness: {
        type: String,
        enum: ['very_effective', 'effective', 'neutral', 'ineffective', 'very_ineffective']
      },
      notes: String
    }
  }],
  
  // Actual Response Used
  actualResponse: {
    responseText: String,
    usedAiResponse: {
      type: Boolean,
      default: false
    },
    customizations: String,
    deliveredAt: Date,
    deliveryMethod: {
      type: String,
      enum: ['email', 'phone', 'in_person', 'video_call', 'linkedin']
    }
  },
  
  // Objection Resolution
  status: {
    type: String,
    enum: ['open', 'addressed', 'resolved', 'unresolved'],
    default: 'open'
  },
  resolution: {
    outcome: {
      type: String,
      enum: ['objection_overcome', 'partial_resolution', 'objection_persists', 'deal_lost']
    },
    notes: String,
    resolvedAt: Date
  },
  
  // Follow-up Actions
  followUpActions: [{
    action: String,
    dueDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  
  // Tags & Notes
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // User Association
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
objectionSchema.index({ deal: 1 });
objectionSchema.index({ contact: 1 });
objectionSchema.index({ createdBy: 1, isDeleted: 1 });
objectionSchema.index({ category: 1 });
objectionSchema.index({ status: 1 });
objectionSchema.index({ severity: 1 });
objectionSchema.index({ raisedAt: 1 });

// Compound indexes
objectionSchema.index({ deal: 1, status: 1 });
objectionSchema.index({ createdBy: 1, status: 1, isDeleted: 1 });

// Text search index
objectionSchema.index({
  objectionText: 'text',
  notes: 'text'
});

// Virtuals
objectionSchema.virtual('isOverdue').get(function() {
  if (this.status === 'resolved' || this.status === 'unresolved') return false;
  
  // Consider objection overdue if it's been open for more than 7 days
  const daysSinceRaised = Math.ceil((new Date() - this.raisedAt) / (1000 * 60 * 60 * 24));
  return daysSinceRaised > 7;
});

objectionSchema.virtual('daysSinceRaised').get(function() {
  return Math.ceil((new Date() - this.raisedAt) / (1000 * 60 * 60 * 24));
});

objectionSchema.virtual('bestAiResponse').get(function() {
  if (!this.aiResponses || this.aiResponses.length === 0) return null;
  
  // Return the response with highest confidence that hasn't been rated poorly
  return this.aiResponses
    .filter(response => !response.feedback || response.feedback.rating !== 1)
    .sort((a, b) => b.confidence - a.confidence)[0];
});

objectionSchema.virtual('hasUncompletedActions').get(function() {
  return this.followUpActions.some(action => !action.completed);
});

// Pre-save middleware
objectionSchema.pre('save', function(next) {
  // Auto-resolve if actual response is provided and status is still open
  if (this.actualResponse && this.actualResponse.responseText && this.status === 'open') {
    this.status = 'addressed';
  }
  
  // Set resolution date when status changes to resolved/unresolved
  if (this.isModified('status') && (this.status === 'resolved' || this.status === 'unresolved')) {
    if (!this.resolution.resolvedAt) {
      this.resolution.resolvedAt = new Date();
    }
  }
  
  next();
});

// Static methods
objectionSchema.statics.findByDeal = function(dealId, userId) {
  return this.find({
    deal: dealId,
    createdBy: userId,
    isDeleted: false
  }).sort({ raisedAt: -1 });
};

objectionSchema.statics.findByContact = function(contactId, userId) {
  return this.find({
    contact: contactId,
    createdBy: userId,
    isDeleted: false
  }).sort({ raisedAt: -1 });
};

objectionSchema.statics.findByCategory = function(category, userId) {
  return this.find({
    category: category,
    createdBy: userId,
    isDeleted: false
  }).sort({ raisedAt: -1 });
};

objectionSchema.statics.findOpen = function(userId) {
  return this.find({
    createdBy: userId,
    status: { $in: ['open', 'addressed'] },
    isDeleted: false
  }).sort({ raisedAt: -1 });
};

objectionSchema.statics.getObjectionStats = function(userId, startDate, endDate) {
  const matchConditions = {
    createdBy: userId,
    isDeleted: false
  };
  
  if (startDate && endDate) {
    matchConditions.raisedAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgSeverity: { $avg: { $switch: {
          branches: [
            { case: { $eq: ['$severity', 'low'] }, then: 1 },
            { case: { $eq: ['$severity', 'medium'] }, then: 2 },
            { case: { $eq: ['$severity', 'high'] }, then: 3 },
            { case: { $eq: ['$severity', 'critical'] }, then: 4 }
          ],
          default: 2
        }}},
        resolutionRate: {
          $avg: {
            $cond: [
              { $eq: ['$status', 'resolved'] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

// Instance methods
objectionSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

objectionSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

objectionSchema.methods.addAiResponse = function(response) {
  this.aiResponses.push(response);
  return this.save();
};

objectionSchema.methods.rateAiResponse = function(responseId, rating, effectiveness, notes) {
  const response = this.aiResponses.id(responseId);
  if (response) {
    response.feedback = {
      rating: rating,
      effectiveness: effectiveness,
      notes: notes
    };
    return this.save();
  }
  return Promise.reject(new Error('AI response not found'));
};

objectionSchema.methods.markAiResponseUsed = function(responseId, customizations) {
  const response = this.aiResponses.id(responseId);
  if (response) {
    response.feedback.used = true;
    this.actualResponse = {
      responseText: response.responseText,
      usedAiResponse: true,
      customizations: customizations,
      deliveredAt: new Date()
    };
    return this.save();
  }
  return Promise.reject(new Error('AI response not found'));
};

objectionSchema.methods.resolve = function(outcome, notes) {
  this.status = 'resolved';
  this.resolution = {
    outcome: outcome,
    notes: notes,
    resolvedAt: new Date()
  };
  return this.save();
};

objectionSchema.methods.addFollowUpAction = function(action, dueDate) {
  this.followUpActions.push({
    action: action,
    dueDate: dueDate
  });
  return this.save();
};

objectionSchema.methods.completeFollowUpAction = function(actionId) {
  const action = this.followUpActions.id(actionId);
  if (action) {
    action.completed = true;
    action.completedAt = new Date();
    return this.save();
  }
  return Promise.reject(new Error('Follow-up action not found'));
};

objectionSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

objectionSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

module.exports = mongoose.model('Objection', objectionSchema); 