import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Users, ArrowLeft, Search, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import Sidebar from './Sidebar';

const EigentuemerPage = () => {
  const navigate = useNavigate();
  const [eigentuemer, setEigentuemer] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Lade Eigentümer-Daten (aus CSV oder API)
  useEffect(() => {
    const loadEigentuemer = async () => {
      try {
        // Simuliere Datenladung
        const dummyData = [
          {
            id: 1,
            name: 'Max Mustermann',
            email: 'max@mustermann.de',
            telefon: '+49 123 456789',
            objekte: ['Waldhofstraße 76'],
            status: 'aktiv'
          },
          {
            id: 2,
            name: 'Anna Schmidt',
            email: 'anna@schmidt.de', 
            telefon: '+49 987 654321',
            objekte: ['Industriestraße 35'],
            status: 'aktiv'
          }
        ];
        
        setEigentuemer(dummyData);
        setLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Eigentümer:', error);
        setLoading(false);
      }
    };

    loadEigentuemer();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage="eigentuemer" onNavigate={(path) => navigate(path)} />
      
      <main className="flex-1 p-6">
        {/* Standardisierter Header nach Zahlungen-Pattern */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Eigentümer</h1>
                <p className="text-gray-600">Übersicht aller Eigentümer</p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 ml-14">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Eigentümer hinzufügen
            </Button>
          </div>
        </div>

        {/* Suchbereich */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Eigentümer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Eigentümer-Liste */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-gray-500">Lade Eigentümer...</p>
              </CardContent>
            </Card>
          ) : (
            eigentuemer
              .filter(owner =>
                owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                owner.email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((owner) => (
                <Card key={owner.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{owner.name}</h3>
                        <p className="text-gray-600">{owner.email}</p>
                        <p className="text-sm text-gray-500">{owner.telefon}</p>
                        <p className="text-sm text-gray-500">
                          Objekte: {owner.objekte.join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </main>
    </div>
  );
};

export default EigentuemerPage;

