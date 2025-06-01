"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { api, formatCurrency, getStageColor, type Contact, type Deal } from '@/lib/api';

interface GlobalSearchProps {
  className?: string;
}

interface SearchResultsProps {
  contacts: Contact[];
  deals: Deal[];
  isLoading: boolean;
  query: string;
  onClose: () => void;
}

function SearchResults({ contacts, deals, isLoading, query, onClose }: SearchResultsProps) {
  if (!query.trim()) return null;

  const hasResults = contacts.length > 0 || deals.length > 0;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-slate-600 dark:text-slate-300">Searching...</p>
        </div>
      ) : hasResults ? (
        <div className="py-2">
          {/* Contacts Section */}
          {contacts?.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                Contacts ({contacts.length})
              </div>
              {contacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                      {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {contact.email}
                      {contact.company && ` • ${contact.company}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Deals Section */}
          {deals.length > 0 && (
            <div className={contacts.length > 0 ? 'border-t border-slate-100 dark:border-slate-700' : ''}>
              <div className="px-4 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700">
                Deals ({deals.length})
              </div>
              {deals.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <CurrencyDollarIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {deal.title}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStageColor(deal.stage)}`}>
                        {deal.stage.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {formatCurrency(deal.value)}
                      {deal.company && ` • ${deal.company}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* View All Results */}
          <div className="border-t border-slate-100 dark:border-slate-700 p-2">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="block w-full text-center py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              View all results for "{query}"
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <MagnifyingGlassIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">No results found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try searching for contacts, deals, or companies
          </p>
        </div>
      )}
    </div>
  );
}

export function GlobalSearch({ className = '' }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search functionality with debouncing
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const results = await api.globalSearch(query.trim());
          setContacts(results.contacts);
          setDeals(results.deals);
          setIsOpen(true);
        } catch (error) {
          console.error('Search failed:', error);
          setContacts([]);
          setDeals([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setContacts([]);
        setDeals([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleInputFocus = () => {
    if (query.trim().length >= 2) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
    setContacts([]);
    setDeals([]);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Search contacts, deals, companies..."
        />
        {query && (
          <button
            onClick={closeSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-4 w-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <SearchResults
          contacts={contacts}
          deals={deals}
          isLoading={isLoading}
          query={query}
          onClose={closeSearch}
        />
      )}
    </div>
  );
} 