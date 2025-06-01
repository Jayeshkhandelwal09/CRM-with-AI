const fs = require('fs');
const path = require('path');
const ContactImport = require('../utils/contactImport');
const ContactExport = require('../utils/contactExport');
const logger = require('../utils/logger');

/**
 * Import contacts from CSV file
 * POST /api/csv/contacts/import
 */
const importContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No CSV file uploaded'
      });
    }

    const filePath = req.file.path;
    
    try {
      // Read file buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      // Validate file
      const fileValidation = ContactImport.validateImportFile(fileBuffer);
      if (!fileValidation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid file',
          details: fileValidation.errors
        });
      }

      // Import options from query parameters
      const options = {
        skipDuplicates: req.query.skipDuplicates !== 'false', // default true
        updateExisting: req.query.updateExisting === 'true', // default false
        validateOnly: req.query.validateOnly === 'true', // default false
        batchSize: parseInt(req.query.batchSize) || 100
      };

      // Import contacts using utility
      const importResult = await ContactImport.importFromFileBuffer(userId, fileBuffer, options);

      if (!importResult.success) {
        return res.status(400).json(importResult);
      }

      logger.info(`CSV import completed for user ${userId}`, {
        userId,
        summary: importResult.summary,
        validateOnly: options.validateOnly
      });

      res.status(200).json({
        success: true,
        message: options.validateOnly ? 'CSV validation completed' : 'CSV import completed',
        data: importResult
      });

    } finally {
      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        logger.error('Error cleaning up uploaded file:', cleanupError);
      }
    }

  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        logger.error('Error cleaning up uploaded file:', cleanupError);
      }
    }

    logger.error('Error importing contacts from CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import contacts from CSV'
    });
  }
};

/**
 * Preview CSV import without actually importing
 * POST /api/csv/contacts/preview
 */
const previewImport = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No CSV file uploaded'
      });
    }

    const filePath = req.file.path;
    
    try {
      // Read file content
      const csvContent = fs.readFileSync(filePath, 'utf8');
      
      // Preview import using utility
      const previewResult = await ContactImport.previewImport(userId, csvContent);

      if (!previewResult.success) {
        return res.status(400).json(previewResult);
      }

      logger.info(`CSV preview completed for user ${userId}`, {
        userId,
        summary: previewResult.summary
      });

      res.status(200).json({
        success: true,
        message: 'CSV preview completed',
        data: previewResult
      });

    } finally {
      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        logger.error('Error cleaning up uploaded file:', cleanupError);
      }
    }

  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        logger.error('Error cleaning up uploaded file:', cleanupError);
      }
    }

    logger.error('Error previewing CSV import:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to preview CSV import'
    });
  }
};

/**
 * Export contacts to CSV file
 * GET /api/csv/contacts/export
 */
const exportContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Build filters from query parameters
    const filters = {};
    
    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.company) {
      filters.company = new RegExp(req.query.company, 'i');
    }

    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) ? req.query.tags : [req.query.tags];
      filters.tags = { $in: tags };
    }

    if (req.query.search) {
      const searchTerm = req.query.search;
      filters.$or = [
        { firstName: new RegExp(searchTerm, 'i') },
        { lastName: new RegExp(searchTerm, 'i') },
        { email: new RegExp(searchTerm, 'i') },
        { company: new RegExp(searchTerm, 'i') },
        { jobTitle: new RegExp(searchTerm, 'i') },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }

    // Export options
    const options = {
      filters: filters,
      fields: req.query.fields ? req.query.fields.split(',') : null,
      includeHeaders: req.query.includeHeaders !== 'false', // default true
      dateFormat: req.query.dateFormat || 'YYYY-MM-DD',
      delimiter: req.query.delimiter || ','
    };

    // Validate export options
    const validation = ContactExport.validateExportOptions(options);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid export options',
        details: validation.errors
      });
    }

    // Export contacts using utility
    const exportResult = await ContactExport.exportToCSV(userId, options);

    if (!exportResult.success) {
      return res.status(404).json(exportResult);
    }

    logger.info(`CSV export completed for user ${userId}`, {
      userId,
      contactsExported: exportResult.count,
      filename: exportResult.filename
    });

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(exportResult.data, 'utf8'));

    // Send CSV data
    res.status(200).send(exportResult.data);

  } catch (error) {
    logger.error('Error exporting contacts to CSV:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export contacts to CSV'
    });
  }
};

/**
 * Get import template CSV
 * GET /api/csv/contacts/template
 */
const getImportTemplate = async (req, res) => {
  try {
    const templateResult = ContactExport.getImportTemplate();

    if (!templateResult.success) {
      return res.status(500).json(templateResult);
    }

    logger.info('Import template requested');

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${templateResult.filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(templateResult.data, 'utf8'));

    // Send template data
    res.status(200).send(templateResult.data);

  } catch (error) {
    logger.error('Error generating import template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate import template'
    });
  }
};

/**
 * Get import statistics for user
 * GET /api/csv/contacts/stats
 */
const getImportStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const statsResult = await ContactImport.getImportStats(userId);

    if (!statsResult.success) {
      return res.status(500).json(statsResult);
    }

    logger.info(`Import stats retrieved for user ${userId}`);

    res.status(200).json({
      success: true,
      data: statsResult
    });

  } catch (error) {
    logger.error('Error retrieving import stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve import statistics'
    });
  }
};

/**
 * Clean up duplicate contacts
 * DELETE /api/csv/contacts/duplicates
 */
const cleanupDuplicates = async (req, res) => {
  try {
    const userId = req.user.id;

    const cleanupResult = await ContactImport.cleanupDuplicates(userId);

    if (!cleanupResult.success) {
      return res.status(500).json(cleanupResult);
    }

    logger.info(`Duplicate cleanup completed for user ${userId}`, {
      userId,
      duplicatesRemoved: cleanupResult.duplicatesRemoved
    });

    res.status(200).json({
      success: true,
      message: 'Duplicate contacts cleaned up successfully',
      data: cleanupResult
    });

  } catch (error) {
    logger.error('Error cleaning up duplicates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clean up duplicate contacts'
    });
  }
};

module.exports = {
  importContacts,
  previewImport,
  exportContacts,
  getImportTemplate,
  getImportStats,
  cleanupDuplicates
}; 