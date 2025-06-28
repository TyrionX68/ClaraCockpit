import React, { useState } from 'react';
import { Search, Plus, Building, Users, TrendingUp, MapPin, Eye, Edit, Trash2 } from 'lucide-react';

const ObjectsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('name');

  // Mock-Daten für Waldhofstraße 76 und weitere Objekte
  const objects = [
    {
      id: 'WH76',
      name: 'Waldhofstraße 76',
      address: 'Waldhofstraße 76, 68169 Mannheim',
      type: 'Mehrfamilienhaus',
      units: 13,
      occupiedUnits: 13,
      totalRent: 8360,
      averageRent: 643,
      status: 'Vollvermietet',
      statusColor: 'green',
      yearBuilt: 1985,
      area: '850 m²'
    },
    {
      id: 'KS12',
      name: 'Kaiserstraße 12',
      address: 'Kaiserstraße 12, 68161 Mannheim',
      type: 'Bürogebäude',
      units: 8,
      occupiedUnits: 7,
      totalRent: 12400,
      averageRent: 1550,
      status: 'Teilvermietet',
      statusColor: 'orange',
      yearBuilt: 1995,
      area: '1200 m²'
    },
    {
      id: 'LU45',
      name: 'Ludwigstraße 45',
      address: 'Ludwigstraße 45, 67059 Ludwigshafen',
      type: 'Wohnhaus',
      units: 6,
      occupiedUnits: 6,
      totalRent: 4800,
      averageRent: 800,
      status: 'Vollvermietet',
      statusColor: 'green',
      yearBuilt: 1978,
      area: '480 m²'
    },
    {
      id: 'HD23',
      name: 'Heidelberger Straße 23',
      address: 'Heidelberger Straße 23, 69115 Heidelberg',
      type: 'Einfamilienhaus',
      units: 1,
      occupiedUnits: 0,
      totalRent: 0,
      averageRent: 1800,
      status: 'Leerstand',
      statusColor: 'red',
      yearBuilt: 2010,
      area: '180 m²'
    }
  ];

  const objectTypes = [
    { id: 'all', name: 'Alle Typen' },
    { id: 'Mehrfamilienhaus', name: 'Mehrfamilienhaus' },
    { id: 'Bürogebäude', name: 'Bürogebäude' },
    { id: 'Wohnhaus', name: 'Wohnhaus' },
    { id: 'Einfamilienhaus', name: 'Einfamilienhaus' }
  ];

  const sortOptions = [
    { id: 'name', name: 'Name' },
    { id: 'units', name: 'Einheiten' },
    { id: 'rent', name: 'Miete' },
    { id: 'occupancy', name: 'Auslastung' }
  ];

  // Berechnungen
  const totalObjects = objects.length;
  const totalUnits = objects.reduce((sum, obj) => sum + obj.units, 0);
  const occupiedUnits = objects.reduce((sum, obj) => sum + obj.occupiedUnits, 0);
  const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100);
  const totalRevenue = objects.reduce((sum, obj) => sum + obj.totalRent, 0);
  const averageRent = Math.round(totalRevenue / occupiedUnits);

  // Filterung und Sortierung
  const filteredObjects = objects
    .filter(obj => {
      const matchesSearch = obj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           obj.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'all' || obj.type === selectedType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case 'units':
          return b.units - a.units;
        case 'rent':
          return b.totalRent - a.totalRent;
        case 'occupancy':
          return (b.occupiedUnits / b.units) - (a.occupiedUnits / a.units);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const getStatusColor = (color) => {
    const colors = {
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    };
    return colors[color] || colors.green;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Objektverwaltung
          </h1>
          <p className="text-gray-600">
            Verwalten Sie Ihre Immobilien und Einheiten
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Objekte durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Neues Objekt
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Objekttyp:</span>
            <div className="flex gap-2">
              {objectTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedType === type.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Sortierung:</span>
            <div className="flex gap-2">
              {sortOptions.map((sort) => (
                <button
                  key={sort.id}
                  onClick={() => setSelectedSort(sort.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedSort === sort.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sort.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalObjects}</div>
              <div className="text-sm text-gray-600">Objekte gesamt</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalUnits}</div>
              <div className="text-sm text-gray-600">Einheiten gesamt</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{occupancyRate}%</div>
              <div className="text-sm text-gray-600">Auslastung</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">€{averageRent}</div>
              <div className="text-sm text-gray-600">Ø Miete/Einheit</div>
            </div>
          </div>
        </div>
      </div>

      {/* Objects Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Objekt</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Adresse</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Typ</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Einheiten</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Auslastung</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Miete/Monat</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredObjects.map((object) => (
                <tr key={object.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-semibold text-gray-900">{object.name}</div>
                      <div className="text-sm text-gray-500">ID: {object.id}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{object.address}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-700">{object.type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{object.units}</div>
                      <div className="text-sm text-gray-500">{object.area}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">
                        {object.occupiedUnits}/{object.units}
                      </div>
                      <div className="text-sm text-gray-500">
                        {Math.round((object.occupiedUnits / object.units) * 100)}%
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">€{object.totalRent.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">Ø €{object.averageRent}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(object.statusColor)}`}>
                      {object.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ObjectsPage;

