const express = require('express');
const ContactController = require('../controllers/contactController');
const { authenticate } = require('../middleware/auth');
const {
  createContactValidation,
  updateContactValidation,
  listContactsValidation,
  contactIdValidation,
  bulkContactValidation
} = require('../validators/contactValidators');

const router = express.Router();

// @route   GET /api/contacts/stats
// @desc    Get contact statistics
// @access  Private
router.get('/stats', authenticate, ContactController.getContactStats);

// @route   GET /api/contacts/deleted
// @desc    Get deleted contacts
// @access  Private
router.get('/deleted', authenticate, listContactsValidation, ContactController.getDeletedContacts);

// @route   GET /api/contacts
// @desc    Get all contacts with pagination and filtering
// @access  Private
router.get('/', authenticate, listContactsValidation, ContactController.getAllContacts);

// @route   GET /api/contacts/:id
// @desc    Get a single contact by ID
// @access  Private
router.get('/:id', authenticate, contactIdValidation, ContactController.getContactById);

// @route   POST /api/contacts
// @desc    Create a new contact
// @access  Private
router.post('/', authenticate, createContactValidation, ContactController.createContact);

// @route   PUT /api/contacts/:id
// @desc    Update a contact
// @access  Private
router.put('/:id', authenticate, contactIdValidation, updateContactValidation, ContactController.updateContact);

// @route   DELETE /api/contacts/:id
// @desc    Delete a contact (soft delete)
// @access  Private
router.delete('/:id', authenticate, contactIdValidation, ContactController.deleteContact);

// @route   POST /api/contacts/:id/restore
// @desc    Restore a deleted contact
// @access  Private
router.post('/:id/restore', authenticate, contactIdValidation, ContactController.restoreContact);

// @route   POST /api/contacts/:id/tags
// @desc    Add tags to a contact
// @access  Private
router.post('/:id/tags', authenticate, contactIdValidation, ContactController.addTags);

// @route   DELETE /api/contacts/:id/tags/:tag
// @desc    Remove a tag from a contact
// @access  Private
router.delete('/:id/tags/:tag', authenticate, contactIdValidation, ContactController.removeTag);

// @route   POST /api/contacts/bulk
// @desc    Bulk operations on contacts
// @access  Private
router.post('/bulk', authenticate, bulkContactValidation, ContactController.bulkOperation);

module.exports = router; 