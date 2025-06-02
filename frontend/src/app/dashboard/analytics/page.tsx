"use client";

import { useState, useEffect } from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { api, formatCurrency, type PipelineOverview, type UserStats } from "@/lib/api";
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AnalyticsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function AnalyticsContent() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [pipelineData, setPipelineData] = useState<PipelineOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const [userResponse, pipelineResponse] = await Promise.all([
          api.getUserProfile(),
          api.getPipelineOverview()
        ]);
        
        setUserStats(userResponse.data.stats);
        setPipelineData(pipelineResponse.data);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="glass-card animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="glass-card animate-pulse">
              <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
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
          <h2 className="text-h2 mb-2">Unable to load analytics</h2>
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
      {/* Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 mb-2 flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Sales Analytics
            </h1>
            <p className="text-body text-slate-600 dark:text-slate-300">
              Comprehensive insights into your sales performance and pipeline health.
            </p>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <p className="text-caption text-slate-500 dark:text-slate-400">Last Updated</p>
              <p className="text-label font-medium text-slate-800 dark:text-slate-100">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <MetricsCards userStats={userStats || undefined} />

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Analysis */}
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>

        {/* Key Insights */}
        <div className="space-y-6">
          {/* Pipeline Health */}
          <div className="glass-card">
            <h3 className="text-h3 mb-4 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              Pipeline Health
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-label text-slate-600 dark:text-slate-300">Win Rate</span>
                <span className={`text-lg font-bold ${
                  (pipelineData?.summary.winRate || 0) > 50 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {pipelineData?.summary.winRate || 0}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-label text-slate-600 dark:text-slate-300">Active Deals</span>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {pipelineData?.summary.activeDeals || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-label text-slate-600 dark:text-slate-300">Avg Deal Size</span>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {pipelineData?.summary.totalDeals 
                    ? formatCurrency(pipelineData.summary.totalValue / pipelineData.summary.totalDeals)
                    : formatCurrency(0)
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Summary */}
          <div className="glass-card">
            <h3 className="text-h3 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              This Month
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-label text-slate-600 dark:text-slate-300">Deals Won</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {pipelineData?.summary.wonDeals || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-label text-slate-600 dark:text-slate-300">Revenue</span>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {formatCurrency(pipelineData?.summary.totalWeightedValue || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-label text-slate-600 dark:text-slate-300">Contacts Added</span>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {userStats?.contactsCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card">
            <h3 className="text-h3 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <a 
                href="/dashboard/deals" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-label">View All Deals</span>
              </a>
              
              <a 
                href="/contacts" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-label">Manage Contacts</span>
              </a>
              
              <a 
                href="/dashboard/ai" 
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <ChartBarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-label">AI Insights</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="glass-card">
        <h3 className="text-h3 mb-4">Performance Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Win Rate Insight */}
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h4 className="text-label font-medium text-green-800 dark:text-green-200">Win Rate</h4>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              {(pipelineData?.summary.winRate || 0) > 50 
                ? `Great job! Your ${pipelineData?.summary.winRate}% win rate is above average.`
                : `Your ${pipelineData?.summary.winRate}% win rate has room for improvement. Consider using AI coaching.`
              }
            </p>
          </div>

          {/* Pipeline Health */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <ChartBarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="text-label font-medium text-blue-800 dark:text-blue-200">Pipeline</h4>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              You have {pipelineData?.summary.activeDeals || 0} active deals worth {formatCurrency(pipelineData?.summary.totalValue || 0)}.
            </p>
          </div>

          {/* AI Recommendation */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h4 className="text-label font-medium text-purple-800 dark:text-purple-200">AI Tip</h4>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Use our AI Deal Coach to get personalized recommendations for your active deals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 