import * as React from "react"
import { cn } from "@/lib/utils"

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ options, value, onChange, name, className, orientation = 'vertical' }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "space-y-2",
          orientation === 'horizontal' && "flex space-x-4 space-y-0",
          className
        )}
      >
        {options.map((option) => (
          <RadioItem
            key={option.value}
            option={option}
            name={name}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
          />
        ))}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioItemProps {
  option: RadioOption;
  name: string;
  checked: boolean;
  onChange: () => void;
}

const RadioItem = ({ option, name, checked, onChange }: RadioItemProps) => {
  const radioId = `${name}-${option.value}`;
  
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <input
          type="radio"
          id={radioId}
          name={name}
          value={option.value}
          checked={checked}
          onChange={onChange}
          disabled={option.disabled}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded-full border border-glass bg-charcoal-glass ring-offset-charcoal-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ice-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
          )}
        />
        <div className="absolute inset-0 h-4 w-4 rounded-full bg-ice-blue opacity-0 peer-checked:opacity-100 transition-opacity" />
        <div className="absolute inset-1 h-2 w-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity" />
      </div>
      <label 
        htmlFor={radioId}
        className={cn(
          "text-sm font-medium cursor-pointer",
          option.disabled ? "text-cool-grey opacity-50" : "text-cool-grey"
        )}
      >
        {option.label}
      </label>
    </div>
  );
};

export { RadioGroup, RadioItem } 