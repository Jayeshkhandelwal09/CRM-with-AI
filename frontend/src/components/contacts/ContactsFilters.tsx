"use client";

import { XMarkIcon } from '@heroicons/react/24/outline';

interface ContactsFiltersState {
  search: string;
  company: string;
  status: string;
  leadSource: string;
  priority: string;
  tags: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ContactsFiltersProps {
  filters: ContactsFiltersState;
  onFiltersChange: (filters: Partial<ContactsFiltersState>) => void;
}

export function ContactsFilters({ filters, onFiltersChange }: ContactsFiltersProps) {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'lead', label: 'Lead' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'customer', label: 'Customer' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const leadSourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'email_campaign', label: 'Email Campaign' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'event', label: 'Event' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'other', label: 'Other' },
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'company', label: 'Company' },
    { value: 'email', label: 'Email' },
  ];

  const clearFilters = () => {
    onFiltersChange({
      company: '',
      status: '',
      leadSource: '',
      priority: '',
      tags: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.company || filters.status || filters.leadSource || filters.priority || filters.tags;

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Company Filter */}
        <div className="min-w-0">
          <label className="block text-label text-slate-700 dark:text-slate-300 mb-1">
            Company
          </label>
          <input
            type="text"
            value={filters.company}
            onChange={(e) => onFiltersChange({ company: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
            placeholder="Filter by company"
          />
        </div>

        {/* Status Filter */}
        <div className="min-w-0">
          <label className="block text-label text-slate-700 dark:text-slate-300 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ status: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Lead Source Filter */}
        <div className="min-w-0">
          <label className="block text-label text-slate-700 dark:text-slate-300 mb-1">
            Lead Source
          </label>
          <select
            value={filters.leadSource}
            onChange={(e) => onFiltersChange({ leadSource: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          >
            {leadSourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div className="min-w-0">
          <label className="block text-label text-slate-700 dark:text-slate-300 mb-1">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => onFiltersChange({ priority: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Filter */}
        <div className="min-w-0">
          <label className="block text-label text-slate-700 dark:text-slate-300 mb-1">
            Tags
          </label>
          <input
            type="text"
            value={filters.tags}
            onChange={(e) => onFiltersChange({ tags: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
            placeholder="Filter by tags"
          />
        </div>
      </div>

      {/* Sort and Clear */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Sort By */}
          <div className="flex items-center gap-2">
            <label className="text-label text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Sort by:
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ sortBy: e.target.value })}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <label className="text-label text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Order:
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => onFiltersChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
              className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors self-start sm:self-auto"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
} 