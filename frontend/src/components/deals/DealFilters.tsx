'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';

interface DealFiltersProps {
  filters: {
    stage: string;
    priority: string;
    source: string;
    minValue: string;
    maxValue: string;
    expectedCloseDateFrom: string;
    expectedCloseDateTo: string;
  };
  onFiltersChange: (filters: DealFiltersProps['filters']) => void;
  onClear: () => void;
}

export function DealFilters({ filters, onFiltersChange, onClear }: DealFiltersProps) {
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-label text-slate-900 dark:text-slate-100">
          Filter Deals
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {/* Stage Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Stage
          </label>
          <select
            value={filters.stage}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          >
            <option value="">All Stages</option>
            <option value="lead">Lead</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Source Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Source
          </label>
          <select
            value={filters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          >
            <option value="">All Sources</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
            <option value="referral">Referral</option>
            <option value="partner">Partner</option>
            <option value="marketing">Marketing</option>
            <option value="cold_call">Cold Call</option>
            <option value="website">Website</option>
            <option value="event">Event</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Min Value Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Min Value
          </label>
          <input
            type="number"
            placeholder="$0"
            value={filters.minValue}
            onChange={(e) => handleFilterChange('minValue', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
            min="0"
          />
        </div>

        {/* Max Value Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Max Value
          </label>
          <input
            type="number"
            placeholder="No limit"
            value={filters.maxValue}
            onChange={(e) => handleFilterChange('maxValue', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
            min="0"
          />
        </div>

        {/* Expected Close Date From */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Close Date From
          </label>
          <input
            type="date"
            value={filters.expectedCloseDateFrom}
            onChange={(e) => handleFilterChange('expectedCloseDateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          />
        </div>

        {/* Expected Close Date To */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Close Date To
          </label>
          <input
            type="date"
            value={filters.expectedCloseDateTo}
            onChange={(e) => handleFilterChange('expectedCloseDateTo', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              
              const getFilterLabel = (key: string, value: string) => {
                switch (key) {
                  case 'stage':
                    return `Stage: ${value.replace('_', ' ')}`;
                  case 'priority':
                    return `Priority: ${value}`;
                  case 'source':
                    return `Source: ${value.replace('_', ' ')}`;
                  case 'minValue':
                    return `Min: $${parseInt(value).toLocaleString()}`;
                  case 'maxValue':
                    return `Max: $${parseInt(value).toLocaleString()}`;
                  case 'expectedCloseDateFrom':
                    return `From: ${new Date(value).toLocaleDateString()}`;
                  case 'expectedCloseDateTo':
                    return `To: ${new Date(value).toLocaleDateString()}`;
                  default:
                    return `${key}: ${value}`;
                }
              };

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                >
                  {getFilterLabel(key, value)}
                  <button
                    onClick={() => handleFilterChange(key as keyof typeof filters, '')}
                    className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 