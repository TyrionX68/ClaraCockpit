import React from 'react';
import { cn } from '../../lib/utils';

/**
 * ClaraButton - Atomic Design Button Component
 * Created: 2025-06-26_16-32-44
 * 
 * @param {Object} props
 * @param {string} props.variant - button style variant
 * @param {string} props.size - button size
 * @param {boolean} props.disabled - disabled state
 * @param {function} props.onClick - click handler
 * @param {React.ReactNode} props.children - button content
 */
const ClaraButton = ({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  onClick, 
  children, 
  className,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default ClaraButton;
