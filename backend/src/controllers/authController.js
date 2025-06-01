const { validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const jwtService = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Authentication Controller
 * Handles user registration, login, and authentication-related operations
 */

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email, password, phone, company, jobTitle } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      phone,
      company,
      jobTitle
    };

    const user = new User(userData);
    await user.save();

    // Generate JWT tokens
    const tokens = jwtService.generateTokenPair(user._id.toString(), user.email);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log successful registration
    logger.info(`New user registered: ${user.email}`, {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    // Send response (password is automatically excluded by User model toJSON)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    logger.error('Registration error:', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      ip: req.ip
    });

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for verification
    const user = await User.findByEmail(email).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordCorrect = await user.correctPassword(password, user.password);
    if (!isPasswordCorrect) {
      logger.warn(`Failed login attempt for user: ${email}`, {
        email,
        ip: req.ip
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT tokens
    const tokens = jwtService.generateTokenPair(user._id.toString(), user.email);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log successful login
    logger.info(`User logged in: ${user.email}`, {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    // Send response (password is automatically excluded by User model toJSON)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 * @access Public
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token and generate new tokens
    const newTokens = await jwtService.refreshAccessToken(refreshToken);

    // Verify user still exists and is active
    const decoded = jwtService.decodeToken(refreshToken);
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password was changed. Please login again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokens: {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          expiresIn: newTokens.expiresIn
        }
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

/**
 * Logout user (invalidate tokens)
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = async (req, res) => {
  try {
    // In a more sophisticated setup, you would add the token to a blacklist
    // For now, we'll just send a success response
    // The client should remove the tokens from storage

    logger.info(`User logged out: ${req.user.email}`, {
      userId: req.user.id,
      email: req.user.email,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    logger.error('Logout error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    logger.error('Get profile error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const requestPasswordReset = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token to user
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = resetTokenExpiry;
    await user.save();

    // Log password reset request
    logger.info(`Password reset requested for user: ${user.email}`, {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    // In a real application, you would send an email here
    // For now, we'll return the token for testing purposes
    res.status(200).json({
      success: true,
      message: 'Password reset token generated successfully',
      data: {
        resetToken: resetToken, // Remove this in production
        expiresAt: resetTokenExpiry
      }
    });

  } catch (error) {
    logger.error('Password reset request error:', {
      error: error.message,
      stack: error.stack,
      email: req.body?.email,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Reset password with token
 * @route POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.passwordChangedAt = new Date();
    await user.save();

    // Generate new JWT tokens
    const tokens = jwtService.generateTokenPair(user._id.toString(), user.email);

    // Log successful password reset
    logger.info(`Password reset successful for user: ${user.email}`, {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      data: {
        user: user.toJSON(),
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    logger.error('Password reset error:', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.isActive;
    delete updateData.isEmailVerified;
    delete updateData.limits;
    delete updateData.usage;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log profile update
    logger.info(`Profile updated for user: ${user.email}`, {
      userId: user._id,
      email: user.email,
      updatedFields: Object.keys(updateData),
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    logger.error('Profile update error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Change password
 * @route PUT /api/auth/change-password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordCorrect = await user.correctPassword(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Generate new JWT tokens (invalidate old ones)
    const tokens = jwtService.generateTokenPair(user._id.toString(), user.email);

    // Log password change
    logger.info(`Password changed for user: ${user.email}`, {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: {
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    logger.error('Password change error:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  changePassword
}; 