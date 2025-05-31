'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';

// Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'SDR' | 'AE' | 'Manager' | 'Admin';
  status: 'active' | 'inactive' | 'pending';
  company: string;
  department?: string;
  aiRequestsUsed: number;
  aiRequestsLimit: number;
  avatar?: string;
  timezone: string;
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      dealUpdates: boolean;
      aiInsights: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
  emailVerified: boolean;
  onboardingCompleted: boolean;
  onboardingSteps: {
    profileSetup: boolean;
    teamInvite: boolean;
    firstDeal: boolean;
    aiTutorial: boolean;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company: string;
  role?: string;
  department?: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!Cookies.get('accessToken');

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = Cookies.get('accessToken');
      
      if (accessToken) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to refresh user:', error);
          // Clear invalid tokens
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        const { user: userData, tokens } = response.data;
        
        // Store tokens in cookies
        Cookies.set('accessToken', tokens.accessToken, { expires: 7 });
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 30 });
        
        // Set user state
        setUser(userData);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const { user: newUser, tokens } = response.data;
        
        // Store tokens in cookies
        Cookies.set('accessToken', tokens.accessToken, { expires: 7 });
        Cookies.set('refreshToken', tokens.refreshToken, { expires: 30 });
        
        // Set user state
        setUser(newUser);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const refreshToken = Cookies.get('refreshToken');
      
      // Call logout API to invalidate tokens
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear tokens and user state
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      setUser(null);
    }
  };

  // Update profile function
  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Profile update failed');
    }
  };

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authAPI.getProfile();
      
      if (response.success) {
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Failed to fetch user profile');
      }
    } catch (error: any) {
      console.error('Refresh user error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch user profile');
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass-card p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ice-blue mx-auto"></div>
            <p className="text-cool-grey mt-4">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
};

export default AuthContext; 