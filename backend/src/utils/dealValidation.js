const validator = require('validator');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create DOMPurify instance for server-side use
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Deal Validation Utility
 * Provides comprehensive validation rules for deal data
 */

class DealValidation {
  /**
   * Validate deal data before creation or update
   * @param {Object} dealData - The deal data to validate
   * @param {boolean} isUpdate - Whether this is an update operation
   * @param {boolean} isImport - Whether this is an import operation
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  static validateDealData(dealData, isUpdate = false, isImport = false) {
    const errors = [];
    
    // Required field validation (only for creation, not for imports)
    if (!isUpdate && !isImport) {
      if (!dealData.title || !dealData.title.trim()) {
        errors.push('Deal title is required');
      }
      if (dealData.value === undefined || dealData.value === null) {
        errors.push('Deal value is required');
      }
      if (!dealData.expectedCloseDate) {
        errors.push('Expected close date is required');
      }
      if (!dealData.owner) {
        errors.push('Deal owner is required');
      }
      if (!dealData.contact) {
        errors.push('Deal must be associated with a contact');
      }
    }
    
    // For imports, validate required fields differently
    if (isImport) {
      if (!dealData.title || !dealData.title.trim()) {
        errors.push('Deal title is required');
      }
      if (dealData.value === undefined || dealData.value === null) {
        errors.push('Deal value is required');
      }
      if (!dealData.expectedCloseDate) {
        errors.push('Expected close date is required');
      }
      // Owner and contact are not required for import validation as they're added during import
    }
    
    // Title validation
    if (dealData.title) {
      if (dealData.title.length > 200) {
        errors.push('Deal title cannot exceed 200 characters');
      }
      if (dealData.title.trim().length === 0) {
        errors.push('Deal title cannot be empty');
      }
    }
    
    // Description validation
    if (dealData.description && dealData.description.length > 1000) {
      errors.push('Deal description cannot exceed 1000 characters');
    }
    
    // Value validation
    if (dealData.value !== undefined && dealData.value !== null) {
      if (typeof dealData.value !== 'number' || isNaN(dealData.value)) {
        errors.push('Deal value must be a valid number');
      } else if (dealData.value < 0) {
        errors.push('Deal value cannot be negative');
      } else if (dealData.value > 999999999) {
        errors.push('Deal value cannot exceed 999,999,999');
      }
    }
    
    // Currency validation
    if (dealData.currency) {
      const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'CNY'];
      if (!validCurrencies.includes(dealData.currency.toUpperCase())) {
        errors.push('Invalid currency code');
      }
    }
    
    // Stage validation
    if (dealData.stage) {
      const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
      if (!validStages.includes(dealData.stage)) {
        errors.push('Invalid deal stage');
      }
    }
    
    // Pipeline validation
    if (dealData.pipeline) {
      const validPipelines = ['sales', 'marketing', 'custom'];
      if (!validPipelines.includes(dealData.pipeline.toLowerCase())) {
        errors.push('Invalid pipeline type');
      }
    }
    
    // Probability validation
    if (dealData.probability !== undefined && dealData.probability !== null) {
      if (typeof dealData.probability !== 'number' || isNaN(dealData.probability)) {
        errors.push('Probability must be a valid number');
      } else if (dealData.probability < 0 || dealData.probability > 100) {
        errors.push('Probability must be between 0 and 100');
      }
    }
    
    // Source validation
    if (dealData.source) {
      const validSources = ['inbound', 'outbound', 'referral', 'partner', 'marketing', 'cold_call', 'website', 'event', 'other'];
      if (!validSources.includes(dealData.source)) {
        errors.push('Invalid deal source');
      }
    }
    
    // Deal type validation
    if (dealData.dealType) {
      const validTypes = ['new_business', 'existing_business', 'renewal', 'upsell', 'cross_sell'];
      if (!validTypes.includes(dealData.dealType)) {
        errors.push('Invalid deal type');
      }
    }
    
    // Priority validation
    if (dealData.priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(dealData.priority)) {
        errors.push('Invalid priority level');
      }
    }
    
    // Date validations
    if (dealData.expectedCloseDate) {
      const expectedDate = new Date(dealData.expectedCloseDate);
      if (isNaN(expectedDate.getTime())) {
        errors.push('Invalid expected close date format');
      } else if (expectedDate < new Date() && !isUpdate) {
        errors.push('Expected close date cannot be in the past');
      }
    }
    
    if (dealData.actualCloseDate) {
      const actualDate = new Date(dealData.actualCloseDate);
      if (isNaN(actualDate.getTime())) {
        errors.push('Invalid actual close date format');
      } else if (actualDate > new Date()) {
        errors.push('Actual close date cannot be in the future');
      }
    }
    
    if (dealData.nextFollowUpDate) {
      const followUpDate = new Date(dealData.nextFollowUpDate);
      if (isNaN(followUpDate.getTime())) {
        errors.push('Invalid follow-up date format');
      }
    }
    
    if (dealData.lastActivityDate) {
      const lastActivityDate = new Date(dealData.lastActivityDate);
      if (isNaN(lastActivityDate.getTime())) {
        errors.push('Invalid last activity date format');
      } else if (lastActivityDate > new Date()) {
        errors.push('Last activity date cannot be in the future');
      }
    }
    
    // Close reason validation
    if (dealData.closeReason && dealData.closeReason.length > 500) {
      errors.push('Close reason cannot exceed 500 characters');
    }
    
    // Lost reason validation
    if (dealData.lostReason) {
      const validLostReasons = ['price', 'competitor', 'timing', 'budget', 'no_decision', 'requirements', 'other'];
      if (!validLostReasons.includes(dealData.lostReason)) {
        errors.push('Invalid lost reason');
      }
    }
    
    // Competitor name validation
    if (dealData.competitorName && dealData.competitorName.length > 100) {
      errors.push('Competitor name cannot exceed 100 characters');
    }
    
    // Company validation
    if (dealData.company && dealData.company.length > 100) {
      errors.push('Company name cannot exceed 100 characters');
    }
    
    // Products validation
    if (dealData.products && Array.isArray(dealData.products)) {
      dealData.products.forEach((product, index) => {
        if (!product.name || !product.name.trim()) {
          errors.push(`Product ${index + 1}: Name is required`);
        } else if (product.name.length > 100) {
          errors.push(`Product ${index + 1}: Name cannot exceed 100 characters`);
        }
        
        if (product.quantity === undefined || product.quantity === null) {
          errors.push(`Product ${index + 1}: Quantity is required`);
        } else if (typeof product.quantity !== 'number' || product.quantity < 1) {
          errors.push(`Product ${index + 1}: Quantity must be at least 1`);
        }
        
        if (product.unitPrice === undefined || product.unitPrice === null) {
          errors.push(`Product ${index + 1}: Unit price is required`);
        } else if (typeof product.unitPrice !== 'number' || product.unitPrice < 0) {
          errors.push(`Product ${index + 1}: Unit price cannot be negative`);
        }
        
        if (product.totalPrice === undefined || product.totalPrice === null) {
          errors.push(`Product ${index + 1}: Total price is required`);
        } else if (typeof product.totalPrice !== 'number' || product.totalPrice < 0) {
          errors.push(`Product ${index + 1}: Total price cannot be negative`);
        }
        
        // Validate that totalPrice = quantity * unitPrice
        if (product.quantity && product.unitPrice && product.totalPrice) {
          const expectedTotal = product.quantity * product.unitPrice;
          if (Math.abs(product.totalPrice - expectedTotal) > 0.01) {
            errors.push(`Product ${index + 1}: Total price should equal quantity × unit price`);
          }
        }
        
        if (product.description && product.description.length > 200) {
          errors.push(`Product ${index + 1}: Description cannot exceed 200 characters`);
        }
      });
    }
    
    // Tags validation
    if (dealData.tags && Array.isArray(dealData.tags)) {
      dealData.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`Tag at index ${index} must be a string`);
        } else if (tag.length > 50) {
          errors.push(`Tag "${tag}" cannot exceed 50 characters`);
        } else if (tag.trim().length === 0) {
          errors.push(`Tag at index ${index} cannot be empty`);
        }
      });
      
      // Check for duplicate tags
      const uniqueTags = [...new Set(dealData.tags)];
      if (uniqueTags.length !== dealData.tags.length) {
        errors.push('Duplicate tags are not allowed');
      }
    }
    
    // Notes validation
    if (dealData.notes && dealData.notes.length > 2000) {
      errors.push('Notes cannot exceed 2000 characters');
    }
    
    // Business logic validations
    if (dealData.stage === 'closed_won' || dealData.stage === 'closed_lost') {
      if (!dealData.closeReason && !isImport) {
        errors.push('Close reason is required for closed deals');
      }
      if (dealData.stage === 'closed_lost' && !dealData.lostReason && !isImport) {
        errors.push('Lost reason is required for lost deals');
      }
    }
    
    // Forecast category validation
    if (dealData.forecastCategory) {
      const validCategories = ['pipeline', 'best_case', 'commit', 'closed'];
      if (!validCategories.includes(dealData.forecastCategory)) {
        errors.push('Invalid forecast category');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Sanitize deal data before saving
   * @param {Object} dealData - The deal data to sanitize
   * @returns {Object} - Sanitized deal data
   */
  static sanitizeDealData(dealData) {
    const sanitized = { ...dealData };
    
    // Trim and sanitize string fields
    const stringFields = ['title', 'description', 'company', 'closeReason', 'competitorName', 'importSource'];
    stringFields.forEach(field => {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        sanitized[field] = this.sanitizeString(sanitized[field]);
      }
    });
    
    // Sanitize HTML content fields (notes, description)
    const htmlFields = ['notes', 'description'];
    htmlFields.forEach(field => {
      if (sanitized[field] && typeof sanitized[field] === 'string') {
        sanitized[field] = this.sanitizeHtml(sanitized[field]);
      }
    });
    
    // Sanitize currency (uppercase)
    if (sanitized.currency) {
      sanitized.currency = sanitized.currency.toUpperCase();
    }
    
    // Sanitize pipeline (lowercase)
    if (sanitized.pipeline) {
      sanitized.pipeline = sanitized.pipeline.toLowerCase();
    }
    
    // Sanitize tags
    if (sanitized.tags && Array.isArray(sanitized.tags)) {
      sanitized.tags = sanitized.tags
        .map(tag => this.sanitizeString(tag))
        .filter(tag => tag.length > 0)
        .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
    }
    
    // Sanitize products
    if (sanitized.products && Array.isArray(sanitized.products)) {
      sanitized.products = sanitized.products.map(product => ({
        ...product,
        name: this.sanitizeString(product.name || ''),
        description: product.description ? this.sanitizeString(product.description) : undefined
      }));
    }
    
    // Sanitize custom fields
    if (sanitized.customFields && sanitized.customFields instanceof Map) {
      const sanitizedCustomFields = new Map();
      for (const [key, value] of sanitized.customFields) {
        const sanitizedKey = this.sanitizeString(key);
        const sanitizedValue = typeof value === 'string' ? this.sanitizeString(value) : value;
        sanitizedCustomFields.set(sanitizedKey, sanitizedValue);
      }
      sanitized.customFields = sanitizedCustomFields;
    }
    
    return sanitized;
  }
  
  /**
   * Sanitize a regular string field
   * @param {string} str - The string to sanitize
   * @returns {string} - Sanitized string
   */
  static sanitizeString(str) {
    if (!str || typeof str !== 'string') return '';
    
    // Trim whitespace
    str = str.trim();
    
    // Remove null bytes and control characters
    str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Escape HTML entities to prevent XSS
    str = validator.escape(str);
    
    return str;
  }
  
  /**
   * Sanitize HTML content (for notes, descriptions)
   * @param {string} html - The HTML content to sanitize
   * @returns {string} - Sanitized HTML
   */
  static sanitizeHtml(html) {
    if (!html || typeof html !== 'string') return '';
    
    // First trim and remove control characters
    html = html.trim();
    html = html.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Use DOMPurify to sanitize HTML and prevent XSS
    const cleanHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
    
    return cleanHtml;
  }
  
  /**
   * Validate deal data for bulk import
   * @param {Array} dealsArray - Array of deal objects
   * @returns {Object} - { validDeals: Array, invalidDeals: Array }
   */
  static validateBulkImport(dealsArray) {
    const validDeals = [];
    const invalidDeals = [];
    const duplicateTitles = new Set();
    const seenTitles = new Set();
    
    dealsArray.forEach((deal, index) => {
      const rowNumber = index + 1; // 1-based row numbering for user-friendly error reporting
      const validation = this.validateDealData(deal, false, true);
      const importErrors = [];
      
      // Check for duplicate titles within the import
      if (deal.title) {
        const normalizedTitle = deal.title.toLowerCase().trim();
        if (seenTitles.has(normalizedTitle)) {
          duplicateTitles.add(normalizedTitle);
          importErrors.push(`Duplicate deal title found in import at row ${rowNumber}`);
        } else {
          seenTitles.add(normalizedTitle);
        }
      }
      
      // Additional import-specific validations
      const importValidation = this.validateImportSpecificRules(deal, rowNumber);
      importErrors.push(...importValidation.errors);
      
      // Combine validation errors
      const allErrors = [...validation.errors, ...importErrors];
      
      if (allErrors.length === 0) {
        validDeals.push({
          ...this.sanitizeDealData(deal),
          importIndex: index,
          rowNumber: rowNumber
        });
      } else {
        invalidDeals.push({
          deal: deal,
          errors: allErrors,
          importIndex: index,
          rowNumber: rowNumber
        });
      }
    });
    
    return {
      validDeals,
      invalidDeals,
      duplicateTitles: Array.from(duplicateTitles),
      summary: {
        total: dealsArray.length,
        valid: validDeals.length,
        invalid: invalidDeals.length,
        duplicates: duplicateTitles.size
      }
    };
  }
  
  /**
   * Validate import-specific rules
   * @param {Object} deal - Deal data to validate
   * @param {number} rowNumber - Row number in the import file
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  static validateImportSpecificRules(deal, rowNumber) {
    const errors = [];
    
    // Check for completely empty rows
    const hasAnyData = Object.values(deal).some(value => 
      value !== null && value !== undefined && value !== ''
    );
    
    if (!hasAnyData) {
      errors.push(`Row ${rowNumber}: Empty row detected`);
      return { isValid: false, errors };
    }
    
    // Validate required fields for import
    if (!deal.title || !deal.title.trim()) {
      errors.push(`Row ${rowNumber}: Deal title is required for import`);
    }
    
    if (deal.value === undefined || deal.value === null || deal.value === '') {
      errors.push(`Row ${rowNumber}: Deal value is required for import`);
    }
    
    if (!deal.expectedCloseDate) {
      errors.push(`Row ${rowNumber}: Expected close date is required for import`);
    }
    
    // Validate data types for import
    if (deal.value !== undefined && deal.value !== null && deal.value !== '') {
      const numValue = Number(deal.value);
      if (isNaN(numValue)) {
        errors.push(`Row ${rowNumber}: Deal value must be a valid number`);
      }
    }
    
    if (deal.probability !== undefined && deal.probability !== null && deal.probability !== '') {
      const numProbability = Number(deal.probability);
      if (isNaN(numProbability)) {
        errors.push(`Row ${rowNumber}: Probability must be a valid number`);
      }
    }
    
    // Validate enum values for import
    if (deal.stage && !['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].includes(deal.stage)) {
      errors.push(`Row ${rowNumber}: Invalid stage. Must be one of: lead, qualified, proposal, negotiation, closed_won, closed_lost`);
    }
    
    if (deal.priority && !['low', 'medium', 'high', 'urgent'].includes(deal.priority)) {
      errors.push(`Row ${rowNumber}: Invalid priority. Must be one of: low, medium, high, urgent`);
    }
    
    if (deal.source && !['inbound', 'outbound', 'referral', 'partner', 'marketing', 'cold_call', 'website', 'event', 'other'].includes(deal.source)) {
      errors.push(`Row ${rowNumber}: Invalid source. Must be one of: inbound, outbound, referral, partner, marketing, cold_call, website, event, other`);
    }
    
    if (deal.dealType && !['new_business', 'existing_business', 'renewal', 'upsell', 'cross_sell'].includes(deal.dealType)) {
      errors.push(`Row ${rowNumber}: Invalid deal type. Must be one of: new_business, existing_business, renewal, upsell, cross_sell`);
    }
    
    // Validate tags format for import
    if (deal.tags) {
      if (typeof deal.tags === 'string') {
        // Convert comma-separated string to array
        deal.tags = deal.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      
      if (Array.isArray(deal.tags)) {
        deal.tags.forEach((tag, tagIndex) => {
          if (typeof tag !== 'string' || tag.length > 50) {
            errors.push(`Row ${rowNumber}: Tag ${tagIndex + 1} is invalid or exceeds 50 characters`);
          }
        });
      } else {
        errors.push(`Row ${rowNumber}: Tags must be a comma-separated string or array`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Validate CSV headers for deal import
   * @param {Array} headers - Array of CSV headers
   * @returns {Object} - { isValid: boolean, errors: Array, warnings: Array }
   */
  static validateImportHeaders(headers) {
    const errors = [];
    const warnings = [];
    
    const requiredHeaders = ['title', 'value', 'expectedCloseDate'];
    const optionalHeaders = [
      'description', 'currency', 'stage', 'pipeline', 'probability', 'company',
      'source', 'dealType', 'priority', 'actualCloseDate', 'nextFollowUpDate',
      'lastActivityDate', 'closeReason', 'lostReason', 'competitorName',
      'tags', 'notes'
    ];
    
    const validHeaders = [...requiredHeaders, ...optionalHeaders];
    
    // Check for required headers
    requiredHeaders.forEach(header => {
      if (!headers.includes(header)) {
        errors.push(`Required header '${header}' is missing`);
      }
    });
    
    // Check for invalid headers
    headers.forEach(header => {
      if (!validHeaders.includes(header)) {
        warnings.push(`Unknown header '${header}' will be ignored`);
      }
    });
    
    // Check for duplicate headers
    const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
    if (duplicateHeaders.length > 0) {
      errors.push(`Duplicate headers found: ${duplicateHeaders.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      validHeaders: headers.filter(header => validHeaders.includes(header))
    };
  }
  
  /**
   * Transform CSV row data to deal object
   * @param {Object} rowData - Raw CSV row data
   * @param {Array} validHeaders - Valid headers to process
   * @returns {Object} - Transformed deal object
   */
  static transformCsvRowToDeal(rowData, validHeaders) {
    const deal = {};
    
    // Map basic fields
    const basicFields = [
      'title', 'description', 'currency', 'stage', 'pipeline', 'company',
      'source', 'dealType', 'priority', 'closeReason', 'lostReason', 
      'competitorName', 'notes'
    ];
    
    basicFields.forEach(field => {
      if (validHeaders.includes(field) && rowData[field] !== undefined) {
        deal[field] = rowData[field];
      }
    });
    
    // Handle numeric fields
    const numericFields = ['value', 'probability'];
    numericFields.forEach(field => {
      if (validHeaders.includes(field) && rowData[field] !== undefined && rowData[field] !== '') {
        const numValue = Number(rowData[field]);
        if (!isNaN(numValue)) {
          deal[field] = numValue;
        }
      }
    });
    
    // Handle date fields
    const dateFields = ['expectedCloseDate', 'actualCloseDate', 'nextFollowUpDate', 'lastActivityDate'];
    dateFields.forEach(field => {
      if (validHeaders.includes(field) && rowData[field] !== undefined && rowData[field] !== '') {
        const date = new Date(rowData[field]);
        if (!isNaN(date.getTime())) {
          deal[field] = date;
        }
      }
    });
    
    // Handle tags (convert comma-separated string to array)
    if (validHeaders.includes('tags') && rowData.tags) {
      deal.tags = rowData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    
    return deal;
  }
}

module.exports = DealValidation; 