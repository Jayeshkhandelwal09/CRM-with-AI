const Deal = require('../models/Deal');
const Contact = require('../models/Contact');
const ValidationHelper = require('../utils/validationHelper');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * Deal Service
 * Handles all business logic related to deals
 */
class DealService {
  /**
   * Get deal statistics for a user
   * @param {string} userId - User ID
   * @returns {Object} Deal statistics
   */
  static async getDealStatistics(userId) {
    const userFilter = ValidationHelper.buildUserAccessFilter(userId);

    // Parallel execution of all statistics queries for better performance
    const [stageCounts, overdueCount, thisMonthDeals, recentClosedDeals, avgDealSize] = await Promise.all([
      // Get basic counts by stage
      Deal.aggregate([
        {
          $match: {
            ...userFilter,
            isDeleted: false
          }
        },
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 },
            totalValue: { $sum: '$value' },
            avgValue: { $avg: '$value' }
          }
        }
      ]),

      // Get overdue deals count
      Deal.countDocuments({
        ...userFilter,
        expectedCloseDate: { $lt: new Date() },
        stage: { $nin: ['closed_won', 'closed_lost'] },
        isDeleted: false
      }),

      // Get deals closing this month
      (() => {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);
        endOfMonth.setDate(0);
        endOfMonth.setHours(23, 59, 59, 999);

        return Deal.countDocuments({
          ...userFilter,
          expectedCloseDate: {
            $gte: startOfMonth,
            $lte: endOfMonth
          },
          stage: { $nin: ['closed_won', 'closed_lost'] },
          isDeleted: false
        });
      })(),

      // Get win rate (last 30 days)
      (() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return Deal.aggregate([
          {
            $match: {
              ...userFilter,
              actualCloseDate: { $gte: thirtyDaysAgo },
              stage: { $in: ['closed_won', 'closed_lost'] },
              isDeleted: false
            }
          },
          {
            $group: {
              _id: '$stage',
              count: { $sum: 1 }
            }
          }
        ]);
      })(),

      // Get average deal size
      Deal.aggregate([
        {
          $match: {
            ...userFilter,
            isDeleted: false
          }
        },
        {
          $group: {
            _id: null,
            avgValue: { $avg: '$value' },
            totalValue: { $sum: '$value' },
            totalDeals: { $sum: 1 }
          }
        }
      ])
    ]);

    const wonDeals = recentClosedDeals.find(d => d._id === 'closed_won')?.count || 0;
    const lostDeals = recentClosedDeals.find(d => d._id === 'closed_lost')?.count || 0;
    const totalClosed = wonDeals + lostDeals;
    const winRate = totalClosed > 0 ? Math.round((wonDeals / totalClosed) * 100) : 0;

    const stats = avgDealSize[0] || { avgValue: 0, totalValue: 0, totalDeals: 0 };

    return {
      stageBreakdown: stageCounts,
      summary: {
        totalDeals: stats.totalDeals,
        totalValue: stats.totalValue,
        averageDealSize: Math.round(stats.avgValue || 0),
        overdueDeals: overdueCount,
        dealsClosingThisMonth: thisMonthDeals,
        winRate: winRate
      },
      performance: {
        wonDeals,
        lostDeals,
        totalClosed,
        winRate
      }
    };
  }

  /**
   * Get deals with filtering and pagination
   * @param {string} userId - User ID
   * @param {Object} filters - Filter parameters
   * @param {Object} pagination - Pagination parameters
   * @param {Object} sort - Sort parameters
   * @returns {Object} Paginated deals with metadata
   */
  static async getDeals(userId, filters, pagination, sort) {
    const userFilter = ValidationHelper.buildUserAccessFilter(userId);
    
    // Build comprehensive filter
    const filter = {
      ...userFilter,
      ...(!filters.includeDeleted && { isDeleted: false }),
      ...(filters.stage && { stage: filters.stage }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.source && { source: filters.source }),
      ...(filters.type && { type: filters.type }),
      ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
      ...(filters.contact && { contact: filters.contact }),
      ...ValidationHelper.buildTextSearchFilter(filters.search),
      ...ValidationHelper.buildTagsFilter(filters.tags)
    };

    // Value range filter
    if (filters.minValue || filters.maxValue) {
      filter.value = {};
      if (filters.minValue) filter.value.$gte = parseFloat(filters.minValue);
      if (filters.maxValue) filter.value.$lte = parseFloat(filters.maxValue);
    }

    // Expected close date range filter
    if (filters.expectedCloseDateFrom || filters.expectedCloseDateTo) {
      Object.assign(filter, ValidationHelper.buildDateRangeFilter(
        filters.expectedCloseDateFrom,
        filters.expectedCloseDateTo,
        'expectedCloseDate'
      ));
    }

    // Overdue filter
    if (filters.overdue === 'true') {
      filter.expectedCloseDate = { $lt: new Date() };
      filter.stage = { $nin: ['closed_won', 'closed_lost'] };
    }

    // Execute query with population - using parallel execution
    const [deals, totalCount] = await Promise.all([
      Deal.find(filter)
        .populate('contact', 'firstName lastName email company.name')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Deal.countDocuments(filter)
    ]);

    // Calculate summary statistics
    const stats = await Deal.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$value' },
          avgValue: { $avg: '$value' },
          totalDeals: { $sum: 1 }
        }
      }
    ]);

    const summary = stats[0] || { totalValue: 0, avgValue: 0, totalDeals: 0 };

    return {
      deals,
      pagination: ValidationHelper.calculatePaginationMetadata(totalCount, pagination.page, pagination.limit),
      summary: {
        totalValue: summary.totalValue,
        averageValue: Math.round(summary.avgValue || 0),
        totalDeals: summary.totalDeals
      }
    };
  }

  /**
   * Get single deal by ID
   * @param {string} dealId - Deal ID
   * @param {string} userId - User ID
   * @returns {Object} Deal with metadata
   */
  static async getDealById(dealId, userId) {
    const deal = await Deal.findOne({
      _id: dealId,
      ...ValidationHelper.buildUserAccessFilter(userId)
    })
    .populate('contact', 'firstName lastName email phone company.name company.industry')
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate({
      path: 'objections',
      populate: {
        path: 'createdBy',
        select: 'firstName lastName'
      }
    });

    if (!deal) {
      throw new Error(ERROR_MESSAGES.DEAL_NOT_FOUND);
    }

    if (deal.isDeleted) {
      throw new Error(ERROR_MESSAGES.ALREADY_DELETED);
    }

    // Get related interactions count and deal stage statistics in parallel
    const [interactionCount, stageStats] = await Promise.all([
      this.getInteractionCount(deal._id),
      this.getDealStageStats(deal.contact._id, userId)
    ]);

    return {
      deal,
      metadata: {
        interactionCount,
        stageStats,
        isOverdue: deal.isOverdue,
        daysInCurrentStage: deal.daysInCurrentStage,
        totalDealDuration: deal.totalDealDuration,
        isActive: deal.isActive
      }
    };
  }

  /**
   * Create a new deal
   * @param {Object} dealData - Deal data
   * @param {string} userId - User ID
   * @returns {Object} Created deal
   */
  static async createDeal(dealData, userId) {
    // Verify contact exists and belongs to user
    const contact = await Contact.findOne({
      _id: dealData.contact,
      ...ValidationHelper.buildUserAccessFilter(userId),
      isDeleted: false
    });

    if (!contact) {
      throw new Error(ERROR_MESSAGES.CONTACT_NOT_FOUND);
    }

    // Check for duplicate deals with same contact and title
    const existingDeal = await Deal.findOne({
      contact: dealData.contact,
      title: dealData.title,
      ...ValidationHelper.buildUserAccessFilter(userId),
      stage: { $nin: ['closed_won', 'closed_lost'] },
      isDeleted: false
    });

    if (existingDeal) {
      throw new Error(ERROR_MESSAGES.DUPLICATE_DEAL);
    }

    // Create deal data
    const newDealData = {
      ...dealData,
      createdBy: userId,
      assignedTo: dealData.assignedTo || userId
    };

    // Create and save the deal
    const deal = new Deal(newDealData);
    await deal.save();

    // Populate the created deal
    await deal.populate([
      { path: 'contact', select: 'firstName lastName email company.name' },
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    return deal;
  }

  /**
   * Update a deal
   * @param {string} dealId - Deal ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID
   * @returns {Object} Updated deal
   */
  static async updateDeal(dealId, updateData, userId) {
    // Find the deal
    const deal = await Deal.findOne({
      _id: dealId,
      ...ValidationHelper.buildUserAccessFilter(userId)
    });

    if (!deal) {
      throw new Error(ERROR_MESSAGES.DEAL_NOT_FOUND);
    }

    if (deal.isDeleted) {
      throw new Error(ERROR_MESSAGES.CANNOT_UPDATE_DELETED);
    }

    // Validate stage transition if stage is being updated
    if (updateData.stage && updateData.stage !== deal.stage) {
      if (!ValidationHelper.validateStageTransition(deal.stage, updateData.stage)) {
        throw new Error(`Cannot transition from ${deal.stage} to ${updateData.stage}`);
      }
    }

    // Verify contact exists if being updated
    if (updateData.contact && updateData.contact !== deal.contact.toString()) {
      const contact = await Contact.findOne({
        _id: updateData.contact,
        ...ValidationHelper.buildUserAccessFilter(userId),
        isDeleted: false
      });

      if (!contact) {
        throw new Error(ERROR_MESSAGES.CONTACT_NOT_FOUND);
      }

      // Check for duplicate deals with new contact and title
      const titleToCheck = updateData.title || deal.title;
      const existingDeal = await Deal.findOne({
        _id: { $ne: deal._id },
        contact: updateData.contact,
        title: titleToCheck,
        ...ValidationHelper.buildUserAccessFilter(userId),
        stage: { $nin: ['closed_won', 'closed_lost'] },
        isDeleted: false
      });

      if (existingDeal) {
        throw new Error(ERROR_MESSAGES.DUPLICATE_DEAL);
      }
    }

    // Update the deal
    Object.assign(deal, updateData);
    await deal.save();

    // Populate the updated deal
    await deal.populate([
      { path: 'contact', select: 'firstName lastName email company.name' },
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    return deal;
  }

  /**
   * Soft delete a deal
   * @param {string} dealId - Deal ID
   * @param {string} userId - User ID
   */
  static async deleteDeal(dealId, userId) {
    const deal = await Deal.findOne({
      _id: dealId,
      ...ValidationHelper.buildUserAccessFilter(userId)
    });

    if (!deal) {
      throw new Error(ERROR_MESSAGES.DEAL_NOT_FOUND);
    }

    if (deal.isDeleted) {
      throw new Error(ERROR_MESSAGES.ALREADY_DELETED);
    }

    await deal.softDelete(userId);
  }

  /**
   * Restore a soft deleted deal
   * @param {string} dealId - Deal ID
   * @param {string} userId - User ID
   * @returns {Object} Restored deal
   */
  static async restoreDeal(dealId, userId) {
    const deal = await Deal.findOne({
      _id: dealId,
      ...ValidationHelper.buildUserAccessFilter(userId)
    });

    if (!deal) {
      throw new Error(ERROR_MESSAGES.DEAL_NOT_FOUND);
    }

    if (!deal.isDeleted) {
      throw new Error(ERROR_MESSAGES.NOT_DELETED);
    }

    await deal.restore();

    // Populate the restored deal
    await deal.populate([
      { path: 'contact', select: 'firstName lastName email company.name' },
      { path: 'assignedTo', select: 'firstName lastName email' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    return deal;
  }

  /**
   * Add tags to a deal
   * @param {string} dealId - Deal ID
   * @param {Array} tags - Tags to add
   * @param {string} userId - User ID
   * @returns {Object} Updated tags and added tags
   */
  static async addTagsToDeal(dealId, tags, userId) {
    const deal = await Deal.findOne({
      _id: dealId,
      ...ValidationHelper.buildUserAccessFilter(userId),
      isDeleted: false
    });

    if (!deal) {
      throw new Error(ERROR_MESSAGES.DEAL_NOT_FOUND);
    }

    // Add new tags (avoid duplicates)
    const newTags = tags.filter(tag => !deal.tags.includes(tag));
    deal.tags.push(...newTags);
    await deal.save();

    return {
      tags: deal.tags,
      addedTags: newTags
    };
  }

  /**
   * Remove a tag from a deal
   * @param {string} dealId - Deal ID
   * @param {string} tag - Tag to remove
   * @param {string} userId - User ID
   * @returns {Object} Updated tags and removed tag
   */
  static async removeTagFromDeal(dealId, tag, userId) {
    const deal = await Deal.findOne({
      _id: dealId,
      ...ValidationHelper.buildUserAccessFilter(userId),
      isDeleted: false
    });

    if (!deal) {
      throw new Error(ERROR_MESSAGES.DEAL_NOT_FOUND);
    }

    if (!deal.tags.includes(tag)) {
      throw new Error(ERROR_MESSAGES.TAG_NOT_FOUND);
    }

    await deal.removeTag(tag);

    return {
      tags: deal.tags,
      removedTag: tag
    };
  }

  /**
   * Get interaction count for a deal (helper method)
   * @param {string} dealId - Deal ID
   * @returns {number} Interaction count
   */
  static async getInteractionCount(dealId) {
    try {
      const Interaction = require('../models/Interaction');
      return await Interaction.countDocuments({
        entityType: 'Deal',
        entityId: dealId
      });
    } catch (error) {
      console.warn('Could not load Interaction model:', error.message);
      return 0;
    }
  }

  /**
   * Get deal stage statistics for a contact (helper method)
   * @param {string} contactId - Contact ID
   * @param {string} userId - User ID
   * @returns {Array} Stage statistics
   */
  static async getDealStageStats(contactId, userId) {
    return await Deal.aggregate([
      {
        $match: {
          contact: contactId,
          ...ValidationHelper.buildUserAccessFilter(userId),
          isDeleted: false
        }
      },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' }
        }
      }
    ]);
  }
}

module.exports = DealService; 