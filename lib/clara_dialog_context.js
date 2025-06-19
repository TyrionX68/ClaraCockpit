/**
 * clara_dialog_context.js
 * Dialog-Kontext-Modul für Clara KI
 * Verwaltet Konversationsverlauf und Kontext-Informationen
 */

// Globaler Namespace für Clara-Funktionalitäten
window.ClaraKI = window.ClaraKI || {};

// Dialog-Kontext
window.ClaraKI.DialogContext = {
  history: [],
  currentTopic: null,
  entities: {},
  confidenceThreshold: 0.7,
  maxHistoryLength: 20,
  
  // Initialisierung
  init: function(config = {}) {
    console.group('[CLARA-FUSION] DialogContext Initialisierung');
    
    // Konfiguration übernehmen
    this.confidenceThreshold = config.confidenceThreshold || this.confidenceThreshold;
    this.maxHistoryLength = config.maxHistoryLength || this.maxHistoryLength;
    
    console.log('✅ Dialog-Kontext initialisiert');
    console.groupEnd();
    
    return true;
  },
  
  // Konversationsverlauf hinzufügen
  addToHistory: function(message, isUser = true, metadata = {}) {
    const entry = {
      id: Date.now(),
      text: message,
      isUser: isUser,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    
    this.history.push(entry);
    
    // Begrenze Historie auf maxHistoryLength Einträge
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
    
    return this.history;
  },
  
  // Aktuelles Thema basierend auf Schlüsselwörtern erkennen
  updateCurrentTopic: function(message) {
    const lowerMessage = message.toLowerCase();
    
    // Themen-Mapping
    const topicKeywords = {
      miete: ['miete', 'einnahmen', 'mieteinnahmen', 'monatsmiete'],
      rückstand: ['rückstand', 'zahlung', 'offen', 'ausstehend', 'schulden'],
      wartung: ['wartung', 'reparatur', 'heizung', 'instandhaltung', 'sanierung'],
      cashflow: ['cashflow', 'liquidität', 'geld', 'finanzen', 'vorschau'],
      rendite: ['rendite', 'gewinn', 'ertrag', 'performance', 'roi'],
      objekte: ['objekte', 'immobilien', 'wohnungen', 'häuser', 'gebäude'],
      steuer: ['steuer', 'steuern', 'abschreibung', 'finanzamt', 'optimierung']
    };
    
    // Thema erkennen
    let newTopic = null;
    let maxMatches = 0;
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        newTopic = topic;
      }
    }
    
    // Thema nur ändern, wenn eindeutig erkannt
    if (newTopic) {
      this.currentTopic = newTopic;
      console.log('🧠 Thema erkannt:', this.currentTopic);
    }
    
    return this.currentTopic;
  },
  
  // Entitäten aus Nachricht extrahieren
  extractEntities: function(message) {
    // Einfache Entitäts-Extraktion
    const entities = {};
    
    // Zahlen extrahieren
    const numbers = message.match(/\d+(?:,\d+)?(?:\.\d+)?/g);
    if (numbers) {
      entities.numbers = numbers.map(num => parseFloat(num.replace(',', '.')));
    }
    
    // Zeitangaben extrahieren
    const timeKeywords = ['heute', 'morgen', 'gestern', 'nächste woche', 'nächsten monat', 'diesen monat'];
    entities.timeReferences = timeKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    // Objekte extrahieren
    const objectKeywords = ['wohnung', 'haus', 'gebäude', 'immobilie', 'objekt'];
    entities.objects = objectKeywords.filter(keyword => 
      message.toLowerCase().includes(keyword)
    );
    
    // Entitäten speichern
    this.entities = {
      ...this.entities,
      ...entities
    };
    
    return entities;
  },
  
  // Kontext-basierte Antwort-Verbesserung
  enhanceResponse: function(response, intent) {
    // Füge kontextbezogene Informationen hinzu, wenn verfügbar
    if (this.history.length > 2 && this.currentTopic) {
      const lastUserMessages = this.history.filter(m => m.isUser).slice(-2);
      const lastClaraMessages = this.history.filter(m => !m.isUser).slice(-2);
      
      // Kontext-basierte Verbesserungen
      if (this.currentTopic === 'miete' && intent === 'miete') {
        // Wenn nach Miete gefragt wurde und vorher nach Rückständen
        const previousTopics = this.getPreviousTopics(3);
        if (previousTopics.includes('rückstand')) {
          return response + ' Nach Abzug der Rückstände beträgt der effektive Eingang 7.560 €.';
        }
      } 
      else if (this.currentTopic === 'cashflow' && intent === 'cashflow') {
        // Wenn nach Cashflow gefragt wurde und vorher nach Rendite
        const previousTopics = this.getPreviousTopics(3);
        if (previousTopics.includes('rendite')) {
          return response + ' Diese positive Cashflow-Entwicklung trägt direkt zur überdurchschnittlichen Rendite bei.';
        }
      }
      else if (this.currentTopic === 'wartung' && intent === 'wartung') {
        // Wenn nach Wartung gefragt wurde und Zahlen im Kontext sind
        if (this.entities.numbers && this.entities.numbers.length > 0) {
          return response + ' Die Investition würde sich in etwa 14 Monaten amortisieren.';
        }
      }
    }
    
    return response;
  },
  
  // Vorherige Themen abrufen
  getPreviousTopics: function(count = 3) {
    const topics = [];
    let currentIndex = this.history.length - 1;
    
    while (topics.length < count && currentIndex >= 0) {
      const entry = this.history[currentIndex];
      
      if (entry.topic && !topics.includes(entry.topic)) {
        topics.push(entry.topic);
      }
      
      currentIndex--;
    }
    
    return topics;
  },
  
  // Letzte Benutzer-Nachricht abrufen
  getLastUserMessage: function() {
    const userMessages = this.history.filter(m => m.isUser);
    return userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
  },
  
  // Letzte Clara-Nachricht abrufen
  getLastClaraMessage: function() {
    const claraMessages = this.history.filter(m => !m.isUser);
    return claraMessages.length > 0 ? claraMessages[claraMessages.length - 1] : null;
  },
  
  // Konversationszusammenfassung erstellen
  summarizeConversation: function() {
    if (this.history.length === 0) {
      return 'Keine Konversation vorhanden.';
    }
    
    const topics = [...new Set(this.history
      .filter(entry => entry.topic)
      .map(entry => entry.topic))];
    
    const userQuestions = this.history
      .filter(entry => entry.isUser)
      .map(entry => entry.text);
    
    return {
      messageCount: this.history.length,
      userMessageCount: this.history.filter(entry => entry.isUser).length,
      claraMessageCount: this.history.filter(entry => !entry.isUser).length,
      topics: topics,
      currentTopic: this.currentTopic,
      lastUserQuestion: userQuestions[userQuestions.length - 1],
      conversationDuration: this.getConversationDuration()
    };
  },
  
  // Konversationsdauer berechnen
  getConversationDuration: function() {
    if (this.history.length < 2) {
      return 0;
    }
    
    const firstTimestamp = new Date(this.history[0].timestamp).getTime();
    const lastTimestamp = new Date(this.history[this.history.length - 1].timestamp).getTime();
    
    return Math.round((lastTimestamp - firstTimestamp) / 1000); // Sekunden
  },
  
  // Kontext zurücksetzen
  reset: function() {
    this.history = [];
    this.currentTopic = null;
    this.entities = {};
    
    console.log('🔄 Dialog-Kontext zurückgesetzt');
    return true;
  }
};

// Exportiere Funktionen für direkten Zugriff
export const initDialogContext = (config) => window.ClaraKI.DialogContext.init(config);
export const addToHistory = (message, isUser, metadata) => window.ClaraKI.DialogContext.addToHistory(message, isUser, metadata);
export const updateCurrentTopic = (message) => window.ClaraKI.DialogContext.updateCurrentTopic(message);
export const extractEntities = (message) => window.ClaraKI.DialogContext.extractEntities(message);
export const enhanceResponse = (response, intent) => window.ClaraKI.DialogContext.enhanceResponse(response, intent);
export const summarizeConversation = () => window.ClaraKI.DialogContext.summarizeConversation();
export const resetDialogContext = () => window.ClaraKI.DialogContext.reset();

