const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  // Basic Session Information
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  sessionType: {
    type: String,
    required: [true, 'Session type is required'],
    enum: ['login', 'activity', 'ai_interaction', 'api'],
    default: 'activity'
  },
  
  // User Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Session must have a user']
  },
  
  // Session Timing
  startTime: {
    type: Date,
    required: [true, 'Session start time is required'],
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  lastActivity: {
    type: Date,
    required: [true, 'Last activity time is required'],
    default: Date.now
  },
  duration: {
    type: Number, // Duration in seconds
    min: 0,
    default: null
  },
  
  // Session Status
  status: {
    type: String,
    required: [true, 'Session status is required'],
    enum: ['active', 'expired', 'terminated', 'timeout'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Device and Browser Information
  userAgent: {
    type: String,
    trim: true
  },
  browser: {
    name: String,
    version: String
  },
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    os: String,
    platform: String
  },
  
  // Network Information
  ipAddress: {
    type: String,
    trim: true
  },
  location: {
    country: String,
    region: String,
    city: String,
    timezone: String
  },
  
  // Activity Tracking
  pageViews: [{
    path: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    duration: {
      type: Number, // Time spent on page in seconds
      min: 0,
      default: 0
    }
  }],
  
  // Actions performed during session
  actions: [{
    type: {
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'search', 'export', 'import', 'ai_request'],
      required: true
    },
    entity: {
      type: String,
      enum: ['contact', 'deal', 'interaction', 'objection', 'user', 'ai_log'],
      required: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  
  // AI Interaction Tracking (for AI sessions)
  aiInteractions: [{
    feature: {
      type: String,
      enum: ['deal_coach', 'persona_builder', 'objection_handler', 'win_loss_explainer']
    },
    requestCount: {
      type: Number,
      default: 0
    },
    lastRequest: {
      type: Date,
      default: null
    }
  }],
  
  // Session Metrics
  metrics: {
    totalPageViews: {
      type: Number,
      default: 0
    },
    totalActions: {
      type: Number,
      default: 0
    },
    totalAiRequests: {
      type: Number,
      default: 0
    },
    uniquePagesVisited: {
      type: Number,
      default: 0
    }
  },
  
  // Security Information
  loginMethod: {
    type: String,
    enum: ['email_password', 'google', 'microsoft', 'api_key'],
    default: 'email_password'
  },
  securityFlags: {
    suspiciousActivity: {
      type: Boolean,
      default: false
    },
    multipleLocations: {
      type: Boolean,
      default: false
    },
    unusualDevice: {
      type: Boolean,
      default: false
    }
  },
  
  // Session Configuration
  settings: {
    autoSave: {
      type: Boolean,
      default: true
    },
    trackingEnabled: {
      type: Boolean,
      default: true
    },
    timeout: {
      type: Number, // Timeout in minutes
      default: 30
    }
  },
  
  // Termination Information
  terminationReason: {
    type: String,
    enum: ['logout', 'timeout', 'expired', 'forced', 'error'],
    default: null
  },
  terminatedBy: {
    type: String,
    enum: ['user', 'system', 'admin'],
    default: null
  },
  
  // Data Retention
  retentionDate: {
    type: Date,
    default: function() {
      // Default retention: 90 days from creation
      const ninetyDays = new Date();
      ninetyDays.setDate(ninetyDays.getDate() + 90);
      return ninetyDays;
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

// Virtual for session duration in minutes
sessionSchema.virtual('durationMinutes').get(function() {
  if (!this.duration) return null;
  return Math.round(this.duration / 60);
});

// Virtual for session duration in hours
sessionSchema.virtual('durationHours').get(function() {
  if (!this.duration) return null;
  return Math.round(this.duration / 3600 * 100) / 100; // Round to 2 decimal places
});

// Virtual for time since last activity
sessionSchema.virtual('timeSinceLastActivity').get(function() {
  const diffTime = Math.abs(new Date() - this.lastActivity);
  return Math.ceil(diffTime / (1000 * 60)); // Return in minutes
});

// Virtual for session age
sessionSchema.virtual('sessionAge').get(function() {
  const diffTime = Math.abs(new Date() - this.startTime);
  return Math.ceil(diffTime / (1000 * 60)); // Return in minutes
});

// Virtual for is session expired
sessionSchema.virtual('isExpired').get(function() {
  if (!this.isActive) return true;
  const timeoutMinutes = this.settings.timeout || 30;
  return this.timeSinceLastActivity > timeoutMinutes;
});

// Virtual for unique pages count
sessionSchema.virtual('uniquePages').get(function() {
  if (!this.pageViews || this.pageViews.length === 0) return 0;
  const uniquePaths = new Set(this.pageViews.map(pv => pv.path));
  return uniquePaths.size;
});

// Indexes for performance
sessionSchema.index({ sessionId: 1 }, { unique: true });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ isActive: 1 });
sessionSchema.index({ startTime: -1 });
sessionSchema.index({ lastActivity: -1 });
sessionSchema.index({ sessionType: 1 });

// Compound indexes for common queries
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ userId: 1, sessionType: 1 });
sessionSchema.index({ userId: 1, startTime: -1 });
sessionSchema.index({ isActive: 1, lastActivity: -1 });
sessionSchema.index({ status: 1, sessionType: 1 });

// TTL index for automatic cleanup
sessionSchema.index({ retentionDate: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
sessionSchema.pre('save', function(next) {
  // Calculate duration if session is ended
  if (this.endTime && this.startTime && !this.duration) {
    this.duration = Math.round((this.endTime - this.startTime) / 1000);
  }
  
  // Update metrics
  if (this.isModified('pageViews')) {
    this.metrics.totalPageViews = this.pageViews.length;
    this.metrics.uniquePagesVisited = this.uniquePages;
  }
  
  if (this.isModified('actions')) {
    this.metrics.totalActions = this.actions.length;
  }
  
  if (this.isModified('aiInteractions')) {
    this.metrics.totalAiRequests = this.aiInteractions.reduce((sum, ai) => sum + ai.requestCount, 0);
  }
  
  // Auto-expire session if timeout exceeded
  if (this.isActive && this.isExpired) {
    this.status = 'timeout';
    this.isActive = false;
    this.endTime = new Date();
    this.terminationReason = 'timeout';
    this.terminatedBy = 'system';
  }
  
  next();
});

// Instance method to update last activity
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  if (this.status === 'timeout' && this.isExpired === false) {
    // Reactivate session if it was timed out but activity resumed within grace period
    this.status = 'active';
    this.isActive = true;
    this.endTime = null;
    this.terminationReason = null;
    this.terminatedBy = null;
  }
};

// Instance method to add page view
sessionSchema.methods.addPageView = function(path, duration = 0) {
  this.pageViews.push({
    path: path,
    timestamp: new Date(),
    duration: duration
  });
  this.updateActivity();
};

// Instance method to add action
sessionSchema.methods.addAction = function(type, entity, entityId = null, details = {}) {
  this.actions.push({
    type: type,
    entity: entity,
    entityId: entityId,
    timestamp: new Date(),
    details: details
  });
  this.updateActivity();
};

// Instance method to add AI interaction
sessionSchema.methods.addAiInteraction = function(feature) {
  const existingInteraction = this.aiInteractions.find(ai => ai.feature === feature);
  if (existingInteraction) {
    existingInteraction.requestCount += 1;
    existingInteraction.lastRequest = new Date();
  } else {
    this.aiInteractions.push({
      feature: feature,
      requestCount: 1,
      lastRequest: new Date()
    });
  }
  this.updateActivity();
};

// Instance method to terminate session
sessionSchema.methods.terminate = function(reason = 'logout', terminatedBy = 'user') {
  this.status = reason === 'logout' ? 'terminated' : reason;
  this.isActive = false;
  this.endTime = new Date();
  this.terminationReason = reason;
  this.terminatedBy = terminatedBy;
  
  // Calculate final duration
  this.duration = Math.round((this.endTime - this.startTime) / 1000);
};

// Instance method to extend session
sessionSchema.methods.extend = function(additionalMinutes = 30) {
  this.settings.timeout += additionalMinutes;
  this.updateActivity();
};

// Instance method to check if session is valid
sessionSchema.methods.isValid = function() {
  return this.isActive && !this.isExpired && this.status === 'active';
};

// Static method to find active sessions by user
sessionSchema.statics.findActiveByUser = function(userId) {
  return this.find({ 
    userId: userId, 
    isActive: true, 
    status: 'active' 
  }).sort({ lastActivity: -1 });
};

// Static method to find sessions by type
sessionSchema.statics.findByType = function(sessionType, userId = null) {
  const query = { sessionType: sessionType };
  if (userId) query.userId = userId;
  return this.find(query).sort({ startTime: -1 });
};

// Static method to find expired sessions
sessionSchema.statics.findExpired = function() {
  const timeoutThreshold = new Date();
  timeoutThreshold.setMinutes(timeoutThreshold.getMinutes() - 30); // Default 30 min timeout
  
  return this.find({
    isActive: true,
    lastActivity: { $lt: timeoutThreshold }
  });
};

// Static method to cleanup expired sessions
sessionSchema.statics.cleanupExpired = async function() {
  const expiredSessions = await this.findExpired();
  
  for (const session of expiredSessions) {
    session.terminate('timeout', 'system');
    await session.save();
  }
  
  return {
    cleanedUp: expiredSessions.length,
    cleanupDate: new Date()
  };
};

// Static method to get session statistics
sessionSchema.statics.getStats = async function(userId = null, startDate = null, endDate = null) {
  const matchStage = {};
  if (userId) matchStage.userId = userId;
  if (startDate || endDate) {
    matchStage.startTime = {};
    if (startDate) matchStage.startTime.$gte = startDate;
    if (endDate) matchStage.startTime.$lte = endDate;
  }
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$sessionType',
        totalSessions: { $sum: 1 },
        activeSessions: { $sum: { $cond: ['$isActive', 1, 0] } },
        avgDuration: { $avg: '$duration' },
        totalDuration: { $sum: '$duration' },
        avgPageViews: { $avg: '$metrics.totalPageViews' },
        avgActions: { $avg: '$metrics.totalActions' },
        avgAiRequests: { $avg: '$metrics.totalAiRequests' }
      }
    },
    {
      $project: {
        sessionType: '$_id',
        totalSessions: 1,
        activeSessions: 1,
        avgDurationMinutes: { $round: [{ $divide: ['$avgDuration', 60] }, 2] },
        totalDurationHours: { $round: [{ $divide: ['$totalDuration', 3600] }, 2] },
        avgPageViews: { $round: ['$avgPageViews', 2] },
        avgActions: { $round: ['$avgActions', 2] },
        avgAiRequests: { $round: ['$avgAiRequests', 2] }
      }
    },
    { $sort: { totalSessions: -1 } }
  ]);
  
  return stats;
};

// Static method to get user activity summary
sessionSchema.statics.getUserActivitySummary = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const summary = await this.aggregate([
    {
      $match: {
        userId: userId,
        startTime: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$startTime' }
        },
        sessionCount: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalPageViews: { $sum: '$metrics.totalPageViews' },
        totalActions: { $sum: '$metrics.totalActions' },
        totalAiRequests: { $sum: '$metrics.totalAiRequests' }
      }
    },
    {
      $project: {
        date: '$_id',
        sessionCount: 1,
        durationHours: { $round: [{ $divide: ['$totalDuration', 3600] }, 2] },
        totalPageViews: 1,
        totalActions: 1,
        totalAiRequests: 1
      }
    },
    { $sort: { date: 1 } }
  ]);
  
  return summary;
};

// Static method to get popular pages
sessionSchema.statics.getPopularPages = async function(userId = null, limit = 10) {
  const matchStage = {};
  if (userId) matchStage.userId = userId;
  
  const popularPages = await this.aggregate([
    { $match: matchStage },
    { $unwind: '$pageViews' },
    {
      $group: {
        _id: '$pageViews.path',
        viewCount: { $sum: 1 },
        avgDuration: { $avg: '$pageViews.duration' },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        path: '$_id',
        viewCount: 1,
        avgDurationSeconds: { $round: ['$avgDuration', 2] },
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    },
    { $sort: { viewCount: -1 } },
    { $limit: limit }
  ]);
  
  return popularPages;
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session; 