import React, { createContext, useContext, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // SSR-safe theme initialization
  const [theme, setTheme] = useState(() => {
    // SSR-safe check
    if (typeof window === 'undefined') {
      return 'light'; // Default for SSR
    }
    
    try {
      const savedTheme = localStorage.getItem('clara-theme');
      
      // Validate saved theme value
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      
      // Check system preference as fallback
      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      
      return 'light';
    } catch (error) {
      console.warn('[ClaraTheme] localStorage access failed, using light theme:', error);
      return 'light';
    }
  });

  // Track if component is mounted (SSR-safe)
  const [mounted, setMounted] = useState(false);

  // Use useLayoutEffect to prevent hydration mismatches
  useLayoutEffect(() => {
    setMounted(true);
    
    const root = document.documentElement;
    
    // Simple theme application - no complex observers
    const applyTheme = () => {
      try {
        // Clean slate approach
        root.classList.remove('dark', 'light');
        
        // Apply theme class directly to documentElement
        root.classList.add(theme);
        
        // Safe localStorage save
        try {
          localStorage.setItem('clara-theme', theme);
        } catch (error) {
          console.warn('[ClaraTheme] Failed to save theme to localStorage:', error);
        }
        
        console.log(`[ClaraTheme] Theme applied: ${theme}`);
        
      } catch (error) {
        console.error('[ClaraTheme] Theme application failed:', error);
        // Fallback to light theme on error
        root.classList.remove('dark', 'light');
        root.classList.add('light');
      }
    };

    // Apply theme immediately
    applyTheme();
    
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log(`[ClaraTheme] Toggling theme from ${theme} to ${newTheme}`);
    setTheme(newTheme);
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'light', toggleTheme: () => {} }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

