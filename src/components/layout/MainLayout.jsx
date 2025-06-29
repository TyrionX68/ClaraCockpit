import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import MobileMenuButton from '../MobileMenuButton';

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Load sidebar state from localStorage with fallback
  useEffect(() => {
    try {
      const savedCollapsed = localStorage.getItem('clara-sidebar-collapsed') === 'true';
      setSidebarCollapsed(savedCollapsed);
    } catch (error) {
      console.warn('Failed to load sidebar state from localStorage:', error);
      setSidebarCollapsed(false);
    }
  }, []);

  const handleSidebarToggle = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    
    try {
      localStorage.setItem('clara-sidebar-collapsed', newCollapsed.toString());
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  };

  const handleMobileMenuToggle = (isOpen) => {
    if (typeof isOpen === 'boolean') {
      setMobileMenuOpen(isOpen);
    } else {
      setMobileMenuOpen(prev => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-black dark:text-white">
      {/* Mobile Menu Button */}
      <MobileMenuButton 
        isOpen={mobileMenuOpen}
        onToggle={handleMobileMenuToggle}
      />

      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        theme={theme}
        onThemeToggle={toggleTheme}
        isMobileOpen={mobileMenuOpen}
        onMobileToggle={handleMobileMenuToggle}
      />

      {/* Main Content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ml-0 md:ml-16 lg:ml-64
        ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-16 lg:ml-64'}
      `}>
        {/* Content Area */}
        <main className="min-h-screen bg-background">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[40] md:hidden"
          onClick={() => handleMobileMenuToggle(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;

