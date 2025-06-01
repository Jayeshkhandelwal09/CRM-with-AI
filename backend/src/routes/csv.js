const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Import middleware
const { verifyToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// Import controller
const {
  importContacts,
  previewImport,
  exportContacts,
  getImportTemplate,
  getImportStats,
  cleanupDuplicates
} = require('../controllers/csvController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `import-${timestamp}-${originalName}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Only allow CSV files
  if (file.mimetype === 'text/csv' || 
      file.mimetype === 'application/csv' ||
      file.originalname.toLowerCase().endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

// Apply authentication middleware to all routes
router.use(verifyToken);

// Apply rate limiting to all CSV routes
router.use(apiLimiter);

/**
 * @route   POST /api/csv/contacts/import
 * @desc    Import contacts from CSV file
 * @access  Private
 * @params  skipDuplicates, updateExisting, validateOnly, batchSize (optional)
 */
router.post('/contacts/import', upload.single('csvFile'), (req, res, next) => {
  // Handle multer errors
  if (req.fileValidationError) {
    return res.status(400).json({
      success: false,
      error: req.fileValidationError
    });
  }
  next();
}, importContacts);

/**
 * @route   POST /api/csv/contacts/preview
 * @desc    Preview CSV import without actually importing
 * @access  Private
 */
router.post('/contacts/preview', upload.single('csvFile'), (req, res, next) => {
  // Handle multer errors
  if (req.fileValidationError) {
    return res.status(400).json({
      success: false,
      error: req.fileValidationError
    });
  }
  next();
}, previewImport);

/**
 * @route   GET /api/csv/contacts/export
 * @desc    Export contacts to CSV file
 * @access  Private
 * @params  status, company, tags, search, fields, includeHeaders, dateFormat, delimiter (optional filters)
 */
router.get('/contacts/export', exportContacts);

/**
 * @route   GET /api/csv/contacts/template
 * @desc    Download CSV import template
 * @access  Private
 */
router.get('/contacts/template', getImportTemplate);

/**
 * @route   GET /api/csv/contacts/stats
 * @desc    Get import statistics for user
 * @access  Private
 */
router.get('/contacts/stats', getImportStats);

/**
 * @route   DELETE /api/csv/contacts/duplicates
 * @desc    Clean up duplicate contacts
 * @access  Private
 */
router.delete('/contacts/duplicates', cleanupDuplicates);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Only one file allowed.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${error.message}`
    });
  }
  
  if (error.message === 'Only CSV files are allowed') {
    return res.status(400).json({
      success: false,
      error: 'Only CSV files are allowed'
    });
  }
  
  next(error);
});

module.exports = router; 