"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

interface FormData {
  email: string;
  password: string;
}

interface FormTouched {
  email: boolean;
  password: boolean;
}

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<FormTouched>({
    email: false,
    password: false
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    if (apiError) {
      setApiError("");
    }

    // Validate field in real-time if it's been touched
    if (touched[name as keyof FormTouched]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, value);
  };

  const validateField = (fieldName: string, value: string) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'email':
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = "Please provide a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 1) {
          newErrors.password = "Password cannot be empty";
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field as keyof FormData]);
    });

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    });

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError("");
    
    try {
      await login(formData.email.trim().toLowerCase(), formData.password, rememberMe);
      
      // Show success toast
      toast.success('Welcome back!', {
        description: 'You have been successfully signed in.',
      });
      
      // Redirect is handled by the auth context
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
      setApiError(errorMessage);
      
      // Show error toast
      toast.error('Sign in failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: "demo@example.com",
      password: "Demo123!@#"
    });
    setTouched({
      email: true,
      password: true
    });
    toast.info('Demo credentials filled', {
      description: 'You can now sign in with the demo account.',
    });
  };

  // Show loading if auth context is still initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="glass-card text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-body">Loading...</p>
        </div>
      </div>
    );
  }

  const getFieldStatus = (fieldName: keyof FormData) => {
    if (!touched[fieldName]) return '';
    if (errors[fieldName]) return 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-400';
    if (formData[fieldName]) return 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400';
    return '';
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
              <span className="text-h3 font-semibold text-slate-800 dark:text-slate-100">CRM AI</span>
          </Link>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
          <h1 className="text-h2 mb-2">Welcome back</h1>
          <p className="text-body">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="glass-card">
          {/* API Error Display */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-caption text-red-600 dark:text-red-400">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-label mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('email')}`}
                placeholder="Enter your email"
                disabled={isLoading}
                autoComplete="email"
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-caption text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-label mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('password')}`}
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />
              {touched.password && errors.password && (
                <p className="mt-1 text-caption text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                  disabled={isLoading}
                />
                <span className="ml-2 text-label text-slate-600 dark:text-slate-300">Remember me</span>
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-label text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Login */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full btn-secondary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Try Demo Account
            </button>
            <p className="mt-2 text-caption text-slate-500 dark:text-slate-400 text-center">
              Use demo credentials to explore the platform
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-body text-slate-600 dark:text-slate-300">
              Don't have an account?{' '}
              <Link 
                href="/auth/register" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-caption text-slate-400 dark:text-slate-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      ) : (
        <SunIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
      )}
    </button>
  );
} 