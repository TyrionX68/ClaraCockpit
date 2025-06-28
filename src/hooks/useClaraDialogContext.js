import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * React Hook for Clara Dialog Context Management
 * Provides dialog coherence and context memory capabilities
 */
export const useClaraDialogContext = (options = {}) => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [isFollowUp, setIsFollowUp] = useState(false);
  
  // Configuration
  const config = {
    maxReferenceDistance: 3,
    enableExplicitCallbacks: true,
    enableImplicitReferences: true,
    enableTopicTracking: true,
    maxTopicAge: 5 * 60 * 1000, // 5 minutes
    maxHistorySize: 20,
    ...options
  };
  
  // Refs for persistent data
  const topicHistoryRef = useRef([]);
  const lastUpdateTimeRef = useRef(Date.now());
  const activeContextRef = useRef({});
  
  /**
   * Process a new user query and update dialog context
   */
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
        context: activeContextRef.current
      };
    }
    
    // Check if this is a follow-up question
    const isFollowUpQuery = checkIsFollowUp(query);
    setIsFollowUp(isFollowUpQuery);
    
    // Resolve references in query
    const { resolvedQuery, referencedEntities } = resolveReferences(query);
    
    // Update topic tracking
    updateTopicTracking(query, intentType, entities);
    
    // Get appropriate context
    let context = isFollowUpQuery 
      ? getFollowUpContext(query)
      : activeContextRef.current;
    
    // Merge with additional context
    context = {
      ...context,
      ...additionalContext,
      currentTopic,
      isFollowUp: isFollowUpQuery,
      referencedEntities,
      pendingQuestions: [...pendingQuestions],
      timestamp: Date.now()
    };
    
    // Set active context
    activeContextRef.current = context;
    
    return {
      isFollowUp: isFollowUpQuery,
      resolvedQuery,
      context,
      referencedEntities
    };
  }, [currentTopic, pendingQuestions]);
  
  /**
   * Record a response and update dialog context
   */
  const recordResponse = useCallback(({
    query,
    response,
    context = {},
    entities = [],
    intentType = 'unknown',
    confidence = 1.0,
    containsQuestion = false
  }) => {
    const exchange = {
      id: `exchange_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query,
      response,
      context,
      entities,
      intentType,
      confidence,
      timestamp: Date.now()
    };
    
    // Add to conversation history
    setConversationHistory(prev => {
      const newHistory = [exchange, ...prev];
      return newHistory.slice(0, config.maxHistorySize);
    });
    
    // Update pending questions if response contains a question
    if (containsQuestion) {
      const extractedQuestion = extractQuestion(response);
      if (extractedQuestion) {
        setPendingQuestions(prev => {
          const newQuestions = [{
            question: extractedQuestion,
            exchangeId: exchange.id,
            timestamp: exchange.timestamp
          }, ...prev];
          return newQuestions.slice(0, 3); // Limit to 3 pending questions
        });
      }
    }
    
    return activeContextRef.current;
  }, [config.maxHistorySize]);
  
  /**
   * Check if query is a follow-up question
   */
  const checkIsFollowUp = useCallback((query) => {
    if (!query || conversationHistory.length === 0) {
      return false;
    }
    
    const queryLower = query.toLowerCase();
    
    // Check for follow-up indicators
    const followUpIndicators = [
      'und', 'auch', 'außerdem', 'zusätzlich', 'weiterhin',
      'was ist mit', 'wie sieht es aus mit', 'und die', 'und der',
      'dazu', 'davon', 'darüber', 'hierzu', 'dafür'
    ];
    
    for (const indicator of followUpIndicators) {
      if (queryLower.includes(indicator)) {
        return true;
      }
    }
    
    // Check for pronoun references
    const pronouns = ['das', 'dies', 'es', 'sie', 'er', 'diese', 'dieser'];
    for (const pronoun of pronouns) {
      if (queryLower.startsWith(pronoun + ' ')) {
        return true;
      }
    }
    
    return false;
  }, [conversationHistory]);
  
  /**
   * Resolve references in query
   */
  const resolveReferences = useCallback((query) => {
    if (!query || conversationHistory.length === 0) {
      return { resolvedQuery: query, referencedEntities: [] };
    }
    
    let resolvedQuery = query;
    const referencedEntities = [];
    
    // Get recent exchanges for reference resolution
    const recentExchanges = conversationHistory.slice(0, config.maxReferenceDistance);
    
    // Simple pronoun resolution
    const pronounMappings = {
      'das': 'currentTopic',
      'dies': 'currentTopic',
      'es': 'currentTopic',
      'diese': 'currentTopic',
      'dieser': 'currentTopic'
    };
    
    Object.entries(pronounMappings).forEach(([pronoun, reference]) => {
      const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
      if (regex.test(query)) {
        // Try to resolve from recent context
        for (const exchange of recentExchanges) {
          if (exchange.entities && exchange.entities.length > 0) {
            const primaryEntity = exchange.entities[0];
            resolvedQuery = resolvedQuery.replace(regex, primaryEntity.value || currentTopic || pronoun);
            referencedEntities.push(primaryEntity);
            break;
          }
        }
      }
    });
    
    return { resolvedQuery, referencedEntities };
  }, [conversationHistory, currentTopic, config.maxReferenceDistance]);
  
  /**
   * Get context for follow-up questions
   */
  const getFollowUpContext = useCallback((query) => {
    if (conversationHistory.length === 0) {
      return activeContextRef.current;
    }
    
    // Get the most recent exchange
    const lastExchange = conversationHistory[0];
    
    // Return context from last exchange with current topic
    return {
      ...lastExchange.context,
      previousQuery: lastExchange.query,
      previousResponse: lastExchange.response,
      previousEntities: lastExchange.entities,
      currentTopic,
      isFollowUpContext: true
    };
  }, [conversationHistory, currentTopic]);
  
  /**
   * Update topic tracking
   */
  const updateTopicTracking = useCallback((query, intentType, entities) => {
    if (!config.enableTopicTracking) {
      return;
    }
    
    const now = Date.now();
    
    // Check if current topic has expired
    if (currentTopic && (now - lastUpdateTimeRef.current > config.maxTopicAge)) {
      // Add to history before changing
      topicHistoryRef.current.push({
        topic: currentTopic,
        startTime: lastUpdateTimeRef.current,
        endTime: now
      });
      
      // Reset current topic
      setCurrentTopic(null);
    }
    
    // Determine new topic if needed
    if (!currentTopic) {
      const newTopic = determineTopicFromQuery(query, intentType, entities);
      setCurrentTopic(newTopic);
      lastUpdateTimeRef.current = now;
    } else {
      // Check if query indicates topic change
      const newTopic = determineTopicFromQuery(query, intentType, entities);
      
      if (newTopic && newTopic !== currentTopic) {
        // Add current topic to history
        topicHistoryRef.current.push({
          topic: currentTopic,
          startTime: lastUpdateTimeRef.current,
          endTime: now
        });
        
        // Set new topic
        setCurrentTopic(newTopic);
        lastUpdateTimeRef.current = now;
      } else {
        // Update last update time
        lastUpdateTimeRef.current = now;
      }
    }
    
    // Limit topic history size
    if (topicHistoryRef.current.length > 10) {
      topicHistoryRef.current = topicHistoryRef.current.slice(-10);
    }
  }, [currentTopic, config.enableTopicTracking, config.maxTopicAge]);
  
  /**
   * Determine topic from query
   */
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
  
  /**
   * Extract question from response
   */
  const extractQuestion = useCallback((response) => {
    if (!response) {
      return '';
    }
    
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
  
  /**
   * Generate a callback reference to previous dialog
   */
  const generateCallbackReference = useCallback(({
    currentQuery,
    currentContext
  }) => {
    if (!config.enableExplicitCallbacks || conversationHistory.length <= 1) {
      return null;
    }
    
    // Skip most recent exchange (current one)
    const relevantHistory = conversationHistory.slice(1, config.maxReferenceDistance + 1);
    
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
  }, [conversationHistory, config.enableExplicitCallbacks, config.maxReferenceDistance]);
  
  /**
   * Check if response contains a question
   */
  const containsQuestion = useCallback((response) => {
    return response && response.includes('?');
  }, []);
  
  /**
   * Check if query answers a question in response
   */
  const isAnsweredBy = useCallback((response, query) => {
    if (!response || !query) {
      return false;
    }
    
    // Simple yes/no answer detection
    const yesPatterns = [/^ja\b/i, /^yes\b/i, /^stimmt\b/i, /^genau\b/i, /^korrekt\b/i];
    const noPatterns = [/^nein\b/i, /^no\b/i, /^nicht\b/i, /^falsch\b/i];
    
    for (const pattern of [...yesPatterns, ...noPatterns]) {
      if (pattern.test(query.trim())) {
        return true;
      }
    }
    
    return false;
  }, []);
  
  /**
   * Check if exchange and query are related
   */
  const areRelated = useCallback((exchange, query, context) => {
    if (!exchange || !query) {
      return false;
    }
    
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
  
  /**
   * Format callback reference
   */
  const formatCallbackReference = useCallback((exchange) => {
    if (!exchange) {
      return null;
    }
    
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
  
  /**
   * Extract topic from exchange
   */
  const extractTopicFromExchange = useCallback((exchange) => {
    if (!exchange) {
      return 'diesem Thema';
    }
    
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
  
  /**
   * Clear conversation history
   */
  const clearConversationHistory = useCallback(() => {
    setConversationHistory([]);
    setCurrentTopic(null);
    setPendingQuestions([]);
    topicHistoryRef.current = [];
    activeContextRef.current = {};
  }, []);
  
  /**
   * Clear pending questions
   */
  const clearPendingQuestions = useCallback(() => {
    setPendingQuestions([]);
  }, []);
  
  return {
    // State
    conversationHistory,
    currentTopic,
    pendingQuestions,
    isFollowUp,
    
    // Methods
    processQuery,
    recordResponse,
    generateCallbackReference,
    clearConversationHistory,
    clearPendingQuestions,
    
    // Getters
    getActiveContext: () => activeContextRef.current,
    getTopicHistory: () => [...topicHistoryRef.current],
    
    // Configuration
    config
  };
};

