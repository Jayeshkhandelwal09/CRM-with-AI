const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const aiController = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

const router = express.Router();

/**
 * AI-specific rate limiting
 * More restrictive than general API rate limiting
 */
const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // 200 requests per hour per IP (increased from 50)
  message: {
    success: false,
    message: 'Too many AI requests. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Validation middleware for AI requests
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * AI request logging middleware
 */
const logAIRequest = (feature) => {
  return (req, res, next) => {
    req.aiFeature = feature;
    req.aiStartTime = Date.now();
    console.log(`🤖 AI Request: ${feature} by user ${req.user?.id} at ${new Date().toISOString()}`);
    next();
  };
};

// Apply authentication and rate limiting to all AI routes
router.use(verifyToken);
router.use(aiRateLimit);

/**
 * Deal Coach Endpoint
 * GET /api/ai/deals/:id/coach
 * 
 * Provides AI-powered coaching suggestions for a specific deal
 */
router.get('/deals/:id/coach',
  param('id').isMongoId().withMessage('Invalid deal ID'),
  handleValidationErrors,
  logAIRequest('deal_coach'),
  (req, res) => aiController.getDealCoach(req, res)
);

/**
 * Objection Handler Endpoint
 * POST /api/ai/objections/handle
 * 
 * Generates AI responses to customer objections
 */
router.post('/objections/handle',
  [
    body('objectionText')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Objection text must be between 10 and 1000 characters'),
    body('dealId')
      .optional()
      .isMongoId()
      .withMessage('Invalid deal ID'),
    body('category')
      .optional()
      .isIn(['price', 'product', 'timing', 'authority', 'need', 'trust', 'competition', 'other'])
      .withMessage('Invalid objection category'),
    body('severity')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid severity level')
  ],
  handleValidationErrors,
  logAIRequest('objection_handler'),
  (req, res) => aiController.handleObjection(req, res)
);

/**
 * Customer Persona Builder Endpoint
 * GET /api/ai/contacts/:id/persona
 * 
 * Generates AI-powered customer persona analysis
 */
router.get('/contacts/:id/persona',
  param('id').isMongoId().withMessage('Invalid contact ID'),
  handleValidationErrors,
  logAIRequest('persona_builder'),
  (req, res) => aiController.getCustomerPersona(req, res)
);

/**
 * Win/Loss Explainer Endpoint
 * GET /api/ai/deals/:id/explain
 * 
 * Provides AI analysis of why a deal was won or lost
 */
router.get('/deals/:id/explain',
  param('id').isMongoId().withMessage('Invalid deal ID'),
  handleValidationErrors,
  logAIRequest('win_loss_explainer'),
  (req, res) => aiController.explainWinLoss(req, res)
);

/**
 * AI Feedback Endpoint
 * POST /api/ai/feedback
 * 
 * Collects user feedback on AI responses for improvement
 */
router.post('/feedback',
  [
    body('feature')
      .isIn(['deal_coach', 'objection_handler', 'persona_builder', 'win_loss_explainer'])
      .withMessage('Invalid feature name'),
    body('feedback')
      .isIn(['positive', 'negative'])
      .withMessage('Feedback must be positive or negative'),
    body('responseId')
      .optional()
      .isString()
      .withMessage('Response ID must be a string'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comments')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Comments must be under 500 characters')
  ],
  handleValidationErrors,
  logAIRequest('feedback'),
  (req, res) => aiController.submitFeedback(req, res)
);

/**
 * AI Usage Analytics Endpoint
 * GET /api/ai/analytics
 * 
 * Provides analytics on AI usage for the current user
 */
router.get('/analytics',
  logAIRequest('analytics'),
  (req, res) => aiController.getAnalytics(req, res)
);

/**
 * AI Health Check Endpoint
 * GET /api/ai/health
 * 
 * Checks the health of AI services
 */
router.get('/health', async (req, res) => {
  try {
    await aiController.initialize();
    
    const health = await aiController.aiService.healthCheck();
    
    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error('AI Health Check error:', error);
    res.status(500).json({
      success: false,
      message: 'AI services health check failed',
      error: error.message
    });
  }
});

/**
 * Test Data Creation Endpoint (Development only)
 * POST /api/ai/test-data
 * 
 * Creates sample AI logs for testing analytics
 */
router.post('/test-data',
  logAIRequest('test_data'),
  (req, res) => aiController.createTestData(req, res)
);

module.exports = router; 