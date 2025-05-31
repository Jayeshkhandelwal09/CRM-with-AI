const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // User Role & Status
  role: {
    type: String,
    enum: ['SDR', 'AE', 'Manager', 'Admin'],
    default: 'SDR',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },
  
  // Company Information
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department cannot exceed 50 characters']
  },
  
  // AI Usage Tracking
  aiRequestsUsed: {
    type: Number,
    default: 0,
    min: 0
  },
  aiRequestsLimit: {
    type: Number,
    default: 100, // Daily limit as per PRD
    min: 0
  },
  lastAiRequestReset: {
    type: Date,
    default: Date.now
  },
  
  // Profile & Preferences
  avatar: {
    type: String, // URL to avatar image
    default: null
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      dealUpdates: { type: Boolean, default: true },
      aiInsights: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // Security & Authentication
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    deviceInfo: String
  }],
  
  // Login Tracking
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Onboarding
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingSteps: {
    profileSetup: { type: Boolean, default: false },
    teamInvite: { type: Boolean, default: false },
    firstDeal: { type: Boolean, default: false },
    aiTutorial: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ company: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ lastAiRequestReset: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    company: this.company
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const payload = {
    id: this._id,
    type: 'refresh'
  };
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  });
};

// Method to check and reset AI request limit
userSchema.methods.checkAiRequestLimit = function() {
  const now = new Date();
  const lastReset = new Date(this.lastAiRequestReset);
  
  // Reset if it's a new day
  if (now.toDateString() !== lastReset.toDateString()) {
    this.aiRequestsUsed = 0;
    this.lastAiRequestReset = now;
  }
  
  return this.aiRequestsUsed < this.aiRequestsLimit;
};

// Method to increment AI request count
userSchema.methods.incrementAiRequests = async function() {
  this.aiRequestsUsed += 1;
  await this.save();
};

// Method to handle failed login attempts
userSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ status: 'active' });
};

module.exports = mongoose.model('User', userSchema); 