import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Bot, 
  CreditCard, 
  Users, 
  FileText, 
  BarChart3, 
  Wrench, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggle, theme, onThemeToggle, isMobileOpen, onMobileToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/',
      description: 'Übersicht & KPIs'
    },
    {
      id: 'clara-ki',
      label: 'Clara KI',
      icon: Bot,
      path: '/clara-ki',
      description: 'Immobilien-Expertin'
    },
    {
      id: 'banking',
      label: 'Banking',
      icon: CreditCard,
      path: '/banking',
      description: 'Finanzen & Cashflow'
    },
    {
      id: 'tenants',
      label: 'Mieter',
      icon: Users,
      path: '/tenants',
      description: 'Mieterverwaltung'
    },
    {
      id: 'documents',
      label: 'Dokumente',
      icon: FileText,
      path: '/documents',
      description: 'Verträge & Unterlagen'
    },
    {
      id: 'analytics',
      label: 'Analysen',
      icon: BarChart3,
      path: '/analytics',
      description: 'Rendite & Kennzahlen'
    },
    {
      id: 'maintenance',
      label: 'Wartung',
      icon: Wrench,
      path: '/maintenance',
      description: 'Instandhaltung'
    },
    {
      id: 'communication',
      label: 'Kommunikation',
      icon: MessageSquare,
      path: '/communication',
      description: 'Nachrichten & Termine'
    },
    {
      id: 'manifest',
      label: 'Manifest',
      icon: Settings,
      path: '/manifest',
      description: 'Einstellungen'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    // Close mobile menu after navigation
    if (onMobileToggle) {
      onMobileToggle(false);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full 
        bg-white dark:bg-slate-900 text-black dark:text-white
        border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out shadow-lg
        ${isCollapsed ? 'w-16' : 'w-64'}
        hidden md:block
        z-[100]
      `} style={{
        backgroundColor: 'var(--sidebar-bg, white)',
        color: 'var(--sidebar-text, black)',
        borderColor: 'var(--sidebar-border, #e5e7eb)'
      }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="font-bold text-black dark:text-white">Clara360</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Fusion Dashboard</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isCollapsed ? 'Sidebar erweitern' : 'Sidebar einklappen'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 text-left group
                  ${active 
                    ? 'bg-blue-600 text-white' 
                    : 'text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
                title={isCollapsed ? `${item.label} - ${item.description}` : ''}
              >
                <Icon className={`
                  w-5 h-5 flex-shrink-0
                  ${active ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white'}
                `} />
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</div>
                  </div>
                )}
                
                {!isCollapsed && active && (
                  <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onThemeToggle}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={`${theme === 'light' ? 'Dark' : 'Light'} Mode aktivieren`}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" />
          )}
          
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {theme === 'light' ? 'Dunkles Design' : 'Helles Design'}
              </div>
            </div>
          )}
        </button>
        
        {/* Footer Info */}
        {!isCollapsed && (
          <div className="mt-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Immobilien-Management
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Mobile Sidebar */}
      <div 
        className={`
          fixed left-0 top-0 h-full w-72 z-50 md:hidden
          transition-transform duration-300 ease-in-out shadow-lg backdrop-blur-md
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: theme === 'light' ? '#ffffff' : '#0f172a',
          color: theme === 'light' ? '#000000' : '#ffffff',
          borderRight: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #374151'
        }}
      >
        {/* Mobile Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{
            borderBottomColor: theme === 'light' ? '#e5e7eb' : '#374151'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h1 
                className="font-bold"
                style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}
              >
                Clara360
              </h1>
              <p 
                className="text-xs"
                style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
              >
                Fusion Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group"
                  style={{
                    backgroundColor: active 
                      ? '#2563eb' 
                      : 'transparent',
                    color: active 
                      ? '#ffffff' 
                      : (theme === 'light' ? '#000000' : '#ffffff')
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.target.style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon 
                    className="w-5 h-5 flex-shrink-0"
                    style={{
                      color: active 
                        ? '#ffffff' 
                        : (theme === 'light' ? '#6b7280' : '#9ca3af')
                    }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div 
                      className="text-xs truncate"
                      style={{
                        color: active 
                          ? 'rgba(255, 255, 255, 0.8)' 
                          : (theme === 'light' ? '#6b7280' : '#9ca3af')
                      }}
                    >
                      {item.description}
                    </div>
                  </div>
                  
                  {active && (
                    <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile Theme Toggle */}
        <div 
          className="p-4 border-t"
          style={{
            borderTopColor: theme === 'light' ? '#e5e7eb' : '#374151'
          }}
        >
          <button
            onClick={onThemeToggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
            style={{
              color: theme === 'light' ? '#000000' : '#ffffff'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#374151';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            {theme === 'light' ? (
              <Moon 
                className="w-5 h-5"
                style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
              />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
            
            <div className="flex-1 text-left">
              <div 
                className="font-medium text-sm"
                style={{ color: theme === 'light' ? '#000000' : '#ffffff' }}
              >
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </div>
              <div 
                className="text-xs"
                style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
              >
                {theme === 'light' ? 'Dunkles Design' : 'Helles Design'}
              </div>
            </div>
          </button>
          
          <div className="mt-4">
            <div 
              className="text-xs text-center"
              style={{ color: theme === 'light' ? '#6b7280' : '#9ca3af' }}
            >
              Immobilien-Management
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;