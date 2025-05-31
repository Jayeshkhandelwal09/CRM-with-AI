const { body, query, param } = require('express-validator');
const { CONTACT_STATUSES, LEAD_SOURCES, PRIORITY_LEVELS, VALIDATION_LIMITS } = require('../utils/constants');

/**
 * Validation for creating a new contact
 */
const createContactValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: VALIDATION_LIMITS.CONTACT.FIRST_NAME_MAX })
    .withMessage(`First name must be between 2 and ${VALIDATION_LIMITS.CONTACT.FIRST_NAME_MAX} characters`),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: VALIDATION_LIMITS.CONTACT.LAST_NAME_MAX })
    .withMessage(`Last name must be between 2 and ${VALIDATION_LIMITS.CONTACT.LAST_NAME_MAX} characters`),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: VALIDATION_LIMITS.CONTACT.EMAIL_MAX })
    .withMessage(`Email cannot exceed ${VALIDATION_LIMITS.CONTACT.EMAIL_MAX} characters`),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: VALIDATION_LIMITS.CONTACT.COMPANY_MAX })
    .withMessage(`Company name must be between 2 and ${VALIDATION_LIMITS.CONTACT.COMPANY_MAX} characters`),
  
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.CONTACT.JOB_TITLE_MAX })
    .withMessage(`Job title cannot exceed ${VALIDATION_LIMITS.CONTACT.JOB_TITLE_MAX} characters`),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.CONTACT.DEPARTMENT_MAX })
    .withMessage(`Department cannot exceed ${VALIDATION_LIMITS.CONTACT.DEPARTMENT_MAX} characters`),
  
  body('linkedinUrl')
    .optional()
    .isURL()
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)
    .withMessage('Please provide a valid LinkedIn URL'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('status')
    .optional()
    .isIn(Object.values(CONTACT_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(CONTACT_STATUSES).join(', ')}`),
  
  body('leadSource')
    .optional()
    .isIn(Object.values(LEAD_SOURCES))
    .withMessage(`Lead source must be one of: ${Object.values(LEAD_SOURCES).join(', ')}`),
  
  body('priority')
    .optional()
    .isIn(Object.values(PRIORITY_LEVELS))
    .withMessage(`Priority must be one of: ${Object.values(PRIORITY_LEVELS).join(', ')}`),
  
  body('notes')
    .optional()
    .isLength({ max: VALIDATION_LIMITS.CONTACT.NOTES_MAX })
    .withMessage(`Notes cannot exceed ${VALIDATION_LIMITS.CONTACT.NOTES_MAX} characters`),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.CONTACT.TAG_MAX })
    .withMessage(`Each tag cannot exceed ${VALIDATION_LIMITS.CONTACT.TAG_MAX} characters`),
  
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned to must be a valid user ID')
];

/**
 * Validation for updating a contact
 */
const updateContactValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: VALIDATION_LIMITS.CONTACT.FIRST_NAME_MAX })
    .withMessage(`First name must be between 2 and ${VALIDATION_LIMITS.CONTACT.FIRST_NAME_MAX} characters`),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: VALIDATION_LIMITS.CONTACT.LAST_NAME_MAX })
    .withMessage(`Last name must be between 2 and ${VALIDATION_LIMITS.CONTACT.LAST_NAME_MAX} characters`),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: VALIDATION_LIMITS.CONTACT.EMAIL_MAX })
    .withMessage(`Email cannot exceed ${VALIDATION_LIMITS.CONTACT.EMAIL_MAX} characters`),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ min: 2, max: VALIDATION_LIMITS.CONTACT.COMPANY_MAX })
    .withMessage(`Company name must be between 2 and ${VALIDATION_LIMITS.CONTACT.COMPANY_MAX} characters`),
  
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.CONTACT.JOB_TITLE_MAX })
    .withMessage(`Job title cannot exceed ${VALIDATION_LIMITS.CONTACT.JOB_TITLE_MAX} characters`),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.CONTACT.DEPARTMENT_MAX })
    .withMessage(`Department cannot exceed ${VALIDATION_LIMITS.CONTACT.DEPARTMENT_MAX} characters`),
  
  body('linkedinUrl')
    .optional()
    .isURL()
    .matches(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)
    .withMessage('Please provide a valid LinkedIn URL'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  
  body('status')
    .optional()
    .isIn(Object.values(CONTACT_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(CONTACT_STATUSES).join(', ')}`),
  
  body('leadSource')
    .optional()
    .isIn(Object.values(LEAD_SOURCES))
    .withMessage(`Lead source must be one of: ${Object.values(LEAD_SOURCES).join(', ')}`),
  
  body('priority')
    .optional()
    .isIn(Object.values(PRIORITY_LEVELS))
    .withMessage(`Priority must be one of: ${Object.values(PRIORITY_LEVELS).join(', ')}`),
  
  body('notes')
    .optional()
    .isLength({ max: VALIDATION_LIMITS.CONTACT.NOTES_MAX })
    .withMessage(`Notes cannot exceed ${VALIDATION_LIMITS.CONTACT.NOTES_MAX} characters`),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.CONTACT.TAG_MAX })
    .withMessage(`Each tag cannot exceed ${VALIDATION_LIMITS.CONTACT.TAG_MAX} characters`),
  
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned to must be a valid user ID')
];

/**
 * Validation for listing contacts with filters
 */
const listContactsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: VALIDATION_LIMITS.PAGINATION.MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${VALIDATION_LIMITS.PAGINATION.MAX_LIMIT}`),
  
  query('search')
    .optional()
    .isLength({ max: VALIDATION_LIMITS.SEARCH.MAX_LENGTH })
    .withMessage(`Search term cannot exceed ${VALIDATION_LIMITS.SEARCH.MAX_LENGTH} characters`),
  
  query('status')
    .optional()
    .isIn(Object.values(CONTACT_STATUSES))
    .withMessage(`Status must be one of: ${Object.values(CONTACT_STATUSES).join(', ')}`),
  
  query('priority')
    .optional()
    .isIn(Object.values(PRIORITY_LEVELS))
    .withMessage(`Priority must be one of: ${Object.values(PRIORITY_LEVELS).join(', ')}`),
  
  query('leadSource')
    .optional()
    .isIn(Object.values(LEAD_SOURCES))
    .withMessage(`Lead source must be one of: ${Object.values(LEAD_SOURCES).join(', ')}`),
  
  query('sortBy')
    .optional()
    .isIn(['firstName', 'lastName', 'company', 'createdAt', 'lastContactDate', 'priority'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      }
      return Array.isArray(value);
    })
    .withMessage('Tags must be an array or valid JSON string'),
  
  query('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned to must be a valid user ID'),
  
  query('createdFrom')
    .optional()
    .isISO8601()
    .withMessage('Created from date must be a valid ISO date'),
  
  query('createdTo')
    .optional()
    .isISO8601()
    .withMessage('Created to date must be a valid ISO date')
];

/**
 * Validation for contact ID parameter
 */
const contactIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Contact ID must be a valid MongoDB ID')
];

/**
 * Validation for bulk operations
 */
const bulkContactValidation = [
  body('contactIds')
    .isArray({ min: 1 })
    .withMessage('Contact IDs array is required and must not be empty'),
  
  body('contactIds.*')
    .isMongoId()
    .withMessage('Each contact ID must be a valid MongoDB ID'),
  
  body('action')
    .isIn(['delete', 'restore', 'updateStatus', 'updatePriority', 'assignTo'])
    .withMessage('Invalid bulk action'),
  
  body('value')
    .optional()
    .custom((value, { req }) => {
      const action = req.body.action;
      if (action === 'updateStatus') {
        return Object.values(CONTACT_STATUSES).includes(value);
      }
      if (action === 'updatePriority') {
        return Object.values(PRIORITY_LEVELS).includes(value);
      }
      if (action === 'assignTo') {
        return /^[0-9a-fA-F]{24}$/.test(value); // MongoDB ObjectId
      }
      return true;
    })
    .withMessage('Invalid value for the specified action')
];

module.exports = {
  createContactValidation,
  updateContactValidation,
  listContactsValidation,
  contactIdValidation,
  bulkContactValidation
}; 