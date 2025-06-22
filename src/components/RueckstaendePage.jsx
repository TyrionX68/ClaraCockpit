import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, ArrowLeft, Download, Plus, RefreshCw, Filter } from 'lucide-react';
import Sidebar from './Sidebar';
import ClaraPageHeader from './ClaraPageHeader';

const RueckstaendePage = () => {
  const navigate = useNavigate();

  const rueckstaende = [
    {
      id: 1,
      mieter: 'Familie Schmidt',
      wohnung: '1. OG rechts',
      betrag: '1.200€',
      monate: 2,
      status: 'mahnung_versendet'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage="rueckstaende" onNavigate={(path) => navigate(path)} />
      
      <main className="flex-1 p-6">
        {/* Standardisierter Header */}
        <ClaraPageHeader
          title="Rückstände-Verwaltung"
          subtitle="Übersicht und Management offener Zahlungen"
          icon={<AlertTriangle className="w-5 h-5 text-blue-600" />}
          actions={[
            <Button key="filter" variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>,
            <Button key="export" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>,
            <Button key="refresh" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>,
            <Button key="add">
              <Plus className="w-4 h-4 mr-2" />
              Rückstand hinzufügen
            </Button>
          ]}
        />

        <div className="space-y-4">
          {rueckstaende.map((rueckstand) => (
            <Card key={rueckstand.id} className="border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{rueckstand.mieter}</h3>
                    <p className="text-gray-600">{rueckstand.wohnung}</p>
                    <p className="text-sm text-red-600">{rueckstand.monate} Monate im Rückstand</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{rueckstand.betrag}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Mahnung senden
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RueckstaendePage;

