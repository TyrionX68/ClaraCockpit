/**
 * ClaraThemeSwitch.jsx - v3.1 Theme Toggle Component
 */

import React from 'react';
import { useTheme } from '../../context/ClaraThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ClaraThemeSwitch({ 
  className = '',
  showLabel = false,
  size = 'md',
  ...props 
}) {
  const { theme, toggleTheme, isLoading } = useTheme();

  if (isLoading) {
    return (
      <div className="flex items-center">
        <div className="w-10 h-6 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition flex items-center justify-center ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          }`}
        >
          {theme === 'dark' ? (
            <Moon className="h-3 w-3 text-gray-600" />
          ) : (
            <Sun className="h-3 w-3 text-yellow-500" />
          )}
        </span>
      </button>
    </div>
  );
}

export { ClaraThemeSwitch };

