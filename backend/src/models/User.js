const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
  },
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
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Security & Authentication
  lastLogin: {
    type: Date,
    default: null
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  
  // User Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system', 'auto'],
      default: 'system'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      },
      deals: {
        type: Boolean,
        default: true
      },
      contacts: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Usage Limits (as per project constraints)
  limits: {
    contacts: {
      type: Number,
      default: 2000,
      max: 2000
    },
    deals: {
      type: Number,
      default: 5000,
      max: 5000
    },
    aiRequestsPerDay: {
      type: Number,
      default: 500,
      max: 500
    }
  },
  
  // Usage Tracking
  usage: {
    contactsCount: {
      type: Number,
      default: 0
    },
    dealsCount: {
      type: Number,
      default: 0
    },
    aiRequestsToday: {
      type: Number,
      default: 0
    },
    lastAiRequestDate: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.emailVerificationToken;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Index for performance
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update passwordChangedAt
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
  next();
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  
  // False means NOT changed
  return false;
};

// Instance method to reset AI requests counter daily
userSchema.methods.resetDailyAiRequests = function() {
  const today = new Date();
  const lastRequestDate = this.usage.lastAiRequestDate;
  
  if (!lastRequestDate || lastRequestDate.toDateString() !== today.toDateString()) {
    this.usage.aiRequestsToday = 0;
    this.usage.lastAiRequestDate = today;
  }
};

// Instance method to check if user can make AI request
userSchema.methods.canMakeAiRequest = function() {
  this.resetDailyAiRequests();
  return this.usage.aiRequestsToday < this.limits.aiRequestsPerDay;
};

// Instance method to increment AI request count
userSchema.methods.incrementAiRequests = function() {
  this.resetDailyAiRequests();
  this.usage.aiRequestsToday += 1;
  this.usage.lastAiRequestDate = new Date();
};

// Instance method to increment contact count
userSchema.methods.incrementContactCount = async function() {
  this.usage.contactsCount += 1;
  await this.save();
};

// Instance method to decrement contact count
userSchema.methods.decrementContactCount = async function() {
  if (this.usage.contactsCount > 0) {
    this.usage.contactsCount -= 1;
    await this.save();
  }
};

// Instance method to check if user can add more contacts
userSchema.methods.canAddContact = function() {
  return this.usage.contactsCount < this.limits.contacts;
};

// Instance method to get contact usage percentage
userSchema.methods.getContactUsagePercentage = function() {
  return Math.round((this.usage.contactsCount / this.limits.contacts) * 100);
};

// Instance method to increment deal count
userSchema.methods.incrementDealCount = async function() {
  this.usage.dealsCount += 1;
  await this.save();
};

// Instance method to decrement deal count
userSchema.methods.decrementDealCount = async function() {
  if (this.usage.dealsCount > 0) {
    this.usage.dealsCount -= 1;
    await this.save();
  }
};

// Instance method to check if user can add more deals
userSchema.methods.canAddDeal = function() {
  return this.usage.dealsCount < this.limits.deals;
};

// Instance method to get deal usage percentage
userSchema.methods.getDealUsagePercentage = function() {
  return Math.round((this.usage.dealsCount / this.limits.deals) * 100);
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

const User = mongoose.model('User', userSchema);

module.exports = User; 