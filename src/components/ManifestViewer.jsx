import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  Code, 
  Shield,
  Clock,
  User,
  GitBranch,
  Sparkles
} from 'lucide-react';

const ManifestViewer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [manifestContent, setManifestContent] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [lastModified, setLastModified] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // MetaGovernor Authentication Check
  useEffect(() => {
    const checkAuth = () => {
      const userEmail = localStorage.getItem('clara_user_email');
      const sessionToken = localStorage.getItem('clara_session_token');
      
      if (userEmail === 'hiss@clara360.de' && sessionToken) {
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
  }, []);

  // Load Manifest Content
  useEffect(() => {
    if (isOpen) {
      loadManifest();
    }
  }, [isOpen]);

  const loadManifest = async () => {
    setIsLoading(true);
    try {
      // Simulate loading from context_tracking/MANUS_MANIFEST.md
      const response = await fetch('/context_tracking/MANUS_MANIFEST.md');
      if (response.ok) {
        const content = await response.text();
        setManifestContent(content);
        setEditContent(content);
        
        // Extract last modified info from content
        const timestampMatch = content.match(/Erstellt:\s*([^\n]+)/);
        if (timestampMatch) {
          setLastModified(timestampMatch[1]);
        }
      } else {
        // Fallback content if file not found
        setManifestContent(getDefaultManifest());
        setEditContent(getDefaultManifest());
      }
    } catch (error) {
      console.error('Failed to load manifest:', error);
      setManifestContent(getDefaultManifest());
      setEditContent(getDefaultManifest());
    }
    setIsLoading(false);
  };

  const getDefaultManifest = () => {
    return `# 📘 MANUS-MANIFEST
**Master-Referenz für Clara360 Systemarchitektur**

## 🔒 MANIFEST-METADATEN
- **Manifest-ID:** MF-20250620-02
- **Version:** v2.3.0 (ClaraSuper_v4.4.0_WaldhofstrasseLive Integration)
- **Erstellt:** 2025-06-20T08:05:00Z
- **Letzter Editor:** Manus A (mit GitHub Copilot)
- **MetaGovernor-Status:** AKTIV
- **Authentifizierung:** hiss@clara360.de

## 🎯 SYSTEMSTRATEGIE
Clara360 als KI-gestützte Hausverwaltungsplattform mit modularer React-Architektur und intelligenter Banking-Integration für Waldhofstraße-Objekt.

## 🧩 KOMPONENTENREGISTER
- **ClaraFusionEngine:** Hauptintelligenz mit emotionaler KI
- **ManifestViewer:** MetaGovernor Manifest-Kontrolle
- **Banking Integration:** FinAPI für Waldhofstraße
- **KPI-Module:** 6 Module für Hausverwaltung

## 🚀 DEPLOYMENT-STATUS
- **VPS:** root@217.154.242.134 (AKTIV)
- **GitHub:** TyrionX68/ClaraCockpit (bereit)
- **Build:** React 18 + Vite 6.3.5 (erfolgreich)`;
  };

  const handleSave = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      // Simulate saving to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setManifestContent(editContent);
      setIsEditing(false);
      setLastModified(new Date().toISOString());
      
      // Show success feedback
      console.log('Manifest saved successfully');
    } catch (error) {
      console.error('Failed to save manifest:', error);
    }
    setIsLoading(false);
  };

  const handleCancel = () => {
    setEditContent(manifestContent);
    setIsEditing(false);
  };

  const renderMarkdown = (content) => {
    // Simple markdown rendering for demo
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mb-4 text-blue-400">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mb-3 text-blue-300">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium mb-2 text-blue-200">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 mb-1 text-gray-300">{line.slice(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="font-bold mb-2 text-white">{line.slice(2, -2)}</p>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-2 text-gray-300 font-mono text-sm">{line}</p>;
      });
  };

  if (!isAuthenticated) {
    return null; // Hide component if not authenticated
  }

  return (
    <>
      {/* Manifest Button - Fixed Bottom Right */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        size="lg"
      >
        <BookOpen className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
        📘 Manus-Manifest
        <Sparkles className="w-4 h-4 ml-2 opacity-70" />
      </Button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with Glassmorphism */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <Card className="relative w-full max-w-6xl h-[90vh] bg-gray-900/95 backdrop-blur-md border-gray-700 shadow-2xl rounded-2xl overflow-hidden">
            {/* Header */}
            <CardHeader className="border-b border-gray-700 bg-gray-800/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-bold text-white">Manus-Manifest</h2>
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      🟩 Live
                    </Badge>
                  </div>
                  
                  {lastModified && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Zuletzt bearbeitet: {lastModified}</span>
                      <User className="w-4 h-4 ml-2" />
                      <span>hiss@clara360.de</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Action Buttons */}
                  {!isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRaw(!showRaw)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Code className="w-4 h-4 mr-2" />
                        {showRaw ? 'Rendered' : 'RAW'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="border-blue-600 text-blue-400 hover:bg-blue-900/50"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Bearbeiten
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Abbrechen
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Speichern...' : 'Speichern'}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="p-0 h-full overflow-hidden">
              {isEditing ? (
                // Edit Mode
                <div className="h-full p-6">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-full resize-none bg-gray-800 border-gray-600 text-gray-100 font-mono text-sm leading-relaxed"
                    placeholder="Manifest-Inhalt bearbeiten..."
                  />
                </div>
              ) : (
                // View Mode
                <div className="h-full overflow-y-auto p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex items-center gap-3 text-blue-400">
                        <GitBranch className="w-6 h-6 animate-spin" />
                        <span>Manifest wird geladen...</span>
                      </div>
                    </div>
                  ) : showRaw ? (
                    // Raw Mode
                    <pre className="text-gray-300 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                      {manifestContent}
                    </pre>
                  ) : (
                    // Rendered Mode
                    <div className="prose prose-invert max-w-none">
                      {renderMarkdown(manifestContent)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ManifestViewer;

