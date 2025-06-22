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
        {/* Standardisierter Header nach Zahlungen-Template */}
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

  const filteredEigentuemer = eigentuemer.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    setLoading(true);
    // Simuliere Refresh
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage="eigentuemer" onNavigate={(path) => navigate(path)} />
      
      <main className="flex-1 p-6">
        {/* Standardisierter Header */}
        <ClaraPageHeader
          title="Eigentümer-Verwaltung"
          subtitle="Übersicht und Verwaltung aller Immobilieneigentümer"
          icon={<Users className="w-5 h-5 text-blue-600" />}
          actions={[
            <Button key="refresh" variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>,
            <Button key="add">
              <Plus className="w-4 h-4 mr-2" />
              Eigentümer hinzufügen
            </Button>
          ]}
        />

        {/* Suchbereich */}
        <div className="mb-6">
          <div className="relative max-w-md">
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
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Lade Eigentümer...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEigentuemer.map((owner) => (
              <Card key={owner.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{owner.name}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">E-Mail</p>
                      <p className="font-medium">{owner.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telefon</p>
                      <p className="font-medium">{owner.telefon}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Objekte</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {owner.objekte.map((objekt, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {objekt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        owner.status === 'aktiv' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {owner.status}
                      </span>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredEigentuemer.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Keine Eigentümer gefunden</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">
                  Versuchen Sie einen anderen Suchbegriff
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default EigentuemerPage;

