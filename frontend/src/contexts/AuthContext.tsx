"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Types for authentication
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Token storage utilities
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'crm_access_token',
  REFRESH_TOKEN: 'crm_refresh_token',
  USER_DATA: 'crm_user_data'
};

const tokenStorage = {
  setTokens: (tokens: AuthTokens, rememberMe: boolean = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.accessToken);
    storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  },
  
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) || 
           sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },
  
  getRefreshToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN) || 
           sessionStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },
  
  setUser: (user: User, rememberMe: boolean = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(user));
  },
  
  getUser: (): User | null => {
    const userData = localStorage.getItem(TOKEN_KEYS.USER_DATA) || 
                     sessionStorage.getItem(TOKEN_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
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

// API utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint: string, options: RequestInit = {}): Promise<AuthResponse> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = tokenStorage.getAccessToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (accessToken) {
    defaultHeaders.Authorization = `Bearer ${accessToken}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = tokenStorage.getUser();
        const accessToken = tokenStorage.getAccessToken();
        
        if (storedUser && accessToken) {
          // Verify token is still valid by calling /me endpoint
          try {
            const response = await apiCall('/auth/me');
            if (response.success && response.data) {
              setUser(response.data.user);
            } else {
              // Token invalid, clear storage
              tokenStorage.clearAll();
            }
          } catch {
            // Token invalid or expired, try to refresh
            const refreshSuccess = await refreshAccessToken();
            if (!refreshSuccess) {
              tokenStorage.clearAll();
            }
          }
        }
      } catch {
        console.error('Auth initialization error');
        tokenStorage.clearAll();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    try {
      const response: AuthResponse = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        const { user: userData, tokens } = response.data;
        
        // Store tokens and user data
        tokenStorage.setTokens(tokens, rememberMe);
        tokenStorage.setUser(userData, rememberMe);
        
        // Update state
        setUser(userData);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const response: AuthResponse = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.success && response.data) {
        const { user: newUser, tokens } = response.data;
        
        // Store tokens and user data (default to session storage for registration)
        tokenStorage.setTokens(tokens, false);
        tokenStorage.setUser(newUser, false);
        
        // Update state
        setUser(newUser);
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response: AuthResponse = await apiCall('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success && response.data) {
        const { tokens } = response.data;
        
        // Update tokens (preserve storage type)
        const isRemembered = !!localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
        tokenStorage.setTokens(tokens, isRemembered);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint to invalidate refresh token
      await apiCall('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage and state
      tokenStorage.clearAll();
      setUser(null);
      
      // Redirect to home page
      router.push('/');
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 