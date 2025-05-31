require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Connect to MongoDB (optional for now)
const connectDB = async () => {
  try {
    const connectDBModule = require('./config/database');
    await connectDBModule();
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed (optional for testing):', error.message);
    console.log('📝 Server will continue without database connection');
  }
};

connectDB();

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

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
const requestLogger = require('./middleware/requestLogger');
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AI-CRM Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const dealRoutes = require('./routes/deals');
const interactionRoutes = require('./routes/interactions');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/interactions', interactionRoutes);

app.get('/api', (req, res) => {
  res.json({
    message: 'AI-Powered CRM API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      contacts: '/api/contacts',
      deals: '/api/deals',
      interactions: '/api/interactions',
      ai: '/api/ai',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`🚀 AI-CRM Backend server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Available endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Contacts: http://localhost:${PORT}/api/contacts`);
  console.log(`   - Deals: http://localhost:${PORT}/api/deals`);
  console.log(`   - Interactions: http://localhost:${PORT}/api/interactions`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; 