"use client";

import { useState, useEffect } from 'react';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  TrophyIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { api, formatCurrency, type PipelineOverview, type UserStats } from '@/lib/api';
import { MetricsCardSkeleton } from '@/components/ui/LoadingSkeleton';

interface MetricsCardsProps {
  userStats?: UserStats;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'orange' | 'purple';
  isLoading?: boolean;
}

function MetricCard({ title, value, subtitle, icon, trend, color, isLoading }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
  };

  if (isLoading) {
    return <MetricsCardSkeleton />;
  }

  return (
    <div className="glass-card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <svg 
              className={`w-4 h-4 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-label text-slate-600 dark:text-slate-300">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        {subtitle && (
          <p className="text-caption text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function MetricsCards({ userStats, className = '' }: MetricsCardsProps) {
  const [pipelineData, setPipelineData] = useState<PipelineOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        setIsLoading(true);
        const response = await api.getPipelineOverview();
        setPipelineData(response.data);
      } catch (err) {
        console.error('Failed to fetch pipeline data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPipelineData();
  }, []);

  if (error) {
    return (
      <div className={`glass-card text-center ${className}`}>
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-h3 mb-2">Unable to load metrics</h3>
        <p className="text-body text-slate-600 dark:text-slate-300 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Contacts',
      value: userStats?.contactsCount || 0,
      subtitle: `${userStats?.contactsUsagePercentage || 0}% of limit used`,
      icon: <UsersIcon className="w-6 h-6" />,
      color: 'blue' as const,
    },
    {
      title: 'Active Deals',
      value: pipelineData?.summary.activeDeals || 0,
      subtitle: `${pipelineData?.summary.totalDeals || 0} total deals`,
      icon: <ChartBarIcon className="w-6 h-6" />,
      color: 'green' as const,
    },
    {
      title: 'Pipeline Value',
      value: pipelineData ? formatCurrency(pipelineData.summary.totalValue) : '$0',
      subtitle: `${pipelineData ? formatCurrency(pipelineData.summary.totalWeightedValue) : '$0'} weighted`,
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      color: 'orange' as const,
    },
    {
      title: 'Win Rate',
      value: `${pipelineData?.summary.winRate || 0}%`,
      subtitle: `${pipelineData?.summary.wonDeals || 0} deals won`,
      icon: <TrophyIcon className="w-6 h-6" />,
      color: 'purple' as const,
      trend: pipelineData?.summary.winRate ? {
        value: Math.round((pipelineData.summary.winRate - 65) * 10) / 10, // Mock trend vs 65% baseline
        isPositive: pipelineData.summary.winRate > 65
      } : undefined,
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          subtitle={metric.subtitle}
          icon={metric.icon}
          trend={metric.trend}
          color={metric.color}
          isLoading={isLoading}
        />
      ))}
      
      {/* AI Usage Card */}
      <div className="glass-card group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-h3 mb-1">AI Assistant Usage</h3>
              <p className="text-body text-slate-600 dark:text-slate-300">
                {userStats?.aiRequestsToday || 0} requests used today • {userStats?.aiRequestsRemaining || 100} remaining
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {userStats?.aiRequestsToday || 0}/100
              </p>
              <p className="text-caption text-slate-500 dark:text-slate-400">Daily limit</p>
            </div>
            
            {/* Progress bar */}
            <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ 
                  width: `${Math.min(((userStats?.aiRequestsToday || 0) / 100) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 