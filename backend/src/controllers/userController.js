const User = require('../models/User');
const Contact = require('../models/Contact');
const Deal = require('../models/Deal');
const Interaction = require('../models/Interaction');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

/**
 * User Management Controller
 * Handles user profile management, avatar uploads, and account operations
 */

/**
 * Get user profile
 * GET /api/users/profile
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get additional statistics
    const stats = {
      contactsCount: user.usage.contactsCount,
      dealsCount: user.usage.dealsCount,
      contactsUsagePercentage: user.getContactUsagePercentage(),
      dealsUsagePercentage: user.getDealUsagePercentage(),
      aiRequestsToday: user.usage.aiRequestsToday,
      aiRequestsRemaining: user.limits.aiRequestsPerDay - user.usage.aiRequestsToday
    };

    logger.info(`Retrieved profile for user ${userId}`, {
      userId,
      email: user.email
    });

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: user.toJSON(),
        stats
      }
    });

  } catch (error) {
    logger.error('Error retrieving user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile'
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = { ...req.body };

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.isActive;
    delete updateData.isEmailVerified;
    delete updateData.limits;
    delete updateData.usage;
    delete updateData.passwordResetToken;
    delete updateData.emailVerificationToken;

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
        error: 'User not found'
      });
    }

    // Log profile update activity
    await logUserActivity(userId, 'profile_updated', {
      updatedFields: Object.keys(updateData),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Profile updated for user ${userId}`, {
      userId,
      email: user.email,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user profile'
    });
  }
};

/**
 * Upload user avatar
 * POST /api/users/avatar
 */
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No avatar file provided'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      // Delete uploaded file if invalid
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and GIF images are allowed.'
      });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      await fs.unlink(req.file.path);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
      try {
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        // Ignore error if old file doesn't exist
        logger.warn(`Could not delete old avatar: ${oldAvatarPath}`);
      }
    }

    // Update user with new avatar path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    // Log avatar upload activity
    await logUserActivity(userId, 'avatar_uploaded', {
      fileName: req.file.filename,
      fileSize: req.file.size,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Avatar uploaded for user ${userId}`, {
      userId,
      fileName: req.file.filename,
      fileSize: req.file.size
    });

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: avatarUrl,
        user: user.toJSON()
      }
    });

  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('Error deleting uploaded file:', unlinkError);
      }
    }

    logger.error('Error uploading avatar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar'
    });
  }
};

/**
 * Delete user avatar
 * DELETE /api/users/avatar
 */
const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.avatar) {
      return res.status(400).json({
        success: false,
        error: 'No avatar to delete'
      });
    }

    // Delete avatar file
    const avatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
    try {
      await fs.unlink(avatarPath);
    } catch (error) {
      logger.warn(`Could not delete avatar file: ${avatarPath}`);
    }

    // Update user
    user.avatar = null;
    await user.save();

    // Log avatar deletion activity
    await logUserActivity(userId, 'avatar_deleted', {
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Avatar deleted for user ${userId}`, { userId });

    res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    logger.error('Error deleting avatar:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete avatar'
    });
  }
};

/**
 * Get user activity log
 * GET /api/users/activity
 */
const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      type,
      startDate,
      endDate
    } = req.query;

    // Build query for user activities (interactions related to user's contacts and deals)
    const query = { owner: userId };
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get activities (interactions from contacts and deals)
    const activities = await Interaction.find(query)
      .populate('contactId', 'firstName lastName email company')
      .populate('dealId', 'title value stage')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalActivities = await Interaction.countDocuments(query);
    const totalPages = Math.ceil(totalActivities / limitNum);

    logger.info(`Retrieved ${activities.length} activities for user ${userId}`, {
      userId,
      totalActivities
    });

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalActivities,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    logger.error('Error retrieving user activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user activity'
    });
  }
};

/**
 * Delete user account (soft delete)
 * DELETE /api/users/account
 */
const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmPassword } = req.body;

    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Password confirmation is required to delete account'
      });
    }

    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify password
    const isPasswordCorrect = await user.correctPassword(confirmPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        error: 'Incorrect password'
      });
    }

    // Get data counts before deletion
    const contactsCount = await Contact.countDocuments({ owner: userId });
    const dealsCount = await Deal.countDocuments({ owner: userId });
    const interactionsCount = await Interaction.countDocuments({ owner: userId });

    // Soft delete: deactivate account instead of hard delete
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.firstName = 'Deleted';
    user.lastName = 'User';
    user.phone = null;
    user.company = null;
    user.jobTitle = null;
    user.avatar = null;
    await user.save();

    // Mark all user data as deleted/inactive
    await Contact.updateMany(
      { owner: userId },
      { isDuplicate: true, isActive: false }
    );

    await Deal.updateMany(
      { owner: userId },
      { isActive: false }
    );

    // Log account deletion activity
    await logUserActivity(userId, 'account_deleted', {
      contactsCount,
      dealsCount,
      interactionsCount,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    logger.info(`Account deleted for user ${userId}`, {
      userId,
      originalEmail: req.user.email,
      contactsCount,
      dealsCount,
      interactionsCount
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
      data: {
        deletedData: {
          contactsCount,
          dealsCount,
          interactionsCount
        }
      }
    });

  } catch (error) {
    logger.error('Error deleting user account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user account'
    });
  }
};

/**
 * Helper function to log user activities
 * For now, we'll just use the logger instead of creating Interaction records
 * since Interaction model requires contactId or dealId
 */
const logUserActivity = async (userId, activityType, metadata = {}) => {
  try {
    // Log to application logger
    logger.info(`User Activity: ${activityType}`, {
      userId,
      activityType,
      metadata,
      timestamp: new Date().toISOString()
    });
    
    // In the future, we could create a separate UserActivity model
    // or modify the Interaction model to allow system activities
  } catch (error) {
    logger.error('Error logging user activity:', error);
    // Don't throw error as this is a background operation
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  deleteAvatar,
  getUserActivity,
  deleteUserAccount
}; 