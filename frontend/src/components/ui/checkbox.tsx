import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="checkbox"
            id={checkboxId}
            ref={ref}
            className={cn(
              "peer h-4 w-4 shrink-0 rounded-sm border border-glass bg-charcoal-glass ring-offset-charcoal-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
              className
            )}
            {...props}
          />
          <Check 
            className="absolute inset-0 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" 
          />
          <div className="absolute inset-0 h-4 w-4 bg-ice-blue opacity-0 peer-checked:opacity-100 rounded-sm transition-opacity -z-10" />
        </div>
        {label && (
          <label 
            htmlFor={checkboxId}
            className="text-sm font-medium text-cool-grey cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox } 