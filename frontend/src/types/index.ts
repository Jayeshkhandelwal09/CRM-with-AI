// Base types
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  company: string;
  department?: string;
  aiRequestsUsed: number;
  aiRequestsLimit: number;
  avatar?: string;
  timezone: string;
  preferences: UserPreferences;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  onboardingSteps: OnboardingSteps;
  lastLogin?: string;
  fullName: string;
}

export type UserRole = 'SDR' | 'AE' | 'Manager' | 'Admin';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    dealUpdates: boolean;
    aiInsights: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface OnboardingSteps {
  profileSetup: boolean;
  teamInvite: boolean;
  firstDeal: boolean;
  aiTutorial: boolean;
}

// Contact types
export interface Contact extends BaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  position?: string;
  status: ContactStatus;
  source: ContactSource;
  tags: string[];
  notes?: string;
  socialProfiles?: SocialProfiles;
  customFields?: Record<string, any>;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  leadScore?: number;
  isDeleted: boolean;
  fullName: string;
  userId: string;
}

export type ContactStatus = 'new' | 'qualified' | 'contacted' | 'nurturing' | 'converted' | 'lost';
export type ContactSource = 'website' | 'referral' | 'social' | 'email' | 'phone' | 'event' | 'other';

export interface SocialProfiles {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

// Deal types
export interface Deal extends BaseEntity {
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  status: DealStatus;
  tags: string[];
  notes?: string;
  customFields?: Record<string, any>;
  isDeleted: boolean;
  userId: string;
  contactId?: string;
  contact?: Contact;
}

export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
export type DealStatus = 'open' | 'won' | 'lost' | 'on-hold';

// Interaction types
export interface Interaction extends BaseEntity {
  type: InteractionType;
  subject: string;
  description?: string;
  date: string;
  duration?: number;
  outcome?: InteractionOutcome;
  notes?: string;
  tags: string[];
  customFields?: Record<string, any>;
  isDeleted: boolean;
  userId: string;
  contactId?: string;
  dealId?: string;
  contact?: Contact;
  deal?: Deal;
}

export type InteractionType = 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'follow-up' | 'other';
export type InteractionOutcome = 'positive' | 'neutral' | 'negative' | 'no-response';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
  role: UserRole;
  department?: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  position?: string;
  status: ContactStatus;
  source: ContactSource;
  tags: string[];
  notes?: string;
  socialProfiles?: SocialProfiles;
  customFields?: Record<string, any>;
  nextFollowUpDate?: string;
}

export interface DealFormData {
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedCloseDate?: string;
  tags: string[];
  notes?: string;
  customFields?: Record<string, any>;
  contactId?: string;
}

export interface InteractionFormData {
  type: InteractionType;
  subject: string;
  description?: string;
  date: string;
  duration?: number;
  outcome?: InteractionOutcome;
  notes?: string;
  tags: string[];
  customFields?: Record<string, any>;
  contactId?: string;
  dealId?: string;
}

// Filter and search types
export interface ContactFilters {
  status?: ContactStatus[];
  source?: ContactSource[];
  tags?: string[];
  company?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface DealFilters {
  stage?: DealStage[];
  status?: DealStatus[];
  tags?: string[];
  valueRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// UI Component types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: ValidationError[];
}

// Constants
export const USER_ROLES: SelectOption[] = [
  { value: 'SDR', label: 'SDR (Sales Development Rep)' },
  { value: 'AE', label: 'AE (Account Executive)' },
  { value: 'Manager', label: 'Sales Manager' },
  { value: 'Admin', label: 'Administrator' },
];

export const CONTACT_STATUSES: SelectOption[] = [
  { value: 'new', label: 'New' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'nurturing', label: 'Nurturing' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

export const CONTACT_SOURCES: SelectOption[] = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social Media' },
  { value: 'email', label: 'Email Campaign' },
  { value: 'phone', label: 'Phone' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
];

export const DEAL_STAGES: SelectOption[] = [
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' },
];

export const INTERACTION_TYPES: SelectOption[] = [
  { value: 'call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'demo', label: 'Demo' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'other', label: 'Other' },
]; 