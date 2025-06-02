const OpenAI = require('openai');
const VectorService = require('./vectorService');
const ContentFilter = require('../utils/contentFilter');
const AILog = require('../models/AILog');
const config = require('../config');

/**
 * Base AI Service for all AI features
 * 
 * This service handles:
 * - OpenAI API integration
 * - Rate limiting (100 requests per day per user)
 * - Response caching
 * - Error handling and logging
 * - Cost tracking
 * - Confidence scoring
 * - Content filtering and safety measures
 */
class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
    this.vectorService = new VectorService();
    this.contentFilter = new ContentFilter();
    this.cache = new Map(); // Simple in-memory cache
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    this.isInitialized = false;
  }

  /**
   * Initialize AI service and vector database
   */
  async initialize() {
    try {
      if (!config.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      await this.vectorService.initialize();
      this.isInitialized = true;
      console.log('✅ AI Service initialized successfully');
      
    } catch (error) {
      console.error('❌ AI Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check rate limit for user (100 requests per day)
   * @param {string} userId - User ID
   * @returns {boolean} - Whether user can make request
   */
  async checkRateLimit(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const requestCount = await AILog.countDocuments({
        userId: userId,
        createdAt: { $gte: today },
        status: { $in: ['completed', 'pending'] }
      });

      const limit = config.limits?.aiRequestsPerDay || 100;
      
      if (requestCount >= limit) {
        console.log(`⚠️ Rate limit exceeded for user ${userId}: ${requestCount}/${limit}`);
        return false;
      }

      console.log(`✅ Rate limit check passed for user ${userId}: ${requestCount}/${limit}`);
      return true;
      
    } catch (error) {
      console.error('❌ Rate limit check failed:', error);
      return false; // Fail safe - deny request if check fails
    }
  }

  /**
   * Get cached response if available
   * @param {string} cacheKey - Cache key
   * @returns {Object|null} - Cached response or null
   */
  getCachedResponse(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`📦 Cache hit for key: ${cacheKey}`);
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(cacheKey); // Remove expired cache
    }
    
    return null;
  }

  /**
   * Set cached response
   * @param {string} cacheKey - Cache key
   * @param {Object} data - Data to cache
   */
  setCachedResponse(cacheKey, data) {
    this.cache.set(cacheKey, {
      data: data,
      timestamp: Date.now()
    });
    console.log(`💾 Cached response for key: ${cacheKey}`);
  }

  /**
   * Generate cache key for request
   * @param {string} feature - AI feature name
   * @param {Object} params - Request parameters
   * @returns {string} - Cache key
   */
  generateCacheKey(feature, params) {
    const crypto = require('crypto');
    
    // Create base content from prompts
    const promptContent = params.systemPrompt + '|' + params.userPrompt;
    const promptHash = crypto.createHash('md5').update(promptContent).digest('hex').slice(0, 8);
    
    // Include specific IDs based on feature type to ensure unique cache per entity
    switch (feature) {
      case 'persona_builder':
        // For persona builder, include contactId
        if (params.options && params.options.contactId) {
          return `${feature}_${params.options.contactId}_${promptHash}`;
        }
        break;
        
      case 'deal_coach':
      case 'win_loss_explainer':
        // For deal-related features, include dealId from options
        if (params.options && params.options.dealId) {
          return `${feature}_${params.options.dealId}_${promptHash}`;
        }
        break;
        
      case 'objection_handler':
        // For objection handler, include dealId if available, otherwise use objection text hash
        if (params.options && params.options.dealId) {
          return `${feature}_${params.options.dealId}_${promptHash}`;
        } else {
          // Use a hash of the objection text for uniqueness when no dealId
          const objectionHash = crypto.createHash('md5').update(params.userPrompt).digest('hex').slice(0, 12);
          return `${feature}_${objectionHash}_${promptHash}`;
        }
        break;
    }
    
    // Fallback to generic cache key (should rarely be used with proper ID passing)
    const paramsString = JSON.stringify(params);
    return `${feature}_${Buffer.from(paramsString).toString('base64').slice(0, 20)}`;
  }

  /**
   * Log AI request and response
   * @param {string} feature - AI feature name
   * @param {string} userId - User ID
   * @param {Object} inputData - Input data
   * @param {Object} outputData - Output data
   * @param {string} status - Request status
   * @param {number} responseTime - Response time in ms
   * @param {string} error - Error message if any
   * @returns {Object} - AI log entry
   */
  async logAIRequest(feature, userId, inputData, outputData = null, status = 'completed', responseTime = 0, error = null) {
    try {
      const logEntry = new AILog({
        feature: feature,
        requestType: this.getRequestType(feature),
        userId: userId,
        inputData: inputData,
        outputData: outputData,
        status: status,
        startTime: new Date(Date.now() - responseTime),
        endTime: new Date(),
        responseTime: responseTime,
        errorMessage: error,
        model: 'gpt-4',
        temperature: 0.7,
        estimatedCost: this.calculateCost(inputData, outputData)
      });

      await logEntry.save();
      
      // Update user's AI usage counter for successful requests
      if (status === 'completed') {
        const User = require('../models/User');
        const user = await User.findById(userId);
        if (user) {
          user.incrementAiRequests();
          await user.save();
          console.log(`📊 Updated AI usage for user ${userId}: ${user.usage.aiRequestsToday}/${user.limits.aiRequestsPerDay}`);
        }
      }
      
      console.log(`📝 AI request logged: ${feature} for user ${userId}`);
      return logEntry;
      
    } catch (error) {
      console.error('❌ Failed to log AI request:', error);
      return null;
    }
  }

  /**
   * Get request type based on feature
   * @param {string} feature - AI feature name
   * @returns {string} - Request type
   */
  getRequestType(feature) {
    const typeMap = {
      'deal_coach': 'suggest',
      'persona_builder': 'build',
      'objection_handler': 'generate',
      'win_loss_explainer': 'explain'
    };
    return typeMap[feature] || 'generate';
  }

  /**
   * Calculate estimated cost for request
   * @param {Object} inputData - Input data
   * @param {Object} outputData - Output data
   * @returns {number} - Cost in USD cents
   */
  calculateCost(inputData, outputData) {
    // Rough estimation: $0.01 per 1K tokens for GPT-4
    const inputTokens = this.estimateTokens(JSON.stringify(inputData));
    const outputTokens = outputData ? this.estimateTokens(JSON.stringify(outputData)) : 0;
    const totalTokens = inputTokens + outputTokens;
    
    return Math.ceil((totalTokens / 1000) * 1); // 1 cent per 1K tokens
  }

  /**
   * Estimate token count for text
   * @param {string} text - Text to estimate
   * @returns {number} - Estimated token count
   */
  estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate AI response with OpenAI
   * @param {string} feature - AI feature name
   * @param {string} systemPrompt - System prompt
   * @param {string} userPrompt - User prompt
   * @param {Object} options - Additional options
   * @returns {Object} - AI response
   */
  async generateResponse(feature, systemPrompt, userPrompt, options = {}) {
    const startTime = Date.now();
    
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // CONTENT FILTERING - Additional safety layer at service level
      if (options.enableContentFiltering !== false) { // Allow disabling for internal/trusted content
        console.log(`🔍 Service-level content filtering for feature: ${feature}`);
        
        // Filter user prompt (the main user input)
        const filterResult = await this.contentFilter.filterContent(userPrompt, feature);
        
        if (!filterResult.isAllowed) {
          console.log(`🚫 Service-level content rejected for feature ${feature}: ${filterResult.reason}`);
          
          // Log the filtering event
          if (options.userId) {
            await this.contentFilter.logFilteringEvent(
              options.userId, 
              userPrompt, 
              filterResult, 
              `service_${feature}`
            );
          }
          
          // Return safe fallback response
          return {
            content: this.contentFilter.getSafeFallbackResponse(feature, filterResult.reason).data,
            model: 'content_filter',
            usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
            confidence: 25,
            timestamp: new Date().toISOString(),
            filtered: true,
            filterReason: filterResult.reason,
            filterSeverity: filterResult.severity
          };
        }
        
        console.log(`✅ Service-level content approved for feature: ${feature}`);
      }

      // Check rate limit
      if (options.userId && !await this.checkRateLimit(options.userId)) {
        throw new Error('Daily AI request limit exceeded');
      }

      // Check cache
      const cacheKey = this.generateCacheKey(feature, { systemPrompt, userPrompt, options });
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse && !options.skipCache) {
        console.log(`📦 Cache hit for key: ${cacheKey.substring(0, 50)}...`);
        
        // Log cached request with minimal response time for analytics
        const responseTime = Date.now() - startTime;
        if (options.userId) {
          await this.logAIRequest(
            feature,
            options.userId,
            { systemPrompt, userPrompt, options },
            cachedResponse,
            'completed',
            responseTime // This will be very small (1-5ms) but still logged
          );
        }
        
        return cachedResponse;
      }

      // Make OpenAI request with enhanced error handling
      const response = await this.openai.chat.completions.create({
        model: options.model || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500,
        top_p: options.topP || 1,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0
      });

      // Validate OpenAI response content
      const responseContent = response.choices[0].message.content;
      
      // Optional: Filter AI response as well (for extra safety)
      if (options.filterResponse && responseContent) {
        const responseFilterResult = await this.contentFilter.filterContent(
          responseContent, 
          `${feature}_response`
        );
        
        if (!responseFilterResult.isAllowed) {
          console.log(`⚠️ AI response filtered for feature ${feature}`);
          
          // Return safe fallback if even the AI response is inappropriate
          return {
            content: this.contentFilter.getSafeFallbackResponse(feature, 'ai_response_filtered').data,
            model: response.model,
            usage: response.usage,
            confidence: 25,
            timestamp: new Date().toISOString(),
            responseFiltered: true,
            filterReason: responseFilterResult.reason
          };
        }
      }

      const aiResponse = {
        content: responseContent,
        model: response.model,
        usage: response.usage,
        confidence: this.calculateConfidence(response, options.ragContext || []),
        timestamp: new Date().toISOString(),
        filtered: false
      };

      // Cache response
      this.setCachedResponse(cacheKey, aiResponse);

      // Log request
      const responseTime = Date.now() - startTime;
      if (options.userId) {
        await this.logAIRequest(
          feature,
          options.userId,
          { systemPrompt, userPrompt, options },
          aiResponse,
          'completed',
          responseTime
        );
      }

      console.log(`✅ AI response generated for ${feature} in ${responseTime}ms`);
      return aiResponse;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ AI response generation failed for ${feature}:`, error);

      // Log error
      if (options.userId) {
        await this.logAIRequest(
          feature,
          options.userId,
          { systemPrompt, userPrompt, options },
          null,
          'failed',
          responseTime,
          error.message
        );
      }

      // Return fallback response
      return this.getFallbackResponse(feature, error);
    }
  }

  /**
   * Calculate confidence score based on response and context
   * @param {Object} response - OpenAI response
   * @param {Array} ragContext - RAG context data
   * @returns {number} - Confidence score (0-100)
   */
  calculateConfidence(response, ragContext = []) {
    let score = 50; // Base score (50%)

    // Factor 1: RAG context quality
    if (ragContext.length > 0) {
      const avgSimilarity = ragContext.reduce((sum, ctx) => sum + (ctx.similarity || 0), 0) / ragContext.length;
      score += avgSimilarity * 30; // Up to 30% boost from context
    }

    // Factor 2: Response length (longer responses often more confident)
    const responseLength = response.choices?.[0]?.message?.content?.length || 0;
    if (responseLength > 200) score += 10;
    if (responseLength > 500) score += 10;

    // Factor 3: Token usage efficiency
    const usage = response.usage;
    if (usage && usage.completion_tokens > 50) score += 10;

    // Ensure score is within bounds
    return Math.min(Math.max(Math.round(score), 0), 100);
  }

  /**
   * Get fallback response when AI fails
   * @param {string} feature - AI feature name
   * @param {Error} error - Error that occurred
   * @returns {Object} - Fallback response
   */
  getFallbackResponse(feature, error) {
    const fallbacks = {
      'deal_coach': {
        content: 'Unable to generate AI suggestions at the moment. Try following up with the prospect or reviewing deal notes.',
        confidence: 25
      },
      'objection_handler': {
        content: JSON.stringify({
          response: "I understand you have a concern. Could you please provide more details about your specific business objection so I can better assist you?",
          approach: "clarification",
          followUp: "What specific aspect of our solution concerns you?",
          tips: ["Focus on business benefits", "Ask clarifying questions", "Listen actively"]
        }),
        confidence: 25
      },
      'persona_builder': {
        content: JSON.stringify({
          communicationStyle: "Unable to analyze due to technical issues",
          decisionMaking: "Analysis temporarily unavailable",
          motivations: ["Business growth", "Efficiency"],
          concerns: ["Budget", "Implementation"],
          engagementLevel: "medium",
          preferredApproach: "Professional communication recommended",
          keyInsights: ["Manual review recommended"]
        }),
        confidence: 25
      },
      'win_loss_explainer': {
        content: JSON.stringify({
          outcome: "unknown",
          primaryFactors: ["Technical issue prevented analysis"],
          timeline: "Unable to analyze",
          objectionHandling: "Manual review required",
          engagementLevel: "Unknown",
          keyLessons: ["System temporarily unavailable"],
          recommendations: ["Review manually", "Try again later"]
        }),
        confidence: 25
      }
    };

    return {
      content: fallbacks[feature]?.content || 'AI service temporarily unavailable.',
      confidence: fallbacks[feature]?.confidence || 25,
      error: error.message,
      fallback: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Health check for AI service
   * @returns {Object} - Health status
   */
  async healthCheck() {
    try {
      const vectorHealth = await this.vectorService.healthCheck();
      
      // Test OpenAI connection with a simple request
      const testResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });

      return {
        status: 'healthy',
        healthy: true,
        openai: {
          status: 'connected',
          model: testResponse.model
        },
        vectorDatabase: vectorHealth,
        cache: {
          size: this.cache.size,
          status: 'active'
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ AI service cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = AIService; 