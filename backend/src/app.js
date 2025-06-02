const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import middleware
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import utilities
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const csvRoutes = require('./routes/csv');
const dealRoutes = require('./routes/deals');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS middleware
app.use(corsMiddleware);

// Rate limiting
app.use('/api/', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API routes
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CRM AI API v1.0',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      contacts: '/api/contacts',
      deals: '/api/deals',
      interactions: '/api/interactions',
      objections: '/api/objections',
      ai: '/api/ai',
      analytics: '/api/analytics',
      csv: '/api/csv',
    },
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/csv', csvRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app; 