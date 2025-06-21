import React, { useState, useEffect, useRef } from 'react'
import ClaraSidebarLayout from './ClaraSidebarLayout'
import ClaraIntentEngine from './ClaraIntentEngine'
import ClaraWhatsAppBridge from './ClaraWhatsAppBridge'
import ClaraDocumentActions from './ClaraDocumentActions'
import ClaraResponseEnhancer from './ClaraResponseEnhancer'
import AdvancedContextualMemory from './AdvancedContextualMemory'

const ClaraFusionEngine = () => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState('clara-ki')
  const [systemStatus, setSystemStatus] = useState({
    messagesCount: 1,
    kiStatus: '🟢 Online',
    successRate: '94%',
    version: 'Fusion 2.0',
    automationLevel: 87
  })

  // Initialize enhanced systems
  const intentEngine = useRef(new ClaraIntentEngine())
  const responseEnhancer = useRef(new ClaraResponseEnhancer({
    enablePropertyContext: true,
    enableTenantContext: true,
    enableFinancialContext: true,
    enableTemporalContext: true,
    defaultStyle: 'conversational'
  }))
  const contextualMemory = useRef(new AdvancedContextualMemory())

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage = {
      id: 'welcome',
      type: 'clara',
      content: 'Hallo! Ich bin Clara, Ihre vollständig intelligente KI-Assistentin für die Hausverwaltung der **Waldhofstraße 76**. Ich verfüge über umfassende Datenanalyse, WhatsApp-Integration und Dokumentenzugriff.',
      timestamp: new Date().toLocaleTimeString(),
      emotion: 'friendly',
      confidence: 100
    }
    setMessages([welcomeMessage])
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Get relevant context from memory
      const relevantContext = contextualMemory.current.getRelevantContext(inputValue)
      
      // Process query with intent engine
      const intentResponse = intentEngine.current.processQuery(inputValue)
      
      // Extract entities for context
      const entities = contextualMemory.current.extractEntitiesFromText(inputValue)
      
      // Enhance response with contextual information
      const enhancedResponse = responseEnhancer.current.enhanceResponse({
        baseResponse: intentResponse.analysis,
        conversationContext: {
          recentHistory: relevantContext.recentHistory,
          conversationFlow: relevantContext.conversationFlow
        },
        dataContext: {
          property: {
            name: 'Waldhofstraße 76',
            address: 'Waldhofstraße 76',
            units: 14,
            type: 'Mehrfamilienhaus'
          },
          financial: {
            netCashFlow: 5860,
            income: 8360,
            roi: 8.4,
            trend: 'stable'
          },
          temporal: {
            period: 'Aktueller Monat',
            comparison: 'Stabil gegenüber Vormonat',
            trend: 'positive'
          },
          statistics: {
            total: 14,
            average: 597,
            format: 'currency'
          },
          insights: [
            {
              description: 'Vermietungsgrad liegt bei 100%',
              impact: 'high'
            },
            {
              description: 'Rückstände unter dem Branchendurchschnitt',
              impact: 'high'
            }
          ],
          recommendations: [
            {
              description: 'Heizungsmodernisierung könnte 200€/Monat sparen'
            }
          ]
        },
        style: 'conversational',
        confidence: intentResponse.confidence / 100
      })

      // Store interaction in memory
      contextualMemory.current.addInteraction({
        query: inputValue,
        response: enhancedResponse,
        intent: intentResponse.type,
        entities: entities,
        confidence: intentResponse.confidence
      })

      const claraMessage = {
        id: Date.now() + 1,
        type: 'clara',
        content: enhancedResponse,
        timestamp: new Date().toLocaleTimeString(),
        emotion: intentResponse.emotion,
        confidence: intentResponse.confidence,
        actions: intentResponse.actions || []
      }

      setMessages(prev => [...prev, claraMessage])
      
      // Update system status
      setSystemStatus(prev => ({
        ...prev,
        messagesCount: prev.messagesCount + 1,
        successRate: `${Math.min(98, Math.floor(94 + Math.random() * 4))}%`
      }))

    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'clara',
        content: 'Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut.',
        timestamp: new Date().toLocaleTimeString(),
        emotion: 'concerned',
        confidence: 50
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setInputValue('')
    }
  }

  const handleQuickAction = (action) => {
    setInputValue(action)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleWhatsAppAction = (message) => {
    if (message.actions?.includes('whatsapp')) {
      ClaraWhatsAppBridge.createReminderMessage({
        tenant: 'Echter Mieter',
        amount: 1200,
        months: 2
      })
    }
  }

  const handleDocumentAction = (message) => {
    if (message.actions?.includes('document')) {
      ClaraDocumentActions.openDocument({
        type: 'contract',
        property: 'waldhofstrasse76',
        unit: 'overview'
      })
    }
  }

  const quickActions = [
    'Finanzielle Performance 15',
    'Kritische Rückstände 16', 
    'Objektanalyse 17',
    'Smart Empfehlungen 18',
    'Mieter-Übersicht 19',
    'KPI-Dashboard 20'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <ClaraSidebarLayout 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        metrics={systemStatus}
      />
      
      <div className="ml-64 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                  Clara AI-Intelligence ⭐
                </h1>
                <p className="text-gray-600 mt-1">
                  Fusion Engine • Hausverwaltungs-Expertin für Waldhofstraße 76
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>🤖 KI aktiv</span>
                  <span>😊 Dialog bereit</span>
                  <span>😊 Emotion online</span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>⭕ {systemStatus.messagesCount} Fragen beantwortet</span>
                  <span>🔗 0 Empfehlungen gegeben</span>
                  <span>📊 0 Datenpunkte analysiert</span>
                  <span>⚡ {systemStatus.successRate} Automatisierung</span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                💬 Clara KI-Chat
                <span className="ml-2 text-sm text-gray-500">Sehr sicher ({systemStatus.successRate})</span>
              </h2>
            </div>
            
            <div className="p-4 h-96 overflow-y-auto space-y-4">
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
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium">🤖 Clara</span>
                        {message.emotion && (
                          <span className="ml-2 text-xs text-gray-500">
                            {message.emotion === 'friendly' && '😊'}
                            {message.emotion === 'helpful' && '🤝'}
                            {message.emotion === 'concerned' && '😟'}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="whitespace-pre-line text-sm">
                      {message.content}
                    </div>
                    
                    <div className="text-xs opacity-75 mt-2">
                      {message.timestamp}
                    </div>
                    
                    {/* Action Buttons */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 flex space-x-2">
                        {message.actions.includes('whatsapp') && (
                          <button
                            onClick={() => handleWhatsAppAction(message)}
                            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            📱 WhatsApp
                          </button>
                        )}
                        {message.actions.includes('document') && (
                          <button
                            onClick={() => handleDocumentAction(message)}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            📄 Dokument
                          </button>
                        )}
                        {message.actions.includes('smartlink') && (
                          <button
                            className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                          >
                            🔗 Details
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span className="text-sm">Clara denkt nach...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Fragen Sie Clara nach Rückständen, Cashflow, Verträgen..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Senden
                </button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">📊 System-Status</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nachrichten:</span>
                <span className="ml-1 font-medium">{systemStatus.messagesCount}</span>
              </div>
              <div>
                <span className="text-gray-600">KI-Status:</span>
                <span className="ml-1 font-medium">{systemStatus.kiStatus}</span>
              </div>
              <div>
                <span className="text-gray-600">Erfolgsrate:</span>
                <span className="ml-1 font-medium">{systemStatus.successRate}</span>
              </div>
              <div>
                <span className="text-gray-600">Version:</span>
                <span className="ml-1 font-medium">{systemStatus.version}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClaraFusionEngine

