// Deal stages as per CRM requirements
const DEAL_STAGES = {
  LEAD: 'lead',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost',
};

// Deal stage progression order
const DEAL_STAGE_ORDER = [
  DEAL_STAGES.LEAD,
  DEAL_STAGES.QUALIFIED,
  DEAL_STAGES.PROPOSAL,
  DEAL_STAGES.NEGOTIATION,
  DEAL_STAGES.CLOSED_WON, // or CLOSED_LOST
];

// Contact types
const CONTACT_TYPES = {
  LEAD: 'lead',
  PROSPECT: 'prospect',
  CUSTOMER: 'customer',
  PARTNER: 'partner',
};

// Interaction types
const INTERACTION_TYPES = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  NOTE: 'note',
  TASK: 'task',
};

// AI confidence levels
const AI_CONFIDENCE_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES_REP: 'sales_rep',
  USER: 'user',
};

// Application limits (as per requirements)
const LIMITS = {
  CONTACTS_PER_USER: 2000,
  DEALS_PER_USER: 5000,
  CSV_IMPORT_MAX_RECORDS: 1000,
  AI_REQUESTS_PER_DAY: 100,
  MAX_FILE_SIZE: 5242880, // 5MB
  MAX_OBJECTION_LENGTH: 1000,
  MAX_DEAL_VALUE: 10000000, // 10M
};

// HTTP status codes
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
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Validation patterns
const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

// Default pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  DEAL_STAGES,
  DEAL_STAGE_ORDER,
  CONTACT_TYPES,
  INTERACTION_TYPES,
  AI_CONFIDENCE_LEVELS,
  USER_ROLES,
  LIMITS,
  HTTP_STATUS,
  VALIDATION_PATTERNS,
  PAGINATION,
}; 