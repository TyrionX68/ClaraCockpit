/**
 * ClaraAIProvider.jsx
 * React Context Provider for Clara360 AI Integration - Phase 2
 * Integrates ClaraDialogContext, ConversationMemoryManager, and ProactiveInsightsEngine
 * 
 * Author: Manus A
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import ClaraDialogContext from '../lib/ClaraDialogContext';
import ConversationMemoryManager from '../lib/ConversationMemoryManager';
import ProactiveInsightsEngine from '../lib/ProactiveInsightsEngine';

// AI Context
const ClaraAIContext = createContext();

// AI State Reducer
const aiReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_CONVERSATION':
      return { 
        ...state, 
        conversations: [...state.conversations, action.payload],
        loading: false 
      };
    case 'SET_INSIGHTS':
      return { ...state, insights: action.payload };
    case 'SET_CONTEXT':
      return { ...state, currentContext: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Initial AI State
const initialState = {
  loading: false,
  error: null,
  conversations: [],
  insights: [],
  currentContext: null,
  isInitialized: false
};

/**
 * Clara AI Provider Component
 * Provides AI capabilities to the entire Clara360 application
 */
export function ClaraAIProvider({ children }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  
  // AI Engine Instances
  const [dialogContext] = React.useState(() => new ClaraDialogContext({
    enableTopicTracking: true,
    enableImplicitReferences: true,
    maxTopicAge: 10 * 60 * 1000 // 10 minutes
  }));
  
  const [memoryManager] = React.useState(() => new ConversationMemoryManager({
    maxConversationLength: 20,
    maxConversationAge: 60 * 60 * 1000 // 1 hour
  }));
  
  const [insightsEngine] = React.useState(() => new ProactiveInsightsEngine({
    insightThresholds: {
      cashFlow: { critical: -1000, warning: 0 },
      expenseRatio: { critical: 70, warning: 50 },
      occupancyRate: { critical: 85, warning: 95 }
    }
  }));

  // Initialize AI Systems
  useEffect(() => {
    const initializeAI = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Initialize AI components
        await Promise.all([
          dialogContext.initialize?.(),
          memoryManager.initialize?.(),
          insightsEngine.initialize?.()
        ]);
        
        dispatch({ type: 'SET_LOADING', payload: false });
        console.log('🧠 Clara AI Systems initialized successfully');
      } catch (error) {
        console.error('❌ Clara AI initialization failed:', error);
        dispatch({ type: 'SET_ERROR', payload: 'AI-Systeme konnten nicht initialisiert werden' });
      }
    };

    initializeAI();
  }, [dialogContext, memoryManager, insightsEngine]);

  // Process User Query with AI
  const processQuery = useCallback(async (query, context = {}) => {
    if (!query?.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Leere Anfrage' });
      return null;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Process query through dialog context
      const enhancedContext = dialogContext.processQuery({
        query,
        entities: context.entities || [],
        intentType: context.intentType || 'general',
        confidence: context.confidence || 1.0,
        additionalContext: context
      });

      // Generate AI response (mock for now - can be replaced with actual AI service)
      const response = await generateAIResponse(query, enhancedContext);

      // Add to conversation memory
      const exchange = memoryManager.addExchange({
        query,
        response: response.text,
        context: enhancedContext,
        entities: context.entities || []
      });

      // Add to state
      dispatch({ 
        type: 'ADD_CONVERSATION', 
        payload: {
          id: exchange.id,
          query,
          response: response.text,
          timestamp: new Date().toISOString(),
          context: enhancedContext
        }
      });

      return response;
    } catch (error) {
      console.error('❌ Query processing failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Anfrage konnte nicht verarbeitet werden' });
      return null;
    }
  }, [dialogContext, memoryManager]);

  // Generate Proactive Insights
  const generateInsights = useCallback(async (financialData, propertyData) => {
    try {
      const insights = insightsEngine.analyzeFinancialData(financialData, propertyData);
      dispatch({ type: 'SET_INSIGHTS', payload: insights });
      return insights;
    } catch (error) {
      console.error('❌ Insights generation failed:', error);
      return [];
    }
  }, [insightsEngine]);

  // Mock AI Response Generator (replace with actual AI service)
  const generateAIResponse = async (query, context) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple pattern matching for demo
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('miete') || lowerQuery.includes('einnahmen')) {
      return {
        text: `Basierend auf den aktuellen Daten beträgt die monatliche Miete 8.360€ bei einer Auslastung von 100%. Die Jahresrendite liegt bei 8,4% über dem Marktdurchschnitt.`,
        confidence: 0.9,
        type: 'financial_info'
      };
    }
    
    if (lowerQuery.includes('rückstand') || lowerQuery.includes('zahlung')) {
      return {
        text: `Aktuell gibt es 1 Mieter mit Rückständen (1. OG rechts - 2 Monate, 1.200€). Ich empfehle eine zeitnahe Kontaktaufnahme zur Klärung der Zahlungsmodalitäten.`,
        confidence: 0.85,
        type: 'payment_info'
      };
    }
    
    if (lowerQuery.includes('wartung') || lowerQuery.includes('reparatur')) {
      return {
        text: `Die Wartungskosten liegen aktuell bei 1.200€ monatlich. Anstehende Aufgaben: Treppenhaus-Reinigung (280€), Wasserboiler-Reparatur (720€), Grundsteuer 2024 (880€).`,
        confidence: 0.8,
        type: 'maintenance_info'
      };
    }

    return {
      text: `Ich verstehe Ihre Anfrage zu "${query}". Für detaillierte Informationen zu Ihrer Hausverwaltung kann ich Ihnen mit Finanzen, Mietern, Wartung und Objektverwaltung helfen.`,
      confidence: 0.6,
      type: 'general_response'
    };
  };

  // Context Value
  const contextValue = {
    // State
    ...state,
    
    // AI Engines
    dialogContext,
    memoryManager,
    insightsEngine,
    
    // Methods
    processQuery,
    generateInsights,
    
    // Utilities
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
    setContext: (context) => dispatch({ type: 'SET_CONTEXT', payload: context })
  };

  return (
    <ClaraAIContext.Provider value={contextValue}>
      {children}
    </ClaraAIContext.Provider>
  );
}

/**
 * Hook to use Clara AI Context
 */
export function useClaraAI() {
  const context = useContext(ClaraAIContext);
  if (!context) {
    throw new Error('useClaraAI must be used within a ClaraAIProvider');
  }
  return context;
}

/**
 * Hook for Financial AI Insights
 */
export function useFinancialInsights(financialData, propertyData) {
  const { generateInsights, insights } = useClaraAI();
  
  useEffect(() => {
    if (financialData && propertyData) {
      generateInsights(financialData, propertyData);
    }
  }, [financialData, propertyData, generateInsights]);
  
  return insights;
}

/**
 * Hook for AI Chat Interface
 */
export function useClaraChat() {
  const { processQuery, conversations, loading, error } = useClaraAI();
  
  const sendMessage = useCallback(async (message, context) => {
    return await processQuery(message, context);
  }, [processQuery]);
  
  return {
    sendMessage,
    conversations,
    loading,
    error
  };
}

export default ClaraAIProvider;

