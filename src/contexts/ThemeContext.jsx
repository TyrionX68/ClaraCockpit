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
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('clara-theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove dark class first
    root.classList.remove('dark');
    
    // Only add 'dark' class if theme is dark (Tailwind expects this)
    if (theme === 'dark') {
      root.classList.add('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('clara-theme', theme);
    
    // Update body styles for immediate visual feedback
    if (theme === 'light') {
      document.body.className = 'bg-white text-gray-900';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    } else {
      document.body.className = 'bg-gray-900 text-white';
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
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

