const { body, query, param } = require('express-validator');

// Create interaction validation rules
const createInteractionValidation = [
  body('entityType')
    .isIn(['Contact', 'Deal'])
    .withMessage('Entity type must be either Contact or Deal'),
  
  body('entityId')
    .isMongoId()
    .withMessage('Entity ID must be a valid MongoDB ID'),
  
  body('type')
    .isIn([
      'email', 'phone_call', 'meeting', 'linkedin_message', 
      'text_message', 'video_call', 'in_person', 'proposal_sent', 
      'contract_sent', 'demo', 'follow_up', 'other'
    ])
    .withMessage('Invalid interaction type'),
  
  body('direction')
    .isIn(['inbound', 'outbound'])
    .withMessage('Direction must be either inbound or outbound'),
  
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 5000 })
    .withMessage('Content cannot exceed 5000 characters'),
  
  body('outcome')
    .optional()
    .isIn([
      'positive', 'neutral', 'negative', 'interested', 'not_interested',
      'needs_follow_up', 'objection_raised', 'meeting_scheduled', 
      'proposal_requested', 'deal_advanced', 'deal_stalled'
    ])
    .withMessage('Invalid outcome'),
  
  body('status')
    .optional()
    .isIn(['completed', 'scheduled', 'cancelled', 'no_response'])
    .withMessage('Invalid status'),
  
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date'),
  
  body('completedAt')
    .optional()
    .isISO8601()
    .withMessage('Completed date must be a valid date'),
  
  body('duration')
    .optional()
    .isInt({ min: 0, max: 1440 })
    .withMessage('Duration must be between 0 and 1440 minutes'),
  
  body('contact')
    .optional()
    .isMongoId()
    .withMessage('Contact must be a valid ID'),
  
  body('nextSteps')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Next steps cannot exceed 1000 characters'),
  
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Follow-up date must be a valid date'),
  
  body('engagementLevel')
    .optional()
    .isIn(['very_high', 'high', 'medium', 'low', 'very_low'])
    .withMessage('Invalid engagement level'),
  
  body('sentiment')
    .optional()
    .isIn(['very_positive', 'positive', 'neutral', 'negative', 'very_negative'])
    .withMessage('Invalid sentiment'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters'),
  
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  
  body('aiAnalysis.keyTopics')
    .optional()
    .isArray()
    .withMessage('AI key topics must be an array'),
  
  body('aiAnalysis.emotionalTone')
    .optional()
    .isIn(['enthusiastic', 'professional', 'concerned', 'frustrated', 'excited', 'neutral'])
    .withMessage('Invalid emotional tone'),
  
  body('aiAnalysis.actionItems')
    .optional()
    .isArray()
    .withMessage('AI action items must be an array'),
  
  body('aiAnalysis.riskIndicators')
    .optional()
    .isArray()
    .withMessage('AI risk indicators must be an array'),
  
  body('aiAnalysis.opportunitySignals')
    .optional()
    .isArray()
    .withMessage('AI opportunity signals must be an array')
];

// Update interaction validation rules
const updateInteractionValidation = [
  body('type')
    .optional()
    .isIn([
      'email', 'phone_call', 'meeting', 'linkedin_message', 
      'text_message', 'video_call', 'in_person', 'proposal_sent', 
      'contract_sent', 'demo', 'follow_up', 'other'
    ])
    .withMessage('Invalid interaction type'),
  
  body('direction')
    .optional()
    .isIn(['inbound', 'outbound'])
    .withMessage('Direction must be either inbound or outbound'),
  
  body('subject')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Content cannot exceed 5000 characters'),
  
  body('outcome')
    .optional()
    .isIn([
      'positive', 'neutral', 'negative', 'interested', 'not_interested',
      'needs_follow_up', 'objection_raised', 'meeting_scheduled', 
      'proposal_requested', 'deal_advanced', 'deal_stalled'
    ])
    .withMessage('Invalid outcome'),
  
  body('status')
    .optional()
    .isIn(['completed', 'scheduled', 'cancelled', 'no_response'])
    .withMessage('Invalid status'),
  
  body('scheduledAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled date must be a valid date'),
  
  body('completedAt')
    .optional()
    .isISO8601()
    .withMessage('Completed date must be a valid date'),
  
  body('duration')
    .optional()
    .isInt({ min: 0, max: 1440 })
    .withMessage('Duration must be between 0 and 1440 minutes'),
  
  body('contact')
    .optional()
    .isMongoId()
    .withMessage('Contact must be a valid ID'),
  
  body('nextSteps')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Next steps cannot exceed 1000 characters'),
  
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Follow-up date must be a valid date'),
  
  body('engagementLevel')
    .optional()
    .isIn(['very_high', 'high', 'medium', 'low', 'very_low'])
    .withMessage('Invalid engagement level'),
  
  body('sentiment')
    .optional()
    .isIn(['very_positive', 'positive', 'neutral', 'negative', 'very_negative'])
    .withMessage('Invalid sentiment'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters')
];

// List interactions validation rules
const listInteractionsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('entityType')
    .optional()
    .isIn(['Contact', 'Deal'])
    .withMessage('Entity type must be either Contact or Deal'),
  
  query('entityId')
    .optional()
    .isMongoId()
    .withMessage('Entity ID must be a valid MongoDB ID'),
  
  query('type')
    .optional()
    .isIn([
      'email', 'phone_call', 'meeting', 'linkedin_message', 
      'text_message', 'video_call', 'in_person', 'proposal_sent', 
      'contract_sent', 'demo', 'follow_up', 'other'
    ])
    .withMessage('Invalid interaction type'),
  
  query('direction')
    .optional()
    .isIn(['inbound', 'outbound'])
    .withMessage('Direction must be either inbound or outbound'),
  
  query('status')
    .optional()
    .isIn(['completed', 'scheduled', 'cancelled', 'no_response'])
    .withMessage('Invalid status'),
  
  query('outcome')
    .optional()
    .isIn([
      'positive', 'neutral', 'negative', 'interested', 'not_interested',
      'needs_follow_up', 'objection_raised', 'meeting_scheduled', 
      'proposal_requested', 'deal_advanced', 'deal_stalled'
    ])
    .withMessage('Outcome must be positive, neutral, or negative'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
  
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'scheduledAt', 'completedAt', 'subject', 'type', 'priority'])
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
  
  query('upcoming')
    .optional()
    .isBoolean()
    .withMessage('Upcoming must be a boolean'),
  
  query('overdue')
    .optional()
    .isBoolean()
    .withMessage('Overdue must be a boolean')
];

// Interaction ID validation
const interactionIdValidation = [
  param('id').isMongoId().withMessage('Invalid interaction ID')
];

// Add tags validation
const addTagsValidation = [
  param('id').isMongoId().withMessage('Invalid interaction ID'),
  body('tags')
    .isArray({ min: 1 })
    .withMessage('Tags must be a non-empty array'),
  body('tags.*')
    .trim()
    .notEmpty()
    .withMessage('Tag cannot be empty')
    .isLength({ max: 30 })
    .withMessage('Tag cannot exceed 30 characters')
];

// Remove tag validation
const removeTagValidation = [
  param('id').isMongoId().withMessage('Invalid interaction ID'),
  param('tag').trim().notEmpty().withMessage('Tag is required')
];

module.exports = {
  createInteractionValidation,
  updateInteractionValidation,
  listInteractionsValidation,
  interactionIdValidation,
  addTagsValidation,
  removeTagValidation
}; 