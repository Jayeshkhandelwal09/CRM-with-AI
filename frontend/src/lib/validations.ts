import { z } from 'zod';
import { isValidEmail, isValidPhone } from './utils';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

export const phoneSchema = z.string().optional().refine(
  (val) => !val || isValidPhone(val),
  'Please enter a valid phone number'
);

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name cannot exceed 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const companySchema = z.string()
  .min(2, 'Company name must be at least 2 characters')
  .max(100, 'Company name cannot exceed 100 characters');

// Auth validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  company: companySchema,
  role: z.enum(['SDR', 'AE', 'Manager', 'Admin']),
  department: z.string().max(50, 'Department cannot exceed 50 characters').optional().or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Contact validation schemas
export const contactSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: companySchema,
  position: z.string().max(100, 'Position cannot exceed 100 characters').optional().or(z.literal('')),
  status: z.enum(['new', 'qualified', 'contacted', 'nurturing', 'converted', 'lost']),
  source: z.enum(['website', 'referral', 'social', 'email', 'phone', 'event', 'other']),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().or(z.literal('')),
  socialProfiles: z.object({
    linkedin: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
    twitter: z.string().url('Please enter a valid Twitter URL').optional().or(z.literal('')),
    facebook: z.string().url('Please enter a valid Facebook URL').optional().or(z.literal('')),
    instagram: z.string().url('Please enter a valid Instagram URL').optional().or(z.literal('')),
  }).optional(),
  customFields: z.record(z.any()).optional(),
  nextFollowUpDate: z.string().optional().or(z.literal('')),
});

// Deal validation schemas
export const dealSchema = z.object({
  title: z.string().min(2, 'Deal title must be at least 2 characters').max(200, 'Deal title cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().or(z.literal('')),
  value: z.number().min(0, 'Deal value must be positive').max(999999999, 'Deal value is too large'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost']),
  probability: z.number().min(0, 'Probability must be between 0 and 100').max(100, 'Probability must be between 0 and 100'),
  expectedCloseDate: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().or(z.literal('')),
  customFields: z.record(z.any()).optional(),
  contactId: z.string().optional().or(z.literal('')),
});

// Interaction validation schemas
export const interactionSchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'demo', 'proposal', 'follow-up', 'other']),
  subject: z.string().min(2, 'Subject must be at least 2 characters').max(200, 'Subject cannot exceed 200 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional().or(z.literal('')),
  date: z.string().min(1, 'Date is required'),
  duration: z.number().min(0, 'Duration must be positive').optional(),
  outcome: z.enum(['positive', 'neutral', 'negative', 'no-response']).optional(),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).optional(),
  contactId: z.string().optional().or(z.literal('')),
  dealId: z.string().optional().or(z.literal('')),
});

// Profile validation schemas
export const profileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  company: companySchema,
  department: z.string().max(50, 'Department cannot exceed 50 characters').optional().or(z.literal('')),
  timezone: z.string().min(1, 'Timezone is required'),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      dealUpdates: z.boolean(),
      aiInsights: z.boolean(),
    }),
    theme: z.enum(['light', 'dark', 'auto']),
    language: z.string().min(1, 'Language is required'),
  }),
});

// Custom validators
export const validators = {
  email: (value: string) => {
    if (!value) return 'Email is required';
    if (!isValidEmail(value)) return 'Please enter a valid email address';
    return undefined;
  },

  phone: (value: string) => {
    if (value && !isValidPhone(value)) return 'Please enter a valid phone number';
    return undefined;
  },

  required: (value: any) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return 'This field is required';
    }
    return undefined;
  },

  minLength: (min: number) => (value: string) => {
    if (value && value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return undefined;
  },

  maxLength: (max: number) => (value: string) => {
    if (value && value.length > max) {
      return `Cannot exceed ${max} characters`;
    }
    return undefined;
  },

  minValue: (min: number) => (value: number) => {
    if (value !== undefined && value < min) {
      return `Must be at least ${min}`;
    }
    return undefined;
  },

  maxValue: (max: number) => (value: number) => {
    if (value !== undefined && value > max) {
      return `Cannot exceed ${max}`;
    }
    return undefined;
  },

  url: (value: string) => {
    if (value && !value.match(/^https?:\/\/.+/)) {
      return 'Please enter a valid URL';
    }
    return undefined;
  },

  passwordStrength: (value: string) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
    if (!/\d/.test(value)) return 'Password must contain at least one number';
    if (!/[@$!%*?&]/.test(value)) return 'Password must contain at least one special character';
    return undefined;
  },

  matchPassword: (confirmPassword: string, password: string) => {
    if (confirmPassword !== password) {
      return "Passwords don't match";
    }
    return undefined;
  },
};

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type DealFormData = z.infer<typeof dealSchema>;
export type InteractionFormData = z.infer<typeof interactionSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>; 