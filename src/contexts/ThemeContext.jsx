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
      // PHASE 2.2B.2: Sync with initial theme loading from main.jsx
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
      console.warn('[ClaraTheme] localStorage access failed, using light theme:', error);
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // PHASE 2.2B.2: Enhanced theme application with perfect synchronization
    const applyTheme = () => {
      try {
        // Explizite Klassen-Bereinigung vor Anwendung
        root.classList.remove('dark', 'light');
        
        // Korrekte Theme-Anwendung auf HTML-Element
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.add('light');
        }
        
        // Safe localStorage save with consistent key
        try {
          localStorage.setItem('clara-theme', theme);
        } catch (error) {
          console.warn('[ClaraTheme] Failed to save theme to localStorage:', error);
        }
        
        // Enhanced debug logging for theme verification
        console.log(`[ClaraTheme] Theme applied: ${theme}`);
        console.log(`[ClaraTheme] Current DOM Class:`, root.classList.toString());
        console.log(`[ClaraTheme] Dark mode active:`, root.classList.contains('dark'));
        console.log(`[ClaraTheme] Button should show:`, theme === 'dark' ? 'Light Mode' : 'Dark Mode');
        
      } catch (error) {
        console.error('[ClaraTheme] Theme application failed:', error);
        // Fallback to light theme on error
        root.classList.remove('dark', 'light');
        root.classList.add('light');
      }
    };

    // Sofortige Anwendung
    applyTheme();
    
    // Zusätzliche Anwendung nach Hydration (für React/Next.js)
    const timeoutId = setTimeout(applyTheme, 100);
    
    // MutationObserver für DOM-Änderungen
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasCorrectClass = theme === 'dark' ? root.classList.contains('dark') : root.classList.contains('light');
          if (!hasCorrectClass) {
            console.log('[ClaraTheme] DOM mutation detected, reapplying theme');
            applyTheme();
          }
        }
      });
    });
    
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log(`[ClaraTheme] Toggling theme from ${theme} to ${newTheme}`);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

