import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Mail, ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';

const OutlookPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage="outlook" onNavigate={(path) => navigate(path)} />
      
      <main className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Outlook Integration</h1>
                <p className="text-gray-600">E-Mail-Verwaltung und Kalender</p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Outlook-Verbindung</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Verbinden Sie Ihr Outlook-Konto für automatische E-Mail-Verwaltung.</p>
            <Button>Outlook verbinden</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default OutlookPage;

