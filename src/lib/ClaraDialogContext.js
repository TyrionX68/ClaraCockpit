/**
 * ClaraDialogContext.js
 * Manages dialog coherence and context memory for Clara
 * 
 * Part of Clara360 Dialog Intelligence Phase 2
 * Created by Manus C
 */



/**
 * Enhances Clara's dialog coherence and context memory capabilities
 */
class ClaraDialogContext {
  constructor(options = {}) {
    // Initialize conversation memory manager
    this.memoryManager = options.memoryManager || new ConversationMemoryManager(options.memoryOptions || {});
    
    // Configuration
    this.options = {
      maxReferenceDistance: options.maxReferenceDistance || 3,
      enableExplicitCallbacks: options.enableExplicitCallbacks !== false,
      enableImplicitReferences: options.enableImplicitReferences !== false,
      enableTopicTracking: options.enableTopicTracking !== false,
      maxTopicAge: options.maxTopicAge || 5 * 60 * 1000, // 5 minutes
      ...options
    };
    
    // State
    this.currentTopic = null;
    this.topicHistory = [];
    this.lastUpdateTime = Date.now();
    this.pendingQuestions = [];
  }
  
  /**
   * Process a new user query and update dialog context
   * @param {Object} params - Processing parameters
   * @param {string} params.query - User query
   * @param {Object} params.entities - Detected entities
   * @param {string} params.intentType - Detected intent type
   * @param {number} params.confidence - Intent confidence
   * @param {Object} params.additionalContext - Additional context
   * @returns {Object} Enhanced context for response generation
   */
  processQuery({
    query,
    entities = [],
    intentType = 'unknown',
    confidence = 1.0,
    additionalContext = {}
  }) {
    if (!query) {
      return { 
        isFollowUp: false,
        resolvedQuery: '',
        context: this.memoryManager.getActiveContext() || {}
      };
    }
    
    // Check if this is a follow-up question
    const isFollowUp = this.memoryManager.isFollowUpQuestion(query);
    
    // Resolve references in query
    const { resolvedQuery, referencedEntities } = this.memoryManager.resolveReferences(query);
    
    // Check for context switch
    const isContextSwitch = this.memoryManager.detectContextSwitch(query, this.memoryManager.getActiveContext());
    
    // Update topic tracking
    this.updateTopicTracking(query, intentType, entities);
    
    // Get appropriate context
    let context = isFollowUp 
      ? this.memoryManager.getFollowUpContext(query)
      : this.memoryManager.getActiveContext() || {};
    
    // Merge with additional context
    context = {
      ...context,
      ...additionalContext,
      currentTopic: this.currentTopic,
      isFollowUp,
      isContextSwitch,
      referencedEntities,
      pendingQuestions: [...this.pendingQuestions]
    };
    
    // Set active context
    this.memoryManager.setActiveContext(context);
    
    return {
      isFollowUp,
      resolvedQuery,
      context,
      referencedEntities
    };
  }
  
  /**
   * Record a response and update dialog context
   * @param {Object} params - Recording parameters
   * @param {string} params.query - Original user query
   * @param {string} params.response - System response
   * @param {Object} params.context - Context at time of response
   * @param {Array} params.entities - Entities in response
   * @param {string} params.intentType - Intent type
   * @param {number} params.confidence - Confidence level
   * @param {boolean} params.containsQuestion - Whether response contains a question
   * @returns {Object} Updated context
   */
  recordResponse({
    query,
    response,
    context = {},
    entities = [],
    intentType = 'unknown',
    confidence = 1.0,
    containsQuestion = false
  }) {
    // Add exchange to conversation history
    const exchange = this.memoryManager.addExchange({
      query,
      response,
      context,
      entities,
      intentType,
      confidence
    });
    
    // Update pending questions if response contains a question
    if (containsQuestion) {
      this.addPendingQuestion({
        question: this.extractQuestion(response),
        exchangeId: exchange.id,
        timestamp: exchange.timestamp
      });
    }
    
    // Return updated context
    return this.memoryManager.getActiveContext();
  }
  
  /**
   * Extract question from response
   * @param {string} response - System response
   * @returns {string} Extracted question
   * @private
   */
  extractQuestion(response) {
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
  }
  
  /**
   * Add a pending question
   * @param {Object} question - Question object
   * @private
   */
  addPendingQuestion(question) {
    if (!question.question) {
      return;
    }
    
    // Add to pending questions
    this.pendingQuestions.push(question);
    
    // Limit number of pending questions
    if (this.pendingQuestions.length > 3) {
      this.pendingQuestions.shift();
    }
  }
  
  /**
   * Clear pending questions
   */
  clearPendingQuestions() {
    this.pendingQuestions = [];
  }
  
  /**
   * Update topic tracking
   * @param {string} query - User query
   * @param {string} intentType - Intent type
   * @param {Array} entities - Detected entities
   * @private
   */
  updateTopicTracking(query, intentType, entities) {
    if (!this.options.enableTopicTracking) {
      return;
    }
    
    const now = Date.now();
    
    // Check if current topic has expired
    if (this.currentTopic && (now - this.lastUpdateTime > this.options.maxTopicAge)) {
      // Add to history before changing
      this.topicHistory.push({
        topic: this.currentTopic,
        startTime: this.lastUpdateTime,
        endTime: now
      });
      
      // Reset current topic
      this.currentTopic = null;
    }
    
    // Determine new topic if needed
    if (!this.currentTopic) {
      this.currentTopic = this.determineTopicFromQuery(query, intentType, entities);
      this.lastUpdateTime = now;
    } else {
      // Check if query indicates topic change
      const newTopic = this.determineTopicFromQuery(query, intentType, entities);
      
      if (newTopic && newTopic !== this.currentTopic) {
        // Add current topic to history
        this.topicHistory.push({
          topic: this.currentTopic,
          startTime: this.lastUpdateTime,
          endTime: now
        });
        
        // Set new topic
        this.currentTopic = newTopic;
        this.lastUpdateTime = now;
      } else {
        // Update last update time
        this.lastUpdateTime = now;
      }
    }
    
    // Limit topic history size
    if (this.topicHistory.length > 10) {
      this.topicHistory = this.topicHistory.slice(-10);
    }
  }
  
  /**
   * Determine topic from query
   * @param {string} query - User query
   * @param {string} intentType - Intent type
   * @param {Array} entities - Detected entities
   * @returns {string} Determined topic
   * @private
   */
  determineTopicFromQuery(query, intentType, entities) {
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
  }
  
  /**
   * Generate a callback reference to previous dialog
   * @param {Object} params - Callback parameters
   * @param {string} params.currentQuery - Current user query
   * @param {Object} params.currentContext - Current context
   * @returns {string|null} Callback reference or null if not applicable
   */
  generateCallbackReference({
    currentQuery,
    currentContext
  }) {
    if (!this.options.enableExplicitCallbacks) {
      return null;
    }
    
    // Get conversation history
    const history = this.memoryManager.getConversationHistory(this.options.maxReferenceDistance);
    
    // No history to reference
    if (history.length <= 1) {
      return null;
    }
    
    // Skip most recent exchange (current one)
    const relevantHistory = history.slice(1);
    
    // Find a relevant previous exchange to reference
    for (const exchange of relevantHistory) {
      // Check if previous exchange had a question that wasn't answered
      if (this.containsQuestion(exchange.response) && !this.isAnsweredBy(exchange.response, currentQuery)) {
        return this.formatCallbackReference(exchange);
      }
      
      // Check if current query is related to previous exchange
      if (this.areRelated(exchange, currentQuery, currentContext)) {
        return this.formatCallbackReference(exchange);
      }
    }
    
    return null;
  }
  
  /**
   * Check if response contains a question
   * @param {string} response - Response text
   * @returns {boolean} Whether response contains a question
   * @private
   */
  containsQuestion(response) {
    if (!response) {
      return false;
    }
    
    return response.includes('?');
  }
  
  /**
   * Check if query answers a question in response
   * @param {string} response - Response with question
   * @param {string} query - User query
   * @returns {boolean} Whether query answers the question
   * @private
   */
  isAnsweredBy(response, query) {
    if (!response || !query) {
      return false;
    }
    
    // Extract question from response
    const question = this.extractQuestion(response);
    
    if (!question) {
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
  }
  
  /**
   * Check if exchange and query are related
   * @param {Object} exchange - Previous exchange
   * @param {string} query - Current query
   * @param {Object} context - Current context
   * @returns {boolean} Whether they are related
   * @private
   */
  areRelated(exchange, query, context) {
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
  }
  
  /**
   * Format callback reference
   * @param {Object} exchange - Exchange to reference
   * @returns {string} Formatted reference
   * @private
   */
  formatCallbackReference(exchange) {
    if (!exchange) {
      return null;
    }
    
    // Different reference formats
    const referenceFormats = [
      `Du hattest mich nach ${this.extractTopicFromExchange(exchange)} gefragt`,
      `Bezüglich deiner Frage zu ${this.extractTopicFromExchange(exchange)}`,
      `Um auf deine frühere Frage zurückzukommen`
    ];
    
    // Select random format
    const format = referenceFormats[Math.floor(Math.random() * referenceFormats.length)];
    
    return format;
  }
  
  /**
   * Extract topic from exchange
   * @param {Object} exchange - Exchange
   * @returns {string} Extracted topic
   * @private
   */
  extractTopicFromExchange(exchange) {
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
  }
  
  /**
   * Generate a coherence bridge for topic transition
   * @param {Object} params - Bridge parameters
   * @param {string} params.previousTopic - Previous topic
   * @param {string} params.newTopic - New topic
   * @param {boolean} params.isExplicitTransition - Whether transition was explicit
   * @returns {string|null} Coherence bridge or null if not applicable
   */
  generateCoherenceBridge({
    previousTopic,
    newTopic,
    isExplicitTransition = false
  }) {
    if (!previousTopic || !newTopic || previousTopic === newTopic) {
      return null;
    }
    
    // Different bridge formats
    const bridgeFormats = [
      `Wechseln wir von ${previousTopic} zu ${newTopic}.`,
      `Lassen wir ${previousTopic} und schauen uns ${newTopic} an.`,
      `Zu ${newTopic}: `
    ];
    
    // Select random format
    const format = bridgeFormats[Math.floor(Math.random() * bridgeFormats.length)];
    
    return format;
  }
  
  /**
   * Get conversation history
   * @param {number} limit - Maximum number of exchanges
   * @returns {Array} Conversation history
   */
  getConversationHistory(limit = null) {
    return this.memoryManager.getConversationHistory(limit);
  }
  
  /**
   * Clear conversation history
   */
  clearConversationHistory() {
    this.memoryManager.clearConversationHistory();
    this.currentTopic = null;
    this.topicHistory = [];
    this.pendingQuestions = [];
  }
  
  /**
   * Get active context
   * @returns {Object} Active context
   */
  getActiveContext() {
    return this.memoryManager.getActiveContext();
  }
  
  /**
   * Set active context
   * @param {Object} context - Context to set
   */
  setActiveContext(context) {
    this.memoryManager.setActiveContext(context);
  }
  
  /**
   * Get current topic
   * @returns {string} Current topic
   */
  getCurrentTopic() {
    return this.currentTopic;
  }
  
  /**
   * Get topic history
   * @returns {Array} Topic history
   */
  getTopicHistory() {
    return [...this.topicHistory];
  }
  
  /**
   * Get pending questions
   * @returns {Array} Pending questions
   */
  getPendingQuestions() {
    return [...this.pendingQuestions];
  }
}

export default ClaraDialogContext;
