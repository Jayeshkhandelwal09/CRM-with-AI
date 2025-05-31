const Interaction = require('../models/Interaction');
const Contact = require('../models/Contact');
const Deal = require('../models/Deal');
const ResponseHelper = require('../utils/responseHelper');
const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');

class InteractionController {
  /**
   * Get all interactions with filtering and pagination
   * @route GET /api/interactions
   */
  static getAllInteractions = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const {
      page = 1,
      limit = 20,
      entityType,
      entityId,
      type,
      direction,
      status,
      outcome,
      priority,
      dateFrom,
      dateTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      tags,
      upcoming,
      overdue
    } = req.query;

    // Build filter query
    const filter = {
      createdBy: req.user.id
    };

    // Entity filters
    if (entityType) {
      filter.entityType = entityType;
    }
    if (entityId) {
      filter.entityId = entityId;
    }

    // Type and direction filters
    if (type) {
      filter.type = type;
    }
    if (direction) {
      filter.direction = direction;
    }

    // Status and outcome filters
    if (status) {
      filter.status = status;
    }
    if (outcome) {
      filter.outcome = outcome;
    }

    // Priority filter
    if (priority) {
      filter.priority = priority;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    // Upcoming interactions filter
    if (upcoming === 'true') {
      filter.scheduledAt = { $gte: new Date() };
      filter.status = 'scheduled';
    }

    // Overdue interactions filter
    if (overdue === 'true') {
      filter.scheduledAt = { $lt: new Date() };
      filter.status = 'scheduled';
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Add text score for search relevance
    if (search) {
      sort.score = { $meta: 'textScore' };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const [interactions, totalCount] = await Promise.all([
      Interaction.find(filter)
        .populate('contact', 'firstName lastName email company.name')
        .populate('createdBy', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Interaction.countDocuments(filter)
    ]);

    // Populate entity details based on entityType
    for (let interaction of interactions) {
      if (interaction.entityType === 'Contact') {
        const contact = await Contact.findById(interaction.entityId)
          .select('firstName lastName email company.name')
          .lean();
        interaction.entity = contact;
      } else if (interaction.entityType === 'Deal') {
        const deal = await Deal.findById(interaction.entityId)
          .select('title value stage contact')
          .populate('contact', 'firstName lastName email')
          .lean();
        interaction.entity = deal;
      }
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    // Calculate summary statistics
    const stats = await Interaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalInteractions: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          scheduledCount: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    const summary = stats[0] || { 
      totalInteractions: 0, 
      completedCount: 0, 
      scheduledCount: 0, 
      avgDuration: 0 
    };

    const responseData = {
      interactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      },
      summary: {
        totalInteractions: summary.totalInteractions,
        completedInteractions: summary.completedCount,
        scheduledInteractions: summary.scheduledCount,
        averageDuration: Math.round(summary.avgDuration || 0)
      },
      filters: {
        entityType,
        entityId,
        type,
        direction,
        status,
        outcome,
        priority,
        search,
        tags,
        upcoming,
        overdue
      }
    };

    ResponseHelper.success(res, responseData, 'Interactions retrieved successfully');
  });

  /**
   * Get a single interaction by ID
   * @route GET /api/interactions/:id
   */
  static getInteractionById = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const interaction = await Interaction.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    })
    .populate('contact', 'firstName lastName email phone company.name')
    .populate('createdBy', 'firstName lastName email');

    if (!interaction) {
      return ResponseHelper.error(res, 'Interaction not found', 404);
    }

    // Populate entity details
    let entity = null;
    if (interaction.entityType === 'Contact') {
      entity = await Contact.findById(interaction.entityId)
        .select('firstName lastName email phone company')
        .lean();
    } else if (interaction.entityType === 'Deal') {
      entity = await Deal.findById(interaction.entityId)
        .select('title value stage expectedCloseDate contact')
        .populate('contact', 'firstName lastName email')
        .lean();
    }

    const responseData = {
      interaction,
      entity
    };

    ResponseHelper.success(res, responseData, 'Interaction retrieved successfully');
  });

  /**
   * Create a new interaction
   * @route POST /api/interactions
   */
  static createInteraction = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    // Verify entity exists and belongs to user
    let entity = null;
    let contact = null;

    if (req.body.entityType === 'Contact') {
      entity = await Contact.findOne({
        _id: req.body.entityId,
        $or: [
          { createdBy: req.user.id },
          { assignedTo: req.user.id }
        ],
        isDeleted: false
      });

      if (!entity) {
        return ResponseHelper.error(res, 'Contact not found or access denied', 404);
      }
      contact = entity._id;

    } else if (req.body.entityType === 'Deal') {
      entity = await Deal.findOne({
        _id: req.body.entityId,
        $or: [
          { createdBy: req.user.id },
          { assignedTo: req.user.id }
        ],
        isDeleted: false
      }).populate('contact');

      if (!entity) {
        return ResponseHelper.error(res, 'Deal not found or access denied', 404);
      }
      contact = entity.contact._id;
    }

    // Create interaction data
    const interactionData = {
      ...req.body,
      contact: contact,
      createdBy: req.user.id
    };

    // Create the interaction
    const interaction = new Interaction(interactionData);
    await interaction.save();

    // Populate the created interaction
    await interaction.populate([
      { path: 'contact', select: 'firstName lastName email company.name' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    ResponseHelper.success(res, { interaction }, 'Interaction created successfully', 201);
  });

  /**
   * Update an interaction
   * @route PUT /api/interactions/:id
   */
  static updateInteraction = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    // Find the interaction
    const interaction = await Interaction.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!interaction) {
      return ResponseHelper.error(res, 'Interaction not found', 404);
    }

    // Validate status transitions
    if (req.body.status && req.body.status !== interaction.status) {
      const validTransitions = {
        'scheduled': ['completed', 'cancelled', 'no_show'],
        'completed': [], // Cannot change from completed
        'cancelled': ['scheduled'], // Can reschedule cancelled
        'no_show': ['scheduled'] // Can reschedule no-show
      };

      const allowedTransitions = validTransitions[interaction.status] || [];
      if (!allowedTransitions.includes(req.body.status)) {
        return ResponseHelper.error(res, `Cannot transition from ${interaction.status} to ${req.body.status}`, 400);
      }
    }

    // Update the interaction
    Object.assign(interaction, req.body);
    await interaction.save();

    // Populate the updated interaction
    await interaction.populate([
      { path: 'contact', select: 'firstName lastName email company.name' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    ResponseHelper.success(res, { interaction }, 'Interaction updated successfully');
  });

  /**
   * Delete an interaction
   * @route DELETE /api/interactions/:id
   */
  static deleteInteraction = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const interaction = await Interaction.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!interaction) {
      return ResponseHelper.error(res, 'Interaction not found', 404);
    }

    // Delete the interaction
    await Interaction.findByIdAndDelete(req.params.id);

    ResponseHelper.success(res, null, 'Interaction deleted successfully');
  });

  /**
   * Add tags to an interaction
   * @route POST /api/interactions/:id/tags
   */
  static addTags = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const interaction = await Interaction.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!interaction) {
      return ResponseHelper.error(res, 'Interaction not found', 404);
    }

    // Add new tags (avoid duplicates)
    const newTags = req.body.tags.filter(tag => !interaction.tags.includes(tag));
    interaction.tags.push(...newTags);
    await interaction.save();

    const responseData = { 
      tags: interaction.tags,
      addedTags: newTags
    };

    ResponseHelper.success(res, responseData, 'Tags added successfully');
  });

  /**
   * Remove a tag from an interaction
   * @route DELETE /api/interactions/:id/tags/:tag
   */
  static removeTag = asyncHandler(async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    const interaction = await Interaction.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!interaction) {
      return ResponseHelper.error(res, 'Interaction not found', 404);
    }

    const tagToRemove = decodeURIComponent(req.params.tag);
    
    if (!interaction.tags.includes(tagToRemove)) {
      return ResponseHelper.error(res, 'Tag not found on interaction', 404);
    }

    interaction.tags = interaction.tags.filter(tag => tag !== tagToRemove);
    await interaction.save();

    const responseData = { 
      tags: interaction.tags,
      removedTag: tagToRemove
    };

    ResponseHelper.success(res, responseData, 'Tag removed successfully');
  });

  /**
   * Get interaction statistics overview
   * @route GET /api/interactions/stats/overview
   */
  static getInteractionStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get basic counts by type
    const typeCounts = await Interaction.aggregate([
      {
        $match: {
          createdBy: userId
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Get status breakdown
    const statusCounts = await Interaction.aggregate([
      {
        $match: {
          createdBy: userId
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get upcoming interactions count
    const upcomingCount = await Interaction.countDocuments({
      createdBy: userId,
      scheduledAt: { $gte: new Date() },
      status: 'scheduled'
    });

    // Get overdue interactions count
    const overdueCount = await Interaction.countDocuments({
      createdBy: userId,
      scheduledAt: { $lt: new Date() },
      status: 'scheduled'
    });

    // Get this week's activity
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thisWeekActivity = await Interaction.countDocuments({
      createdBy: userId,
      createdAt: { $gte: startOfWeek },
      status: 'completed'
    });

    // Get engagement metrics
    const engagementStats = await Interaction.aggregate([
      {
        $match: {
          createdBy: userId,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$outcome',
          count: { $sum: 1 }
        }
      }
    ]);

    const positiveEngagement = engagementStats.find(e => e._id === 'positive')?.count || 0;
    const totalEngagement = engagementStats.reduce((sum, e) => sum + e.count, 0);
    const engagementRate = totalEngagement > 0 ? Math.round((positiveEngagement / totalEngagement) * 100) : 0;

    const responseData = {
      typeBreakdown: typeCounts,
      statusBreakdown: statusCounts,
      summary: {
        upcomingInteractions: upcomingCount,
        overdueInteractions: overdueCount,
        thisWeekActivity: thisWeekActivity,
        engagementRate: engagementRate
      },
      engagement: {
        positive: positiveEngagement,
        total: totalEngagement,
        rate: engagementRate
      }
    };

    ResponseHelper.success(res, responseData, 'Interaction statistics retrieved successfully');
  });
}

module.exports = InteractionController; 