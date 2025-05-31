const DealService = require('../services/dealService');
const ResponseHelper = require('../utils/responseHelper');
const ValidationHelper = require('../utils/validationHelper');
const asyncHandler = require('../utils/asyncHandler');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');

/**
 * Deal Controller
 * Handles HTTP requests for deal-related operations
 */
class DealController {
  /**
   * Get deal statistics
   * GET /api/deals/stats/overview
   */
  static getStatistics(req, res, next) {
    return asyncHandler(async (req, res) => {
      const statistics = await DealService.getDealStatistics(req.user.id);
      return ResponseHelper.success(res, statistics, 'Deal statistics retrieved successfully');
    })(req, res, next);
  }

  /**
   * Get deals with filtering and pagination
   * GET /api/deals
   */
  static getDeals(req, res, next) {
    return asyncHandler(async (req, res) => {
      // Extract and sanitize query parameters
      const pagination = ValidationHelper.sanitizePagination(req.query);
      const sort = ValidationHelper.buildSortObject(req.query.sortBy, req.query.sortOrder);
      
      const filters = {
        search: req.query.search,
        stage: req.query.stage,
        priority: req.query.priority,
        source: req.query.source,
        type: req.query.type,
        assignedTo: req.query.assignedTo,
        contact: req.query.contact,
        minValue: req.query.minValue,
        maxValue: req.query.maxValue,
        expectedCloseDateFrom: req.query.expectedCloseDateFrom,
        expectedCloseDateTo: req.query.expectedCloseDateTo,
        tags: req.query.tags,
        overdue: req.query.overdue,
        includeDeleted: req.query.includeDeleted === 'true'
      };

      const result = await DealService.getDeals(req.user.id, filters, pagination, sort);
      
      return ResponseHelper.paginated(
        res,
        result.deals,
        result.pagination,
        result.summary,
        filters,
        SUCCESS_MESSAGES.RETRIEVED
      );
    })(req, res, next);
  }

  /**
   * Get single deal by ID
   * GET /api/deals/:id
   */
  static getDealById(req, res, next) {
    return asyncHandler(async (req, res) => {
      const result = await DealService.getDealById(req.params.id, req.user.id);
      return ResponseHelper.success(res, result, 'Deal retrieved successfully');
    })(req, res, next);
  }

  /**
   * Create new deal
   * POST /api/deals
   */
  static createDeal(req, res, next) {
    return asyncHandler(async (req, res) => {
      const deal = await DealService.createDeal(req.body, req.user.id);
      return ResponseHelper.success(res, { deal }, 'Deal created successfully', 201);
    })(req, res, next);
  }

  /**
   * Update deal
   * PUT /api/deals/:id
   */
  static updateDeal(req, res, next) {
    return asyncHandler(async (req, res) => {
      const deal = await DealService.updateDeal(req.params.id, req.body, req.user.id);
      return ResponseHelper.success(res, { deal }, SUCCESS_MESSAGES.UPDATED);
    })(req, res, next);
  }

  /**
   * Delete deal (soft delete)
   * DELETE /api/deals/:id
   */
  static deleteDeal(req, res, next) {
    return asyncHandler(async (req, res) => {
      await DealService.deleteDeal(req.params.id, req.user.id);
      return ResponseHelper.success(res, null, SUCCESS_MESSAGES.DELETED);
    })(req, res, next);
  }

  /**
   * Restore deleted deal
   * POST /api/deals/:id/restore
   */
  static restoreDeal(req, res, next) {
    return asyncHandler(async (req, res) => {
      const deal = await DealService.restoreDeal(req.params.id, req.user.id);
      return ResponseHelper.success(res, { deal }, SUCCESS_MESSAGES.RESTORED);
    })(req, res, next);
  }

  /**
   * Add tags to deal
   * POST /api/deals/:id/tags
   */
  static addTags(req, res, next) {
    return asyncHandler(async (req, res) => {
      const result = await DealService.addTagsToDeal(req.params.id, req.body.tags, req.user.id);
      return ResponseHelper.success(res, result, SUCCESS_MESSAGES.TAGS_ADDED);
    })(req, res, next);
  }

  /**
   * Remove tag from deal
   * DELETE /api/deals/:id/tags/:tag
   */
  static removeTag(req, res, next) {
    return asyncHandler(async (req, res) => {
      const tag = decodeURIComponent(req.params.tag);
      const result = await DealService.removeTagFromDeal(req.params.id, tag, req.user.id);
      return ResponseHelper.success(res, result, SUCCESS_MESSAGES.TAG_REMOVED);
    })(req, res, next);
  }
}

module.exports = DealController; 