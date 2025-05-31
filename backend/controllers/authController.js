const crypto = require('crypto');
const User = require('../models/User');
const ResponseHelper = require('../utils/responseHelper');
const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');

class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  static register = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const { firstName, lastName, email, password, company, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return ResponseHelper.error(res, 'User with this email already exists', 409);
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      company,
      role: role || 'SDR',
      department,
      status: 'active' // Auto-activate for MVP, can be changed to 'pending' for email verification
    });

    await user.save();

    // Generate tokens
    const authToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      deviceInfo: req.get('User-Agent') || 'Unknown'
    });
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;

    const responseData = {
      user: userResponse,
      tokens: {
        accessToken: authToken,
        refreshToken: refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    };

    ResponseHelper.success(res, responseData, 'User registered successfully', 201);
  });

  /**
   * Login user
   * @route POST /api/auth/login
   */
  static login = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findByEmail(email).select('+password');
    
    if (!user) {
      return ResponseHelper.error(res, 'Invalid email or password', 401);
    }

    // Check if account is locked
    if (user.isLocked) {
      return ResponseHelper.error(res, 'Account is temporarily locked due to multiple failed login attempts', 423);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      return ResponseHelper.error(res, 'Invalid email or password', 401);
    }

    // Check if account is active
    if (user.status !== 'active') {
      return ResponseHelper.error(res, 'Account is not active. Please contact support.', 401);
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    
    // Generate tokens
    const authToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      deviceInfo: req.get('User-Agent') || 'Unknown'
    });

    // Clean up old refresh tokens (keep only last 5)
    if (user.refreshTokens.length > 5) {
      user.refreshTokens = user.refreshTokens.slice(-5);
    }

    await user.save();

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;

    const responseData = {
      user: userResponse,
      tokens: {
        accessToken: authToken,
        refreshToken: refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    };

    ResponseHelper.success(res, responseData, 'Login successful');
  });

  /**
   * Refresh access token
   * @route POST /api/auth/refresh
   */
  static refresh = asyncHandler(async (req, res) => {
    const user = req.user;
    const oldRefreshToken = req.refreshToken;

    // Generate new tokens
    const newAuthToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(
      tokenObj => tokenObj.token !== oldRefreshToken
    );
    
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      deviceInfo: req.get('User-Agent') || 'Unknown'
    });

    await user.save();

    const responseData = {
      tokens: {
        accessToken: newAuthToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    };

    ResponseHelper.success(res, responseData, 'Tokens refreshed successfully');
  });

  /**
   * Logout user (invalidate refresh token)
   * @route POST /api/auth/logout
   */
  static logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const user = req.user;

    if (refreshToken) {
      // Remove specific refresh token
      user.refreshTokens = user.refreshTokens.filter(
        tokenObj => tokenObj.token !== refreshToken
      );
    } else {
      // Remove all refresh tokens (logout from all devices)
      user.refreshTokens = [];
    }

    await user.save();

    ResponseHelper.success(res, null, 'Logout successful');
  });

  /**
   * Get current user profile
   * @route GET /api/auth/me
   */
  static getProfile = asyncHandler(async (req, res) => {
    const user = req.user.toObject();
    
    // Remove sensitive data
    delete user.refreshTokens;
    delete user.loginAttempts;
    delete user.lockUntil;
    delete user.passwordResetToken;
    delete user.passwordResetExpires;
    delete user.emailVerificationToken;
    delete user.emailVerificationExpires;

    ResponseHelper.success(res, { user }, 'Profile retrieved successfully');
  });

  /**
   * Update user profile
   * @route PUT /api/auth/profile
   */
  static updateProfile = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const user = req.user;
    const allowedUpdates = ['firstName', 'lastName', 'department', 'timezone', 'preferences', 'avatar'];
    const updates = {};

    // Only include allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'preferences' && user.preferences) {
          // Merge preferences
          updates.preferences = { ...user.preferences.toObject(), ...req.body.preferences };
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    // Update user
    Object.assign(user, updates);
    await user.save();

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.refreshTokens;
    delete userResponse.loginAttempts;
    delete userResponse.lockUntil;
    delete userResponse.passwordResetToken;
    delete userResponse.passwordResetExpires;

    ResponseHelper.success(res, { user: userResponse }, 'Profile updated successfully');
  });

  /**
   * Change user password
   * @route POST /api/auth/change-password
   */
  static changePassword = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return ResponseHelper.error(res, 'Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    
    // Invalidate all refresh tokens (force re-login on all devices)
    user.refreshTokens = [];
    
    await user.save();

    ResponseHelper.success(res, null, 'Password changed successfully. Please log in again.');
  });

  /**
   * Request password reset
   * @route POST /api/auth/forgot-password
   */
  static forgotPassword = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) {
      return ResponseHelper.success(res, null, 'If an account with that email exists, a password reset link has been sent.');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // TODO: Send email with reset link
    // For now, we'll just log it (in production, integrate with email service)
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);

    const responseData = process.env.NODE_ENV === 'development' ? { resetToken } : null;

    ResponseHelper.success(res, responseData, 'If an account with that email exists, a password reset link has been sent.');
  });

  /**
   * Reset password with token
   * @route POST /api/auth/reset-password
   */
  static resetPassword = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const { token, password } = req.body;

    // Hash token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return ResponseHelper.error(res, 'Invalid or expired reset token', 400);
    }

    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Invalidate all refresh tokens
    user.refreshTokens = [];

    await user.save();

    ResponseHelper.success(res, null, 'Password reset successful. Please log in with your new password.');
  });
}

module.exports = AuthController; 