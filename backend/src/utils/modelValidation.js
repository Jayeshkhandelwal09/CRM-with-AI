const DOMPurify = require('isomorphic-dompurify');
const mongoose = require('mongoose');

/**
 * Comprehensive validation utility for Phase 3.3 models
 * Includes XSS protection, business logic validation, and data sanitization
 */

// XSS Protection utility
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  }).trim();
};

// Common validation patterns
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  objectId: /^[0-9a-fA-F]{24}$/,
  sessionId: /^[a-zA-Z0-9\-_]{10,}$/,
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
};

/**
 * INTERACTION MODEL VALIDATION
 */
const validateInteraction = {
  // Validate basic interaction data
  validateBasicData: (data) => {
    const errors = [];
    
    // Required fields
    if (!data.type) {
      errors.push('Interaction type is required');
    } else if (!['call', 'email', 'meeting', 'note', 'task', 'other'].includes(data.type)) {
      errors.push('Invalid interaction type');
    }
    
    if (!data.subject || !data.subject.trim()) {
      errors.push('Interaction subject is required');
    } else if (data.subject.length > 200) {
      errors.push('Subject cannot exceed 200 characters');
    }
    
    if (!data.notes || !data.notes.trim()) {
      errors.push('Interaction notes are required');
    } else if (data.notes.length > 2000) {
      errors.push('Notes cannot exceed 2000 characters');
    }
    
    if (!data.date) {
      errors.push('Interaction date is required');
    } else {
      const interactionDate = new Date(data.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (interactionDate < thirtyDaysAgo || interactionDate > new Date()) {
        errors.push('Interaction date must be within the last 30 days and not in the future');
      }
    }
    
    return errors;
  },
  
  // Validate relationship constraints
  validateRelationships: (data) => {
    const errors = [];
    
    if (!data.owner) {
      errors.push('Interaction must have an owner');
    } else if (!VALIDATION_PATTERNS.objectId.test(data.owner)) {
      errors.push('Invalid owner ID format');
    }
    
    // Ensure only one entity is linked (contact OR deal, not both)
    const hasContact = data.contactId && VALIDATION_PATTERNS.objectId.test(data.contactId);
    const hasDeal = data.dealId && VALIDATION_PATTERNS.objectId.test(data.dealId);
    
    if (hasContact && hasDeal) {
      errors.push('Interaction cannot be linked to both a contact and a deal');
    }
    
    if (!hasContact && !hasDeal) {
      errors.push('Interaction must be linked to either a contact or a deal');
    }
    
    return errors;
  },
  
  // Validate attendees for meetings
  validateAttendees: (attendees) => {
    const errors = [];
    
    if (attendees && Array.isArray(attendees)) {
      attendees.forEach((attendee, index) => {
        if (attendee.email && !VALIDATION_PATTERNS.email.test(attendee.email)) {
          errors.push(`Invalid email format for attendee ${index + 1}`);
        }
        if (attendee.name && attendee.name.length > 100) {
          errors.push(`Attendee ${index + 1} name cannot exceed 100 characters`);
        }
      });
    }
    
    return errors;
  },
  
  // Sanitize interaction data
  sanitize: (data) => {
    const sanitized = { ...data };
    
    if (sanitized.subject) sanitized.subject = sanitizeInput(sanitized.subject);
    if (sanitized.notes) sanitized.notes = sanitizeInput(sanitized.notes);
    if (sanitized.nextSteps) sanitized.nextSteps = sanitizeInput(sanitized.nextSteps);
    
    // Sanitize tags
    if (sanitized.tags && Array.isArray(sanitized.tags)) {
      sanitized.tags = sanitized.tags.map(tag => sanitizeInput(tag)).filter(tag => tag);
    }
    
    // Sanitize attendees
    if (sanitized.attendees && Array.isArray(sanitized.attendees)) {
      sanitized.attendees = sanitized.attendees.map(attendee => ({
        ...attendee,
        name: attendee.name ? sanitizeInput(attendee.name) : attendee.name,
        role: attendee.role ? sanitizeInput(attendee.role) : attendee.role
      }));
    }
    
    return sanitized;
  }
};

/**
 * OBJECTION MODEL VALIDATION
 */
const validateObjection = {
  // Validate basic objection data
  validateBasicData: (data) => {
    const errors = [];
    
    if (!data.text || !data.text.trim()) {
      errors.push('Objection text is required');
    } else if (data.text.length > 1000) {
      errors.push('Objection text cannot exceed 1000 characters');
    }
    
    if (!data.category) {
      errors.push('Objection category is required');
    } else if (!['price', 'budget', 'timing', 'authority', 'need', 'trust', 'competitor', 'features', 'support', 'other'].includes(data.category)) {
      errors.push('Invalid objection category');
    }
    
    if (!data.dealStage) {
      errors.push('Deal stage is required');
    } else if (!['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].includes(data.dealStage)) {
      errors.push('Invalid deal stage');
    }
    
    return errors;
  },
  
  // Validate relationships
  validateRelationships: (data) => {
    const errors = [];
    
    if (!data.owner) {
      errors.push('Objection must have an owner');
    } else if (!VALIDATION_PATTERNS.objectId.test(data.owner)) {
      errors.push('Invalid owner ID format');
    }
    
    if (!data.dealId) {
      errors.push('Objection must be associated with a deal');
    } else if (!VALIDATION_PATTERNS.objectId.test(data.dealId)) {
      errors.push('Invalid deal ID format');
    }
    
    return errors;
  },
  
  // Validate AI responses
  validateAiResponses: (aiResponses) => {
    const errors = [];
    
    if (aiResponses && Array.isArray(aiResponses)) {
      aiResponses.forEach((response, index) => {
        if (!response.responseText || response.responseText.length > 300) {
          errors.push(`AI response ${index + 1} text is required and cannot exceed 300 characters`);
        }
        
        if (!response.approach || !['logical', 'emotional', 'social_proof', 'authority', 'scarcity', 'reciprocity'].includes(response.approach)) {
          errors.push(`AI response ${index + 1} must have a valid approach`);
        }
        
        if (!response.confidence || !['low', 'medium', 'high'].includes(response.confidence)) {
          errors.push(`AI response ${index + 1} must have a valid confidence level`);
        }
      });
    }
    
    return errors;
  },
  
  // Sanitize objection data
  sanitize: (data) => {
    const sanitized = { ...data };
    
    if (sanitized.text) sanitized.text = sanitizeInput(sanitized.text);
    if (sanitized.context) sanitized.context = sanitizeInput(sanitized.context);
    if (sanitized.resolution) sanitized.resolution = sanitizeInput(sanitized.resolution);
    if (sanitized.actualResponse) sanitized.actualResponse = sanitizeInput(sanitized.actualResponse);
    
    // Sanitize tags
    if (sanitized.tags && Array.isArray(sanitized.tags)) {
      sanitized.tags = sanitized.tags.map(tag => sanitizeInput(tag)).filter(tag => tag);
    }
    
    // Sanitize AI responses
    if (sanitized.aiResponses && Array.isArray(sanitized.aiResponses)) {
      sanitized.aiResponses = sanitized.aiResponses.map(response => ({
        ...response,
        responseText: response.responseText ? sanitizeInput(response.responseText) : response.responseText,
        userFeedback: response.userFeedback ? {
          ...response.userFeedback,
          comment: response.userFeedback.comment ? sanitizeInput(response.userFeedback.comment) : response.userFeedback.comment
        } : response.userFeedback
      }));
    }
    
    return sanitized;
  }
};

/**
 * AI LOG MODEL VALIDATION
 */
const validateAILog = {
  // Validate basic AI log data
  validateBasicData: (data) => {
    const errors = [];
    
    if (!data.feature) {
      errors.push('AI feature is required');
    } else if (!['deal_coach', 'persona_builder', 'objection_handler', 'win_loss_explainer'].includes(data.feature)) {
      errors.push('Invalid AI feature');
    }
    
    if (!data.requestType) {
      errors.push('Request type is required');
    } else if (!['generate', 'analyze', 'suggest', 'explain', 'build'].includes(data.requestType)) {
      errors.push('Invalid request type');
    }
    
    if (!data.userId) {
      errors.push('User ID is required');
    } else if (!VALIDATION_PATTERNS.objectId.test(data.userId)) {
      errors.push('Invalid user ID format');
    }
    
    if (!data.inputData) {
      errors.push('Input data is required');
    }
    
    return errors;
  },
  
  // Validate token counts
  validateTokens: (data) => {
    const errors = [];
    
    if (data.inputTokens !== undefined && (data.inputTokens < 0 || !Number.isInteger(data.inputTokens))) {
      errors.push('Input tokens must be a non-negative integer');
    }
    
    if (data.outputTokens !== undefined && (data.outputTokens < 0 || !Number.isInteger(data.outputTokens))) {
      errors.push('Output tokens must be a non-negative integer');
    }
    
    return errors;
  },
  
  // Validate user feedback
  validateFeedback: (feedback) => {
    const errors = [];
    
    if (feedback) {
      if (feedback.rating && !['thumbs_up', 'thumbs_down'].includes(feedback.rating)) {
        errors.push('Invalid feedback rating');
      }
      
      if (feedback.comment && feedback.comment.length > 200) {
        errors.push('Feedback comment cannot exceed 200 characters');
      }
    }
    
    return errors;
  },
  
  // Sanitize AI log data
  sanitize: (data) => {
    const sanitized = { ...data };
    
    if (sanitized.errorMessage) sanitized.errorMessage = sanitizeInput(sanitized.errorMessage);
    if (sanitized.userAgent) sanitized.userAgent = sanitizeInput(sanitized.userAgent);
    
    // Sanitize user feedback
    if (sanitized.userFeedback && sanitized.userFeedback.comment) {
      sanitized.userFeedback.comment = sanitizeInput(sanitized.userFeedback.comment);
    }
    
    return sanitized;
  }
};

/**
 * SESSION MODEL VALIDATION
 */
const validateSession = {
  // Validate basic session data
  validateBasicData: (data) => {
    const errors = [];
    
    if (!data.sessionId) {
      errors.push('Session ID is required');
    } else if (!VALIDATION_PATTERNS.sessionId.test(data.sessionId)) {
      errors.push('Invalid session ID format');
    }
    
    if (!data.userId) {
      errors.push('User ID is required');
    } else if (!VALIDATION_PATTERNS.objectId.test(data.userId)) {
      errors.push('Invalid user ID format');
    }
    
    if (data.sessionType && !['login', 'activity', 'ai_interaction', 'api'].includes(data.sessionType)) {
      errors.push('Invalid session type');
    }
    
    return errors;
  },
  
  // Validate network information
  validateNetworkInfo: (data) => {
    const errors = [];
    
    if (data.ipAddress && !VALIDATION_PATTERNS.ipAddress.test(data.ipAddress)) {
      errors.push('Invalid IP address format');
    }
    
    return errors;
  },
  
  // Validate page views
  validatePageViews: (pageViews) => {
    const errors = [];
    
    if (pageViews && Array.isArray(pageViews)) {
      pageViews.forEach((pageView, index) => {
        if (!pageView.path || !pageView.path.trim()) {
          errors.push(`Page view ${index + 1} must have a path`);
        }
        
        if (pageView.duration !== undefined && pageView.duration < 0) {
          errors.push(`Page view ${index + 1} duration cannot be negative`);
        }
      });
    }
    
    return errors;
  },
  
  // Validate actions
  validateActions: (actions) => {
    const errors = [];
    
    if (actions && Array.isArray(actions)) {
      actions.forEach((action, index) => {
        if (!action.type || !['create', 'read', 'update', 'delete', 'search', 'export', 'import', 'ai_request'].includes(action.type)) {
          errors.push(`Action ${index + 1} must have a valid type`);
        }
        
        if (!action.entity || !['contact', 'deal', 'interaction', 'objection', 'user', 'ai_log'].includes(action.entity)) {
          errors.push(`Action ${index + 1} must have a valid entity`);
        }
        
        if (action.entityId && !VALIDATION_PATTERNS.objectId.test(action.entityId)) {
          errors.push(`Action ${index + 1} has invalid entity ID format`);
        }
      });
    }
    
    return errors;
  },
  
  // Sanitize session data
  sanitize: (data) => {
    const sanitized = { ...data };
    
    if (sanitized.userAgent) sanitized.userAgent = sanitizeInput(sanitized.userAgent);
    
    // Sanitize page views
    if (sanitized.pageViews && Array.isArray(sanitized.pageViews)) {
      sanitized.pageViews = sanitized.pageViews.map(pageView => ({
        ...pageView,
        path: pageView.path ? sanitizeInput(pageView.path) : pageView.path
      }));
    }
    
    return sanitized;
  }
};

/**
 * BULK VALIDATION UTILITIES
 */
const bulkValidation = {
  // Validate multiple interactions
  validateInteractions: (interactions) => {
    const results = [];
    
    interactions.forEach((interaction, index) => {
      const errors = [
        ...validateInteraction.validateBasicData(interaction),
        ...validateInteraction.validateRelationships(interaction),
        ...validateInteraction.validateAttendees(interaction.attendees)
      ];
      
      results.push({
        index: index,
        isValid: errors.length === 0,
        errors: errors,
        sanitizedData: validateInteraction.sanitize(interaction)
      });
    });
    
    return results;
  },
  
  // Validate multiple objections
  validateObjections: (objections) => {
    const results = [];
    
    objections.forEach((objection, index) => {
      const errors = [
        ...validateObjection.validateBasicData(objection),
        ...validateObjection.validateRelationships(objection),
        ...validateObjection.validateAiResponses(objection.aiResponses)
      ];
      
      results.push({
        index: index,
        isValid: errors.length === 0,
        errors: errors,
        sanitizedData: validateObjection.sanitize(objection)
      });
    });
    
    return results;
  }
};

/**
 * IMPORT/EXPORT VALIDATION
 */
const importExportValidation = {
  // Validate CSV headers for interactions
  validateInteractionHeaders: (headers) => {
    const requiredHeaders = ['type', 'subject', 'notes', 'date'];
    const optionalHeaders = ['duration', 'direction', 'outcome', 'nextSteps', 'tags', 'priority'];
    const validHeaders = [...requiredHeaders, ...optionalHeaders];
    
    const errors = [];
    const missingRequired = requiredHeaders.filter(header => !headers.includes(header));
    const invalidHeaders = headers.filter(header => !validHeaders.includes(header));
    
    if (missingRequired.length > 0) {
      errors.push(`Missing required headers: ${missingRequired.join(', ')}`);
    }
    
    if (invalidHeaders.length > 0) {
      errors.push(`Invalid headers: ${invalidHeaders.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      requiredHeaders: requiredHeaders,
      optionalHeaders: optionalHeaders
    };
  },
  
  // Transform CSV row to interaction object
  transformInteractionRow: (row, headers) => {
    const interaction = {};
    
    headers.forEach(header => {
      if (row[header] !== undefined && row[header] !== '') {
        switch (header) {
          case 'date':
            interaction[header] = new Date(row[header]);
            break;
          case 'duration':
            interaction[header] = parseInt(row[header], 10);
            break;
          case 'tags':
            interaction[header] = row[header].split(',').map(tag => tag.trim());
            break;
          default:
            interaction[header] = row[header];
        }
      }
    });
    
    return interaction;
  }
};

/**
 * SECURITY VALIDATION
 */
const securityValidation = {
  // Check for suspicious patterns
  checkSuspiciousPatterns: (data) => {
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi
    ];
    
    const dataString = JSON.stringify(data);
    const foundPatterns = suspiciousPatterns.filter(pattern => pattern.test(dataString));
    
    return {
      isSuspicious: foundPatterns.length > 0,
      patterns: foundPatterns.map(p => p.toString())
    };
  },
  
  // Validate rate limiting data
  validateRateLimit: (userId, feature, requestCount, timeWindow) => {
    const limits = {
      deal_coach: { requests: 20, window: 3600 }, // 20 requests per hour
      persona_builder: { requests: 10, window: 3600 }, // 10 requests per hour
      objection_handler: { requests: 30, window: 3600 }, // 30 requests per hour
      win_loss_explainer: { requests: 15, window: 3600 } // 15 requests per hour
    };
    
    const limit = limits[feature];
    if (!limit) return { isValid: false, error: 'Unknown feature' };
    
    return {
      isValid: requestCount <= limit.requests,
      remaining: Math.max(0, limit.requests - requestCount),
      resetTime: Date.now() + (limit.window * 1000)
    };
  }
};

module.exports = {
  validateInteraction,
  validateObjection,
  validateAILog,
  validateSession,
  bulkValidation,
  importExportValidation,
  securityValidation,
  sanitizeInput,
  VALIDATION_PATTERNS
}; 