"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="glass-card text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500 dark:text-red-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-h3 text-slate-800 dark:text-slate-100">Something went wrong</h3>
              <p className="text-body text-slate-600 dark:text-slate-300 max-w-md">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="btn-primary flex items-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 w-full max-w-2xl">
                <summary className="cursor-pointer text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                  Show Error Details
                </summary>
                <pre className="mt-2 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-left overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Page Error Boundary - for full page errors
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
          <div className="glass-card text-center py-12 max-w-lg w-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-10 h-10 text-red-500 dark:text-red-400" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-h1 text-slate-800 dark:text-slate-100">Page Error</h1>
                <p className="text-body text-slate-600 dark:text-slate-300">
                  This page encountered an error and couldn't be displayed properly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary flex items-center gap-2"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Reload Page
                </button>
                
                <button
                  onClick={() => window.history.back()}
                  className="btn-secondary"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// Component Error Boundary - for individual components
export function ComponentErrorBoundary({ 
  children, 
  componentName = "Component" 
}: { 
  children: ReactNode;
  componentName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="glass-card-light text-center py-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-label font-medium text-slate-800 dark:text-slate-100">
                {componentName} Error
              </h4>
              <p className="text-caption text-slate-600 dark:text-slate-400">
                This component failed to load
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="btn-ghost text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

// API Error Display Component
export function ApiErrorDisplay({ 
  error, 
  onRetry 
}: { 
  error: string | Error;
  onRetry?: () => void;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className="glass-card-light text-center py-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-label font-medium text-slate-800 dark:text-slate-100">
            Failed to Load Data
          </h4>
          <p className="text-caption text-slate-600 dark:text-slate-400 max-w-sm">
            {errorMessage}
          </p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
} 