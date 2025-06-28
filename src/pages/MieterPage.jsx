import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, AlertTriangle, CheckCircle, Phone, Mail, FileText, Euro, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import mieterData from '../data/mieterDummyData.json';

/**
 * Mieter-Seite - Vollständige Mieterverwaltung mit Clara KI Integration
 */
const MieterPage = () => {
  const [mieter, setMieter] = useState(mieterData.mieter);
  const [filteredMieter, setFilteredMieter] = useState(mieterData.mieter);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [selectedMieter, setSelectedMieter] = useState(null);

  // Clara KI Integration - Expose data globally
  useEffect(() => {
    window.claraMieterContext = {
      mieter: mieter,
      statistiken: mieterData.statistiken,
      actions: {
        showMieterWithRueckstand: () => setStatusFilter('rueckstand'),
        showMieterDetails: (mieterId) => {
          const mieter = mieterData.mieter.find(m => m.id === mieterId);
          setSelectedMieter(mieter);
        },
        createMahnung: (mieterId) => {
          console.log(`📧 Mahnung für Mieter ${mieterId} erstellt`);
          // Hier würde die Mahnung-Logik implementiert
        }
      }
    };

    return () => {
      delete window.claraMieterContext;
    };
  }, [mieter]);

  // Filter-Logik
  useEffect(() => {
    let filtered = mieter;

    // Text-Suche
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.wohnung.objekt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.wohnung.einheit.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status-Filter
    if (statusFilter !== 'alle') {
      filtered = filtered.filter(m => m.zahlungen.status === statusFilter);
    }

    setFilteredMieter(filtered);
  }, [searchTerm, statusFilter, mieter]);

  // Status-Badge Styling
  const getStatusBadge = (status) => {
    const styles = {
      aktuell: 'bg-green-100 text-green-800',
      rueckstand: 'bg-yellow-100 text-yellow-800',
      kritisch: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      aktuell: 'Aktuell',
      rueckstand: 'Rückstand',
      kritisch: 'Kritisch'
    };

    return (
      <Badge className={styles[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  // Formatierung
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mieter-Verwaltung</h1>
              <p className="text-gray-600">Übersicht aller Mieter und Verträge</p>
            </div>
          </div>

          {/* Clara KI Integration Link */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900">Clara KI Integration</h3>
                <p className="text-sm text-blue-700">
                  Fragen Sie Clara: "Zeige mir Mieter mit Rückständen" oder "Wie viele Mieter sind aktuell?"
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/clara-ki'}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Zu Clara KI
              </Button>
            </div>
          </div>
        </div>

        {/* Statistiken */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gesamt Mieter</p>
                  <p className="text-2xl font-bold text-gray-900">{mieterData.statistiken.gesamt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Aktuell</p>
                  <p className="text-2xl font-bold text-green-600">{mieterData.statistiken.aktuell}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rückstände</p>
                  <p className="text-2xl font-bold text-yellow-600">{mieterData.statistiken.rueckstand + mieterData.statistiken.kritisch}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Euro className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Offene Rückstände</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(mieterData.statistiken.offeneRueckstaende)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Suche */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Mieter suchen (Name, Email, Objekt...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'alle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('alle')}
                >
                  Alle
                </Button>
                <Button
                  variant={statusFilter === 'aktuell' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('aktuell')}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  Aktuell
                </Button>
                <Button
                  variant={statusFilter === 'rueckstand' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('rueckstand')}
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                >
                  Rückstand
                </Button>
                <Button
                  variant={statusFilter === 'kritisch' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('kritisch')}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Kritisch
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mieter-Liste */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMieter.map((mieter) => (
            <Card key={mieter.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{mieter.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {mieter.wohnung.objekt} - {mieter.wohnung.einheit}
                    </CardDescription>
                  </div>
                  {getStatusBadge(mieter.zahlungen.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Kontakt */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{mieter.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{mieter.telefon}</span>
                  </div>
                </div>

                {/* Wohnung */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Größe:</span>
                      <span className="ml-1 font-medium">{mieter.wohnung.groesse}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Zimmer:</span>
                      <span className="ml-1 font-medium">{mieter.wohnung.zimmer}</span>
                    </div>
                  </div>
                </div>

                {/* Miete & Zahlungen */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Miete gesamt:</span>
                    <span className="font-semibold">{formatCurrency(mieter.vertrag.miete.gesamt)}</span>
                  </div>
                  
                  {mieter.zahlungen.rueckstand > 0 && (
                    <div className="flex justify-between items-center text-red-600">
                      <span className="text-sm">Rückstand:</span>
                      <span className="font-semibold">{formatCurrency(mieter.zahlungen.rueckstand)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Letzte Zahlung:</span>
                    <span>{formatDate(mieter.zahlungen.letzteZahlung)}</span>
                  </div>
                </div>

                {/* Aktionen */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedMieter(mieter)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                  
                  {mieter.zahlungen.status !== 'aktuell' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      onClick={() => {
                        console.log(`📧 Mahnung für ${mieter.name} erstellt`);
                        // Hier würde die Mahnung-Logik implementiert
                      }}
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Mahnung
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Keine Ergebnisse */}
        {filteredMieter.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Mieter gefunden</h3>
              <p className="text-gray-600">
                Versuchen Sie andere Suchbegriffe oder Filter.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Mieter-Details Modal (vereinfacht) */}
        {selectedMieter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedMieter.name}</CardTitle>
                    <CardDescription>{selectedMieter.wohnung.objekt} - {selectedMieter.wohnung.einheit}</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedMieter(null)}
                  >
                    Schließen
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Vertragsdaten */}
                <div>
                  <h4 className="font-medium mb-3">Vertragsdaten</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Vertragsbeginn:</span>
                      <div className="font-medium">{formatDate(selectedMieter.vertrag.beginn)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Vertragsende:</span>
                      <div className="font-medium">{formatDate(selectedMieter.vertrag.ende)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Kaltmiete:</span>
                      <div className="font-medium">{formatCurrency(selectedMieter.vertrag.miete.kalt)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Nebenkosten:</span>
                      <div className="font-medium">{formatCurrency(selectedMieter.vertrag.miete.nebenkosten)}</div>
                    </div>
                  </div>
                </div>

                {/* Kommunikation */}
                <div>
                  <h4 className="font-medium mb-3">Letzte Kommunikation</h4>
                  <div className="space-y-2">
                    {selectedMieter.kommunikation.map((kom, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">{kom.betreff}</span>
                          <Badge variant="outline" className="text-xs">
                            {kom.typ}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatDate(kom.datum)} - Status: {kom.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MieterPage;

