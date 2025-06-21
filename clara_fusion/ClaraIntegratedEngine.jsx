// ClaraIntegratedEngine.jsx - Simplified version for slot integration
import React, { useState, useEffect } from 'react';

const ClaraIntegratedEngine = ({ mode = 'integrated', theme = 'clara360-anker', slot = 'clara-ki-slot' }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'clara',
      content: 'Hallo! Ich bin Clara, Ihre KI-Assistentin für die Hausverwaltung. Wie kann ich Ihnen helfen?',
      timestamp: new Date().toLocaleTimeString(),
      emotion: 'friendly'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Enhanced response system
  const generateResponse = (input) => {
    const responses = {
      'rückstände': {
        content: 'Ich analysiere die aktuellen Rückstände für die Waldhofstraße 76. Basierend auf den Daten zeigen sich folgende kritische Punkte: Wohnung 3A (450€), Wohnung 7B (280€). Soll ich eine WhatsApp-Nachricht für die Mahnung erstellen?',
        emotion: 'concerned',
        actions: ['whatsapp', 'document']
      },
      'cashflow': {
        content: 'Der aktuelle Cashflow für die Waldhofstraße 76 zeigt: Einnahmen 8.360€/Monat, Ausgaben 2.180€/Monat. Netto-Cashflow: +6.180€. Die Rendite liegt bei 8,4% - ein exzellentes Ergebnis!',
        emotion: 'positive',
        actions: ['document', 'analysis']
      },
      'wartung': {
        content: 'Wartungsübersicht Waldhofstraße 76: Heizung (850€ fällig), Reinigung (280€ monatlich), Gartenpflege (150€). Nächste Inspektion: Aufzug in 3 Monaten. Soll ich die Termine koordinieren?',
        emotion: 'helpful',
        actions: ['schedule', 'document']
      }
    };

    // Find matching response
    const key = Object.keys(responses).find(k => 
      input.toLowerCase().includes(k)
    );

    if (key) {
      return responses[key];
    }

    // Default response
    return {
      content: `Ich verstehe Ihre Anfrage zu "${input}". Als KI-Assistentin für die Hausverwaltung kann ich Ihnen bei Rückständen, Cashflow-Analysen, Wartungsplanung und Dokumentenerstellung helfen. Was möchten Sie genauer wissen?`,
      emotion: 'helpful',
      actions: ['help']
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      const response = generateResponse(inputValue);
      const claraMessage = {
        id: messages.length + 2,
        type: 'clara',
        content: response.content,
        timestamp: new Date().toLocaleTimeString(),
        emotion: response.emotion,
        actions: response.actions
      };

      setMessages(prev => [...prev, claraMessage]);
      setIsProcessing(false);
    }, 1500);

    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      friendly: '😊',
      concerned: '🤔',
      positive: '✅',
      helpful: '💡'
    };
    return icons[emotion] || '🤖';
  };

  const getActionButton = (action) => {
    const actions = {
      whatsapp: { label: 'WhatsApp erstellen', color: 'bg-green-500', icon: '📱' },
      document: { label: 'Dokument öffnen', color: 'bg-blue-500', icon: '📄' },
      analysis: { label: 'Detailanalyse', color: 'bg-purple-500', icon: '📊' },
      schedule: { label: 'Termin planen', color: 'bg-orange-500', icon: '📅' },
      help: { label: 'Hilfe', color: 'bg-gray-500', icon: '❓' }
    };
    return actions[action] || { label: action, color: 'bg-gray-400', icon: '🔧' };
  };

  return (
    <div className="clara-integrated-engine w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold flex items-center">
          <span className="mr-2">🤖</span>
          Clara KI-Chat
          <span className="ml-auto text-sm bg-white/20 px-2 py-1 rounded">
            Fusion Engine
          </span>
        </h3>
        <p className="text-sm opacity-90">Intelligente Hausverwaltungs-Assistentin</p>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.type === 'clara' && (
                <div className="flex items-center mb-1">
                  <span className="mr-2">{getEmotionIcon(message.emotion)}</span>
                  <span className="text-xs font-medium">Clara</span>
                </div>
              )}
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
              
              {/* Action buttons */}
              {message.actions && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.actions.map((action, index) => {
                    const actionConfig = getActionButton(action);
                    return (
                      <button
                        key={index}
                        className={`text-xs px-2 py-1 rounded text-white ${actionConfig.color} hover:opacity-80`}
                        onClick={() => console.log(`Action: ${action}`)}
                      >
                        {actionConfig.icon} {actionConfig.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2">🤖</span>
                <span className="text-sm">Clara denkt...</span>
                <div className="ml-2 flex space-x-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Fragen Sie Clara nach Rückständen, Cashflow, Wartung..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isProcessing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isProcessing}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Senden
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="bg-gray-50 px-4 py-2 rounded-b-lg text-xs text-gray-600">
        Status: Integriert in #{slot} | Nachrichten: {messages.length} | Engine: Aktiv
      </div>
    </div>
  );
};

export default ClaraIntegratedEngine;

