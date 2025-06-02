"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { ContactsFilters } from "@/components/contacts/ContactsFilters";
import { ContactsStats } from "@/components/contacts/ContactsStats";
import { ContactsImportModal } from '@/components/contacts/ContactsImportModal';
import { ContactsExportModal } from '@/components/contacts/ContactsExportModal';
import { api, type Contact } from "@/lib/api";
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

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

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ContactsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ContactsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function ContactsContent() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalContacts: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ContactsFiltersState>({
    search: '',
    company: '',
    status: '',
    leadSource: '',
    priority: '',
    tags: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Debounce filters to prevent excessive API calls
  const debouncedFilters = useDebounce(filters, 500);

  const fetchContacts = useCallback(async (page: number = 1) => {
    try {
      setIsLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        page,
        limit: pagination.limit,
        sortBy: debouncedFilters.sortBy,
        sortOrder: debouncedFilters.sortOrder
      };

      // Add filters if they have values
      if (debouncedFilters.search.trim()) params.search = debouncedFilters.search.trim();
      if (debouncedFilters.company.trim()) params.company = debouncedFilters.company.trim();
      if (debouncedFilters.status) params.status = debouncedFilters.status;
      if (debouncedFilters.leadSource) params.leadSource = debouncedFilters.leadSource;
      if (debouncedFilters.priority) params.priority = debouncedFilters.priority;
      if (debouncedFilters.tags.trim()) params.tags = debouncedFilters.tags.trim();

      console.log('🔍 Fetching contacts with params:', params);

      const response = await api.getContacts(params);
      
      if (response.success) {
        // Map backend data structure to frontend expectations
        const contactsData = response.data.contacts || response.data.data || [];
        const paginationData = response.data.pagination || {};
        
        // Map _id to id for each contact
        const mappedContacts = contactsData.map((contact: Contact) => ({
          ...contact,
          id: contact._id || contact.id
        }));
        
        setContacts(mappedContacts);
        setPagination({
          currentPage: paginationData.currentPage || 1,
          totalPages: paginationData.totalPages || 1,
          totalContacts: paginationData.totalContacts || 0,
          hasNextPage: paginationData.hasNextPage || false,
          hasPrevPage: paginationData.hasPrevPage || false,
          limit: paginationData.limit || 10
        });
      } else {
        throw new Error(response.error || 'Failed to fetch contacts');
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
      toast.error('Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedFilters, pagination.limit]);

  useEffect(() => {
    fetchContacts(1);
  }, [fetchContacts]);

  const handlePageChange = (page: number) => {
    fetchContacts(page);
  };

  const handleFiltersChange = (newFilters: Partial<ContactsFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await api.deleteContact(contactId);
      toast.success('Contact deleted successfully');
      fetchContacts(pagination.currentPage);
    } catch (err) {
      console.error('Failed to delete contact:', err);
      toast.error('Failed to delete contact');
    }
  };

  const handleExportContacts = async () => {
    setShowExportModal(true);
  };

  const handleImportContacts = () => {
    setShowImportModal(true);
  };

  const handleImportComplete = () => {
    // Refresh contacts after import
    fetchContacts(1);
    setShowImportModal(false);
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1">Contacts</h1>
          <p className="text-body text-slate-600 dark:text-slate-300 mt-1">
            Manage your contacts and build relationships
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleImportContacts}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Import
          </button>
          
          <button
            onClick={handleExportContacts}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </button>
          
          <Link href="/contacts/new" className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Add Contact
          </Link>
        </div>
      </div>

      {/* Stats */}
      <ContactsStats 
        totalContacts={pagination.totalContacts}
        isLoading={isLoading}
      />

      {/* Search and Filters */}
      <div className="glass-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
          {/* Search */}
          <div className="flex-1 relative min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </div>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFiltersChange({ search: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Search contacts by name, email, or company..."
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 flex-shrink-0 ${showFilters ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : ''}`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <ContactsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        )}
      </div>

      {/* Contacts Table */}
      <div className="w-full overflow-hidden">
        <ContactsTable
          contacts={contacts}
          pagination={pagination}
          isLoading={isLoading}
          error={error}
          onPageChange={handlePageChange}
          onDeleteContact={handleDeleteContact}
          onRefresh={() => fetchContacts(pagination.currentPage)}
        />
      </div>

      {/* Import Modal */}
      <ContactsImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={handleImportComplete}
      />

      {/* Export Modal */}
      <ContactsExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        currentFilters={{
          search: filters.search,
          company: filters.company,
          tags: filters.tags,
          status: filters.status
        }}
      />
    </div>
  );
} 