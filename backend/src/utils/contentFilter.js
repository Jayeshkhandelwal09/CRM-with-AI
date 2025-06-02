const OpenAI = require('openai');
const config = require('../config');

/**
 * Comprehensive Content Filtering and Safety Utility
 * 
 * This utility provides:
 * - Profanity and inappropriate content detection
 * - OpenAI Moderation API integration
 * - Business context validation
 * - Spam detection
 * - AI safety measures
 */
class ContentFilter {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });

    // Comprehensive profanity and inappropriate content patterns
    this.inappropriatePatterns = [
      // Profanity (sample - extend as needed)
      /\b(fuck|shit|damn|hell|bitch|asshole|bastard|crap)\b/gi,
      
      // Hate speech indicators
      /\b(hate|kill|murder|die|terrorist|nazi|racist)\b/gi,
      
      // Sexual content
      /\b(sex|sexual|porn|nude|naked|xxx|adult)\b/gi,
      
      // Violence indicators
      /\b(violence|violent|attack|assault|bomb|weapon|gun)\b/gi,
      
      // Spam indicators
      /\b(click here|buy now|free money|make money|work from home|get rich|viagra)\b/gi,
      
      // Social engineering
      /\b(urgent|act now|limited time|call immediately|verify account|suspend|urgent action)\b/gi,
      
      // Personal information requests
      /\b(social security|ssn|credit card|password|login|pin number)\b/gi
    ];

    // Business-appropriate objection categories
    this.validBusinessObjections = [
      'price', 'budget', 'timing', 'authority', 'need', 'trust', 
      'competitor', 'features', 'support', 'integration', 'security',
      'compliance', 'scalability', 'maintenance', 'training'
    ];

    // Common legitimate sales objections patterns
    this.legitimateObjectionPatterns = [
      /\b(too expensive|budget|cost|price|afford|money)\b/gi,
      /\b(timing|time|schedule|deadline|rush|urgent)\b/gi,
      /\b(decision maker|authority|approve|boss|manager)\b/gi,
      /\b(need|require|necessary|essential|must have)\b/gi,
      /\b(trust|reliability|credible|reputation|references)\b/gi,
      /\b(competitor|alternative|other options|comparison)\b/gi,
      /\b(features|functionality|capabilities|specifications)\b/gi,
      /\b(support|help|assistance|training|documentation)\b/gi,
      /\b(integration|compatibility|existing system)\b/gi,
      /\b(security|privacy|data protection|compliance)\b/gi
    ];
  }

  /**
   * Main content filtering method
   * @param {string} content - Content to filter
   * @param {string} context - Context (objection_handler, deal_coach, etc.)
   * @returns {Object} - Filtering result
   */
  async filterContent(content, context = 'general') {
    try {
      // Step 1: Basic validation
      const basicValidation = this.basicValidation(content);
      if (!basicValidation.isValid) {
        return {
          isAllowed: false,
          reason: 'basic_validation',
          details: basicValidation.errors,
          severity: 'high'
        };
      }

      // Step 2: Pattern-based filtering
      const patternCheck = this.checkInappropriatePatterns(content);
      if (!patternCheck.isClean) {
        return {
          isAllowed: false,
          reason: 'inappropriate_content',
          details: patternCheck.violations,
          severity: patternCheck.severity
        };
      }

      // Step 3: Business context validation
      const contextValidation = this.validateBusinessContext(content, context);
      if (!contextValidation.isValid) {
        return {
          isAllowed: false,
          reason: 'business_context',
          details: contextValidation.issues,
          severity: 'medium'
        };
      }

      // Step 4: OpenAI Moderation API (for critical contexts)
      if (context === 'objection_handler' || context === 'persona_builder') {
        const moderationResult = await this.openaiModeration(content);
        
        // Only block if moderation API is working AND content is flagged
        if (moderationResult.apiSuccess && !moderationResult.isAllowed) {
          console.log(`🚫 Content flagged by OpenAI moderation: ${moderationResult.categories.map(c => c.category).join(', ')}`);
          return {
            isAllowed: false,
            reason: 'ai_moderation',
            details: moderationResult.categories,
            severity: 'high'
          };
        }
        
        // Log if API failed but we're allowing content
        if (!moderationResult.apiSuccess && moderationResult.warning) {
          console.log(`⚠️ ${moderationResult.warning}`);
        }
        
        // Log if API authentication failed
        if (moderationResult.error) {
          console.error(`❌ ${moderationResult.error}`);
          return {
            isAllowed: false,
            reason: 'api_configuration_error',
            details: moderationResult.error,
            severity: 'high'
          };
        }
      }

      // Step 5: Spam and relevance check
      const spamCheck = this.checkSpamContent(content);
      if (spamCheck.isSpam) {
        return {
          isAllowed: false,
          reason: 'spam_content',
          details: spamCheck.indicators,
          severity: 'medium'
        };
      }

      // Content is clean
      return {
        isAllowed: true,
        reason: 'content_approved',
        details: 'Content passed all safety checks',
        severity: 'none'
      };

    } catch (error) {
      console.error('Content filtering error:', error);
      // Fail safe - if filtering fails, reject content
      return {
        isAllowed: false,
        reason: 'filtering_error',
        details: 'Unable to verify content safety',
        severity: 'high'
      };
    }
  }

  /**
   * Basic validation checks
   * @param {string} content - Content to validate
   * @returns {Object} - Validation result
   */
  basicValidation(content) {
    const errors = [];

    if (!content || typeof content !== 'string') {
      errors.push('Content must be a non-empty string');
    }

    if (content && content.length < 3) {
      errors.push('Content too short to be meaningful');
    }

    if (content && content.length > 2000) {
      errors.push('Content exceeds maximum length');
    }

    // Check for obvious malicious patterns
    const maliciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(content)) {
        errors.push('Content contains potentially malicious code');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check for inappropriate content patterns
   * @param {string} content - Content to check
   * @returns {Object} - Check result
   */
  checkInappropriatePatterns(content) {
    const violations = [];
    let severity = 'low';

    for (const pattern of this.inappropriatePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({
          pattern: pattern.toString(),
          matches: matches,
          type: this.categorizePattern(pattern)
        });

        // Determine severity
        if (pattern.toString().includes('hate|kill|murder|terrorist')) {
          severity = 'critical';
        } else if (pattern.toString().includes('sex|porn|violence|weapon')) {
          severity = 'high';
        } else if (severity === 'low') {
          severity = 'medium';
        }
      }
    }

    return {
      isClean: violations.length === 0,
      violations,
      severity
    };
  }

  /**
   * Validate business context appropriateness
   * @param {string} content - Content to validate
   * @param {string} context - Business context
   * @returns {Object} - Validation result
   */
  validateBusinessContext(content, context) {
    const issues = [];

    if (context === 'objection_handler') {
      // Check if content resembles a business objection
      let hasBusinessTerms = false;
      for (const pattern of this.legitimateObjectionPatterns) {
        if (pattern.test(content)) {
          hasBusinessTerms = true;
          break;
        }
      }

      if (!hasBusinessTerms && content.length > 50) {
        issues.push('Content does not appear to be a legitimate business objection');
      }

      // Check for personal attacks
      const personalAttackPatterns = [
        /\b(you are|you're|your company is)\s+(stupid|dumb|terrible|awful|worst|useless)\b/gi,
        /\b(i hate|i despise|i can't stand)\s+(you|your|this|your company)\b/gi
      ];

      for (const pattern of personalAttackPatterns) {
        if (pattern.test(content)) {
          issues.push('Content contains personal attacks or unprofessional language');
          break;
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Use OpenAI Moderation API
   * @param {string} content - Content to moderate
   * @returns {Object} - Moderation result
   */
  async openaiModeration(content) {
    try {
      console.log('🔍 Running OpenAI moderation check...');
      
      const moderation = await this.openai.moderations.create({
        input: content,
      });

      const result = moderation.results[0];
      const flaggedCategories = [];

      if (result.flagged) {
        for (const [category, flagged] of Object.entries(result.categories)) {
          if (flagged) {
            flaggedCategories.push({
              category,
              score: result.category_scores[category]
            });
          }
        }
      }

      console.log(`✅ OpenAI moderation completed. Flagged: ${result.flagged}`);
      
      return {
        isAllowed: !result.flagged,
        categories: flaggedCategories,
        scores: result.category_scores,
        apiSuccess: true
      };

    } catch (error) {
      console.error('⚠️ OpenAI Moderation API error:', error.message);
      
      // Check if it's an API key issue
      if (error.message.includes('401') || error.message.includes('authentication')) {
        console.error('❌ OpenAI API key authentication failed');
        return {
          isAllowed: false,
          categories: [{ category: 'api_auth_error', score: 1.0 }],
          scores: {},
          apiSuccess: false,
          error: 'OpenAI API authentication failed'
        };
      }
      
      // For other API errors (network, rate limits, etc.), allow content but log the issue
      console.log('⚠️ OpenAI API unavailable, skipping moderation check');
      return {
        isAllowed: true, // Allow content when API is unavailable
        categories: [],
        scores: {},
        apiSuccess: false,
        warning: 'OpenAI moderation unavailable - content allowed by default'
      };
    }
  }

  /**
   * Check for spam content
   * @param {string} content - Content to check
   * @returns {Object} - Spam check result
   */
  checkSpamContent(content) {
    const spamIndicators = [];

    // Excessive punctuation
    if ((content.match(/[!?]{3,}/g) || []).length > 0) {
      spamIndicators.push('Excessive punctuation');
    }

    // All caps (for content longer than 20 chars)
    if (content.length > 20 && content === content.toUpperCase()) {
      spamIndicators.push('All caps text');
    }

    // Repeated characters
    if (/(.)\1{4,}/.test(content)) {
      spamIndicators.push('Repeated characters');
    }

    // URL patterns (basic check)
    if (/https?:\/\/\S+/gi.test(content)) {
      spamIndicators.push('Contains URLs');
    }

    // Email patterns
    if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g.test(content)) {
      spamIndicators.push('Contains email addresses');
    }

    return {
      isSpam: spamIndicators.length >= 2, // Multiple indicators = likely spam
      indicators: spamIndicators
    };
  }

  /**
   * Categorize inappropriate pattern type
   * @param {RegExp} pattern - Pattern to categorize
   * @returns {string} - Category
   */
  categorizePattern(pattern) {
    const patternStr = pattern.toString();
    
    if (patternStr.includes('hate|kill|murder|terrorist')) return 'hate_speech';
    if (patternStr.includes('sex|porn|nude')) return 'sexual_content';
    if (patternStr.includes('violence|weapon|bomb')) return 'violence';
    if (patternStr.includes('fuck|shit|damn')) return 'profanity';
    if (patternStr.includes('click here|buy now')) return 'spam';
    if (patternStr.includes('social security|credit card')) return 'personal_info';
    
    return 'inappropriate';
  }

  /**
   * Get safe fallback response for rejected content
   * @param {string} context - Context of the request
   * @param {string} reason - Reason for rejection
   * @returns {Object} - Safe fallback response
   */
  getSafeFallbackResponse(context, reason) {
    const fallbacks = {
      objection_handler: {
        response: "I understand you have a concern. Could you please rephrase your objection in a professional manner so I can better assist you?",
        approach: "clarification",
        followUp: "What specific aspect would you like to discuss?",
        tips: ["Focus on business-related concerns", "Use professional language"]
      },
      deal_coach: {
        suggestions: [{
          title: "Review Deal Context",
          description: "Please ensure all deal information is appropriate and business-focused.",
          priority: "high",
          action: "Review and update deal details"
        }],
        confidence: 25
      },
      persona_builder: {
        communicationStyle: "Unable to analyze - inappropriate content detected",
        decisionMaking: "Please provide appropriate business information",
        motivations: ["Ensure content follows business guidelines"],
        concerns: ["Content safety", "Professional communication"],
        engagementLevel: "low",
        preferredApproach: "Use professional, business-appropriate language",
        keyInsights: ["Content must be business-appropriate for analysis"]
      }
    };

    // Special handling for API configuration errors
    if (reason === 'api_configuration_error') {
      return {
        success: false,
        error: 'AI service configuration error',
        fallback: true,
        data: { 
          message: "AI service is temporarily unavailable. Please try again later or contact support.",
          technical: "OpenAI API authentication failed"
        }
      };
    }

    return {
      success: false,
      error: `Content filtering: ${reason}`,
      fallback: true,
      data: fallbacks[context] || { message: "Content could not be processed due to safety concerns." }
    };
  }

  /**
   * Log content filtering events for monitoring
   * @param {string} userId - User ID
   * @param {string} content - Original content
   * @param {Object} filterResult - Filter result
   * @param {string} context - Context
   */
  async logFilteringEvent(userId, content, filterResult, context) {
    try {
      const AILog = require('../models/AILog');
      
      await AILog.create({
        feature: `content_filter_${context}`,
        requestType: 'content_filtering',
        userId: userId,
        inputData: {
          content: content.substring(0, 200), // Log first 200 chars only
          contentLength: content.length,
          context: context
        },
        outputData: {
          isAllowed: filterResult.isAllowed,
          reason: filterResult.reason,
          severity: filterResult.severity
        },
        status: filterResult.isAllowed ? 'approved' : 'rejected',
        startTime: new Date(),
        endTime: new Date(),
        responseTime: 0,
        model: 'content_filter',
        estimatedCost: 0
      });

    } catch (error) {
      console.error('Failed to log content filtering event:', error);
    }
  }
}

module.exports = ContentFilter; 