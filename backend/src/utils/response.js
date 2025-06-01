const { HTTP_STATUS } = require('./constants');

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message,
    ...(data && { data }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} errors - Validation errors or additional error details
 */
const sendError = (res, message = 'Internal Server Error', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) => {
  const response = {
    success: false,
    error: message,
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 */
const sendPaginated = (res, data, pagination, message = 'Data retrieved successfully') => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage,
    },
  };

  // Set total count header for frontend
  res.set('X-Total-Count', pagination.totalItems.toString());
  
  return res.status(HTTP_STATUS.OK).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
const sendValidationError = (res, errors) => {
  return sendError(
    res,
    'Validation failed',
    HTTP_STATUS.UNPROCESSABLE_ENTITY,
    errors
  );
};

/**
 * Send not found response
 * @param {Object} res - Express response object
 * @param {string} resource - Resource name that was not found
 */
const sendNotFound = (res, resource = 'Resource') => {
  return sendError(
    res,
    `${resource} not found`,
    HTTP_STATUS.NOT_FOUND
  );
};

/**
 * Send unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Custom unauthorized message
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(
    res,
    message,
    HTTP_STATUS.UNAUTHORIZED
  );
};

/**
 * Send forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Custom forbidden message
 */
const sendForbidden = (res, message = 'Access forbidden') => {
  return sendError(
    res,
    message,
    HTTP_STATUS.FORBIDDEN
  );
};

/**
 * Send conflict response
 * @param {Object} res - Express response object
 * @param {string} message - Custom conflict message
 */
const sendConflict = (res, message = 'Resource already exists') => {
  return sendError(
    res,
    message,
    HTTP_STATUS.CONFLICT
  );
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendConflict,
}; 