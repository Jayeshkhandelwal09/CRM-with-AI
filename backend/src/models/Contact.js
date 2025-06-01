const mongoose = require('mongoose');
const ContactValidation = require('../utils/contactValidation');

const contactSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[(]?[\d\s\-\(\)\.]{7,20}$/, 'Please provide a valid phone number']
  },
  
  // Company Information
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  jobTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  
  // Contact Details
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
  },
  linkedinUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?linkedin\.com\/.*/, 'Please provide a valid LinkedIn URL']
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Zip code cannot exceed 20 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters']
    }
  },
  
  // Contact Status & Classification
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'customer', 'lead'],
    default: 'prospect'
  },
  leadSource: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'event', 'advertisement', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Tags and Categories
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  // Notes and Description
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Relationship to User (Owner)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Contact must have an owner']
  },
  
  // Contact Preferences
  preferences: {
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'linkedin', 'in_person'],
      default: 'email'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    doNotContact: {
      type: Boolean,
      default: false
    },
    emailOptOut: {
      type: Boolean,
      default: false
    }
  },
  
  // Interaction Tracking
  lastContactDate: {
    type: Date,
    default: null
  },
  nextFollowUpDate: {
    type: Date,
    default: null
  },
  interactionCount: {
    type: Number,
    default: 0
  },
  
  // Social Media & Additional Info
  socialMedia: {
    twitter: {
      type: String,
      trim: true
    },
    facebook: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    }
  },
  
  // Custom Fields (for flexibility)
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
  
  // Duplicate Detection
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    default: null
  },
  isDuplicate: {
    type: Boolean,
    default: false
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

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full address
contactSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  if (!addr || !addr.street) return null;
  
  const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
  return parts.join(', ');
});

// Indexes for performance and search
contactSchema.index({ owner: 1 });
contactSchema.index({ email: 1, owner: 1 });
contactSchema.index({ firstName: 1, lastName: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ tags: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ lastContactDate: -1 });
contactSchema.index({ nextFollowUpDate: 1 });

// Compound indexes for common queries
contactSchema.index({ owner: 1, status: 1 });
contactSchema.index({ owner: 1, company: 1 });
contactSchema.index({ owner: 1, createdAt: -1 });

// Additional specialized indexes for CRM operations
contactSchema.index({ owner: 1, priority: 1 });
contactSchema.index({ owner: 1, leadSource: 1 });
contactSchema.index({ owner: 1, nextFollowUpDate: 1 });
contactSchema.index({ owner: 1, lastContactDate: -1 });
contactSchema.index({ owner: 1, isDuplicate: 1 });
contactSchema.index({ owner: 1, 'preferences.doNotContact': 1 });

// Sparse indexes for optional fields
contactSchema.index({ phone: 1 }, { sparse: true });
contactSchema.index({ linkedinUrl: 1 }, { sparse: true });
contactSchema.index({ website: 1 }, { sparse: true });

// Geospatial index for address-based queries (if needed in future)
contactSchema.index({ 'address.city': 1, 'address.state': 1 });
contactSchema.index({ 'address.country': 1 });

// Text index for search functionality
contactSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  company: 'text',
  jobTitle: 'text',
  notes: 'text',
  tags: 'text'
});

// Pre-save middleware for comprehensive validation
contactSchema.pre('save', function(next) {
  // Skip validation for updates that don't modify core fields
  if (!this.isNew && !this.isModified()) {
    return next();
  }
  
  // Validate contact data using our validation utility
  const validation = ContactValidation.validateContactData(this.toObject(), !this.isNew);
  
  if (!validation.isValid) {
    const error = new Error('Contact validation failed');
    error.name = 'ValidationError';
    error.errors = validation.errors;
    return next(error);
  }
  
  // Sanitize data before saving
  const sanitized = ContactValidation.sanitizeContactData(this.toObject());
  
  // Apply sanitized data back to the document
  Object.keys(sanitized).forEach(key => {
    if (key !== '_id' && key !== '__v') {
      this[key] = sanitized[key];
    }
  });
  
  next();
});

// Pre-save middleware for data sanitization
contactSchema.pre('save', function(next) {
  // Ensure email uniqueness per owner (not globally unique)
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  
  // Clean up tags - remove empty tags and duplicates
  if (this.isModified('tags')) {
    this.tags = [...new Set(this.tags.filter(tag => tag && tag.trim()))];
  }
  
  next();
});

// Pre-save middleware to update interaction tracking
contactSchema.pre('save', function(next) {
  if (this.isModified('lastContactDate') && this.lastContactDate) {
    this.interactionCount += 1;
  }
  next();
});

// Pre-save middleware to check user contact limits
contactSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.owner);
      
      if (!user) {
        const error = new Error('Contact owner not found');
        error.name = 'ValidationError';
        return next(error);
      }
      
      if (!user.canAddContact()) {
        const error = new Error(`Contact limit reached. Maximum ${user.limits.contacts} contacts allowed.`);
        error.name = 'ValidationError';
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Post-save middleware to update user contact count
contactSchema.post('save', async function(doc) {
  // Check if this is a new document by looking at the wasNew flag we'll set
  if (this.wasNew) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(doc.owner);
      if (user) {
        await user.incrementContactCount();
      }
    } catch (error) {
      console.error('Error updating user contact count:', error);
    }
  }
});

// Pre-save middleware to track if document is new
contactSchema.pre('save', function(next) {
  this.wasNew = this.isNew;
  next();
});

// Post-remove middleware to update user contact count
contactSchema.post('deleteOne', { document: true, query: false }, async function(doc) {
  try {
    const User = mongoose.model('User');
    const user = await User.findById(doc.owner);
    if (user) {
      await user.decrementContactCount();
    }
  } catch (error) {
    console.error('Error updating user contact count:', error);
  }
});

// Post-remove middleware for findOneAndDelete
contactSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(doc.owner);
      if (user) {
        await user.decrementContactCount();
      }
    } catch (error) {
      console.error('Error updating user contact count:', error);
    }
  }
});

// Instance method to check if contact is overdue for follow-up
contactSchema.methods.isOverdueForFollowUp = function() {
  if (!this.nextFollowUpDate) return false;
  return new Date() > this.nextFollowUpDate;
};

// Instance method to get days since last contact
contactSchema.methods.daysSinceLastContact = function() {
  if (!this.lastContactDate) return null;
  const diffTime = Math.abs(new Date() - this.lastContactDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Instance method to add tag
contactSchema.methods.addTag = function(tag) {
  if (tag && tag.trim() && !this.tags.includes(tag.trim())) {
    this.tags.push(tag.trim());
  }
};

// Instance method to remove tag
contactSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
};

// Static method to find contacts by owner
contactSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId, isDuplicate: false });
};

// Static method to find contacts by company
contactSchema.statics.findByCompany = function(company, ownerId) {
  return this.find({ 
    company: new RegExp(company, 'i'), 
    owner: ownerId,
    isDuplicate: false 
  });
};

// Static method to find contacts by status
contactSchema.statics.findByStatus = function(status, ownerId) {
  return this.find({ 
    status: status, 
    owner: ownerId,
    isDuplicate: false 
  });
};

// Static method to search contacts
contactSchema.statics.searchContacts = function(searchTerm, ownerId) {
  return this.find({
    $and: [
      { owner: ownerId },
      { isDuplicate: false },
      {
        $or: [
          { firstName: new RegExp(searchTerm, 'i') },
          { lastName: new RegExp(searchTerm, 'i') },
          { email: new RegExp(searchTerm, 'i') },
          { company: new RegExp(searchTerm, 'i') },
          { jobTitle: new RegExp(searchTerm, 'i') },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    ]
  });
};

// Static method to find overdue follow-ups
contactSchema.statics.findOverdueFollowUps = function(ownerId) {
  return this.find({
    owner: ownerId,
    isDuplicate: false,
    nextFollowUpDate: { $lt: new Date() }
  });
};

// Static method to detect potential duplicates
contactSchema.statics.findPotentialDuplicates = function(email, ownerId, excludeId = null) {
  const query = {
    owner: ownerId,
    email: email.toLowerCase(),
    isDuplicate: false
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact; 