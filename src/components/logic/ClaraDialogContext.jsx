import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ConversationMemoryManager - Utility class for managing conversation memory
 * Simplified version for React integration
 */
class ConversationMemoryManager {
  constructor(options = {}) {
    this.maxExchanges = options.maxExchanges || 10;
    this.exchanges = [];
    this.activeContext = {};
  }

  addExchange({ query, response, context = {}, entities = [], intentType = 'unknown', confidence = 1.0 }) {
    const exchange = {
      id: Date.now() + Math.random(),
      query,
      response,
      context,
      entities,
      intentType,
      confidence,
      timestamp: Date.now()
    };

    this.exchanges.unshift(exchange);
    
    // Limit exchanges
    if (this.exchanges.length > this.maxExchanges) {
      this.exchanges = this.exchanges.slice(0, this.maxExchanges);
    }

    return exchange;
  }

  getConversationHistory(limit = null) {
    return limit ? this.exchanges.slice(0, limit) : [...this.exchanges];
  }

  isFollowUpQuestion(query) {
    const followUpPatterns = [
      /^und /i,
      /^aber /i,
      /^wie /i,
      /^was /i,
      /^wo /i,
      /^wann /i,
      /^warum /i,
      /^davon /i,
      /^dazu /i,
      /^außerdem /i,
      /^auch /i
    ];

    return followUpPatterns.some(pattern => pattern.test(query.trim()));
  }

  resolveReferences(query) {
    const pronouns = ['das', 'die', 'der', 'es', 'sie', 'er', 'diese', 'dieser', 'dieses'];
    let resolvedQuery = query;
    const referencedEntities = [];

    // Simple reference resolution
    if (this.exchanges.length > 0 && pronouns.some(pronoun => query.toLowerCase().includes(pronoun))) {
      const lastExchange = this.exchanges[0];
      if (lastExchange.entities && lastExchange.entities.length > 0) {
        referencedEntities.push(...lastExchange.entities);
      }
    }

    return { resolvedQuery, referencedEntities };
  }

  detectContextSwitch(query, currentContext) {
    if (!currentContext || !this.exchanges.length) return false;

    const contextKeywords = {
      dashboard: ['dashboard', 'übersicht', 'kpis'],
      finance: ['cashflow', 'rendite', 'finanzen', 'geld'],
      tenants: ['mieter', 'rückstände', 'verträge'],
      maintenance: ['wartung', 'reparatur', 'instandhaltung']
    };

    const queryLower = query.toLowerCase();
    const currentTopic = currentContext.currentTopic;

    for (const [topic, keywords] of Object.entries(contextKeywords)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        return topic !== currentTopic;
      }
    }

    return false;
  }

  getFollowUpContext(query) {
    if (this.exchanges.length === 0) return {};

    const lastExchange = this.exchanges[0];
    return {
      ...lastExchange.context,
      previousQuery: lastExchange.query,
      previousResponse: lastExchange.response,
      isFollowUp: true
    };
  }

  getActiveContext() {
    return { ...this.activeContext };
  }

  setActiveContext(context) {
    this.activeContext = { ...context };
  }

  clearConversationHistory() {
    this.exchanges = [];
    this.activeContext = {};
  }
}

/**
 * ClaraDialogContext - React Component
 * Manages dialog coherence and context memory for Clara
 * 
 * Converted from JavaScript class to React component for Clara V6 integration
 */
const ClaraDialogContext = ({ 
  options = {},
  onContextUpdate,
  children 
}) => {
  // Configuration state
  const [config] = useState({
    maxReferenceDistance: options.maxReferenceDistance || 3,
    enableExplicitCallbacks: options.enableExplicitCallbacks !== false,
    enableImplicitReferences: options.enableImplicitReferences !== false,
    enableTopicTracking: options.enableTopicTracking !== false,
    maxTopicAge: options.maxTopicAge || 5 * 60 * 1000, // 5 minutes
    ...options
  });

  // State management
  const [currentTopic, setCurrentTopic] = useState(null);
  const [topicHistory, setTopicHistory] = useState([]);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  
  // Memory manager instance
  const memoryManagerRef = useRef(new ConversationMemoryManager(options.memoryOptions || {}));

  // Process a new user query and update dialog context
  const processQuery = useCallback(({
    query,
    entities = [],
    intentType = 'unknown',
    confidence = 1.0,
    additionalContext = {}
  }) => {
    if (!query) {
      return { 
        isFollowUp: false,
        resolvedQuery: '',
        context: memoryManagerRef.current.getActiveContext() || {}
      };
    }

    const memoryManager = memoryManagerRef.current;
    
    // Check if this is a follow-up question
    const isFollowUp = memoryManager.isFollowUpQuestion(query);
    
    // Resolve references in query
    const { resolvedQuery, referencedEntities } = memoryManager.resolveReferences(query);
    
    // Check for context switch
    const isContextSwitch = memoryManager.detectContextSwitch(query, memoryManager.getActiveContext());
    
    // Update topic tracking
    updateTopicTracking(query, intentType, entities);
    
    // Get appropriate context
    let context = isFollowUp 
      ? memoryManager.getFollowUpContext(query)
      : memoryManager.getActiveContext() || {};
    
    // Merge with additional context
    context = {
      ...context,
      ...additionalContext,
      currentTopic,
      isFollowUp,
      isContextSwitch,
      referencedEntities,
      pendingQuestions: [...pendingQuestions]
    };
    
    // Set active context
    memoryManager.setActiveContext(context);
    
    // Notify parent component
    if (onContextUpdate) {
      onContextUpdate({
        isFollowUp,
        resolvedQuery,
        context,
        referencedEntities
      });
    }
    
    return {
      isFollowUp,
      resolvedQuery,
      context,
      referencedEntities
    };
  }, [currentTopic, pendingQuestions, onContextUpdate]);

  // Record a response and update dialog context
  const recordResponse = useCallback(({
    query,
    response,
    context = {},
    entities = [],
    intentType = 'unknown',
    confidence = 1.0,
    containsQuestion = false
  }) => {
    const memoryManager = memoryManagerRef.current;
    
    // Add exchange to conversation history
    const exchange = memoryManager.addExchange({
      query,
      response,
      context,
      entities,
      intentType,
      confidence
    });
    
    // Update pending questions if response contains a question
    if (containsQuestion) {
      const question = extractQuestion(response);
      if (question) {
        setPendingQuestions(prev => [
          ...prev.slice(-2), // Keep only last 2 questions
          {
            question,
            exchangeId: exchange.id,
            timestamp: exchange.timestamp
          }
        ]);
      }
    }
    
    // Return updated context
    const updatedContext = memoryManager.getActiveContext();
    
    if (onContextUpdate) {
      onContextUpdate({ context: updatedContext });
    }
    
    return updatedContext;
  }, [onContextUpdate]);

  // Extract question from response
  const extractQuestion = useCallback((response) => {
    if (!response) return '';
    
    // Simple extraction of last sentence if it ends with question mark
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const lastSentence = sentences[sentences.length - 1];
    
    if (lastSentence && lastSentence.trim().endsWith('?')) {
      return lastSentence.trim();
    }
    
    // Check for question patterns
    const questionPatterns = [
      /möchtest du .+\?/i,
      /willst du .+\?/i,
      /soll ich .+\?/i,
      /kannst du .+\?/i,
      /hast du .+\?/i,
      /wäre .+ hilfreich\?/i
    ];
    
    for (const pattern of questionPatterns) {
      const match = response.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return '';
  }, []);

  // Update topic tracking
  const updateTopicTracking = useCallback((query, intentType, entities) => {
    if (!config.enableTopicTracking) return;
    
    const now = Date.now();
    
    // Check if current topic has expired
    if (currentTopic && (now - lastUpdateTime > config.maxTopicAge)) {
      // Add to history before changing
      setTopicHistory(prev => [
        ...prev.slice(-9), // Keep last 9 topics
        {
          topic: currentTopic,
          startTime: lastUpdateTime,
          endTime: now
        }
      ]);
      
      // Reset current topic
      setCurrentTopic(null);
    }
    
    // Determine new topic if needed
    if (!currentTopic) {
      const newTopic = determineTopicFromQuery(query, intentType, entities);
      setCurrentTopic(newTopic);
      setLastUpdateTime(now);
    } else {
      // Check if query indicates topic change
      const newTopic = determineTopicFromQuery(query, intentType, entities);
      
      if (newTopic && newTopic !== currentTopic) {
        // Add current topic to history
        setTopicHistory(prev => [
          ...prev.slice(-9),
          {
            topic: currentTopic,
            startTime: lastUpdateTime,
            endTime: now
          }
        ]);
        
        // Set new topic
        setCurrentTopic(newTopic);
        setLastUpdateTime(now);
      } else {
        // Update last update time
        setLastUpdateTime(now);
      }
    }
  }, [currentTopic, lastUpdateTime, config.enableTopicTracking, config.maxTopicAge]);

  // Determine topic from query
  const determineTopicFromQuery = useCallback((query, intentType, entities) => {
    // Use intent type as base topic
    let topic = intentType;
    
    // Enhance with primary entity if available
    if (entities && entities.length > 0) {
      const primaryEntity = entities[0];
      topic = `${topic}_${primaryEntity.type}`;
      
      // Add entity value for specific entities
      if (['property', 'tenant', 'contract'].includes(primaryEntity.type)) {
        topic = `${topic}_${primaryEntity.value}`;
      }
    }
    
    return topic;
  }, []);

  // Generate a callback reference to previous dialog
  const generateCallbackReference = useCallback(({
    currentQuery,
    currentContext
  }) => {
    if (!config.enableExplicitCallbacks) return null;
    
    // Get conversation history
    const history = memoryManagerRef.current.getConversationHistory(config.maxReferenceDistance);
    
    // No history to reference
    if (history.length <= 1) return null;
    
    // Skip most recent exchange (current one)
    const relevantHistory = history.slice(1);
    
    // Find a relevant previous exchange to reference
    for (const exchange of relevantHistory) {
      // Check if previous exchange had a question that wasn't answered
      if (containsQuestion(exchange.response) && !isAnsweredBy(exchange.response, currentQuery)) {
        return formatCallbackReference(exchange);
      }
      
      // Check if current query is related to previous exchange
      if (areRelated(exchange, currentQuery, currentContext)) {
        return formatCallbackReference(exchange);
      }
    }
    
    return null;
  }, [config.enableExplicitCallbacks, config.maxReferenceDistance]);

  // Helper functions for callback generation
  const containsQuestion = useCallback((response) => {
    return response && response.includes('?');
  }, []);

  const isAnsweredBy = useCallback((response, query) => {
    if (!response || !query) return false;
    
    const question = extractQuestion(response);
    if (!question) return false;
    
    // Simple yes/no answer detection
    const yesPatterns = [/^ja\b/i, /^yes\b/i, /^stimmt\b/i, /^genau\b/i, /^korrekt\b/i];
    const noPatterns = [/^nein\b/i, /^no\b/i, /^nicht\b/i, /^falsch\b/i];
    
    for (const pattern of [...yesPatterns, ...noPatterns]) {
      if (pattern.test(query.trim())) {
        return true;
      }
    }
    
    return false;
  }, [extractQuestion]);

  const areRelated = useCallback((exchange, query, context) => {
    if (!exchange || !query) return false;
    
    // Check for shared entities
    if (exchange.entities && exchange.entities.length > 0) {
      for (const entity of exchange.entities) {
        if (query.toLowerCase().includes(entity.value.toLowerCase())) {
          return true;
        }
      }
    }
    
    // Check for topic continuity
    if (exchange.context && exchange.context.currentTopic && 
        context && context.currentTopic && 
        exchange.context.currentTopic === context.currentTopic) {
      return true;
    }
    
    return false;
  }, []);

  const formatCallbackReference = useCallback((exchange) => {
    if (!exchange) return null;
    
    // Different reference formats
    const referenceFormats = [
      `Du hattest mich nach ${extractTopicFromExchange(exchange)} gefragt`,
      `Bezüglich deiner Frage zu ${extractTopicFromExchange(exchange)}`,
      `Um auf deine frühere Frage zurückzukommen`
    ];
    
    // Select random format
    const format = referenceFormats[Math.floor(Math.random() * referenceFormats.length)];
    
    return format;
  }, []);

  const extractTopicFromExchange = useCallback((exchange) => {
    if (!exchange) return 'diesem Thema';
    
    // Try to extract from entities
    if (exchange.entities && exchange.entities.length > 0) {
      const primaryEntity = exchange.entities[0];
      return primaryEntity.value || 'diesem Thema';
    }
    
    // Try to extract from context
    if (exchange.context && exchange.context.currentTopic) {
      return exchange.context.currentTopic.replace(/_/g, ' ') || 'diesem Thema';
    }
    
    // Default
    return 'diesem Thema';
  }, []);

  // Clear conversation history
  const clearConversationHistory = useCallback(() => {
    memoryManagerRef.current.clearConversationHistory();
    setCurrentTopic(null);
    setTopicHistory([]);
    setPendingQuestions([]);
    setLastUpdateTime(Date.now());
  }, []);

  // Get conversation history
  const getConversationHistory = useCallback((limit = null) => {
    return memoryManagerRef.current.getConversationHistory(limit);
  }, []);

  // Get active context
  const getActiveContext = useCallback(() => {
    return memoryManagerRef.current.getActiveContext();
  }, []);

  // Set active context
  const setActiveContext = useCallback((context) => {
    memoryManagerRef.current.setActiveContext(context);
  }, []);

  // Expose functions via callback
  useEffect(() => {
    if (onContextUpdate && typeof onContextUpdate === 'function') {
      onContextUpdate({
        processQuery,
        recordResponse,
        generateCallbackReference,
        clearConversationHistory,
        getConversationHistory,
        getActiveContext,
        setActiveContext,
        currentTopic,
        topicHistory,
        pendingQuestions,
        config
      });
    }
  }, [
    processQuery, 
    recordResponse, 
    generateCallbackReference, 
    clearConversationHistory, 
    getConversationHistory, 
    getActiveContext, 
    setActiveContext,
    currentTopic, 
    topicHistory, 
    pendingQuestions, 
    config, 
    onContextUpdate
  ]);

  // Render component (can be used as a provider or utility component)
  return (
    <div className="clara-dialog-context" data-component="ClaraDialogContext">
      {children}
    </div>
  );
};

export default ClaraDialogContext;

