const ResponseHelper = require('../utils/responseHelper');
const ValidationHelper = require('../utils/validationHelper');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Centralized Error Handler Middleware
 * Handles all application errors consistently
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return ResponseHelper.notFound(res, 'Resource not found');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return ResponseHelper.conflict(res, `${field} '${value}' already exists`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationErrors = ValidationHelper.extractMongooseValidationErrors(err);
    return ResponseHelper.validationError(res, validationErrors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ResponseHelper.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseHelper.unauthorized(res, ERROR_MESSAGES.TOKEN_EXPIRED);
  }

  // Custom application errors
  if (err.message === ERROR_MESSAGES.DEAL_NOT_FOUND) {
    return ResponseHelper.notFound(res, err.message);
  }

  if (err.message === ERROR_MESSAGES.CONTACT_NOT_FOUND) {
    return ResponseHelper.notFound(res, err.message);
  }

  if (err.message === ERROR_MESSAGES.INTERACTION_NOT_FOUND) {
    return ResponseHelper.notFound(res, err.message);
  }

  if (err.message === ERROR_MESSAGES.DUPLICATE_DEAL) {
    return ResponseHelper.conflict(res, err.message);
  }

  if (err.message === ERROR_MESSAGES.CANNOT_UPDATE_DELETED) {
    return ResponseHelper.error(res, err.message, 400);
  }

  if (err.message === ERROR_MESSAGES.ALREADY_DELETED) {
    return ResponseHelper.error(res, err.message, 400);
  }

  if (err.message === ERROR_MESSAGES.NOT_DELETED) {
    return ResponseHelper.error(res, err.message, 400);
  }

  if (err.message === ERROR_MESSAGES.TAG_NOT_FOUND) {
    return ResponseHelper.notFound(res, err.message);
  }

  // Stage transition errors
  if (err.message.includes('Cannot transition from')) {
    return ResponseHelper.error(res, err.message, 400);
  }

  // Default error
  return ResponseHelper.error(
    res, 
    ERROR_MESSAGES.INTERNAL_ERROR, 
    500, 
    null, 
    err.message
  );
};

module.exports = errorHandler; 