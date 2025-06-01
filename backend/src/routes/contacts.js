const express = require('express');
const router = express.Router();

// Import middleware
const { verifyToken } = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiter');

// Import controller
const {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Apply rate limiting to all contact routes
router.use(contactLimiter);

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts for authenticated user with pagination and filtering
 * @access  Private
 * @params  page, limit, search, status, company, tags, sortBy
 */
router.get('/', getContacts);

/**
 * @route   GET /api/contacts/:id
 * @desc    Get a single contact by ID
 * @access  Private
 */
router.get('/:id', getContactById);

/**
 * @route   POST /api/contacts
 * @desc    Create a new contact
 * @access  Private
 */
router.post('/', createContact);

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update a contact by ID
 * @access  Private
 */
router.put('/:id', updateContact);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete a contact by ID
 * @access  Private
 */
router.delete('/:id', deleteContact);

module.exports = router; 