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
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <main className="flex-1 p-4 md:p-6 md:ml-16 lg:ml-64">
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Einstellungen</h1>
                <p className="text-gray-600 dark:text-gray-400">System-Konfiguration und Einstellungen</p>
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
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 font-medium">⚠️ Verbindungsfehler</p>
                  <p className="text-red-600 dark:text-red-300 text-sm">Invalid API key</p>
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
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Supabase URL</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" 
                    placeholder="https://your-project.supabase.co"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Anon Key</label>
                  <input 
                    type="password" 
                    className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400" 
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
                  <span className="text-gray-700 dark:text-gray-300">E-Mail-Benachrichtigungen</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Rückstände-Alerts</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Zahlungseingang-Meldungen</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400" />
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

