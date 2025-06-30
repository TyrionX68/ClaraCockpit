import React, { createContext, useContext, useLayoutEffect, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // SSR-safe theme initialization with more robust fallbacks
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

  // Enhanced theme application with multiple strategies
  const applyThemeToDOM = (themeValue) => {
    if (typeof window === 'undefined') return;
    
    try {
      const root = document.documentElement;
      
      console.log(`[ClaraTheme] Applying theme: ${themeValue}`);
      
      // Strategy 1: Clean slate approach
      root.classList.remove('dark', 'light');
      
      // Strategy 2: Force reflow to ensure class removal is processed
      root.offsetHeight; // Trigger reflow
      
      // Strategy 3: Apply theme class
      root.classList.add(themeValue);
      
      // Strategy 4: Force CSS variable update (Vercel compatibility)
      if (themeValue === 'dark') {
        root.style.setProperty('--background', '222.2 84% 4.9%');
        root.style.setProperty('--foreground', '210 40% 98%');
        root.style.setProperty('--card', '222.2 84% 5.5%');
        root.style.setProperty('--card-foreground', '210 40% 98%');
      } else {
        root.style.setProperty('--background', '0 0% 100%');
        root.style.setProperty('--foreground', '222.2 84% 4.9%');
        root.style.setProperty('--card', '0 0% 98%');
        root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
      }
      
      // Strategy 5: Force body style update for immediate visual feedback
      const body = document.body;
      if (themeValue === 'dark') {
        body.style.backgroundColor = 'hsl(222.2 84% 4.9%)';
        body.style.color = 'hsl(210 40% 98%)';
      } else {
        body.style.backgroundColor = 'hsl(0 0% 100%)';
        body.style.color = 'hsl(222.2 84% 4.9%)';
      }
      
      // Strategy 6: Safe localStorage save
      try {
        localStorage.setItem('clara-theme', themeValue);
      } catch (error) {
        console.warn('[ClaraTheme] Failed to save theme to localStorage:', error);
      }
      
      // Strategy 7: Debug logging for Vercel troubleshooting
      console.log(`[ClaraTheme] Theme applied successfully: ${themeValue}`);
      console.log(`[ClaraTheme] DOM classes:`, Array.from(root.classList));
      console.log(`[ClaraTheme] CSS variables:`, {
        background: getComputedStyle(root).getPropertyValue('--background'),
        foreground: getComputedStyle(root).getPropertyValue('--foreground')
      });
      
    } catch (error) {
      console.error('[ClaraTheme] Theme application failed:', error);
      // Fallback: Force light theme on error
      const root = document.documentElement;
      root.classList.remove('dark', 'light');
      root.classList.add('light');
      document.body.style.backgroundColor = 'white';
      document.body.style.color = 'black';
    }
  };

  // Use useLayoutEffect for immediate DOM updates (before paint)
  useLayoutEffect(() => {
    setMounted(true);
    applyThemeToDOM(theme);
  }, [theme]);

  // Additional useEffect for Vercel compatibility (after hydration)
  useEffect(() => {
    if (mounted) {
      // Double-check theme application after hydration
      setTimeout(() => {
        applyThemeToDOM(theme);
        console.log('[ClaraTheme] Post-hydration theme check completed');
      }, 100);
    }
  }, [mounted, theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log(`[ClaraTheme] Toggling theme from ${theme} to ${newTheme}`);
    setTheme(newTheme);
  };

  // Enhanced SSR safety - return minimal provider until mounted
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

// Export enhanced theme utilities
export const forceThemeApplication = (theme) => {
  if (typeof window !== 'undefined') {
    const provider = new ThemeProvider({});
    provider.applyThemeToDOM(theme);
  }
};

export default ThemeProvider;

