const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided or invalid format.'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Token is valid but user not found.'
      });
    }
    
    // Check if user account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is not active. Please contact support.'
      });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        error: 'Account is temporarily locked due to multiple failed login attempts.'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired.'
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during authentication.'
    });
  }
};

// Middleware to check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Middleware to check AI request limit
const checkAiLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }
    
    // Check if user has remaining AI requests
    if (!req.user.checkAiRequestLimit()) {
      return res.status(429).json({
        success: false,
        error: 'Daily AI request limit exceeded. Limit resets at midnight.',
        data: {
          requestsUsed: req.user.aiRequestsUsed,
          requestsLimit: req.user.aiRequestsLimit,
          resetTime: new Date(req.user.lastAiRequestReset.getTime() + 24 * 60 * 60 * 1000)
        }
      });
    }
    
    next();
    
  } catch (error) {
    console.error('AI limit check error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during AI limit check.'
    });
  }
};

// Middleware to verify refresh token
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token is required.'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token type.'
      });
    }
    
    // Get user and check if refresh token exists
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found.'
      });
    }
    
    // Check if refresh token exists in user's refresh tokens
    const tokenExists = user.refreshTokens.some(
      tokenObj => tokenObj.token === refreshToken && tokenObj.expiresAt > new Date()
    );
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token.'
      });
    }
    
    req.user = user;
    req.refreshToken = refreshToken;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Refresh token has expired.'
      });
    }
    
    console.error('Refresh token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during refresh token verification.'
    });
  }
};

// Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (user && user.status === 'active' && !user.isLocked) {
      req.user = user;
    }
    
    next();
    
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  checkAiLimit,
  verifyRefreshToken,
  optionalAuth
}; 