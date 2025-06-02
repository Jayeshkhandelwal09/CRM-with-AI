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
  
  // Deal Value
  value: {
    type: Number,
    required: [true, 'Deal value is required'],
    min: [0, 'Deal value cannot be negative'],
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 999999999; // Max 999 million
      },
      message: 'Deal value must be between 0 and 999,999,999'
    }
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'CNY'],
    uppercase: true
  },
  
  // Pipeline and Stage Management
  stage: {
    type: String,
    required: [true, 'Deal stage is required'],
    enum: [
      'lead',           // Initial contact/interest
      'qualified',      // Qualified lead
      'proposal',       // Proposal sent
      'negotiation',    // In negotiation
      'closed_won',     // Deal won
      'closed_lost'     // Deal lost
    ],
    default: 'lead'
  },
  pipeline: {
    type: String,
    default: 'sales',
    enum: ['sales', 'marketing', 'custom'],
    lowercase: true
  },
  
  // Probability and Forecasting
  probability: {
    type: Number,
    min: [0, 'Probability cannot be less than 0%'],
    max: [100, 'Probability cannot be more than 100%'],
    default: function() {
      // Auto-set probability based on stage
      const stageProbabilities = {
        'lead': 10,
        'qualified': 25,
        'proposal': 50,
        'negotiation': 75,
        'closed_won': 100,
        'closed_lost': 0
      };
      return stageProbabilities[this.stage] || 10;
    }
  },
  weightedValue: {
    type: Number,
    default: function() {
      return (this.value * this.probability) / 100;
    }
  },
  
  // Relationships
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Deal must have an owner']
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: [true, 'Deal must be associated with a contact']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  
  // Deal Source and Classification
  source: {
    type: String,
    enum: ['inbound', 'outbound', 'referral', 'partner', 'marketing', 'cold_call', 'website', 'event', 'other'],
    default: 'other'
  },
  dealType: {
    type: String,
    enum: ['new_business', 'existing_business', 'renewal', 'upsell', 'cross_sell'],
    default: 'new_business'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Important Dates
  expectedCloseDate: {
    type: Date,
    required: [true, 'Expected close date is required']
  },
  actualCloseDate: {
    type: Date,
    default: null
  },
  lastActivityDate: {
    type: Date,
    default: null
  },
  nextFollowUpDate: {
    type: Date,
    default: null
  },
  
  // Deal Status and Progress
  isActive: {
    type: Boolean,
    default: true
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  isWon: {
    type: Boolean,
    default: false
  },
  
  // Close Information
  closeReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Close reason cannot exceed 500 characters']
  },
  lostReason: {
    type: String,
    enum: ['price', 'competitor', 'timing', 'budget', 'no_decision', 'requirements', 'other'],
    default: null
  },
  competitorName: {
    type: String,
    trim: true,
    maxlength: [100, 'Competitor name cannot exceed 100 characters']
  },
  
  // Deal Products/Services
  products: [{
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Product description cannot exceed 200 characters']
    }
  }],
  
  // Tags and Categories
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Notes and Communication
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  
  // Stage History for Analytics
  stageHistory: [{
    stage: {
      type: String,
      required: true
    },
    enteredAt: {
      type: Date,
      default: Date.now
    },
    duration: {
      type: Number, // Duration in days
      default: 0
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Activity Tracking
  activitiesCount: {
    type: Number,
    default: 0
  },
  emailsCount: {
    type: Number,
    default: 0
  },
  callsCount: {
    type: Number,
    default: 0
  },
  meetingsCount: {
    type: Number,
    default: 0
  },
  
  // Custom Fields for Flexibility
  customFields: {
    type: Map,
    of: String,
    default: new Map()
  },
  
  // Import/Export Tracking
  importSource: {
    type: String,
    trim: true
  },
  importDate: {
    type: Date,
    default: null
  },
  
  // Forecast and Reporting
  forecastCategory: {
    type: String,
    enum: ['pipeline', 'best_case', 'commit', 'closed'],
    default: function() {
      if (this.stage === 'closed_won') return 'closed';
      if (this.stage === 'closed_lost') return 'closed';
      if (this.probability >= 75) return 'commit';
      if (this.probability >= 50) return 'best_case';
      return 'pipeline';
    }
  },
  quarterlyForecast: {
    quarter: String,
    year: Number,
    category: String
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

// Virtual for deal age in days
dealSchema.virtual('ageInDays').get(function() {
  const diffTime = Math.abs(new Date() - this.createdAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until expected close
dealSchema.virtual('daysUntilClose').get(function() {
  if (!this.expectedCloseDate) return null;
  const diffTime = this.expectedCloseDate - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for deal status display
dealSchema.virtual('statusDisplay').get(function() {
  if (this.isClosed) {
    return this.isWon ? 'Won' : 'Lost';
  }
  return 'Open';
});

// Virtual for stage display name
dealSchema.virtual('stageDisplay').get(function() {
  const stageNames = {
    'lead': 'Lead',
    'qualified': 'Qualified',
    'proposal': 'Proposal',
    'negotiation': 'Negotiation',
    'closed_won': 'Closed Won',
    'closed_lost': 'Closed Lost'
  };
  return stageNames[this.stage] || this.stage;
});

// Indexes for performance
dealSchema.index({ owner: 1 });
dealSchema.index({ contact: 1 });
dealSchema.index({ stage: 1 });
dealSchema.index({ pipeline: 1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ actualCloseDate: 1 });
dealSchema.index({ value: -1 });
dealSchema.index({ probability: -1 });
dealSchema.index({ createdAt: -1 });
dealSchema.index({ lastActivityDate: -1 });
dealSchema.index({ nextFollowUpDate: 1 });

// Compound indexes for common queries
dealSchema.index({ owner: 1, stage: 1 });
dealSchema.index({ owner: 1, pipeline: 1 });
dealSchema.index({ owner: 1, isActive: 1 });
dealSchema.index({ owner: 1, isClosed: 1 });
dealSchema.index({ owner: 1, expectedCloseDate: 1 });
dealSchema.index({ owner: 1, value: -1 });
dealSchema.index({ stage: 1, expectedCloseDate: 1 });
dealSchema.index({ pipeline: 1, stage: 1 });

// Text index for search functionality
dealSchema.index({
  title: 'text',
  description: 'text',
  company: 'text',
  notes: 'text',
  tags: 'text'
});

// Pre-save middleware to check user deal limits
dealSchema.pre('save', async function(next) {
  if (this.isNew) {
    const User = require('./User');
    const user = await User.findById(this.owner);
    
    if (!user) {
      return next(new Error('User not found'));
    }
    
    if (!user.canAddDeal()) {
      return next(new Error(`Deal limit exceeded. Maximum ${user.limits.deals} deals allowed.`));
    }
  }
  
  next();
});

// Post-save middleware to update user deal count
dealSchema.post('save', async function(doc) {
  if (doc.isNew) {
    const User = require('./User');
    const user = await User.findById(doc.owner);
    if (user) {
      await user.incrementDealCount();
    }
  }
});

// Post-delete middleware to update user deal count
dealSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
  const User = require('./User');
  const user = await User.findById(doc.owner);
  if (user) {
    await user.decrementDealCount();
  }
});

dealSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const User = require('./User');
    const user = await User.findById(doc.owner);
    if (user) {
      await user.decrementDealCount();
    }
  }
});

// Pre-save middleware to update weighted value
dealSchema.pre('save', function(next) {
  // Update weighted value when value or probability changes
  if (this.isModified('value') || this.isModified('probability')) {
    this.weightedValue = (this.value * this.probability) / 100;
  }
  
  // Update close status based on stage
  if (this.isModified('stage')) {
    this.isClosed = ['closed_won', 'closed_lost'].includes(this.stage);
    this.isWon = this.stage === 'closed_won';
    this.isActive = !this.isClosed;
    
    // Set actual close date if closing
    if (this.isClosed && !this.actualCloseDate) {
      this.actualCloseDate = new Date();
    }
    
    // Update forecast category
    if (this.stage === 'closed_won' || this.stage === 'closed_lost') {
      this.forecastCategory = 'closed';
    } else if (this.probability >= 75) {
      this.forecastCategory = 'commit';
    } else if (this.probability >= 50) {
      this.forecastCategory = 'best_case';
    } else {
      this.forecastCategory = 'pipeline';
    }
  }
  
  // Clean up tags - remove empty tags and duplicates
  if (this.isModified('tags')) {
    this.tags = [...new Set(this.tags.filter(tag => tag && tag.trim()))];
  }
  
  next();
});

// Pre-save middleware to track stage history
dealSchema.pre('save', function(next) {
  if (this.isModified('stage') && !this.isNew) {
    // Calculate duration in previous stage
    const lastStageEntry = this.stageHistory[this.stageHistory.length - 1];
    if (lastStageEntry) {
      const duration = Math.ceil((new Date() - lastStageEntry.enteredAt) / (1000 * 60 * 60 * 24));
      lastStageEntry.duration = duration;
    }
    
    // Add new stage entry
    this.stageHistory.push({
      stage: this.stage,
      enteredAt: new Date(),
      changedBy: this.owner // This should be set by the controller
    });
  } else if (this.isNew) {
    // Initialize stage history for new deals
    this.stageHistory = [{
      stage: this.stage,
      enteredAt: new Date(),
      changedBy: this.owner
    }];
  }
  
  next();
});

// Instance method to check if deal is overdue
dealSchema.methods.isOverdue = function() {
  if (!this.expectedCloseDate || this.isClosed) return false;
  return new Date() > this.expectedCloseDate;
};

// Instance method to check if follow-up is overdue
dealSchema.methods.isFollowUpOverdue = function() {
  if (!this.nextFollowUpDate || this.isClosed) return false;
  return new Date() > this.nextFollowUpDate;
};

// Instance method to get days in current stage
dealSchema.methods.getDaysInCurrentStage = function() {
  const lastStageEntry = this.stageHistory[this.stageHistory.length - 1];
  if (!lastStageEntry) return 0;
  
  const diffTime = Math.abs(new Date() - lastStageEntry.enteredAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Instance method to advance to next stage
dealSchema.methods.advanceStage = function() {
  const stageFlow = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won'];
  const currentIndex = stageFlow.indexOf(this.stage);
  
  if (currentIndex >= 0 && currentIndex < stageFlow.length - 1) {
    this.stage = stageFlow[currentIndex + 1];
    
    // Update probability based on new stage
    const stageProbabilities = {
      'lead': 10,
      'qualified': 25,
      'proposal': 50,
      'negotiation': 75,
      'closed_won': 100
    };
    this.probability = stageProbabilities[this.stage];
  }
};

// Instance method to add tag
dealSchema.methods.addTag = function(tag) {
  if (tag && tag.trim() && !this.tags.includes(tag.trim())) {
    this.tags.push(tag.trim());
  }
};

// Instance method to remove tag
dealSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
};

// Instance method to add product
dealSchema.methods.addProduct = function(product) {
  this.products.push(product);
  // Recalculate total deal value
  this.value = this.products.reduce((total, p) => total + p.totalPrice, 0);
};

// Static method to find deals by owner
dealSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId });
};

// Static method to find deals by stage
dealSchema.statics.findByStage = function(stage, ownerId = null) {
  const query = { stage: stage };
  if (ownerId) query.owner = ownerId;
  return this.find(query);
};

// Static method to find active deals
dealSchema.statics.findActive = function(ownerId = null) {
  const query = { isActive: true };
  if (ownerId) query.owner = ownerId;
  return this.find(query);
};

// Static method to find overdue deals
dealSchema.statics.findOverdue = function(ownerId = null) {
  const query = { 
    expectedCloseDate: { $lt: new Date() },
    isClosed: false
  };
  if (ownerId) query.owner = ownerId;
  return this.find(query);
};

// Static method to get pipeline summary
dealSchema.statics.getPipelineSummary = async function(ownerId = null) {
  const matchStage = {};
  
  if (ownerId) {
    // Convert string to ObjectId if needed
    matchStage.owner = mongoose.Types.ObjectId.isValid(ownerId) 
      ? new mongoose.Types.ObjectId(ownerId) 
      : ownerId;
  }
  
  // Only include active deals in pipeline summary
  matchStage.isActive = true;
  
  const pipeline = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$stage',
        count: { $sum: 1 },
        totalValue: { $sum: '$value' },
        totalWeightedValue: { $sum: '$weightedValue' },
        avgProbability: { $avg: '$probability' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return pipeline;
};

// Static method to get forecast data
dealSchema.statics.getForecastData = async function(ownerId = null, quarter = null, year = null) {
  const matchStage = { isClosed: false };
  if (ownerId) matchStage.owner = ownerId;
  if (quarter && year) {
    matchStage['quarterlyForecast.quarter'] = quarter;
    matchStage['quarterlyForecast.year'] = year;
  }
  
  const forecast = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$forecastCategory',
        count: { $sum: 1 },
        totalValue: { $sum: '$value' },
        totalWeightedValue: { $sum: '$weightedValue' }
      }
    }
  ]);
  
  return forecast;
};

const Deal = mongoose.model('Deal', dealSchema);

module.exports = Deal; 