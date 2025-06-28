import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Speech Synthesis Hook for Clara's Audio Output
 * Provides text-to-speech functionality with SSML support and voice customization
 */
export const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [error, setError] = useState(null);
  
  // Speech settings
  const [settings, setSettings] = useState({
    rate: 1.0,      // 0.1 to 10
    pitch: 1.0,     // 0 to 2
    volume: 0.8,    // 0 to 1
    lang: 'de-DE'
  });

  const utteranceRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = synthRef.current.getVoices();
        console.log('🔊 Available voices:', availableVoices.length);
        
        // Filter German voices
        const germanVoices = availableVoices.filter(voice => 
          voice.lang.startsWith('de') || voice.lang.includes('DE')
        );
        
        setVoices(availableVoices);
        
        // Select best German voice
        const preferredVoice = germanVoices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Anna')
        ) || germanVoices[0] || availableVoices[0];
        
        if (preferredVoice) {
          setSelectedVoice(preferredVoice);
          console.log('🎙️ Selected voice:', preferredVoice.name, preferredVoice.lang);
        }
      };

      // Load voices immediately and on voiceschanged event
      loadVoices();
      synthRef.current.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        if (synthRef.current) {
          synthRef.current.removeEventListener('voiceschanged', loadVoices);
        }
      };
    } else {
      setIsSupported(false);
      setError('Speech Synthesis wird von diesem Browser nicht unterstützt');
    }
  }, []);

  // Parse SSML to extract text and apply basic formatting
  const parseSSML = useCallback((ssmlText) => {
    if (!ssmlText) return { text: '', rate: settings.rate, pitch: settings.pitch };
    
    // Remove SSML tags and extract text
    let text = ssmlText.replace(/<speak[^>]*>/gi, '').replace(/<\/speak>/gi, '');
    
    // Extract rate from prosody tags
    let rate = settings.rate;
    const rateMatch = text.match(/<prosody[^>]*rate="([^"]*)"[^>]*>/i);
    if (rateMatch) {
      const rateValue = rateMatch[1];
      if (rateValue === 'slow') rate = 0.7;
      else if (rateValue === 'fast') rate = 1.3;
      else if (rateValue.includes('%')) {
        const percentage = parseInt(rateValue.replace('%', ''));
        rate = percentage / 100;
      }
    }
    
    // Extract pitch from prosody tags
    let pitch = settings.pitch;
    const pitchMatch = text.match(/<prosody[^>]*pitch="([^"]*)"[^>]*>/i);
    if (pitchMatch) {
      const pitchValue = pitchMatch[1];
      if (pitchValue.includes('+')) {
        const increase = parseInt(pitchValue.replace('+', '').replace('%', ''));
        pitch = Math.min(2, settings.pitch + (increase / 100));
      } else if (pitchValue.includes('-')) {
        const decrease = parseInt(pitchValue.replace('-', '').replace('%', ''));
        pitch = Math.max(0, settings.pitch - (decrease / 100));
      }
    }
    
    // Remove all remaining SSML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return { text, rate, pitch };
  }, [settings.rate, settings.pitch]);

  // Speak text with optional SSML support
  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !synthRef.current) {
      setError('Speech Synthesis nicht verfügbar');
      return false;
    }

    // Stop any current speech
    if (isSpeaking) {
      synthRef.current.cancel();
    }

    try {
      // Parse SSML if provided
      const { text: cleanText, rate, pitch } = parseSSML(text);
      
      if (!cleanText.trim()) {
        console.warn('🔊 Empty text provided for speech');
        return false;
      }

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Apply settings
      utterance.rate = options.rate || rate;
      utterance.pitch = options.pitch || pitch;
      utterance.volume = options.volume || settings.volume;
      utterance.lang = options.lang || settings.lang;
      
      // Set voice
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Event handlers
      utterance.onstart = () => {
        console.log('🔊 Speech started:', cleanText.substring(0, 50) + '...');
        setIsSpeaking(true);
        setIsPaused(false);
        setError(null);
      };

      utterance.onend = () => {
        console.log('🔊 Speech ended');
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        console.error('🚨 Speech error:', event.error);
        setIsSpeaking(false);
        setIsPaused(false);
        setError(`Speech-Fehler: ${event.error}`);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      // Store reference and speak
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
      
      console.log('🎙️ Speaking with voice:', selectedVoice?.name || 'default');
      return true;
      
    } catch (err) {
      console.error('🚨 Failed to speak:', err);
      setError(`Speech-Fehler: ${err.message}`);
      return false;
    }
  }, [isSupported, isSpeaking, selectedVoice, settings, parseSSML]);

  // Stop speaking
  const stop = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSpeaking]);

  // Pause speaking
  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  // Resume speaking
  const resume = useCallback(() => {
    if (synthRef.current && isSpeaking && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, [isSpeaking, isPaused]);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Change voice
  const changeVoice = useCallback((voiceName) => {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
      console.log('🎙️ Voice changed to:', voice.name);
    }
  }, [voices]);

  // Get German voices
  const getGermanVoices = useCallback(() => {
    return voices.filter(voice => 
      voice.lang.startsWith('de') || voice.lang.includes('DE')
    );
  }, [voices]);

  return {
    // State
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    error,
    settings,
    
    // Actions
    speak,
    stop,
    pause,
    resume,
    updateSettings,
    changeVoice,
    
    // Utilities
    getGermanVoices,
    parseSSML
  };
};

