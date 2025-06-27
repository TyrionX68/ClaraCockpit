import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Settings, ArrowLeft, Database, Key, Bell } from 'lucide-react';
import Sidebar from './Sidebar';

const EinstellungenPage = () => {
  const navigate = useNavigate();

  const testSupabaseConnection = () => {
    alert('Supabase-Verbindung wird getestet...');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage="einstellungen" onNavigate={(path) => navigate(path)} />
      
      <main className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Einstellungen</h1>
                <p className="text-gray-600">System-Konfiguration und Einstellungen</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Supabase-Konfiguration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">⚠️ Verbindungsfehler</p>
                  <p className="text-red-600 text-sm">Invalid API key</p>
                </div>
                <Button onClick={testSupabaseConnection} className="w-full">
                  Verbindung testen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API-Schlüssel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Supabase URL</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md" 
                    placeholder="https://your-project.supabase.co"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Anon Key</label>
                  <input 
                    type="password" 
                    className="w-full p-2 border rounded-md" 
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                </div>
                <Button className="w-full">Speichern</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Benachrichtigungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>E-Mail-Benachrichtigungen</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Rückstände-Alerts</span>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>Zahlungseingang-Meldungen</span>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System-Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span>Clara360 Fusion v2.0</span>
                </div>
                <div className="flex justify-between">
                  <span>React:</span>
                  <span>19.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Vite:</span>
                  <span>6.3.5</span>
                </div>
                <div className="flex justify-between">
                  <span>Build:</span>
                  <span>Fusion/UI-Anchor</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EinstellungenPage;

