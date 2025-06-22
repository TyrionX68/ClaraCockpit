import React from 'react';
import { Button } from './ui/button';
import { 
  Building2, 
  Users, 
  Euro, 
  Home,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  Bot,
  Settings,
  LogOut,
  Mail
} from 'lucide-react';

const Sidebar = ({ currentPage, onNavigate }) => {
  const sidebarSections = [
    {
      title: "VERWALTUNG",
      color: "border-blue-500",
      items: [
        { id: 'dashboard', name: "Dashboard", icon: Home, path: '/dashboard' },
        { id: 'eigentuemer', name: "Eigentümer", icon: Users, path: '/eigentuemer' },
        { id: 'objekte', name: "Objekte", icon: Building2, path: '/objekte' },
        { id: 'rueckstaende', name: "Rückstände", icon: AlertTriangle, path: '/rueckstaende' },
        { id: 'zahlungen', name: "Zahlungen", icon: Euro, path: '/zahlungen' },
        { id: 'banking', name: "Banking", icon: CreditCard, path: '/banking' }
      ]
    },
    {
      title: "KOMMUNIKATION", 
      color: "border-orange-500",
      items: [
        { id: 'mieter-kommunikation', name: "Mieter-Kommunikation", icon: MessageSquare, path: '/mieter-kommunikation' },
        { id: 'clara-ki', name: "Clara KI", icon: Bot, path: '/clara-ki' },
        { id: 'outlook', name: "Outlook", icon: Mail, path: '/outlook' }
      ]
    },
    {
      title: "SYSTEM",
      color: "border-red-500", 
      items: [
        { id: 'einstellungen', name: "Einstellungen", icon: Settings, path: '/einstellungen' }
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('clara_user_email');
    localStorage.removeItem('clara_session_token');
    window.location.reload();
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">Clara360</h1>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Supabase Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {sidebarSections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            <h3 className={`text-xs font-semibold text-gray-500 mb-3 pb-2 border-b-2 ${section.color}`}>
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <Button
                    variant={currentPage === item.id ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 h-9 ${
                      currentPage === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => onNavigate(item.path)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm font-medium">DA</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Demo Admin</p>
            <p className="text-xs text-gray-500">admin@clara360.de</p>
          </div>
        </div>
        <Button variant="outline" className="w-full gap-2 h-9" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Abmelden
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;

