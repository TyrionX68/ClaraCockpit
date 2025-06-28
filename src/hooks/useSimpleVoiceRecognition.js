import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Simplified Voice Recognition Hook
 * No retry loops, clean timeouts, proper cleanup
 */
export const useSimpleVoiceRecognition = (options = {}) => {
  const {
    onTranscriptReceived = null,
    onError = null,
    lang = 'de-DE',
    timeout = 10000 // 10 seconds max
  } = options;

  // State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const isActiveRef = useRef(false);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const supported = !!SpeechRecognition;
    setIsSupported(supported);
    
    if (supported) {
      console.log('🎤 Simple Voice Recognition: Supported');
    } else {
      console.warn('🚨 Simple Voice Recognition: Not supported');
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up voice recognition...');
    
    isActiveRef.current = false;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (err) {
        console.warn('Cleanup error:', err);
      }
    }
    
    setIsListening(false);
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech Recognition wird nicht unterstützt');
      return false;
    }

    if (isListening) {
      console.log('Already listening, stopping first...');
      cleanup();
      return false;
    }

    try {
      console.log('🎤 Starting simple voice recognition...');
      
      // Clear any previous errors
      setError(null);
      setTranscript('');
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Simple configuration
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;
      
      // Set active flag
      isActiveRef.current = true;
      
      // Set timeout to prevent hanging
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) {
          console.log('⏰ Voice recognition timeout');
          cleanup();
          setError('Zeitüberschreitung - bitte erneut versuchen');
        }
      }, timeout);
      
      // Event handlers
      recognition.onstart = () => {
        if (!isActiveRef.current) return;
        console.log('🎤 Recognition started');
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        if (!isActiveRef.current) return;
        
        const result = event.results[0];
        if (result && result.isFinal) {
          const finalTranscript = result[0].transcript.trim();
          console.log('🎤 Final transcript:', finalTranscript);
          
          setTranscript(finalTranscript);
          
          if (onTranscriptReceived && finalTranscript) {
            onTranscriptReceived(finalTranscript);
          }
        }
        
        cleanup();
      };
      
      recognition.onerror = (event) => {
        if (!isActiveRef.current) return;
        
        console.error('🚨 Recognition error:', event.error);
        
        let errorMessage = 'Spracherkennung fehlgeschlagen';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Mikrofon-Berechtigung verweigert';
            break;
          case 'no-speech':
            errorMessage = 'Keine Sprache erkannt';
            break;
          case 'audio-capture':
            errorMessage = 'Mikrofon nicht verfügbar';
            break;
          case 'network':
            errorMessage = 'Netzwerkfehler';
            break;
          default:
            errorMessage = `Fehler: ${event.error}`;
        }
        
        setError(errorMessage);
        if (onError) onError(errorMessage);
        
        cleanup();
      };
      
      recognition.onend = () => {
        console.log('🎤 Recognition ended');
        cleanup();
      };
      
      // Store reference and start
      recognitionRef.current = recognition;
      recognition.start();
      
      return true;
      
    } catch (err) {
      console.error('🚨 Failed to start recognition:', err);
      setError('Spracherkennung konnte nicht gestartet werden');
      cleanup();
      return false;
    }
  }, [isSupported, isListening, lang, timeout, onTranscriptReceived, onError, cleanup]);

  // Stop listening
  const stopListening = useCallback(() => {
    console.log('🛑 Stopping voice recognition...');
    cleanup();
  }, [cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    // State
    isListening,
    transcript,
    error,
    isSupported,
    
    // Actions
    startListening,
    stopListening,
    
    // Utils
    clearTranscript: () => setTranscript(''),
    clearError: () => setError(null)
  };
};

