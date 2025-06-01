import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  className?: string;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    hasNextPage, 
    hasPreviousPage, 
    className,
    showFirstLast = true,
    maxVisiblePages = 5
  }, ref) => {
    const getVisiblePages = () => {
      const pages: (number | string)[] = [];
      
      if (totalPages <= maxVisiblePages) {
        // Show all pages if total is less than max
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Calculate start and end of visible range
        let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let end = Math.min(totalPages, start + maxVisiblePages - 1);
        
        // Adjust start if we're near the end
        if (end - start + 1 < maxVisiblePages) {
          start = Math.max(1, end - maxVisiblePages + 1);
        }
        
        // Add first page and ellipsis if needed
        if (start > 1) {
          pages.push(1);
          if (start > 2) {
            pages.push('...');
          }
        }
        
        // Add visible pages
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        
        // Add ellipsis and last page if needed
        if (end < totalPages) {
          if (end < totalPages - 1) {
            pages.push('...');
          }
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    const visiblePages = getVisiblePages();

    return (
      <div 
        ref={ref}
        className={cn("flex items-center justify-center space-x-2", className)}
      >
        {/* First page button */}
        {showFirstLast && totalPages > maxVisiblePages && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!hasPreviousPage}
            className="glass-secondary text-cool-grey border-glass"
          >
            First
          </Button>
        )}

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className="glass-secondary text-cool-grey border-glass"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-cool-grey">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={
                  currentPage === page
                    ? "bg-ice-blue text-white"
                    : "glass-secondary text-cool-grey border-glass"
                }
              >
                {page}
              </Button>
            )}
          </React.Fragment>
        ))}

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="glass-secondary text-cool-grey border-glass"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        {showFirstLast && totalPages > maxVisiblePages && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            className="glass-secondary text-cool-grey border-glass"
          >
            Last
          </Button>
        )}
      </div>
    )
  }
)
Pagination.displayName = "Pagination"

// Simple pagination info component
interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  className?: string;
}

const PaginationInfo = React.forwardRef<HTMLDivElement, PaginationInfoProps>(
  ({ currentPage, pageSize, totalItems, startIndex, endIndex, className }, ref) => {
    const actualEndIndex = Math.min(endIndex + 1, totalItems);
    
    return (
      <div ref={ref} className={cn("text-sm text-cool-grey", className)}>
        Showing {totalItems > 0 ? startIndex + 1 : 0} to {actualEndIndex} of {totalItems} results
      </div>
    )
  }
)
PaginationInfo.displayName = "PaginationInfo"

// Page size selector component
interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  className?: string;
}

const PageSizeSelector = React.forwardRef<HTMLDivElement, PageSizeSelectorProps>(
  ({ pageSize, onPageSizeChange, options = [10, 25, 50, 100], className }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center space-x-2", className)}>
        <span className="text-sm text-cool-grey">Show</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="glass-input text-sm px-2 py-1 w-auto min-w-0"
        >
          {options.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span className="text-sm text-cool-grey">per page</span>
      </div>
    )
  }
)
PageSizeSelector.displayName = "PageSizeSelector"

export { Pagination, PaginationInfo, PageSizeSelector } 