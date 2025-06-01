"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { type Contact, formatDate, getContactStatusColor, getLeadSourceColor, getPriorityColor } from '@/lib/api';

interface ContactsTableProps {
  contacts: Contact[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalContacts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
  isLoading: boolean;
  error: string | null;
  onPageChange: (page: number) => void;
  onDeleteContact: (contactId: string) => void;
  onRefresh: () => void;
}

export function ContactsTable({
  contacts,
  pagination,
  isLoading,
  error,
  onPageChange,
  onDeleteContact,
  onRefresh
}: ContactsTableProps) {
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  const handleDeleteClick = (contactId: string) => {
    setDeleteContactId(contactId);
  };

  const handleDeleteConfirm = () => {
    if (deleteContactId) {
      onDeleteContact(deleteContactId);
      setDeleteContactId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteContactId(null);
  };

  if (error) {
    return (
      <div className="glass-card">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-h3 text-slate-900 dark:text-slate-100">Error loading contacts</h3>
          <p className="mt-1 text-body text-slate-500 dark:text-slate-400">{error}</p>
          <div className="mt-6">
            <button onClick={onRefresh} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-card">
        <div className="animate-pulse">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-slate-700">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="col-span-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Table Rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-slate-700">
              {[...Array(6)].map((_, j) => (
                <div key={j} className="col-span-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (contacts?.length === 0) {
    return (
      <div className="glass-card">
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
          <h3 className="mt-2 text-h3 text-slate-900 dark:text-slate-100">No contacts found</h3>
          <p className="mt-1 text-body text-slate-500 dark:text-slate-400">
            Get started by adding your first contact.
          </p>
          <div className="mt-6">
            <Link href="/contacts/new" className="btn-primary">
              Add Contact
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/4">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/6">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/8">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/8">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/8">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/8">
                    Created
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-1/8">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {contacts?.map((contact) => {
                  const contactId = contact.id || contact._id || '';
                  if (!contactId) return null;
                  return (
                  <tr key={contactId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                            {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                            {contact.firstName} {contact.lastName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                            <EnvelopeIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[200px]">
                              <PhoneIcon className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                        {contact.company || '-'}
                      </div>
                      {contact.jobTitle && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {contact.jobTitle}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {contact.status && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getContactStatusColor(contact.status)}`}>
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {contact.leadSource && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLeadSourceColor(contact.leadSource)}`}>
                          {contact.leadSource.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {contact.priority && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(contact.priority)}`}>
                          {contact.priority.charAt(0).toUpperCase() + contact.priority.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/contacts/${contactId}`}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                          title="View contact"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/contacts/${contactId}/edit`}
                          className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
                          title="Edit contact"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(contactId)}
                          className="p-1 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                          title="Delete contact"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4 p-4">
          {contacts?.map((contact) => {
            const contactId = contact.id || contact._id || '';
            if (!contactId) return null;
            return (
            <div key={contactId} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                      {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {contact.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/contacts/${contactId}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/contacts/${contactId}/edit`}
                    className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(contactId)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 space-y-2">
                {contact.company && (
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                    {contact.company}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {contact.status && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getContactStatusColor(contact.status)}`}>
                      {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                    </span>
                  )}
                  {contact.priority && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(contact.priority)}`}>
                      {contact.priority.charAt(0).toUpperCase() + contact.priority.slice(1)}
                    </span>
                  )}
                </div>
                
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Created {formatDate(contact.createdAt)}
                </div>
              </div>
            </div>
          )})}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-slate-900 px-4 py-3 border-t border-slate-200 dark:border-slate-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Showing{' '}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalContacts)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.totalContacts}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => onPageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    
                    {/* Page Numbers */}
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1;
                      const isCurrentPage = page === pagination.currentPage;
                      
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              isCurrentPage
                                ? 'z-10 bg-blue-50 dark:bg-blue-900/50 border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                      
                      // Show ellipsis
                      if (page === pagination.currentPage - 2 || page === pagination.currentPage + 2) {
                        return (
                          <span
                            key={page}
                            className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300"
                          >
                            ...
                          </span>
                        );
                      }
                      
                      return null;
                    })}
                    
                    <button
                      onClick={() => onPageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteContactId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                  Delete Contact
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Are you sure you want to delete this contact? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 