const Contact = require('../models/Contact');
const User = require('../models/User');
const ContactValidation = require('./contactValidation');

/**
 * Contact Import Utility
 * Provides functionality to import contacts from CSV files
 */

class ContactImport {
  /**
   * Import contacts from CSV data
   * @param {string} ownerId - The user ID who will own the contacts
   * @param {Array} csvData - Array of contact objects from CSV
   * @param {Object} options - Import options
   * @returns {Object} - Import result with success/failure details
   */
  static async importFromCSV(ownerId, csvData, options = {}) {
    try {
      const {
        skipDuplicates = true,
        updateExisting = false,
        validateOnly = false,
        batchSize = 100
      } = options;

      // Validate user exists and can add contacts
      const user = await User.findById(ownerId);
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          results: null
        };
      }

      // Validate CSV data
      const validation = ContactValidation.validateBulkImport(csvData);
      
      if (validateOnly) {
        return {
          success: true,
          validateOnly: true,
          validation: validation,
          results: null
        };
      }

      // Check if user has capacity for new contacts
      const newContactsCount = validation.validContacts.length;
      const currentCount = user.usage.contactsCount;
      const maxContacts = user.limits.contacts;

      if (currentCount + newContactsCount > maxContacts) {
        return {
          success: false,
          error: `Import would exceed contact limit. Current: ${currentCount}, Importing: ${newContactsCount}, Limit: ${maxContacts}`,
          results: null
        };
      }

      // Process valid contacts
      const importResults = await this.processContactImport(
        ownerId, 
        validation.validContacts, 
        { skipDuplicates, updateExisting, batchSize }
      );

      return {
        success: true,
        validation: validation,
        results: importResults,
        summary: {
          total: csvData.length,
          valid: validation.validContacts.length,
          invalid: validation.invalidContacts.length,
          imported: importResults.imported.length,
          skipped: importResults.skipped.length,
          updated: importResults.updated.length,
          failed: importResults.failed.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        results: null
      };
    }
  }

  /**
   * Process the actual import of validated contacts
   * @param {string} ownerId - The user ID
   * @param {Array} validContacts - Array of validated contact objects
   * @param {Object} options - Processing options
   * @returns {Object} - Processing results
   */
  static async processContactImport(ownerId, validContacts, options = {}) {
    const { skipDuplicates = true, updateExisting = false, batchSize = 100 } = options;
    
    const results = {
      imported: [],
      skipped: [],
      updated: [],
      failed: []
    };

    // Process contacts in batches
    for (let i = 0; i < validContacts.length; i += batchSize) {
      const batch = validContacts.slice(i, i + batchSize);
      
      for (const contactData of batch) {
        try {
          // Add owner to contact data
          contactData.owner = ownerId;
          
          // Check for existing contact by email
          const existingContact = await Contact.findOne({
            email: contactData.email.toLowerCase(),
            owner: ownerId,
            isDuplicate: false
          });

          if (existingContact) {
            if (updateExisting) {
              // Update existing contact
              Object.assign(existingContact, contactData);
              existingContact.importDate = new Date();
              existingContact.importSource = 'csv_import';
              
              await existingContact.save();
              results.updated.push({
                contact: existingContact,
                rowNumber: contactData.rowNumber,
                action: 'updated'
              });
            } else if (skipDuplicates) {
              // Skip duplicate
              results.skipped.push({
                contact: contactData,
                rowNumber: contactData.rowNumber,
                reason: 'duplicate_email',
                existingId: existingContact._id
              });
            } else {
              // Create as duplicate
              contactData.isDuplicate = true;
              contactData.duplicateOf = existingContact._id;
              contactData.importDate = new Date();
              contactData.importSource = 'csv_import';
              
              const newContact = new Contact(contactData);
              await newContact.save();
              
              results.imported.push({
                contact: newContact,
                rowNumber: contactData.rowNumber,
                action: 'imported_as_duplicate'
              });
            }
          } else {
            // Create new contact
            contactData.importDate = new Date();
            contactData.importSource = 'csv_import';
            
            const newContact = new Contact(contactData);
            await newContact.save();
            
            results.imported.push({
              contact: newContact,
              rowNumber: contactData.rowNumber,
              action: 'imported'
            });
          }

        } catch (error) {
          results.failed.push({
            contact: contactData,
            rowNumber: contactData.rowNumber,
            error: error.message
          });
        }
      }
    }

    return results;
  }

  /**
   * Parse CSV content to contact objects
   * @param {string} csvContent - Raw CSV content
   * @param {Object} options - Parsing options
   * @returns {Object} - Parsed data with headers and rows
   */
  static parseCSVContent(csvContent, options = {}) {
    try {
      const { delimiter = ',', skipEmptyRows = true } = options;
      
      const lines = csvContent.split('\n').map(line => line.trim());
      
      if (lines.length < 2) {
        return {
          success: false,
          error: 'CSV must contain at least a header row and one data row',
          data: null
        };
      }

      // Parse headers
      const headers = this.parseCSVRow(lines[0], delimiter);
      
      // Validate headers
      const headerValidation = ContactValidation.validateImportHeaders(headers);
      if (!headerValidation.isValid) {
        return {
          success: false,
          error: 'Invalid CSV headers',
          headerErrors: headerValidation.errors,
          data: null
        };
      }

      // Parse data rows
      const contacts = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        if (skipEmptyRows && !line) {
          continue;
        }

        const values = this.parseCSVRow(line, delimiter);
        
        // Create contact object from row
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // Transform to contact object
        const contact = ContactValidation.transformCsvRowToContact(rowData, headerValidation.validHeaders);
        contacts.push(contact);
      }

      return {
        success: true,
        headers: headers,
        headerValidation: headerValidation,
        contacts: contacts,
        totalRows: contacts.length
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Parse a single CSV row
   * @param {string} row - CSV row string
   * @param {string} delimiter - Field delimiter
   * @returns {Array} - Array of field values
   */
  static parseCSVRow(row, delimiter = ',') {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // Field separator
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    values.push(current.trim());
    
    return values;
  }

  /**
   * Import contacts from file buffer
   * @param {string} ownerId - The user ID
   * @param {Buffer} fileBuffer - File buffer
   * @param {Object} options - Import options
   * @returns {Object} - Import result
   */
  static async importFromFileBuffer(ownerId, fileBuffer, options = {}) {
    try {
      const csvContent = fileBuffer.toString('utf8');
      
      // Parse CSV content
      const parseResult = this.parseCSVContent(csvContent, options);
      
      if (!parseResult.success) {
        return parseResult;
      }

      // Import contacts
      return await this.importFromCSV(ownerId, parseResult.contacts, options);

    } catch (error) {
      return {
        success: false,
        error: error.message,
        results: null
      };
    }
  }

  /**
   * Preview import without actually importing
   * @param {string} ownerId - The user ID
   * @param {string} csvContent - CSV content
   * @param {Object} options - Preview options
   * @returns {Object} - Preview result
   */
  static async previewImport(ownerId, csvContent, options = {}) {
    try {
      // Parse CSV content
      const parseResult = this.parseCSVContent(csvContent, options);
      
      if (!parseResult.success) {
        return parseResult;
      }

      // Validate only (don't import)
      const importResult = await this.importFromCSV(ownerId, parseResult.contacts, {
        ...options,
        validateOnly: true
      });

      return {
        success: true,
        preview: true,
        parsing: parseResult,
        validation: importResult.validation,
        summary: {
          totalRows: parseResult.totalRows,
          validContacts: importResult.validation.validContacts.length,
          invalidContacts: importResult.validation.invalidContacts.length,
          duplicateEmails: importResult.validation.duplicateEmails.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        preview: null
      };
    }
  }

  /**
   * Get import statistics for a user
   * @param {string} ownerId - The user ID
   * @returns {Object} - Import statistics
   */
  static async getImportStats(ownerId) {
    try {
      const stats = await Contact.aggregate([
        { $match: { owner: ownerId, importSource: { $exists: true } } },
        {
          $group: {
            _id: '$importSource',
            count: { $sum: 1 },
            latestImport: { $max: '$importDate' }
          }
        }
      ]);

      const totalImported = await Contact.countDocuments({
        owner: ownerId,
        importSource: { $exists: true }
      });

      return {
        success: true,
        totalImported: totalImported,
        bySource: stats,
        lastImportDate: stats.length > 0 ? Math.max(...stats.map(s => s.latestImport)) : null
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stats: null
      };
    }
  }

  /**
   * Clean up duplicate contacts created during import
   * @param {string} ownerId - The user ID
   * @returns {Object} - Cleanup result
   */
  static async cleanupDuplicates(ownerId) {
    try {
      const duplicates = await Contact.find({
        owner: ownerId,
        isDuplicate: true
      });

      const deleteResult = await Contact.deleteMany({
        owner: ownerId,
        isDuplicate: true
      });

      return {
        success: true,
        duplicatesFound: duplicates.length,
        duplicatesRemoved: deleteResult.deletedCount
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        result: null
      };
    }
  }

  /**
   * Validate import file size and format
   * @param {Buffer} fileBuffer - File buffer
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result
   */
  static validateImportFile(fileBuffer, options = {}) {
    const { maxSizeBytes = 5 * 1024 * 1024, maxRows = 1000 } = options; // 5MB, 1000 rows default
    
    const errors = [];
    
    // Check file size
    if (fileBuffer.length > maxSizeBytes) {
      errors.push(`File size exceeds limit of ${maxSizeBytes / 1024 / 1024}MB`);
    }
    
    // Check if it's valid text
    try {
      const content = fileBuffer.toString('utf8');
      const lines = content.split('\n');
      
      if (lines.length > maxRows) {
        errors.push(`File contains too many rows. Maximum allowed: ${maxRows}`);
      }
      
      if (lines.length < 2) {
        errors.push('File must contain at least a header row and one data row');
      }
      
    } catch (error) {
      errors.push('File is not valid UTF-8 text');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      fileSize: fileBuffer.length,
      fileSizeMB: (fileBuffer.length / 1024 / 1024).toFixed(2)
    };
  }
}

module.exports = ContactImport; 