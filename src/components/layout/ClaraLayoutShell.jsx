import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ClaraLayoutShell - Unified Layout Component for all Clara Cockpit pages
 * 
 * Design System Principles:
 * - Mobile-First responsive design
 * - Consistent spacing and typography
 * - Theme-aware styling
 * - Accessibility compliant
 * - Performance optimized
 */
const ClaraLayoutShell = ({ 
  children,
  className = "",
  suppressHydrationWarning = false 
}) => {
  const { theme } = useTheme();

  return (
    <div 
      className={`
        min-h-screen w-full
        bg-white dark:bg-slate-900
        text-black dark:text-white
        transition-colors duration-200
        ${className}
      `}
      suppressHydrationWarning={suppressHydrationWarning}
    >
      {children}
    </div>
  );
};

/**
 * ClaraPageHeader - Unified page header component
 */
export const ClaraPageHeader = ({ 
  title, 
  description, 
  actions,
  className = "" 
}) => {
  const { theme } = useTheme();
  
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 
            className="text-2xl sm:text-3xl font-bold text-black dark:text-white truncate"
            suppressHydrationWarning
          >
            {title}
          </h1>
          {description && (
            <p 
              className="mt-1 text-sm text-gray-600 dark:text-gray-400"
              suppressHydrationWarning
            >
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex-shrink-0">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ClaraPageContent - Unified content container
 */
export const ClaraPageContent = ({ 
  children, 
  className = "",
  maxWidth = "full" 
}) => {
  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    "6xl": "max-w-6xl",
    full: "max-w-full"
  };

  return (
    <div className={`
      w-full ${maxWidthClasses[maxWidth]} mx-auto
      px-4 sm:px-6 lg:px-8
      ${className}
    `}>
      {children}
    </div>
  );
};

/**
 * ClaraGrid - Unified grid system
 */
export const ClaraGrid = ({ 
  children, 
  cols = "auto",
  gap = "6",
  className = "" 
}) => {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  };

  const gapClasses = {
    2: "gap-2",
    3: "gap-3", 
    4: "gap-4",
    6: "gap-6",
    8: "gap-8"
  };

  return (
    <div className={`
      grid ${colClasses[cols]} ${gapClasses[gap]}
      ${className}
    `}>
      {children}
    </div>
  );
};

/**
 * ClaraCard - Unified card component
 */
export const ClaraCard = ({ 
  children, 
  className = "",
  padding = "6",
  hover = true 
}) => {
  const paddingClasses = {
    3: "p-3",
    4: "p-4", 
    6: "p-6",
    8: "p-8"
  };

  return (
    <div className={`
      bg-white dark:bg-slate-800
      border border-gray-200 dark:border-gray-700
      rounded-lg shadow-sm
      ${paddingClasses[padding]}
      ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

/**
 * ClaraKPICard - Specialized KPI card component
 */
export const ClaraKPICard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  trend = "neutral",
  className = "" 
}) => {
  const trendColors = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400", 
    neutral: "text-gray-600 dark:text-gray-400"
  };

  return (
    <ClaraCard className={className}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-black dark:text-white">
            {value}
          </p>
          {change && (
            <p className={`mt-1 text-sm ${trendColors[trend]}`}>
              {change}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        )}
      </div>
    </ClaraCard>
  );
};

/**
 * ClaraButton - Unified button component
 */
export const ClaraButton = ({ 
  children, 
  variant = "primary",
  size = "md",
  className = "",
  ...props 
}) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white border-transparent",
    secondary: "bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-black dark:text-white border-gray-300 dark:border-gray-600",
    outline: "bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800 text-black dark:text-white border-gray-300 dark:border-gray-600"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm", 
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={`
        inline-flex items-center justify-center
        border rounded-lg font-medium
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default ClaraLayoutShell;

