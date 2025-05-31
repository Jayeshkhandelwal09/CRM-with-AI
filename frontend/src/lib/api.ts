import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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
api.interceptors.response.use(
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
          return api(originalRequest);
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

// Auth API functions
export const authAPI = {
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    company: string;
    role?: string;
    department?: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (refreshToken?: string) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    department?: string;
    timezone?: string;
    preferences?: any;
    avatar?: string;
  }) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (resetData: { token: string; password: string }) => {
    const response = await api.post('/auth/reset-password', resetData);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// Generic API functions
export const apiRequest = {
  get: (url: string) => api.get(url),
  post: (url: string, data?: any) => api.post(url, data),
  put: (url: string, data?: any) => api.put(url, data),
  delete: (url: string) => api.delete(url),
  patch: (url: string, data?: any) => api.patch(url, data),
};

export default api; 