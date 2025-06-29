import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      // Safe localStorage access with fallback
      const savedTheme = localStorage.getItem('clara-theme');
      
      // Validate saved theme value
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme;
      }
      
      // Clear invalid localStorage values
      if (savedTheme && savedTheme !== 'light' && savedTheme !== 'dark') {
        localStorage.removeItem('clara-theme');
      }
      
      // Check system preference as fallback
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      
      return 'light';
    } catch (error) {
      // localStorage access failed (private browsing, etc.)
      console.warn('localStorage access failed, using light theme:', error);
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    
    try {
      // Korrekte Theme-Anwendung auf HTML-Element
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      
      // Safe localStorage save
      try {
        localStorage.setItem('clara-theme', theme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
      
      // Debug-Logging für Theme-Anwendung
      console.log(`[ThemeContext] Applied theme: ${theme}, HTML classes:`, root.className);
      
    } catch (error) {
      console.error('Theme application failed:', error);
      // Fallback to light theme on error
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

