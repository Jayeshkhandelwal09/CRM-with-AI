/**
 * Standardized API Response Helper
 * Provides consistent response format across all endpoints
 */

class ResponseHelper {
  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message,
      ...(data && { data })
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {Array} errors - Validation errors array
   * @param {string} error - Additional error details (development only)
   */
  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null, error = null) {
    const response = {
      success: false,
      message,
      ...(errors && { errors }),
      ...(error && process.env.NODE_ENV === 'development' && { error })
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   * @param {Object} res - Express response object
   * @param {Array} errors - Validation errors array
   * @param {string} message - Error message
   */
  static validationError(res, errors, message = 'Validation failed') {
    return this.error(res, message, 400, errors);
  }

  /**
   * Send not found response
   * @param {Object} res - Express response object
   * @param {string} message - Not found message
   */
  static notFound(res, message = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * Send unauthorized response
   * @param {Object} res - Express response object
   * @param {string} message - Unauthorized message
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return this.error(res, message, 401);
  }

  /**
   * Send forbidden response
   * @param {Object} res - Express response object
   * @param {string} message - Forbidden message
   */
  static forbidden(res, message = 'Access forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Send conflict response
   * @param {Object} res - Express response object
   * @param {string} message - Conflict message
   */
  static conflict(res, message = 'Resource conflict') {
    return this.error(res, message, 409);
  }

  /**
   * Send paginated response
   * @param {Object} res - Express response object
   * @param {Array} items - Array of items
   * @param {Object} pagination - Pagination metadata
   * @param {Object} summary - Summary statistics
   * @param {Object} filters - Applied filters
   * @param {string} message - Success message
   */
  static paginated(res, items, pagination, summary = null, filters = null, message = 'Data retrieved successfully') {
    const data = {
      items,
      pagination,
      ...(summary && { summary }),
      ...(filters && { filters })
    };

    return this.success(res, data, message);
  }
}

module.exports = ResponseHelper; 