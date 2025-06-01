'use client';

import { 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { PipelineOverview } from '@/types';

interface PipelineMetricsProps {
  overview: PipelineOverview;
}

export function PipelineMetrics({ overview }: PipelineMetricsProps) {
  const { summary } = overview;

  const metrics = [
    {
      name: 'Total Pipeline Value',
      value: `$${summary.totalValue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      description: `${summary.totalDeals} total deals`
    },
    {
      name: 'Weighted Value',
      value: `$${summary.totalWeightedValue.toLocaleString()}`,
      icon: ArrowTrendingUpIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      description: 'Probability adjusted'
    },
    {
      name: 'Active Deals',
      value: summary.activeDeals.toString(),
      icon: ChartBarIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      description: `${summary.closedDeals} closed deals`
    },
    {
      name: 'Win Rate',
      value: `${summary.winRate.toFixed(1)}%`,
      icon: CheckCircleIcon,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      description: `${summary.wonDeals} deals won`
    },
    {
      name: 'Overdue Deals',
      value: summary.overdueDeals.toString(),
      icon: ClockIcon,
      color: summary.overdueDeals > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400',
      bgColor: summary.overdueDeals > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-700',
      description: 'Past expected close'
    },
    {
      name: 'Average Deal Value',
      value: summary.averageDealValue ? `$${summary.averageDealValue.toLocaleString()}` : '$0',
      icon: CurrencyDollarIcon,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      description: 'Per deal average'
    }
  ];

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-h2 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5" />
          Pipeline Metrics
        </h2>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.name}
              className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-100 dark:border-slate-600"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-label text-slate-900 dark:text-slate-100 truncate">
                    {metric.name}
                  </p>
                  <p className={`text-lg font-bold ${metric.color}`}>
                    {metric.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {metric.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage Breakdown */}
      <div>
        <h3 className="text-label text-slate-900 dark:text-slate-100 mb-3">
          Pipeline Stage Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {overview.pipelineStages.map((stage) => {
            const percentage = summary.totalValue > 0 
              ? ((stage.value / summary.totalValue) * 100).toFixed(1)
              : '0';

            return (
              <div
                key={stage.stage}
                className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 border border-slate-100 dark:border-slate-600"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-label text-slate-900 dark:text-slate-100 capitalize">
                    {stage.stageDisplay || stage.stage.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded-full">
                    {stage.count}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Value:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      ${stage.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Weighted:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      ${stage.weightedValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">% of Total:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {summary.wonDeals}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Won This Month</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {summary.lostDeals || (summary.closedDeals - summary.wonDeals)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Lost This Month</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {summary.conversionRate ? `${summary.conversionRate.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Conversion Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {summary.averageDealValue ? Math.ceil(summary.totalValue / summary.activeDeals) : 0}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Avg Days to Close</div>
          </div>
        </div>
      </div>
    </div>
  );
} 