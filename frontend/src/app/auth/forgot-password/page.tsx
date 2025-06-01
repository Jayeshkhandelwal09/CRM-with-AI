"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement API call to backend forgot password endpoint
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      toast.success('Reset link sent!', {
        description: 'Check your email for password reset instructions.',
      });
      
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error('Error', {
        description: error instanceof Error ? error.message : "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-h3 font-semibold text-slate-800 dark:text-slate-100">CRM AI</span>
            </Link>
            <h1 className="text-h2 mb-2">Check your email</h1>
            <p className="text-body text-slate-600 dark:text-slate-300">
              We&apos;ve sent password reset instructions to your email address
            </p>
          </div>

          {/* Success Card */}
          <div className="glass-card text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0 mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-h3 mb-2">Email sent successfully</h3>
            <p className="text-body text-slate-600 dark:text-slate-300 mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>. 
              Click the link in the email to reset your password.
            </p>
            <div className="space-y-3">
              <p className="text-caption text-slate-400 dark:text-slate-500">
                • Check your spam folder if you don&apos;t see the email
              </p>
              <p className="text-caption text-slate-400 dark:text-slate-500">
                • The reset link will expire in 1 hour
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link href="/auth/login" className="btn-primary w-full text-center block">
              Back to Sign In
            </Link>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail("");
              }}
              className="btn-ghost w-full"
            >
              Try different email
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-h3 font-semibold text-slate-800 dark:text-slate-100">CRM AI</span>
          </Link>
          <h1 className="text-h2 mb-2">Reset your password</h1>
          <p className="text-body">Enter your email to receive reset instructions</p>
        </div>

        {/* Reset Form */}
        <div className="glass-card">
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
                value={email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-caption text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending Reset Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <p className="text-body text-slate-600 dark:text-slate-300">
              Remember your password?{' '}
              <Link 
                href="/auth/login" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Help Info */}
        <div className="glass-card-light mt-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-label font-medium mb-1">Need help?</h4>
              <p className="text-caption text-slate-600 dark:text-slate-400">
                If you're having trouble resetting your password, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 