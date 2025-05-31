const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  // Basic Deal Information
  title: {
    type: String,
    required: [true, 'Deal title is required'],
    trim: true,
    maxlength: [200, 'Deal title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Deal description cannot exceed 1000 characters']
  },
  
  // Financial Information
  value: {
    type: Number,
    required: [true, 'Deal value is required'],
    min: [0, 'Deal value cannot be negative'],
    max: [999999999, 'Deal value is too large']
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    default: 'USD'
  },
  
  // Deal Stage & Status
  stage: {
    type: String,
    enum: [
      'prospecting',      // Initial contact and qualification
      'qualification',    // Needs assessment and budget confirmation
      'proposal',         // Proposal sent and under review
      'negotiation',      // Terms and pricing negotiation
      'closed_won',       // Deal successfully closed
      'closed_lost'       // Deal lost to competitor or cancelled
    ],
    default: 'prospecting',
    required: true
  },
  probability: {
    type: Number,
    min: [0, 'Probability cannot be less than 0%'],
    max: [100, 'Probability cannot exceed 100%'],
    default: function() {
      // Auto-set probability based on stage
      const stageProbabilities = {
        'prospecting': 10,
        'qualification': 25,
        'proposal': 50,
        'negotiation': 75,
        'closed_won': 100,
        'closed_lost': 0
      };
      return stageProbabilities[this.stage] || 10;
    }
  },
  
  // Timeline
  expectedCloseDate: {
    type: Date,
    required: [true, 'Expected close date is required']
  },
  actualCloseDate: Date,
  
  // Relationships
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: [true, 'Contact is required for deal']
  },
  
  // Deal Source & Classification
  source: {
    type: String,
    enum: ['inbound', 'outbound', 'referral', 'partner', 'event', 'advertisement'],
    default: 'inbound'
  },
  type: {
    type: String,
    enum: ['new_business', 'existing_customer', 'upsell', 'renewal'],
    default: 'new_business'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Competition & Market Info
  competitors: [{
    name: { type: String, trim: true },
    strength: { type: String, enum: ['weak', 'moderate', 'strong'] },
    notes: { type: String, maxlength: 500 }
  }],
  
  // Deal Progress Tracking
  stageHistory: [{
    stage: {
      type: String,
      enum: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']
    },
    enteredAt: { type: Date, default: Date.now },
    duration: Number, // Days spent in this stage
    notes: String
  }],
  
  // AI Analysis Data
  aiInsights: {
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    nextBestActions: [{
      action: String,
      priority: { type: String, enum: ['low', 'medium', 'high'] },
      generatedAt: { type: Date, default: Date.now }
    }],
    lastAnalysisDate: Date,
    winProbabilityFactors: [{
      factor: String,
      impact: { type: String, enum: ['positive', 'negative', 'neutral'] },
      weight: Number
    }]
  },
  
  // Objections & Responses
  objections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Objection'
  }],
  
  // Deal Notes & Tags
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  
  // User Association
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Activity Tracking
  lastActivityDate: Date,
  nextFollowUpDate: Date,
  
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
dealSchema.index({ createdBy: 1, isDeleted: 1 });
dealSchema.index({ assignedTo: 1, isDeleted: 1 });
dealSchema.index({ contact: 1 });
dealSchema.index({ stage: 1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ value: 1 });
dealSchema.index({ lastActivityDate: 1 });
dealSchema.index({ nextFollowUpDate: 1 });

// Compound indexes
dealSchema.index({ stage: 1, expectedCloseDate: 1 });
dealSchema.index({ assignedTo: 1, stage: 1, isDeleted: 1 });

// Text search index
dealSchema.index({
  title: 'text',
  description: 'text',
  notes: 'text'
});

// Virtuals
dealSchema.virtual('isOverdue').get(function() {
  if (!this.expectedCloseDate || this.stage === 'closed_won' || this.stage === 'closed_lost') {
    return false;
  }
  return new Date() > this.expectedCloseDate;
});

dealSchema.virtual('daysInCurrentStage').get(function() {
  if (!this.stageHistory || this.stageHistory.length === 0) return 0;
  
  const currentStageEntry = this.stageHistory[this.stageHistory.length - 1];
  const now = new Date();
  const diffTime = Math.abs(now - currentStageEntry.enteredAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

dealSchema.virtual('totalDealDuration').get(function() {
  if (!this.createdAt) return 0;
  
  const endDate = this.actualCloseDate || new Date();
  const diffTime = Math.abs(endDate - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

dealSchema.virtual('isActive').get(function() {
  return this.stage !== 'closed_won' && this.stage !== 'closed_lost' && !this.isDeleted;
});

dealSchema.virtual('formattedValue').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency || 'USD'
  }).format(this.value);
});

// Pre-save middleware
dealSchema.pre('save', function(next) {
  // Set assignedTo to createdBy if not specified
  if (!this.assignedTo && this.createdBy) {
    this.assignedTo = this.createdBy;
  }
  
  // Update stage history when stage changes
  if (this.isModified('stage')) {
    // Calculate duration for previous stage
    if (this.stageHistory.length > 0) {
      const lastStage = this.stageHistory[this.stageHistory.length - 1];
      const now = new Date();
      const duration = Math.ceil((now - lastStage.enteredAt) / (1000 * 60 * 60 * 24));
      lastStage.duration = duration;
    }
    
    // Add new stage entry
    this.stageHistory.push({
      stage: this.stage,
      enteredAt: new Date()
    });
    
    // Set actual close date for closed deals
    if ((this.stage === 'closed_won' || this.stage === 'closed_lost') && !this.actualCloseDate) {
      this.actualCloseDate = new Date();
    }
    
    // Update probability based on stage
    const stageProbabilities = {
      'prospecting': 10,
      'qualification': 25,
      'proposal': 50,
      'negotiation': 75,
      'closed_won': 100,
      'closed_lost': 0
    };
    this.probability = stageProbabilities[this.stage] || this.probability;
  }
  
  next();
});

// Static methods
dealSchema.statics.findActive = function(userId) {
  return this.find({
    $or: [{ createdBy: userId }, { assignedTo: userId }],
    stage: { $nin: ['closed_won', 'closed_lost'] },
    isDeleted: false
  });
};

dealSchema.statics.findByStage = function(stage, userId) {
  return this.find({
    $or: [{ createdBy: userId }, { assignedTo: userId }],
    stage: stage,
    isDeleted: false
  });
};

dealSchema.statics.findOverdue = function(userId) {
  return this.find({
    $or: [{ createdBy: userId }, { assignedTo: userId }],
    expectedCloseDate: { $lt: new Date() },
    stage: { $nin: ['closed_won', 'closed_lost'] },
    isDeleted: false
  });
};

dealSchema.statics.findByContact = function(contactId, userId) {
  return this.find({
    contact: contactId,
    $or: [{ createdBy: userId }, { assignedTo: userId }],
    isDeleted: false
  });
};

dealSchema.statics.getStageStats = function(userId) {
  return this.aggregate([
    {
      $match: {
        $or: [{ createdBy: userId }, { assignedTo: userId }],
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$stage',
        count: { $sum: 1 },
        totalValue: { $sum: '$value' },
        avgValue: { $avg: '$value' }
      }
    }
  ]);
};

// Instance methods
dealSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

dealSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

dealSchema.methods.moveToStage = function(newStage, notes) {
  this.stage = newStage;
  if (notes && this.stageHistory.length > 0) {
    this.stageHistory[this.stageHistory.length - 1].notes = notes;
  }
  return this.save();
};

dealSchema.methods.addCompetitor = function(competitor) {
  this.competitors.push(competitor);
  return this.save();
};

dealSchema.methods.updateAIInsights = function(insights) {
  this.aiInsights = { ...this.aiInsights.toObject(), ...insights };
  this.aiInsights.lastAnalysisDate = new Date();
  return this.save();
};

dealSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

dealSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

module.exports = mongoose.model('Deal', dealSchema); 