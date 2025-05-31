const ContactService = require('../services/contactService');
const ResponseHelper = require('../utils/responseHelper');
const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');

class ContactController {
  /**
   * Get contact statistics
   * @route GET /api/contacts/stats
   */
  static getContactStats = asyncHandler(async (req, res) => {
    const stats = await ContactService.getContactStats(req.user._id);
    ResponseHelper.success(res, stats, 'Contact statistics retrieved successfully');
  });

  /**
   * Get all contacts with filtering and pagination
   * @route GET /api/contacts
   */
  static getAllContacts = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const result = await ContactService.getAllContacts(req.user._id, req.query);
    ResponseHelper.paginated(res, result.contacts, result.pagination, 'Contacts retrieved successfully');
  });

  /**
   * Get a single contact by ID
   * @route GET /api/contacts/:id
   */
  static getContactById = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const contact = await ContactService.getContactById(req.params.id, req.user._id);
    ResponseHelper.success(res, contact, 'Contact retrieved successfully');
  });

  /**
   * Create a new contact
   * @route POST /api/contacts
   */
  static createContact = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const contact = await ContactService.createContact(req.body, req.user._id);
    ResponseHelper.success(res, contact, 'Contact created successfully', 201);
  });

  /**
   * Update a contact
   * @route PUT /api/contacts/:id
   */
  static updateContact = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const contact = await ContactService.updateContact(req.params.id, req.body, req.user._id);
    ResponseHelper.success(res, contact, 'Contact updated successfully');
  });

  /**
   * Delete a contact (soft delete)
   * @route DELETE /api/contacts/:id
   */
  static deleteContact = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const result = await ContactService.deleteContact(req.params.id, req.user._id);
    ResponseHelper.success(res, result, 'Contact deleted successfully');
  });

  /**
   * Restore a deleted contact
   * @route POST /api/contacts/:id/restore
   */
  static restoreContact = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const contact = await ContactService.restoreContact(req.params.id, req.user._id);
    ResponseHelper.success(res, contact, 'Contact restored successfully');
  });

  /**
   * Add tags to a contact
   * @route POST /api/contacts/:id/tags
   */
  static addTags = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const { tags } = req.body;
    const contact = await ContactService.addTags(req.params.id, tags, req.user._id);
    ResponseHelper.success(res, contact, 'Tags added successfully');
  });

  /**
   * Remove a tag from a contact
   * @route DELETE /api/contacts/:id/tags/:tag
   */
  static removeTag = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const contact = await ContactService.removeTag(req.params.id, req.params.tag, req.user._id);
    ResponseHelper.success(res, contact, 'Tag removed successfully');
  });

  /**
   * Bulk operations on contacts
   * @route POST /api/contacts/bulk
   */
  static bulkOperation = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const { contactIds, action, value } = req.body;
    const result = await ContactService.bulkOperation(contactIds, action, value, req.user._id);
    ResponseHelper.success(res, result, 'Bulk operation completed successfully');
  });

  /**
   * Get deleted contacts
   * @route GET /api/contacts/deleted
   */
  static getDeletedContacts = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const result = await ContactService.getDeletedContacts(req.user._id, req.query);
    ResponseHelper.paginated(res, result.contacts, result.pagination, 'Deleted contacts retrieved successfully');
  });
}

module.exports = ContactController; 