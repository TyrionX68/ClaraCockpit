/**
 * ConversationMemoryManager.js
 * Manages conversation history and context for Clara360 voice interactions
 * 
 * Part of Clara360 Advanced AI Integration
 * Created by Manus C
 */

class ConversationMemoryManager {
  constructor(options = {}) {
    // Configuration
    this.options = {
      maxConversationLength: options.maxConversationLength || 10,
      maxConversationAge: options.maxConversationAge || 30 * 60 * 1000, // 30 minutes
      contextPersistenceKey: options.contextPersistenceKey || 'clara360_conversation_context',
      ...options
    };
    
    // State
    this.conversationHistory = [];
    this.activeContext = null;
    this.contextStack = [];
    this.entityReferences = {};
    
    // Load persisted context if available
    this.loadPersistedContext();
  }
  
  /**
   * Add a new exchange to the conversation history
   * @param {Object} exchange - The conversation exchange
   * @param {string} exchange.query - User query
   * @param {string} exchange.response - System response
   * @param {Object} exchange.context - Context at time of exchange
   * @param {Array} exchange.entities - Entities mentioned in the exchange
   * @returns {Object} The added exchange with generated ID
   */
  addExchange(exchange) {
    if (!exchange.query || !exchange.response) {
      console.error('ConversationMemoryManager: Exchange must include query and response');
      return null;
    }
    
    // Generate exchange ID
    const exchangeId = `exchange-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create exchange object with timestamp
    const newExchange = {
      id: exchangeId,
      timestamp: new Date().toISOString(),
      query: exchange.query,
      response: exchange.response,
      context: exchange.context || this.activeContext,
      entities: exchange.entities || [],
      intentType: exchange.intentType || 'unknown',
      confidence: exchange.confidence || 1.0
    };
    
    // Add to conversation history
    this.conversationHistory.unshift(newExchange);
    
    // Update entity references
    this.updateEntityReferences(newExchange);
    
    // Limit conversation history length
    if (this.conversationHistory.length > this.options.maxConversationLength) {
      this.conversationHistory = this.conversationHistory.slice(0, this.options.maxConversationLength);
    }
    
    // Persist context
    this.persistContext();
    
    return newExchange;
  }
  
  /**
   * Update entity references based on new exchange
   * @param {Object} exchange - The conversation exchange
   * @private
   */
  updateEntityReferences(exchange) {
    if (!exchange.entities || !Array.isArray(exchange.entities)) {
      return;
    }
    
    exchange.entities.forEach(entity => {
      if (!entity.type || !entity.value) return;
      
      // Store or update entity reference
      this.entityReferences[entity.type] = {
        value: entity.value,
        exchangeId: exchange.id,
        timestamp: exchange.timestamp
      };
    });
  }
  
  /**
   * Get the current conversation history
   * @param {number} limit - Maximum number of exchanges to return
   * @returns {Array} Conversation history
   */
  getConversationHistory(limit = null) {
    if (limit && typeof limit === 'number') {
      return this.conversationHistory.slice(0, limit);
    }
    return [...this.conversationHistory];
  }
  
  /**
   * Clear conversation history
   */
  clearConversationHistory() {
    this.conversationHistory = [];
    this.persistContext();
  }
  
  /**
   * Set the active context
   * @param {Object} context - Context object
   */
  setActiveContext(context) {
    if (!context) {
      console.error('ConversationMemoryManager: Context cannot be null');
      return;
    }
    
    // Push current context to stack if different
    if (this.activeContext && JSON.stringify(this.activeContext) !== JSON.stringify(context)) {
      this.contextStack.push(this.activeContext);
      
      // Limit stack size
      if (this.contextStack.length > 5) {
        this.contextStack.shift();
      }
    }
    
    this.activeContext = context;
    this.persistContext();
  }
  
  /**
   * Get the active context
   * @returns {Object} Active context
   */
  getActiveContext() {
    return this.activeContext;
  }
  
  /**
   * Pop previous context from stack and set as active
   * @returns {Object|null} Previous context or null if stack is empty
   */
  popPreviousContext() {
    if (this.contextStack.length === 0) {
      return null;
    }
    
    const previousContext = this.contextStack.pop();
    this.activeContext = previousContext;
    this.persistContext();
    
    return previousContext;
  }
  
  /**
   * Resolve reference in query based on conversation history
   * @param {string} query - User query
   * @returns {Object} Resolved query and referenced entities
   */
  resolveReferences(query) {
    if (!query) {
      return { resolvedQuery: '', referencedEntities: [] };
    }
    
    let resolvedQuery = query;
    const referencedEntities = [];
    
    // Simple pronoun resolution
    const pronounRegex = /\b(es|sie|er|ihm|ihr|dieser|diese|dieses|das|die|der)\b/gi;
    
    resolvedQuery = resolvedQuery.replace(pronounRegex, (match) => {
      // Find most recent entity reference that could match this pronoun
      // This is a simplified approach - in a real system, you'd use NLP for better resolution
      
      // For demonstration, we'll just use the most recent entity of any type
      const recentEntities = Object.values(this.entityReferences)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      if (recentEntities.length > 0) {
        const entity = recentEntities[0];
        referencedEntities.push(entity);
        return entity.value;
      }
      
      return match; // Keep original if no reference found
    });
    
    return {
      resolvedQuery,
      referencedEntities
    };
  }
  
  /**
   * Detect if query represents a context switch
   * @param {string} query - User query
   * @param {Object} currentContext - Current context
   * @returns {boolean} True if context switch detected
   */
  detectContextSwitch(query, currentContext) {
    if (!query || !currentContext) {
      return false;
    }
    
    // Simple keyword-based detection
    // In a real system, you'd use more sophisticated NLP
    const contextSwitchKeywords = [
      'wechsle zu', 'zeige mir', 'öffne', 'gehe zu',
      'switch to', 'show me', 'open', 'go to'
    ];
    
    const queryLower = query.toLowerCase();
    
    // Check for context switch keywords
    for (const keyword of contextSwitchKeywords) {
      if (queryLower.includes(keyword)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Determine if query is a follow-up question
   * @param {string} query - User query
   * @returns {boolean} True if query is likely a follow-up
   */
  isFollowUpQuestion(query) {
    if (!query || this.conversationHistory.length === 0) {
      return false;
    }
    
    const queryLower = query.toLowerCase();
    
    // Check for follow-up indicators
    const followUpIndicators = [
      'und', 'aber', 'auch', 'wie viel', 'wie viele', 'warum', 'wann',
      'and', 'but', 'also', 'how much', 'how many', 'why', 'when'
    ];
    
    for (const indicator of followUpIndicators) {
      if (queryLower.startsWith(indicator)) {
        return true;
      }
    }
    
    // Check for pronouns that likely refer to previous context
    const pronouns = [
      'es', 'sie', 'er', 'ihm', 'ihr', 'dieser', 'diese', 'dieses', 'das', 'die', 'der',
      'it', 'they', 'them', 'this', 'that', 'these', 'those'
    ];
    
    for (const pronoun of pronouns) {
      const pronounRegex = new RegExp(`\\b${pronoun}\\b`, 'i');
      if (pronounRegex.test(queryLower)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Get context for a follow-up question
   * @param {string} query - User query
   * @returns {Object} Context for follow-up
   */
  getFollowUpContext(query) {
    if (this.conversationHistory.length === 0) {
      return null;
    }
    
    // Get most recent exchange
    const lastExchange = this.conversationHistory[0];
    
    // Combine active context with relevant parts of conversation history
    return {
      ...this.activeContext,
      previousQuery: lastExchange.query,
      previousResponse: lastExchange.response,
      previousEntities: lastExchange.entities,
      conversationAge: new Date() - new Date(lastExchange.timestamp)
    };
  }
  
  /**
   * Persist context to storage
   * @private
   */
  persistContext() {
    try {
      const persistData = {
        conversationHistory: this.conversationHistory,
        activeContext: this.activeContext,
        contextStack: this.contextStack,
        entityReferences: this.entityReferences,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(this.options.contextPersistenceKey, JSON.stringify(persistData));
    } catch (error) {
      console.error('ConversationMemoryManager: Failed to persist context', error);
    }
  }
  
  /**
   * Load persisted context from storage
   * @private
   */
  loadPersistedContext() {
    try {
      const persistedData = localStorage.getItem(this.options.contextPersistenceKey);
      
      if (!persistedData) {
        return;
      }
      
      const data = JSON.parse(persistedData);
      
      // Check if persisted data is too old
      const persistedTime = new Date(data.timestamp);
      const now = new Date();
      
      if (now - persistedTime > this.options.maxConversationAge) {
        // Data too old, clear it
        localStorage.removeItem(this.options.contextPersistenceKey);
        return;
      }
      
      // Restore persisted data
      this.conversationHistory = data.conversationHistory || [];
      this.activeContext = data.activeContext || null;
      this.contextStack = data.contextStack || [];
      this.entityReferences = data.entityReferences || {};
    } catch (error) {
      console.error('ConversationMemoryManager: Failed to load persisted context', error);
    }
  }
  
  /**
   * Clear all persisted context
   */
  clearPersistedContext() {
    try {
      localStorage.removeItem(this.options.contextPersistenceKey);
    } catch (error) {
      console.error('ConversationMemoryManager: Failed to clear persisted context', error);
    }
  }
}

export default ConversationMemoryManager;
