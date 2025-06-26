import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CreditCard, ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';

const BankingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage="banking" onNavigate={(path) => navigate(path)} />
      
      <main className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Banking</h1>
                <p className="text-gray-600">Bankverbindungen und Transaktionen</p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bankverbindungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Banking-Integration wird geladen...</p>
            <Button className="mt-4" onClick={() => navigate('/analytics')}>
              Zu Analytics
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BankingPage;

