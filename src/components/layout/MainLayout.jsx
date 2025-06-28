import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('clara-sidebar-collapsed') === 'true';
    setSidebarCollapsed(savedCollapsed);
  }, []);

  const handleSidebarToggle = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    localStorage.setItem('clara-sidebar-collapsed', newCollapsed.toString());
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* Main Content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'ml-16' : 'ml-64'}
      `}>
        {/* Content Area */}
        <main className="min-h-screen bg-background">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleSidebarToggle}
        />
      )}
    </div>
  );
};

export default MainLayout;

