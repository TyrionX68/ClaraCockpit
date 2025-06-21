/**
 * clara_injector_patch.js
 * Live-Injektor für Clara-KI-Funktionalität in TyrionX-UI
 * Aktiviert Clara-Chat ohne Design-Änderungen
 */

console.group('[CLARA LIVE RESPONSE] Injector Patch wird geladen...');

// Warte auf vollständige Seitenladung
document.addEventListener('DOMContentLoaded', function() {
  initializeClaraLiveInjection();
});

// Falls DOM bereits geladen ist
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initializeClaraLiveInjection, 100);
}

function initializeClaraLiveInjection() {
  console.log('🚀 Clara Live-Injektion startet...');
  
  // Prüfe, ob Clara-KI-Slot existiert
  const claraSlot = document.getElementById('clara-ki-slot');
  if (!claraSlot) {
    console.error('❌ Clara-KI-Slot nicht gefunden');
    return;
  }
  
  // Prüfe, ob bereits initialisiert
  if (claraSlot.dataset.claraLive === 'true') {
    console.log('ℹ️ Clara bereits live aktiviert');
    return;
  }
  
  // Erstelle Clara-Chat-Interface
  createClaraChatInterface(claraSlot);
  
  // Markiere als initialisiert
  claraSlot.dataset.claraLive = 'true';
  
  console.log('✅ Clara Live-Injektion erfolgreich abgeschlossen');
}

function createClaraChatInterface(container) {
  console.log('🎨 Erstelle Clara-Chat-Interface...');
  
  // Clara-Chat-HTML erstellen
  const chatHTML = `
    <div class="clara-chat-container" style="
      width: 100%;
      max-width: 800px;
      margin: 20px auto;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    ">
      <div class="clara-header" style="
        text-align: center;
        margin-bottom: 20px;
        color: white;
      ">
        <h2 style="margin: 0; font-size: 24px; font-weight: 600;">Clara KI-Chat</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">Ihre intelligente Hausverwaltungs-Assistentin</p>
      </div>
      
      <div class="chat-messages" id="clara-chat-messages" style="
        height: 400px;
        overflow-y: auto;
        background: rgba(255,255,255,0.95);
        border-radius: 15px;
        padding: 15px;
        margin-bottom: 15px;
        scroll-behavior: smooth;
      "></div>
      
      <div class="chat-input-area" style="
        display: flex;
        gap: 10px;
        align-items: center;
      ">
        <input type="text" id="clara-chat-input" placeholder="Fragen Sie Clara..." style="
          flex: 1;
          padding: 12px 15px;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          outline: none;
          background: rgba(255,255,255,0.9);
          color: #333;
        " />
        <button id="clara-send-button" style="
          padding: 12px 20px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.3s ease;
          min-width: 80px;
        " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
          Senden
        </button>
        <button id="clara-voice-button" style="
          padding: 12px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='#1976D2'" onmouseout="this.style.background='#2196F3'" title="Spracherkennung">
          🎤
        </button>
      </div>
      
      <div class="clara-suggestions" style="
        margin-top: 15px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
      ">
        <button class="suggestion-chip" data-suggestion="Wie ist mein Cashflow?" style="
          padding: 8px 15px;
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          💰 Cashflow
        </button>
        <button class="suggestion-chip" data-suggestion="Gibt es Rückstände?" style="
          padding: 8px 15px;
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          ⚠️ Rückstände
        </button>
        <button class="suggestion-chip" data-suggestion="Wie hoch sind meine Mieteinnahmen?" style="
          padding: 8px 15px;
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          🏠 Mieten
        </button>
        <button class="suggestion-chip" data-suggestion="Wartung erforderlich?" style="
          padding: 8px 15px;
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.3s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          🔧 Wartung
        </button>
      </div>
    </div>
  `;
  
  // HTML in Container einfügen
  container.innerHTML = chatHTML;
  
  // Event-Listener einrichten
  setupClaraEventListeners();
  
  // Begrüßung anzeigen
  showClaraGreeting();
}

function setupClaraEventListeners() {
  console.log('🔗 Richte Event-Listener ein...');
  
  const chatInput = document.getElementById('clara-chat-input');
  const sendButton = document.getElementById('clara-send-button');
  const voiceButton = document.getElementById('clara-voice-button');
  const suggestionChips = document.querySelectorAll('.suggestion-chip');
  
  // Senden-Button Event
  if (sendButton) {
    sendButton.addEventListener('click', handleSendMessage);
  }
  
  // Enter-Taste im Input
  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleSendMessage();
      }
    });
  }
  
  // Voice-Button Event
  if (voiceButton) {
    voiceButton.addEventListener('click', handleVoiceInput);
  }
  
  // Suggestion-Chips Events
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', function() {
      const suggestion = this.dataset.suggestion;
      if (chatInput) {
        chatInput.value = suggestion;
        handleSendMessage();
      }
    });
  });
  
  console.log('✅ Event-Listener eingerichtet');
}

async function handleSendMessage() {
  console.group('[CLARA LIVE RESPONSE] Nachricht wird verarbeitet...');
  
  const chatInput = document.getElementById('clara-chat-input');
  const chatMessages = document.getElementById('clara-chat-messages');
  
  if (!chatInput || !chatMessages) {
    console.error('❌ Chat-Elemente nicht gefunden');
    console.groupEnd();
    return;
  }
  
  const userMessage = chatInput.value.trim();
  if (!userMessage) {
    console.warn('⚠️ Leere Nachricht');
    console.groupEnd();
    return;
  }
  
  console.log('📝 User-Nachricht:', userMessage);
  
  // User-Nachricht anzeigen
  addMessageToChat(userMessage, 'user');
  
  // Input leeren
  chatInput.value = '';
  
  // Typing-Indikator anzeigen
  showTypingIndicator();
  
  try {
    // Clara-Antwort generieren
    const response = await getClaraResponse(userMessage);
    
    // Typing-Indikator entfernen
    hideTypingIndicator();
    
    // Clara-Antwort anzeigen
    addMessageToChat(response.text, 'clara', response.confidence);
    
    console.log('✅ Antwort erfolgreich generiert');
  } catch (error) {
    console.error('❌ Fehler bei Antwort-Generierung:', error);
    
    // Typing-Indikator entfernen
    hideTypingIndicator();
    
    // Fehler-Nachricht anzeigen
    addMessageToChat('Entschuldigung, ich kann momentan nicht antworten. Bitte versuchen Sie es später erneut.', 'clara', 0);
  }
  
  console.groupEnd();
}

function addMessageToChat(message, sender, confidence = null) {
  const chatMessages = document.getElementById('clara-chat-messages');
  if (!chatMessages) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    margin-bottom: 15px;
    display: flex;
    ${sender === 'user' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}
  `;
  
  const bubbleDiv = document.createElement('div');
  bubbleDiv.style.cssText = `
    max-width: 70%;
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.4;
    word-wrap: break-word;
    ${sender === 'user' 
      ? 'background: #007bff; color: white; border-bottom-right-radius: 4px;' 
      : 'background: #f1f3f5; color: #333; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);'
    }
  `;
  
  bubbleDiv.textContent = message;
  
  // Konfidenz-Indikator hinzufügen (nur für Clara-Nachrichten)
  if (sender === 'clara' && confidence !== null && confidence < 0.7) {
    const confidenceSpan = document.createElement('div');
    confidenceSpan.style.cssText = `
      font-size: 11px;
      opacity: 0.7;
      margin-top: 5px;
      font-style: italic;
    `;
    confidenceSpan.textContent = `Vertrauen: ${Math.round(confidence * 100)}%`;
    bubbleDiv.appendChild(confidenceSpan);
  }
  
  messageDiv.appendChild(bubbleDiv);
  chatMessages.appendChild(messageDiv);
  
  // Scroll nach unten
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
  const chatMessages = document.getElementById('clara-chat-messages');
  if (!chatMessages) return;
  
  const typingDiv = document.createElement('div');
  typingDiv.id = 'clara-typing-indicator';
  typingDiv.style.cssText = `
    margin-bottom: 15px;
    display: flex;
    justify-content: flex-start;
  `;
  
  const bubbleDiv = document.createElement('div');
  bubbleDiv.style.cssText = `
    background: #f1f3f5;
    padding: 12px 16px;
    border-radius: 18px;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  `;
  
  bubbleDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 4px;">
      <span style="color: #666; font-size: 14px;">Clara tippt</span>
      <div style="display: flex; gap: 2px;">
        <div style="width: 4px; height: 4px; background: #666; border-radius: 50%; animation: typing 1.4s infinite ease-in-out;"></div>
        <div style="width: 4px; height: 4px; background: #666; border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.2s;"></div>
        <div style="width: 4px; height: 4px; background: #666; border-radius: 50%; animation: typing 1.4s infinite ease-in-out 0.4s;"></div>
      </div>
    </div>
    <style>
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
        30% { transform: translateY(-10px); opacity: 1; }
      }
    </style>
  `;
  
  typingDiv.appendChild(bubbleDiv);
  chatMessages.appendChild(typingDiv);
  
  // Scroll nach unten
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById('clara-typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

async function getClaraResponse(userInput) {
  console.log('🧠 Generiere Clara-Antwort für:', userInput);
  
  try {
    // Lade JSON-Antworten
    const response = await fetch('/data/clara_ki_responses.json');
    const data = await response.json();
    
    if (!data || !data.responses) {
      throw new Error('Ungültige JSON-Daten');
    }
    
    // Keyword-Matching
    const input = userInput.toLowerCase();
    const match = data.responses.find(entry =>
      entry.match.some(trigger => input.includes(trigger.toLowerCase()))
    );
    
    if (match) {
      console.log('✅ Match gefunden:', match.intent);
      return {
        text: match.response,
        confidence: 0.95,
        intent: match.intent
      };
    } else {
      console.log('⚠️ Kein Match gefunden, verwende Fallback');
      return {
        text: "Dazu habe ich aktuell keine spezifischen Daten. Können Sie präziser fragen? Ich kann zu Mieten, Rückständen, Wartung, Cashflow oder Rendite helfen.",
        confidence: 0.4,
        intent: 'fallback'
      };
    }
  } catch (error) {
    console.error('❌ Fehler beim Laden der JSON-Daten:', error);
    throw error;
  }
}

function showClaraGreeting() {
  console.log('👋 Zeige Clara-Begrüßung...');
  
  setTimeout(() => {
    addMessageToChat('Willkommen zurück! Clara steht bereit. Wie kann ich Ihnen heute bei der Hausverwaltung helfen?', 'clara', 1.0);
  }, 500);
}

function handleVoiceInput() {
  console.log('🎤 Voice-Input aktiviert');
  
  // Prüfe Browser-Unterstützung
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert('Spracherkennung wird von Ihrem Browser nicht unterstützt.');
    return;
  }
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.lang = 'de-DE';
  recognition.continuous = false;
  recognition.interimResults = false;
  
  const voiceButton = document.getElementById('clara-voice-button');
  const chatInput = document.getElementById('clara-chat-input');
  
  // Visuelles Feedback
  if (voiceButton) {
    voiceButton.style.background = '#f44336';
    voiceButton.textContent = '🔴';
  }
  
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    console.log('🎤 Erkannt:', transcript);
    
    if (chatInput) {
      chatInput.value = transcript;
      handleSendMessage();
    }
  };
  
  recognition.onerror = function(event) {
    console.error('❌ Spracherkennungsfehler:', event.error);
    alert('Fehler bei der Spracherkennung: ' + event.error);
  };
  
  recognition.onend = function() {
    // Visuelles Feedback zurücksetzen
    if (voiceButton) {
      voiceButton.style.background = '#2196F3';
      voiceButton.textContent = '🎤';
    }
  };
  
  recognition.start();
}

console.log('✅ Clara Injector Patch geladen');
console.groupEnd();

