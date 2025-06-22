import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Building2, ArrowLeft, Map, Table, Plus, RefreshCw } from 'lucide-react';
import Sidebar from './Sidebar';
import ClaraPageHeader from './ClaraPageHeader';

const ObjektePage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table'); // 'table' oder 'map'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage="objekte" onNavigate={(path) => navigate(path)} />
      
      <main className="flex-1 p-6">
        {/* Standardisierter Header */}
        <ClaraPageHeader
          title="Objekte-Verwaltung"
          subtitle="Verwalten Sie Ihre Immobilien-Objekte und deren Details"
          icon={<Building2 className="w-5 h-5 text-blue-600" />}
          actions={[
            <Button 
              key="view-toggle" 
              variant="outline" 
              onClick={() => setViewMode(viewMode === 'table' ? 'map' : 'table')}
            >
              {viewMode === 'table' ? (
                <>
                  <Map className="w-4 h-4 mr-2" />
                  Kartenansicht
                </>
              ) : (
                <>
                  <Table className="w-4 h-4 mr-2" />
                  Tabellenansicht
                </>
              )}
            </Button>,
            <Button key="refresh" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>,
            <Button key="add">
              <Plus className="w-4 h-4 mr-2" />
              Objekt hinzufügen
            </Button>
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Waldhofstraße 76</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Einheiten</p>
                <p className="text-2xl font-bold">14</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vermietungsgrad</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Monatliche Miete</p>
                <p className="text-2xl font-bold">8.360€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ObjektePage;

