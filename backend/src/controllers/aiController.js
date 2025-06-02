const AIService = require('../services/aiService');
const RAGIndexingService = require('../services/ragIndexingService');
const Deal = require('../models/Deal');
const Contact = require('../models/Contact');
const Objection = require('../models/Objection');
const AILog = require('../models/AILog');

/**
 * AI Controller
 * 
 * Handles all AI-powered endpoints:
 * - Deal Coach: AI suggestions for deals
 * - Objection Handler: Smart objection responses
 * - Persona Builder: Customer personality analysis
 * - Win/Loss Explainer: Deal outcome analysis
 */
class AIController {
  constructor() {
    try {
      this.aiService = new AIService();
      this.ragService = new RAGIndexingService();
      this.initialized = false;
    } catch (error) {
      console.error('❌ AI Controller creation failed:', error);
      throw error;
    }
  }

  /**
   * Initialize AI services
   */
  async initialize() {
    if (!this.initialized) {
      try {
      
        if (!this.aiService) {
          throw new Error('AI Service not found');
        }
        
        await this.aiService.initialize();
        
        if (!this.ragService) {
          throw new Error('RAG Service not found');
        }
        
        await this.ragService.initialize();
        
        this.initialized = true;
      } catch (error) {
        console.error('❌ AI services initialization failed:', error);
        throw error;
      }
    }
  }

  /**
   * Deal Coach - Get AI suggestions for a deal
   * GET /api/deals/:id/coach
   */
  async getDealCoach(req, res) {
    try {
      await this.initialize();

      const { id: dealId } = req.params;
      const userId = req.user.id;

      // Get deal with related data
      const deal = await Deal.findById(dealId)
        .populate('contact');

      if (!deal) {
        return res.status(404).json({
          success: false,
          message: 'Deal not found'
        });
      }

      // Check if user owns this deal
      if (deal.owner && deal.owner.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Get interactions and objections separately
      const Interaction = require('../models/Interaction');
      const interactions = await Interaction.find({ dealId: dealId }).lean();
      const objections = await Objection.find({ dealId: dealId }).lean();
      
      // Add interactions and objections to deal object
      deal.interactions = interactions;
      deal.objections = objections;

      // Get similar deals from RAG
      const dealContext = this.createDealQueryContext(deal);
      const similarDeals = await this.aiService.vectorService.searchSimilar(
        'deals',
        dealContext,
        3,
        { 
          industry: deal.contact?.industry,
          outcome: 'closed_won' // Focus on successful deals
        }
      );

      // Generate AI suggestions
      const systemPrompt = this.createDealCoachSystemPrompt();
      const userPrompt = this.createDealCoachUserPrompt(deal, similarDeals);

      const aiResponse = await this.aiService.generateResponse(
        'deal_coach',
        systemPrompt,
        userPrompt,
        {
          userId,
          ragContext: similarDeals,
          maxTokens: 400
        }
      );

      // Parse AI response into structured suggestions
      const suggestions = this.parseDealCoachResponse(aiResponse.content);

      res.json({
        success: true,
        data: {
          suggestions,
          confidence: aiResponse.confidence,
          ragContext: similarDeals.map(deal => ({
            id: deal.id,
            similarity: deal.similarity,
            industry: deal.metadata.industry,
            value: deal.metadata.value,
            outcome: deal.metadata.outcome
          })),
          timestamp: aiResponse.timestamp
        }
      });

    } catch (error) {
      console.error('Deal Coach error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate deal suggestions',
        error: error.message
      });
    }
  }

  /**
   * Objection Handler - Get AI response for an objection
   * POST /api/objections/handle
   */
  async handleObjection(req, res) {
    try {
      await this.initialize();

      const { objectionText, dealId, category, severity } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!objectionText || objectionText.length > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Objection text is required and must be under 1000 characters'
        });
      }

      // Get deal context if provided
      let deal = null;
      if (dealId) {
        deal = await Deal.findById(dealId).populate('contact');
        if (deal && deal.owner && deal.owner.toString() !== userId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      // Get similar objections from RAG
      const objectionContext = this.createObjectionQueryContext(objectionText, deal);
      const searchMetadata = {};
      if (category) {
        searchMetadata.category = category;
      }
      searchMetadata.outcome = 'resolved';
      
      const similarObjections = await this.aiService.vectorService.searchSimilar(
        'objections',
        objectionContext,
        3,
        searchMetadata
      );

      // Generate AI response
      const systemPrompt = this.createObjectionHandlerSystemPrompt();
      const userPrompt = this.createObjectionHandlerUserPrompt(
        objectionText,
        deal,
        similarObjections,
        category,
        severity
      );

      const aiResponse = await this.aiService.generateResponse(
        'objection_handler',
        systemPrompt,
        userPrompt,
        {
          userId,
          ragContext: similarObjections,
          maxTokens: 350
        }
      );

      // Parse AI response into structured format
      const response = this.parseObjectionHandlerResponse(aiResponse.content);

      res.json({
        success: true,
        data: {
          response,
          confidence: aiResponse.confidence,
          ragContext: similarObjections.map(obj => ({
            id: obj.id,
            similarity: obj.similarity,
            category: obj.metadata.category,
            severity: obj.metadata.severity,
            outcome: obj.metadata.outcome
          })),
          timestamp: aiResponse.timestamp
        }
      });

    } catch (error) {
      console.error('Objection Handler error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate objection response',
        error: error.message
      });
    }
  }

  /**
   * Persona Builder - Get AI-generated customer persona
   * GET /api/contacts/:id/persona
   */
  async getCustomerPersona(req, res) {
    try {
      await this.initialize();

      const { id: contactId } = req.params;
      const userId = req.user.id;

      // Get contact with interactions
      const contact = await Contact.findById(contactId);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        });
      }

      // Check if user owns this contact
      if (contact.owner.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Get interactions and deals separately
      const Interaction = require('../models/Interaction');
      const interactions = await Interaction.find({ contactId: contactId }).lean();
      const deals = await Deal.find({ contact: contactId }).lean();
      
      // Add interactions and deals to contact object
      contact.interactions = interactions;
      contact.deals = deals;

      // Get similar interactions from RAG
      const interactionContext = this.createPersonaQueryContext(contact);
      const similarInteractions = await this.aiService.vectorService.searchSimilar(
        'interactions',
        interactionContext,
        5,
        {
          industry: contact.industry
        }
      );

      // Generate AI persona
      const systemPrompt = this.createPersonaBuilderSystemPrompt();
      const userPrompt = this.createPersonaBuilderUserPrompt(contact, similarInteractions);

      const aiResponse = await this.aiService.generateResponse(
        'persona_builder',
        systemPrompt,
        userPrompt,
        {
          userId,
          ragContext: similarInteractions,
          maxTokens: 450,
          contactId: contactId
        }
      );

      // Parse AI response into structured persona
      const persona = this.parsePersonaBuilderResponse(aiResponse.content);

      res.json({
        success: true,
        data: {
          persona,
          confidence: aiResponse.confidence,
          ragContext: similarInteractions.map(int => ({
            id: int.id,
            similarity: int.similarity,
            type: int.metadata.type,
            industry: int.metadata.industry,
            outcome: int.metadata.outcome
          })),
          timestamp: aiResponse.timestamp,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Persona Builder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate customer persona',
        error: error.message
      });
    }
  }

  /**
   * Win/Loss Explainer - Analyze why a deal was won or lost
   * GET /api/deals/:id/explain
   */
  async explainWinLoss(req, res) {
    try {
      await this.initialize();

      const { id: dealId } = req.params;
      const userId = req.user.id;

      // Get deal with contact data
      const deal = await Deal.findById(dealId)
        .populate('contact');

      if (!deal) {
        return res.status(404).json({
          success: false,
          message: 'Deal not found'
        });
      }

      // Check if user owns this deal
      if (deal.owner && deal.owner.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Only analyze closed deals
      if (!['closed_won', 'closed_lost'].includes(deal.stage)) {
        return res.status(400).json({
          success: false,
          message: 'Can only analyze closed deals'
        });
      }

      // Get related interactions and objections separately
      const [interactions, objections] = await Promise.all([
        require('../models/Interaction').find({ dealId: dealId }).sort({ date: -1 }).limit(5),
        require('../models/Objection').find({ dealId: dealId }).sort({ createdAt: -1 }).limit(3)
      ]);

      // Get similar deals from RAG
      const dealContext = this.createWinLossQueryContext(deal);
      const similarDeals = await this.aiService.vectorService.searchSimilar(
        'deals',
        dealContext,
        4,
        {
          industry: deal.contact?.industry,
          outcome: deal.stage
        }
      );

      // Generate AI analysis
      const systemPrompt = this.createWinLossExplainerSystemPrompt();
      const userPrompt = this.createWinLossExplainerUserPrompt(deal, similarDeals, interactions, objections);

      const aiResponse = await this.aiService.generateResponse(
        'win_loss_explainer',
        systemPrompt,
        userPrompt,
        {
          userId,
          ragContext: similarDeals,
          maxTokens: 500
        }
      );

      // Parse AI response into structured analysis
      const analysis = this.parseWinLossExplainerResponse(aiResponse.content);

      res.json({
        success: true,
        data: {
          analysis,
          confidence: aiResponse.confidence || 85,
          ragContext: similarDeals.map(deal => ({
            id: deal.id,
            similarity: deal.similarity,
            industry: deal.metadata?.industry,
            value: deal.metadata?.value,
            outcome: deal.metadata?.outcome,
            duration: deal.metadata?.duration
          })),
          timestamp: aiResponse.timestamp
        }
      });

    } catch (error) {
      console.error('Win/Loss Explainer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate deal analysis',
        error: error.message
      });
    }
  }

  /**
   * Submit AI Feedback - Collect user feedback on AI responses
   * POST /api/ai/feedback
   */
  async submitFeedback(req, res) {
    try {
      const { feature, responseId, feedback, rating, comments } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!feature || !feedback || !['positive', 'negative'].includes(feedback)) {
        return res.status(400).json({
          success: false,
          message: 'Feature and feedback (positive/negative) are required'
        });
      }

      // Create feedback log entry
      const AILog = require('../models/AILog');
      const feedbackEntry = new AILog({
        feature: feature,
        requestType: 'feedback',
        userId: userId,
        inputData: {
          responseId: responseId,
          feedback: feedback,
          rating: rating,
          comments: comments
        },
        outputData: null,
        status: 'completed',
        startTime: new Date(),
        endTime: new Date(),
        responseTime: 0,
        model: 'feedback',
        temperature: 0,
        estimatedCost: 0
      });

      await feedbackEntry.save();

      console.log(`👍 AI feedback received: ${feedback} for ${feature} from user ${userId}`);

      res.json({
        success: true,
        message: 'Feedback submitted successfully',
        data: {
          feedbackId: feedbackEntry._id,
          timestamp: feedbackEntry.createdAt
        }
      });

    } catch (error) {
      console.error('AI Feedback error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback',
        error: error.message
      });
    }
  }

  /**
   * Get AI Analytics - Usage statistics and performance metrics
   * GET /api/ai/analytics
   */
  async getAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const { period = '7d' } = req.query;

      // Convert userId to ObjectId for database queries
      const mongoose = require('mongoose');
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      console.log('📅 Date range for analytics:', {
        period,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        userId,
        userObjectId
      });

      const AILog = require('../models/AILog');
      
      // Debug: Check what's actually in the database
      const allLogs = await AILog.find({ userId: userObjectId }).limit(5).sort({ createdAt: -1 });
      console.log('🔍 Recent AI logs for user:', allLogs.map(log => ({
        feature: log.feature,
        requestType: log.requestType,
        responseTime: log.responseTime,
        inputData: log.inputData,
        createdAt: log.createdAt
      })));
      
      // Get usage statistics
      const [totalRequests, featureBreakdown, feedbackStats, avgResponseTime] = await Promise.all([
        // Total requests (excluding feedback)
        AILog.countDocuments({
          userId: userObjectId,
          createdAt: { $gte: startDate, $lte: endDate },
          requestType: { $ne: 'feedback' }
        }),
        
        // Feature breakdown
        AILog.aggregate([
          {
            $match: {
              userId: userObjectId,
              createdAt: { $gte: startDate, $lte: endDate },
              requestType: { $ne: 'feedback' }
            }
          },
          {
            $group: {
              _id: '$feature',
              count: { $sum: 1 },
              avgResponseTime: { $avg: '$responseTime' }
            }
          }
        ]),
        
        // Feedback statistics - Fixed to match actual data structure
        AILog.aggregate([
          {
            $match: {
              userId: userObjectId,
              createdAt: { $gte: startDate, $lte: endDate },
              requestType: 'feedback'
            }
          },
          {
            $group: {
              _id: '$inputData.feedback',
              count: { $sum: 1 }
            }
          }
        ]),
        
        // Average response time - Improved calculation
        AILog.aggregate([
          {
            $match: {
              userId: userObjectId,
              createdAt: { $gte: startDate, $lte: endDate },
              requestType: { $ne: 'feedback' },
              responseTime: { $exists: true, $ne: null, $gt: 0 }
            }
          },
          {
            $group: {
              _id: null,
              avgResponseTime: { $avg: '$responseTime' },
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      // Debug the aggregation results
      console.log('🔍 Aggregation results:', {
        totalRequests,
        featureBreakdown,
        feedbackStats,
        avgResponseTime
      });

      // Calculate positive feedback percentage
      const positiveFeedback = feedbackStats.find(f => f._id === 'positive')?.count || 0;
      const negativeFeedback = feedbackStats.find(f => f._id === 'negative')?.count || 0;
      const totalFeedback = positiveFeedback + negativeFeedback;
      const positiveFeedbackPercentage = totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0;

      // Calculate average response time with fallback
      const calculatedAvgResponseTime = avgResponseTime[0]?.avgResponseTime || 0;
      const responseTimeCount = avgResponseTime[0]?.count || 0;

      // Debug logging to see what's happening
      console.log('📊 Analytics Debug:', {
        totalRequests,
        feedbackStats,
        positiveFeedback,
        negativeFeedback,
        totalFeedback,
        positiveFeedbackPercentage,
        calculatedAvgResponseTime,
        responseTimeCount,
        featureBreakdown
      });

      res.json({
        success: true,
        data: {
          totalRequests,
          todaysUsage: totalRequests, // Simplified for now
          remainingRequests: Math.max(0, 500 - totalRequests), // Updated to use correct daily limit
          positiveFeedback: positiveFeedbackPercentage,
          avgResponseTime: Math.round(calculatedAvgResponseTime),
          featureUsage: featureBreakdown.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          period: period,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          }
        }
      });

    } catch (error) {
      console.error('AI Analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get AI analytics',
        error: error.message
      });
    }
  }

  /**
   * Test endpoint to create sample AI logs for analytics testing
   * POST /api/ai/test-data
   */
  async createTestData(req, res) {
    try {
      const userId = req.user.id;
      const AILog = require('../models/AILog');

      // Delete existing test data first
      await AILog.deleteMany({ userId: userId, feature: { $in: ['test_deal_coach', 'test_objection_handler'] } });

      // Create sample AI request logs with current timestamps
      const now = new Date();
      const sampleLogs = [
        {
          feature: 'deal_coach',
          requestType: 'suggest',
          userId: userId,
          inputData: { test: 'sample deal coach request' },
          outputData: { suggestions: ['Follow up with prospect'] },
          status: 'completed',
          startTime: new Date(now.getTime() - 2000),
          endTime: now,
          responseTime: 1500,
          model: 'gpt-4',
          temperature: 0.7,
          estimatedCost: 2,
          createdAt: now
        },
        {
          feature: 'objection_handler',
          requestType: 'generate',
          userId: userId,
          inputData: { objection: 'Too expensive' },
          outputData: { response: 'Let me show you the ROI' },
          status: 'completed',
          startTime: new Date(now.getTime() - 3000),
          endTime: now,
          responseTime: 2200,
          model: 'gpt-4',
          temperature: 0.7,
          estimatedCost: 3,
          createdAt: now
        },
        // Sample feedback logs
        {
          feature: 'deal_coach',
          requestType: 'feedback',
          userId: userId,
          inputData: { feedback: 'positive', rating: 5 },
          outputData: null,
          status: 'completed',
          startTime: now,
          endTime: now,
          responseTime: 0,
          model: 'feedback',
          temperature: 0,
          estimatedCost: 0,
          createdAt: now
        },
        {
          feature: 'objection_handler',
          requestType: 'feedback',
          userId: userId,
          inputData: { feedback: 'positive', rating: 4 },
          outputData: null,
          status: 'completed',
          startTime: now,
          endTime: now,
          responseTime: 0,
          model: 'feedback',
          temperature: 0,
          estimatedCost: 0,
          createdAt: now
        },
        {
          feature: 'deal_coach',
          requestType: 'feedback',
          userId: userId,
          inputData: { feedback: 'negative', rating: 2 },
          outputData: null,
          status: 'completed',
          startTime: now,
          endTime: now,
          responseTime: 0,
          model: 'feedback',
          temperature: 0,
          estimatedCost: 0,
          createdAt: now
        }
      ];

      const createdLogs = await AILog.insertMany(sampleLogs);

      res.json({
        success: true,
        message: 'Test data created successfully',
        data: {
          logsCreated: createdLogs.length,
          aiRequests: 2,
          feedbackEntries: 3,
          sampleIds: createdLogs.map(log => log._id)
        }
      });

    } catch (error) {
      console.error('Test data creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create test data',
        error: error.message
      });
    }
  }

  // Helper methods for creating prompts and parsing responses...
  
  createDealCoachSystemPrompt() {
    return `You are an expert sales coach AI. Your role is to provide actionable, specific suggestions to help salespeople advance their deals.

Guidelines:
- Provide 2-3 concrete, actionable suggestions
- Base recommendations on similar successful deals when available
- Focus on next steps that move the deal forward
- Consider the deal stage, value, and industry context
- Be specific about timing and approach
- Keep suggestions practical and implementable

Format your response as a JSON array of suggestion objects:
[
  {
    "action": "specific action to take",
    "reasoning": "why this action is recommended",
    "priority": "high|medium|low",
    "timeline": "when to execute this"
  }
]`;
  }

  createDealCoachUserPrompt(deal, similarDeals) {
    const contextInfo = similarDeals.length > 0 
      ? `\n\nSimilar successful deals for context:\n${similarDeals.map(d => 
          `- ${d.metadata.industry} deal worth $${d.metadata.value} (${d.metadata.duration} days to close)`
        ).join('\n')}`
      : '';

    return `Analyze this deal and provide coaching suggestions:

Deal Details:
- Company: ${deal.contact?.company || 'Unknown'}
- Industry: ${deal.contact?.industry || 'Unknown'}
- Value: $${deal.value || 0}
- Stage: ${deal.stage}
- Days in pipeline: ${deal.createdAt ? Math.floor((Date.now() - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24)) : 'Unknown'}

Recent Activity:
${deal.interactions?.slice(-3).map(i => `- ${i.type}: ${i.notes || 'No notes'}`).join('\n') || 'No recent interactions'}

Current Objections:
${deal.objections?.filter(o => !o.isResolved).map(o => `- ${o.category}: ${o.text}`).join('\n') || 'No active objections'}

Notes: ${deal.notes || 'No notes'}${contextInfo}

Provide specific, actionable coaching suggestions to advance this deal.`;
  }

  parseDealCoachResponse(content) {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // Fallback: parse text format
      return [{
        action: content.slice(0, 200),
        reasoning: "AI-generated suggestion",
        priority: "medium",
        timeline: "within 1 week"
      }];
    }
  }

  createObjectionHandlerSystemPrompt() {
    return `You are an expert sales objection handler. Your role is to provide thoughtful, persuasive responses to customer objections.

Guidelines:
- Acknowledge the concern genuinely
- Provide logical, evidence-based responses
- Offer alternative perspectives when appropriate
- Include emotional and social proof elements when relevant
- Keep responses conversational and professional
- Suggest follow-up questions to understand the objection better

Format your response as JSON:
{
  "response": "the main response to the objection",
  "approach": "logical|emotional|social_proof",
  "followUp": "suggested follow-up question",
  "tips": ["tip1", "tip2"]
}`;
  }

  createObjectionHandlerUserPrompt(objectionText, deal, similarObjections, category, severity) {
    const dealContext = deal ? `
Deal Context:
- Company: ${deal.contact?.company || 'Unknown'}
- Industry: ${deal.contact?.industry || 'Unknown'}
- Value: $${deal.value || 0}
- Stage: ${deal.stage}` : '';

    const similarContext = similarObjections.length > 0
      ? `\n\nSimilar resolved objections for reference:\n${similarObjections.map(o => 
          `- "${o.document.split('\n')[0]}" (${o.metadata.category}, resolved successfully)`
        ).join('\n')}`
      : '';

    return `Handle this customer objection:

Objection: "${objectionText}"
Category: ${category || 'Unknown'}
Severity: ${severity || 'Unknown'}${dealContext}${similarContext}

Provide a thoughtful, persuasive response that addresses the customer's concern.`;
  }

  parseObjectionHandlerResponse(content) {
    try {
      return JSON.parse(content);
    } catch {
      return {
        response: content,
        approach: "logical",
        followUp: "What specific concerns do you have about this?",
        tips: ["Listen actively", "Address the root concern"]
      };
    }
  }

  createPersonaBuilderSystemPrompt() {
    return `You are an expert customer psychology analyst and sales strategist. Create detailed, personalized customer personas based on specific contact data and interaction history.

Guidelines:
- Analyze the specific contact's role, company, and communication patterns
- Identify unique decision-making style based on their job function and seniority
- Assess engagement level from actual interaction history and response patterns
- Provide specific, actionable insights tailored to this individual
- Consider their industry context, company size, and department dynamics
- Base analysis on real data points, not generic assumptions
- Make recommendations specific to their communication preferences and history
- Differentiate between contacts - each persona should be unique

Key Analysis Areas:
1. Communication Style: How they prefer to communicate based on role and interactions
2. Decision Making: Their authority level, process, and timeline preferences
3. Motivations: What drives them professionally based on their role and company
4. Concerns: Specific challenges they face in their position and industry
5. Engagement Level: Based on actual interaction frequency and quality
6. Preferred Approach: Tailored sales strategy for this specific individual
7. Key Insights: Unique observations about this contact's behavior and preferences

Format your response as JSON with detailed, specific content:
{
  "communicationStyle": "detailed description of how this specific person communicates",
  "decisionMaking": "specific analysis of their decision-making process and authority",
  "motivations": ["specific motivation 1", "specific motivation 2", "specific motivation 3"],
  "concerns": ["specific concern 1", "specific concern 2", "specific concern 3"],
  "engagementLevel": "high|medium|low",
  "preferredApproach": "detailed, specific recommendation for sales approach tailored to this individual",
  "keyInsights": ["specific insight 1", "specific insight 2", "specific insight 3"]
}

Make each field detailed and specific to the individual contact. Avoid generic responses.`;
  }

  createPersonaBuilderUserPrompt(contact, similarInteractions) {
    const interactions = contact.interactions || [];
    const deals = contact.deals || [];
    const recentInteractions = interactions.slice(-5);
    const recentDeals = deals.slice(-3);

    const similarContext = similarInteractions.length > 0
      ? `\n\nSimilar customer patterns:\n${similarInteractions.map(i => 
          `- ${i.metadata.type} interaction in ${i.metadata.industry} (${i.metadata.outcome})`
        ).join('\n')}`
      : '';

    const contactName = `${contact.firstName} ${contact.lastName}`;
    const dealHistory = recentDeals.length > 0 
      ? `\n\nDeal History:\n${recentDeals.map(d => 
          `- $${d.value || 0} deal in ${d.stage} stage (${d.closeReason || 'ongoing'})`
        ).join('\n')}`
      : '';

    return `Analyze this specific customer and create a detailed, personalized persona:

Customer: ${contactName}
Email: ${contact.email}
Company: ${contact.company || 'Unknown'}
Job Title: ${contact.jobTitle || 'Unknown'}
Department: ${contact.department || 'Unknown'}
Status: ${contact.status || 'Unknown'}
Lead Source: ${contact.leadSource || 'Unknown'}
Priority: ${contact.priority || 'Unknown'}
Phone: ${contact.phone || 'Not provided'}
Website: ${contact.website || 'Not provided'}

Contact Preferences:
- Preferred Contact Method: ${contact.preferences?.preferredContactMethod || 'email'}
- Timezone: ${contact.preferences?.timezone || 'UTC'}
- Do Not Contact: ${contact.preferences?.doNotContact ? 'Yes' : 'No'}

Recent Interactions (${interactions.length} total):
${recentInteractions.map(i => 
  `- ${i.type} (${new Date(i.date).toLocaleDateString()}): ${i.notes || 'No notes'} | Outcome: ${i.outcome || 'Unknown'} | Duration: ${i.duration || 'Unknown'} min`
).join('\n') || 'No interactions recorded'}${dealHistory}

Contact Notes: ${contact.notes || 'No notes available'}
Description: ${contact.description || 'No description available'}
Tags: ${contact.tags?.join(', ') || 'None'}
Last Contact: ${contact.lastContactDate ? new Date(contact.lastContactDate).toLocaleDateString() : 'Never'}
Next Follow-up: ${contact.nextFollowUpDate ? new Date(contact.nextFollowUpDate).toLocaleDateString() : 'Not scheduled'}${similarContext}

Based on this specific contact's information, communication history, job role, company context, and interaction patterns, create a comprehensive and unique persona. Focus on:
1. Their specific communication style based on their role (${contact.jobTitle}) at ${contact.company}
2. Decision-making patterns relevant to their department (${contact.department}) and seniority level
3. Motivations specific to their industry and company size
4. Concerns relevant to their role and company context
5. Engagement level based on actual interaction history and response patterns
6. Tailored sales approach considering their preferred contact method and communication history

Make the analysis specific to this individual contact, not generic.`;
  }

  parsePersonaBuilderResponse(content) {
    try {
      return JSON.parse(content);
    } catch {
      return {
        communicationStyle: "analytical",
        decisionMaking: "deliberate",
        motivations: ["Business growth", "Cost efficiency"],
        concerns: ["Budget constraints", "Implementation complexity"],
        engagementLevel: "medium",
        preferredApproach: "Provide detailed information and case studies",
        keyInsights: ["Needs more data to make decisions"]
      };
    }
  }

  createWinLossExplainerSystemPrompt() {
    return `You are an expert sales analyst. Analyze closed deals to identify key factors that led to wins or losses.

Guidelines:
- Identify the primary factors that influenced the outcome
- Analyze timeline, objections, and engagement patterns
- Compare with industry benchmarks when possible
- Provide actionable insights for future deals
- Be objective and data-driven in analysis
- Highlight both positive and negative factors

Format your response as JSON:
{
  "outcome": "won|lost",
  "primaryFactors": ["factor1", "factor2"],
  "timeline": "analysis of deal duration and pacing",
  "objectionHandling": "how objections were managed",
  "engagementLevel": "customer engagement assessment",
  "keyLessons": ["lesson1", "lesson2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`;
  }

  createWinLossExplainerUserPrompt(deal, similarDeals, interactions, objections) {
    const duration = deal.closedAt && deal.createdAt 
      ? Math.floor((new Date(deal.closedAt) - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24))
      : null;

    const similarContext = similarDeals.length > 0
      ? `\n\nSimilar deals for comparison:\n${similarDeals.map(d => 
          `- ${d.metadata.industry} deal: $${d.metadata.value}, ${d.metadata.duration} days, ${d.metadata.outcome}`
        ).join('\n')}`
      : '';

    return `Analyze this closed deal:

Deal Outcome: ${deal.stage}
Company: ${deal.contact?.company || 'Unknown'}
Industry: ${deal.contact?.industry || 'Unknown'}
Value: $${deal.value || 0}
Duration: ${duration ? `${duration} days` : 'Unknown'}
Close Reason: ${deal.closeReason || 'Not specified'}

Interactions (${interactions.length} total):
${interactions.map(i => 
  `- ${i.type}: ${i.notes || 'No notes'} (${i.outcome || 'Unknown outcome'})`
).join('\n') || 'No interactions'}

Objections (${objections.length} total):
${objections.map(o => 
  `- ${o.category}: ${o.text} (${o.isResolved ? 'Resolved' : 'Unresolved'})`
).join('\n') || 'No objections'}

Notes: ${deal.notes || 'No notes'}${similarContext}

Provide a comprehensive analysis of why this deal was ${deal.stage === 'closed_won' ? 'won' : 'lost'}.`;
  }

  parseWinLossExplainerResponse(content) {
    try {
      return JSON.parse(content);
    } catch {
      return {
        outcome: "unknown",
        primaryFactors: ["Insufficient data for analysis"],
        timeline: "Unable to analyze timeline",
        objectionHandling: "No objection data available",
        engagementLevel: "Unknown",
        keyLessons: ["Improve data collection"],
        recommendations: ["Track more interaction details"]
      };
    }
  }

  // Helper methods for creating query contexts
  createDealQueryContext(deal) {
    return `${deal.contact?.industry || 'Unknown'} company ${deal.contact?.company || ''} deal worth $${deal.value || 0} in ${deal.stage} stage`;
  }

  createObjectionQueryContext(objectionText, deal) {
    const industry = deal?.contact?.industry || 'general';
    return `${industry} objection: ${objectionText}`;
  }

  createPersonaQueryContext(contact) {
    const contactName = `${contact.firstName} ${contact.lastName}`;
    const jobInfo = contact.jobTitle ? `${contact.jobTitle}` : 'professional';
    const companyInfo = contact.company ? `at ${contact.company}` : '';
    const departmentInfo = contact.department ? `in ${contact.department}` : '';
    
    return `${jobInfo} ${departmentInfo} ${companyInfo} contact ${contactName} with ${contact.interactionCount || 0} interactions`;
  }

  createWinLossQueryContext(deal) {
    return `${deal.contact?.industry || 'Unknown'} deal worth $${deal.value || 0} ${deal.stage} after ${deal.interactions?.length || 0} interactions`;
  }
}

module.exports = new AIController(); 