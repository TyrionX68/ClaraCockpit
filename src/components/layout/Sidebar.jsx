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

const Sidebar = ({ isCollapsed, onToggle, theme, onThemeToggle }) => {
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
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-card border-r border-border
      transition-all duration-300 ease-in-out z-50 shadow-lg
      ${isCollapsed ? 'w-16' : 'w-64'}
      hidden md:block
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="font-bold text-card-foreground">Clara360</h1>
              <p className="text-xs text-muted-foreground">Fusion Dashboard</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          title={isCollapsed ? 'Sidebar erweitern' : 'Sidebar einklappen'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
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
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-card-foreground hover:bg-accent hover:text-accent-foreground'
                  }
                `}
                title={isCollapsed ? `${item.label} - ${item.description}` : ''}
              >
                <Icon className={`
                  w-5 h-5 flex-shrink-0
                  ${active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground'}
                `} />
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                  </div>
                )}
                
                {!isCollapsed && active && (
                  <div className="w-2 h-2 bg-primary-foreground rounded-full flex-shrink-0"></div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border">
        <button
          onClick={onThemeToggle}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            text-card-foreground hover:bg-accent hover:text-accent-foreground transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={`${theme === 'light' ? 'Dark' : 'Light'} Mode aktivieren`}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" />
          )}
          
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </div>
              <div className="text-xs text-muted-foreground">
                {theme === 'light' ? 'Dunkles Design' : 'Helles Design'}
              </div>
            </div>
          )}
        </button>
        
        {/* Footer Info */}
        {!isCollapsed && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground text-center">
              Immobilien-Management
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;