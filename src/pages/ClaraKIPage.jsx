import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Bot, User, Send, Sparkles, MessageSquare, Zap, Calculator, TrendingUp, Home, Users } from 'lucide-react';
import VoiceFeedback from '../components/molecules/VoiceFeedback';
import MicButton from '../components/molecules/MicButton';
import ClaraKIEngine from '../components/organisms/ClaraKIEngine';
import { createClient } from '@supabase/supabase-js';

// Supabase Client
const supabase = createClient(
  'https://anhomormslputicoybng.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuaG9tb3Jtc2xwdXRpY295Ym5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk0MDcwNzEsImV4cCI6MjAzNDk4MzA3MX0.4R5TCDhUNMKJLfGJOKUYGJZaKBOOOBgOjfA_JdWBqzY'
);

const ClaraKIPage = ({ onNavigate }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hallo! Ich bin Clara KI, Ihre intelligente Assistentin für die Hausverwaltung. Ich kenne alle Immobilien-Fachbegriffe, kann Wirtschaftlichkeitsberechnungen durchführen und alle Module steuern. Sprechen Sie mit mir oder schreiben Sie Ihre Frage!',
      timestamp: new Date(),
      suggestions: [
        'Zeige mir das Dashboard',
        'Wie ist mein Cashflow?',
        'Berechne die Rendite',
        'Zeige Mietrückstände'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const messagesEndRef = useRef(null);

  // Clara KI Engine Integration
  const claraEngine = ClaraKIEngine({ 
    onNavigate, 
    supabaseClient: supabase 
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle voice feedback
  const getVoiceStatus = () => {
    if (claraEngine.isProcessing) return 'processing';
    if (claraEngine.isListening) return 'listening';
    if (voiceActive) return 'success';
    return 'idle';
  };

  const getVoiceMessage = () => {
    if (claraEngine.isProcessing) return 'Clara denkt nach...';
    if (claraEngine.isListening) return 'Clara hört zu...';
    if (claraEngine.lastCommand) return `Verstanden: "${claraEngine.lastCommand}"`;
    if (voiceActive) return 'Voice-Control aktiv';
    return '';
  };

  const handleVoiceToggle = () => {
    setVoiceActive(!voiceActive);
    claraEngine.toggleVoiceRecognition();
  };

  const handleSendMessage = async (messageText = null) => {
    const text = messageText || inputValue;
    if (!text.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Process with Clara KI Engine
    try {
      await claraEngine.processVoiceCommand(text.toLowerCase());
      
      // Generate intelligent response based on context
      const response = await generateIntelligentResponse(text, claraEngine.contextData);
      
      setTimeout(() => {
        const assistantMessage = {
          id: messages.length + 2,
          type: 'assistant',
          content: response.content,
          timestamp: new Date(),
          suggestions: response.suggestions,
          kpis: response.kpis
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
        
        // Speak response if voice is active
        if (voiceActive) {
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
      const estimatedCosts = annualRent * 0.25; // 25% Bewirtschaftungskosten
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
      suggestions: ['Dashboard anzeigen', 'Cashflow berechnen', 'Mieter verwalten', 'Wartung planen']
    };
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Voice Feedback */}
      <VoiceFeedback
        isActive={voiceActive || claraEngine.isListening || claraEngine.isProcessing}
        isListening={claraEngine.isListening}
        message={getVoiceMessage()}
        status={getVoiceStatus()}
        onToggle={handleVoiceToggle}
      />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Clara KI</h1>
                  <p className="text-sm text-gray-600">Immobilien-Expertin mit Voice-Control</p>
                </div>
              </div>
            </div>
            
            {/* Voice Control Status */}
            <div className="flex items-center gap-2">
              <Badge variant={voiceActive ? "default" : "secondary"} className="gap-1">
                <Sparkles className="w-3 h-3" />
                {voiceActive ? 'Voice aktiv' : 'Voice inaktiv'}
              </Badge>
              {claraEngine.contextData.kpis && (
                <Badge variant="outline" className="gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {claraEngine.contextData.kpis.tenantCount} Mieter
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="h-[calc(100vh-200px)] flex flex-col shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white ml-auto'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  
                  {/* KPIs Display */}
                  {message.kpis && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">{message.kpis.tenantCount} Mieter</span>
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">{message.kpis.totalRent?.toLocaleString('de-DE')} €</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.suggestions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {message.timestamp.toLocaleTimeString('de-DE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white/50">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Fragen Sie Clara nach Immobilien-Kennzahlen, Berechnungen oder Verwaltungsaufgaben..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="resize-none border-gray-300 focus:border-blue-500"
                />
              </div>
              <MicButton
                isActive={voiceActive}
                isListening={claraEngine.isListening}
                onToggle={handleVoiceToggle}
                position="inline"
              />
              <Button 
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Voice Button */}
      <MicButton
        isActive={voiceActive}
        isListening={claraEngine.isListening}
        onToggle={handleVoiceToggle}
        position="floating"
      />
    </div>
  );
};

export default ClaraKIPage;

