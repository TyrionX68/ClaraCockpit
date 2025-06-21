/**
 * clara_json_engine.js
 * Optimierte JSON-basierte Antwort-Engine für Clara KI
 * Integriert Legacy-Funktionalität in TyrionX UI
 */

// Globaler Namespace für Clara-Funktionalitäten
window.ClaraKI = window.ClaraKI || {};

// Dialog-Kontext für Konversationsverlauf
window.ClaraKI.DialogContext = {
  history: [],
  currentTopic: null,
  confidenceThreshold: 0.7,
  
  // Konversationsverlauf hinzufügen
  addToHistory: function(message, isUser = true) {
    this.history.push({
      id: Date.now(),
      text: message,
      isUser: isUser,
      timestamp: new Date().toISOString()
    });
    
    // Begrenze Historie auf 20 Einträge
    if (this.history.length > 20) {
      this.history.shift();
    }
    
    return this.history;
  },
  
  // Aktuelles Thema basierend auf Schlüsselwörtern erkennen
  updateCurrentTopic: function(message) {
    const lowerMessage = message.toLowerCase();
    
    // Einfache Themen-Erkennung
    if (lowerMessage.includes('miete') || lowerMessage.includes('einnahmen')) {
      this.currentTopic = 'miete';
    } else if (lowerMessage.includes('rückstand') || lowerMessage.includes('zahlung')) {
      this.currentTopic = 'rückstand';
    } else if (lowerMessage.includes('wartung') || lowerMessage.includes('reparatur')) {
      this.currentTopic = 'wartung';
    } else if (lowerMessage.includes('cashflow') || lowerMessage.includes('liquidität')) {
      this.currentTopic = 'cashflow';
    } else if (lowerMessage.includes('rendite') || lowerMessage.includes('gewinn')) {
      this.currentTopic = 'rendite';
    } else {
      // Thema bleibt bestehen, wenn kein neues erkannt wurde
    }
    
    return this.currentTopic;
  },
  
  // Kontext-basierte Antwort-Verbesserung
  enhanceResponse: function(response) {
    // Füge kontextbezogene Informationen hinzu, wenn verfügbar
    if (this.history.length > 2 && this.currentTopic) {
      const lastUserMessage = this.history.filter(m => m.isUser).pop();
      const previousClaraMessage = this.history.filter(m => !m.isUser).pop();
      
      if (lastUserMessage && previousClaraMessage) {
        // Einfache Kontextverbesserung
        if (this.currentTopic === 'miete' && response.includes('Miete')) {
          return response + ' Im Vergleich zum Vorjahr ist das eine Steigerung von 3,2%.';
        } else if (this.currentTopic === 'cashflow' && response.includes('Cashflow')) {
          return response + ' Die Prognose basiert auf historischen Daten und aktuellen Mietverträgen.';
        }
      }
    }
    
    return response;
  },
  
  // Kontext zurücksetzen
  reset: function() {
    this.history = [];
    this.currentTopic = null;
  }
};

// JSON Response Engine
window.ClaraKI.JSONEngine = {
  responses: null,
  uiConfig: null,
  isInitialized: false,
  
  // Initialisierung der Engine
  init: async function() {
    if (this.isInitialized) return true;
    
    try {
      console.group('[CLARA-FUSION] JSONEngine Initialisierung');
      
      // Lade JSON-Antworten
      const res = await fetch('/data/clara_ki_responses.json');
      const data = await res.json();
      
      if (data && data.responses) {
        this.responses = data.responses;
        this.uiConfig = data.ui || {};
        this.isInitialized = true;
        console.log('✅ JSON-Antworten geladen:', this.responses.length, 'Einträge');
        console.log('✅ UI-Konfiguration geladen:', this.uiConfig);
      } else {
        console.error('❌ Ungültiges JSON-Format');
        return false;
      }
      
      console.groupEnd();
      return true;
    } catch (err) {
      console.error('❌ Fehler beim Laden der JSON-Datei:', err);
      console.groupEnd();
      return false;
    }
  },
  
  // Begrüßung aus JSON laden
  getGreetingFromJSON: function() {
    if (!this.isInitialized) {
      console.warn('⚠️ JSONEngine nicht initialisiert, verwende Standard-Begrüßung');
      return 'Willkommen! Clara steht bereit.';
    }
    
    console.log('🧠 JSON-Greeting aktiviert');
    return this.uiConfig?.greeting || 'Willkommen! Clara steht bereit.';
  },
  
  // Antwort basierend auf Eingabe generieren
  getResponse: async function(userInput) {
    if (!this.isInitialized) {
      const initialized = await this.init();
      if (!initialized) {
        return {
          text: 'Entschuldigung, ich kann momentan nicht auf meine Wissensbasis zugreifen.',
          confidence: 0,
          intent: 'error'
        };
      }
    }
    
    // Aktualisiere Dialog-Kontext
    window.ClaraKI.DialogContext.addToHistory(userInput, true);
    window.ClaraKI.DialogContext.updateCurrentTopic(userInput);
    
    // Keyword-Matching
    const input = userInput.toLowerCase();
    const match = this.responses.find(entry =>
      entry.match.some(trigger => input.includes(trigger.toLowerCase()))
    );
    
    let response;
    let confidence;
    let intent;
    
    if (match) {
      response = match.response;
      confidence = 0.9; // Hohe Konfidenz bei direktem Match
      intent = match.intent;
    } else {
      response = "Dazu habe ich aktuell keine spezifischen Daten. Können Sie präziser fragen? Ich kann zu Mieten, Rückständen, Wartung, Cashflow oder Rendite helfen.";
      confidence = 0.4; // Niedrige Konfidenz bei Fallback
      intent = 'fallback';
    }
    
    // Verbessere Antwort mit Kontext
    response = window.ClaraKI.DialogContext.enhanceResponse(response);
    
    // Füge Antwort zur Historie hinzu
    window.ClaraKI.DialogContext.addToHistory(response, false);
    
    return {
      text: response,
      confidence: confidence,
      intent: intent
    };
  }
};

// Voice-Modul (optional)
window.ClaraKI.Voice = {
  isEnabled: false,
  recognition: null,
  synthesis: null,
  
  // Voice-Modul aktivieren
  activate: function() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('⚠️ Speech Recognition wird von diesem Browser nicht unterstützt');
      return false;
    }
    
    if (!('speechSynthesis' in window)) {
      console.warn('⚠️ Speech Synthesis wird von diesem Browser nicht unterstützt');
      return false;
    }
    
    // Spracherkennung initialisieren
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'de-DE';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    
    // Sprachsynthese initialisieren
    this.synthesis = window.speechSynthesis;
    
    this.isEnabled = true;
    console.log('🎙️ Clara Voice-Modul aktiviert');
    return true;
  },
  
  // Spracherkennung starten
  startListening: function(callback) {
    if (!this.isEnabled) {
      console.warn('⚠️ Voice-Modul nicht aktiviert');
      return false;
    }
    
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎙️ Erkannt:', transcript);
      if (callback && typeof callback === 'function') {
        callback(transcript);
      }
    };
    
    this.recognition.start();
    console.log('🎙️ Spracherkennung gestartet');
    return true;
  },
  
  // Text-to-Speech
  speak: function(text) {
    if (!this.isEnabled) {
      console.warn('⚠️ Voice-Modul nicht aktiviert');
      return false;
    }
    
    // Stoppe laufende Sprachausgabe
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    this.synthesis.speak(utterance);
    console.log('🔊 TTS:', text);
    return true;
  }
};

// Clara KI Integration
window.ClaraKI.Integration = {
  // Initialisiere Clara KI
  init: async function() {
    console.group('[CLARA-FUSION] Integration');
    
    // JSONEngine initialisieren
    await window.ClaraKI.JSONEngine.init();
    
    // DOM-Integration nach Seitenladung
    document.addEventListener('DOMContentLoaded', () => {
      this.integrateWithDOM();
    });
    
    // Falls DOM bereits geladen ist
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      this.integrateWithDOM();
    }
    
    console.groupEnd();
  },
  
  // Integration mit DOM-Elementen
  integrateWithDOM: function() {
    console.log('🔄 Integriere Clara KI mit DOM...');
    
    // Warte kurz, um sicherzustellen, dass alle Elemente geladen sind
    setTimeout(() => {
      // Chat-Elemente finden
      const chatPanel = document.getElementById('clara-chat-panel');
      if (!chatPanel) {
        console.warn('⚠️ Chat-Panel nicht gefunden');
        return;
      }
      
      // Prüfe, ob bereits initialisiert
      if (chatPanel.dataset.claraInitialized === 'true') {
        console.log('ℹ️ Chat-Panel bereits initialisiert');
        return;
      }
      
      // Chat-Interface erstellen oder aktualisieren
      this.setupChatInterface(chatPanel);
      
      // Als initialisiert markieren
      chatPanel.dataset.claraInitialized = 'true';
      
      console.log('✅ Clara KI erfolgreich in DOM integriert');
    }, 500);
  },
  
  // Chat-Interface einrichten
  setupChatInterface: function(chatPanel) {
    // Bestehende Inhalte beibehalten, nur Funktionalität hinzufügen
    const existingHTML = chatPanel.innerHTML;
    
    // Wenn leer, erstelle neue Interface
    if (!existingHTML.trim()) {
      chatPanel.innerHTML = `
        <div class="clara-chat-interface">
          <div class="chat-messages" id="chat-messages"></div>
          <div class="chat-input-container">
            <input type="text" id="chat-input" placeholder="Fragen Sie Clara..." />
            <button id="send-button">Senden</button>
          </div>
        </div>
      `;
    }
    
    // Chat-Elemente finden
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatInput || !sendButton || !chatMessages) {
      console.warn('⚠️ Chat-Elemente nicht gefunden');
      return;
    }
    
    // Begrüßung anzeigen
    const greeting = window.ClaraKI.JSONEngine.getGreetingFromJSON();
    const greetingMsg = document.createElement('div');
    greetingMsg.className = 'message clara-message';
    greetingMsg.textContent = greeting;
    chatMessages.appendChild(greetingMsg);
    
    // Event-Handler für Senden-Button
    sendButton.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const value = chatInput.value.trim();
      if (!value) return;
      
      // User-Nachricht anzeigen
      const userMsg = document.createElement('div');
      userMsg.className = 'message user-message';
      userMsg.textContent = value;
      chatMessages.appendChild(userMsg);
      
      // Clara denkt...
      const thinkingMsg = document.createElement('div');
      thinkingMsg.className = 'message clara-message thinking';
      thinkingMsg.innerHTML = `
        <div class="thinking-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      `;
      chatMessages.appendChild(thinkingMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Antwort generieren
      const response = await window.ClaraKI.JSONEngine.getResponse(value);
      
      // Thinking-Indikator entfernen
      chatMessages.removeChild(thinkingMsg);
      
      // Clara-Antwort anzeigen
      const claraMsg = document.createElement('div');
      claraMsg.className = 'message clara-message';
      claraMsg.textContent = response.text;
      
      // Konfidenz anzeigen, wenn niedrig
      if (response.confidence < 0.7) {
        const confidenceIndicator = document.createElement('div');
        confidenceIndicator.className = 'confidence-indicator';
        confidenceIndicator.textContent = `Vertrauen: ${Math.round(response.confidence * 100)}%`;
        claraMsg.appendChild(confidenceIndicator);
      }
      
      chatMessages.appendChild(claraMsg);
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Optional: Sprachausgabe
      if (window.ClaraKI.Voice.isEnabled) {
        window.ClaraKI.Voice.speak(response.text);
      }
    };
    
    // Event-Handler für Enter-Taste
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendButton.click();
      }
    });
    
    // Optional: Voice-Button hinzufügen
    this.addVoiceButton(chatPanel);
    
    console.log('✅ Chat-Interface eingerichtet');
  },
  
  // Voice-Button hinzufügen (optional)
  addVoiceButton: function(chatPanel) {
    // Prüfe, ob Voice-Button bereits existiert
    if (document.getElementById('clara-voice-button')) {
      return;
    }
    
    // Voice-Button erstellen
    const voiceButton = document.createElement('button');
    voiceButton.id = 'clara-voice-button';
    voiceButton.className = 'clara-voice-button';
    voiceButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `;
    
    // Styling
    voiceButton.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 80px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #007bff;
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    `;
    
    // Voice-Button zum Chat-Panel hinzufügen
    const chatInputContainer = chatPanel.querySelector('.chat-input-container');
    if (chatInputContainer) {
      chatInputContainer.style.position = 'relative';
      chatInputContainer.appendChild(voiceButton);
      
      // Event-Handler für Voice-Button
      voiceButton.addEventListener('click', () => {
        // Voice-Modul aktivieren, falls noch nicht geschehen
        if (!window.ClaraKI.Voice.isEnabled) {
          window.ClaraKI.Voice.activate();
        }
        
        // Visuelles Feedback
        voiceButton.classList.add('active');
        voiceButton.style.background = '#dc3545';
        
        // Spracherkennung starten
        window.ClaraKI.Voice.startListening((transcript) => {
          // Transkript in Chat-Input einfügen
          const chatInput = document.getElementById('chat-input');
          if (chatInput) {
            chatInput.value = transcript;
            
            // Automatisch senden
            const sendButton = document.getElementById('send-button');
            if (sendButton) {
              sendButton.click();
            }
          }
          
          // Visuelles Feedback zurücksetzen
          voiceButton.classList.remove('active');
          voiceButton.style.background = '#007bff';
        });
        
        // Timeout für Spracherkennung
        setTimeout(() => {
          voiceButton.classList.remove('active');
          voiceButton.style.background = '#007bff';
        }, 5000);
      });
    }
  }
};

// Initialisierung starten
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ Clara360 React App erfolgreich gemountet!');
  window.ClaraKI.Integration.init();
});

// Exportiere Funktionen für direkten Zugriff
export const getGreetingFromJSON = () => window.ClaraKI.JSONEngine.getGreetingFromJSON();
export const getResponse = (input) => window.ClaraKI.JSONEngine.getResponse(input);
export const activateVoice = () => window.ClaraKI.Voice.activate();

