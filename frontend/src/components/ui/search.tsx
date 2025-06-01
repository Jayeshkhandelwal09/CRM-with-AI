import * as React from "react"
import { Search, X, Filter, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, placeholder = "Search...", className, disabled }, ref) => {
    return (
      <div className={cn("relative", className)}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cool-grey" />
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10 glass-input"
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-cool-grey hover:text-near-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

interface SearchResultsProps {
  resultCount: number;
  searchTerm: string;
  className?: string;
}

const SearchResults = React.forwardRef<HTMLDivElement, SearchResultsProps>(
  ({ resultCount, searchTerm, className }, ref) => {
    if (!searchTerm) return null;
    
    return (
      <div ref={ref} className={cn("text-sm text-cool-grey", className)}>
        {resultCount === 0 ? (
          <span>No results found for "{searchTerm}"</span>
        ) : (
          <span>
            {resultCount} result{resultCount !== 1 ? 's' : ''} for "{searchTerm}"
          </span>
        )}
      </div>
    )
  }
)
SearchResults.displayName = "SearchResults"

interface FilterOption {
  label: string;
  value: string | number;
}

interface FilterSelectProps {
  label: string;
  value: any;
  onChange: (value: any) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ label, value, onChange, options, placeholder = "Select...", className, multiple }, ref) => {
    return (
      <div className={cn("space-y-2", className)}>
        <label className="text-sm font-medium text-cool-grey">{label}</label>
        <select
          ref={ref}
          value={multiple ? undefined : value || ''}
          onChange={(e) => {
            if (multiple) {
              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
              onChange(selectedOptions);
            } else {
              onChange(e.target.value || null);
            }
          }}
          multiple={multiple}
          className="glass-input w-full"
        >
          {!multiple && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }
)
FilterSelect.displayName = "FilterSelect"

interface FilterRangeProps {
  label: string;
  value: { min?: number; max?: number };
  onChange: (value: { min?: number; max?: number }) => void;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  className?: string;
}

const FilterRange = React.forwardRef<HTMLDivElement, FilterRangeProps>(
  ({ label, value, onChange, minPlaceholder = "Min", maxPlaceholder = "Max", className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        <label className="text-sm font-medium text-cool-grey">{label}</label>
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder={minPlaceholder}
            value={value.min || ''}
            onChange={(e) => onChange({ ...value, min: e.target.value ? Number(e.target.value) : undefined })}
            className="glass-input"
          />
          <span className="text-cool-grey self-center">to</span>
          <Input
            type="number"
            placeholder={maxPlaceholder}
            value={value.max || ''}
            onChange={(e) => onChange({ ...value, max: e.target.value ? Number(e.target.value) : undefined })}
            className="glass-input"
          />
        </div>
      </div>
    )
  }
)
FilterRange.displayName = "FilterRange"

interface FilterPanelProps {
  children: React.ReactNode;
  title?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  onClear?: () => void;
  className?: string;
}

const FilterPanel = React.forwardRef<HTMLDivElement, FilterPanelProps>(
  ({ children, title = "Filters", isOpen = true, onToggle, onClear, className }, ref) => {
    return (
      <Card ref={ref} className={cn("glass-card border-glass", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-ice-blue flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>{title}</span>
            </CardTitle>
            <div className="flex space-x-2">
              {onClear && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  className="text-cool-grey hover:text-near-white"
                >
                  Clear
                </Button>
              )}
              {onToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="text-cool-grey hover:text-near-white"
                >
                  {isOpen ? 'Hide' : 'Show'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {isOpen && (
          <CardContent className="space-y-4">
            {children}
          </CardContent>
        )}
      </Card>
    )
  }
)
FilterPanel.displayName = "FilterPanel"

interface ActiveFiltersProps {
  filters: Record<string, any>;
  onRemoveFilter: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

const ActiveFilters = React.forwardRef<HTMLDivElement, ActiveFiltersProps>(
  ({ filters, onRemoveFilter, onClearAll, className }, ref) => {
    const activeFilters = Object.entries(filters).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    );

    if (activeFilters.length === 0) return null;

    return (
      <div ref={ref} className={cn("flex flex-wrap items-center gap-2", className)}>
        <span className="text-sm text-cool-grey">Active filters:</span>
        {activeFilters.map(([key, value]) => (
          <div
            key={key}
            className="flex items-center space-x-1 bg-ice-blue/20 text-ice-blue px-2 py-1 rounded-md text-sm"
          >
            <span>{key}: {Array.isArray(value) ? value.join(', ') : String(value)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveFilter(key)}
              className="h-4 w-4 p-0 text-ice-blue hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {onClearAll && activeFilters.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-cool-grey hover:text-near-white"
          >
            Clear all
          </Button>
        )}
      </div>
    )
  }
)
ActiveFilters.displayName = "ActiveFilters"

export { 
  SearchInput, 
  SearchResults, 
  FilterSelect, 
  FilterRange, 
  FilterPanel, 
  ActiveFilters 
} 