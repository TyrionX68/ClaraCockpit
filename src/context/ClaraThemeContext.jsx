/**
 * ClaraThemeContext.jsx - v3.1 Theme Management System
 * Provides dark/light mode switching with persistent storage
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const ClaraThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ClaraThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ClaraThemeProvider');
  }
  return context;
};

export const ClaraThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('clara-theme');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const initialTheme = savedTheme || systemPreference;
    setTheme(initialTheme);
    setIsLoading(false);
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('clara-theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('clara-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const setSpecificTheme = (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') return;
    
    setTheme(newTheme);
    localStorage.setItem('clara-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isLoading,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ClaraThemeContext.Provider value={value}>
      {children}
    </ClaraThemeContext.Provider>
  );
};

export default ClaraThemeContext;
