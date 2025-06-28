import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bot, 
  CreditCard, 
  Settings, 
  MessageSquare,
  Users,
  FileText,
  BarChart3,
  Wrench,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isCollapsed, onToggle, theme, onThemeToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

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
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-white border-r border-gray-200 
      transition-all duration-300 ease-in-out z-50 shadow-lg
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Clara360</h1>
              <p className="text-xs text-gray-500">Fusion Dashboard</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title={isCollapsed ? 'Sidebar erweitern' : 'Sidebar einklappen'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
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
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                title={isCollapsed ? `${item.label} - ${item.description}` : ''}
              >
                <Icon className={`
                  w-5 h-5 flex-shrink-0
                  ${active ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                `} />
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-gray-500 truncate">{item.description}</div>
                  </div>
                )}
                
                {!isCollapsed && active && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onThemeToggle}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-gray-700 hover:bg-gray-50 transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={`${theme === 'light' ? 'Dark' : 'Light'} Mode aktivieren`}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-500" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" />
          )}
          
          {!isCollapsed && (
            <span className="text-sm font-medium">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </span>
          )}
        </button>
        
        {!isCollapsed && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              Clara360 v2.0
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              Immobilien-Management
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

