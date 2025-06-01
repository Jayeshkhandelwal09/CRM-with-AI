const VectorService = require('./vectorService');
const Deal = require('../models/Deal');
const Objection = require('../models/Objection');
const Interaction = require('../models/Interaction');
const Contact = require('../models/Contact');

/**
 * RAG Indexing Service
 * 
 * This service handles indexing existing CRM data into vector database
 * for Retrieval-Augmented Generation (RAG) functionality.
 * 
 * It converts:
 * - Closed deals → Deal Coach context
 * - Resolved objections → Objection Handler context  
 * - Customer interactions → Persona Builder context
 */
class RAGIndexingService {
  constructor() {
    this.vectorService = new VectorService();
    this.batchSize = 10; // Process in batches to avoid memory issues
  }

  /**
   * Initialize the indexing service
   */
  async initialize() {
    try {
      await this.vectorService.initialize();
      console.log('✅ RAG Indexing Service initialized');
    } catch (error) {
      console.error('❌ RAG Indexing Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Index all existing data
   */
  async indexAllData() {
    try {
      console.log('🚀 Starting complete data indexing...');
      
      await this.indexDeals();
      await this.indexObjections();
      await this.indexInteractions();
      
      console.log('✅ Complete data indexing finished');
      
      // Return summary
      return await this.getIndexingSummary();
      
    } catch (error) {
      console.error('❌ Complete data indexing failed:', error);
      throw error;
    }
  }

  /**
   * Index closed deals for Deal Coach RAG
   */
  async indexDeals() {
    try {
      console.log('📊 Indexing deals...');
      
      // Get all closed deals with related data
      const deals = await Deal.find({ 
        status: { $in: ['closed_won', 'closed_lost'] }
      })
      .populate('contact')
      .populate('interactions')
      .populate('objections')
      .lean();

      console.log(`Found ${deals.length} closed deals to index`);

      // Process in batches
      for (let i = 0; i < deals.length; i += this.batchSize) {
        const batch = deals.slice(i, i + this.batchSize);
        await this.processDealBatch(batch);
        console.log(`Processed deals batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(deals.length / this.batchSize)}`);
      }

      console.log('✅ Deal indexing completed');
      
    } catch (error) {
      console.error('❌ Deal indexing failed:', error);
      throw error;
    }
  }

  /**
   * Process a batch of deals
   * @param {Array} deals - Batch of deals to process
   */
  async processDealBatch(deals) {
    const promises = deals.map(deal => this.indexSingleDeal(deal));
    await Promise.allSettled(promises);
  }

  /**
   * Index a single deal
   * @param {Object} deal - Deal object to index
   */
  async indexSingleDeal(deal) {
    try {
      const dealText = this.createDealContext(deal);
      const metadata = this.createDealMetadata(deal);
      
      await this.vectorService.storeVector(
        'deals',
        deal._id.toString(),
        dealText,
        metadata
      );
      
    } catch (error) {
      console.error(`❌ Failed to index deal ${deal._id}:`, error);
    }
  }

  /**
   * Create contextual text for a deal
   * @param {Object} deal - Deal object
   * @returns {string} - Contextual text
   */
  createDealContext(deal) {
    const company = deal.contact?.company || 'Unknown Company';
    const industry = deal.contact?.industry || 'Unknown Industry';
    const dealValue = deal.value || 0;
    const stage = deal.stage || 'unknown';
    const outcome = deal.status || 'unknown';
    
    // Calculate deal duration
    const duration = deal.closedAt && deal.createdAt ? 
      Math.floor((new Date(deal.closedAt) - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24)) : 
      null;

    // Get interaction summary
    const interactions = deal.interactions || [];
    const interactionSummary = interactions
      .map(i => `${i.type}: ${i.notes || ''}`)
      .join(' ')
      .slice(0, 500); // Limit length

    // Get objection summary
    const objections = deal.objections || [];
    const objectionSummary = objections
      .map(o => `${o.category}: ${o.text}`)
      .join(' ')
      .slice(0, 300); // Limit length

    return `
Company: ${company}
Industry: ${industry}
Deal Value: $${dealValue}
Stage: ${stage}
Outcome: ${outcome}
Duration: ${duration ? `${duration} days` : 'unknown'}
Notes: ${deal.notes || ''}
Interactions: ${interactionSummary}
Objections: ${objectionSummary}
Close Reason: ${deal.closeReason || ''}
    `.trim();
  }

  /**
   * Create metadata for a deal
   * @param {Object} deal - Deal object
   * @returns {Object} - Metadata object
   */
  createDealMetadata(deal) {
    const duration = deal.closedAt && deal.createdAt ? 
      Math.floor((new Date(deal.closedAt) - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24)) : 
      null;

    return {
      dealId: deal._id.toString(),
      value: deal.value || 0,
      industry: deal.contact?.industry || 'unknown',
      outcome: deal.status || 'unknown',
      duration: duration,
      stage: deal.stage || 'unknown',
      objectionCount: deal.objections?.length || 0,
      interactionCount: deal.interactions?.length || 0,
      indexedAt: new Date().toISOString(),
      type: 'deal'
    };
  }

  /**
   * Index resolved objections for Objection Handler RAG
   */
  async indexObjections() {
    try {
      console.log('🛡️ Indexing objections...');
      
      // Get resolved objections with related data
      const objections = await Objection.find({ 
        isResolved: true,
        outcome: { $in: ['resolved', 'deal_won'] }
      })
      .populate('deal')
      .populate('contactId')
      .lean();

      console.log(`Found ${objections.length} resolved objections to index`);

      // Process in batches
      for (let i = 0; i < objections.length; i += this.batchSize) {
        const batch = objections.slice(i, i + this.batchSize);
        await this.processObjectionBatch(batch);
        console.log(`Processed objections batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(objections.length / this.batchSize)}`);
      }

      console.log('✅ Objection indexing completed');
      
    } catch (error) {
      console.error('❌ Objection indexing failed:', error);
      throw error;
    }
  }

  /**
   * Process a batch of objections
   * @param {Array} objections - Batch of objections to process
   */
  async processObjectionBatch(objections) {
    const promises = objections.map(objection => this.indexSingleObjection(objection));
    await Promise.allSettled(promises);
  }

  /**
   * Index a single objection
   * @param {Object} objection - Objection object to index
   */
  async indexSingleObjection(objection) {
    try {
      const objectionText = this.createObjectionContext(objection);
      const metadata = this.createObjectionMetadata(objection);
      
      await this.vectorService.storeVector(
        'objections',
        objection._id.toString(),
        objectionText,
        metadata
      );
      
    } catch (error) {
      console.error(`❌ Failed to index objection ${objection._id}:`, error);
    }
  }

  /**
   * Create contextual text for an objection
   * @param {Object} objection - Objection object
   * @returns {string} - Contextual text
   */
  createObjectionContext(objection) {
    const industry = objection.deal?.contact?.industry || 'unknown';
    const dealValue = objection.deal?.value || 0;
    
    return `
Objection: ${objection.text}
Category: ${objection.category}
Severity: ${objection.severity}
Context: ${objection.context || ''}
Deal Stage: ${objection.dealStage}
Industry: ${industry}
Deal Value: $${dealValue}
Resolution: ${objection.resolution || ''}
Actual Response: ${objection.actualResponse || ''}
Outcome: ${objection.outcome}
Impact on Deal: ${objection.impactOnDeal || 'neutral'}
    `.trim();
  }

  /**
   * Create metadata for an objection
   * @param {Object} objection - Objection object
   * @returns {Object} - Metadata object
   */
  createObjectionMetadata(objection) {
    return {
      objectionId: objection._id.toString(),
      category: objection.category,
      severity: objection.severity,
      outcome: objection.outcome,
      dealStage: objection.dealStage,
      industry: objection.deal?.contact?.industry || 'unknown',
      dealValue: objection.deal?.value || 0,
      impactOnDeal: objection.impactOnDeal || 'neutral',
      indexedAt: new Date().toISOString(),
      type: 'objection'
    };
  }

  /**
   * Index customer interactions for Persona Builder RAG
   */
  async indexInteractions() {
    try {
      console.log('💬 Indexing interactions...');
      
      // Get interactions with related data
      const interactions = await Interaction.find({
        notes: { $exists: true, $ne: '' }
      })
      .populate('contactId')
      .populate('dealId')
      .lean();

      console.log(`Found ${interactions.length} interactions to index`);

      // Process in batches
      for (let i = 0; i < interactions.length; i += this.batchSize) {
        const batch = interactions.slice(i, i + this.batchSize);
        await this.processInteractionBatch(batch);
        console.log(`Processed interactions batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(interactions.length / this.batchSize)}`);
      }

      console.log('✅ Interaction indexing completed');
      
    } catch (error) {
      console.error('❌ Interaction indexing failed:', error);
      throw error;
    }
  }

  /**
   * Process a batch of interactions
   * @param {Array} interactions - Batch of interactions to process
   */
  async processInteractionBatch(interactions) {
    const promises = interactions.map(interaction => this.indexSingleInteraction(interaction));
    await Promise.allSettled(promises);
  }

  /**
   * Index a single interaction
   * @param {Object} interaction - Interaction object to index
   */
  async indexSingleInteraction(interaction) {
    try {
      const interactionText = this.createInteractionContext(interaction);
      const metadata = this.createInteractionMetadata(interaction);
      
      await this.vectorService.storeVector(
        'interactions',
        interaction._id.toString(),
        interactionText,
        metadata
      );
      
    } catch (error) {
      console.error(`❌ Failed to index interaction ${interaction._id}:`, error);
    }
  }

  /**
   * Create contextual text for an interaction
   * @param {Object} interaction - Interaction object
   * @returns {string} - Contextual text
   */
  createInteractionContext(interaction) {
    const company = interaction.contactId?.company || 'Unknown Company';
    const industry = interaction.contactId?.industry || 'unknown';
    
    return `
Type: ${interaction.type}
Company: ${company}
Industry: ${industry}
Duration: ${interaction.duration || 'unknown'} minutes
Notes: ${interaction.notes || ''}
Outcome: ${interaction.outcome || 'unknown'}
Next Steps: ${interaction.nextSteps || ''}
Tags: ${interaction.tags?.join(', ') || ''}
    `.trim();
  }

  /**
   * Create metadata for an interaction
   * @param {Object} interaction - Interaction object
   * @returns {Object} - Metadata object
   */
  createInteractionMetadata(interaction) {
    return {
      interactionId: interaction._id.toString(),
      type: interaction.type,
      industry: interaction.contactId?.industry || 'unknown',
      company: interaction.contactId?.company || 'unknown',
      duration: interaction.duration || 0,
      outcome: interaction.outcome || 'unknown',
      contactId: interaction.contactId?._id?.toString(),
      dealId: interaction.dealId?._id?.toString(),
      indexedAt: new Date().toISOString(),
      type: 'interaction'
    };
  }

  /**
   * Get indexing summary
   * @returns {Object} - Summary of indexed data
   */
  async getIndexingSummary() {
    try {
      const stats = await this.vectorService.healthCheck();
      
      return {
        status: 'completed',
        collections: stats.collections,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Re-index specific deal (useful when deal is updated)
   * @param {string} dealId - Deal ID to re-index
   */
  async reindexDeal(dealId) {
    try {
      const deal = await Deal.findById(dealId)
        .populate('contact')
        .populate('interactions')
        .populate('objections')
        .lean();

      if (!deal) {
        throw new Error(`Deal ${dealId} not found`);
      }

      if (deal.status === 'closed_won' || deal.status === 'closed_lost') {
        await this.indexSingleDeal(deal);
        console.log(`✅ Re-indexed deal ${dealId}`);
      } else {
        // Remove from index if deal is no longer closed
        await this.vectorService.deleteVector('deals', dealId);
        console.log(`🗑️ Removed deal ${dealId} from index (not closed)`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to re-index deal ${dealId}:`, error);
      throw error;
    }
  }

  /**
   * Re-index specific objection
   * @param {string} objectionId - Objection ID to re-index
   */
  async reindexObjection(objectionId) {
    try {
      const objection = await Objection.findById(objectionId)
        .populate('deal')
        .populate('contactId')
        .lean();

      if (!objection) {
        throw new Error(`Objection ${objectionId} not found`);
      }

      if (objection.isResolved && ['resolved', 'deal_won'].includes(objection.outcome)) {
        await this.indexSingleObjection(objection);
        console.log(`✅ Re-indexed objection ${objectionId}`);
      } else {
        // Remove from index if objection is not resolved
        await this.vectorService.deleteVector('objections', objectionId);
        console.log(`🗑️ Removed objection ${objectionId} from index (not resolved)`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to re-index objection ${objectionId}:`, error);
      throw error;
    }
  }

  /**
   * Embedding Update Pipeline - Automatically re-index when data changes
   * This method should be called from model hooks or API endpoints when data is updated
   */
  async handleDataUpdate(modelType, documentId, action = 'update') {
    try {
      console.log(`🔄 Processing ${action} for ${modelType}: ${documentId}`);

      switch (modelType) {
        case 'deal':
          if (action === 'delete') {
            await this.vectorService.deleteVector('deals', documentId);
          } else {
            await this.reindexDeal(documentId);
          }
          break;

        case 'objection':
          if (action === 'delete') {
            await this.vectorService.deleteVector('objections', documentId);
          } else {
            await this.reindexObjection(documentId);
          }
          break;

        case 'interaction':
          if (action === 'delete') {
            await this.vectorService.deleteVector('interactions', documentId);
          } else {
            await this.reindexInteraction(documentId);
          }
          break;

        default:
          console.log(`⚠️ Unknown model type for re-indexing: ${modelType}`);
      }

      console.log(`✅ Completed ${action} processing for ${modelType}: ${documentId}`);
      
    } catch (error) {
      console.error(`❌ Failed to process ${action} for ${modelType} ${documentId}:`, error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Re-index specific interaction
   * @param {string} interactionId - Interaction ID to re-index
   */
  async reindexInteraction(interactionId) {
    try {
      const interaction = await Interaction.findById(interactionId)
        .populate('contactId')
        .populate('dealId')
        .lean();

      if (!interaction) {
        throw new Error(`Interaction ${interactionId} not found`);
      }

      if (interaction.notes && interaction.notes.trim().length > 0) {
        await this.indexSingleInteraction(interaction);
        console.log(`✅ Re-indexed interaction ${interactionId}`);
      } else {
        // Remove from index if interaction has no notes
        await this.vectorService.deleteVector('interactions', interactionId);
        console.log(`🗑️ Removed interaction ${interactionId} from index (no notes)`);
      }
      
    } catch (error) {
      console.error(`❌ Failed to re-index interaction ${interactionId}:`, error);
      throw error;
    }
  }

  /**
   * Batch update pipeline - Process multiple updates efficiently
   * @param {Array} updates - Array of {modelType, documentId, action} objects
   */
  async batchUpdatePipeline(updates) {
    try {
      console.log(`🔄 Processing batch update of ${updates.length} items`);
      
      // Process in batches to avoid overwhelming the system
      for (let i = 0; i < updates.length; i += this.batchSize) {
        const batch = updates.slice(i, i + this.batchSize);
        const promises = batch.map(update => 
          this.handleDataUpdate(update.modelType, update.documentId, update.action)
        );
        
        await Promise.allSettled(promises);
        console.log(`Processed batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(updates.length / this.batchSize)}`);
      }

      console.log(`✅ Completed batch update of ${updates.length} items`);
      
    } catch (error) {
      console.error('❌ Batch update pipeline failed:', error);
      throw error;
    }
  }

  /**
   * Schedule automatic re-indexing (can be called by cron job)
   * Re-indexes recently modified data to keep vectors up to date
   */
  async scheduleAutoReindex() {
    try {
      console.log('🕐 Starting scheduled auto re-indexing...');
      
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
      
      // Find recently updated deals
      const recentDeals = await Deal.find({
        updatedAt: { $gte: since },
        status: { $in: ['closed_won', 'closed_lost'] }
      }).select('_id').lean();

      // Find recently updated objections
      const recentObjections = await Objection.find({
        updatedAt: { $gte: since },
        isResolved: true,
        outcome: { $in: ['resolved', 'deal_won'] }
      }).select('_id').lean();

      // Find recently updated interactions
      const recentInteractions = await Interaction.find({
        updatedAt: { $gte: since },
        notes: { $exists: true, $ne: '' }
      }).select('_id').lean();

      // Prepare batch updates
      const updates = [
        ...recentDeals.map(deal => ({ modelType: 'deal', documentId: deal._id.toString(), action: 'update' })),
        ...recentObjections.map(obj => ({ modelType: 'objection', documentId: obj._id.toString(), action: 'update' })),
        ...recentInteractions.map(int => ({ modelType: 'interaction', documentId: int._id.toString(), action: 'update' }))
      ];

      if (updates.length > 0) {
        await this.batchUpdatePipeline(updates);
        console.log(`✅ Auto re-indexing completed: ${updates.length} items processed`);
      } else {
        console.log('ℹ️ No recent updates found for re-indexing');
      }
      
    } catch (error) {
      console.error('❌ Scheduled auto re-indexing failed:', error);
      throw error;
    }
  }
}

module.exports = RAGIndexingService; 