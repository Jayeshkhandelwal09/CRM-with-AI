"use client";

import { useState, useEffect } from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";
import { api, type UserStats } from "@/lib/api";
import { DashboardGridSkeleton } from "@/components/ui/LoadingSkeleton";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true);
        const response = await api.getUserProfile();
        setUserStats(response.data.stats);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (isLoading) {
    return <DashboardGridSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="glass-card text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-h2 mb-2">Unable to load dashboard</h2>
          <p className="text-body text-slate-600 dark:text-slate-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 mb-2">
              Welcome back, {user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-body text-slate-600 dark:text-slate-300">
              Here's what's happening with your CRM today.
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <p className="text-caption text-slate-500 dark:text-slate-400">Today's Date</p>
              <p className="text-label font-medium text-slate-800 dark:text-slate-100">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <MetricsCards userStats={userStats || undefined} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts and Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Dashboard Charts */}
          <DashboardCharts />
          
          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Right Column - Activity and Notifications */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <RecentActivityFeed limit={8} />
          
          {/* Notifications */}
          <NotificationCenter />
        </div>
      </div>

      {/* Bottom Section - Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Getting Started Card */}
        <div className="glass-card-light">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-h3 mb-2">Getting Started</h3>
              <p className="text-body text-slate-600 dark:text-slate-300 mb-3">
                New to CRM AI? Check out our quick start guide to get the most out of your CRM.
              </p>
              <a href="/help/getting-started" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors">
                View Guide →
              </a>
            </div>
          </div>
        </div>

        {/* AI Features Preview */}
        <div className="glass-card-light">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-h3 mb-2">AI Features</h3>
              <p className="text-body text-slate-600 dark:text-slate-300 mb-3">
                Unlock powerful AI capabilities to boost your sales performance.
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400 font-medium">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="glass-card-light">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-h3 mb-2">Need Help?</h3>
              <p className="text-body text-slate-600 dark:text-slate-300 mb-3">
                Our support team is here to help you succeed with your CRM.
              </p>
              <a href="/support" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium transition-colors">
                Contact Support →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 