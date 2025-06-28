import React, { useState } from 'react';
import { 
  Upload, Search, Filter, Download, Share, Eye, Trash2, 
  FileText, File, Image, Archive, Calendar, User, Tag,
  Plus, Grid, List, SortAsc, FolderOpen
} from 'lucide-react';

const DocumentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');

  // Mock-Daten für Dokumente
  const documents = [
    {
      id: 'DOC001',
      name: 'Mietvertrag_Wohnung_3B.pdf',
      type: 'pdf',
      category: 'Verträge',
      size: '2.4 MB',
      uploadDate: '2024-06-27',
      uploadedBy: 'Admin',
      object: 'Waldhofstraße 76',
      unit: 'Wohnung 3B',
      tenant: 'Familie Müller',
      tags: ['Mietvertrag', 'Aktiv', 'Unterschrieben'],
      description: 'Mietvertrag für Wohnung 3B, gültig ab 01.01.2024'
    },
    {
      id: 'DOC002',
      name: 'Wartungsprotokoll_Heizung.docx',
      type: 'docx',
      category: 'Wartung',
      size: '1.8 MB',
      uploadDate: '2024-06-26',
      uploadedBy: 'Heizungstechnik Schmidt',
      object: 'Waldhofstraße 76',
      unit: 'Wohnung 3B',
      tenant: 'Familie Müller',
      tags: ['Wartung', 'Heizung', 'Abgeschlossen'],
      description: 'Wartungsprotokoll für Heizungsreparatur'
    },
    {
      id: 'DOC003',
      name: 'Mieteinnahmen_Q4_2024.xlsx',
      type: 'xlsx',
      category: 'Finanzen',
      size: '856 KB',
      uploadDate: '2024-06-25',
      uploadedBy: 'Buchhaltung',
      object: 'Alle Objekte',
      unit: 'Alle Einheiten',
      tenant: 'Alle Mieter',
      tags: ['Finanzen', 'Quartal', 'Übersicht'],
      description: 'Übersicht der Mieteinnahmen Q4 2024'
    },
    {
      id: 'DOC004',
      name: 'Grundriss_Wohnung_4A.png',
      type: 'png',
      category: 'Pläne',
      size: '3.2 MB',
      uploadDate: '2024-06-24',
      uploadedBy: 'Architekt',
      object: 'Waldhofstraße 76',
      unit: 'Wohnung 4A',
      tenant: 'Herr Weber',
      tags: ['Grundriss', 'Plan', 'Renovierung'],
      description: 'Grundriss für Renovierungsplanung'
    },
    {
      id: 'DOC005',
      name: 'Versicherungspolice_Gebäude.pdf',
      type: 'pdf',
      category: 'Versicherung',
      size: '1.2 MB',
      uploadDate: '2024-06-23',
      uploadedBy: 'Versicherung',
      object: 'Waldhofstraße 76',
      unit: 'Gesamtes Gebäude',
      tenant: 'Alle Mieter',
      tags: ['Versicherung', 'Gebäude', 'Aktiv'],
      description: 'Gebäudeversicherung gültig bis 31.12.2025'
    },
    {
      id: 'DOC006',
      name: 'Energieausweis_2024.pdf',
      type: 'pdf',
      category: 'Zertifikate',
      size: '945 KB',
      uploadDate: '2024-06-22',
      uploadedBy: 'Energieberater',
      object: 'Kaiserstraße 12',
      unit: 'Gesamtes Gebäude',
      tenant: 'Alle Mieter',
      tags: ['Energieausweis', 'Zertifikat', 'Gültig'],
      description: 'Energieausweis gültig bis 2034'
    }
  ];

  const categories = [
    { id: 'all', name: 'Alle Kategorien', count: documents.length },
    { id: 'Verträge', name: 'Verträge', count: documents.filter(d => d.category === 'Verträge').length },
    { id: 'Wartung', name: 'Wartung', count: documents.filter(d => d.category === 'Wartung').length },
    { id: 'Finanzen', name: 'Finanzen', count: documents.filter(d => d.category === 'Finanzen').length },
    { id: 'Pläne', name: 'Pläne', count: documents.filter(d => d.category === 'Pläne').length },
    { id: 'Versicherung', name: 'Versicherung', count: documents.filter(d => d.category === 'Versicherung').length },
    { id: 'Zertifikate', name: 'Zertifikate', count: documents.filter(d => d.category === 'Zertifikate').length }
  ];

  const fileTypes = [
    { id: 'all', name: 'Alle Dateitypen' },
    { id: 'pdf', name: 'PDF' },
    { id: 'docx', name: 'Word' },
    { id: 'xlsx', name: 'Excel' },
    { id: 'png', name: 'Bilder' }
  ];

  // Filterung und Sortierung
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesType = selectedType === 'all' || doc.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return parseFloat(b.size) - parseFloat(a.size);
        case 'type':
          return a.type.localeCompare(b.type);
        default: // date
          return new Date(b.uploadDate) - new Date(a.uploadDate);
      }
    });

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-600" />;
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-600" />;
      case 'xlsx':
        return <FileText className="w-8 h-8 text-green-600" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <Image className="w-8 h-8 text-purple-600" />;
      default:
        return <File className="w-8 h-8 text-gray-600" />;
    }
  };

  const getFileTypeColor = (type) => {
    const colors = {
      pdf: 'bg-red-100 text-red-800',
      docx: 'bg-blue-100 text-blue-800',
      xlsx: 'bg-green-100 text-green-800',
      png: 'bg-purple-100 text-purple-800',
      jpg: 'bg-purple-100 text-purple-800',
      jpeg: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const totalSize = documents.reduce((sum, doc) => {
    const size = parseFloat(doc.size);
    const unit = doc.size.includes('MB') ? 1024 : 1;
    return sum + (size * unit);
  }, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dokumentenverwaltung
          </h1>
          <p className="text-gray-600">
            Verwalten Sie Verträge, Unterlagen und Archive
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Dokumente durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Hochladen
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
              <div className="text-sm text-gray-600">Dokumente</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{categories.length - 1}</div>
              <div className="text-sm text-gray-600">Kategorien</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Archive className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(totalSize / 1024)} MB</div>
              <div className="text-sm text-gray-600">Speicher</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {documents.filter(d => {
                  const uploadDate = new Date(d.uploadDate);
                  const today = new Date();
                  const diffTime = Math.abs(today - uploadDate);
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length}
              </div>
              <div className="text-sm text-gray-600">Diese Woche</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Kategorien</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-sm text-gray-500">{category.count}</span>
                </button>
              ))}
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-4 mt-6">Dateitypen</h3>
            <div className="space-y-2">
              {fileTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    selectedType === type.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sortieren:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="date">Datum</option>
                    <option value="name">Name</option>
                    <option value="size">Größe</option>
                    <option value="type">Typ</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Documents Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  {/* File Icon & Type */}
                  <div className="flex items-center justify-between mb-4">
                    {getFileIcon(doc.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(doc.type)}`}>
                      {doc.type.toUpperCase()}
                    </span>
                  </div>

                  {/* File Name */}
                  <h3 className="font-semibold text-gray-900 mb-2 truncate" title={doc.name}>
                    {doc.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {doc.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {doc.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {doc.tags.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{doc.tags.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="text-xs text-gray-500 mb-4">
                    <div>Größe: {doc.size}</div>
                    <div>Hochgeladen: {new Date(doc.uploadDate).toLocaleDateString('de-DE')}</div>
                    <div>Von: {doc.uploadedBy}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4" />
                      Anzeigen
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                      <Share className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Kategorie</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Größe</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Hochgeladen</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.type)}
                          <div>
                            <div className="font-medium text-gray-900">{doc.name}</div>
                            <div className="text-sm text-gray-500">{doc.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{doc.category}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{doc.size}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-gray-700">{new Date(doc.uploadDate).toLocaleDateString('de-DE')}</div>
                          <div className="text-sm text-gray-500">{doc.uploadedBy}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                            <Share className="w-4 h-4" />
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
          )}

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Dokumente gefunden</h3>
              <p className="text-gray-600 mb-4">Keine Dokumente entsprechen den aktuellen Filterkriterien.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Erstes Dokument hochladen
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;

