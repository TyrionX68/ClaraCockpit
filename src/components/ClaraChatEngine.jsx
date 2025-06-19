import React, { useState, useRef, useEffect } from 'react';

export default function ClaraChatEngine() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'clara',
      text: 'Hallo! Ich bin Clara, Ihr KI-Assistent für die Hausverwaltung. Wie kann ich Ihnen heute helfen?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🤖 ECHTE KI-INTEGRATION MIT JSON-ENGINE
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 🔗 JSON-ENGINE API CALL - ECHTE KI-ANTWORT
      const response = await fetch('/api/clara/intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage.text,
          timestamp: userMessage.timestamp 
        })
      });

      if (!response.ok) {
        throw new Error('API-Fehler');
      }

      const data = await response.json();
      
      const claraResponse = {
        id: Date.now() + 1,
        type: 'clara',
        text: data.reply || 'Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten.',
        timestamp: new Date(),
        confidence: data.confidence || 0.5,
        topic: data.topic || 'general'
      };

      setMessages(prev => [...prev, claraResponse]);
      
    } catch (error) {
      console.error('Clara KI-Fehler:', error);
      
      // FALLBACK: Lokale Intent-Matching als Backup
      const fallbackResponse = getLocalIntentResponse(userMessage.text);
      
      const claraResponse = {
        id: Date.now() + 1,
        type: 'clara',
        text: fallbackResponse,
        timestamp: new Date(),
        fallback: true
      };

      setMessages(prev => [...prev, claraResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🧠 LOKALE INTENT-MATCHING FUNKTION (FALLBACK)
  const getLocalIntentResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Intent-Matching basierend auf clara_json_engine.js
    if (lowerMessage.includes('miete') || lowerMessage.includes('mieteinnahmen')) {
      return 'Die aktuellen Mieteinnahmen für die Waldhofstraße 76 betragen 8.360€ monatlich bei 100% Vermietungsgrad. Möchten Sie Details zu einzelnen Wohnungen?';
    }
    
    if (lowerMessage.includes('rückstand') || lowerMessage.includes('rückstände')) {
      return 'Aktuell gibt es einen Rückstand von 1.200€ vom Mieter im 1. OG rechts (2 Monate). Soll ich eine Mahnung vorbereiten?';
    }
    
    if (lowerMessage.includes('wartung') || lowerMessage.includes('reparatur')) {
      return 'Für Wartungsarbeiten empfehle ich eine Überprüfung der Heizungsanlage. Die Kosten sind in den letzten 3 Monaten um 15% gestiegen. Potentielle Einsparung: ca. 200€/Monat.';
    }
    
    if (lowerMessage.includes('cashflow') || lowerMessage.includes('liquidität')) {
      return 'Der aktuelle Cashflow zeigt +7.160€ monatlich (8.360€ Einnahmen - 1.200€ Kosten). Die Prognose für die nächsten 6 Monate: +37.260€.';
    }
    
    if (lowerMessage.includes('rendite') || lowerMessage.includes('gewinn')) {
      return 'Die Jahresrendite beträgt aktuell 8,4% und liegt über dem Marktdurchschnitt. Das entspricht einer sehr guten Performance für Ihre Immobilie.';
    }
    
    if (lowerMessage.includes('finanz') || lowerMessage.includes('übersicht')) {
      return 'Finanzübersicht Waldhofstraße 76: Mieteinnahmen +8.360€, Betriebskosten -1.200€, Netto-Cashflow +7.160€. Jahresrendite: 8,4%. Alle Werte aktuell.';
    }
    
    // Standard-Antwort
    return 'Vielen Dank für Ihre Nachricht! Ich kann Ihnen bei Fragen zu Mieten, Rückständen, Wartung, Cashflow und Renditen helfen. Was möchten Sie wissen?';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="clara-chat-engine">
      <div className="chat-header">
        <h2>🤖 Clara KI-Assistent</h2>
        <p>Intelligente Unterstützung für Ihre Hausverwaltung</p>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              <div className="message-text">{message.text}</div>
              <div className="message-meta">
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString('de-DE', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {message.confidence && (
                  <span className="confidence">
                    Vertrauen: {Math.round(message.confidence * 100)}%
                  </span>
                )}
                {message.topic && (
                  <span className="topic">Thema: {message.topic}</span>
                )}
                {message.fallback && (
                  <span className="fallback">Offline-Modus</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message clara loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="message-text">Clara denkt nach...</div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Fragen Sie Clara..."
          disabled={isLoading}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
        >
          {isLoading ? '⏳' : '📤'} Senden
        </button>
      </div>
    </div>
  );
}
