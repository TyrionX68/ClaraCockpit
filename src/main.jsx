import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// PHASE 2.2B.2: Initial Theme Loading Before App Render
// This ensures theme is applied immediately, preventing flash of wrong theme
const initializeTheme = () => {
  try {
    const savedTheme = localStorage.getItem('clara-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // Apply theme class immediately to HTML element
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    // Debug logging for theme verification
    console.log('[ClaraTheme] Initial theme applied:', theme);
    console.log('[ClaraTheme] Current DOM Class:', document.documentElement.classList.toString());
    
    return theme;
  } catch (error) {
    console.warn('[ClaraTheme] Failed to initialize theme, using light fallback:', error);
    document.documentElement.classList.remove('dark');
    return 'light';
  }
};

// Initialize theme before React renders
initializeTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
