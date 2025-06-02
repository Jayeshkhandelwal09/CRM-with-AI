const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Token storage utilities (matching AuthContext)
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'crm_access_token',
  REFRESH_TOKEN: 'crm_refresh_token',
  USER_DATA: 'crm_user_data'
};

const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) || 
           sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN) || 
           sessionStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },
  
  setTokens: (tokens: { accessToken: string; refreshToken: string }, rememberMe: boolean = false) => {
    // Determine storage type based on where current tokens are stored or rememberMe preference
    const isRemembered = rememberMe || !!localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    const storage = isRemembered ? localStorage : sessionStorage;
    
    storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },
  
  clearAll: () => {
    // Clear from both storages
    [localStorage, sessionStorage].forEach(storage => {
      Object.values(TOKEN_KEYS).forEach(key => {
        storage.removeItem(key);
      });
    });
  }
};

// Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  company?: string;
  jobTitle?: string;
  preferences?: {
    theme?: string;
    notifications?: {
      email?: boolean;
      browser?: boolean;
      deals?: boolean;
      contacts?: boolean;
    };
  };
  createdAt: string;
}

export interface UserStats {
  contactsCount: number;
  dealsCount: number;
  contactsUsagePercentage: number;
  dealsUsagePercentage: number;
  aiRequestsToday: number;
  aiRequestsRemaining: number;
}

export interface Contact {
  id?: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  department?: string;
  website?: string;
  linkedinUrl?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  status?: 'active' | 'inactive' | 'prospect' | 'customer' | 'lead';
  leadSource?: 'website' | 'referral' | 'social_media' | 'email_campaign' | 'cold_call' | 'event' | 'advertisement' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tags?: string[];
  notes?: string;
  description?: string;
  preferences?: {
    preferredContactMethod?: 'email' | 'phone' | 'linkedin' | 'in_person';
    timezone?: string;
    doNotContact?: boolean;
    emailOptOut?: boolean;
  };
  lastContactDate?: string;
  nextFollowUpDate?: string;
  interactionCount?: number;
  customFields?: Record<string, unknown>;
  owner?: string;
  importSource?: string;
  importDate?: string;
  duplicateOf?: string;
  isDuplicate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  currency: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  pipeline: string;
  probability: number;
  contact?: Contact;
  company?: string;
  source?: string;
  dealType?: string;
  priority?: 'low' | 'medium' | 'high';
  expectedCloseDate?: string;
  actualCloseDate?: string;
  closeReason?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineOverview {
  summary: {
    totalDeals: number;
    activeDeals: number;
    closedDeals: number;
    wonDeals: number;
    overdueDeals: number;
    totalValue: number;
    totalWeightedValue: number;
    winRate: number;
  };
  pipelineStages: Array<{
    stage: string;
    count: number;
    value: number;
    weightedValue: number;
  }>;
}

export interface Activity {
  id: string;
  subject: string;
  type: string;
  date: string;
  dealId?: {
    id: string;
    title: string;
    value: number;
    stage: string;
  };
  contactId?: {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: string[];
}

export interface PaginatedResponse<T> {
  data?: T[];
  contacts?: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalContacts?: number;
    totalDeals?: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

// API Client
class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  private getAuthHeaders(): HeadersInit {
    const token = tokenStorage.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.success && data.data?.tokens) {
        tokenStorage.setTokens(data.data.tokens);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  private async handleResponse<T>(response: Response, originalRequest?: () => Promise<Response>): Promise<T> {
    if (!response.ok) {
      if (response.status === 401 && originalRequest) {
        // Try to refresh token
        const refreshSuccess = await this.refreshAccessToken();
        
        if (refreshSuccess) {
          // Retry the original request with new token
          try {
            const retryResponse = await originalRequest();
            if (retryResponse.ok) {
              return retryResponse.json();
            }
          } catch (retryError) {
            console.error('Retry request failed:', retryError);
          }
        }
        
        // If refresh failed or retry failed, clear tokens and redirect
        tokenStorage.clearAll();
        window.location.href = '/auth/login';
        throw new Error('Authentication required');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    const makeRequest = () => fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<T> {
    const makeRequest = () => fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  async put<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const makeRequest = () => fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const makeRequest = () => fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const response = await makeRequest();
    return this.handleResponse<T>(response, makeRequest);
  }

  async importContacts(file: File, options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    validateOnly?: boolean;
    batchSize?: number;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    if (options?.skipDuplicates !== undefined) {
      formData.append('skipDuplicates', options.skipDuplicates.toString());
    }
    if (options?.updateExisting !== undefined) {
      formData.append('updateExisting', options.updateExisting.toString());
    }
    if (options?.validateOnly !== undefined) {
      formData.append('validateOnly', options.validateOnly.toString());
    }
    if (options?.batchSize !== undefined) {
      formData.append('batchSize', options.batchSize.toString());
    }

    const token = tokenStorage.getAccessToken();
    const makeRequest = () => fetch(`${API_BASE_URL}/csv/contacts/import`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData
    });

    const response = await makeRequest();
    return this.handleResponse(response, makeRequest);
  }

  async previewContactsImport(file: File): Promise<ApiResponse<Record<string, unknown>>> {
    const formData = new FormData();
    formData.append('csvFile', file);

    const token = tokenStorage.getAccessToken();
    const makeRequest = () => fetch(`${API_BASE_URL}/csv/contacts/preview`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData
    });

    const response = await makeRequest();
    return this.handleResponse(response, makeRequest);
  }

  async exportContacts(options?: {
    fields?: string[];
    status?: string;
    company?: string;
    tags?: string[];
    search?: string;
    includeHeaders?: boolean;
    dateFormat?: string;
    delimiter?: string;
  }): Promise<Blob> {
    const searchParams = new URLSearchParams();
    
    if (options?.fields) searchParams.append('fields', options.fields.join(','));
    if (options?.status) searchParams.append('status', options.status);
    if (options?.company) searchParams.append('company', options.company);
    if (options?.tags) searchParams.append('tags', options.tags.join(','));
    if (options?.search) searchParams.append('search', options.search);
    if (options?.includeHeaders !== undefined) {
      searchParams.append('includeHeaders', options.includeHeaders.toString());
    }
    if (options?.dateFormat) searchParams.append('dateFormat', options.dateFormat);
    if (options?.delimiter) searchParams.append('delimiter', options.delimiter);
    
    const queryString = searchParams.toString();
    const makeRequest = () => fetch(`${API_BASE_URL}/csv/contacts/export${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    const response = await makeRequest();
    if (!response.ok) {
      throw new Error('Failed to export contacts');
    }
    
    return response.blob();
  }

  async downloadContactsTemplate(): Promise<Blob> {
    const makeRequest = () => fetch(`${API_BASE_URL}/csv/contacts/template`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    const response = await makeRequest();
    if (!response.ok) {
      throw new Error('Failed to download template');
    }
    
    return response.blob();
  }

  async getImportStats(): Promise<ApiResponse<Record<string, unknown>>> {
    return this.get('/csv/contacts/stats');
  }

  async globalSearch(query: string): Promise<{
    contacts: Contact[];
    deals: Deal[];
  }> {
    const [contactsResponse, dealsResponse] = await Promise.all([
      this.get<ApiResponse<PaginatedResponse<Contact>>>(`/contacts?search=${encodeURIComponent(query)}&limit=5`),
      this.get<ApiResponse<PaginatedResponse<Deal>>>(`/deals?search=${encodeURIComponent(query)}&limit=5`),
    ]);

    return {
      contacts: contactsResponse.data.contacts || contactsResponse.data.data || [],
      deals: dealsResponse.data.contacts || dealsResponse.data.data || [],
    };
  }
}

const apiClient = new ApiClient();

// API Functions
export const api = {
  // User Profile & Stats
  async getUserProfile(): Promise<ApiResponse<{ user: User; stats: UserStats }>> {
    return apiClient.get('/users/profile');
  },

  async updateUserProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put('/users/profile', data);
  },

  async getUserActivity(params?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    contactId?: string;
  }): Promise<ApiResponse<PaginatedResponse<Activity>>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.type) searchParams.append('type', params.type);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.contactId) searchParams.append('contactId', params.contactId);
    
    const queryString = searchParams.toString();
    return apiClient.get(`/users/activity${queryString ? `?${queryString}` : ''}`);
  },

  // Deals
  async getDeals(params?: {
    page?: number;
    limit?: number;
    stage?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Deal>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.stage) queryParams.append('stage', params.stage);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const query = queryParams.toString();
    return apiClient.get(`/deals${query ? `?${query}` : ''}`);
  },

  async getDeal(id: string): Promise<ApiResponse<Deal>> {
    return apiClient.get(`/deals/${id}`);
  },

  async createDeal(data: Partial<Deal>): Promise<ApiResponse<Deal>> {
    return apiClient.post('/deals', data);
  },

  async updateDeal(id: string, data: Partial<Deal>): Promise<ApiResponse<Deal>> {
    return apiClient.put(`/deals/${id}`, data);
  },

  async deleteDeal(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/deals/${id}`);
  },

  async getPipelineOverview(): Promise<ApiResponse<PipelineOverview>> {
    return apiClient.get('/deals/pipeline/overview');
  },

  // Contacts
  async getContacts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    company?: string;
    tags?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Contact>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.company) queryParams.append('company', params.company);
    if (params?.tags) queryParams.append('tags', params.tags);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const query = queryParams.toString();
    return apiClient.get(`/contacts${query ? `?${query}` : ''}`);
  },

  async getContact(id: string): Promise<ApiResponse<Contact>> {
    return apiClient.get(`/contacts/${id}`);
  },

  async createContact(data: Partial<Contact>): Promise<ApiResponse<Contact>> {
    return apiClient.post('/contacts', data);
  },

  async updateContact(id: string, data: Partial<Contact>): Promise<ApiResponse<Contact>> {
    return apiClient.put(`/contacts/${id}`, data);
  },

  async deleteContact(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/contacts/${id}`);
  },

  // Search
  async globalSearch(query: string): Promise<{
    contacts: Contact[];
    deals: Deal[];
  }> {
    return apiClient.globalSearch(query);
  },

  // CSV Operations
  async importContacts(file: File, options?: {
    skipDuplicates?: boolean;
    updateExisting?: boolean;
    validateOnly?: boolean;
    batchSize?: number;
  }): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.importContacts(file, options);
  },

  async previewContactsImport(file: File): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.previewContactsImport(file);
  },

  async exportContacts(options?: {
    fields?: string[];
    status?: string;
    company?: string;
    tags?: string[];
    search?: string;
    includeHeaders?: boolean;
    dateFormat?: string;
    delimiter?: string;
  }): Promise<Blob> {
    return apiClient.exportContacts(options);
  },

  async downloadContactsTemplate(): Promise<Blob> {
    return apiClient.downloadContactsTemplate();
  },

  async getImportStats(): Promise<ApiResponse<Record<string, unknown>>> {
    return apiClient.getImportStats();
  },

  // AI Services
  async getDealCoach(dealId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/ai/deals/${dealId}/coach`);
  },

  async handleObjection(objectionData: {
    objectionText: string;
    dealId?: string;
    category?: 'price' | 'product' | 'timing' | 'authority' | 'need' | 'trust' | 'competition' | 'other';
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/ai/objections/handle', objectionData);
  },

  async getCustomerPersona(contactId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/ai/contacts/${contactId}/persona`);
  },

  async explainWinLoss(dealId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/ai/deals/${dealId}/explain`);
  },

  async submitAIFeedback(feedbackData: {
    feature: 'deal_coach' | 'objection_handler' | 'persona_builder' | 'win_loss_explainer';
    feedback: 'positive' | 'negative';
    responseId?: string;
    rating?: number;
    comments?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post('/ai/feedback', feedbackData);
  },

  async getAIAnalytics(period: '1d' | '7d' | '30d' = '7d'): Promise<ApiResponse<any>> {
    return apiClient.get(`/ai/analytics?period=${period}`);
  },

  async getAIHealthStatus(): Promise<ApiResponse<any>> {
    return apiClient.get('/ai/health');
  },
};

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStageColor = (stage: string): string => {
  const colors = {
    lead: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
    qualified: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    proposal: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    closed_won: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    closed_lost: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return colors[stage as keyof typeof colors] || colors.lead;
};

export const getPriorityColor = (priority: string): string => {
  const colors = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return colors[priority as keyof typeof colors] || colors.medium;
};

export const getContactStatusColor = (status: string): string => {
  const colors = {
    lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    prospect: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    customer: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
  };
  return colors[status as keyof typeof colors] || colors.lead;
};

export const getLeadSourceColor = (source: string): string => {
  const colors = {
    website: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    referral: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    social_media: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    email: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    email_campaign: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    phone: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    cold_call: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
    event: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
    advertisement: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
  };
  return colors[source as keyof typeof colors] || colors.other;
}; 