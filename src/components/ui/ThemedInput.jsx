import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const ThemedInput = forwardRef(({ 
  className, 
  type = "text", 
  label,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  ...props 
}, ref) => {
  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
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

      {/* Input Field */}
      <input
        ref={ref}
        type={type}
        id={inputId}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={cn(
          errorId && errorId,
          helperId && helperId
        ).trim() || undefined}
        className={cn(
          // Base styles
          "w-full px-3 py-2 border rounded-md transition-all duration-200",
          
          // Background and text colors
          "bg-white dark:bg-slate-800",
          "text-gray-900 dark:text-white",
          
          // Border colors
          "border-gray-300 dark:border-gray-600",
          
          // Placeholder colors
          "placeholder-gray-500 dark:placeholder-gray-400",
          
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
      />

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

ThemedInput.displayName = "ThemedInput";

export { ThemedInput };

