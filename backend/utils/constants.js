/**
 * Application Constants
 * Centralized constants and enums for the CRM application
 */

// Deal related constants
const DEAL_STAGES = {
  PROSPECTING: 'prospecting',
  QUALIFICATION: 'qualification',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost'
};

const DEAL_SOURCES = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
  REFERRAL: 'referral',
  PARTNER: 'partner',
  EVENT: 'event',
  ADVERTISEMENT: 'advertisement'
};

const DEAL_TYPES = {
  NEW_BUSINESS: 'new_business',
  EXISTING_CUSTOMER: 'existing_customer',
  UPSELL: 'upsell',
  RENEWAL: 'renewal'
};

// Contact related constants
const CONTACT_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PROSPECT: 'prospect',
  CUSTOMER: 'customer',
  LOST: 'lost'
};

const LEAD_SOURCES = {
  WEBSITE: 'website',
  REFERRAL: 'referral',
  COLD_OUTREACH: 'cold_outreach',
  SOCIAL_MEDIA: 'social_media',
  EVENT: 'event',
  ADVERTISEMENT: 'advertisement',
  OTHER: 'other'
};

// Priority levels
const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Currencies
const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  CAD: 'CAD',
  AUD: 'AUD'
};

// Interaction types
const INTERACTION_TYPES = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  DEMO: 'demo',
  PROPOSAL_SENT: 'proposal_sent',
  FOLLOW_UP: 'follow_up',
  NEGOTIATION: 'negotiation',
  OBJECTION_HANDLING: 'objection_handling',
  CONTRACT_REVIEW: 'contract_review',
  CLOSING: 'closing',
  POST_SALE: 'post_sale',
  OTHER: 'other'
};

// Interaction directions
const INTERACTION_DIRECTIONS = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound'
};

// Interaction statuses
const INTERACTION_STATUSES = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

// Interaction outcomes
const INTERACTION_OUTCOMES = {
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative'
};

// Contact types
const CONTACT_TYPES = {
  LEAD: 'lead',
  PROSPECT: 'prospect',
  CUSTOMER: 'customer',
  PARTNER: 'partner'
};

// Company sizes
const COMPANY_SIZES = {
  STARTUP: 'startup',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  ENTERPRISE: 'enterprise'
};

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES_REP: 'sales_rep',
  USER: 'user'
};

// Validation limits
const VALIDATION_LIMITS = {
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
  NOTES_MAX_LENGTH: 2000,
  TAG_MAX_LENGTH: 30,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  COMPANY_NAME_MAX_LENGTH: 200,
  ADDRESS_MAX_LENGTH: 500,
  DEAL_VALUE_MAX: 999999999,
  INTERACTION_DURATION_MAX: 1440, // 24 hours in minutes
  LOCATION_MAX_LENGTH: 200,
  ATTENDEE_NAME_MAX_LENGTH: 100,
  COMPETITOR_NAME_MAX_LENGTH: 100,
  COMPETITOR_NOTES_MAX_LENGTH: 500,
  STAGE_NOTES_MAX_LENGTH: 500,
  NEXT_STEPS_MAX_LENGTH: 1000,
  SEARCH_QUERY_MAX_LENGTH: 100,
  
  // Contact specific limits
  CONTACT: {
    FIRST_NAME_MAX: 50,
    LAST_NAME_MAX: 50,
    EMAIL_MAX: 255,
    COMPANY_MAX: 100,
    JOB_TITLE_MAX: 100,
    DEPARTMENT_MAX: 50,
    NOTES_MAX: 2000,
    TAG_MAX: 30
  },
  
  // Pagination limits
  PAGINATION: {
    MAX_LIMIT: 100,
    DEFAULT_LIMIT: 20
  },
  
  // Search limits
  SEARCH: {
    MAX_LENGTH: 100
  }
};

// Pagination defaults
const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
};

// Date formats
const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm'
};

// Error messages
const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource conflict',
  INTERNAL_ERROR: 'Internal server error',
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  CONTACT_NOT_FOUND: 'Contact not found or access denied',
  DEAL_NOT_FOUND: 'Deal not found or access denied',
  INTERACTION_NOT_FOUND: 'Interaction not found',
  INVALID_STAGE_TRANSITION: 'Invalid stage transition',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  DUPLICATE_DEAL: 'A deal with this title already exists for this contact',
  CANNOT_UPDATE_DELETED: 'Cannot update deleted resource',
  ALREADY_DELETED: 'Resource is already deleted',
  NOT_DELETED: 'Resource is not deleted',
  TAG_NOT_FOUND: 'Tag not found on resource'
};

// Success messages
const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  RESTORED: 'Resource restored successfully',
  RETRIEVED: 'Data retrieved successfully',
  TAGS_ADDED: 'Tags added successfully',
  TAG_REMOVED: 'Tag removed successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

// Export all constants
module.exports = {
  DEAL_STAGES,
  DEAL_SOURCES,
  DEAL_TYPES,
  CONTACT_STATUSES,
  LEAD_SOURCES,
  PRIORITY_LEVELS,
  CURRENCIES,
  INTERACTION_TYPES,
  INTERACTION_DIRECTIONS,
  INTERACTION_STATUSES,
  INTERACTION_OUTCOMES,
  CONTACT_TYPES,
  COMPANY_SIZES,
  USER_ROLES,
  VALIDATION_LIMITS,
  PAGINATION_DEFAULTS,
  DATE_FORMATS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS
}; 