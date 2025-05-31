const { body, query, param } = require('express-validator');
const { 
  VALIDATION_LIMITS, 
  DEAL_STAGES, 
  DEAL_SOURCES, 
  DEAL_TYPES, 
  PRIORITY_LEVELS, 
  CURRENCIES 
} = require('../utils/constants');

/**
 * Deal Validation Schemas
 * Centralized validation rules for deal-related endpoints
 */

// Helper function to get enum values
const getEnumValues = (enumObj) => Object.values(enumObj);

const createDealValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Deal title is required')
    .isLength({ max: VALIDATION_LIMITS.TITLE_MAX_LENGTH })
    .withMessage(`Deal title cannot exceed ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters`),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH })
    .withMessage(`Deal description cannot exceed ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters`),
  
  body('value')
    .isNumeric()
    .withMessage('Deal value must be a number')
    .isFloat({ min: 0, max: VALIDATION_LIMITS.DEAL_VALUE_MAX })
    .withMessage(`Deal value must be between 0 and ${VALIDATION_LIMITS.DEAL_VALUE_MAX}`),
  
  body('currency')
    .optional()
    .isIn(getEnumValues(CURRENCIES))
    .withMessage(`Currency must be one of: ${getEnumValues(CURRENCIES).join(', ')}`),
  
  body('stage')
    .optional()
    .isIn(getEnumValues(DEAL_STAGES))
    .withMessage('Invalid deal stage'),
  
  body('probability')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Probability must be between 0 and 100'),
  
  body('expectedCloseDate')
    .isISO8601()
    .withMessage('Expected close date must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Expected close date cannot be in the past');
      }
      return true;
    }),
  
  body('contact')
    .isMongoId()
    .withMessage('Contact must be a valid ID'),
  
  body('source')
    .optional()
    .isIn(getEnumValues(DEAL_SOURCES))
    .withMessage('Invalid deal source'),
  
  body('type')
    .optional()
    .isIn(getEnumValues(DEAL_TYPES))
    .withMessage('Invalid deal type'),
  
  body('priority')
    .optional()
    .isIn(getEnumValues(PRIORITY_LEVELS))
    .withMessage('Invalid priority level'),
  
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned user must be a valid ID'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.TAG_MAX_LENGTH })
    .withMessage(`Each tag cannot exceed ${VALIDATION_LIMITS.TAG_MAX_LENGTH} characters`),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.NOTES_MAX_LENGTH })
    .withMessage(`Notes cannot exceed ${VALIDATION_LIMITS.NOTES_MAX_LENGTH} characters`),
  
  body('competitors')
    .optional()
    .isArray()
    .withMessage('Competitors must be an array'),
  
  body('competitors.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Competitor name is required')
    .isLength({ max: VALIDATION_LIMITS.COMPETITOR_NAME_MAX_LENGTH })
    .withMessage(`Competitor name cannot exceed ${VALIDATION_LIMITS.COMPETITOR_NAME_MAX_LENGTH} characters`),
  
  body('competitors.*.strength')
    .optional()
    .isIn(['weak', 'moderate', 'strong'])
    .withMessage('Competitor strength must be weak, moderate, or strong'),
  
  body('competitors.*.notes')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.COMPETITOR_NOTES_MAX_LENGTH })
    .withMessage(`Competitor notes cannot exceed ${VALIDATION_LIMITS.COMPETITOR_NOTES_MAX_LENGTH} characters`)
];

const updateDealValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Deal title cannot be empty')
    .isLength({ max: VALIDATION_LIMITS.TITLE_MAX_LENGTH })
    .withMessage(`Deal title cannot exceed ${VALIDATION_LIMITS.TITLE_MAX_LENGTH} characters`),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH })
    .withMessage(`Deal description cannot exceed ${VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH} characters`),
  
  body('value')
    .optional()
    .isNumeric()
    .withMessage('Deal value must be a number')
    .isFloat({ min: 0, max: VALIDATION_LIMITS.DEAL_VALUE_MAX })
    .withMessage(`Deal value must be between 0 and ${VALIDATION_LIMITS.DEAL_VALUE_MAX}`),
  
  body('currency')
    .optional()
    .isIn(getEnumValues(CURRENCIES))
    .withMessage(`Currency must be one of: ${getEnumValues(CURRENCIES).join(', ')}`),
  
  body('stage')
    .optional()
    .isIn(getEnumValues(DEAL_STAGES))
    .withMessage('Invalid deal stage'),
  
  body('probability')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Probability must be between 0 and 100'),
  
  body('expectedCloseDate')
    .optional()
    .isISO8601()
    .withMessage('Expected close date must be a valid date'),
  
  body('actualCloseDate')
    .optional()
    .isISO8601()
    .withMessage('Actual close date must be a valid date'),
  
  body('contact')
    .optional()
    .isMongoId()
    .withMessage('Contact must be a valid ID'),
  
  body('source')
    .optional()
    .isIn(getEnumValues(DEAL_SOURCES))
    .withMessage('Invalid deal source'),
  
  body('type')
    .optional()
    .isIn(getEnumValues(DEAL_TYPES))
    .withMessage('Invalid deal type'),
  
  body('priority')
    .optional()
    .isIn(getEnumValues(PRIORITY_LEVELS))
    .withMessage('Invalid priority level'),
  
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned user must be a valid ID'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.TAG_MAX_LENGTH })
    .withMessage(`Each tag cannot exceed ${VALIDATION_LIMITS.TAG_MAX_LENGTH} characters`),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.NOTES_MAX_LENGTH })
    .withMessage(`Notes cannot exceed ${VALIDATION_LIMITS.NOTES_MAX_LENGTH} characters`),
  
  body('nextFollowUpDate')
    .optional()
    .isISO8601()
    .withMessage('Next follow-up date must be a valid date'),
  
  body('competitors')
    .optional()
    .isArray()
    .withMessage('Competitors must be an array'),
  
  body('stageNotes')
    .optional()
    .trim()
    .isLength({ max: VALIDATION_LIMITS.STAGE_NOTES_MAX_LENGTH })
    .withMessage(`Stage notes cannot exceed ${VALIDATION_LIMITS.STAGE_NOTES_MAX_LENGTH} characters`)
];

const listDealsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: VALIDATION_LIMITS.SEARCH_QUERY_MAX_LENGTH })
    .withMessage(`Search query must be between 1 and ${VALIDATION_LIMITS.SEARCH_QUERY_MAX_LENGTH} characters`),
  
  query('stage')
    .optional()
    .isIn(getEnumValues(DEAL_STAGES))
    .withMessage('Invalid stage filter'),
  
  query('priority')
    .optional()
    .isIn(getEnumValues(PRIORITY_LEVELS))
    .withMessage('Invalid priority filter'),
  
  query('source')
    .optional()
    .isIn(getEnumValues(DEAL_SOURCES))
    .withMessage('Invalid source filter'),
  
  query('type')
    .optional()
    .isIn(getEnumValues(DEAL_TYPES))
    .withMessage('Invalid type filter'),
  
  query('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned user must be a valid ID'),
  
  query('contact')
    .optional()
    .isMongoId()
    .withMessage('Contact must be a valid ID'),
  
  query('minValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum value must be a positive number'),
  
  query('maxValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum value must be a positive number'),
  
  query('expectedCloseDateFrom')
    .optional()
    .isISO8601()
    .withMessage('Expected close date from must be a valid date'),
  
  query('expectedCloseDateTo')
    .optional()
    .isISO8601()
    .withMessage('Expected close date to must be a valid date'),
  
  query('sortBy')
    .optional()
    .isIn(['title', 'value', 'stage', 'expectedCloseDate', 'createdAt', 'lastActivityDate', 'probability'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('tags')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return true; // Single tag
      }
      if (Array.isArray(value)) {
        return value.every(tag => typeof tag === 'string');
      }
      throw new Error('Tags must be a string or array of strings');
    }),
  
  query('overdue')
    .optional()
    .isBoolean()
    .withMessage('Overdue must be a boolean'),
  
  query('includeDeleted')
    .optional()
    .isBoolean()
    .withMessage('Include deleted must be a boolean')
];

const dealIdValidation = [
  param('id').isMongoId().withMessage('Invalid deal ID')
];

const addTagsValidation = [
  body('tags')
    .isArray({ min: 1 })
    .withMessage('Tags must be a non-empty array'),
  body('tags.*')
    .trim()
    .notEmpty()
    .withMessage('Tag cannot be empty')
    .isLength({ max: VALIDATION_LIMITS.TAG_MAX_LENGTH })
    .withMessage(`Tag cannot exceed ${VALIDATION_LIMITS.TAG_MAX_LENGTH} characters`)
];

const removeTagValidation = [
  param('tag').trim().notEmpty().withMessage('Tag is required')
];

module.exports = {
  createDealValidation,
  updateDealValidation,
  listDealsValidation,
  dealIdValidation,
  addTagsValidation,
  removeTagValidation
}; 