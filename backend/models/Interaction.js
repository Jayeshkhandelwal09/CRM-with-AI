const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  // Interaction Type & Content
  type: {
    type: String,
    enum: [
      'email',
      'phone_call',
      'meeting',
      'linkedin_message',
      'text_message',
      'video_call',
      'in_person',
      'proposal_sent',
      'contract_sent',
      'demo',
      'follow_up',
      'other'
    ],
    required: [true, 'Interaction type is required']
  },
  subject: {
    type: String,
    required: [true, 'Interaction subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Interaction content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  
  // Interaction Direction & Status
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    required: [true, 'Interaction direction is required']
  },
  status: {
    type: String,
    enum: ['completed', 'scheduled', 'cancelled', 'no_response'],
    default: 'completed'
  },
  
  // Timing Information
  scheduledAt: Date,
  completedAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // Duration in minutes
    min: [0, 'Duration cannot be negative']
  },
  
  // Polymorphic Relationships - Can be linked to either Contact OR Deal
  entityType: {
    type: String,
    enum: ['Contact', 'Deal'],
    required: [true, 'Entity type is required']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Entity ID is required'],
    refPath: 'entityType'
  },
  
  // Additional Contact Reference (for Deal interactions)
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  
  // Interaction Outcome & Follow-up
  outcome: {
    type: String,
    enum: [
      'positive',
      'neutral', 
      'negative',
      'interested',
      'not_interested',
      'needs_follow_up',
      'objection_raised',
      'meeting_scheduled',
      'proposal_requested',
      'deal_advanced',
      'deal_stalled'
    ]
  },
  nextSteps: {
    type: String,
    maxlength: [1000, 'Next steps cannot exceed 1000 characters']
  },
  followUpDate: Date,
  
  // Interaction Quality & Engagement
  engagementLevel: {
    type: String,
    enum: ['very_high', 'high', 'medium', 'low', 'very_low'],
    default: 'medium'
  },
  sentiment: {
    type: String,
    enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'],
    default: 'neutral'
  },
  
  // AI Analysis Data
  aiAnalysis: {
    keyTopics: [String],
    emotionalTone: {
      type: String,
      enum: ['enthusiastic', 'professional', 'concerned', 'frustrated', 'excited', 'neutral']
    },
    actionItems: [String],
    riskIndicators: [String],
    opportunitySignals: [String],
    analyzedAt: Date
  },
  
  // Attachments & References
  attachments: [{
    filename: String,
    url: String,
    fileType: String,
    size: Number
  }],
  
  // Tags & Categorization
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
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
interactionSchema.index({ entityType: 1, entityId: 1 });
interactionSchema.index({ contact: 1 });
interactionSchema.index({ createdBy: 1, isDeleted: 1 });
interactionSchema.index({ type: 1 });
interactionSchema.index({ completedAt: 1 });
interactionSchema.index({ followUpDate: 1 });
interactionSchema.index({ status: 1 });

// Compound indexes
interactionSchema.index({ entityType: 1, entityId: 1, completedAt: -1 });
interactionSchema.index({ createdBy: 1, completedAt: -1, isDeleted: 1 });

// Text search index
interactionSchema.index({
  subject: 'text',
  content: 'text',
  nextSteps: 'text'
});

// Virtuals
interactionSchema.virtual('isOverdue').get(function() {
  if (!this.followUpDate || this.status === 'completed') return false;
  return new Date() > this.followUpDate;
});

interactionSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return null;
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

interactionSchema.virtual('timeSinceInteraction').get(function() {
  if (!this.completedAt) return null;
  
  const now = new Date();
  const diffTime = Math.abs(now - this.completedAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return `${Math.ceil(diffDays / 30)} months ago`;
});

// Pre-save middleware
interactionSchema.pre('save', function(next) {
  // Set completedAt for completed interactions
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Auto-populate contact for Deal interactions
  if (this.entityType === 'Deal' && !this.contact && this.isNew) {
    // This will be handled in the route layer to avoid circular dependencies
  }
  
  next();
});

// Post-save middleware to update related entities
interactionSchema.post('save', async function(doc) {
  try {
    // Update lastContactDate on Contact
    if (doc.entityType === 'Contact' || doc.contact) {
      const Contact = mongoose.model('Contact');
      const contactId = doc.entityType === 'Contact' ? doc.entityId : doc.contact;
      
      if (contactId && doc.status === 'completed') {
        await Contact.findByIdAndUpdate(contactId, {
          lastContactDate: doc.completedAt || new Date()
        });
      }
    }
    
    // Update lastActivityDate on Deal
    if (doc.entityType === 'Deal') {
      const Deal = mongoose.model('Deal');
      
      if (doc.status === 'completed') {
        await Deal.findByIdAndUpdate(doc.entityId, {
          lastActivityDate: doc.completedAt || new Date()
        });
      }
    }
  } catch (error) {
    console.error('Error updating related entities after interaction save:', error);
  }
});

// Static methods
interactionSchema.statics.findByEntity = function(entityType, entityId, userId) {
  return this.find({
    entityType: entityType,
    entityId: entityId,
    createdBy: userId,
    isDeleted: false
  }).sort({ completedAt: -1 });
};

interactionSchema.statics.findByContact = function(contactId, userId) {
  return this.find({
    $or: [
      { entityType: 'Contact', entityId: contactId },
      { contact: contactId }
    ],
    createdBy: userId,
    isDeleted: false
  }).sort({ completedAt: -1 });
};

interactionSchema.statics.findRecent = function(userId, limit = 10) {
  return this.find({
    createdBy: userId,
    isDeleted: false
  })
  .sort({ completedAt: -1 })
  .limit(limit)
  .populate('contact', 'firstName lastName company')
  .populate('entityId');
};

interactionSchema.statics.findUpcoming = function(userId) {
  return this.find({
    createdBy: userId,
    status: 'scheduled',
    scheduledAt: { $gte: new Date() },
    isDeleted: false
  }).sort({ scheduledAt: 1 });
};

interactionSchema.statics.findOverdueFollowUps = function(userId) {
  return this.find({
    createdBy: userId,
    followUpDate: { $lt: new Date() },
    status: { $ne: 'completed' },
    isDeleted: false
  }).sort({ followUpDate: 1 });
};

interactionSchema.statics.getInteractionStats = function(userId, startDate, endDate) {
  const matchConditions = {
    createdBy: userId,
    isDeleted: false
  };
  
  if (startDate && endDate) {
    matchConditions.completedAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        outcomes: { $push: '$outcome' }
      }
    }
  ]);
};

// Instance methods
interactionSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

interactionSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

interactionSchema.methods.complete = function(outcome, nextSteps) {
  this.status = 'completed';
  this.completedAt = new Date();
  if (outcome) this.outcome = outcome;
  if (nextSteps) this.nextSteps = nextSteps;
  return this.save();
};

interactionSchema.methods.schedule = function(scheduledAt) {
  this.status = 'scheduled';
  this.scheduledAt = scheduledAt;
  return this.save();
};

interactionSchema.methods.addAIAnalysis = function(analysis) {
  this.aiAnalysis = { ...this.aiAnalysis.toObject(), ...analysis };
  this.aiAnalysis.analyzedAt = new Date();
  return this.save();
};

interactionSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

interactionSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

module.exports = mongoose.model('Interaction', interactionSchema); 