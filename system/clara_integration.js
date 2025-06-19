/**
 * clara_integration_fixed.js
 * Integration der Clara KI in die TyrionX UI
 */

// Globaler Namespace für Clara-Funktionalitäten
window.ClaraKI = window.ClaraKI || {};

// Integration-Modul
window.ClaraKI.Integration = {
  isInitialized: false,
  config: {
    enableVoice: false,
    enableLogging: true,
    enableSuggestions: true
  },
  
  // Initialisierung
  init: function(config) {
    if (this.isInitialized) return true;
    
    console.group('[CLARA-FUSION] Integration');
    
    // Konfiguration übernehmen
    if (config) {
      this.config = Object.assign(this.config, config);
    }
    
    try {
      // JSON-Engine initialisieren
      if (window.ClaraKI.JSONEngine) {
        window.ClaraKI.JSONEngine.init();
        console.log('✅ Clara JSON-Engine initialisiert');
      } else {
        console.error('❌ Clara JSON-Engine nicht gefunden');
        throw new Error('JSON-Engine nicht verfügbar');
      }
      
      // Dialog-Kontext initialisieren
      if (window.ClaraKI.DialogContext) {
        window.ClaraKI.DialogContext.init();
        console.log('✅ Clara Dialog-Kontext initialisiert');
      } else {
        console.error('❌ Clara Dialog-Kontext nicht gefunden');
      }
      
      // Voice-Modul initialisieren (optional)
      if (this.config.enableVoice && window.ClaraKI.Voice) {
        window.ClaraKI.Voice.init();
        console.log('✅ Clara Voice-Modul initialisiert');
      }
      
      // Chat-Panel initialisieren
      this.initChatPanel();
      
      this.isInitialized = true;
      console.log('✅ Clara Integration abgeschlossen');
      console.groupEnd();
      return true;
    } catch (err) {
      console.error('❌ Fehler bei Integration:', err);
      console.groupEnd();
      return false;
    }
  },
  
  // Chat-Panel initialisieren
  initChatPanel: function() {
    console.log('🧠 Initialisiere Chat-Panel...');
    
    // Chat-Container Element
    const chatPanel = document.getElementById('clara-chat-panel');
    if (!chatPanel) {
      console.error('❌ Chat-Panel Element nicht gefunden');
      return false;
    }
    
    // Chat-UI erstellen
    chatPanel.innerHTML = `
      <div class="clara-chat-messages" id="clara-messages"></div>
      <div class="clara-chat-input-container">
        <input type="text" class="clara-chat-input" id="clara-input" placeholder="Wie kann ich Ihnen helfen?">
        <button class="clara-chat-send" id="clara-send">Senden</button>
      </div>
      <div class="clara-suggestions" id="clara-suggestions"></div>
    `;
    
    // Event-Listener hinzufügen
    const inputField = document.getElementById('clara-input');
    const sendButton = document.getElementById('clara-send');
    
    if (inputField && sendButton) {
      // Senden-Button
      sendButton.addEventListener('click', () => {
        this.sendMessage(inputField.value);
        inputField.value = '';
      });
      
      // Enter-Taste
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage(inputField.value);
          inputField.value = '';
        }
      });
      
      // Begrüßungsnachricht anzeigen
      this.displayBotMessage(this.getGreeting());
      
      // Vorschläge anzeigen
      if (this.config.enableSuggestions) {
        this.displaySuggestions();
      }
      
      console.log('✅ Chat-Panel initialisiert');
      return true;
    } else {
      console.error('❌ Chat-Input Elemente nicht gefunden');
      return false;
    }
  },
  
  // Nachricht senden
  sendMessage: function(text) {
    if (!text || text.trim() === '') return;
    
    // Benutzer-Nachricht anzeigen
    this.displayUserMessage(text);
    
    // Antwort generieren
    const response = this.generateResponse(text);
    
    // Bot-Antwort anzeigen (mit Verzögerung für natürlicheres Gefühl)
    setTimeout(() => {
      this.displayBotMessage(response);
    }, 500);
    
    // Kontext aktualisieren
    if (window.ClaraKI.DialogContext) {
      window.ClaraKI.DialogContext.addExchange(text, response);
    }
  },
  
  // Antwort generieren
  generateResponse: function(text) {
    if (window.ClaraKI.JSONEngine) {
      return window.ClaraKI.JSONEngine.getResponse(text);
    } else {
      return "Entschuldigung, ich kann Ihre Anfrage derzeit nicht verarbeiten.";
    }
  },
  
  // Benutzer-Nachricht anzeigen
  displayUserMessage: function(text) {
    const messagesContainer = document.getElementById('clara-messages');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'clara-message clara-user-message';
    messageElement.innerHTML = `<div class="clara-message-content">${text}</div>`;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },
  
  // Bot-Nachricht anzeigen
  displayBotMessage: function(text) {
    const messagesContainer = document.getElementById('clara-messages');
    if (!messagesContainer) return;
    
    const messageElement = document.createElement('div');
    messageElement.className = 'clara-message clara-bot-message';
    messageElement.innerHTML = `
      <div class="clara-avatar">C</div>
      <div class="clara-message-content">${text}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Sprachausgabe (optional)
    if (this.config.enableVoice && window.ClaraKI.Voice) {
      window.ClaraKI.Voice.speak(text);
    }
  },
  
  // Vorschläge anzeigen
  displaySuggestions: function() {
    const suggestionsContainer = document.getElementById('clara-suggestions');
    if (!suggestionsContainer) return;
    
    const suggestions = [
      "Wie ist mein Cashflow?",
      "Gibt es Mietrückstände?",
      "Anstehende Wartungsarbeiten"
    ];
    
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach(suggestion => {
      const suggestionElement = document.createElement('button');
      suggestionElement.className = 'clara-suggestion';
      suggestionElement.textContent = suggestion;
      
      suggestionElement.addEventListener('click', () => {
        const inputField = document.getElementById('clara-input');
        if (inputField) {
          inputField.value = suggestion;
          this.sendMessage(suggestion);
          inputField.value = '';
        }
      });
      
      suggestionsContainer.appendChild(suggestionElement);
    });
  },
  
  // Begrüßung abrufen
  getGreeting: function() {
    if (window.ClaraKI.JSONEngine) {
      return window.ClaraKI.JSONEngine.getGreeting();
    } else {
      return "Willkommen! Wie kann ich Ihnen helfen?";
    }
  }
};

// Automatische Initialisierung
document.addEventListener('DOMContentLoaded', function() {
  // Wird durch expliziten Aufruf in index.html initialisiert
});

