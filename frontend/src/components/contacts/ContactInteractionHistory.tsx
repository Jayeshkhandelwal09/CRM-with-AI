"use client";

import { useState, useEffect, useCallback } from 'react';
import { api, type Activity, formatDateTime } from '@/lib/api';
import { 
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface ContactInteractionHistoryProps {
  contactId: string;
  contactName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface InteractionFilters {
  type?: string;
  startDate?: string;
  endDate?: string;
}

export function ContactInteractionHistory({ contactId, contactName, isOpen, onClose }: ContactInteractionHistoryProps) {
  const [interactions, setInteractions] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInteractions, setTotalInteractions] = useState(0);
  const [filters, setFilters] = useState<InteractionFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const limit = 20;

  const fetchInteractions = useCallback(async (page: number = 1, newFilters: InteractionFilters = filters) => {
    try {
      setIsLoading(true);
      
      const params = {
        page,
        limit,
        contactId,
        ...newFilters
      };

      const response = await api.getUserActivity(params);
      
      if (response.success) {
        // Filter interactions to only show those related to this contact
        const contactInteractions = response.data.data?.filter(
          activity => activity.contactId?.id === contactId
        ) || [];
        
        setInteractions(contactInteractions);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
        setTotalInteractions(contactInteractions.length);
      } else {
        throw new Error(response.error || 'Failed to fetch interactions');
      }
    } catch (err) {
      console.error('Failed to fetch interactions:', err);
      toast.error('Failed to load interaction history');
    } finally {
      setIsLoading(false);
    }
  }, [contactId, limit, filters]);

  useEffect(() => {
    if (isOpen && contactId) {
      fetchInteractions(1);
    }
  }, [isOpen, contactId, fetchInteractions]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchInteractions(page);
    }
  };

  const handleFilterChange = (newFilters: InteractionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    fetchInteractions(1, newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    setCurrentPage(1);
    fetchInteractions(1, emptyFilters);
  };

  const getInteractionIcon = (type: string) => {
    const iconClasses = "w-5 h-5";
    
    switch (type) {
      case 'call':
        return <PhoneIcon className={iconClasses} />;
      case 'email':
        return <EnvelopeIcon className={iconClasses} />;
      case 'meeting':
        return <CalendarIcon className={iconClasses} />;
      case 'note':
        return <DocumentTextIcon className={iconClasses} />;
      case 'task':
        return <ClockIcon className={iconClasses} />;
      default:
        return <ChatBubbleLeftRightIcon className={iconClasses} />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'call':
        return 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400';
      case 'email':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400';
      case 'meeting':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400';
      case 'note':
        return 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400';
      case 'task':
        return 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400';
      default:
        return 'bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      call: 'Phone Call',
      email: 'Email',
      meeting: 'Meeting',
      note: 'Note',
      task: 'Task',
      other: 'Other'
    };
    return labels[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-h2">Interaction History</h2>
            <p className="text-body text-slate-600 dark:text-slate-300 mt-1">
              {contactName} • {totalInteractions} interaction{totalInteractions !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center gap-2"
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
            
            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Clear Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700 border-t border-slate-200 dark:border-slate-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Interaction Type
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange({ ...filters, type: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="call">Phone Call</option>
                    <option value="email">Email</option>
                    <option value="meeting">Meeting</option>
                    <option value="note">Note</option>
                    <option value="task">Task</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange({ ...filters, startDate: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange({ ...filters, endDate: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : interactions.length > 0 ? (
            <div className="space-y-6">
              {interactions.map((interaction, index) => (
                <div key={interaction.id} className="relative">
                  {/* Timeline line */}
                  {index < interactions.length - 1 && (
                    <div className="absolute left-5 top-12 w-0.5 h-full bg-slate-200 dark:bg-slate-700"></div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getInteractionColor(interaction.type)}`}>
                      {getInteractionIcon(interaction.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">
                              {interaction.subject}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getInteractionColor(interaction.type)}`}>
                              {getTypeLabel(interaction.type)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {formatDateTime(interaction.date)}
                          </p>
                          
                          {/* Additional interaction details would go here */}
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            <p>Interaction details would be displayed here based on the interaction type and content.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-h3 mb-2">No Interactions Found</h3>
              <p className="text-body text-slate-600 dark:text-slate-300 mb-4">
                {Object.keys(filters).length > 0 
                  ? 'No interactions match your current filters.'
                  : 'No interactions have been recorded for this contact yet.'
                }
              </p>
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Page {currentPage} of {totalPages} • {totalInteractions} total interactions
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 