import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { Textarea } from './ui/textarea';
import Sidebar from './Sidebar';

const MieterKommunikationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage="mieter-kommunikation" onNavigate={(path) => navigate(path)} />
      
      <main className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mieter-Kommunikation</h1>
                <p className="text-gray-600">Nachrichten und Kommunikation mit Mietern</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Neue Nachricht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">An</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Alle Mieter</option>
                    <option>Familie Schmidt</option>
                    <option>Herr Müller</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nachricht</label>
                  <Textarea placeholder="Ihre Nachricht..." rows={4} />
                </div>
                <Button className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Senden
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Letzte Nachrichten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium">Familie Schmidt</p>
                  <p className="text-sm text-gray-600">Heizung funktioniert nicht...</p>
                  <p className="text-xs text-gray-400">vor 2 Stunden</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MieterKommunikationPage;

