const validator = require('validator');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create DOMPurify instance for server-side use
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Contact Validation Utility
 * Provides comprehensive validation rules for contact data
 */

class ContactValidation {
  /**
   * Validate contact data before creation or update
   * @param {Object} contactData - The contact data to validate
   * @param {boolean} isUpdate - Whether this is an update operation
   * @param {boolean} isImport - Whether this is an import operation
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  static validateContactData(contactData, isUpdate = false, isImport = false) {
    const errors = [];
    
    // Required field validation (only for creation, not for imports)
    if (!isUpdate && !isImport) {
      if (!contactData.firstName || !contactData.firstName.trim()) {
        errors.push('First name is required');
      }
      if (!contactData.lastName || !contactData.lastName.trim()) {
        errors.push('Last name is required');
      }
      if (!contactData.email || !contactData.email.trim()) {
        errors.push('Email is required');
      }
      if (!contactData.owner) {
        errors.push('Contact owner is required');
      }
    }
    
    // For imports, validate required fields differently
    if (isImport) {
      if (!contactData.firstName || !contactData.firstName.trim()) {
        errors.push('First name is required');
      }
      if (!contactData.lastName || !contactData.lastName.trim()) {
        errors.push('Last name is required');
      }
      if (!contactData.email || !contactData.email.trim()) {
        errors.push('Email is required');
      }
      // Owner is not required for import validation as it's added during import
    }
    
    // Email validation
    if (contactData.email) {
      if (!validator.isEmail(contactData.email)) {
        errors.push('Please provide a valid email address');
      }
      if (contactData.email.length > 100) {
        errors.push('Email cannot exceed 100 characters');
      }
    }
    
    // Name validation
    if (contactData.firstName) {
      if (contactData.firstName.length > 50) {
        errors.push('First name cannot exceed 50 characters');
      }
      if (!/^[a-zA-Z\s\-'\.]+$/.test(contactData.firstName)) {
        errors.push('First name can only contain letters, spaces, hyphens, apostrophes, and periods');
      }
    }
    
    if (contactData.lastName) {
      if (contactData.lastName.length > 50) {
        errors.push('Last name cannot exceed 50 characters');
      }
      if (!/^[a-zA-Z\s\-'\.]+$/.test(contactData.lastName)) {
        errors.push('Last name can only contain letters, spaces, hyphens, apostrophes, and periods');
      }
    }
    
    // Phone validation
    if (contactData.phone) {
      // More flexible phone validation - allow various formats
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)\.]{7,20}$/;
      if (!phoneRegex.test(contactData.phone.replace(/\s/g, ''))) {
        errors.push('Please provide a valid phone number');
      }
    }
    
    // Website validation
    if (contactData.website) {
      if (!validator.isURL(contactData.website, { protocols: ['http', 'https'] })) {
        errors.push('Please provide a valid website URL');
      }
    }
    
    // LinkedIn URL validation
    if (contactData.linkedinUrl) {
      if (!validator.isURL(contactData.linkedinUrl) || 
          !contactData.linkedinUrl.includes('linkedin.com')) {
        errors.push('Please provide a valid LinkedIn URL');
      }
    }
    
    // Company validation
    if (contactData.company && contactData.company.length > 100) {
      errors.push('Company name cannot exceed 100 characters');
    }
    
    // Job title validation
    if (contactData.jobTitle && contactData.jobTitle.length > 100) {
      errors.push('Job title cannot exceed 100 characters');
    }
    
    // Department validation
    if (contactData.department && contactData.department.length > 100) {
      errors.push('Department cannot exceed 100 characters');
    }
    
    // Address validation
    if (contactData.address) {
      const addr = contactData.address;
      if (addr.street && addr.street.length > 200) {
        errors.push('Street address cannot exceed 200 characters');
      }
      if (addr.city && addr.city.length > 100) {
        errors.push('City cannot exceed 100 characters');
      }
      if (addr.state && addr.state.length > 100) {
        errors.push('State cannot exceed 100 characters');
      }
      if (addr.zipCode && addr.zipCode.length > 20) {
        errors.push('Zip code cannot exceed 20 characters');
      }
      if (addr.country && addr.country.length > 100) {
        errors.push('Country cannot exceed 100 characters');
      }
      
      // Postal code validation based on country
      if (addr.zipCode && addr.country) {
        if (!this.validatePostalCode(addr.zipCode, addr.country)) {
          errors.push('Invalid postal code format for the specified country');
        }
      }
    }
    
    // Status validation
    if (contactData.status) {
      const validStatuses = ['active', 'inactive', 'prospect', 'customer', 'lead'];
      if (!validStatuses.includes(contactData.status)) {
        errors.push('Invalid contact status');
      }
    }
    
    // Lead source validation
    if (contactData.leadSource) {
      const validSources = ['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'event', 'advertisement', 'other'];
      if (!validSources.includes(contactData.leadSource)) {
        errors.push('Invalid lead source');
      }
    }
    
    // Priority validation
    if (contactData.priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(contactData.priority)) {
        errors.push('Invalid priority level');
      }
    }
    
    // Tags validation
    if (contactData.tags && Array.isArray(contactData.tags)) {
      contactData.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push(`Tag at index ${index} must be a string`);
        } else if (tag.length > 50) {
          errors.push(`Tag "${tag}" cannot exceed 50 characters`);
        } else if (tag.trim().length === 0) {
          errors.push(`Tag at index ${index} cannot be empty`);
        }
      });
      
      // Check for duplicate tags
      const uniqueTags = [...new Set(contactData.tags)];
      if (uniqueTags.length !== contactData.tags.length) {
        errors.push('Duplicate tags are not allowed');
      }
    }
    
    // Notes validation
    if (contactData.notes && contactData.notes.length > 2000) {
      errors.push('Notes cannot exceed 2000 characters');
    }
    
    // Description validation
    if (contactData.description && contactData.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }
    
    // Date validations
    if (contactData.nextFollowUpDate) {
      const followUpDate = new Date(contactData.nextFollowUpDate);
      if (isNaN(followUpDate.getTime())) {
        errors.push('Invalid follow-up date format');
      } else if (followUpDate < new Date()) {
        errors.push('Follow-up date cannot be in the past');
      }
    }
    
    if (contactData.lastContactDate) {
      const lastContactDate = new Date(contactData.lastContactDate);
      if (isNaN(lastContactDate.getTime())) {
        errors.push('Invalid last contact date format');
      } else if (lastContactDate > new Date()) {
        errors.push('Last contact date cannot be in the future');
      }
    }
    
    // Social media validation
    if (contactData.socialMedia) {
      const social = contactData.socialMedia;
      if (social.twitter && !this.validateSocialMediaUrl(social.twitter, 'twitter')) {
        errors.push('Invalid Twitter URL format');
      }
      if (social.facebook && !this.validateSocialMediaUrl(social.facebook, 'facebook')) {
        errors.push('Invalid Facebook URL format');
      }
      if (social.instagram && !this.validateSocialMediaUrl(social.instagram, 'instagram')) {
        errors.push('Invalid Instagram URL format');
      }
    }
    
    // Preferences validation
    if (contactData.preferences) {
      const prefs = contactData.preferences;
      if (prefs.preferredContactMethod) {
        const validMethods = ['email', 'phone', 'linkedin', 'in_person'];
        if (!validMethods.includes(prefs.preferredContactMethod)) {
          errors.push('Invalid preferred contact method');
        }
      }
      
      if (prefs.timezone && !this.validateTimezone(prefs.timezone)) {
        errors.push('Invalid timezone format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
  
  /**
   * Validate postal code format based on country
   * @param {string} postalCode - The postal code to validate
   * @param {string} country - The country code or name
   * @returns {boolean} - Whether the postal code is valid
   */
  static validatePostalCode(postalCode, country) {
    const patterns = {
      'US': /^\d{5}(-\d{4})?$/,
      'CA': /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/,
      'UK': /^[A-Za-z]{1,2}\d[A-Za-z\d]? \d[A-Za-z]{2}$/,
      'DE': /^\d{5}$/,
      'FR': /^\d{5}$/,
      'IN': /^\d{6}$/,
      'AU': /^\d{4}$/
    };
    
    const countryCode = country.toUpperCase();
    const pattern = patterns[countryCode];
    
    if (!pattern) {
      // If we don't have a specific pattern, just check it's not empty and reasonable length
      return postalCode.length >= 3 && postalCode.length <= 10;
    }
    
    return pattern.test(postalCode);
  }
  
  /**
   * Validate social media URL format
   * @param {string} url - The social media URL
   * @param {string} platform - The platform (twitter, facebook, instagram)
   * @returns {boolean} - Whether the URL is valid
   */
  static validateSocialMediaUrl(url, platform) {
    if (!validator.isURL(url)) return false;
    
    const patterns = {
      twitter: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/,
      facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/,
      instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/
    };
    
    return patterns[platform] ? patterns[platform].test(url) : true;
  }
  
  /**
   * Validate timezone format
   * @param {string} timezone - The timezone string
   * @returns {boolean} - Whether the timezone is valid
   */
  static validateTimezone(timezone) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Sanitize contact data before saving
   * @param {Object} contactData - The contact data to sanitize
   * @returns {Object} - Sanitized contact data
   */
  static sanitizeContactData(contactData) {
    const sanitized = { ...contactData };
    
    // Trim and sanitize string fields
    const stringFields = ['firstName', 'lastName', 'email', 'phone', 'company', 'jobTitle', 'department', 'website', 'linkedinUrl', 'importSource'];
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
    
    // Sanitize email
    if (sanitized.email) {
      sanitized.email = validator.normalizeEmail(sanitized.email.toLowerCase());
    }
    
    // Sanitize phone number
    if (sanitized.phone) {
      sanitized.phone = this.sanitizePhoneNumber(sanitized.phone);
    }
    
    // Sanitize tags
    if (sanitized.tags && Array.isArray(sanitized.tags)) {
      sanitized.tags = sanitized.tags
        .map(tag => this.sanitizeString(tag))
        .filter(tag => tag.length > 0)
        .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
    }
    
    // Sanitize address
    if (sanitized.address) {
      const addressFields = ['street', 'city', 'state', 'zipCode', 'country'];
      addressFields.forEach(field => {
        if (sanitized.address[field] && typeof sanitized.address[field] === 'string') {
          sanitized.address[field] = this.sanitizeString(sanitized.address[field]);
        }
      });
    }
    
    // Sanitize social media URLs
    if (sanitized.socialMedia) {
      const socialFields = ['twitter', 'facebook', 'instagram'];
      socialFields.forEach(field => {
        if (sanitized.socialMedia[field] && typeof sanitized.socialMedia[field] === 'string') {
          sanitized.socialMedia[field] = this.sanitizeUrl(sanitized.socialMedia[field]);
        }
      });
    }
    
    // Sanitize website and LinkedIn URLs
    if (sanitized.website) {
      sanitized.website = this.sanitizeUrl(sanitized.website);
    }
    if (sanitized.linkedinUrl) {
      sanitized.linkedinUrl = this.sanitizeUrl(sanitized.linkedinUrl);
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
   * Sanitize URL fields
   * @param {string} url - The URL to sanitize
   * @returns {string} - Sanitized URL
   */
  static sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    
    // Trim and remove control characters
    url = url.trim();
    url = url.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    
    // Ensure URL has protocol
    if (url && !url.match(/^https?:\/\//)) {
      url = 'https://' + url;
    }
    
    // Validate and normalize URL
    try {
      const urlObj = new URL(url);
      // Only allow http and https protocols
      if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
        return '';
      }
      return urlObj.toString();
    } catch (error) {
      return '';
    }
  }
  
  /**
   * Sanitize phone number
   * @param {string} phone - The phone number to sanitize
   * @returns {string} - Sanitized phone number
   */
  static sanitizePhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') return '';
    
    // Remove all non-digit, non-plus, non-parentheses, non-hyphen, non-space characters
    phone = phone.replace(/[^\d\+\(\)\-\s\.]/g, '');
    
    // Trim whitespace
    phone = phone.trim();
    
    return phone;
  }
  
  /**
   * Validate contact data for bulk import
   * @param {Array} contactsArray - Array of contact objects
   * @returns {Object} - { validContacts: Array, invalidContacts: Array }
   */
  static validateBulkImport(contactsArray) {
    const validContacts = [];
    const invalidContacts = [];
    const duplicateEmails = new Set();
    const seenEmails = new Set();
    
    contactsArray.forEach((contact, index) => {
      const rowNumber = index + 1; // 1-based row numbering for user-friendly error reporting
      const validation = this.validateContactData(contact, false, true);
      const importErrors = [];
      
      // Check for duplicate emails within the import
      if (contact.email) {
        const normalizedEmail = contact.email.toLowerCase().trim();
        if (seenEmails.has(normalizedEmail)) {
          duplicateEmails.add(normalizedEmail);
          importErrors.push(`Duplicate email found in import at row ${rowNumber}`);
        } else {
          seenEmails.add(normalizedEmail);
        }
      }
      
      // Additional import-specific validations
      const importValidation = this.validateImportSpecificRules(contact, rowNumber);
      importErrors.push(...importValidation.errors);
      
      // Combine validation errors
      const allErrors = [...validation.errors, ...importErrors];
      
      if (allErrors.length === 0) {
        validContacts.push({
          ...this.sanitizeContactData(contact),
          importIndex: index,
          rowNumber: rowNumber
        });
      } else {
        invalidContacts.push({
          contact: contact,
          errors: allErrors,
          importIndex: index,
          rowNumber: rowNumber
        });
      }
    });
    
    return {
      validContacts,
      invalidContacts,
      duplicateEmails: Array.from(duplicateEmails),
      summary: {
        total: contactsArray.length,
        valid: validContacts.length,
        invalid: invalidContacts.length,
        duplicates: duplicateEmails.size
      }
    };
  }
  
  /**
   * Validate import-specific rules
   * @param {Object} contact - Contact data to validate
   * @param {number} rowNumber - Row number in the import file
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  static validateImportSpecificRules(contact, rowNumber) {
    const errors = [];
    
    // Check for completely empty rows
    const hasAnyData = Object.values(contact).some(value => 
      value !== null && value !== undefined && value !== ''
    );
    
    if (!hasAnyData) {
      errors.push(`Row ${rowNumber}: Empty row detected`);
      return { isValid: false, errors };
    }
    
    // Validate required fields for import (owner is not required here as it's added during import)
    if (!contact.firstName || !contact.firstName.trim()) {
      errors.push(`Row ${rowNumber}: First name is required for import`);
    }
    
    if (!contact.lastName || !contact.lastName.trim()) {
      errors.push(`Row ${rowNumber}: Last name is required for import`);
    }
    
    if (!contact.email || !contact.email.trim()) {
      errors.push(`Row ${rowNumber}: Email is required for import`);
    }
    
    // Validate data length limits for import
    if (contact.firstName && contact.firstName.length > 50) {
      errors.push(`Row ${rowNumber}: First name exceeds 50 characters`);
    }
    
    if (contact.lastName && contact.lastName.length > 50) {
      errors.push(`Row ${rowNumber}: Last name exceeds 50 characters`);
    }
    
    if (contact.company && contact.company.length > 100) {
      errors.push(`Row ${rowNumber}: Company name exceeds 100 characters`);
    }
    
    // Validate enum values for import
    if (contact.status && !['active', 'inactive', 'prospect', 'customer', 'lead'].includes(contact.status)) {
      errors.push(`Row ${rowNumber}: Invalid status. Must be one of: active, inactive, prospect, customer, lead`);
    }
    
    if (contact.priority && !['low', 'medium', 'high', 'urgent'].includes(contact.priority)) {
      errors.push(`Row ${rowNumber}: Invalid priority. Must be one of: low, medium, high, urgent`);
    }
    
    if (contact.leadSource && !['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'event', 'advertisement', 'other'].includes(contact.leadSource)) {
      errors.push(`Row ${rowNumber}: Invalid lead source. Must be one of: website, referral, social_media, email_campaign, cold_call, event, advertisement, other`);
    }
    
    // Validate tags format for import
    if (contact.tags) {
      if (typeof contact.tags === 'string') {
        // Convert comma-separated string to array
        contact.tags = contact.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
      
      if (Array.isArray(contact.tags)) {
        contact.tags.forEach((tag, tagIndex) => {
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
   * Validate CSV headers for contact import
   * @param {Array} headers - Array of CSV headers
   * @returns {Object} - { isValid: boolean, errors: Array, warnings: Array }
   */
  static validateImportHeaders(headers) {
    const errors = [];
    const warnings = [];
    
    const requiredHeaders = ['firstName', 'lastName', 'email'];
    const optionalHeaders = [
      'phone', 'company', 'jobTitle', 'department', 'website', 'linkedinUrl',
      'status', 'leadSource', 'priority', 'tags', 'notes', 'description',
      'street', 'city', 'state', 'zipCode', 'country',
      'twitter', 'facebook', 'instagram'
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
   * Transform CSV row data to contact object
   * @param {Object} rowData - Raw CSV row data
   * @param {Array} validHeaders - Valid headers to process
   * @returns {Object} - Transformed contact object
   */
  static transformCsvRowToContact(rowData, validHeaders) {
    const contact = {};
    
    // Map basic fields
    const basicFields = ['firstName', 'lastName', 'email', 'phone', 'company', 'jobTitle', 'department', 'website', 'linkedinUrl', 'status', 'leadSource', 'priority', 'notes', 'description'];
    basicFields.forEach(field => {
      if (validHeaders.includes(field) && rowData[field] !== undefined) {
        contact[field] = rowData[field];
      }
    });
    
    // Handle address fields
    const addressFields = ['street', 'city', 'state', 'zipCode', 'country'];
    const hasAddressData = addressFields.some(field => validHeaders.includes(field) && rowData[field]);
    
    if (hasAddressData) {
      contact.address = {};
      addressFields.forEach(field => {
        if (validHeaders.includes(field) && rowData[field] !== undefined) {
          contact.address[field] = rowData[field];
        }
      });
    }
    
    // Handle social media fields
    const socialFields = ['twitter', 'facebook', 'instagram'];
    const hasSocialData = socialFields.some(field => validHeaders.includes(field) && rowData[field]);
    
    if (hasSocialData) {
      contact.socialMedia = {};
      socialFields.forEach(field => {
        if (validHeaders.includes(field) && rowData[field] !== undefined) {
          contact.socialMedia[field] = rowData[field];
        }
      });
    }
    
    // Handle tags (convert comma-separated string to array)
    if (validHeaders.includes('tags') && rowData.tags) {
      contact.tags = rowData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    
    return contact;
  }
}

module.exports = ContactValidation; 