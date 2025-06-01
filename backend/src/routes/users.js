const express = require('express');
const router = express.Router();

// Import middleware
const { verifyToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { uploadAvatar, handleUploadError } = require('../middleware/upload');
const { validateProfileUpdate } = require('../middleware/validation');

// Import controller
const {
  getUserProfile,
  updateUserProfile,
  uploadAvatar: uploadAvatarController,
  deleteAvatar,
  getUserActivity,
  deleteUserAccount
} = require('../controllers/userController');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Apply rate limiting to all user routes
router.use(apiLimiter);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile with statistics
 * @access  Private
 */
router.get('/profile', getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 * @body    firstName, lastName, phone, company, jobTitle, preferences
 */
router.put('/profile', validateProfileUpdate, updateUserProfile);

/**
 * @route   POST /api/users/avatar
 * @desc    Upload user avatar
 * @access  Private
 * @form    avatar (file)
 */
router.post('/avatar', 
  uploadAvatar.single('avatar'),
  handleUploadError,
  uploadAvatarController
);

/**
 * @route   DELETE /api/users/avatar
 * @desc    Delete user avatar
 * @access  Private
 */
router.delete('/avatar', deleteAvatar);

/**
 * @route   GET /api/users/activity
 * @desc    Get user activity log
 * @access  Private
 * @params  page, limit, type, startDate, endDate
 */
router.get('/activity', getUserActivity);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account (soft delete)
 * @access  Private
 * @body    confirmPassword
 */
router.delete('/account', deleteUserAccount);

module.exports = router; 