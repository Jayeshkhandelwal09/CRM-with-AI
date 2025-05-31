/**
 * Async Handler Utility
 * Wraps async functions to handle errors consistently without try-catch blocks
 */

/**
 * Wraps async functions to catch errors and pass them to Express error handler
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler; 