"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { SunIcon, MoonIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon, SparklesIcon, ShieldCheckIcon, BoltIcon } from "@heroicons/react/24/outline";

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
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 flex h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
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
              
              <h1 className="text-3xl font-bold mb-4 text-center leading-tight">Welcome to <br/><span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">CRM AI</span></h1>
              <p className="text-lg text-blue-100 mb-8 text-center leading-relaxed">
                Transform your sales process with AI-powered insights and intelligent automation
              </p>
              
              {/* Enhanced Feature highlights */}
              <div className="space-y-3 w-full">
                <div className="group flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <SparklesIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">AI-Powered Insights</h3>
                    <p className="text-xs text-blue-100 opacity-90">Smart recommendations for better deals</p>
                  </div>
                </div>
                
                <div className="group flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <BoltIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Automation Engine</h3>
                    <p className="text-xs text-blue-100 opacity-90">Streamline your workflow</p>
                  </div>
                </div>
                
                <div className="group flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/15 transition-all duration-300 hover:scale-105">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                    <ShieldCheckIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Enterprise Security</h3>
                    <p className="text-xs text-blue-100 opacity-90">Bank-grade data protection</p>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="mt-8 grid grid-cols-3 gap-4 w-full">
                <div className="text-center group">
                  <div className="text-lg font-bold text-white group-hover:scale-110 transition-transform">10K+</div>
                  <div className="text-xs text-blue-100 opacity-75">Users</div>
                </div>
                <div className="text-center group">
                  <div className="text-lg font-bold text-white group-hover:scale-110 transition-transform">99.9%</div>
                  <div className="text-xs text-blue-100 opacity-75">Uptime</div>
                </div>
                <div className="text-center group">
                  <div className="text-lg font-bold text-white group-hover:scale-110 transition-transform">40%</div>
                  <div className="text-xs text-blue-100 opacity-75">Growth</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
          <div className={`w-full max-w-md transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-6 lg:hidden">
                <Link href="/" className="inline-flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-h2 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CRM AI</span>
                </Link>
                
                {/* Theme Toggle */}
                <div className="hidden">
                  <ThemeToggle />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Welcome back
              </h1>
              <p className="text-slate-600 dark:text-slate-400">Sign in to your account to continue</p>
            </div>

            {/* Login Form */}
            <div className="glass-card !p-6">
              {/* API Error Display */}
              {apiError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{apiError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    className={`w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('email')}`}
                    placeholder="Enter your email"
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
                      className={`w-full px-4 py-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 ${getFieldStatus('password')}`}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      autoComplete="current-password"
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
                  {touched.password && errors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 font-medium">{errors.password}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link 
                    href="/auth/forgot-password" 
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </form>

              {/* Demo Login */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full glass-card-light !p-3 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                >
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Try Demo Account</span>
                  </div>
                </button>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
                  Use demo credentials to explore the platform
                </p>
              </div>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-slate-600 dark:text-slate-300">
                  Don't have an account?{' '}
                  <Link 
                    href="/auth/register" 
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">
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