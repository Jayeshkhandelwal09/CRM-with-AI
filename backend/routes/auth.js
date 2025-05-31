const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticate, verifyRefreshToken } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../validators/authValidators');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, AuthController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, AuthController.login);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', verifyRefreshToken, AuthController.refresh);

// @route   POST /api/auth/logout
// @desc    Logout user (invalidate refresh token)
// @access  Private
router.post('/logout', authenticate, AuthController.logout);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, AuthController.getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, updateProfileValidation, AuthController.updateProfile);

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', authenticate, changePasswordValidation, AuthController.changePassword);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', forgotPasswordValidation, AuthController.forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', resetPasswordValidation, AuthController.resetPassword);

module.exports = router; 