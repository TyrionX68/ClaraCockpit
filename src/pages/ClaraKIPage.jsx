import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Bot, User, Lightbulb, Settings, History, X, Brain, Zap, TrendingUp, Building, Users, DollarSign, Wrench, FileText, BarChart3, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import ClaraIntelligenceEngine from '../clara_intelligence/ClaraIntelligenceEngine.js'
import ClaraEmotionScaler from '../clara_intelligence/ClaraEmotionScaler.js'
import ClaraUncertaintyExplainer from '../clara_intelligence/ClaraUncertaintyExplainer.js'

/**
 * Clara AI Page - Clean & Professional Design
 * Simplified chat interface with modern styling
 * Author: 📛 🛠️ Manus A | AI Integration Specialist
 * Date: 2025-06-07
 */

const initialMessages = [
  {
    id: 1,
    type: 'ai',
    content: 'Hallo! 👋 Ich bin Clara, Ihre KI-Assistentin. Wie kann ich Ihnen heute helfen?',
    timestamp: new Date(),
    confidence: 0.95
  }
]

const intelligentSuggestions = [
  {
    category: 'Finanzanalyse',
    icon: DollarSign,
    suggestions: [
      'Rendite-Entwicklung der letzten 12 Monate',
      'Mieterhöhung um 3% simulieren',
      'Kostentreiber identifizieren',
      'Cashflow-Prognose Q3 2025'
    ]
  },
  {
    category: 'Objektmanagement',
    icon: Building,
    suggestions: [
      'Wartungsbedarf nach Objekten',
      'Performance Stadtlage vs. Vorort',
      'Modernisierungspotential bewerten',
      'Leerstandsrisiken analysieren'
    ]
  },
  {
    category: 'Mietermanagement',
    icon: Users,
    suggestions: [
      'Mieterzufriedenheit bewerten',
      'Kündigungsrisiken Q3',
      'Zahlungsverhalten analysieren',
      'Kommunikation optimieren'
    ]
  },
  {
    category: 'Wartung & Instandhaltung',
    icon: Wrench,
    suggestions: [
      'Wartungsplan 2025 erstellen',
      'Heizungsmodernisierung kalkulieren',
      'Präventive Maßnahmen ROI',
      'Saisonale Wartungsmuster'
    ]
  }
]

export function ClaraAIPage() {
  // Core state
  const [messages, setMessages] = useState(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // UI state
  const [activePanel, setActivePanel] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('Finanzanalyse')
  
  // AI settings
  const [settings, setSettings] = useState({
    language: 'de',
    autoSuggestions: true,
    contextLevel: 'high',
    intelligenceLevel: 'advanced',
    // ChatGPT Integration Settings
    enableChatGPT: false,
    chatGPTApiKey: '',
    chatGPTDailyLimit: 100,
    chatGPTMonthlyLimit: 2000
  })
  
  // ChatGPT Usage Statistics
  const [chatGPTStats, setChatGPTStats] = useState({
    enabled: false,
    dailyUsage: 0,
    monthlyUsage: 0,
    totalCost: 0,
    dailyLimit: 100,
    monthlyLimit: 2000
  })
  
  // Conversation history
  const [conversationHistory, setConversationHistory] = useState([
    {
      id: 'conv-001',
      title: 'Rendite-Optimierung Q2 2025',
      date: new Date(2025, 5, 3, 14, 30),
      summary: 'Portfolio-Performance und Optimierungsstrategien'
    },
    {
      id: 'conv-002',
      title: 'Wartungsplanung Stadthaus-Portfolio',
      date: new Date(2025, 5, 2, 10, 15),
      summary: 'Präventive Wartungsstrategien und Kostenoptimierung'
    },
    {
      id: 'conv-003',
      title: 'Mieter-Retention Analyse',
      date: new Date(2025, 4, 28, 9, 45),
      summary: 'Mieterzufriedenheit und Kündigungsprävention'
    }
  ])
  
  // AI Intelligence Engine + Dialog Intelligence
  const intelligenceEngineRef = useRef(null)
  const emotionScalerRef = useRef(null)
  const uncertaintyExplainerRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Initialize AI Intelligence Engine
  useEffect(() => {
    initializeIntelligenceEngine()
    // Ensure page starts at top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }, 100)
  }, [])

  useEffect(() => {
    // Only scroll to bottom if there are messages and user is actively chatting
    if (messages.length > 1) {
      scrollToBottom()
    }
  }, [messages, isTyping])

  const initializeIntelligenceEngine = () => {
    console.log("🔗 [RUNTIME] Initialisiere Clara Intelligence Engine v1.1")
    
    try {
      // Hauptengine initialisieren
      intelligenceEngineRef.current = new ClaraIntelligenceEngine({
        enableCognitiveArchitecture: settings.intelligenceLevel === 'advanced',
        contextRetentionLimit: 100,
        responseTimeout: 8000,
        enableCMIRS: true,
        enablePredictiveAnalytics: true,
        offlineMode: true,
        // ChatGPT Integration
        enableChatGPTProxy: settings.enableChatGPT,
        chatGPTDailyLimit: settings.chatGPTDailyLimit,
        chatGPTMonthlyLimit: settings.chatGPTMonthlyLimit
      })
      
      console.log("✅ [RUNTIME] ClaraIntelligenceEngine erfolgreich erstellt")
      
      // Dialog-Intelligenz Module initialisieren
      try {
        emotionScalerRef.current = new ClaraEmotionScaler({
          enableEmotionalScaling: true,
          maxEmotionalIntensity: 0.7,
          contextSensitivity: 0.8
        })
        console.log("✅ [RUNTIME] ClaraEmotionScaler erfolgreich erstellt")
        console.log("✅ [RUNTIME] scaleEmotion verfügbar:", typeof emotionScalerRef.current.scaleEmotion === 'function')
      } catch (emotionError) {
        console.warn("⚠️ [RUNTIME] ClaraEmotionScaler Fehler:", emotionError.message)
        emotionScalerRef.current = null
      }
      
      try {
        uncertaintyExplainerRef.current = new ClaraUncertaintyExplainer({
          enableUncertaintyExplanations: true,
          highConfidenceThreshold: 0.8,
          mediumConfidenceThreshold: 0.6,
          lowConfidenceThreshold: 0.4,
          includeConfidenceLevel: true,
          includeAlternatives: true
        })
        console.log("✅ [RUNTIME] ClaraUncertaintyExplainer erfolgreich erstellt")
      } catch (uncertaintyError) {
        console.warn("⚠️ [RUNTIME] ClaraUncertaintyExplainer Fehler:", uncertaintyError.message)
        uncertaintyExplainerRef.current = null
      }
      
      // Set ChatGPT API Key if provided
      if (settings.enableChatGPT && settings.chatGPTApiKey) {
        intelligenceEngineRef.current.setChatGPTApiKey(settings.chatGPTApiKey)
      }
      
      console.log("✅ [RUNTIME] Clara Intelligence + Dialog-Intelligenz erfolgreich initialisiert")
      
      // Vollständige System-Diagnose
      console.table({
        "Intelligence Engine": !!intelligenceEngineRef.current,
        "Emotion Scaler": !!emotionScalerRef.current,
        "scaleEmotion verfügbar": typeof emotionScalerRef.current?.scaleEmotion === 'function',
        "Uncertainty Explainer": !!uncertaintyExplainerRef.current,
        "explainUncertainty verfügbar": typeof uncertaintyExplainerRef.current?.explainUncertainty === 'function'
      })
      
    } catch (error) {
      console.error("❌ [RUNTIME] Kritischer Fehler bei Engine-Initialisierung:", error)
      console.error("❌ [RUNTIME] Error stack:", error.stack)
      
      // Fallback: Mindestens Intelligence Engine muss funktionieren
      if (!intelligenceEngineRef.current) {
        console.error("❌ [RUNTIME] KRITISCH: Intelligence Engine konnte nicht initialisiert werden!")
      }
    }
  }

  // Update ChatGPT Statistics with CRASH-PROTECTION
  const updateChatGPTStats = () => {
    try {
      if (
        intelligenceEngineRef.current &&
        typeof intelligenceEngineRef.current.getChatGPTUsageStats === 'function'
      ) {
        const stats = intelligenceEngineRef.current.getChatGPTUsageStats()
        setChatGPTStats(stats)
        console.log("✅ [Clara UI] ChatGPT Stats aktualisiert:", stats)
      } else {
        console.info("ℹ️ [Clara UI] getChatGPTUsageStats nicht verfügbar - Fallback aktiv")
        // Fallback: Dummy-Statistiken für UI-Stabilität
        setChatGPTStats({
          tokensUsed: 0,
          requests: 0,
          dailyUsage: 0,
          monthlyUsage: 0,
          lastUpdated: new Date().toISOString()
        })
      }
    } catch (error) {
      console.warn("⚠️ [Clara UI] ChatGPT Stats Fehler:", error.message)
      // Sichere Fallback-Statistiken
      setChatGPTStats({
        tokensUsed: 0,
        requests: 0,
        dailyUsage: 0,
        monthlyUsage: 0,
        lastUpdated: new Date().toISOString(),
        error: "Statistiken nicht verfügbar"
      })
    }
  }

  // Handle ChatGPT Settings Change
  const handleChatGPTSettingsChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    
    // Reinitialize engine if ChatGPT settings changed
    if (['enableChatGPT', 'chatGPTApiKey', 'chatGPTDailyLimit', 'chatGPTMonthlyLimit'].includes(key)) {
      setTimeout(() => {
        initializeIntelligenceEngine()
        updateChatGPTStats()
      }, 100)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return

    console.log("🔗 [Clara UI] handleSendMessage aufgerufen mit:", inputValue)
    console.log("🔗 [Clara UI] Engine verfügbar:", !!intelligenceEngineRef.current)

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsProcessing(true)
    setIsTyping(true)

    try {
      // Prüfe Engine-Verfügbarkeit
      if (!intelligenceEngineRef.current) {
        console.error("❌ [Clara UI] Intelligence Engine nicht verfügbar!")
        throw new Error("Intelligence Engine nicht initialisiert")
      }

      // Get current context
      const context = getCurrentContext()
      console.log("🔗 [Clara UI] Context:", context)
      
      // Process with Clara Intelligence Engine
      console.log("🔗 [Clara UI] Rufe processQuery auf...")
      let aiResponse = await intelligenceEngineRef.current.processQuery(inputValue, context)
      console.log("🔗 [Clara UI] processQuery Response:", aiResponse)
        // Apply Dialog Intelligence Processing with CRASH-PROTECTION
      let finalResponse = aiResponse
      
      try {
        if (emotionScalerRef.current && typeof emotionScalerRef.current.scaleEmotion === 'function') {
          console.log("🔗 [Clara UI] Anwenden EmotionScaler...")
          // Emotional scaling based on content and confidence
          const scaledText = emotionScalerRef.current.scaleEmotion(aiResponse.content, {
            originalQuery: inputValue,
            context: context,
            confidence: aiResponse.confidence
          })
          finalResponse = { ...aiResponse, content: scaledText }
          console.log("✅ [Clara UI] EmotionScaler erfolgreich angewendet")
        } else {
          console.info("ℹ️ [Clara UI] EmotionScaler nicht verfügbar - Fallback aktiv")
        }
      } catch (emotionError) {
        console.warn("⚠️ [Clara UI] EmotionScaler Fehler:", emotionError.message)
        console.warn("⚠️ [Clara UI] Verwende Original-Response")
      }
      
      try {
        if (uncertaintyExplainerRef.current && typeof uncertaintyExplainerRef.current.explainUncertainty === 'function') {
          console.log("🔗 [Clara UI] Anwenden UncertaintyExplainer...")
          // Uncertainty explanation for low confidence responses
          if (finalResponse.confidence < 0.8) {
            const explainedText = uncertaintyExplainerRef.current.explainUncertainty(finalResponse.content, {
              confidence: finalResponse.confidence,
              originalQuery: inputValue,
              context: context
            })
            finalResponse = { ...finalResponse, content: explainedText }
            console.log("✅ [Clara UI] UncertaintyExplainer erfolgreich angewendet")
          }
        } else {
          console.info("ℹ️ [Clara UI] UncertaintyExplainer nicht verfügbar - Fallback aktiv")
        }
      } catch (uncertaintyError) {
        console.warn("⚠️ [Clara UI] UncertaintyExplainer Fehler:", uncertaintyError.message)
        console.warn("⚠️ [Clara UI] Verwende bisherige Response")
      }
      
      // Create AI message with processed response
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: finalResponse.content || aiResponse.content || "Entschuldigung, ich konnte keine Antwort generieren.",
        timestamp: new Date(),
        confidence: finalResponse.confidence || aiResponse.confidence || 0.1,
        source: finalResponse.source || aiResponse.source || 'fallback',
        insights: finalResponse.insights || aiResponse.insights || [],
        actions: finalResponse.actions || aiResponse.actions || [],
        recommendations: finalResponse.recommendations || aiResponse.recommendations || []
      }
      
      console.log("✅ [Clara UI] Finale AI-Response:", {
        content: aiMessage.content.substring(0, 100) + "...",
        confidence: aiMessage.confidence,
        source: aiMessage.source,
        hasInsights: aiMessage.insights.length > 0
      })
      
      setMessages(prev => [...prev, aiMessage])
      
      // Update ChatGPT statistics after query
      updateChatGPTStats()
      
    } catch (error) {
      console.error('❌ [Clara UI] Error processing message:', error)
      console.error('❌ [Clara UI] Error stack:', error.stack)
      console.error('❌ [Clara UI] Engine state:', {
        engineAvailable: !!intelligenceEngineRef.current,
        emotionScalerAvailable: !!emotionScalerRef.current,
        uncertaintyExplainerAvailable: !!uncertaintyExplainerRef.current
      })
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Entschuldigung, ich hatte ein Problem beim Verarbeiten Ihrer Anfrage: ${error.message}. Bitte versuchen Sie es erneut.`,
        timestamp: new Date(),
        confidence: 0.1,
        error: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
      setIsTyping(false)
    }
  }

  const getCurrentContext = () => {
    return {
      currentPage: '/clara-ai',
      timestamp: new Date(),
      conversationLength: messages.length,
      recentMessages: messages.slice(-5),
      userPreferences: settings
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion)
  }

  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    
    // Reinitialize engine if core settings change
    if (['intelligenceLevel'].includes(key)) {
      initializeIntelligenceEngine()
    }
  }

  const loadConversation = (id) => {
    const conversation = conversationHistory.find(c => c.id === id)
    if (conversation) {
      const aiMessage = {
        id: Date.now(),
        type: 'ai',
        content: `Konversation "${conversation.title}" geladen. ${conversation.summary}`,
        timestamp: new Date(),
        confidence: 0.9
      }
      setMessages(prev => [...prev, aiMessage])
    }
    setActivePanel(null)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-emerald-600'
    if (confidence >= 0.8) return 'text-blue-600'
    if (confidence >= 0.6) return 'text-amber-600'
    return 'text-red-600'
  }

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.9) return 'Sehr sicher'
    if (confidence >= 0.8) return 'Sicher'
    if (confidence >= 0.6) return 'Mittel'
    return 'Unsicher'
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Clara Page Header - Modern & Clean */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-slate-200/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              Clara KI-Assistent
            </h1>
            <p className="text-slate-600 mt-1">
              Intelligente Immobilienverwaltung
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              Online
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Chat Interface - Modern Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 min-h-0">
        {/* Chat Messages - Clean Design */}
        <Card className={cn("lg:col-span-3 flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm", activePanel && "lg:col-span-2")}>
          <CardHeader className="flex-shrink-0 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Chat
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => togglePanel('history')}
                  className={cn("hover:bg-slate-100", activePanel === 'history' && "bg-slate-100")}
                >
                  <History className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => togglePanel('settings')}
                  className={cn("hover:bg-slate-100", activePanel === 'settings' && "bg-slate-100")}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0 p-0">
            {/* Chat Messages Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed break-words">{message.content}</div>
                        
                        {/* AI Message Confidence */}
                        {message.type === 'ai' && message.confidence && (
                          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                            <span className="text-xs text-slate-500">Vertrauen:</span>
                            <Badge variant="outline" className={cn("text-xs", getConfidenceColor(message.confidence))}>
                              {Math.round(message.confidence * 100)}%
                            </Badge>
                          </div>
                        )}
                        
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-200' : 'text-slate-400'
                        }`}>
                          {message.timestamp.toLocaleTimeString('de-DE', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-slate-600">Clara tippt...</span>
                      </div>
                    </div>
                  </div>
                )}
                {messages.length > 1 && <div ref={messagesEndRef} />}
              </div>
            </ScrollArea>

            {/* Input Area - Modern Design */}
            <div className="flex-shrink-0 p-6 border-t border-slate-100 bg-slate-50/50">
              <div className="flex gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nachricht an Clara..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                  disabled={isProcessing}
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon"
                  disabled={!inputValue.trim() || isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              {/* Processing Indicator */}
              {isProcessing && (
                <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span>Clara verarbeitet Ihre Anfrage...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Intelligent Suggestions - Modern Design */}
        {!activePanel && (
          <Card className="lg:col-span-1 flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex-shrink-0 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Vorschläge
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-4">
              <div className="space-y-4 flex-1">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intelligentSuggestions.map((category) => (
                      <SelectItem key={category.category} value={category.category}>
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <ScrollArea className="flex-1">
                  <div className="grid gap-3">
                    {intelligentSuggestions
                      .find(cat => cat.category === selectedCategory)
                      ?.suggestions.map((suggestion, index) => {
                        const category = intelligentSuggestions.find(cat => cat.category === selectedCategory)
                        const IconComponent = category?.icon || Lightbulb
                        return (
                          <Card
                            key={index}
                            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/50"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                                  <IconComponent className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800 leading-relaxed break-words">
                                    {suggestion}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Side Panels - Modern Design */}
        {activePanel && (
          <Card className="lg:col-span-1 flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="flex-shrink-0 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-slate-800">
                  {activePanel === 'settings' ? 'Einstellungen' : 'Verlauf'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setActivePanel(null)} className="hover:bg-slate-100 rounded-lg">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-4">
              {activePanel === 'settings' ? (
                <ScrollArea className="flex-1">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="intelligenceLevel" className="text-sm font-medium text-slate-700">KI-Level</Label>
                      <Select 
                        value={settings.intelligenceLevel} 
                        onValueChange={(value) => updateSettings('intelligenceLevel', value)}
                      >
                        <SelectTrigger id="intelligenceLevel" className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="advanced">Erweitert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* ChatGPT Integration Settings */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="enableChatGPT" className="text-sm font-medium text-slate-700">ChatGPT Integration</Label>
                        <Switch
                          id="enableChatGPT"
                          checked={settings.enableChatGPT}
                          onCheckedChange={(checked) => handleChatGPTSettingsChange('enableChatGPT', checked)}
                        />
                      </div>
                      
                      {settings.enableChatGPT && (
                        <div className="space-y-4 pl-4 border-l-2 border-blue-100">
                          <div className="space-y-2">
                            <Label htmlFor="chatGPTApiKey" className="text-sm font-medium text-slate-700">OpenAI API Key</Label>
                            <Input
                              id="chatGPTApiKey"
                              type="password"
                              placeholder="sk-proj-..."
                              value={settings.chatGPTApiKey}
                              onChange={(e) => handleChatGPTSettingsChange('chatGPTApiKey', e.target.value)}
                              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                            />
                            <p className="text-xs text-slate-500">
                              Benötigt separaten OpenAI API Account (nicht ChatGPT Pro)
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="chatGPTDailyLimit" className="text-sm font-medium text-slate-700">Tägliches Limit</Label>
                              <Input
                                id="chatGPTDailyLimit"
                                type="number"
                                value={settings.chatGPTDailyLimit}
                                onChange={(e) => handleChatGPTSettingsChange('chatGPTDailyLimit', parseInt(e.target.value))}
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="chatGPTMonthlyLimit" className="text-sm font-medium text-slate-700">Monatliches Limit</Label>
                              <Input
                                id="chatGPTMonthlyLimit"
                                type="number"
                                value={settings.chatGPTMonthlyLimit}
                                onChange={(e) => handleChatGPTSettingsChange('chatGPTMonthlyLimit', parseInt(e.target.value))}
                                className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                              />
                            </div>
                          </div>

                          {/* Usage Statistics */}
                          {chatGPTStats.enabled && (
                            <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
                              <h4 className="text-sm font-medium text-slate-700">Nutzungsstatistiken</h4>
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <div className="text-slate-500">Heute</div>
                                  <div className="font-medium">{chatGPTStats.dailyUsage}/{chatGPTStats.dailyLimit}</div>
                                  <Progress value={(chatGPTStats.dailyUsage / chatGPTStats.dailyLimit) * 100} className="h-1 mt-1" />
                                </div>
                                <div>
                                  <div className="text-slate-500">Monat</div>
                                  <div className="font-medium">{chatGPTStats.monthlyUsage}/{chatGPTStats.monthlyLimit}</div>
                                  <Progress value={(chatGPTStats.monthlyUsage / chatGPTStats.monthlyLimit) * 100} className="h-1 mt-1" />
                                </div>
                              </div>
                              <div className="text-xs text-slate-600">
                                Gesamtkosten: <span className="font-medium">€{chatGPTStats.totalCost?.toFixed(4) || '0.0000'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              ) : (
                <ScrollArea className="flex-1">
                  <div className="space-y-3">
                    {conversationHistory.map((conversation) => (
                      <Button
                        key={conversation.id}
                        variant="ghost"
                        className="w-full text-left h-auto p-3 justify-start hover:bg-blue-50 transition-colors rounded-lg border border-transparent hover:border-blue-200"
                        onClick={() => loadConversation(conversation.id)}
                      >
                        <div className="text-left space-y-1">
                          <div className="font-medium text-sm text-slate-800">{conversation.title}</div>
                          <div className="text-xs text-slate-500 leading-relaxed">{conversation.summary}</div>
                          <div className="text-xs text-slate-400">
                            {formatDate(conversation.date)}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

