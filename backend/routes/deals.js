const express = require('express');
const DealController = require('../controllers/dealController');
const { authenticate } = require('../middleware/auth');
const ValidationHelper = require('../utils/validationHelper');
const {
  createDealValidation,
  updateDealValidation,
  listDealsValidation,
  dealIdValidation,
  addTagsValidation,
  removeTagValidation
} = require('../validators/dealValidators');

const router = express.Router();

/**
 * Deal Routes
 * Following RESTful API conventions with proper MVC structure
 */

// GET /api/deals/stats/overview - Get deal statistics (MUST come before /:id route)
router.get('/stats/overview', authenticate, DealController.getStatistics);

// GET /api/deals - List deals with advanced filtering and pagination
router.get('/', authenticate, listDealsValidation, ValidationHelper.handleValidationErrors, DealController.getDeals);

// GET /api/deals/:id - Get single deal with full details
router.get('/:id', authenticate, dealIdValidation, ValidationHelper.handleValidationErrors, DealController.getDealById);

// POST /api/deals - Create new deal
router.post('/', authenticate, createDealValidation, ValidationHelper.handleValidationErrors, DealController.createDeal);

// PUT /api/deals/:id - Update deal
router.put('/:id', authenticate, [...dealIdValidation, ...updateDealValidation], ValidationHelper.handleValidationErrors, DealController.updateDeal);

// DELETE /api/deals/:id - Soft delete deal
router.delete('/:id', authenticate, dealIdValidation, ValidationHelper.handleValidationErrors, DealController.deleteDeal);

// POST /api/deals/:id/restore - Restore soft deleted deal
router.post('/:id/restore', authenticate, dealIdValidation, ValidationHelper.handleValidationErrors, DealController.restoreDeal);

// POST /api/deals/:id/tags - Add tags to deal
router.post('/:id/tags', authenticate, [...dealIdValidation, ...addTagsValidation], ValidationHelper.handleValidationErrors, DealController.addTags);

// DELETE /api/deals/:id/tags/:tag - Remove tag from deal
router.delete('/:id/tags/:tag', authenticate, [...dealIdValidation, ...removeTagValidation], ValidationHelper.handleValidationErrors, DealController.removeTag);

module.exports = router; 