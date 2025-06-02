"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { SunIcon, MoonIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon, SparklesIcon, ShieldCheckIcon, BoltIcon, CheckIcon, UserGroupIcon, ChartBarIcon } from "@heroicons/react/24/outline";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 relative overflow-hidden">
          {/* Enhanced Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse" style={{ animationDelay: '3s' }}></div>
          </div>
          
          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white w-full h-full">
            <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-2xl group hover:scale-110 transition-transform duration-500">
                <svg className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold mb-4 text-center leading-tight">Join <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">CRM AI</span> Today</h1>
              <p className="text-lg text-purple-100 mb-8 text-center leading-relaxed">
                Start your free trial and transform your sales process with AI-powered insights
              </p>
              
              {/* Enhanced Feature highlights */}
              <div className="space-y-3 w-full">
                <div className="group flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <UserGroupIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">2,000 Contacts</h3>
                    <p className="text-xs text-purple-100 opacity-90">Manage your entire customer base</p>
                  </div>
                </div>
                
                <div className="group flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <ChartBarIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">5,000 Deals</h3>
                    <p className="text-xs text-purple-100 opacity-90">Track unlimited opportunities</p>
                  </div>
                </div>
                
                <div className="group flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">100 AI Requests/Day</h3>
                    <p className="text-xs text-purple-100 opacity-90">Powered by advanced AI</p>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="mt-8 grid grid-cols-3 gap-4 w-full">
                <div className="text-center group">
                  <div className="text-lg font-bold text-white group-hover:scale-110 transition-transform">14 Days</div>
                  <div className="text-xs text-purple-100 opacity-75">Free Trial</div>
                </div>
                <div className="text-center group">
                  <div className="text-lg font-bold text-white group-hover:scale-110 transition-transform">No Card</div>
                  <div className="text-xs text-purple-100 opacity-75">Required</div>
                </div>
                <div className="text-center group">
                  <div className="text-lg font-bold text-white group-hover:scale-110 transition-transform">5 Min</div>
                  <div className="text-xs text-purple-100 opacity-75">Setup</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
          <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-6 lg:hidden">
                <Link href="/" className="inline-flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-h2 font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">CRM AI</span>
                </Link>
                
                {/* Theme Toggle */}
                <div className="hidden">
                  <ThemeToggle />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Create your account
              </h1>
              <p className="text-slate-600 dark:text-slate-400">Start your free trial today</p>
            </div>

            {/* Registration Form */}
            <div className="glass-card !p-6">
              {/* API Error Display */}
              {apiError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('firstName')}`}
                      placeholder="John"
                      disabled={isLoading}
                      autoComplete="given-name"
                    />
                    {touched.firstName && errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('lastName')}`}
                      placeholder="Doe"
                      disabled={isLoading}
                      autoComplete="family-name"
                    />
                    {touched.lastName && errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('email')}`}
                    placeholder="john@example.com"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('password')}`}
                      placeholder="Create a strong password"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Password strength:</span>
                        <span className={`text-sm font-medium ${passwordStrength.color}`}>
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
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('confirmPassword')}`}
                      placeholder="Confirm your password"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="w-4 h-4 text-purple-600 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-purple-500 focus:ring-2 mt-1 transition-colors"
                  />
                  <label htmlFor="terms" className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    I agree to the{' '}
                    <Link href="/terms" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-slate-600 dark:text-slate-300">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/login" 
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">
              By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Privacy Policy
                </Link>
            </p>
            </div>
          </div>
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