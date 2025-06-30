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
    
    // Hydration-sichere Theme-Anwendung
    const applyTheme = () => {
      try {
        // AGGRESSIVE THEME FIX - Force proper dark mode application
        root.classList.remove('dark', 'light');
        
        if (theme === 'dark') {
          root.classList.add('dark');
          // Force body background for immediate visual feedback
          document.body.style.backgroundColor = '#0f172a'; // slate-900
          document.body.style.color = '#f8fafc'; // slate-50
        } else {
          // Ensure light mode is properly applied
          document.body.style.backgroundColor = '#ffffff';
          document.body.style.color = '#0f172a';
        }
        
        // Safe localStorage save
        try {
          localStorage.setItem('clara-theme', theme);
        } catch (error) {
          console.warn('Failed to save theme to localStorage:', error);
        }
        
        // Debug-Logging für Theme-Anwendung
        console.log(`[ThemeContext] Theme applied: ${theme}`);
        console.log(`[ThemeContext] HTML classes:`, root.className);
        console.log(`[ThemeContext] Dark mode active:`, root.classList.contains('dark'));
        
      } catch (error) {
        console.error('Theme application failed:', error);
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
            console.log('[ThemeContext] DOM mutation detected, reapplying theme');
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
    console.log(`[ThemeContext] Toggling theme from ${theme} to ${theme === 'light' ? 'dark' : 'light'}`);
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

