import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, ArrowLeft, Download, Plus, RefreshCw, Filter } from 'lucide-react';
import Sidebar from './Sidebar';

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
        {/* Standardisierter Header nach Zahlungen-Template */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rückstände</h1>
                <p className="text-gray-600">Übersicht offener Zahlungen</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 ml-14">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Rückstand hinzufügen
            </Button>
          </div>
        </div>
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

