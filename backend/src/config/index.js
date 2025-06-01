const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/crm-ai-dev',
  mongoTestUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/crm-ai-test',

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  jwtExpire: process.env.JWT_EXPIRE || '24h',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',

  // CORS Configuration
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // AI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY,
  aiRequestsPerDay: parseInt(process.env.AI_REQUESTS_PER_DAY) || 100,

  // File Upload Configuration
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
  uploadPath: process.env.UPLOAD_PATH || 'uploads/',

  // Email Configuration
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Logging Configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  logFile: process.env.LOG_FILE || 'logs/combined.log',
  errorLogFile: process.env.ERROR_LOG_FILE || 'logs/error.log',

  // Application Limits (as per requirements)
  limits: {
    contactsPerUser: 2000,
    dealsPerUser: 5000,
    csvImportMaxRecords: 1000,
    aiRequestsPerDay: 100,
  },
};

// Validate required environment variables in production
if (config.nodeEnv === 'production') {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
}

module.exports = config; 