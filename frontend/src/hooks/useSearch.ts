import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { fuzzySearch } from '@/lib/utils';

interface UseSearchOptions {
  searchKeys?: string[];
  debounceMs?: number;
  caseSensitive?: boolean;
}

interface UseSearchReturn<T> {
  searchTerm: string;
  debouncedSearchTerm: string;
  filteredItems: T[];
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  hasResults: boolean;
  resultCount: number;
}

export function useSearch<T>(
  items: T[],
  options: UseSearchOptions = {}
): UseSearchReturn<T> {
  const {
    searchKeys = [],
    debounceMs = 300,
    caseSensitive = false,
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return items;
    }

    if (searchKeys.length > 0) {
      return fuzzySearch(items, debouncedSearchTerm, searchKeys);
    }

    // If no search keys provided, search in all string properties
    const searchLower = caseSensitive ? debouncedSearchTerm : debouncedSearchTerm.toLowerCase();
    
    return items.filter(item => {
      const itemString = JSON.stringify(item);
      const searchString = caseSensitive ? itemString : itemString.toLowerCase();
      return searchString.includes(searchLower);
    });
  }, [items, debouncedSearchTerm, searchKeys, caseSensitive]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const hasResults = filteredItems.length > 0;
  const resultCount = filteredItems.length;

  return {
    searchTerm,
    debouncedSearchTerm,
    filteredItems,
    setSearchTerm,
    clearSearch,
    hasResults,
    resultCount,
  };
}

// Hook for advanced search with filters
export function useAdvancedSearch<T>(
  items: T[],
  options: UseSearchOptions = {}
) {
  const search = useSearch(items, options);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const filteredAndSearchedItems = useMemo(() => {
    let result = search.filteredItems;

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        result = result.filter(item => {
          const itemValue = (item as any)[key];
          
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          
          if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
            return itemValue >= value.min && itemValue <= value.max;
          }
          
          return itemValue === value;
        });
      }
    });

    return result;
  }, [search.filteredItems, filters]);

  const setFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const removeFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const clearAll = useCallback(() => {
    search.clearSearch();
    clearFilters();
  }, [search, clearFilters]);

  return {
    ...search,
    filteredItems: filteredAndSearchedItems,
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    clearAll,
    hasFilters: Object.keys(filters).length > 0,
  };
} 