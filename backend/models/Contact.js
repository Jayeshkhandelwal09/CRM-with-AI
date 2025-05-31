const mongoose = require('mongoose');

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
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Company Information
  company: {
    type: String,
    required: [true, 'Company is required'],
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
    maxlength: [50, 'Department cannot exceed 50 characters']
  },
  
  // Contact Details
  linkedinUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Please enter a valid LinkedIn URL']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.*$/, 'Please enter a valid website URL']
  },
  
  // Address Information
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'United States' }
  },
  
  // Contact Status & Classification
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'customer', 'lost'],
    default: 'prospect'
  },
  leadSource: {
    type: String,
    enum: ['website', 'referral', 'cold_outreach', 'social_media', 'event', 'advertisement', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // AI-Generated Persona Data
  persona: {
    communicationStyle: {
      type: String,
      enum: ['formal', 'casual', 'direct', 'analytical', 'relationship-focused'],
      default: null
    },
    decisionMakingStyle: {
      type: String,
      enum: ['analytical', 'intuitive', 'consensus', 'authoritative'],
      default: null
    },
    responseTime: {
      type: String,
      enum: ['immediate', 'same_day', 'few_days', 'weekly', 'slow'],
      default: null
    },
    engagementLevel: {
      type: String,
      enum: ['very_high', 'high', 'medium', 'low', 'very_low'],
      default: 'medium'
    },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'linkedin', 'in_person'],
      default: 'email'
    },
    lastPersonaUpdate: Date
  },
  
  // Relationship & Interaction Tracking
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  lastContactDate: Date,
  nextFollowUpDate: Date,
  
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
contactSchema.index({ email: 1, createdBy: 1 });
contactSchema.index({ company: 1 });
contactSchema.index({ createdBy: 1, isDeleted: 1 });
contactSchema.index({ assignedTo: 1, isDeleted: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ lastContactDate: 1 });
contactSchema.index({ nextFollowUpDate: 1 });

// Compound index for search
contactSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  company: 'text',
  jobTitle: 'text'
});

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full address
contactSchema.virtual('fullAddress').get(function() {
  if (!this.address || !this.address.street) return null;
  
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Virtual for days since last contact
contactSchema.virtual('daysSinceLastContact').get(function() {
  if (!this.lastContactDate) return null;
  const now = new Date();
  const diffTime = Math.abs(now - this.lastContactDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue follow-up
contactSchema.virtual('isFollowUpOverdue').get(function() {
  if (!this.nextFollowUpDate) return false;
  return new Date() > this.nextFollowUpDate;
});

// Pre-save middleware
contactSchema.pre('save', function(next) {
  // Set assignedTo to createdBy if not specified
  if (!this.assignedTo && this.createdBy) {
    this.assignedTo = this.createdBy;
  }
  
  // Update lastPersonaUpdate when persona fields change
  if (this.isModified('persona')) {
    this.persona.lastPersonaUpdate = new Date();
  }
  
  next();
});

// Static methods
contactSchema.statics.findActive = function(userId) {
  return this.find({ 
    $or: [{ createdBy: userId }, { assignedTo: userId }],
    isDeleted: false 
  });
};

contactSchema.statics.findByCompany = function(company, userId) {
  return this.find({ 
    company: new RegExp(company, 'i'),
    $or: [{ createdBy: userId }, { assignedTo: userId }],
    isDeleted: false 
  });
};

contactSchema.statics.findOverdueFollowUps = function(userId) {
  return this.find({
    $or: [{ createdBy: userId }, { assignedTo: userId }],
    nextFollowUpDate: { $lt: new Date() },
    isDeleted: false
  });
};

// Instance methods
contactSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

contactSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

contactSchema.methods.updatePersona = function(personaData) {
  this.persona = { ...this.persona.toObject(), ...personaData };
  this.persona.lastPersonaUpdate = new Date();
  return this.save();
};

contactSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

contactSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

module.exports = mongoose.model('Contact', contactSchema); 