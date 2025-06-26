import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Building2, ArrowLeft, Map, Table, Plus, RefreshCw } from 'lucide-react';
import Sidebar from './Sidebar';

const ObjektePage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('table'); // 'table' oder 'map'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage="objekte" onNavigate={(path) => navigate(path)} />
      
      <main className="flex-1 p-6">
        {/* Standardisierter Header nach Zahlungen-Pattern */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Objekte</h1>
                <p className="text-gray-600">Übersicht aller Immobilien</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 ml-14">
            <Button 
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
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Objekt hinzufügen
            </Button>
          </div>
        </div>

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

