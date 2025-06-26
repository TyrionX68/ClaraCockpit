/**
 * ClaraKIPanel.jsx - v3.1 Modernized AI Assistant Panel
 * Migrated from legacy-clara/panels-archived/ClaraKIPanel.jsx
 * 
 * Features:
 * - React Hooks architecture
 * - Tailwind CSS styling
 * - Atomic Design compliance
 * - Slot-based integration ready
 * - ClaraGlobalContext compatible
 * - GDPR compliant conversation handling
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ClaraButton } from '../atoms/ClaraButton';

// Mock AI Provider for development - will be replaced with real Supabase integration
const useClaraAI = () => {
  const [conversations, setConversations] = useState([]);
  const [isThinking, setIsThinking] = useState(false);

  const askClara = useCallback(async (message) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };
    
    setConversations(prev => [...prev, userMessage]);
    setIsThinking(true);

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock AI responses based on keywords
    let aiResponse = 'Entschuldigung, ich verstehe Ihre Frage nicht ganz. Können Sie sie anders formulieren?';
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('miete') || lowerMessage.includes('zahlung')) {
      aiResponse = 'Für Mietangelegenheiten kann ich Ihnen mit aktuellen Zahlungsstatus und Rückständen helfen. Möchten Sie eine spezifische Wohnung prüfen?';
    } else if (lowerMessage.includes('wartung') || lowerMessage.includes('reparatur')) {
      aiResponse = 'Ich kann Wartungsanfragen verwalten und den Status laufender Reparaturen prüfen. Welche Wohnung oder welches Problem betrifft es?';
    } else if (lowerMessage.includes('dokument') || lowerMessage.includes('vertrag')) {
      aiResponse = 'Für Dokumentenverwaltung kann ich Ihnen beim Zugriff auf Mietverträge und andere wichtige Unterlagen helfen.';
    } else if (lowerMessage.includes('hallo') || lowerMessage.includes('hi')) {
      aiResponse = 'Hallo! Ich bin Clara, Ihr KI-Assistent für die Hausverwaltung. Ich kann Ihnen bei Mieten, Wartungen und Dokumenten helfen.';
    }

    const aiMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      text: aiResponse,
      timestamp: new Date().toISOString(),
      confidence: Math.floor(Math.random() * 30) + 70 // 70-100%
    };

    setConversations(prev => [...prev, aiMessage]);
    setIsThinking(false);
  }, []);

  return { conversations, isThinking, askClara };
};

export default function ClaraKIPanel({ 
  tenantId = null,
  initialOpen = false,
  onConversationUpdate = null,
  className = '',
  ...props 
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [inputValue, setInputValue] = useState('');
  const { conversations, isThinking, askClara } = useClaraAI();
  const messagesEndRef = useRef(null);

  // Auto-scroll to new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  // Notify parent component of conversation updates
  useEffect(() => {
    if (onConversationUpdate) {
      onConversationUpdate(conversations);
    }
  }, [conversations, onConversationUpdate]);

  // Send message handler
  const handleSendMessage = useCallback(async () => {
    
    const message = inputValue;
    setInputValue('');
    await askClara(message);
  }, [inputValue, isThinking, askClara]);

  // Enter key handler
  const handleKeyPress = useCallback((e) => {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Toggle panel visibility
  const togglePanel = useCallback(() => {
  }, []);

  return (
    <div className={} {...props}>
      {/* Floating Chat Button */}
        <div className=fixed bottom-6 right-6 z-50>
          <ClaraButton
            onClick={togglePanel}
            variant=primary
            size=lg
            className=rounded-full p-4 shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105
            aria-label=Clara KI-Assistent öffnen
          >
            <div className=flex items-center gap-2>
              <div className=w-6 h-6 bg-white/20 rounded-full flex items-center justify-center>
                <span className=text-sm font-bold text-white>C</span>
              </div>
              <span className=text-white font-medium>Clara</span>
            </div>
          </ClaraButton>
        </div>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className=fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden>
          <div className=w-96 h-[32rem] flex flex-col>
            {/* Header */}
            <div className=flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white>
              <div className=flex items-center gap-3>
                <div className=w-8 h-8 bg-white/20 rounded-full flex items-center justify-center>
                  <span className=text-sm font-bold>C</span>
                </div>
                <div>
                  <h3 className=font-semibold text-sm>Clara KI-Assistent</h3>
                  <p className=text-xs opacity-90>Hausverwaltung Waldhofstraße 76</p>
                </div>
              </div>
              <ClaraButton
                onClick={togglePanel}
                variant=ghost
                size=sm
                className=text-white/80 hover:text-white hover:bg-white/10 p-1
                aria-label=Chat schließen
              >
                <svg width=20 height=20 viewBox=0 0 24 24 fill=currentColor>
                  <path d=M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z/>
                </svg>
              </ClaraButton>
            </div>

            {/* Messages Container */}
            <div className=flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50>
              {conversations.length === 0 && (
                <div className=text-center text-gray-500 mt-8>
                  <div className=w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3>
                    <svg width=24 height=24 viewBox=0 0 24 24 fill=currentColor className=text-blue-600>
                      <path d=M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04.97 4.43L1 23l6.57-1.97C9.96 21.64 11.46 22 13 22c5.52 0 10-4.48 10-10S17.52 2 12 2z/>
                    </svg>
                  </div>
                  <p className=font-medium text-gray-700>Hallo! Ich bin Clara 👋</p>
                </div>
              )}
              
              {conversations.map((msg) => (
                <div
                  key={msg.id}
                  className={}
                >
                  <div
                    className={}
                  >
                    <p className=text-sm leading-relaxed>{msg.text}</p>
                    {msg.confidence && (
                      <div className=text-xs opacity-70 mt-2 flex items-center gap-1>
                        <span>Vertrauen: {msg.confidence}%</span>
                        <div className={}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isThinking && (
                <div className=flex justify-start>
                  <div className=bg-white text-gray-800 p-3 rounded-lg mr-4 border border-gray-200 shadow-sm>
                    <div className=flex items-center gap-2>
                      <div className=flex space-x-1>
                        <div className=w-2 h-2 bg-blue-400 rounded-full animate-bounce></div>
                        <div className=w-2 h-2 bg-blue-400 rounded-full animate-bounce style={{ animationDelay: '0.1s' }}></div>
                        <div className=w-2 h-2 bg-blue-400 rounded-full animate-bounce style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className=text-sm text-gray-600>Clara denkt...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className=p-4 bg-white border-t border-gray-200>
              <div className=flex gap-2>
                <input
                  type=text
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder=Fragen Sie Clara...
                  className=flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200
                  disabled={isThinking}
                  maxLength={500}
                />
                <ClaraButton
                  onClick={handleSendMessage}
                  variant=primary
                  size=sm
                  className=px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                  aria-label=Nachricht senden
                >
                  <svg width=16 height=16 viewBox=0 0 24 24 fill=currentColor>
                    <path d=M2.01 21L23 12 2.01 3 2 10l15 2-15 2z/>
                  </svg>
                </ClaraButton>
              </div>
              <div className=text-xs text-gray-500 mt-2 text-center>
                {inputValue.length}/500 Zeichen
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export for legacy compatibility
export { ClaraKIPanel };
