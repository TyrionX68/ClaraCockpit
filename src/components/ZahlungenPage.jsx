import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Euro, ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';

const ZahlungenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage="zahlungen" onNavigate={(path) => navigate(path)} />
      
      <main className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Euro className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Zahlungen</h1>
                <p className="text-gray-600">Übersicht aller Zahlungseingänge</p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aktuelle Zahlungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Miete Juni 2025</p>
                  <p className="text-sm text-gray-600">Waldhofstraße 76</p>
                </div>
                <p className="font-bold text-green-600">+8.360€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ZahlungenPage;

