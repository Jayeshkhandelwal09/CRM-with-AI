const OpenAI = require('openai');
const VectorService = require('./vectorService');
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
 */
class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
    this.vectorService = new VectorService();
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

      // Check rate limit
      if (options.userId && !await this.checkRateLimit(options.userId)) {
        throw new Error('Daily AI request limit exceeded');
      }

      // Check cache
      const cacheKey = this.generateCacheKey(feature, { systemPrompt, userPrompt });
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

      // Make OpenAI request
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

      const aiResponse = {
        content: response.choices[0].message.content,
        model: response.model,
        usage: response.usage,
        confidence: this.calculateConfidence(response, options.ragContext || []),
        timestamp: new Date().toISOString()
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
        content: 'AI response unavailable. Consider acknowledging the concern and asking clarifying questions.',
        confidence: 25
      },
      'persona_builder': {
        content: 'Persona analysis temporarily unavailable. Review interaction history manually.',
        confidence: 25
      },
      'win_loss_explainer': {
        content: 'Deal analysis unavailable. Review timeline and objections manually.',
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