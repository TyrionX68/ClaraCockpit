/**
 * ClaraKIPanel.jsx - DOM-Bridge für JSON-Engine Kompatibilität
 * Stellt exakte DOM-Struktur bereit, die JSON-Engine erwartet
 */
import React, { useEffect, useRef } from 'react';
import { Brain, X } from 'lucide-react';

/**
 * Clara KI Panel - DOM-Bridge Implementation
 * Bereitstellung kompatibler DOM-Struktur für JSON-Engine
 */
export function ClaraKIPanel({ isOpen, onClose }) {
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      console.log("🔧 DOM-Bridge: JSON-Engine Initialisierung");
      
      // Warte auf DOM-Mount und initialisiere JSON-Engine
      const initializeJSONEngine = () => {
        if (window.ClaraJSONEngine && typeof window.ClaraJSONEngine.init === 'function') {
          console.log("✅ ClaraJSONEngine gefunden - DOM-Bridge aktiv");
          window.ClaraJSONEngine.init({
            containerId: "clara-chat-root",
            dataUrl: "/data/clara_ki_responses.json"
          });
        } else if (window.ClaraJSONChat && typeof window.ClaraJSONChat.init === 'function') {
          console.log("✅ ClaraJSONChat gefunden - DOM-Bridge aktiv");
          window.ClaraJSONChat.init({
            containerId: "clara-chat-root",
            dataUrl: "/data/clara_ki_responses.json"
          });
        } else {
          console.log("⏳ DOM-Bridge: Warte auf JSON-Engine...");
          setTimeout(initializeJSONEngine, 500);
        }
      };

      // Verzögerte Initialisierung für React-Mount-Kompatibilität
      setTimeout(initializeJSONEngine, 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Clara KI - JSON Engine</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* JSON-Engine DOM-Bridge Container */}
        <div className="flex-1 p-4">
          {/* Exakte DOM-Struktur für JSON-Engine Kompatibilität */}
          <div 
            id="clara-chat-root" 
            ref={chatContainerRef}
            className="h-full w-full flex flex-col"
            style={{
              minHeight: '400px',
              background: 'transparent',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {/* Chat-Bubbles Container */}
            <div 
              id="clara-chat-bubbles" 
              className="flex-1 overflow-y-auto mb-4 p-2"
              style={{ minHeight: '300px' }}
            >
              {/* Initial Loading State */}
              <div className="text-center text-gray-500 mt-8">
                <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <p className="text-sm font-medium">Clara JSON-Engine wird geladen...</p>
                <p className="text-xs mt-1 text-gray-400">DOM-Bridge aktiv</p>
              </div>
            </div>
            
            {/* Input Container - Exakte Struktur für JSON-Engine */}
            <div className="flex space-x-2 p-2 border-t border-gray-200">
              <input
                id="clara-chat-input"
                className="clara-chat-input flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                placeholder="Fragen Sie Clara..."
              />
              <button
                id="clara-chat-send"
                className="clara-chat-send px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Senden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Clara KI Floating Button
 * Provides access to the AI chat interface
 */
export function ClaraKIButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-40 flex items-center justify-center"
      title="Clara KI öffnen"
    >
      <Brain className="w-6 h-6 text-white" />
    </button>
  );
}

export default ClaraKIPanel;
