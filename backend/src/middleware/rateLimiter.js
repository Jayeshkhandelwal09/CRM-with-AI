const rateLimit = require('express-rate-limit');
const config = require('../config');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs, // 15 minutes
  max: config.rateLimitMaxRequests, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Contact endpoints rate limiter
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 contact requests per 15 minutes
  message: {
    success: false,
    error: 'Too many contact requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoints rate limiter (more restrictive)
const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: config.aiRequestsPerDay, // limit each IP to 100 AI requests per day
  message: {
    success: false,
    error: 'Daily AI request limit exceeded. Please try again tomorrow.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Deal endpoints rate limiter
const dealLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 deal creation requests per 15 minutes
  message: {
    success: false,
    error: 'Too many deal creation requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  contactLimiter,
  aiLimiter,
  dealLimiter,
}; 