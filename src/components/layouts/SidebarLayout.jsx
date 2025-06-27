import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building, 
  AlertTriangle, 
  CreditCard, 
  Banknote,
  MessageSquare,
  Bot,
  Settings,
  ChevronDown,
  ChevronRight,
  Circle
} from 'lucide-react';

const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    verwaltung: true,
    kommunikation: true,
    system: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/',
      type: 'single'
    },
    {
      id: 'verwaltung',
      label: 'VERWALTUNG',
      type: 'section',
      expanded: expandedSections.verwaltung,
      items: [
        {
          id: 'eigentumer',
          label: 'Eigentümer',
          icon: Users,
          path: '/eigentumer'
        },
        {
          id: 'objekte',
          label: 'Objekte',
          icon: Building,
          path: '/objekte'
        },
        {
          id: 'ruckstande',
          label: 'Rückstände',
          icon: AlertTriangle,
          path: '/ruckstande'
        },
        {
          id: 'zahlungen',
          label: 'Zahlungen',
          icon: CreditCard,
          path: '/zahlungen'
        }
      ]
    },
    {
      id: 'banking',
      label: 'Banking',
      icon: Banknote,
      path: '/banking',
      type: 'single'
    },
    {
      id: 'kommunikation',
      label: 'KOMMUNIKATION',
      type: 'section',
      expanded: expandedSections.kommunikation,
      items: [
        {
          id: 'mieter-kommunikation',
          label: 'Mieter-Kommunikation',
          icon: MessageSquare,
          path: '/kommunikation'
        }
      ]
    },
    {
      id: 'clara-ki',
      label: 'Clara KI',
      icon: Bot,
      path: '/clara-ki',
      type: 'single',
      highlight: true
    },
    {
      id: 'system',
      label: 'SYSTEM',
      type: 'section',
      expanded: expandedSections.system,
      items: [
        {
          id: 'manifest',
          label: 'Manifest',
          icon: Settings,
          path: '/manifest'
        }
      ]
    }
  ];

  const renderSidebarItem = (item) => {
    if (item.type === 'section') {
      return (
        <div key={item.id} className="mb-2">
          <button
            onClick={() => toggleSection(item.id)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
          >
            <span>{item.label}</span>
            {item.expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          {item.expanded && (
            <div className="ml-2 space-y-1">
              {item.items.map(subItem => (
                <Link
                  key={subItem.id}
                  to={subItem.path}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive(subItem.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <subItem.icon className="w-4 h-4 mr-3" />
                  {subItem.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.path}
        className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors mb-1 ${
          isActive(item.path)
            ? item.highlight
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 text-white'
            : item.highlight
              ? 'text-blue-400 hover:bg-blue-600 hover:text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        <item.icon className="w-4 h-4 mr-3" />
        {item.label}
        {item.highlight && (
          <Circle className="w-2 h-2 ml-auto fill-current text-green-400" />
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Clara360</h1>
              <div className="flex items-center space-x-2">
                <Circle className="w-2 h-2 fill-current text-green-400" />
                <span className="text-xs text-green-400">Supabase Live</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map(renderSidebarItem)}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            <div>Hausverwaltung</div>
            <div className="font-semibold text-gray-300">Waldhofstraße 76</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;

