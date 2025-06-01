'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button } from './button';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  sorting?: {
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  };
  filtering?: {
    filters: Record<string, any>;
    onFilterChange: (filters: Record<string, any>) => void;
  };
  selection?: {
    selectedItems: T[];
    onSelectionChange: (items: T[]) => void;
    getItemId: (item: T) => string;
  };
  actions?: {
    label: string;
    onClick: (item: T) => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }[];
  emptyState?: React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  filtering,
  selection,
  actions,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});

  // Get nested value from object
  const getValue = useCallback((item: T, key: string): any => {
    return key.split('.').reduce((obj: any, k) => obj?.[k], item);
  }, []);

  // Handle sorting
  const handleSort = useCallback((columnKey: string) => {
    if (!sorting) return;
    
    const newOrder = sorting.sortBy === columnKey && sorting.sortOrder === 'asc' ? 'desc' : 'asc';
    sorting.onSortChange(columnKey, newOrder);
  }, [sorting]);

  // Handle local filtering
  const handleLocalFilter = useCallback((columnKey: string, value: string) => {
    const newFilters = { ...localFilters, [columnKey]: value };
    if (!value) {
      delete newFilters[columnKey];
    }
    setLocalFilters(newFilters);
    
    if (filtering) {
      filtering.onFilterChange(newFilters);
    }
  }, [localFilters, filtering]);

  // Filter data locally if no external filtering
  const filteredData = useMemo(() => {
    if (filtering || Object.keys(localFilters).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.entries(localFilters).every(([key, filterValue]) => {
        const itemValue = getValue(item, key);
        return String(itemValue).toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, localFilters, filtering, getValue]);

  // Handle selection
  const handleSelectAll = useCallback(() => {
    if (!selection) return;
    
    const allSelected = filteredData.length > 0 && 
      filteredData.every(item => 
        selection.selectedItems.some(selected => 
          selection.getItemId(selected) === selection.getItemId(item)
        )
      );
    
    if (allSelected) {
      selection.onSelectionChange([]);
    } else {
      selection.onSelectionChange(filteredData);
    }
  }, [selection, filteredData]);

  const handleSelectItem = useCallback((item: T) => {
    if (!selection) return;
    
    const isSelected = selection.selectedItems.some(selected => 
      selection.getItemId(selected) === selection.getItemId(item)
    );
    
    if (isSelected) {
      selection.onSelectionChange(
        selection.selectedItems.filter(selected => 
          selection.getItemId(selected) !== selection.getItemId(item)
        )
      );
    } else {
      selection.onSelectionChange([...selection.selectedItems, item]);
    }
  }, [selection]);

  const isAllSelected = useMemo(() => {
    if (!selection || filteredData.length === 0) return false;
    return filteredData.every(item => 
      selection.selectedItems.some(selected => 
        selection.getItemId(selected) === selection.getItemId(item)
      )
    );
  }, [selection, filteredData]);

  const isIndeterminate = useMemo(() => {
    if (!selection || filteredData.length === 0) return false;
    const selectedCount = filteredData.filter(item => 
      selection.selectedItems.some(selected => 
        selection.getItemId(selected) === selection.getItemId(item)
      )
    ).length;
    return selectedCount > 0 && selectedCount < filteredData.length;
  }, [selection, filteredData]);

  if (loading) {
    return (
      <div className="w-full">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredData.length === 0) {
    return (
      <div className="w-full">
        {/* Filters */}
        {columns.some(col => col.filterable) && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {columns.filter(col => col.filterable).map(column => (
              <div key={String(column.key)}>
                <Input
                  placeholder={`Filter by ${column.label}`}
                  value={localFilters[String(column.key)] || ''}
                  onChange={(e) => handleLocalFilter(String(column.key), e.target.value)}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center py-12">
          {emptyState || (
            <div>
              <p className="text-gray-500 text-lg">No data available</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Filters */}
      {columns.some(col => col.filterable) && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {columns.filter(col => col.filterable).map(column => (
            <div key={String(column.key)}>
              <Input
                placeholder={`Filter by ${column.label}`}
                value={localFilters[String(column.key)] || ''}
                onChange={(e) => handleLocalFilter(String(column.key), e.target.value)}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selection && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium text-gray-900",
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right",
                    column.sortable && "cursor-pointer hover:bg-gray-100"
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sorting && (
                      <div className="flex flex-col">
                        <ChevronUpIcon 
                          className={cn(
                            "h-3 w-3",
                            sorting.sortBy === column.key && sorting.sortOrder === 'asc'
                              ? "text-blue-600" 
                              : "text-gray-400"
                          )}
                        />
                        <ChevronDownIcon 
                          className={cn(
                            "h-3 w-3 -mt-1",
                            sorting.sortBy === column.key && sorting.sortOrder === 'desc'
                              ? "text-blue-600" 
                              : "text-gray-400"
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((item, index) => {
              const isSelected = selection?.selectedItems.some(selected => 
                selection.getItemId(selected) === selection.getItemId(item)
              );
              
              return (
                <tr 
                  key={selection ? selection.getItemId(item) : index}
                  className={cn(
                    "hover:bg-gray-50",
                    isSelected && "bg-blue-50"
                  )}
                >
                  {selection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(item)}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        "px-4 py-3 text-sm text-gray-900",
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right"
                      )}
                    >
                      {column.render 
                        ? column.render(getValue(item, String(column.key)), item, index)
                        : String(getValue(item, String(column.key)) || '')
                      }
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {actions.map((action, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant={action.variant || 'outline'}
                            size="sm"
                            onClick={() => action.onClick(item)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </span>
            <Select
              value={String(pagination.limit)}
              onValueChange={(value) => pagination.onLimitChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => pagination.onPageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            >
              Next
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 