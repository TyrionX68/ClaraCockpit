/**
 * clara_voice.js
 * Voice-Modul für Clara KI
 * Integriert Spracherkennung und Text-to-Speech
 */

// Globaler Namespace für Clara-Funktionalitäten
window.ClaraKI = window.ClaraKI || {};

// Voice-Modul
window.ClaraKI.Voice = {
  isEnabled: false,
  isListening: false,
  recognition: null,
  synthesis: null,
  language: 'de-DE',
  voiceConfig: {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  },
  
  // Voice-Modul aktivieren
  activate: function() {
    console.group('[CLARA-FUSION] Voice-Modul Aktivierung');
    
    // Prüfe Browser-Unterstützung für Spracherkennung
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('⚠️ Speech Recognition wird von diesem Browser nicht unterstützt');
      console.groupEnd();
      return false;
    }
    
    // Prüfe Browser-Unterstützung für Sprachsynthese
    if (!('speechSynthesis' in window)) {
      console.warn('⚠️ Speech Synthesis wird von diesem Browser nicht unterstützt');
      console.groupEnd();
      return false;
    }
    
    try {
      // Spracherkennung initialisieren
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = this.language;
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      
      // Event-Handler für Spracherkennung
      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('🎙️ Spracherkennung gestartet');
        this.dispatchEvent('voicestart');
      };
      
      this.recognition.onend = () => {
        this.isListening = false;
        console.log('🎙️ Spracherkennung beendet');
        this.dispatchEvent('voiceend');
      };
      
      this.recognition.onerror = (event) => {
        console.error('❌ Spracherkennung Fehler:', event.error);
        this.isListening = false;
        this.dispatchEvent('voiceerror', { error: event.error });
      };
      
      // Sprachsynthese initialisieren
      this.synthesis = window.speechSynthesis;
      
      this.isEnabled = true;
      console.log('✅ Clara Voice-Modul erfolgreich aktiviert');
      this.dispatchEvent('voiceactivated');
      console.groupEnd();
      return true;
    } catch (err) {
      console.error('❌ Fehler bei Voice-Modul Aktivierung:', err);
      console.groupEnd();
      return false;
    }
  },
  
  // Spracherkennung starten
  startListening: function(callback) {
    if (!this.isEnabled) {
      console.warn('⚠️ Voice-Modul nicht aktiviert');
      return false;
    }
    
    if (this.isListening) {
      console.warn('⚠️ Spracherkennung läuft bereits');
      return false;
    }
    
    try {
      // Event-Handler für Ergebnisse
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        console.log('🎙️ Erkannt:', transcript, '(Konfidenz:', confidence, ')');
        
        if (callback && typeof callback === 'function') {
          callback(transcript, confidence);
        }
        
        this.dispatchEvent('voiceresult', { 
          transcript: transcript, 
          confidence: confidence 
        });
      };
      
      this.recognition.start();
      return true;
    } catch (err) {
      console.error('❌ Fehler beim Starten der Spracherkennung:', err);
      return false;
    }
  },
  
  // Spracherkennung stoppen
  stopListening: function() {
    if (!this.isEnabled || !this.isListening) {
      return false;
    }
    
    try {
      this.recognition.stop();
      return true;
    } catch (err) {
      console.error('❌ Fehler beim Stoppen der Spracherkennung:', err);
      return false;
    }
  },
  
  // Text-to-Speech
  speak: function(text, options = {}) {
    if (!this.isEnabled) {
      console.warn('⚠️ Voice-Modul nicht aktiviert');
      return false;
    }
    
    try {
      // Stoppe laufende Sprachausgabe
      this.synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.language || this.language;
      utterance.rate = options.rate || this.voiceConfig.rate;
      utterance.pitch = options.pitch || this.voiceConfig.pitch;
      utterance.volume = options.volume || this.voiceConfig.volume;
      
      // Event-Handler
      utterance.onstart = () => {
        console.log('🔊 TTS gestartet');
        this.dispatchEvent('ttsstart', { text: text });
      };
      
      utterance.onend = () => {
        console.log('🔊 TTS beendet');
        this.dispatchEvent('ttsend');
      };
      
      utterance.onerror = (event) => {
        console.error('❌ TTS Fehler:', event);
        this.dispatchEvent('ttserror', { error: event });
      };
      
      // Stimme auswählen, falls verfügbar
      if (options.voice) {
        const voices = this.synthesis.getVoices();
        const selectedVoice = voices.find(voice => 
          voice.name === options.voice || 
          voice.voiceURI === options.voice
        );
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      this.synthesis.speak(utterance);
      console.log('🔊 TTS gestartet:', text);
      return true;
    } catch (err) {
      console.error('❌ Fehler bei Sprachausgabe:', err);
      return false;
    }
  },
  
  // Verfügbare Stimmen abrufen
  getVoices: function() {
    if (!this.isEnabled) {
      console.warn('⚠️ Voice-Modul nicht aktiviert');
      return [];
    }
    
    return this.synthesis.getVoices();
  },
  
  // Sprache ändern
  setLanguage: function(language) {
    this.language = language;
    
    if (this.recognition) {
      this.recognition.lang = language;
    }
    
    console.log('🌐 Sprache geändert:', language);
    return true;
  },
  
  // Voice-Konfiguration ändern
  setVoiceConfig: function(config = {}) {
    this.voiceConfig = {
      ...this.voiceConfig,
      ...config
    };
    
    console.log('⚙️ Voice-Konfiguration aktualisiert:', this.voiceConfig);
    return true;
  },
  
  // Event-System
  eventListeners: {},
  
  addEventListener: function(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
    this.eventListeners[event].push(callback);
    return true;
  },
  
  removeEventListener: function(event, callback) {
    if (!this.eventListeners[event]) {
      return false;
    }
    
    this.eventListeners[event] = this.eventListeners[event].filter(
      listener => listener !== callback
    );
    
    return true;
  },
  
  dispatchEvent: function(event, data = {}) {
    if (!this.eventListeners[event]) {
      return false;
    }
    
    this.eventListeners[event].forEach(callback => {
      callback(data);
    });
    
    return true;
  }
};

// Exportiere Funktionen für direkten Zugriff
export const activateVoice = () => window.ClaraKI.Voice.activate();
export const startListening = (callback) => window.ClaraKI.Voice.startListening(callback);
export const stopListening = () => window.ClaraKI.Voice.stopListening();
export const speak = (text, options) => window.ClaraKI.Voice.speak(text, options);
export const getVoices = () => window.ClaraKI.Voice.getVoices();
export const setLanguage = (language) => window.ClaraKI.Voice.setLanguage(language);
export const setVoiceConfig = (config) => window.ClaraKI.Voice.setVoiceConfig(config);

