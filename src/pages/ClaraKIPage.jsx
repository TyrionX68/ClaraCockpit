import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Users, Mic, MicOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VoiceFeedback from '../components/molecules/VoiceFeedback';
import MicButton from '../components/molecules/MicButton';
import ClaraKIEngine from '../components/organisms/ClaraKIEngine';

const ClaraKIPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: 'Hallo! Ich bin Clara KI, Ihre intelligente Assistentin für die Hausverwaltung. Ich kenne alle Immobilien-Fachbegriffe, kann Wirtschaftlichkeitsberechnungen durchführen und alle Module steuern. Sprechen Sie mit mir oder schreiben Sie Ihre Frage!',
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      suggestions: ['Zeige mir das Dashboard', 'Wie ist mein Cashflow?', 'Berechne die Rendite', 'Zeige Mietrückstände'],
      kpis: {}
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  // Initialize Clara KI Engine
  const claraEngine = ClaraKIEngine({
    onNavigate: navigate,
    supabaseClient: null // Mock for now
  });

  const { contextData, ResponseStylerProvider, DialogContextProvider } = claraEngine;

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim()) return;

    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Simulate processing delay
      setTimeout(async () => {
        const response = await generateIntelligentResponse(message, contextData);
        
        const assistantMessage = {
          type: 'assistant',
          content: response.content,
          timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          suggestions: response.suggestions,
          kpis: response.kpis
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
        
        // Speak response if voice is active
        if (voiceActive && response.content) {
          claraEngine.speak(response.content);
        }
      }, 1000);
    } catch (error) {
      console.error('Error processing message:', error);
      setIsTyping(false);
    }
  };

  const generateIntelligentResponse = async (input, contextData) => {
    const lowerInput = input.toLowerCase();
    
    // Dashboard & KPIs
    if (lowerInput.includes('dashboard') || lowerInput.includes('übersicht')) {
      return {
        content: `Hier ist Ihre aktuelle Übersicht: Sie verwalten ${contextData.kpis?.tenantCount || 0} Mieteinheiten mit einem monatlichen Gesamtertrag von ${(contextData.kpis?.totalRent || 0).toLocaleString('de-DE')} €. Die Vermietungsquote beträgt ${(contextData.kpis?.occupancyRate || 0).toFixed(1)}%.`,
        suggestions: ['Zeige Mieter-Details', 'Berechne Jahresrendite', 'Wartungsübersicht'],
        kpis: contextData.kpis
      };
    }
    
    // Cashflow & Rendite
    if (lowerInput.includes('cashflow') || lowerInput.includes('rendite')) {
      const monthlyRent = contextData.kpis?.totalRent || 0;
      const annualRent = monthlyRent * 12;
      const estimatedCosts = annualRent * 0.25;
      const netCashflow = annualRent - estimatedCosts;
      
      return {
        content: `Ihre Cashflow-Analyse: Brutto-Jahresertrag ${annualRent.toLocaleString('de-DE')} €, geschätzte Bewirtschaftungskosten ${estimatedCosts.toLocaleString('de-DE')} €, Netto-Cashflow ${netCashflow.toLocaleString('de-DE')} €. Das entspricht einem monatlichen Netto-Cashflow von ${(netCashflow/12).toLocaleString('de-DE')} €.`,
        suggestions: ['Detaillierte Kostenanalyse', 'Rendite-Optimierung', 'Steuerliche Betrachtung']
      };
    }
    
    // Mieter & Rückstände
    if (lowerInput.includes('mieter') || lowerInput.includes('rückstände')) {
      const arrears = contextData.kpis?.totalArrears || 0;
      const activeContracts = contextData.kpis?.activeContracts || 0;
      
      return {
        content: arrears > 0 
          ? `Sie haben ${activeContracts} aktive Mietverträge. Achtung: Es bestehen Mietrückstände in Höhe von ${arrears.toLocaleString('de-DE')} €. Ich empfehle eine zeitnahe Mahnung und Kontaktaufnahme mit den betroffenen Mietern.`
          : `Sehr gut! Sie haben ${activeContracts} aktive Mietverträge und keine offenen Mietrückstände. Alle Mieter zahlen pünktlich.`,
        suggestions: ['Mieter-Details anzeigen', 'Mahnwesen starten', 'Zahlungshistorie']
      };
    }
    
    // Wartung & Instandhaltung
    if (lowerInput.includes('wartung') || lowerInput.includes('reparatur')) {
      return {
        content: 'Für eine professionelle Immobilienverwaltung empfehle ich eine Instandhaltungsrücklage von 8-12 € pro m² Wohnfläche jährlich. Bei größeren Reparaturen sollten Sie immer mehrere Kostenvoranschläge einholen.',
        suggestions: ['Wartungskalender', 'Handwerker-Kontakte', 'Rücklage berechnen']
      };
    }
    
    // Wirtschaftlichkeit & Bewertung
    if (lowerInput.includes('wirtschaftlich') || lowerInput.includes('bewert')) {
      return {
        content: 'Für die Wirtschaftlichkeitsbewertung betrachte ich folgende Kennzahlen: Bruttomietrendite (sollte >6% sein), Mietmultiplikator (<20), Leerstandsrisiko (<5%) und Eigenkapitalrendite. Möchten Sie eine detaillierte Analyse Ihrer Objekte?',
        suggestions: ['Rendite berechnen', 'Marktvergleich', 'Optimierungspotentiale']
      };
    }
    
    // Fallback: Allgemeine Immobilien-Beratung
    return {
      content: 'Als Ihre Immobilien-Expertin kann ich Ihnen bei allen Fragen zur Hausverwaltung helfen. Ich kenne Fachbegriffe, führe Wirtschaftlichkeitsberechnungen durch und analysiere Ihre Daten. Was möchten Sie wissen?',
      suggestions: ['Dashboard anzeigen', 'Cashflow berechnen', 'Mieter verwalten', 'Wartung planen'],
      kpis: contextData.kpis || {}
    };
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleVoiceToggle = () => {
    setVoiceActive(!voiceActive);
    claraEngine.toggleVoiceRecognition();
  };

  const getVoiceMessage = () => {
    if (claraEngine.isListening) return 'Ich höre zu...';
    if (claraEngine.isProcessing) return 'Verarbeite Anfrage...';
    if (voiceActive) return 'Voice-Control aktiv';
    return 'Voice-Control inaktiv';
  };

  const getVoiceStatus = () => {
    if (claraEngine.isListening) return 'listening';
    if (claraEngine.isProcessing) return 'processing';
    if (voiceActive) return 'active';
    return 'inactive';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Voice Feedback */}
      <VoiceFeedback
        isActive={voiceActive || claraEngine.isListening || claraEngine.isProcessing}
        isListening={claraEngine.isListening}
        message={getVoiceMessage()}
        status={getVoiceStatus()}
        onToggle={handleVoiceToggle}
      />

      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clara KI</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Immobilien-Expertin mit Voice-Control</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${voiceActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-gray-600 dark:text-gray-300">
                  {voiceActive ? 'Voice aktiv' : 'Voice inaktiv'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-300">
                  {contextData.kpis?.tenantCount || 0} Mieter
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-3 sm:p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 sm:gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'assistant' && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
                
                <div className={`
                  max-w-[280px] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl
                  ${message.type === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }
                `}>
                  <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp}
                  </div>
                  
                  {/* Suggestions - Mobile optimiert */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-1 sm:space-y-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(suggestion)}
                          className="block w-full text-left px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-green-100 hover:bg-green-200 dark:bg-green-800 dark:hover:bg-green-700 text-green-800 dark:text-green-200 rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.type === 'user' && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Sie</span>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 sm:gap-3 justify-start">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length > 0 && messages[messages.length - 1].suggestions && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {messages[messages.length - 1].suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs sm:text-sm bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 border-gray-300 dark:border-gray-600 px-2 sm:px-3 py-1 sm:py-2"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area - Mobile optimiert */}
          <div className="p-3 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Fragen Sie Clara nach Immobilien-Kennzahlen, Berechnungen oder Verwaltungsaufgaben..."
                  className="pr-10 sm:pr-12 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 sm:h-8 sm:w-8 p-0"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              
              <MicButton
                isActive={voiceActive}
                isListening={claraEngine.isListening}
                onClick={handleVoiceToggle}
                title={voiceActive ? 'Voice deaktivieren' : 'Voice aktivieren'}
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced AI Providers - Hidden but active */}
      <ResponseStylerProvider />
      <DialogContextProvider />
    </div>
  );
};

export default ClaraKIPage;

