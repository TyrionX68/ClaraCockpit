import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Calendar, Clock, CheckCircle, AlertTriangle, 
  Wrench, User, MapPin, Phone, Mail, Euro, FileText, Camera 
} from 'lucide-react';

const MaintenancePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock-Daten für Wartungsaufträge
  const maintenanceTasks = [
    {
      id: 'MT001',
      title: 'Heizungsreparatur',
      description: 'Heizung in Wohnung 3B funktioniert nicht',
      object: 'Waldhofstraße 76',
      unit: 'Wohnung 3B',
      tenant: 'Familie Müller',
      priority: 'hoch',
      status: 'abgeschlossen',
      createdDate: '2024-06-20',
      dueDate: '2024-06-25',
      completedDate: '2024-06-24',
      assignedTo: 'Heizungstechnik Schmidt',
      estimatedCost: 350,
      actualCost: 320,
      category: 'Heizung',
      contact: '+49 621 123456'
    },
    {
      id: 'MT002',
      title: 'Wasserschaden beheben',
      description: 'Wasserschaden in Wohnung 4A nach Rohrbruch',
      object: 'Waldhofstraße 76',
      unit: 'Wohnung 4A',
      tenant: 'Herr Weber',
      priority: 'dringend',
      status: 'in_bearbeitung',
      createdDate: '2024-06-25',
      dueDate: '2024-06-27',
      completedDate: null,
      assignedTo: 'Sanitär Hoffmann',
      estimatedCost: 800,
      actualCost: null,
      category: 'Sanitär',
      contact: '+49 621 789012'
    },
    {
      id: 'MT003',
      title: 'Fenster reparieren',
      description: 'Defektes Fenster in Wohnung 2C',
      object: 'Kaiserstraße 12',
      unit: 'Büro 2C',
      tenant: 'Firma ABC GmbH',
      priority: 'mittel',
      status: 'geplant',
      createdDate: '2024-06-26',
      dueDate: '2024-07-05',
      completedDate: null,
      assignedTo: 'Glaserei Mannheim',
      estimatedCost: 450,
      actualCost: null,
      category: 'Fenster',
      contact: '+49 621 345678'
    },
    {
      id: 'MT004',
      title: 'Elektrik prüfen',
      description: 'Regelmäßige Elektroprüfung',
      object: 'Ludwigstraße 45',
      unit: 'Gesamtes Gebäude',
      tenant: 'Alle Mieter',
      priority: 'niedrig',
      status: 'offen',
      createdDate: '2024-06-27',
      dueDate: '2024-07-15',
      completedDate: null,
      assignedTo: 'Elektro Wagner',
      estimatedCost: 600,
      actualCost: null,
      category: 'Elektrik',
      contact: '+49 621 567890'
    }
  ];

  const statusOptions = [
    { id: 'all', name: 'Alle Status', color: 'gray' },
    { id: 'offen', name: 'Offen', color: 'blue' },
    { id: 'geplant', name: 'Geplant', color: 'yellow' },
    { id: 'in_bearbeitung', name: 'In Bearbeitung', color: 'orange' },
    { id: 'abgeschlossen', name: 'Abgeschlossen', color: 'green' }
  ];

  const priorityOptions = [
    { id: 'all', name: 'Alle Prioritäten', color: 'gray' },
    { id: 'niedrig', name: 'Niedrig', color: 'green' },
    { id: 'mittel', name: 'Mittel', color: 'yellow' },
    { id: 'hoch', name: 'Hoch', color: 'orange' },
    { id: 'dringend', name: 'Dringend', color: 'red' }
  ];

  // Statistiken berechnen
  const totalTasks = maintenanceTasks.length;
  const openTasks = maintenanceTasks.filter(task => task.status === 'offen' || task.status === 'geplant').length;
  const inProgressTasks = maintenanceTasks.filter(task => task.status === 'in_bearbeitung').length;
  const completedTasks = maintenanceTasks.filter(task => task.status === 'abgeschlossen').length;
  const urgentTasks = maintenanceTasks.filter(task => task.priority === 'dringend').length;
  const totalCosts = maintenanceTasks.reduce((sum, task) => sum + (task.actualCost || task.estimatedCost), 0);

  // Filterung
  const filteredTasks = maintenanceTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.object.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status) => {
    const colors = {
      offen: 'bg-blue-100 text-blue-800',
      geplant: 'bg-yellow-100 text-yellow-800',
      in_bearbeitung: 'bg-orange-100 text-orange-800',
      abgeschlossen: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      niedrig: 'bg-green-100 text-green-800',
      mittel: 'bg-yellow-100 text-yellow-800',
      hoch: 'bg-orange-100 text-orange-800',
      dringend: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'dringend') return <AlertTriangle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wartungsmanagement
          </h1>
          <p className="text-gray-600">
            Verwalten Sie Wartungsaufträge und Instandhaltung
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Wartungsaufträge durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Neuer Auftrag
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalTasks}</div>
              <div className="text-sm text-gray-600">Gesamt</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{openTasks}</div>
              <div className="text-sm text-gray-600">Offen</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{inProgressTasks}</div>
              <div className="text-sm text-gray-600">In Arbeit</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{completedTasks}</div>
              <div className="text-sm text-gray-600">Erledigt</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{urgentTasks}</div>
              <div className="text-sm text-gray-600">Dringend</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Euro className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">€{totalCosts.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Kosten</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-6">
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Status:</span>
            <div className="flex gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedStatus === status.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.name}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Priorität:</span>
            <div className="flex gap-2">
              {priorityOptions.map((priority) => (
                <button
                  key={priority.id}
                  onClick={() => setSelectedPriority(priority.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedPriority === priority.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {priority.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                {getPriorityIcon(task.priority)}
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {statusOptions.find(s => s.id === task.status)?.name}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4">{task.description}</p>

            {/* Location */}
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{task.object} - {task.unit}</span>
            </div>

            {/* Tenant */}
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{task.tenant}</span>
            </div>

            {/* Assigned To */}
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{task.assignedTo}</span>
            </div>

            {/* Contact */}
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{task.contact}</span>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500">Erstellt</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(task.createdDate).toLocaleDateString('de-DE')}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Fällig</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(task.dueDate).toLocaleDateString('de-DE')}
                </div>
              </div>
            </div>

            {/* Cost */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Kosten:</span>
              <span className="font-semibold text-gray-900">
                €{(task.actualCost || task.estimatedCost).toLocaleString()}
                {!task.actualCost && <span className="text-xs text-gray-500 ml-1">(geschätzt)</span>}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                Details
              </button>
              <button className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                Bearbeiten
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Wartungsaufträge gefunden</h3>
          <p className="text-gray-600 mb-4">Keine Aufträge entsprechen den aktuellen Filterkriterien.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ersten Auftrag erstellen
          </button>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;

