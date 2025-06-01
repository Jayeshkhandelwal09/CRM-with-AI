import axios, { AxiosInstance, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Contact, 
  Deal, 
  Interaction,
  LoginFormData,
  RegisterFormData,
  ContactFormData,
  DealFormData,
  InteractionFormData,
  SearchParams,
  ContactFilters,
  DealFilters,
  LoginResponse
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = Cookies.get('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = Cookies.get('refreshToken');
            if (refreshToken) {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
                { refreshToken }
              );

              const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
              
              // Update cookies
              Cookies.set('accessToken', accessToken, { expires: 7 });
              Cookies.set('refreshToken', newRefreshToken, { expires: 30 });

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    params?: any
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await this.api.request({
        method,
        url,
        data,
        params,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  // Auth methods
  async login(credentials: LoginFormData): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('POST', '/auth/login', credentials);
  }

  async register(userData: Omit<RegisterFormData, 'confirmPassword'>): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('POST', '/auth/register', userData);
  }

  async logout(refreshToken?: string): Promise<ApiResponse<void>> {
    return this.request<void>('POST', '/auth/logout', { refreshToken });
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('GET', '/auth/me');
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('PUT', '/auth/profile', profileData);
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    return this.request<void>('POST', '/auth/change-password', passwordData);
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.request<void>('POST', '/auth/forgot-password', { email });
  }

  async resetPassword(resetData: { token: string; password: string }): Promise<ApiResponse<void>> {
    return this.request<void>('POST', '/auth/reset-password', resetData);
  }

  // Contact methods
  async getContacts(params?: SearchParams & ContactFilters): Promise<ApiResponse<PaginatedResponse<Contact>>> {
    return this.request<PaginatedResponse<Contact>>('GET', '/contacts', undefined, params);
  }

  async getContact(id: string): Promise<ApiResponse<{ contact: Contact }>> {
    return this.request<{ contact: Contact }>('GET', `/contacts/${id}`);
  }

  async createContact(contactData: ContactFormData): Promise<ApiResponse<{ contact: Contact }>> {
    return this.request<{ contact: Contact }>('POST', '/contacts', contactData);
  }

  async updateContact(id: string, contactData: Partial<ContactFormData>): Promise<ApiResponse<{ contact: Contact }>> {
    return this.request<{ contact: Contact }>('PUT', `/contacts/${id}`, contactData);
  }

  async deleteContact(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/contacts/${id}`);
  }

  async restoreContact(id: string): Promise<ApiResponse<{ contact: Contact }>> {
    return this.request<{ contact: Contact }>('POST', `/contacts/${id}/restore`);
  }

  async addContactTags(id: string, tags: string[]): Promise<ApiResponse<{ contact: Contact }>> {
    return this.request<{ contact: Contact }>('POST', `/contacts/${id}/tags`, { tags });
  }

  async removeContactTag(id: string, tag: string): Promise<ApiResponse<{ contact: Contact }>> {
    return this.request<{ contact: Contact }>('DELETE', `/contacts/${id}/tags/${tag}`);
  }

  async getContactStats(): Promise<ApiResponse<any>> {
    return this.request<any>('GET', '/contacts/stats');
  }

  // Deal methods
  async getDeals(params?: SearchParams & DealFilters): Promise<ApiResponse<PaginatedResponse<Deal>>> {
    return this.request<PaginatedResponse<Deal>>('GET', '/deals', undefined, params);
  }

  async getDeal(id: string): Promise<ApiResponse<{ deal: Deal }>> {
    return this.request<{ deal: Deal }>('GET', `/deals/${id}`);
  }

  async createDeal(dealData: DealFormData): Promise<ApiResponse<{ deal: Deal }>> {
    return this.request<{ deal: Deal }>('POST', '/deals', dealData);
  }

  async updateDeal(id: string, dealData: Partial<DealFormData>): Promise<ApiResponse<{ deal: Deal }>> {
    return this.request<{ deal: Deal }>('PUT', `/deals/${id}`, dealData);
  }

  async deleteDeal(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/deals/${id}`);
  }

  async restoreDeal(id: string): Promise<ApiResponse<{ deal: Deal }>> {
    return this.request<{ deal: Deal }>('POST', `/deals/${id}/restore`);
  }

  async addDealTags(id: string, tags: string[]): Promise<ApiResponse<{ deal: Deal }>> {
    return this.request<{ deal: Deal }>('POST', `/deals/${id}/tags`, { tags });
  }

  async removeDealTag(id: string, tag: string): Promise<ApiResponse<{ deal: Deal }>> {
    return this.request<{ deal: Deal }>('DELETE', `/deals/${id}/tags/${tag}`);
  }

  async getDealStats(): Promise<ApiResponse<any>> {
    return this.request<any>('GET', '/deals/stats/overview');
  }

  // Interaction methods
  async getInteractions(params?: SearchParams): Promise<ApiResponse<PaginatedResponse<Interaction>>> {
    return this.request<PaginatedResponse<Interaction>>('GET', '/interactions', undefined, params);
  }

  async getInteraction(id: string): Promise<ApiResponse<{ interaction: Interaction }>> {
    return this.request<{ interaction: Interaction }>('GET', `/interactions/${id}`);
  }

  async createInteraction(interactionData: InteractionFormData): Promise<ApiResponse<{ interaction: Interaction }>> {
    return this.request<{ interaction: Interaction }>('POST', '/interactions', interactionData);
  }

  async updateInteraction(id: string, interactionData: Partial<InteractionFormData>): Promise<ApiResponse<{ interaction: Interaction }>> {
    return this.request<{ interaction: Interaction }>('PUT', `/interactions/${id}`, interactionData);
  }

  async deleteInteraction(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/interactions/${id}`);
  }

  async addInteractionTags(id: string, tags: string[]): Promise<ApiResponse<{ interaction: Interaction }>> {
    return this.request<{ interaction: Interaction }>('POST', `/interactions/${id}/tags`, { tags });
  }

  async removeInteractionTag(id: string, tag: string): Promise<ApiResponse<{ interaction: Interaction }>> {
    return this.request<{ interaction: Interaction }>('DELETE', `/interactions/${id}/tags/${tag}`);
  }

  async getInteractionStats(): Promise<ApiResponse<any>> {
    return this.request<any>('GET', '/interactions/stats/overview');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService; 