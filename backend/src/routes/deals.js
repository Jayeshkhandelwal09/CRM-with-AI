const express = require('express');
const router = express.Router();

// Import middleware
const { verifyToken } = require('../middleware/auth');
const { apiLimiter, dealLimiter } = require('../middleware/rateLimiter');

// Import controller
const {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal,
  getPipelineOverview,
  getDealTimeline,
  addDealNote,
  getDealNotes,
  updateDealNote,
  deleteDealNote
} = require('../controllers/dealController');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Apply rate limiting to all deal routes
router.use(apiLimiter);

/**
 * @route   GET /api/deals/pipeline/overview
 * @desc    Get deal pipeline overview with metrics
 * @access  Private
 * @params  pipeline (optional)
 */
router.get('/pipeline/overview', getPipelineOverview);

/**
 * @route   GET /api/deals
 * @desc    Get all deals with filtering, pagination, and search
 * @access  Private
 * @params  page, limit, stage, pipeline, priority, source, dealType, isActive, isClosed, search, sortBy, sortOrder, minValue, maxValue, expectedCloseDateFrom, expectedCloseDateTo
 */
router.get('/', getDeals);

/**
 * @route   GET /api/deals/:id
 * @desc    Get single deal by ID
 * @access  Private
 */
router.get('/:id', getDealById);

/**
 * @route   GET /api/deals/:id/timeline
 * @desc    Get deal activity timeline with interactions and stage changes
 * @access  Private
 * @params  page, limit, type, startDate, endDate
 */
router.get('/:id/timeline', getDealTimeline);

/**
 * @route   GET /api/deals/:id/notes
 * @desc    Get deal notes
 * @access  Private
 * @params  page, limit, type
 */
router.get('/:id/notes', getDealNotes);

/**
 * @route   POST /api/deals
 * @desc    Create new deal
 * @access  Private
 * @body    title, description, value, currency, stage, pipeline, probability, contact, company, source, dealType, priority, expectedCloseDate, nextFollowUpDate
 */
router.post('/', dealLimiter, createDeal);

/**
 * @route   PUT /api/deals/:id
 * @desc    Update deal
 * @access  Private
 * @body    Any deal fields except owner, createdAt, stageHistory
 */
router.put('/:id', updateDeal);

/**
 * @route   PATCH /api/deals/:id/stage
 * @desc    Update deal stage with automatic status handling
 * @access  Private
 * @body    stage, closeReason (optional), lostReason (optional)
 */
router.patch('/:id/stage', updateDealStage);

/**
 * @route   DELETE /api/deals/:id
 * @desc    Delete deal
 * @access  Private
 */
router.delete('/:id', deleteDeal);

/**
 * @route   POST /api/deals/:id/notes
 * @desc    Add note to deal
 * @access  Private
 * @body    subject, notes, type (optional), priority (optional)
 */
router.post('/:id/notes', addDealNote);

/**
 * @route   PUT /api/deals/:id/notes/:noteId
 * @desc    Update deal note
 * @access  Private
 * @body    subject (optional), notes (optional), priority (optional)
 */
router.put('/:id/notes/:noteId', updateDealNote);

/**
 * @route   DELETE /api/deals/:id/notes/:noteId
 * @desc    Delete deal note
 * @access  Private
 */
router.delete('/:id/notes/:noteId', deleteDealNote);

module.exports = router; 