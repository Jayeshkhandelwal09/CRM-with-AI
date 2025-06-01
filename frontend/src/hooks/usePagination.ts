import { useState, useMemo, useCallback } from 'react';

interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

interface PaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  reset: () => void;
}

export function usePagination(
  totalItems: number = 0,
  options: PaginationOptions = {}
): PaginationReturn {
  const { initialPage = 1, initialPageSize = 10 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(totalItems);

  const totalPages = useMemo(() => {
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const hasPreviousPage = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize - 1, total - 1);
  }, [startIndex, pageSize, total]);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when page size changes
  }, []);

  const setTotalItems = useCallback((newTotal: number) => {
    setTotal(newTotal);
    // Adjust current page if it's beyond the new total pages
    const newTotalPages = Math.ceil(newTotal / pageSize);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [currentPage, pageSize]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    setTotal(0);
  }, [initialPage, initialPageSize]);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems: total,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: handleSetPageSize,
    setTotalItems,
    reset,
  };
}

// Hook for client-side pagination of arrays
export function useArrayPagination<T>(
  items: T[],
  options: PaginationOptions = {}
) {
  const pagination = usePagination(items.length, options);
  
  const paginatedItems = useMemo(() => {
    const start = pagination.startIndex;
    const end = start + pagination.pageSize;
    return items.slice(start, end);
  }, [items, pagination.startIndex, pagination.pageSize]);

  return {
    ...pagination,
    items: paginatedItems,
  };
} 