import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const ThemedSelect = forwardRef(({ 
  className, 
  label,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  placeholder = "Bitte wählen...",
  children,
  ...props 
}, ref) => {
  const selectId = props.id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const helperId = helperText ? `${selectId}-helper` : undefined;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={selectId}
          className={cn(
            "block text-sm font-medium mb-2",
            "text-gray-700 dark:text-gray-300",
            disabled && "text-gray-400 dark:text-gray-600",
            error && "text-red-700 dark:text-red-400",
            success && "text-green-700 dark:text-green-400"
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(
            errorId && errorId,
            helperId && helperId
          ).trim() || undefined}
          className={cn(
            // Base styles
            "w-full px-3 py-2 pr-10 border rounded-md transition-all duration-200",
            "appearance-none cursor-pointer",
            
            // Background and text colors
            "bg-white dark:bg-slate-800",
            "text-gray-900 dark:text-white",
            
            // Border colors
            "border-gray-300 dark:border-gray-600",
            
            // Focus states
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "focus:ring-blue-500 dark:focus:ring-blue-400",
            "focus:border-blue-500 dark:focus:border-blue-400",
            
            // Error states
            error && [
              "border-red-300 dark:border-red-600",
              "focus:ring-red-500 dark:focus:ring-red-400",
              "focus:border-red-500 dark:focus:border-red-400"
            ],
            
            // Success states
            success && [
              "border-green-300 dark:border-green-600",
              "focus:ring-green-500 dark:focus:ring-green-400",
              "focus:border-green-500 dark:focus:border-green-400"
            ],
            
            // Disabled states
            disabled && [
              "bg-gray-50 dark:bg-slate-900",
              "text-gray-400 dark:text-gray-600",
              "border-gray-200 dark:border-gray-700",
              "cursor-not-allowed"
            ],
            
            // Hover states (when not disabled)
            !disabled && "hover:border-gray-400 dark:hover:border-gray-500",
            
            className
          )}
          {...props}
        >
          {/* Placeholder Option */}
          {placeholder && (
            <option value="" disabled className="text-gray-500 dark:text-gray-400">
              {placeholder}
            </option>
          )}
          
          {/* Children Options */}
          {children}
        </select>

        {/* Dropdown Icon */}
        <div className={cn(
          "absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none",
          disabled && "opacity-50"
        )}>
          <ChevronDown 
            className={cn(
              "w-4 h-4",
              "text-gray-400 dark:text-gray-500",
              error && "text-red-400 dark:text-red-500",
              success && "text-green-400 dark:text-green-500"
            )} 
          />
        </div>
      </div>

      {/* Helper Text */}
      {helperText && !error && (
        <p 
          id={helperId}
          className={cn(
            "mt-1 text-sm",
            "text-gray-600 dark:text-gray-400",
            disabled && "text-gray-400 dark:text-gray-600"
          )}
        >
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p 
          id={errorId}
          role="alert"
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {/* Success Message */}
      {success && !error && (
        <p className="mt-1 text-sm text-green-600 dark:text-green-400">
          {success}
        </p>
      )}
    </div>
  );
});

ThemedSelect.displayName = "ThemedSelect";

// ThemedOption component for consistent option styling
const ThemedOption = forwardRef(({ 
  className, 
  disabled = false,
  children,
  ...props 
}, ref) => {
  return (
    <option
      ref={ref}
      disabled={disabled}
      className={cn(
        // Base styles
        "py-2 px-3",
        
        // Background colors (browser dependent)
        "bg-white dark:bg-slate-800",
        "text-gray-900 dark:text-white",
        
        // Disabled states
        disabled && [
          "text-gray-400 dark:text-gray-600",
          "cursor-not-allowed"
        ],
        
        className
      )}
      {...props}
    >
      {children}
    </option>
  );
});

ThemedOption.displayName = "ThemedOption";

export { ThemedSelect, ThemedOption };

