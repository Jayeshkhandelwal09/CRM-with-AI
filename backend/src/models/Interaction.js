const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  // Basic Interaction Information
  type: {
    type: String,
    required: [true, 'Interaction type is required'],
    enum: ['call', 'email', 'meeting', 'note', 'task', 'other'],
    lowercase: true
  },
  subject: {
    type: String,
    required: [true, 'Interaction subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  notes: {
    type: String,
    required: [true, 'Interaction notes are required'],
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  
  // Timing Information
  date: {
    type: Date,
    required: [true, 'Interaction date is required'],
    validate: {
      validator: function(v) {
        // Allow backdating up to 30 days as per PRD
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return v >= thirtyDaysAgo && v <= new Date();
      },
      message: 'Interaction date must be within the last 30 days and not in the future'
    }
  },
  duration: {
    type: Number, // Duration in minutes
    min: [0, 'Duration cannot be negative'],
    max: [1440, 'Duration cannot exceed 24 hours'], // 24 hours = 1440 minutes
    default: null
  },
  
  // Relationships - One interaction links to either ONE contact OR ONE deal (not both)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Interaction must have an owner']
  },
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    default: null
  },
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    default: null
  },
  
  // Interaction Details
  direction: {
    type: String,
    enum: ['inbound', 'outbound'],
    default: 'outbound'
  },
  outcome: {
    type: String,
    enum: ['successful', 'no_response', 'voicemail', 'busy', 'rescheduled', 'cancelled', 'completed'],
    default: 'completed'
  },
  
  // Additional Participants (for meetings)
  attendees: [{
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Attendee name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    role: {
      type: String,
      trim: true,
      maxlength: [50, 'Attendee role cannot exceed 50 characters']
    }
  }],
  
  // Follow-up Information
  nextSteps: {
    type: String,
    trim: true,
    maxlength: [500, 'Next steps cannot exceed 500 characters']
  },
  followUpDate: {
    type: Date,
    default: null
  },
  
  // Tags and Categories
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Metadata
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  
  // External Integration Data
  externalId: {
    type: String,
    trim: true // For integration with email/calendar systems
  },
  source: {
    type: String,
    enum: ['manual', 'email_sync', 'calendar_sync', 'phone_sync', 'import'],
    default: 'manual'
  },
  
  // AI Enhancement Fields
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: null
  },
  keyTopics: [{
    type: String,
    trim: true,
    maxlength: [100, 'Key topic cannot exceed 100 characters']
  }],
  
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

// Virtual for interaction age in days
interactionSchema.virtual('ageInDays').get(function() {
  const diffTime = Math.abs(new Date() - this.date);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted duration
interactionSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return null;
  
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
});

// Virtual for entity type (contact or deal)
interactionSchema.virtual('entityType').get(function() {
  if (this.contactId) return 'Contact';
  if (this.dealId) return 'Deal';
  return null;
});

// Virtual for entity ID
interactionSchema.virtual('entityId').get(function() {
  return this.contactId || this.dealId || null;
});

// Indexes for performance
interactionSchema.index({ owner: 1 });
interactionSchema.index({ contactId: 1 });
interactionSchema.index({ dealId: 1 });
interactionSchema.index({ type: 1 });
interactionSchema.index({ date: -1 });
interactionSchema.index({ createdAt: -1 });
interactionSchema.index({ followUpDate: 1 });

// Compound indexes for common queries
interactionSchema.index({ owner: 1, type: 1 });
interactionSchema.index({ owner: 1, date: -1 });
interactionSchema.index({ owner: 1, contactId: 1, date: -1 });
interactionSchema.index({ owner: 1, dealId: 1, date: -1 });
interactionSchema.index({ contactId: 1, date: -1 });
interactionSchema.index({ dealId: 1, date: -1 });

// Text index for search functionality
interactionSchema.index({
  subject: 'text',
  notes: 'text',
  nextSteps: 'text',
  tags: 'text'
});

// Pre-save validation to ensure only one entity is linked
interactionSchema.pre('save', function(next) {
  // Ensure only one of contactId or dealId is populated
  if (this.contactId && this.dealId) {
    return next(new Error('Interaction cannot be linked to both a contact and a deal'));
  }
  
  // Ensure at least one entity is linked
  if (!this.contactId && !this.dealId) {
    return next(new Error('Interaction must be linked to either a contact or a deal'));
  }
  
  // Clean up tags - remove empty tags and duplicates
  if (this.isModified('tags')) {
    this.tags = [...new Set(this.tags.filter(tag => tag && tag.trim()))];
  }
  
  // Clean up key topics
  if (this.isModified('keyTopics')) {
    this.keyTopics = [...new Set(this.keyTopics.filter(topic => topic && topic.trim()))];
  }
  
  next();
});

// Post-save middleware to update related entity's last activity date
interactionSchema.post('save', async function(doc) {
  try {
    if (doc.contactId) {
      const Contact = require('./Contact');
      await Contact.findByIdAndUpdate(doc.contactId, {
        lastContactDate: doc.date,
        $inc: { interactionCount: 1 }
      });
    }
    
    if (doc.dealId) {
      const Deal = require('./Deal');
      await Deal.findByIdAndUpdate(doc.dealId, {
        lastActivityDate: doc.date,
        $inc: { activitiesCount: 1 }
      });
      
      // Update specific activity counters based on type
      const updateField = {};
      if (doc.type === 'email') updateField['emailsCount'] = 1;
      else if (doc.type === 'call') updateField['callsCount'] = 1;
      else if (doc.type === 'meeting') updateField['meetingsCount'] = 1;
      
      if (Object.keys(updateField).length > 0) {
        await Deal.findByIdAndUpdate(doc.dealId, { $inc: updateField });
      }
    }
  } catch (error) {
    console.error('Error updating related entity after interaction save:', error);
  }
});

// Instance method to check if follow-up is overdue
interactionSchema.methods.isFollowUpOverdue = function() {
  if (!this.followUpDate) return false;
  return new Date() > this.followUpDate;
};

// Instance method to add tag
interactionSchema.methods.addTag = function(tag) {
  if (tag && tag.trim() && !this.tags.includes(tag.trim())) {
    this.tags.push(tag.trim());
  }
};

// Instance method to remove tag
interactionSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
};

// Instance method to add attendee
interactionSchema.methods.addAttendee = function(attendee) {
  if (attendee && attendee.name) {
    this.attendees.push(attendee);
  }
};

// Static method to find interactions by owner
interactionSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId }).sort({ date: -1 });
};

// Static method to find interactions by contact
interactionSchema.statics.findByContact = function(contactId) {
  return this.find({ contactId: contactId }).sort({ date: -1 });
};

// Static method to find interactions by deal
interactionSchema.statics.findByDeal = function(dealId) {
  return this.find({ dealId: dealId }).sort({ date: -1 });
};

// Static method to find interactions by type
interactionSchema.statics.findByType = function(type, ownerId = null) {
  const query = { type: type };
  if (ownerId) query.owner = ownerId;
  return this.find(query).sort({ date: -1 });
};

// Static method to find recent interactions
interactionSchema.statics.findRecent = function(ownerId = null, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const query = { date: { $gte: startDate } };
  if (ownerId) query.owner = ownerId;
  
  return this.find(query).sort({ date: -1 });
};

// Static method to find overdue follow-ups
interactionSchema.statics.findOverdueFollowUps = function(ownerId = null) {
  const query = { 
    followUpDate: { $lt: new Date(), $ne: null }
  };
  if (ownerId) query.owner = ownerId;
  
  return this.find(query).sort({ followUpDate: 1 });
};

// Static method to get interaction statistics
interactionSchema.statics.getStats = async function(ownerId = null, startDate = null, endDate = null) {
  const matchStage = {};
  if (ownerId) matchStage.owner = ownerId;
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = startDate;
    if (endDate) matchStage.date.$lte = endDate;
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        totalDuration: { $sum: '$duration' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return stats;
};

const Interaction = mongoose.model('Interaction', interactionSchema);

module.exports = Interaction; 