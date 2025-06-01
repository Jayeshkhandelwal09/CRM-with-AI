const Deal = require('../models/Deal');
const Contact = require('../models/Contact');
const User = require('../models/User');
const Interaction = require('../models/Interaction');
const logger = require('../utils/logger');

/**
 * Get all deals with filtering, pagination, and search
 * GET /api/deals
 */
const getDeals = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      stage,
      pipeline,
      priority,
      source,
      dealType,
      isActive,
      isClosed,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minValue,
      maxValue,
      expectedCloseDateFrom,
      expectedCloseDateTo
    } = req.query;

    // Build query
    const query = { owner: userId };

    // Add filters
    if (stage) {
      if (Array.isArray(stage)) {
        query.stage = { $in: stage };
      } else {
        query.stage = stage;
      }
    }

    if (pipeline) query.pipeline = pipeline;
    if (priority) query.priority = priority;
    if (source) query.source = source;
    if (dealType) query.dealType = dealType;
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (isClosed !== undefined) {
      query.isClosed = isClosed === 'true';
    }

    // Value range filter
    if (minValue || maxValue) {
      query.value = {};
      if (minValue) query.value.$gte = parseFloat(minValue);
      if (maxValue) query.value.$lte = parseFloat(maxValue);
    }

    // Expected close date range filter
    if (expectedCloseDateFrom || expectedCloseDateTo) {
      query.expectedCloseDate = {};
      if (expectedCloseDateFrom) {
        query.expectedCloseDate.$gte = new Date(expectedCloseDateFrom);
      }
      if (expectedCloseDateTo) {
        query.expectedCloseDate.$lte = new Date(expectedCloseDateTo);
      }
    }

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { company: searchRegex },
        { closeReason: searchRegex }
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population
    const deals = await Deal.find(query)
      .populate('contact', 'firstName lastName email company')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalDeals = await Deal.countDocuments(query);
    const totalPages = Math.ceil(totalDeals / limitNum);

    logger.info(`Retrieved ${deals.length} deals for user ${userId}`, {
      userId,
      totalDeals,
      filters: { stage, pipeline, priority, search }
    });

    res.status(200).json({
      success: true,
      data: {
        deals,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDeals,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    logger.error('Error retrieving deals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve deals'
    });
  }
};

/**
 * Get single deal by ID
 * GET /api/deals/:id
 */
const getDealById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deal = await Deal.findOne({ _id: id, owner: userId })
      .populate('contact', 'firstName lastName email phone company jobTitle')
      .lean();

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    logger.info(`Retrieved deal ${id} for user ${userId}`, {
      userId,
      dealId: id,
      dealTitle: deal.title
    });

    res.status(200).json({
      success: true,
      data: { deal }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid deal ID'
      });
    }

    logger.error('Error retrieving deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve deal'
    });
  }
};

/**
 * Create new deal
 * POST /api/deals
 */
const createDeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const dealData = { ...req.body, owner: userId };

    // Validate that contact exists and belongs to user
    if (dealData.contact) {
      const contact = await Contact.findOne({
        _id: dealData.contact,
        owner: userId,
        isDuplicate: false
      });

      if (!contact) {
        return res.status(400).json({
          success: false,
          error: 'Contact not found or does not belong to user'
        });
      }

      // Auto-populate company from contact if not provided
      if (!dealData.company && contact.company) {
        dealData.company = contact.company;
      }
    }

    // Create the deal
    const deal = new Deal(dealData);
    await deal.save();

    // Populate contact information for response
    await deal.populate('contact', 'firstName lastName email company');

    logger.info(`Created new deal ${deal._id} for user ${userId}`, {
      userId,
      dealId: deal._id,
      dealTitle: deal.title,
      dealValue: deal.value
    });

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: { deal }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    if (error.message.includes('Deal limit exceeded')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    logger.error('Error creating deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create deal'
    });
  }
};

/**
 * Update deal
 * PUT /api/deals/:id
 */
const updateDeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.owner;
    delete updateData.createdAt;
    delete updateData.stageHistory;

    // Validate contact if being updated
    if (updateData.contact) {
      const contact = await Contact.findOne({
        _id: updateData.contact,
        owner: userId,
        isDuplicate: false
      });

      if (!contact) {
        return res.status(400).json({
          success: false,
          error: 'Contact not found or does not belong to user'
        });
      }
    }

    // Find and update the deal
    const deal = await Deal.findOneAndUpdate(
      { _id: id, owner: userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('contact', 'firstName lastName email company');

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    logger.info(`Updated deal ${id} for user ${userId}`, {
      userId,
      dealId: id,
      updatedFields: Object.keys(updateData)
    });

    res.status(200).json({
      success: true,
      message: 'Deal updated successfully',
      data: { deal }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid deal ID'
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    logger.error('Error updating deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update deal'
    });
  }
};

/**
 * Update deal stage
 * PATCH /api/deals/:id/stage
 */
const updateDealStage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { stage, closeReason, lostReason } = req.body;

    if (!stage) {
      return res.status(400).json({
        success: false,
        error: 'Stage is required'
      });
    }

    // Validate stage value
    const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid stage value'
      });
    }

    const updateData = { stage };

    // Handle closed deals
    if (stage === 'closed_won' || stage === 'closed_lost') {
      updateData.isClosed = true;
      updateData.isWon = stage === 'closed_won';
      updateData.actualCloseDate = new Date();
      updateData.probability = stage === 'closed_won' ? 100 : 0;

      if (closeReason) {
        updateData.closeReason = closeReason;
      }

      if (stage === 'closed_lost' && lostReason) {
        updateData.lostReason = lostReason;
      }
    } else {
      // Reopening a deal
      updateData.isClosed = false;
      updateData.isWon = false;
      updateData.actualCloseDate = null;
      
      // Auto-set probability based on stage
      const stageProbabilities = {
        'lead': 10,
        'qualified': 25,
        'proposal': 50,
        'negotiation': 75
      };
      updateData.probability = stageProbabilities[stage] || 10;
    }

    const deal = await Deal.findOneAndUpdate(
      { _id: id, owner: userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('contact', 'firstName lastName email company');

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    logger.info(`Updated deal stage ${id} to ${stage} for user ${userId}`, {
      userId,
      dealId: id,
      newStage: stage,
      isClosed: updateData.isClosed
    });

    res.status(200).json({
      success: true,
      message: 'Deal stage updated successfully',
      data: { deal }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid deal ID'
      });
    }

    logger.error('Error updating deal stage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update deal stage'
    });
  }
};

/**
 * Delete deal
 * DELETE /api/deals/:id
 */
const deleteDeal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deal = await Deal.findOneAndDelete({ _id: id, owner: userId });

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    logger.info(`Deleted deal ${id} for user ${userId}`, {
      userId,
      dealId: id,
      dealTitle: deal.title
    });

    res.status(200).json({
      success: true,
      message: 'Deal deleted successfully',
      data: {
        deletedDeal: {
          id: deal._id,
          title: deal.title,
          value: deal.value
        }
      }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid deal ID'
      });
    }

    logger.error('Error deleting deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete deal'
    });
  }
};

/**
 * Get deal pipeline overview
 * GET /api/deals/pipeline/overview
 */
const getPipelineOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pipeline = 'sales' } = req.query;

    // Get pipeline summary using the model's static method
    const pipelineSummary = await Deal.getPipelineSummary(userId);

    // Define all possible stages to ensure they're all represented
    const allStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
    
    // Map the pipeline summary to the expected format and ensure all stages are included
    const mappedPipelineStages = allStages.map(stageName => {
      const stageData = pipelineSummary.find(stage => stage._id === stageName);
      return {
        stage: stageName,
        count: stageData?.count || 0,
        value: stageData?.totalValue || 0,
        weightedValue: stageData?.totalWeightedValue || 0,
        avgProbability: stageData?.avgProbability || 0
      };
    });
    
    // Get additional metrics
    const totalDeals = await Deal.countDocuments({ owner: userId });
    const activeDeals = await Deal.countDocuments({ owner: userId, isActive: true });
    const closedDeals = await Deal.countDocuments({ owner: userId, isClosed: true });
    const wonDeals = await Deal.countDocuments({ owner: userId, isWon: true });
    const overdueDeals = await Deal.countDocuments({
      owner: userId,
      expectedCloseDate: { $lt: new Date() },
      isClosed: false
    });

    // Calculate total pipeline value
    const totalValue = await Deal.aggregate([
      { $match: { owner: userId, isActive: true } },
      { $group: { _id: null, total: { $sum: '$value' } } }
    ]);

    const totalWeightedValue = await Deal.aggregate([
      { $match: { owner: userId, isActive: true } },
      { $group: { _id: null, total: { $sum: '$weightedValue' } } }
    ]);

    // Calculate average deal value
    const averageDealValue = totalDeals > 0 ? Math.round((totalValue[0]?.total || 0) / totalDeals) : 0;

    logger.info(`Retrieved pipeline overview for user ${userId}`, {
      userId,
      totalDeals,
      activeDeals,
      pipelineStages: mappedPipelineStages.length
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalDeals,
          activeDeals,
          closedDeals,
          wonDeals,
          overdueDeals,
          totalValue: totalValue[0]?.total || 0,
          totalWeightedValue: totalWeightedValue[0]?.total || 0,
          winRate: closedDeals > 0 ? Math.round((wonDeals / closedDeals) * 100) : 0,
          averageDealValue
        },
        pipelineStages: mappedPipelineStages
      }
    });

  } catch (error) {
    logger.error('Error retrieving pipeline overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve pipeline overview'
    });
  }
};

/**
 * Get deal activity timeline
 * GET /api/deals/:id/timeline
 */
const getDealTimeline = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 20,
      type,
      startDate,
      endDate 
    } = req.query;

    // Verify deal exists and belongs to user
    const deal = await Deal.findOne({ _id: id, owner: userId });
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    // Build query for interactions
    const interactionQuery = { dealId: id, owner: userId };
    
    if (type) {
      interactionQuery.type = type;
    }
    
    if (startDate || endDate) {
      interactionQuery.date = {};
      if (startDate) interactionQuery.date.$gte = new Date(startDate);
      if (endDate) interactionQuery.date.$lte = new Date(endDate);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get interactions
    const interactions = await Interaction.find(interactionQuery)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const totalInteractions = await Interaction.countDocuments(interactionQuery);

    // Get stage history
    const stageHistory = deal.stageHistory.map(stage => ({
      type: 'stage_change',
      stage: stage.stage,
      date: stage.enteredAt,
      duration: stage.duration,
      changedBy: stage.changedBy,
      _id: stage._id
    }));

    // Combine and sort timeline events
    const timelineEvents = [
      ...interactions.map(interaction => ({
        ...interaction,
        eventType: 'interaction'
      })),
      ...stageHistory.map(stage => ({
        ...stage,
        eventType: 'stage_change'
      })),
      {
        eventType: 'deal_created',
        date: deal.createdAt,
        _id: deal._id
      }
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply pagination to combined timeline
    const paginatedTimeline = timelineEvents.slice(skip, skip + limitNum);
    const totalEvents = timelineEvents.length;
    const totalPages = Math.ceil(totalEvents / limitNum);

    logger.info(`Retrieved timeline for deal ${id} for user ${userId}`, {
      userId,
      dealId: id,
      totalEvents,
      interactions: interactions.length,
      stageChanges: stageHistory.length
    });

    res.status(200).json({
      success: true,
      data: {
        timeline: paginatedTimeline,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalEvents,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        },
        summary: {
          totalInteractions,
          totalStageChanges: stageHistory.length,
          dealAge: deal.ageInDays
        }
      }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid deal ID'
      });
    }

    logger.error('Error retrieving deal timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve deal timeline'
    });
  }
};

/**
 * Add note to deal
 * POST /api/deals/:id/notes
 */
const addDealNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { subject, notes, type = 'note', priority = 'medium' } = req.body;

    if (!subject || !notes) {
      return res.status(400).json({
        success: false,
        error: 'Subject and notes are required'
      });
    }

    // Verify deal exists and belongs to user
    const deal = await Deal.findOne({ _id: id, owner: userId });
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    // Create interaction as a note
    const interaction = new Interaction({
      type: type,
      subject: subject,
      notes: notes,
      date: new Date(),
      owner: userId,
      dealId: id,
      priority: priority,
      direction: 'outbound',
      outcome: 'completed'
    });

    await interaction.save();

    // Update deal's last activity date and notes count
    await Deal.findByIdAndUpdate(id, {
      lastActivityDate: new Date(),
      $inc: { activitiesCount: 1 }
    });

    logger.info(`Added note to deal ${id} for user ${userId}`, {
      userId,
      dealId: id,
      noteId: interaction._id,
      subject: subject
    });

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: { 
        note: interaction,
        dealUpdated: true
      }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid deal ID'
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    logger.error('Error adding note to deal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add note to deal'
    });
  }
};

/**
 * Get deal notes
 * GET /api/deals/:id/notes
 */
const getDealNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { 
      page = 1, 
      limit = 10,
      type = 'note'
    } = req.query;

    // Verify deal exists and belongs to user
    const deal = await Deal.findOne({ _id: id, owner: userId });
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get notes (interactions of type 'note')
    const query = { 
      dealId: id, 
      owner: userId,
      type: type
    };

    const notes = await Interaction.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalNotes = await Interaction.countDocuments(query);
    const totalPages = Math.ceil(totalNotes / limitNum);

    logger.info(`Retrieved ${notes.length} notes for deal ${id} for user ${userId}`, {
      userId,
      dealId: id,
      totalNotes
    });

    res.status(200).json({
      success: true,
      data: {
        notes,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalNotes,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid deal ID'
      });
    }

    logger.error('Error retrieving deal notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve deal notes'
    });
  }
};

/**
 * Update deal note
 * PUT /api/deals/:id/notes/:noteId
 */
const updateDealNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, noteId } = req.params;
    const { subject, notes, priority } = req.body;

    // Verify deal exists and belongs to user
    const deal = await Deal.findOne({ _id: id, owner: userId });
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    // Update the note (interaction)
    const updateData = {};
    if (subject) updateData.subject = subject;
    if (notes) updateData.notes = notes;
    if (priority) updateData.priority = priority;

    const updatedNote = await Interaction.findOneAndUpdate(
      { _id: noteId, dealId: id, owner: userId, type: 'note' },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    logger.info(`Updated note ${noteId} for deal ${id} for user ${userId}`, {
      userId,
      dealId: id,
      noteId: noteId
    });

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: { note: updatedNote }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID'
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    logger.error('Error updating deal note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update deal note'
    });
  }
};

/**
 * Delete deal note
 * DELETE /api/deals/:id/notes/:noteId
 */
const deleteDealNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, noteId } = req.params;

    // Verify deal exists and belongs to user
    const deal = await Deal.findOne({ _id: id, owner: userId });
    if (!deal) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    // Delete the note
    const deletedNote = await Interaction.findOneAndDelete({
      _id: noteId,
      dealId: id,
      owner: userId,
      type: 'note'
    });

    if (!deletedNote) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }

    // Update deal's activity count
    await Deal.findByIdAndUpdate(id, {
      $inc: { activitiesCount: -1 }
    });

    logger.info(`Deleted note ${noteId} for deal ${id} for user ${userId}`, {
      userId,
      dealId: id,
      noteId: noteId
    });

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      data: {
        deletedNote: {
          id: deletedNote._id,
          subject: deletedNote.subject
        }
      }
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID'
      });
    }

    logger.error('Error deleting deal note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete deal note'
    });
  }
};

module.exports = {
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
}; 