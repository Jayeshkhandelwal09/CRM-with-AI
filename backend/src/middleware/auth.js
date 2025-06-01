const jwtService = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * JWT Authentication Middleware
 * Verifies access tokens and protects private routes
 */

/**
 * Middleware to verify JWT access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify the access token
    const decoded = await jwtService.verifyAccessToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password was recently changed. Please login again.'
      });
    }

    // Attach user to request object
    req.user = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      preferences: user.preferences,
      limits: user.limits,
      usage: user.usage
    };

    next();

  } catch (error) {
    logger.warn('JWT verification failed:', {
      error: error.message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });

    // Handle specific JWT errors
    if (error.message.includes('expired')) {
      return res.status(401).json({
        success: false,
        message: 'Access token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token',
        code: 'TOKEN_INVALID'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware to verify JWT access token (optional)
 * Similar to verifyToken but doesn't fail if no token is provided
 * Useful for routes that work for both authenticated and unauthenticated users
 */
const verifyTokenOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    // If token is provided, verify it
    const decoded = await jwtService.verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences,
        limits: user.limits,
        usage: user.usage
      };
    } else {
      req.user = null;
    }

    next();

  } catch (error) {
    // If token verification fails, continue without authentication
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if user is email verified
 * Should be used after verifyToken middleware
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
};

/**
 * Middleware to check if user can make AI requests
 * Should be used after verifyToken middleware
 */
const checkAiRequestLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get fresh user data to check current AI usage
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can make AI request
    if (!user.canMakeAiRequest()) {
      return res.status(429).json({
        success: false,
        message: 'Daily AI request limit exceeded',
        code: 'AI_LIMIT_EXCEEDED',
        data: {
          dailyLimit: user.limits.aiRequestsPerDay,
          usedToday: user.usage.aiRequestsToday
        }
      });
    }

    // Update req.user with fresh usage data
    req.user.usage = user.usage;
    next();

  } catch (error) {
    logger.error('AI request limit check failed:', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Middleware to check user permissions/roles (for future use)
 * Currently all users have the same permissions, but this can be extended
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // For now, all authenticated users have access
    // This can be extended when role-based access is implemented
    next();
  };
};

/**
 * Middleware to attach user's usage limits to request
 * Useful for endpoints that need to check limits
 */
const attachUserLimits = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get fresh user data with current usage
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach limits and usage to request
    req.userLimits = {
      contacts: {
        limit: user.limits.contacts,
        used: user.usage.contactsCount,
        remaining: user.limits.contacts - user.usage.contactsCount
      },
      deals: {
        limit: user.limits.deals,
        used: user.usage.dealsCount,
        remaining: user.limits.deals - user.usage.dealsCount
      },
      aiRequests: {
        dailyLimit: user.limits.aiRequestsPerDay,
        usedToday: user.usage.aiRequestsToday,
        remaining: user.limits.aiRequestsPerDay - user.usage.aiRequestsToday
      }
    };

    next();

  } catch (error) {
    logger.error('Attach user limits failed:', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  verifyToken,
  verifyTokenOptional,
  requireEmailVerification,
  checkAiRequestLimit,
  requireRole,
  attachUserLimits
}; 