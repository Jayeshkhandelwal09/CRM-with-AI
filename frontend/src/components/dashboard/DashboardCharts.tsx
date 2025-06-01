"use client";

import { useState, useEffect } from 'react';
import { api, formatCurrency, getStageColor, type PipelineOverview } from '@/lib/api';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

interface DashboardChartsProps {
  className?: string;
}

interface PipelineStageBarProps {
  stage: string;
  count: number;
  value: number;
  percentage: number;
  color: string;
}

function PipelineStageBar({ stage, count, value, percentage, color }: PipelineStageBarProps) {
  const stageLabels = {
    lead: 'Lead',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    closed_won: 'Won',
    closed_lost: 'Lost',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(stage)}`}>
            {stageLabels[stage as keyof typeof stageLabels] || stage}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            {count} deals
          </span>
        </div>
        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
          {formatCurrency(value)}
        </span>
      </div>
      
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function PipelineChart({ pipelineData }: { pipelineData: PipelineOverview }) {
  const maxValue = Math.max(...pipelineData.pipelineStages.map(stage => stage.value));
  
  const stageColors = {
    lead: 'bg-gray-400',
    qualified: 'bg-blue-500',
    proposal: 'bg-yellow-500',
    negotiation: 'bg-orange-500',
    closed_won: 'bg-green-500',
    closed_lost: 'bg-red-500',
  };

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-h3">Deal Pipeline</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {formatCurrency(pipelineData.summary.totalValue)}
          </p>
          <p className="text-caption text-slate-500 dark:text-slate-400">Total Value</p>
        </div>
      </div>

      <div className="space-y-4">
        {pipelineData.pipelineStages.map((stage) => (
          <PipelineStageBar
            key={stage.stage}
            stage={stage.stage}
            count={stage.count}
            value={stage.value}
            percentage={maxValue > 0 ? (stage.value / maxValue) * 100 : 0}
            color={stageColors[stage.stage as keyof typeof stageColors] || 'bg-gray-400'}
          />
        ))}
      </div>
    </div>
  );
}

function MetricsOverview({ pipelineData }: { pipelineData: PipelineOverview }) {
  const metrics = [
    {
      label: 'Active Deals',
      value: pipelineData.summary.activeDeals,
      total: pipelineData.summary.totalDeals,
      color: 'bg-blue-500',
    },
    {
      label: 'Won Deals',
      value: pipelineData.summary.wonDeals,
      total: pipelineData.summary.closedDeals,
      color: 'bg-green-500',
    },
    {
      label: 'Overdue',
      value: pipelineData.summary.overdueDeals,
      total: pipelineData.summary.activeDeals,
      color: 'bg-red-500',
    },
  ];

  return (
    <div className="glass-card">
      <h3 className="text-h3 mb-6">Deal Metrics</h3>
      
      <div className="space-y-6">
        {metrics.map((metric) => {
          const percentage = metric.total > 0 ? (metric.value / metric.total) * 100 : 0;
          
          return (
            <div key={metric.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-label text-slate-600 dark:text-slate-300">
                  {metric.label}
                </span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {metric.value} / {metric.total}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${metric.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 min-w-[3rem] text-right">
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Win Rate Circle */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${(pipelineData.summary.winRate / 100) * 251.2} 251.2`}
                className="text-green-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {pipelineData.summary.winRate}%
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Win Rate
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardCharts({ className = '' }: DashboardChartsProps) {
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
        setError(err instanceof Error ? err.message : 'Failed to load charts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPipelineData();
  }, []);

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error || !pipelineData) {
    return (
      <div className={`glass-card text-center ${className}`}>
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-h3 mb-2">Unable to load charts</h3>
        <p className="text-body text-slate-600 dark:text-slate-300 mb-4">
          {error || 'Failed to load chart data'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      <PipelineChart pipelineData={pipelineData} />
      <MetricsOverview pipelineData={pipelineData} />
    </div>
  );
} 