import React, { useState } from 'react';
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

  return (
    <div className=min-h-screen bg-gray-50>
      <div className=bg-white border-b border-gray-200 px-6 py-4>
        <div className=flex items-center justify-between>
          <div>
            <h1 className=text-2xl font-bold text-gray-900>
              {dashboardConfig.title}
            </h1>
            <p className=text-gray-600 mt-1>
              {dashboardConfig.subtitle}
            </p>
          </div>
          <div className=flex items-center space-x-4>
            <button
              className=px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors
            >
              {debugMode ? 'Debug: ON' : 'Debug: OFF'}
            </button>
          </div>
        </div>
      </div>

      <div className=p-6>
        <div className=grid grid-cols-1 lg:grid-cols-2 gap-6>
          <ClaraSlotRenderer
            slot=mieter
            title={dashboardConfig.slots.mieter.title}
            description={dashboardConfig.slots.mieter.description}
            debug={debugMode}
            component={
              <ClaraMieterDashboard
                tenantData={tenantMocks}
                onSelectTenant={handleTenantSelect}
                filterOptions={{}}
              />
            }
          />

          <ClaraSlotRenderer
            slot=mahnung
            title={dashboardConfig.slots.mahnung.title}
            description={dashboardConfig.slots.mahnung.description}
            debug={debugMode}
            component={
              <ClaraMahnungPanel
                tenantName={sampleMahnung.tenantName}
                sollMiete={sampleMahnung.sollMiete}
                istMiete={sampleMahnung.istMiete}
                lastPaymentDate={sampleMahnung.lastPaymentDate}
                today={sampleMahnung.today}
                onEscalate={handleEscalate}
                onGeneratePDF={handleGeneratePDF}
              />
            }
          />

          <ClaraSlotRenderer
            slot=zukunft
            title={dashboardConfig.slots.zukunft.title}
            description={dashboardConfig.slots.zukunft.description}
            debug={debugMode}
            placeholder={true}
            className=lg:col-span-2
          />
        </div>

        {selectedTenant && (
          <div className=mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4>
            <h3 className=text-lg font-semibold text-blue-900 mb-2>
              Ausgewählter Mieter
            </h3>
            <div className=grid grid-cols-1 md:grid-cols-4 gap-4 text-sm>
              <div>
                <span className=font-medium text-blue-800>Name:</span>
                <p className=text-blue-700>{selectedTenant.name}</p>
              </div>
              <div>
                <span className=font-medium text-blue-800>Einheit:</span>
                <p className=text-blue-700>{selectedTenant.unit}</p>
              </div>
              <div>
                <span className=font-medium text-blue-800>Miete:</span>
                <p className=text-blue-700>{selectedTenant.rent}€</p>
              </div>
              <div>
                <span className=font-medium text-blue-800>Status:</span>
                <p className=text-blue-700>{selectedTenant.paymentStatus}</p>
              </div>
            </div>
          </div>
        )}

        {debugMode && (
          <div className=mt-6 bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs>
            <h3 className=text-green-300 font-bold mb-2>DEBUG INFORMATION</h3>
            <div className=space-y-1>
              <p>Dashboard rendered successfully</p>
              <p>Active slots: mieter, mahnung, zukunft</p>
              <p>Tenant data: {tenantMocks.length} entries loaded</p>
              <p>Mahnung data: {mahnungMocks.length} entries loaded</p>
              <p>Clara360 version: v3.0.0-alpha</p>
            </div>
          </div>
        )}
      </div>

      <div className=bg-white border-t border-gray-200 px-6 py-4 mt-8>
        <div className=flex items-center justify-between text-sm text-gray-500>
          <p>Clara360 v3.0 - Modular Dashboard Architecture</p>
          <p>Powered by Atomic Design</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
