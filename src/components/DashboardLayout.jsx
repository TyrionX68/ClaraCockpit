import React from 'react';
import DashboardStats from './dashboard/DashboardStats';
import ActivityFeed from './dashboard/ActivityFeed';

const DashboardLayout = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Clara360 Dashboard
        </h1>
        <p className="text-gray-600">
          Übersicht über Ihre Immobilien, Mieter und Finanzen
        </p>
      </div>
      
      {/* Live KPIs */}
      <DashboardStats />
      
      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Schnellaktionen
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Neuen Mieter hinzufügen</div>
                <div className="text-sm text-gray-500">Mietvertrag erstellen</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Wartung beauftragen</div>
                <div className="text-sm text-gray-500">Reparatur anfordern</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Dokument hochladen</div>
                <div className="text-sm text-gray-500">Neue Datei hinzufügen</div>
              </button>
            </div>
          </div>
          
          {/* Recent Documents */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Neueste Dokumente
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600">PDF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    Mietvertrag_Wohnung_3B.pdf
                  </div>
                  <div className="text-xs text-gray-500">Vor 2 Stunden</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">DOC</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    Wartungsprotokoll_Heizung.docx
                  </div>
                  <div className="text-xs text-gray-500">Vor 5 Stunden</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">XLS</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    Mieteinnahmen_Q4_2024.xlsx
                  </div>
                  <div className="text-xs text-gray-500">Vor 1 Tag</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

