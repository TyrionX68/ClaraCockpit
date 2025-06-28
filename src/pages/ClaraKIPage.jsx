import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Users, Mic, MicOff, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VoiceFeedback from '../components/molecules/VoiceFeedback';
import MicButton from '../components/molecules/MicButton';
import EnhancedMicButton from '../components/molecules/EnhancedMicButton';
import DesktopMicButton from '../components/molecules/DesktopMicButton';
import ImprovedMicButton from '../components/molecules/ImprovedMicButton';
import ForcePermissionMicButton from '../components/molecules/ForcePermissionMicButton';
import BasicVoiceButton from '../components/molecules/BasicVoiceButton';
import SpeechControls from '../components/molecules/SpeechControls';
import ClaraKIEngine from '../components/organisms/ClaraKIEngine';
import { VoiceContextProvider, useVoiceContext } from '../contexts/VoiceContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useClaraDialogContext } from '../hooks/useClaraDialogContext';
import { useClaraSuggestions } from '../hooks/useClaraSuggestions';
import { generateSSML } from '../logic/SSMLResponseGenerator';
import VoiceDebugTest from '../components/debug/VoiceDebugTest';

// NEW CLARA KI OPTIMIZATION IMPORTS
import EnhancedVoiceControl from '../components/molecules/EnhancedVoiceControl';
import ClaraTTSControl from '../components/molecules/ClaraTTSControl';
import ClaraMemoryInsights from '../components/molecules/ClaraMemoryInsights';
import { useEnhancedVoiceRecognition } from '../hooks/useEnhancedVoiceRecognition';
import { useNaturalTTS } from '../hooks/useNaturalTTS';
import { useIntelligentContextMemory } from '../hooks/useIntelligentContextMemory';
import { useProactiveAISuggestions } from '../hooks/useProactiveAISuggestions';

// NEW V6.1.9 VOICE SYSTEM ISOLATION
import SimpleMicButton from '../components/molecules/SimpleMicButton';
import WakewordButton from '../components/molecules/WakewordButton';
import WorkingMicButton from '../components/molecules/WorkingMicButton';
import VoiceDebugPanel from '../components/molecules/VoiceDebugPanel';
import { useVoiceSystemHandler } from '../hooks/VoiceSystemHandler';

// ENHANCED V6.2.0 VOICE SYSTEM - FIXED & IMPROVED
import EnhancedWorkingMicButton from '../components/molecules/EnhancedWorkingMicButton';
import RealWakewordButton from '../components/molecules/RealWakewordButton';

// Main ClaraKI Component with Voice Integration
const ClaraKIPageContent = () => {
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  
  // Debug panel state
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  // Check URL for debug parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setShowDebugPanel(urlParams.get('debug') === 'true');
  }, []);
  
  // Voice Context Integration
  const {
    voiceActive,
    isListening,
    transcript,
    error: voiceError,
    isSupported,
    toggleVoice,
    getVoiceStatus,
    getStatusMessage
  } = useVoiceContext();
  
  // Speech Synthesis Integration
  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isPaused,
    isSupported: speechSupported,
    error: speechError,
    settings: speechSettings,
    updateSettings: updateSpeechSettings
  } = useSpeechSynthesis();
  
  // Clara Dialog Context Integration
  const {
    conversationHistory,
    currentTopic,
    pendingQuestions,
    isFollowUp,
    processQuery,
    recordResponse,
    generateCallbackReference,
    clearConversationHistory,
    getActiveContext
  } = useClaraDialogContext();
  
  // Clara Suggestions Integration
  const {
    suggestions: claraSuggestions,
    isGenerating: isGeneratingSuggestions,
    generateSuggestions,
    clearSuggestions,
    executeSuggestion
  } = useClaraSuggestions();

  // NEW CLARA KI OPTIMIZATION HOOKS
  
  // Enhanced Voice Recognition with Wake-Word
  const {
    isListening: enhancedListening,
    isWakeWordActive,
    transcript: enhancedTranscript,
    confidence: voiceConfidence,
    error: enhancedVoiceError,
    isSupported: enhancedVoiceSupported,
    audioLevel,
    wakeWordDetected,
    startListening: startEnhancedListening,
    stopListening: stopEnhancedListening,
    toggleListening: toggleEnhancedListening,
    toggleWakeWordMode,
    clearTranscript: clearEnhancedTranscript
  } = useEnhancedVoiceRecognition();

  // Natural TTS with Clara Personality
  const {
    isSpeaking: claraSpeaking,
    isPaused: claraPaused,
    isSupported: claraTTSSupported,
    currentText: claraCurrentText,
    queue: claraSpeechQueue,
    error: claraTTSError,
    speak: claraSpeak,
    addToQueue: addToSpeechQueue,
    stop: stopClaraSpeak,
    pause: pauseClaraSpeak,
    resume: resumeClaraSpeak,
    speakClaraResponse,
    getClaraResponse
  } = useNaturalTTS();

  // Intelligent Context Memory
  const {
    conversationHistory: memoryHistory,
    currentSession,
    userPreferences,
    contextTopics,
    memoryStats,
    addConversationEntry,
    getRelevantContext,
    generateContextualHints
  } = useIntelligentContextMemory();

  // Proactive AI Suggestions
  const {
    suggestions: aiSuggestions,
    predictions,
    alerts: aiAlerts,
    trends,
    isAnalyzing,
    lastAnalysis,
    performAnalysis,
    executeSuggestion: executeAISuggestion,
    dismissSuggestion,
    getHighPrioritySuggestions
  } = useProactiveAISuggestions();
  
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

  // Initialize Clara KI Engine
  const claraEngine = ClaraKIEngine({
    onNavigate: navigate,
    supabaseClient: null // Mock for now
  });

  const { contextData, ResponseStylerProvider, DialogContextProvider } = claraEngine;

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Process query with dialog context
    const queryContext = processQuery({
      query: message,
      entities: [], // TODO: Add entity extraction
      intentType: 'unknown', // TODO: Add intent detection
      confidence: 1.0,
      additionalContext: { contextData }
    });

    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      isFollowUp: queryContext.isFollowUp,
      resolvedQuery: queryContext.resolvedQuery
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      // Performance Fix: Limit chat history to 15 messages to prevent memory leaks
      return newMessages.length > 15 ? newMessages.slice(-15) : newMessages;
    });
    setInputValue('');
    setIsTyping(true);

    try {
      // Simulate processing delay - reduced for better performance
      setTimeout(async () => {
        const response = await generateIntelligentResponse(queryContext.resolvedQuery || message, contextData, queryContext.context);
        
        // Generate callback reference if applicable
        const callbackReference = generateCallbackReference({
          currentQuery: message,
          currentContext: queryContext.context
        });
        
        // Prepend callback reference to response if available
        let finalContent = response.content;
        if (callbackReference) {
          finalContent = `${callbackReference}. ${response.content}`;
        }
        
        // Generate suggestions based on query and response
        const generatedSuggestions = await generateSuggestions({
          query: message,
          context: queryContext.context,
          entities: [], // TODO: Add entity extraction
          intentType: 'unknown', // TODO: Add intent detection
          confidence: 1.0,
          missingParameters: {} // TODO: Add parameter detection
        });
        
        // Combine response suggestions with generated suggestions
        const allSuggestions = [
          ...(response.suggestions || []),
          ...generatedSuggestions.map(s => s.text)
        ].slice(0, 4); // Limit to 4 suggestions
        
        const assistantMessage = {
          type: 'assistant',
          content: finalContent,
          timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          suggestions: allSuggestions,
          kpis: response.kpis,
          claraSuggestions: generatedSuggestions,
          hasCallbackReference: !!callbackReference
        };
        
        // Record response in dialog context
        recordResponse({
          query: message,
          response: finalContent,
          context: queryContext.context,
          entities: [], // TODO: Add entity extraction
          intentType: 'unknown', // TODO: Add intent detection
          confidence: 1.0,
          containsQuestion: finalContent.includes('?')
        });

        // NEW: Add to Context Memory
        addConversationEntry({
          type: 'user',
          content: message,
          timestamp: new Date().toISOString(),
          context: queryContext.context
        });

        addConversationEntry({
          type: 'assistant',
          content: finalContent,
          timestamp: new Date().toISOString(),
          context: queryContext.context,
          suggestions: allSuggestions
        });
        
        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          // Performance Fix: Limit chat history to 15 messages
          return newMessages.length > 15 ? newMessages.slice(-15) : newMessages;
        });
        setIsTyping(false);
        
        // NEW: Enhanced TTS with Clara Personality
        if (response.content && claraTTSSupported) {
          try {
            // Use Clara's Natural TTS instead of basic Web Speech API
            const claraResponse = getClaraResponse(response.content, {
              context: queryContext.context,
              emotion: response.emotion || 'friendly',
              urgency: response.urgency || 'normal',
              includePersonality: true
            });
            
            speakClaraResponse(claraResponse);
            
            console.log('🤖 Clara spricht mit Persönlichkeit:', response.content.substring(0, 50) + '...');
            
          } catch (ttsError) {
            console.warn('🚨 Clara TTS fehlgeschlagen, fallback zu Standard TTS:', ttsError);
            
            // Fallback to old TTS if Clara TTS fails
            if ('speechSynthesis' in window) {
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(response.content);
              utterance.lang = 'de-DE';
              utterance.pitch = 1.1;
              utterance.rate = 1.0;
              utterance.volume = 1.0;
              window.speechSynthesis.speak(utterance);
            }
          }
        }

        // NEW: Trigger AI Analysis for Proactive Suggestions
        setTimeout(() => {
          performAnalysis();
        }, 2000);
        
      }, 800); // Reduced from 1000ms to 800ms
    } catch (error) {
      console.error('Error generating response:', error);
      setIsTyping(false);
    }
  };

  const generateIntelligentResponse = async (input, contextData, dialogContext = {}) => {
    const lowerInput = input.toLowerCase();
    
    // Check for follow-up context
    const isFollowUp = dialogContext.isFollowUp || false;
    const previousTopic = dialogContext.currentTopic;
    
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

    // Default response
    return {
      content: `Ich verstehe Ihre Anfrage "${input}". Als Clara KI kann ich Ihnen bei Immobilien-Kennzahlen, Berechnungen und Verwaltungsaufgaben helfen. Stellen Sie mir gerne eine spezifische Frage zu Ihren Objekten, Mietern oder Finanzen.`,
      suggestions: ['Dashboard anzeigen', 'Cashflow berechnen', 'Mieter-Übersicht', 'Wartungsaufgaben']
    };
  };

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Clara KI</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Ihre intelligente Assistentin für Hausverwaltung
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              {/* ENHANCED V6.2.0 VOICE SYSTEM - Fixed & Improved */}
              <div className="flex items-center gap-3">
                {/* Enhanced Manual Speech Button (Sprechen) */}
                <EnhancedWorkingMicButton
                  onTranscriptReceived={(transcript) => {
                    if (transcript.trim()) {
                      console.log('📝 Enhanced transcript received:', transcript);
                      handleSendMessage(transcript);
                    }
                  }}
                  size="sm"
                  showStatus={true}
                  showPermissionHelper={true}
                  className="flex-shrink-0"
                />
                
                {/* Real Wakeword Button (Hey Clara) - FULLY FUNCTIONAL */}
                <RealWakewordButton
                  onWakewordDetected={(detection) => {
                    console.log('🎯 Wakeword detected:', detection);
                  }}
                  onTranscriptReceived={(transcript) => {
                    if (transcript.trim()) {
                      console.log('📝 Wakeword transcript received:', transcript);
                      handleSendMessage(transcript);
                    }
                  }}
                  size="sm"
                  showStatus={true}
                  className="flex-shrink-0"
                />
              </div>
              
              {/* Clara TTS Control - NEW */}
              <ClaraTTSControl
                isSpeaking={claraSpeaking}
                isPaused={claraPaused}
                currentText={claraCurrentText}
                queue={claraSpeechQueue}
                error={claraTTSError}
                isSupported={claraTTSSupported}
                onStop={stopClaraSpeak}
                onPause={pauseClaraSpeak}
                onResume={resumeClaraSpeak}
                className="flex-shrink-0"
              />
              
              {/* Speech Controls */}
              <SpeechControls 
                showSettings={true}
                onSettingsChange={(settings) => {
                  console.log('Speech settings updated:', settings);
                }}
                className="relative"
              />
              
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {contextData.kpis?.tenantCount || 0} Mieter
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-3 sm:p-6 space-y-4 scroll-smooth"
            style={{
              scrollBehavior: 'smooth',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch'
            }}
            onWheel={(e) => {
              // Ensure mouse wheel scrolling works
              e.currentTarget.scrollTop += e.deltaY;
            }}
          >
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
                    : 'bg-muted text-muted-foreground'
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
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm bg-accent hover:bg-accent/80 text-accent-foreground rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.type === 'user' && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-medium text-secondary-foreground">Sie</span>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 sm:gap-3 justify-start">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="bg-muted px-3 sm:px-4 py-2 sm:py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length > 0 && messages[messages.length - 1].suggestions && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-border bg-muted">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {messages[messages.length - 1].suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs sm:text-sm bg-card hover:bg-accent border-border px-2 sm:px-3 py-1 sm:py-2"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area - Mobile optimiert */}
          <div className="p-3 sm:p-6 border-t border-border bg-card">
            <div className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  placeholder="Fragen Sie Clara nach Immobilien-Kennzahlen, Berechnungen oder Verwaltungsaufgaben..."
                  className="pr-10 sm:pr-12 text-sm sm:text-base bg-background border-input text-foreground"
                />
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  size="sm"
                  className="absolute right-1 top-1 h-6 w-6 sm:h-8 sm:w-8 p-0"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
              
              {/* ENHANCED V6.2.0 - Fixed Voice System with Permission Handling */}
              <EnhancedWorkingMicButton
                onTranscriptReceived={handleSendMessage}
                className="w-10 h-10 sm:w-12 sm:h-12"
                size="sm"
                showStatus={false}
                showPermissionHelper={true}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* NEW: Clara Memory Insights */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4">
        <ClaraMemoryInsights
          conversationHistory={memoryHistory}
          currentSession={currentSession}
          userPreferences={userPreferences}
          contextTopics={contextTopics}
          memoryStats={memoryStats}
          onClearMemory={() => {
            // Clear memory if needed
            console.log('Memory cleared by user');
          }}
          className="mb-4"
        />
      </div>

      {/* NEW: AI Suggestions Panel */}
      {aiSuggestions.length > 0 && (
        <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              🤖 Clara's Empfehlungen
              {isAnalyzing && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </h3>
            
            <div className="grid gap-3 sm:grid-cols-2">
              {getHighPrioritySuggestions().slice(0, 4).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="bg-muted rounded-lg p-3 border border-border hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{suggestion.category === 'urgent' ? '🚨' : suggestion.category === 'financial' ? '💰' : '💡'}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          suggestion.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          suggestion.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {suggestion.priority}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-foreground mb-1">
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      <div className="text-xs text-green-600 mb-2">
                        💡 {suggestion.impact}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => executeAISuggestion(suggestion.id, suggestion.action)}
                      className="text-xs h-7"
                    >
                      Ausführen
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="text-xs h-7"
                    >
                      Ignorieren
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {aiAlerts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="font-medium text-sm text-foreground mb-2">🚨 Wichtige Hinweise</h4>
                <div className="space-y-2">
                  {aiAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className={`text-xs p-2 rounded-lg ${
                        alert.type === 'critical' ? 'bg-red-50 text-red-800 border border-red-200' :
                        alert.type === 'warning' ? 'bg-orange-50 text-orange-800 border border-orange-200' :
                        'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      <strong>{alert.title}:</strong> {alert.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Enhanced AI Providers - Hidden but active */}
      <ResponseStylerProvider />
      <DialogContextProvider />
      
      {/* Voice Debug Panel - Toggleable */}
      <VoiceDebugPanel 
        isVisible={showDebugPanel}
        onToggle={() => setShowDebugPanel(!showDebugPanel)}
      />
    </div>
  );
};

// Main Component with Voice Context Provider
const ClaraKIPage = () => {
  const handleVoiceTranscript = (transcript) => {
    console.log('Voice transcript received in main component:', transcript);
    // The transcript will be handled by the ClaraKIPageContent component
    // through the voice context
  };

  return (
    <VoiceContextProvider onTranscript={handleVoiceTranscript}>
      <ClaraKIPageContent />
    </VoiceContextProvider>
  );
};

export default ClaraKIPage;

