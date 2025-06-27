import React, { useState } from 'react';
import { Home, Users, AlertTriangle, CreditCard, FileText, Settings } from 'lucide-react';
import ClaraDashboardLayout from '../components/templates/ClaraDashboardLayout';
import ClaraDashboardHeader from '../components/molecules/ClaraDashboardHeader';
import ClaraKpiCard from '../components/molecules/ClaraKpiCard';
import ClaraManifestButton from '../components/molecules/ClaraManifestButton';
import ClaraSlotRenderer from '../components/templates/ClaraSlotRenderer';
import ClaraMieterDashboard from '../components/organisms/ClaraMieterDashboard';
import ClaraMahnungPanel from '../components/organisms/ClaraMahnungPanel';
import { tenantMocks, mahnungMocks, dashboardConfig } from '../data/mockData';

const DashboardPage = () => {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [debugMode, setDebugMode] = useState(false);

  const sampleMahnung = mahnungMocks[0];

  const handleTenantSelect = (tenant) => {
    setSelectedTenant(tenant);
    console.log('Selected tenant:', tenant);
  };

  const handleEscalate = (tenantName, newStatus) => {
    console.log('Escalating tenant to new status');
  };

  const handleGeneratePDF = (pdfLink, status) => {
    console.log('Generating PDF for tenant');
  };

  // Header actions
  const headerActions = [
    {
      icon: <Settings className="w-4 h-4" />,
      label: "Einstellungen",
      variant: "ghost",
      onClick: () => setDebugMode(!debugMode)
    }
  ];

  return (
    <ClaraDashboardLayout currentPage="dashboard">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header with Manifest Button */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            {/* Top row with Clara Logo and Manifest Button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Clara360
                </h1>
                <ClaraManifestButton />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Hausverwaltung Waldhofstraße 76 - Live-Modus
                </span>
              </div>
            </div>
            
            {/* Dashboard Header */}
            <ClaraDashboardHeader
              title="Clara360 Dashboard"
              subtitle="Hausverwaltung Waldhofstraße 76 - Live-Modus"
              icon={<Home className="w-6 h-6" />}
              actions={headerActions}
              showFilter={false}
            />
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ClaraKpiCard
              icon={<Home className="w-6 h-6" />}
              value="1"
              label="Objekte verwaltet"
              subtext="Waldhofstraße 76"
              color="blue"
            />
            <ClaraKpiCard
              icon={<Users className="w-6 h-6" />}
              value="14"
              label="Mieter gesamt"
              subtext="100% Vermietungsgrad"
              color="green"
            />
            <ClaraKpiCard
              icon={<CreditCard className="w-6 h-6" />}
              value="8.360€"
              label="Monatliche Miete"
              subtext="Gesamteinnahmen"
              color="purple"
              trend="up"
              trendValue="+2.1%"
            />
            <ClaraKpiCard
              icon={<AlertTriangle className="w-6 h-6" />}
              value="8.4%"
              label="Jahresrendite"
              subtext="Über Marktdurchschnitt"
              color="orange"
              trend="up"
              trendValue="+0.8%"
            />
          </div>

          {/* Slot Renderer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Mieter Slot */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Mieter-Management
              </h3>
              <ClaraSlotRenderer 
                slotName="mieter"
                component={ClaraMieterDashboard}
                props={{
                  tenants: tenantMocks,
                  onTenantSelect: handleTenantSelect,
                  selectedTenant: selectedTenant,
                  debugMode: debugMode
                }}
              />
            </div>

            {/* Mahnung Slot */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Rückstände & Mahnungen
              </h3>
              <ClaraSlotRenderer 
                slotName="mahnung"
                component={ClaraMahnungPanel}
                props={{
                  mahnung: sampleMahnung,
                  onEscalate: handleEscalate,
                  onGeneratePDF: handleGeneratePDF,
                  debugMode: debugMode
                }}
              />
            </div>
          </div>

          {/* Additional Slots Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KI Slot */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Clara KI
              </h3>
              <ClaraSlotRenderer 
                slotName="ki"
                fallback={
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">KI-Panel wird geladen...</p>
                  </div>
                }
              />
            </div>

            {/* Zahlungen Slot */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Zahlungen
              </h3>
              <ClaraSlotRenderer 
                slotName="zahlung"
                fallback={
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Zahlungs-Panel wird geladen...</p>
                  </div>
                }
              />
            </div>

            {/* Dokumente Slot */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Dokumente
              </h3>
              <ClaraSlotRenderer 
                slotName="dokumente"
                fallback={
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Dokument-Panel wird geladen...</p>
                  </div>
                }
              />
            </div>
          </div>

          {/* Debug Info */}
          {debugMode && (
            <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Debug Mode</h4>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                <p>Selected Tenant: {selectedTenant ? selectedTenant.name : 'None'}</p>
                <p>Active Slots: mieter, mahnung, ki, zahlung, dokumente</p>
                <p>Layout: ClaraDashboardLayout v3.1</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClaraDashboardLayout>
  );
};

export default DashboardPage;
