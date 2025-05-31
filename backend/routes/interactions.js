const express = require('express');
const InteractionController = require('../controllers/interactionController');
const { authenticate } = require('../middleware/auth');
const {
  createInteractionValidation,
  updateInteractionValidation,
  listInteractionsValidation,
  interactionIdValidation,
  addTagsValidation,
  removeTagValidation
} = require('../validators/interactionValidators');

const router = express.Router();

// @route   GET /api/interactions/stats/overview
// @desc    Get interaction statistics
// @access  Private
router.get('/stats/overview', authenticate, InteractionController.getInteractionStats);

// @route   GET /api/interactions
// @desc    List interactions with filtering and pagination
// @access  Private
router.get('/', authenticate, listInteractionsValidation, InteractionController.getAllInteractions);

// @route   GET /api/interactions/:id
// @desc    Get single interaction
// @access  Private
router.get('/:id', authenticate, interactionIdValidation, InteractionController.getInteractionById);

// @route   POST /api/interactions
// @desc    Create new interaction
// @access  Private
router.post('/', authenticate, createInteractionValidation, InteractionController.createInteraction);

// @route   PUT /api/interactions/:id
// @desc    Update interaction
// @access  Private
router.put('/:id', authenticate, interactionIdValidation, updateInteractionValidation, InteractionController.updateInteraction);

// @route   DELETE /api/interactions/:id
// @desc    Delete interaction
// @access  Private
router.delete('/:id', authenticate, interactionIdValidation, InteractionController.deleteInteraction);

// @route   POST /api/interactions/:id/tags
// @desc    Add tags to interaction
// @access  Private
router.post('/:id/tags', authenticate, addTagsValidation, InteractionController.addTags);

// @route   DELETE /api/interactions/:id/tags/:tag
// @desc    Remove tag from interaction
// @access  Private
router.delete('/:id/tags/:tag', authenticate, removeTagValidation, InteractionController.removeTag);

module.exports = router; 