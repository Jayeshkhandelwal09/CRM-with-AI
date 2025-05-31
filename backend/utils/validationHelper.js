const { validationResult } = require('express-validator');
const ResponseHelper = require('./responseHelper');

/**
 * Validation Helper Utilities
 * Provides reusable validation functions and error handling
 */

class ValidationHelper {
  /**
   * Middleware to handle validation errors
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }
    next();
  }

  /**
   * Build user access filter for MongoDB queries
   * @param {string} userId - User ID
   * @returns {Object} MongoDB filter object
   */
  static buildUserAccessFilter(userId) {
    return {
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    };
  }

  /**
   * Validate MongoDB ObjectId
   * @param {string} id - ID to validate
   * @returns {boolean} True if valid ObjectId
   */
  static isValidObjectId(id) {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(id);
  }

  /**
   * Sanitize and validate pagination parameters
   * @param {Object} query - Request query object
   * @returns {Object} Sanitized pagination parameters
   */
  static sanitizePagination(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Build sort object from query parameters
   * @param {string} sortBy - Field to sort by
   * @param {string} sortOrder - Sort order (asc/desc)
   * @param {string} defaultSort - Default sort field
   * @returns {Object} MongoDB sort object
   */
  static buildSortObject(sortBy = 'createdAt', sortOrder = 'desc', defaultSort = 'createdAt') {
    const sort = {};
    const field = sortBy || defaultSort;
    sort[field] = sortOrder === 'desc' ? -1 : 1;
    return sort;
  }

  /**
   * Build date range filter
   * @param {string} dateFrom - Start date
   * @param {string} dateTo - End date
   * @param {string} field - Date field name
   * @returns {Object} Date range filter object
   */
  static buildDateRangeFilter(dateFrom, dateTo, field = 'createdAt') {
    if (!dateFrom && !dateTo) return {};

    const filter = {};
    if (dateFrom) {
      filter.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      filter.$lte = new Date(dateTo);
    }

    return { [field]: filter };
  }

  /**
   * Build text search filter
   * @param {string} searchTerm - Search term
   * @returns {Object} Text search filter object
   */
  static buildTextSearchFilter(searchTerm) {
    if (!searchTerm) return {};
    return { $text: { $search: searchTerm } };
  }

  /**
   * Build tags filter
   * @param {string|Array} tags - Tags to filter by
   * @returns {Object} Tags filter object
   */
  static buildTagsFilter(tags) {
    if (!tags) return {};
    const tagArray = Array.isArray(tags) ? tags : [tags];
    return { tags: { $in: tagArray } };
  }

  /**
   * Calculate pagination metadata
   * @param {number} totalCount - Total number of items
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @returns {Object} Pagination metadata
   */
  static calculatePaginationMetadata(totalCount, page, limit) {
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage,
      limit
    };
  }

  /**
   * Validate stage transition for deals
   * @param {string} currentStage - Current deal stage
   * @param {string} newStage - New deal stage
   * @returns {boolean} True if transition is valid
   */
  static validateStageTransition(currentStage, newStage) {
    const validTransitions = {
      'prospecting': ['qualification', 'closed_lost'],
      'qualification': ['prospecting', 'proposal', 'closed_lost'],
      'proposal': ['qualification', 'negotiation', 'closed_lost'],
      'negotiation': ['proposal', 'closed_won', 'closed_lost'],
      'closed_won': [], // Cannot change from closed_won
      'closed_lost': ['prospecting'] // Can reopen lost deals
    };

    const allowedTransitions = validTransitions[currentStage] || [];
    return allowedTransitions.includes(newStage);
  }

  /**
   * Validate interaction status transition
   * @param {string} currentStatus - Current interaction status
   * @param {string} newStatus - New interaction status
   * @returns {boolean} True if transition is valid
   */
  static validateInteractionStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      'scheduled': ['completed', 'cancelled', 'no_show'],
      'completed': [], // Cannot change from completed
      'cancelled': ['scheduled'], // Can reschedule cancelled
      'no_show': ['scheduled'] // Can reschedule no-show
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Extract validation errors from Mongoose error
   * @param {Error} error - Mongoose validation error
   * @returns {Array} Array of validation error objects
   */
  static extractMongooseValidationErrors(error) {
    if (error.name !== 'ValidationError') return null;

    return Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
  }
}

module.exports = ValidationHelper; 