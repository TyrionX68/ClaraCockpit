// MetaGovernorDashboard.jsx - Exklusives Dashboard für hiss@clara360.de
import React, { useState, useEffect } from 'react';
import { useClaraManifest } from '../hooks/useClaraManifest';
import { ManifestManager } from '../lib/ManifestManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Upload,
  BarChart3,
  Shield,
  Users,
  FileText,
  RefreshCw
} from 'lucide-react';

export const MetaGovernorDashboard = () => {
  const { 
    manifest, 
    loading, 
    error, 
    user, 
    hasAccess, 
    hasSystemAccess,
    updateSlotStatus,
    addCriticalIssue,
    getOrientationBriefing 
  } = useClaraManifest();

  const [manifestManager, setManifestManager] = useState(null);
  const [newIssue, setNewIssue] = useState({ type: '', description: '', priority: 'medium' });
  const [slotUpdate, setSlotUpdate] = useState({ slot: '', status: '' });

  // ManifestManager initialisieren
  useEffect(() => {
    const initManager = async () => {
      if (hasSystemAccess) {
        const manager = new ManifestManager();
        await manager.initializeUser();
        setManifestManager(manager);
      }
    };
    
    initManager();
  }, [hasSystemAccess]);

  // Nur für MetaGovernor sichtbar
  if (!hasSystemAccess) {
    return (
      <div className="p-6 text-center">
        <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-2">Zugriff verweigert</h2>
        <p className="text-gray-600">
          Dieses Dashboard ist nur für MetaGovernor-Benutzer zugänglich.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
        <p>Lade Manifest-System...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-2">Fehler</h2>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const briefing = getOrientationBriefing();
  const slots = manifest?.userContext?.slots || {};
  const criticalIssues = manifest?.criticalIssues?.filter(issue => issue.status === 'open') || [];

  const getSlotStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-500';
      case 'active': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      case 'inactive': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const handleSlotUpdate = async () => {
    if (!slotUpdate.slot || !slotUpdate.status) return;
    
    try {
      await updateSlotStatus(slotUpdate.slot, slotUpdate.status);
      setSlotUpdate({ slot: '', status: '' });
    } catch (error) {
      console.error('Slot-Update-Fehler:', error);
    }
  };

  const handleIssueReport = async () => {
    if (!newIssue.type || !newIssue.description) return;
    
    try {
      await addCriticalIssue(newIssue);
      setNewIssue({ type: '', description: '', priority: 'medium' });
    } catch (error) {
      console.error('Problem-Meldung-Fehler:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-600" />
            MetaGovernor Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Systemgedächtnis und Slot-Management für Clara360
          </p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          {user?.email}
        </Badge>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              Aktives Objekt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {manifest?.activeObject}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Build Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold text-green-600">
              {manifest?.userContext?.buildStatus}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Kritische Probleme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {criticalIssues.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Vault-Dateien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {manifest?.vaultFiles?.length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Slot Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Slot-Status Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Aktuelle Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(slots).map(([slotName, status]) => (
              <div key={slotName} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{slotName}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getSlotStatusColor(status)}`} />
                  <span className="text-sm text-gray-600">{status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Slot Update */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Slot aktualisieren</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Slot-Name"
                value={slotUpdate.slot}
                onChange={(e) => setSlotUpdate({...slotUpdate, slot: e.target.value})}
                className="flex-1"
              />
              <select
                value={slotUpdate.status}
                onChange={(e) => setSlotUpdate({...slotUpdate, status: e.target.value})}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Status wählen</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="active">Active</option>
                <option value="complete">Complete</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button onClick={handleSlotUpdate}>
                Aktualisieren
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kritische Probleme */}
      {criticalIssues.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Kritische Probleme ({criticalIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalIssues.map((issue, index) => (
              <div key={index} className="p-3 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-red-800">{issue.type}</h4>
                    <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>Priorität: {issue.priority}</span>
                      <span>•</span>
                      <span>Gemeldet: {new Date(issue.reportedAt || issue.timestamp).toLocaleString('de-DE')}</span>
                    </div>
                  </div>
                  <Badge variant={issue.priority === 'high' ? 'destructive' : 'secondary'}>
                    {issue.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Problem melden */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Neues Problem melden
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Problem-Typ (z.B. dummy_data_contamination)"
              value={newIssue.type}
              onChange={(e) => setNewIssue({...newIssue, type: e.target.value})}
            />
            <select
              value={newIssue.priority}
              onChange={(e) => setNewIssue({...newIssue, priority: e.target.value})}
              className="px-3 py-2 border rounded-md"
            >
              <option value="low">Niedrig</option>
              <option value="medium">Mittel</option>
              <option value="high">Hoch</option>
              <option value="critical">Kritisch</option>
            </select>
          </div>
          <Textarea
            placeholder="Beschreibung des Problems..."
            value={newIssue.description}
            onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
            rows={3}
          />
          <Button onClick={handleIssueReport} className="w-full">
            Problem melden
          </Button>
        </CardContent>
      </Card>

      {/* Manifest Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Manifest-Informationen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Version:</span> {manifest?.manifestVersion}
            </div>
            <div>
              <span className="font-medium">Letzte Aktualisierung:</span> {' '}
              {new Date(manifest?.lastUpdated).toLocaleString('de-DE')}
            </div>
            <div>
              <span className="font-medium">DSGVO-konform:</span> {' '}
              {manifest?.dsgvoCompliant ? '✅ Ja' : '❌ Nein'}
            </div>
            <div>
              <span className="font-medium">Echte Mieter:</span> {manifest?.realMieterCount || 0}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

