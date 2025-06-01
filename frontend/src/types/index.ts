// Base Types
export interface BaseEntity {
  _id: string
  createdAt: string
  updatedAt: string
}

// User Types
export interface User extends BaseEntity {
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'sales_rep' | 'user'
  avatar?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  notifications: boolean
  language: string
  timezone: string
}

// Contact Types
export interface Contact extends BaseEntity {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  role?: string
  type: 'lead' | 'prospect' | 'customer' | 'partner'
  tags?: string[]
  notes?: string
  userId: string
  lastInteraction?: string
}

// Deal Types
export interface Deal extends BaseEntity {
  title: string
  value: number
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  closeReason?: string
  notes?: string
  contactId: string
  userId: string
  contact?: Contact
}

// Interaction Types
export interface Interaction extends BaseEntity {
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  subject: string
  description: string
  date: string
  duration?: number
  contactId: string
  dealId?: string
  userId: string
  contact?: Contact
  deal?: Deal
}

// Objection Types
export interface Objection extends BaseEntity {
  text: string
  category?: string
  dealId?: string
  contactId?: string
  userId: string
  aiResponses?: AIResponse[]
}

// AI Types
export interface AIResponse {
  id: string
  text: string
  confidence: 'high' | 'medium' | 'low'
  rating?: number
  feedback?: 'positive' | 'negative'
  createdAt: string
}

export interface AILog extends BaseEntity {
  type: 'deal_coach' | 'persona_builder' | 'objection_handler' | 'win_loss_explainer'
  input: string
  output: string
  confidence: 'high' | 'medium' | 'low'
  userId: string
  dealId?: string
  contactId?: string
  feedback?: 'positive' | 'negative'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  errors?: ValidationError[]
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface ValidationError {
  field: string
  message: string
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

// Form Types
export interface ContactFormData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  role?: string
  type: Contact['type']
  tags?: string[]
  notes?: string
}

export interface DealFormData {
  title: string
  value: number
  stage: Deal['stage']
  probability: number
  expectedCloseDate?: string
  notes?: string
  contactId: string
}

// Dashboard Types
export interface DashboardMetrics {
  totalContacts: number
  totalDeals: number
  totalRevenue: number
  wonDeals: number
  lostDeals: number
  averageDealValue: number
  conversionRate: number
  aiRequestsUsed: number
  aiRequestsRemaining: number
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
  }[]
}

// Filter Types
export interface ContactFilters {
  search?: string
  type?: Contact['type']
  company?: string
  tags?: string[]
  page?: number
  limit?: number
}

export interface DealFilters {
  search?: string
  stage?: Deal['stage']
  minValue?: number
  maxValue?: number
  contactId?: string
  page?: number
  limit?: number
}

// UI Component Types
export interface SelectOption {
  value: string
  label: string
}

export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
}

export interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void
}

// Theme Types
export type Theme = 'light' | 'dark'

// Status Types
export type Status = 'success' | 'warning' | 'error' | 'info'

// Loading States
export interface LoadingState {
  isLoading: boolean
  error?: string | null
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>> 