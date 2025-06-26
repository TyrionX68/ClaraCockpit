import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  Building2, 
  Users, 
  Euro, 
  TrendingUp,
  Home,
  AlertTriangle,
  CreditCard,
  MessageSquare,
  Bot,
  Settings,
  LogOut,
  Mail
} from 'lucide-react';
import { usePropertyContext } from '../hooks/usePropertyContext';

const ClaraFusionDashboard = () => {
  const navigate = useNavigate();
  const { kpis, loading, error } = usePropertyContext();
  
  // KPI-Daten mit echten Werten oder Fallbacks
  const kpiData = {
    objekteVerwaltet: { 
      value: kpis?.objekteVerwaltet?.value || 1, 
      label: kpis?.objekteVerwaltet?.label || "Waldhofstraße 76", 
      icon: Building2,
      onClick: () => navigate('/objekte')
    },
    mieterGesamt: { 
      value: kpis?.mieterGesamt?.value || 14, 
      label: kpis?.mieterGesamt?.label || "100% Vermietungsgrad", 
      icon: Users,
      onClick: () => navigate('/eigentuemer')
    },
    monatlicheMiete: { 
      value: kpis?.monatlicheMiete?.value || "8.360€", 
      label: kpis?.monatlicheMiete?.label || "Gesamteinnahmen", 
      icon: Euro,
      onClick: () => navigate('/zahlungen')
    },
    jahresrendite: { 
      value: kpis?.jahresrendite?.value || "8.4%", 
      label: kpis?.jahresrendite?.label || "Über Marktdurchschnitt", 
      icon: TrendingUp,
      onClick: () => navigate('/analytics')
    }
  };

  const sidebarSections = [
    {
      title: "VERWALTUNG",
      color: "border-blue-500",
      items: [
        { id: 'dashboard', name: "Dashboard", icon: Home, active: true, path: '/dashboard' },
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

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('clara_user_email');
    localStorage.removeItem('clara_session_token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Funktional und klickbar */}
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

        {/* Navigation - Vollständig funktional */}
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
                      variant={item.active ? "default" : "ghost"}
                      className={`w-full justify-start gap-3 h-9 ${
                        item.active 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => handleNavigation(item.path)}
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

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Dashboard Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clara360 Dashboard</h1>
              <p className="text-gray-600">Hausverwaltung Waldhofstraße 76 - Live-Modus</p>
            </div>
          </div>
        </div>

        {/* Supabase Status Alert */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-800 mb-1">⚠️ Supabase Status</h3>
                <p className="text-sm text-red-700">Verbindungsfehler: Invalid API key</p>
                <p className="text-xs text-red-600 mt-1">Letzter Test: 22.6.2025, 19:51:22</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-red-300 text-red-700"
                onClick={() => navigate('/einstellungen')}
              >
                Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards - Klickbar und funktional */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(kpiData).map(([key, data]) => (
            <Card 
              key={key} 
              className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]"
              onClick={data.onClick}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <data.icon className="w-4 h-4 text-blue-600" />
                  {key === 'objekteVerwaltet' ? 'Objekte verwaltet' :
                   key === 'mieterGesamt' ? 'Mieter gesamt' :
                   key === 'monatlicheMiete' ? 'Monatliche Miete' :
                   'Jahresrendite'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {data.value}
                </div>
                <p className="text-sm text-gray-600">{data.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Section - Klickbare Bereiche */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aktuelle Rückstände */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/rueckstaende')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Aktuelle Rückstände
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-red-800">Familie Schmidt</p>
                    <p className="text-sm text-red-600">1. OG rechts - 2 Monate</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-800">1.200€</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Finanzübersicht */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/analytics')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingUp className="w-5 h-5" />
                Finanzübersicht
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mieteinnahmen (Monat)</span>
                  <span className="font-semibold text-green-600">+8.360€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Betriebskosten</span>
                  <span className="font-semibold text-red-600">-1.200€</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Netto-Cashflow</span>
                  <span className="text-green-600">+7.160€</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Schnellzugriff</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-2"
              onClick={() => navigate('/clara-ki')}
            >
              <Bot className="w-5 h-5" />
              Clara KI
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-2"
              onClick={() => navigate('/banking')}
            >
              <CreditCard className="w-5 h-5" />
              Banking
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-2"
              onClick={() => navigate('/manifest')}
            >
              <Settings className="w-5 h-5" />
              Manifest
            </Button>
            <Button 
              variant="outline" 
              className="h-16 flex flex-col gap-2"
              onClick={() => navigate('/mieter-kommunikation')}
            >
              <MessageSquare className="w-5 h-5" />
              Kommunikation
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClaraFusionDashboard;

