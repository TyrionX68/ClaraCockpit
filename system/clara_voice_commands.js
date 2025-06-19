// Clara360 Voice Commands System
// Vollständige Sprachsteuerung für Hausverwaltung
// Basierend auf dem Clara360-Vollprojekt

class ClaraVoiceCommands {
  constructor() {
    this.isSupported = false;
    this.isListening = false;
    this.isProcessing = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.synthesis = null;
    this.commands = new Map();
    this.context = {
      currentPage: 'dashboard',
      selectedTenant: null,
      lastAction: null
    };
    
    this.init();
  }

  async init() {
    await this.checkSupport();
    this.setupSpeechRecognition();
    this.setupSpeechSynthesis();
    this.registerCommands();
    this.createVoiceUI();
    console.log('🎤 Clara Voice Commands initialisiert');
  }

  checkSupport() {
    return new Promise((resolve) => {
      // Check Web Speech API support
      this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      
      if (this.isSupported) {
        console.log('✅ Spracherkennung unterstützt');
      } else {
        console.warn('⚠️ Spracherkennung nicht unterstützt');
      }
      
      resolve(this.isSupported);
    });
  }

  setupSpeechRecognition() {
    if (!this.isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Konfiguration
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'de-DE';
    this.recognition.maxAlternatives = 3;

    // Event Handlers
    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateVoiceUI();
      this.showFeedback('🎤 Ich höre zu...', 'listening');
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.processCommand(finalTranscript.trim());
      } else {
        this.showFeedback(`🎤 "${interimTranscript}"`, 'interim');
      }
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      this.isProcessing = false;
      this.updateVoiceUI();
      
      let errorMessage = 'Sprachfehler aufgetreten';
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'Keine Sprache erkannt';
          break;
        case 'audio-capture':
          errorMessage = 'Mikrofon nicht verfügbar';
          break;
        case 'not-allowed':
          errorMessage = 'Mikrofon-Berechtigung verweigert';
          break;
      }
      
      this.showFeedback(`❌ ${errorMessage}`, 'error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.updateVoiceUI();
    };
  }

  setupSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      console.log('✅ Sprachausgabe verfügbar');
    } else {
      console.warn('⚠️ Sprachausgabe nicht unterstützt');
    }
  }

  registerCommands() {
    // Navigation Commands
    this.commands.set(/^(gehe zu|öffne|zeige) dashboard$/i, {
      action: () => this.navigateTo('dashboard'),
      description: 'Zum Dashboard navigieren'
    });

    this.commands.set(/^(gehe zu|öffne|zeige) (mieter|eigentümer)$/i, {
      action: () => this.navigateTo('eigentümer'),
      description: 'Zur Mieterverwaltung navigieren'
    });

    this.commands.set(/^(gehe zu|öffne|zeige) banking$/i, {
      action: () => this.openBanking(),
      description: 'Banking-Panel öffnen'
    });

    this.commands.set(/^(gehe zu|öffne|zeige) whatsapp$/i, {
      action: () => this.openWhatsApp(),
      description: 'WhatsApp-Panel öffnen'
    });

    this.commands.set(/^(gehe zu|öffne|zeige) outlook$/i, {
      action: () => this.openOutlook(),
      description: 'Outlook-Panel öffnen'
    });

    // Functional Commands
    this.commands.set(/^neue nachricht an (.+)$/i, {
      action: (match) => this.createMessage(match[1]),
      description: 'Neue Nachricht erstellen'
    });

    this.commands.set(/^zeige rückstände$/i, {
      action: () => this.showArrears(),
      description: 'Rückstände anzeigen'
    });

    this.commands.set(/^zeige transaktionen$/i, {
      action: () => this.showTransactions(),
      description: 'Transaktionen anzeigen'
    });

    this.commands.set(/^erstelle bericht$/i, {
      action: () => this.createReport(),
      description: 'Bericht erstellen'
    });

    // System Commands
    this.commands.set(/^hilfe|was kann ich sagen$/i, {
      action: () => this.showHelp(),
      description: 'Hilfe anzeigen'
    });

    this.commands.set(/^stopp|stop|beenden$/i, {
      action: () => this.stopListening(),
      description: 'Spracherkennung beenden'
    });

    // Clara AI Commands
    this.commands.set(/^clara (.+)$/i, {
      action: (match) => this.askClara(match[1]),
      description: 'Clara AI fragen'
    });

    // Quick Actions
    this.commands.set(/^schnellübersicht$/i, {
      action: () => this.quickOverview(),
      description: 'Schnellübersicht anzeigen'
    });

    this.commands.set(/^notfall|dringend$/i, {
      action: () => this.emergencyMode(),
      description: 'Notfall-Modus aktivieren'
    });

    console.log(`🎯 ${this.commands.size} Sprachbefehle registriert`);
  }

  async processCommand(transcript) {
    this.isProcessing = true;
    this.updateVoiceUI();
    
    console.log('🎤 Verarbeite Befehl:', transcript);
    this.showFeedback(`🔄 Verarbeite: "${transcript}"`, 'processing');

    // Suche passenden Befehl
    let commandFound = false;
    
    for (const [pattern, command] of this.commands) {
      const match = transcript.match(pattern);
      if (match) {
        commandFound = true;
        try {
          await command.action(match);
          this.showFeedback(`✅ Befehl ausgeführt: ${command.description}`, 'success');
          this.speak(`Befehl ausgeführt: ${command.description}`);
        } catch (error) {
          console.error('Fehler bei Befehlsausführung:', error);
          this.showFeedback(`❌ Fehler: ${error.message}`, 'error');
          this.speak('Entschuldigung, es ist ein Fehler aufgetreten.');
        }
        break;
      }
    }

    if (!commandFound) {
      // Fallback: Clara AI fragen
      this.showFeedback(`🤖 Frage Clara AI: "${transcript}"`, 'ai');
      await this.askClara(transcript);
    }

    this.isProcessing = false;
    this.updateVoiceUI();
  }

  // Navigation Methods
  navigateTo(page) {
    const links = {
      'dashboard': 'a[href*="dashboard"], a:contains("Dashboard")',
      'eigentümer': 'a[href*="eigentümer"], a:contains("Eigentümer")',
      'objekte': 'a[href*="objekte"], a:contains("Objekte")',
      'rückstände': 'a[href*="rückstände"], a:contains("Rückstände")',
      'zahlungen': 'a[href*="zahlungen"], a:contains("Zahlungen")',
      'berichte': 'a[href*="berichte"], a:contains("Berichte")'
    };

    const selector = links[page];
    if (selector) {
      const element = document.querySelector(selector);
      if (element) {
        element.click();
        this.context.currentPage = page;
        return true;
      }
    }
    
    throw new Error(`Seite "${page}" nicht gefunden`);
  }

  openBanking() {
    if (window.claraBanking) {
      window.claraBanking.openBankingPanel();
      return true;
    }
    throw new Error('Banking-System nicht verfügbar');
  }

  openWhatsApp() {
    if (window.claraWhatsApp) {
      window.claraWhatsApp.openWhatsAppPanel();
      return true;
    }
    throw new Error('WhatsApp-Integration nicht verfügbar');
  }

  openOutlook() {
    if (window.claraOutlook) {
      window.claraOutlook.openOutlookPanel();
      return true;
    }
    throw new Error('Outlook-Integration nicht verfügbar');
  }

  // Functional Methods
  createMessage(recipient) {
    // Öffne Mieter-Kommunikation
    this.navigateTo('mieter-kommunikation');
    
    // Warte kurz und fülle Empfänger aus
    setTimeout(() => {
      const recipientSelect = document.querySelector('select[placeholder*="Empfänger"], select:has(option:contains("Empfänger"))');
      if (recipientSelect) {
        // Suche passenden Mieter
        const options = Array.from(recipientSelect.options);
        const matchingOption = options.find(option => 
          option.textContent.toLowerCase().includes(recipient.toLowerCase())
        );
        
        if (matchingOption) {
          recipientSelect.value = matchingOption.value;
          recipientSelect.dispatchEvent(new Event('change'));
        }
      }
    }, 1000);
  }

  showArrears() {
    this.navigateTo('rückstände');
  }

  showTransactions() {
    if (window.claraBanking) {
      window.claraBanking.openBankingPanel();
      // Wechsle zum Transaktionen-Tab
      setTimeout(() => {
        const transactionsTab = document.querySelector('[data-tab="transactions"]');
        if (transactionsTab) {
          transactionsTab.click();
        }
      }, 500);
    } else {
      this.navigateTo('zahlungen');
    }
  }

  createReport() {
    this.navigateTo('berichte');
  }

  async askClara(question) {
    // Integration mit Clara GPT-Panel
    if (window.ClaraGPT) {
      try {
        const response = await window.ClaraGPT.processMessage(question);
        this.speak(response);
        return response;
      } catch (error) {
        console.error('Clara AI Fehler:', error);
      }
    }
    
    // Fallback: Einfache Antworten
    const responses = {
      'wie geht es': 'Mir geht es gut, danke! Wie kann ich Ihnen helfen?',
      'status': 'Alle Systeme funktionieren normal. 14 Mieter, 8.360 Euro monatliche Miete.',
      'hilfe': 'Ich kann Ihnen bei der Navigation, Mieter-Kommunikation und Berichten helfen.',
      'default': 'Entschuldigung, das habe ich nicht verstanden. Sagen Sie "Hilfe" für verfügbare Befehle.'
    };
    
    const response = responses[question.toLowerCase()] || responses.default;
    this.speak(response);
    return response;
  }

  quickOverview() {
    const overview = `
      Schnellübersicht Clara360:
      14 Mieter verwaltet,
      8.360 Euro monatliche Miete,
      1 Rückstand bei Echter Mieter,
      Alle Systeme funktional.
    `;
    
    this.speak(overview);
    this.showFeedback('📊 Schnellübersicht vorgelesen', 'info');
  }

  emergencyMode() {
    this.speak('Notfall-Modus aktiviert. Wie kann ich Ihnen helfen?');
    this.showFeedback('🚨 Notfall-Modus aktiv', 'emergency');
    
    // Zeige wichtige Kontakte oder Notfall-Funktionen
    const emergencyPanel = this.createEmergencyPanel();
    document.body.appendChild(emergencyPanel);
  }

  showHelp() {
    const helpCommands = [
      'Gehe zu Dashboard',
      'Öffne Banking',
      'Öffne WhatsApp',
      'Zeige Rückstände',
      'Neue Nachricht an [Mieter]',
      'Clara [Frage]',
      'Schnellübersicht',
      'Hilfe'
    ];
    
    const helpText = `Verfügbare Sprachbefehle: ${helpCommands.join(', ')}`;
    this.speak('Hier sind die verfügbaren Sprachbefehle');
    this.showFeedback(`💡 ${helpText}`, 'help');
  }

  // Speech Synthesis
  speak(text) {
    if (!this.synthesis || this.isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.updateVoiceUI();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.updateVoiceUI();
    };

    this.synthesis.speak(utterance);
  }

  // UI Methods
  createVoiceUI() {
    const voiceUI = document.createElement('div');
    voiceUI.id = 'clara-voice-ui';
    voiceUI.className = 'voice-ui';
    voiceUI.innerHTML = `
      <div class="voice-controls">
        <button class="voice-btn" id="voice-toggle">
          <span class="voice-icon">🎤</span>
          <span class="voice-text">Sprechen</span>
        </button>
        <button class="voice-btn" id="voice-help">
          <span class="voice-icon">❓</span>
        </button>
      </div>
      <div class="voice-feedback" id="voice-feedback"></div>
    `;

    // Event Listeners
    voiceUI.querySelector('#voice-toggle').addEventListener('click', () => {
      this.toggleListening();
    });

    voiceUI.querySelector('#voice-help').addEventListener('click', () => {
      this.showHelp();
    });

    document.body.appendChild(voiceUI);
    this.updateVoiceUI();
  }

  updateVoiceUI() {
    const toggleBtn = document.getElementById('voice-toggle');
    const icon = toggleBtn?.querySelector('.voice-icon');
    const text = toggleBtn?.querySelector('.voice-text');

    if (!toggleBtn) return;

    if (this.isListening) {
      toggleBtn.classList.add('listening');
      icon.textContent = '🔴';
      text.textContent = 'Höre zu...';
    } else if (this.isProcessing) {
      toggleBtn.classList.add('processing');
      icon.textContent = '⏳';
      text.textContent = 'Verarbeite...';
    } else if (this.isSpeaking) {
      toggleBtn.classList.add('speaking');
      icon.textContent = '🔊';
      text.textContent = 'Spreche...';
    } else {
      toggleBtn.classList.remove('listening', 'processing', 'speaking');
      icon.textContent = '🎤';
      text.textContent = 'Sprechen';
    }
  }

  showFeedback(message, type = 'info') {
    const feedback = document.getElementById('voice-feedback');
    if (!feedback) return;

    feedback.textContent = message;
    feedback.className = `voice-feedback ${type}`;
    feedback.style.display = 'block';

    // Auto-hide nach 3 Sekunden
    setTimeout(() => {
      feedback.style.display = 'none';
    }, 3000);
  }

  createEmergencyPanel() {
    const panel = document.createElement('div');
    panel.className = 'emergency-panel';
    panel.innerHTML = `
      <div class="emergency-header">
        <h3>🚨 Notfall-Modus</h3>
        <button class="emergency-close">×</button>
      </div>
      <div class="emergency-content">
        <div class="emergency-contacts">
          <h4>Wichtige Kontakte</h4>
          <div class="contact-item">
            <span>Hausmeister:</span>
            <a href="tel:+4915123456789">+49 151 234 567 89</a>
          </div>
          <div class="contact-item">
            <span>Notdienst:</span>
            <a href="tel:+4915198765432">+49 151 987 654 32</a>
          </div>
        </div>
        <div class="emergency-actions">
          <button onclick="window.claraVoice.createMessage('Alle Mieter')">Rundschreiben senden</button>
          <button onclick="window.claraVoice.navigateTo('rückstände')">Rückstände prüfen</button>
        </div>
      </div>
    `;

    panel.querySelector('.emergency-close').addEventListener('click', () => {
      panel.remove();
    });

    return panel;
  }

  // Public API
  startListening() {
    if (!this.isSupported || this.isListening) return;
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Fehler beim Starten der Spracherkennung:', error);
      this.showFeedback('❌ Spracherkennung konnte nicht gestartet werden', 'error');
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  // Keyboard Shortcuts
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + V = Voice Toggle
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        this.toggleListening();
      }
      
      // Escape = Stop Listening
      if (e.key === 'Escape' && this.isListening) {
        e.preventDefault();
        this.stopListening();
      }
    });
  }
}

// CSS für Voice UI
const voiceCSS = `
.voice-ui {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.voice-controls {
  display: flex;
  gap: 10px;
}

.voice-btn {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.voice-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.voice-btn.listening {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  animation: pulse 1.5s infinite;
}

.voice-btn.processing {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.voice-btn.speaking {
  background: linear-gradient(135deg, #10b981, #059669);
}

.voice-feedback {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  max-width: 300px;
  word-wrap: break-word;
  display: none;
}

.voice-feedback.listening {
  background: rgba(59, 130, 246, 0.9);
}

.voice-feedback.processing {
  background: rgba(245, 158, 11, 0.9);
}

.voice-feedback.success {
  background: rgba(16, 185, 129, 0.9);
}

.voice-feedback.error {
  background: rgba(239, 68, 68, 0.9);
}

.voice-feedback.emergency {
  background: rgba(239, 68, 68, 0.9);
  border: 2px solid #fca5a5;
}

.emergency-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1002;
  min-width: 400px;
  max-width: 90vw;
}

.emergency-header {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 1rem;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.emergency-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.emergency-content {
  padding: 1.5rem;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.contact-item a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.emergency-actions {
  margin-top: 1rem;
  display: flex;
  gap: 10px;
}

.emergency-actions button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .voice-ui {
    bottom: 10px;
    right: 10px;
  }
  
  .voice-btn {
    padding: 10px 16px;
    font-size: 12px;
  }
  
  .voice-feedback {
    max-width: 250px;
    font-size: 12px;
  }
  
  .emergency-panel {
    min-width: 300px;
  }
}
`;

// CSS injizieren
const voiceStyle = document.createElement('style');
voiceStyle.textContent = voiceCSS;
document.head.appendChild(voiceStyle);

// Auto-Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.claraVoice = new ClaraVoiceCommands();
    console.log('🎤 Clara Voice Commands bereit');
  }, 3000);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaraVoiceCommands;
}

