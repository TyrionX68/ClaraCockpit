// Clara360 Wave 2: Conversation Memory Manager
// Erweiterte Konversations-Verwaltung für Clara360
// Version: 2.0.0 | Wave 2 Implementation

class Clara360ConversationMemoryManager {
  constructor(options = {}) {
    this.options = {
      maxConversationLength: options.maxConversationLength || 20,
      maxConversationAge: options.maxConversationAge || 60 * 60 * 1000, // 1 Stunde
      contextPersistenceKey: options.contextPersistenceKey || 'clara360_conversation_memory',
      enableEntityTracking: true,
      enableContextPersistence: true,
      ...options
    };
    
    // Konversations-State
    this.conversationHistory = [];
    this.activeContext = {};
    this.entityReferences = new Map();
    this.sessionMetadata = {
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      totalExchanges: 0
    };
    
    // Lade persistierte Daten
    this.loadPersistedMemory();
    
    // Initialisierung
    this.initialize();
  }

  initialize() {
    console.log("🧠 [WAVE2-MEMORY] Initialisiere Conversation Memory Manager");
    
    // Bereinige alte Konversationen
    this.cleanupOldConversations();
    
    // Starte Auto-Persistierung
    this.startAutoPersistence();
    
    // Globale API verfügbar machen
    window.Clara360ConversationMemory = this;
    
    console.log("✅ [WAVE2-MEMORY] Conversation Memory Manager bereit");
  }

  generateSessionId() {
    return `clara360-session-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  addExchange(exchange) {
    if (!exchange.query || !exchange.response) {
      console.error('[WAVE2-MEMORY] Exchange muss query und response enthalten');
      return null;
    }
    
    const exchangeId = `exchange-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const newExchange = {
      id: exchangeId,
      sessionId: this.sessionMetadata.sessionId,
      timestamp: new Date().toISOString(),
      query: exchange.query,
      response: exchange.response,
      context: { ...this.activeContext, ...exchange.context },
      entities: exchange.entities || [],
      intentType: exchange.intentType || 'general',
      confidence: exchange.confidence || 0.8,
      metadata: {
        responseTime: exchange.responseTime || 0,
        source: exchange.source || 'clara360_intelligence'
      }
    };
    
    // Füge zur Historie hinzu
    this.conversationHistory.unshift(newExchange);
    
    // Aktualisiere Entity-Referenzen
    this.updateEntityReferences(newExchange);
    
    // Aktualisiere Session-Metadaten
    this.sessionMetadata.totalExchanges++;
    this.sessionMetadata.lastActivity = new Date();
    
    // Begrenze Historie-Länge
    if (this.conversationHistory.length > this.options.maxConversationLength) {
      this.conversationHistory = this.conversationHistory.slice(0, this.options.maxConversationLength);
    }
    
    // Persistiere Änderungen
    this.persistMemory();
    
    console.log(`📝 [WAVE2-MEMORY] Exchange hinzugefügt: ${exchangeId}`);
    
    return newExchange;
  }

  updateEntityReferences(exchange) {
    if (!this.options.enableEntityTracking || !exchange.entities) {
      return;
    }
    
    exchange.entities.forEach(entity => {
      if (entity.type && entity.value) {
        this.entityReferences.set(entity.type, {
          value: entity.value,
          exchangeId: exchange.id,
          timestamp: exchange.timestamp,
          confidence: entity.confidence || 0.8
        });
      }
    });
  }

  getConversationHistory(limit = 10) {
    return this.conversationHistory.slice(0, limit);
  }

  getRecentContext(exchangeCount = 3) {
    const recentExchanges = this.conversationHistory.slice(0, exchangeCount);
    
    return {
      recentQueries: recentExchanges.map(e => e.query),
      recentResponses: recentExchanges.map(e => e.response),
      entities: Object.fromEntries(this.entityReferences),
      sessionInfo: this.sessionMetadata,
      contextSummary: this.generateContextSummary(recentExchanges)
    };
  }

  generateContextSummary(exchanges) {
    if (exchanges.length === 0) {
      return 'Neue Konversation gestartet';
    }
    
    const topics = new Set();
    const intents = new Set();
    
    exchanges.forEach(exchange => {
      if (exchange.intentType) {
        intents.add(exchange.intentType);
      }
      
      // Extrahiere Themen aus Queries
      const query = exchange.query.toLowerCase();
      if (query.includes('mieter')) topics.add('Mieter');
      if (query.includes('finanzen') || query.includes('miete')) topics.add('Finanzen');
      if (query.includes('wartung')) topics.add('Wartung');
      if (query.includes('analyse')) topics.add('Analyse');
    });
    
    const topicList = Array.from(topics).join(', ');
    const intentList = Array.from(intents).join(', ');
    
    return `Themen: ${topicList || 'Allgemein'} | Intents: ${intentList || 'general'}`;
  }

  findRelevantContext(query) {
    const lowerQuery = query.toLowerCase();
    const relevantExchanges = [];
    
    // Suche nach ähnlichen Queries in der Historie
    this.conversationHistory.forEach(exchange => {
      const similarity = this.calculateSimilarity(lowerQuery, exchange.query.toLowerCase());
      if (similarity > 0.3) {
        relevantExchanges.push({
          ...exchange,
          similarity: similarity
        });
      }
    });
    
    // Sortiere nach Ähnlichkeit
    relevantExchanges.sort((a, b) => b.similarity - a.similarity);
    
    return {
      relevantExchanges: relevantExchanges.slice(0, 3),
      entityContext: this.getRelevantEntities(lowerQuery),
      contextScore: relevantExchanges.length > 0 ? relevantExchanges[0].similarity : 0
    };
  }

  calculateSimilarity(str1, str2) {
    // Einfache Wort-basierte Ähnlichkeitsberechnung
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return commonWords.length / totalWords;
  }

  getRelevantEntities(query) {
    const relevantEntities = {};
    
    this.entityReferences.forEach((entity, type) => {
      if (query.includes(entity.value.toLowerCase())) {
        relevantEntities[type] = entity;
      }
    });
    
    return relevantEntities;
  }

  updateActiveContext(newContext) {
    this.activeContext = { ...this.activeContext, ...newContext };
    this.persistMemory();
  }

  clearConversationHistory() {
    this.conversationHistory = [];
    this.entityReferences.clear();
    this.sessionMetadata = {
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      totalExchanges: 0
    };
    
    this.persistMemory();
    console.log("🗑️ [WAVE2-MEMORY] Konversations-Historie geleert");
  }

  cleanupOldConversations() {
    const cutoffTime = new Date(Date.now() - this.options.maxConversationAge);
    
    const initialLength = this.conversationHistory.length;
    this.conversationHistory = this.conversationHistory.filter(exchange => {
      return new Date(exchange.timestamp) > cutoffTime;
    });
    
    const removedCount = initialLength - this.conversationHistory.length;
    if (removedCount > 0) {
      console.log(`🧹 [WAVE2-MEMORY] ${removedCount} alte Konversationen entfernt`);
    }
  }

  loadPersistedMemory() {
    if (!this.options.enableContextPersistence) {
      return;
    }
    
    try {
      const persistedData = localStorage.getItem(this.options.contextPersistenceKey);
      if (persistedData) {
        const data = JSON.parse(persistedData);
        
        this.conversationHistory = data.conversationHistory || [];
        this.activeContext = data.activeContext || {};
        this.entityReferences = new Map(data.entityReferences || []);
        this.sessionMetadata = data.sessionMetadata || this.sessionMetadata;
        
        console.log(`📂 [WAVE2-MEMORY] ${this.conversationHistory.length} Konversationen geladen`);
      }
    } catch (error) {
      console.error('[WAVE2-MEMORY] Fehler beim Laden persistierter Daten:', error);
    }
  }

  persistMemory() {
    if (!this.options.enableContextPersistence) {
      return;
    }
    
    try {
      const dataToStore = {
        conversationHistory: this.conversationHistory,
        activeContext: this.activeContext,
        entityReferences: Array.from(this.entityReferences.entries()),
        sessionMetadata: this.sessionMetadata,
        lastPersisted: new Date().toISOString()
      };
      
      localStorage.setItem(this.options.contextPersistenceKey, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('[WAVE2-MEMORY] Fehler beim Persistieren:', error);
    }
  }

  startAutoPersistence() {
    // Persistiere alle 30 Sekunden
    setInterval(() => {
      this.persistMemory();
    }, 30 * 1000);
  }

  // API für externe Nutzung
  getMemoryStats() {
    return {
      totalExchanges: this.conversationHistory.length,
      sessionId: this.sessionMetadata.sessionId,
      sessionDuration: Date.now() - new Date(this.sessionMetadata.startTime).getTime(),
      entityCount: this.entityReferences.size,
      lastActivity: this.sessionMetadata.lastActivity
    };
  }

  exportMemory() {
    return {
      conversationHistory: this.conversationHistory,
      entityReferences: Object.fromEntries(this.entityReferences),
      sessionMetadata: this.sessionMetadata,
      activeContext: this.activeContext,
      exportTimestamp: new Date().toISOString()
    };
  }
}

// MultiModal Response Manager
class Clara360MultiModalResponseManager {
  constructor(options = {}) {
    this.options = {
      enableVoiceOutput: true,
      enableTextOutput: true,
      enableUIActions: true,
      defaultVoiceSpeed: 1.0,
      defaultVoiceLanguage: 'de-DE',
      ...options
    };
    
    this.isInitialized = false;
    this.voiceSupported = false;
    
    this.initialize();
  }

  initialize() {
    console.log("🔀 [WAVE2-MULTIMODAL] Initialisiere MultiModal Response Manager");
    
    // Prüfe Voice-Support
    this.voiceSupported = 'speechSynthesis' in window;
    
    // Globale API verfügbar machen
    window.Clara360MultiModal = this;
    
    this.isInitialized = true;
    console.log("✅ [WAVE2-MULTIMODAL] MultiModal Response Manager bereit");
  }

  async processResponse(response, options = {}) {
    const processOptions = {
      outputModes: options.outputModes || ['text', 'ui'],
      voiceEnabled: options.voiceEnabled && this.voiceSupported,
      uiActionsEnabled: options.uiActionsEnabled !== false,
      ...options
    };
    
    const results = {
      text: null,
      voice: null,
      uiActions: null,
      timestamp: new Date()
    };
    
    // Text-Output (immer verfügbar)
    if (processOptions.outputModes.includes('text')) {
      results.text = this.processTextOutput(response);
    }
    
    // Voice-Output
    if (processOptions.outputModes.includes('voice') && processOptions.voiceEnabled) {
      results.voice = await this.processVoiceOutput(response, processOptions);
    }
    
    // UI-Actions
    if (processOptions.outputModes.includes('ui') && processOptions.uiActionsEnabled) {
      results.uiActions = this.processUIActions(response);
    }
    
    return results;
  }

  processTextOutput(response) {
    return {
      content: response.content,
      formatted: this.formatTextForDisplay(response.content),
      insights: response.insights || [],
      confidence: response.confidence || 0.8
    };
  }

  formatTextForDisplay(text) {
    // Formatiere Text für bessere Lesbarkeit
    return text
      .replace(/(\d+(?:\.\d+)?€)/g, '<strong>$1</strong>') // Geldbeträge hervorheben
      .replace(/(\d+%)/g, '<em>$1</em>') // Prozente kursiv
      .replace(/(\d+(?:\.\d+)?h)/g, '<code>$1</code>'); // Zeitangaben
  }

  async processVoiceOutput(response, options) {
    if (!this.voiceSupported) {
      return { error: 'Voice-Output nicht unterstützt' };
    }
    
    try {
      const utterance = new SpeechSynthesisUtterance(response.content);
      utterance.lang = options.voiceLanguage || this.options.defaultVoiceLanguage;
      utterance.rate = options.voiceSpeed || this.options.defaultVoiceSpeed;
      
      // Wähle deutsche Stimme wenn verfügbar
      const voices = speechSynthesis.getVoices();
      const germanVoice = voices.find(voice => voice.lang.startsWith('de'));
      if (germanVoice) {
        utterance.voice = germanVoice;
      }
      
      return new Promise((resolve) => {
        utterance.onend = () => {
          resolve({
            success: true,
            duration: utterance.text.length * 50, // Geschätzte Dauer
            voice: utterance.voice?.name || 'Standard'
          });
        };
        
        utterance.onerror = (error) => {
          resolve({
            success: false,
            error: error.error
          });
        };
        
        speechSynthesis.speak(utterance);
      });
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  processUIActions(response) {
    const actions = response.actions || [];
    const processedActions = [];
    
    actions.forEach(action => {
      switch (action.type) {
        case 'navigate':
          processedActions.push({
            type: 'navigate',
            target: action.target,
            label: action.label,
            execute: () => this.executeNavigation(action.target)
          });
          break;
          
        case 'shortcut':
          processedActions.push({
            type: 'shortcut',
            target: action.target,
            label: action.label,
            execute: () => this.executeShortcut(action.target)
          });
          break;
          
        case 'suggestion':
          processedActions.push({
            type: 'suggestion',
            label: action.label,
            execute: () => this.executeSuggestion(action.label)
          });
          break;
      }
    });
    
    return {
      actions: processedActions,
      count: processedActions.length
    };
  }

  executeNavigation(target) {
    console.log(`🔗 [WAVE2-MULTIMODAL] Navigation zu: ${target}`);
    // Implementiere Navigation-Logik
    if (target.startsWith('/')) {
      // Interne Navigation
      window.location.hash = target;
    } else {
      // Externe Navigation
      window.open(target, '_blank');
    }
  }

  executeShortcut(shortcut) {
    console.log(`⌨️ [WAVE2-MULTIMODAL] Shortcut ausführen: ${shortcut}`);
    // Simuliere Keyboard-Shortcut
    const event = new KeyboardEvent('keydown', {
      key: shortcut.split('+').pop(),
      ctrlKey: shortcut.includes('Ctrl'),
      shiftKey: shortcut.includes('Shift'),
      altKey: shortcut.includes('Alt')
    });
    document.dispatchEvent(event);
  }

  executeSuggestion(suggestion) {
    console.log(`💡 [WAVE2-MULTIMODAL] Suggestion: ${suggestion}`);
    // Sende Suggestion als neue Query
    if (window.clara360Intelligence) {
      window.clara360Intelligence.processQuery(suggestion);
    }
  }
}

// Globale Initialisierung
document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 [WAVE2] Initialisiere Memory & MultiModal Manager");
  
  window.clara360ConversationMemory = new Clara360ConversationMemoryManager();
  window.clara360MultiModal = new Clara360MultiModalResponseManager();
});

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Clara360ConversationMemoryManager,
    Clara360MultiModalResponseManager
  };
}

