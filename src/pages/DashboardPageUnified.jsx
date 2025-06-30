import React, { useState } from 'react';
import { Home, Users, AlertTriangle, CreditCard, FileText, Settings, TrendingUp } from 'lucide-react';
import ClaraLayoutShell, { 
  ClaraPageHeader, 
  ClaraPageContent, 
  ClaraGrid, 
  ClaraCard, 
  ClaraKPICard,
  ClaraButton 
} from '../components/layout/ClaraLayoutShell';
import { useTheme } from '../contexts/ThemeContext';

/**
 * DashboardPageUnified - Unified Dashboard using Clara Design System
 * 
 * This serves as the prototype template for all other pages
 * Features:
 * - Mobile-First responsive design
 * - Consistent theme integration
 * - Unified component system
 * - Performance optimized
 * - Accessibility compliant
 */
const DashboardPageUnified = () => {
  const { theme } = useTheme();
  const [debugMode, setDebugMode] = useState(false);

  // Mock data for demonstration
  const kpiData = [
    {
      title: "Objekte",
      value: "12",
      change: "+2 dieses Jahr",
      icon: Home,
      trend: "positive"
    },
    {
      title: "Mieter", 
      value: "45",
      change: "100% Vermietung",
      icon: Users,
      trend: "positive"
    },
    {
      title: "Mieteinnahmen",
      value: "€87.500",
      change: "+5.2% vs. Vormonat", 
      icon: CreditCard,
      trend: "positive"
    },
    {
      title: "Wartung",
      value: "8",
      change: "3 dringend",
      icon: AlertTriangle,
      trend: "negative"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      title: "3 neue Dokumente wurden hochgeladen",
      time: "Vor 2 Stunden",
      type: "document"
    },
    {
      id: 2, 
      title: "Heizungsreparatur in Wohnung 3B",
      time: "Vor 5 Stunden",
      type: "maintenance"
    },
    {
      id: 3,
      title: "Zahlung von €1.250 für Wohnung 2A",
      time: "Vor 1 Tag", 
      type: "payment"
    },
    {
      id: 4,
      title: "Mietvertrag Wohnung 1C läuft in 30 Tagen ab",
      time: "Vor 2 Tagen",
      type: "contract"
    },
    {
      id: 5,
      title: "Wasserschaden in Wohnung 4A gemeldet",
      time: "Vor 3 Tagen",
      type: "issue"
    }
  ];

  const quickActions = [
    { label: "Neuen Mieter hinzufügen", icon: Users },
    { label: "Mietvertrag erstellen", icon: FileText },
    { label: "Wartung beauftragen", icon: AlertTriangle },
    { label: "Reparatur anfordern", icon: Settings },
    { label: "Dokument hochladen", icon: FileText },
    { label: "Neue Datei hinzufügen", icon: FileText }
  ];

  // Header actions
  const headerActions = [
    <ClaraButton
      key="debug"
      variant="outline"
      size="sm"
      onClick={() => setDebugMode(!debugMode)}
    >
      <Settings className="w-4 h-4 mr-2" />
      Debug
    </ClaraButton>
  ];

  return (
    <ClaraLayoutShell suppressHydrationWarning>
      <ClaraPageContent>
        {/* Page Header */}
        <ClaraPageHeader
          title="Dashboard"
          description="Übersicht über Ihre Immobilien, Mieter und Finanzen"
          actions={headerActions}
        />

        {/* KPI Cards Grid */}
        <div className="mb-8">
          <ClaraGrid cols={4} gap="6">
            {kpiData.map((kpi, index) => (
              <ClaraKPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                change={kpi.change}
                icon={kpi.icon}
                trend={kpi.trend}
              />
            ))}
          </ClaraGrid>
        </div>

        {/* Main Content Grid */}
        <ClaraGrid cols={3} gap="6" className="mb-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <ClaraCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Letzte Aktivitäten
                </h3>
                <ClaraButton variant="outline" size="sm">
                  Alle anzeigen
                </ClaraButton>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <ClaraButton variant="outline" className="w-full">
                  Weitere Aktivitäten laden
                </ClaraButton>
              </div>
            </ClaraCard>
          </div>

          {/* Quick Actions */}
          <div>
            <ClaraCard>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                Schnellaktionen
              </h3>
              
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <action.icon className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    <span className="text-sm text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </ClaraCard>
          </div>
        </ClaraGrid>

        {/* Performance Metrics */}
        <ClaraGrid cols={2} gap="6" className="mb-8">
          <ClaraCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Umsatz & Gewinn Entwicklung
              </h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Monatlicher Umsatz</span>
                <span className="text-lg font-semibold text-black dark:text-white">€89.200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gewinnmarge</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">+13.1%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
          </ClaraCard>

          <ClaraCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">
                Immobilien-Portfolio
              </h3>
              <Home className="w-5 h-5 text-blue-500" />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Gesamtwert</span>
                <span className="text-lg font-semibold text-black dark:text-white">€2.4M</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rendite p.a.</span>
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">8.4%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
          </ClaraCard>
        </ClaraGrid>

        {/* Debug Information */}
        {debugMode && (
          <ClaraCard className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Debug Information
            </h4>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <p suppressHydrationWarning>
                <strong>Theme:</strong> {theme}
              </p>
              <p>
                <strong>Layout System:</strong> ClaraLayoutShell v1.0
              </p>
              <p>
                <strong>Components:</strong> ClaraPageHeader, ClaraKPICard, ClaraGrid, ClaraCard
              </p>
              <p>
                <strong>Responsive:</strong> Mobile-First Design
              </p>
              <p>
                <strong>Performance:</strong> Optimized for &lt; 250KB payload
              </p>
            </div>
          </ClaraCard>
        )}
      </ClaraPageContent>
    </ClaraLayoutShell>
  );
};

export default DashboardPageUnified;

