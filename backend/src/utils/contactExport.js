const Contact = require('../models/Contact');

/**
 * Contact Export Utility
 * Provides functionality to export contacts in various formats
 */

class ContactExport {
  /**
   * Export contacts to CSV format
   * @param {string} ownerId - The user ID who owns the contacts
   * @param {Object} options - Export options
   * @returns {Object} - { success: boolean, data: string, filename: string, count: number }
   */
  static async exportToCSV(ownerId, options = {}) {
    try {
      const {
        filters = {},
        fields = null, // null means all fields
        includeHeaders = true,
        dateFormat = 'YYYY-MM-DD',
        delimiter = ','
      } = options;

      // Build query
      const query = { owner: ownerId, isDuplicate: false, ...filters };
      
      // Fetch contacts
      const contacts = await Contact.find(query)
        .sort({ createdAt: -1 })
        .lean();

      if (contacts.length === 0) {
        return {
          success: false,
          error: 'No contacts found for export',
          count: 0
        };
      }

      // Determine fields to export
      const exportFields = fields || this.getDefaultExportFields();
      
      // Generate CSV content
      const csvContent = this.generateCSVContent(contacts, exportFields, {
        includeHeaders,
        dateFormat,
        delimiter
      });

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `contacts_export_${timestamp}.csv`;

      return {
        success: true,
        data: csvContent,
        filename: filename,
        count: contacts.length,
        fields: exportFields
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        count: 0
      };
    }
  }

  /**
   * Get default fields for export
   * @returns {Array} - Array of field names
   */
  static getDefaultExportFields() {
    return [
      'firstName',
      'lastName',
      'email',
      'phone',
      'company',
      'jobTitle',
      'department',
      'status',
      'priority',
      'leadSource',
      'website',
      'linkedinUrl',
      'street',
      'city',
      'state',
      'zipCode',
      'country',
      'tags',
      'notes',
      'description',
      'lastContactDate',
      'nextFollowUpDate',
      'interactionCount',
      'createdAt',
      'updatedAt',
      // Social Media fields
      'twitter',
      'facebook',
      'instagram',
      // Preference fields
      'preferredContactMethod',
      'timezone',
      'doNotContact',
      'emailOptOut'
    ];
  }

  /**
   * Generate CSV content from contacts data
   * @param {Array} contacts - Array of contact objects
   * @param {Array} fields - Fields to include in export
   * @param {Object} options - Formatting options
   * @returns {string} - CSV content
   */
  static generateCSVContent(contacts, fields, options = {}) {
    const { includeHeaders = true, dateFormat = 'YYYY-MM-DD', delimiter = ',' } = options;
    
    let csvContent = '';

    // Add headers if requested
    if (includeHeaders) {
      const headers = fields.map(field => this.getFieldDisplayName(field));
      csvContent += headers.join(delimiter) + '\n';
    }

    // Add data rows
    contacts.forEach(contact => {
      const row = fields.map(field => {
        const value = this.extractFieldValue(contact, field);
        return this.formatCSVValue(value, field, dateFormat);
      });
      csvContent += row.join(delimiter) + '\n';
    });

    return csvContent;
  }

  /**
   * Extract field value from contact object
   * @param {Object} contact - Contact object
   * @param {string} field - Field name
   * @returns {any} - Field value
   */
  static extractFieldValue(contact, field) {
    switch (field) {
      case 'street':
        return contact.address?.street || '';
      case 'city':
        return contact.address?.city || '';
      case 'state':
        return contact.address?.state || '';
      case 'zipCode':
        return contact.address?.zipCode || '';
      case 'country':
        return contact.address?.country || '';
      case 'twitter':
        return contact.socialMedia?.twitter || '';
      case 'facebook':
        return contact.socialMedia?.facebook || '';
      case 'instagram':
        return contact.socialMedia?.instagram || '';
      case 'tags':
        return Array.isArray(contact.tags) ? contact.tags.join('; ') : '';
      case 'preferredContactMethod':
        return contact.preferences?.preferredContactMethod || '';
      case 'timezone':
        return contact.preferences?.timezone || '';
      case 'doNotContact':
        return contact.preferences?.doNotContact ? 'Yes' : 'No';
      case 'emailOptOut':
        return contact.preferences?.emailOptOut ? 'Yes' : 'No';
      default:
        return contact[field] || '';
    }
  }

  /**
   * Format value for CSV output
   * @param {any} value - Value to format
   * @param {string} field - Field name
   * @param {string} dateFormat - Date format string
   * @returns {string} - Formatted value
   */
  static formatCSVValue(value, field, dateFormat) {
    if (value === null || value === undefined) {
      return '';
    }

    // Handle dates
    if (field.includes('Date') || field.includes('At')) {
      if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
        const date = new Date(value);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      }
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle strings that might contain commas or quotes
    if (typeof value === 'string') {
      // Escape quotes and wrap in quotes if contains delimiter
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
    }

    return String(value);
  }

  /**
   * Get display name for field
   * @param {string} field - Field name
   * @returns {string} - Display name
   */
  static getFieldDisplayName(field) {
    const displayNames = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      jobTitle: 'Job Title',
      department: 'Department',
      status: 'Status',
      priority: 'Priority',
      leadSource: 'Lead Source',
      website: 'Website',
      linkedinUrl: 'LinkedIn URL',
      street: 'Street Address',
      city: 'City',
      state: 'State',
      zipCode: 'Zip Code',
      country: 'Country',
      tags: 'Tags',
      notes: 'Notes',
      description: 'Description',
      lastContactDate: 'Last Contact Date',
      nextFollowUpDate: 'Next Follow-up Date',
      interactionCount: 'Interaction Count',
      createdAt: 'Created Date',
      updatedAt: 'Updated Date',
      twitter: 'Twitter',
      facebook: 'Facebook',
      instagram: 'Instagram',
      preferredContactMethod: 'Preferred Contact Method',
      timezone: 'Timezone',
      doNotContact: 'Do Not Contact',
      emailOptOut: 'Email Opt Out'
    };

    return displayNames[field] || field;
  }

  /**
   * Export contacts with specific filters
   * @param {string} ownerId - The user ID who owns the contacts
   * @param {Object} filters - Filter criteria
   * @returns {Object} - Export result
   */
  static async exportByStatus(ownerId, status) {
    return this.exportToCSV(ownerId, {
      filters: { status: status }
    });
  }

  /**
   * Export contacts by company
   * @param {string} ownerId - The user ID who owns the contacts
   * @param {string} company - Company name
   * @returns {Object} - Export result
   */
  static async exportByCompany(ownerId, company) {
    return this.exportToCSV(ownerId, {
      filters: { company: new RegExp(company, 'i') }
    });
  }

  /**
   * Export contacts by date range
   * @param {string} ownerId - The user ID who owns the contacts
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} - Export result
   */
  static async exportByDateRange(ownerId, startDate, endDate) {
    return this.exportToCSV(ownerId, {
      filters: {
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    });
  }

  /**
   * Export contacts with overdue follow-ups
   * @param {string} ownerId - The user ID who owns the contacts
   * @returns {Object} - Export result
   */
  static async exportOverdueFollowUps(ownerId) {
    return this.exportToCSV(ownerId, {
      filters: {
        nextFollowUpDate: { $lt: new Date() }
      }
    });
  }

  /**
   * Get export template (empty CSV with headers)
   * @returns {Object} - Template result
   */
  static getImportTemplate() {
    const fields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'company',
      'jobTitle',
      'department',
      'status',
      'priority',
      'leadSource',
      'website',
      'linkedinUrl',
      'street',
      'city',
      'state',
      'zipCode',
      'country',
      'tags',
      'notes',
      'description'
    ];

    // Use actual field names instead of display names for import template
    const csvContent = fields.join(',') + '\n';

    return {
      success: true,
      data: csvContent,
      filename: 'contacts_import_template.csv',
      fields: fields
    };
  }

  /**
   * Validate export options
   * @param {Object} options - Export options
   * @returns {Object} - Validation result
   */
  static validateExportOptions(options) {
    const errors = [];
    const validFields = this.getDefaultExportFields();

    if (options.fields && Array.isArray(options.fields)) {
      const invalidFields = options.fields.filter(field => !validFields.includes(field));
      if (invalidFields.length > 0) {
        errors.push(`Invalid fields: ${invalidFields.join(', ')}`);
      }
    }

    if (options.delimiter && typeof options.delimiter !== 'string') {
      errors.push('Delimiter must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = ContactExport; 