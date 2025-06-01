"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormTouched {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
}

export default function RegisterPage() {
  const { register, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<FormTouched>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false
  });
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
      case 'firstName':
        if (!value.trim()) {
          newErrors.firstName = "First name is required";
        } else if (value.length < 2) {
          newErrors.firstName = "First name must be at least 2 characters";
        } else if (value.length > 50) {
          newErrors.firstName = "First name cannot exceed 50 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          newErrors.firstName = "First name can only contain letters, spaces, hyphens, and apostrophes";
        } else {
          delete newErrors.firstName;
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          newErrors.lastName = "Last name is required";
        } else if (value.length < 2) {
          newErrors.lastName = "Last name must be at least 2 characters";
        } else if (value.length > 50) {
          newErrors.lastName = "Last name cannot exceed 50 characters";
        } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
          newErrors.lastName = "Last name can only contain letters, spaces, hyphens, and apostrophes";
        } else {
          delete newErrors.lastName;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = "Please provide a valid email address";
        } else if (value.length > 255) {
          newErrors.email = "Email cannot exceed 255 characters";
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (value.length > 128) {
          newErrors.password = "Password cannot exceed 128 characters";
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
          newErrors.password = "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)";
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field as keyof FormData]);
    });

    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true
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
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      
      // Show success toast
      toast.success('Account created successfully!', {
        description: `Welcome to CRM AI, ${formData.firstName}!`,
      });
      
      // Redirect is handled by the auth context
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      setApiError(errorMessage);
      
      // Show error toast
      toast.error('Registration failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score <= 2) return { strength: score, label: 'Weak', color: 'text-red-500 dark:text-red-400' };
    if (score <= 3) return { strength: score, label: 'Fair', color: 'text-orange-500 dark:text-orange-400' };
    if (score <= 4) return { strength: score, label: 'Good', color: 'text-blue-500 dark:text-blue-400' };
    return { strength: score, label: 'Strong', color: 'text-green-500 dark:text-green-400' };
  };

  const passwordStrength = getPasswordStrength();

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
          <h1 className="text-h2 mb-2">Create your account</h1>
          <p className="text-body">Start your free trial today</p>
        </div>

        {/* Registration Form */}
        <div className="glass-card">
          {/* API Error Display */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-caption text-red-600 dark:text-red-400">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-label mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('firstName')}`}
                  placeholder="John"
                  disabled={isLoading}
                  autoComplete="given-name"
                />
                {touched.firstName && errors.firstName && (
                  <p className="mt-1 text-caption text-red-600 dark:text-red-400">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-label mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('lastName')}`}
                  placeholder="Doe"
                  disabled={isLoading}
                  autoComplete="family-name"
                />
                {touched.lastName && errors.lastName && (
                  <p className="mt-1 text-caption text-red-600 dark:text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

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
                placeholder="john@example.com"
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
                placeholder="Create a strong password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-caption text-slate-600 dark:text-slate-400">Password strength:</span>
                    <span className={`text-caption font-medium ${passwordStrength.color}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.strength <= 2 ? 'bg-red-500' :
                        passwordStrength.strength <= 3 ? 'bg-orange-500' :
                          passwordStrength.strength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                </div>
              )}
              
              {touched.password && errors.password && (
                <p className="mt-1 text-caption text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-label mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('confirmPassword')}`}
                placeholder="Confirm your password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="mt-1 text-caption text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
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
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-body text-slate-600 dark:text-slate-300">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-caption text-slate-400 dark:text-slate-500">
          By creating an account, you agree to our{' '}
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