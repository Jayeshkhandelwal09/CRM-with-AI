// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

// App Configuration
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'CRM AI'
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'

// Application Limits (matching backend)
export const LIMITS = {
  CONTACTS_PER_USER: 2000,
  DEALS_PER_USER: 5000,
  CSV_IMPORT_MAX_RECORDS: 1000,
  AI_REQUESTS_PER_DAY: 100,
  MAX_FILE_SIZE: 5242880, // 5MB
} as const

// Deal Stages
export const DEAL_STAGES = {
  LEAD: 'lead',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  CLOSED_WON: 'closed_won',
  CLOSED_LOST: 'closed_lost',
} as const

export const DEAL_STAGE_LABELS = {
  [DEAL_STAGES.LEAD]: 'Lead',
  [DEAL_STAGES.QUALIFIED]: 'Qualified',
  [DEAL_STAGES.PROPOSAL]: 'Proposal',
  [DEAL_STAGES.NEGOTIATION]: 'Negotiation',
  [DEAL_STAGES.CLOSED_WON]: 'Closed Won',
  [DEAL_STAGES.CLOSED_LOST]: 'Closed Lost',
} as const

// Contact Types
export const CONTACT_TYPES = {
  LEAD: 'lead',
  PROSPECT: 'prospect',
  CUSTOMER: 'customer',
  PARTNER: 'partner',
} as const

export const CONTACT_TYPE_LABELS = {
  [CONTACT_TYPES.LEAD]: 'Lead',
  [CONTACT_TYPES.PROSPECT]: 'Prospect',
  [CONTACT_TYPES.CUSTOMER]: 'Customer',
  [CONTACT_TYPES.PARTNER]: 'Partner',
} as const

// Interaction Types
export const INTERACTION_TYPES = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  NOTE: 'note',
  TASK: 'task',
} as const

// AI Confidence Levels
export const AI_CONFIDENCE_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const

export const AI_CONFIDENCE_LABELS = {
  [AI_CONFIDENCE_LEVELS.HIGH]: 'High Confidence',
  [AI_CONFIDENCE_LEVELS.MEDIUM]: 'Medium Confidence',
  [AI_CONFIDENCE_LEVELS.LOW]: 'Low Confidence',
} as const

// Status Colors (matching design system)
export const STATUS_COLORS = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-orange-100 text-orange-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
} as const

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  CONTACTS: '/dashboard/contacts',
  DEALS: '/dashboard/deals',
  ANALYTICS: '/dashboard/analytics',
  AI: '/dashboard/ai',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'crm_auth_token',
  REFRESH_TOKEN: 'crm_refresh_token',
  USER_PREFERENCES: 'crm_user_preferences',
  THEME: 'crm_theme',
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// Feature Flags
export const FEATURES = {
  AI_ENABLED: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true',
  ANALYTICS_ENABLED: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
} as const 