/**
 * useVoiceRecognition Hook - KONSOLIDIERTE VERSION v6.2.1
 * Einziger Voice-Hook für Clara360 - Mikrofon-Fix & Callback-Support
 * MetaGovernor: Struktur vor Aktion - Stabilität garantiert
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const useVoiceRecognition = (options = {}) => {
  const {
    onTranscript = null,
    onError = null,
    onStart = null,
    onEnd = null,
    autoSend = false,
    debugMode = false
  } = options;

  // Core States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Refs
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const streamRef = useRef(null);

  // Debug Logger
  const debugLog = useCallback((message, data = null) => {
    if (debugMode) {
      console.log(`[VoiceRecognition] ${message}`, data || '');
    }
  }, [debugMode]);

  // Check browser support and initialize
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition && !!navigator.mediaDevices?.getUserMedia;
    
    setIsSupported(isSupported);
    debugLog('Browser support check', { isSupported, SpeechRecognition: !!SpeechRecognition, getUserMedia: !!navigator.mediaDevices?.getUserMedia });
    
    if (isSupported) {
      setupSpeechRecognition();
    }
    
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [debugLog]);

  // Setup Speech Recognition
  const setupSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configuration
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'de-DE';
    recognition.maxAlternatives = 1;
    
    // Event Handlers
    recognition.onstart = () => {
      debugLog('Recognition started');
      setIsListening(true);
      setError(null);
      
      if (onStart) onStart();
      
      // Safety timeout - prevent hanging
      timeoutRef.current = setTimeout(() => {
        debugLog('Recognition timeout triggered');
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          setError('Spracherkennung-Timeout (10s)');
        }
      }, 10000);
    };
    
    recognition.onresult = (event) => {
      debugLog('Recognition result received', event);
      
      let finalTranscript = '';
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);
      
      // Callback for final transcript
      if (finalTranscript && onTranscript) {
        debugLog('Final transcript callback', finalTranscript);
        onTranscript(finalTranscript.trim());
      }
      
      // Clear timeout on successful result
      if (finalTranscript && timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    
    recognition.onerror = (event) => {
      debugLog('Recognition error', event.error);
      
      let errorMessage = 'Spracherkennungsfehler';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff.';
          break;
        case 'no-speech':
          errorMessage = 'Keine Sprache erkannt. Bitte sprechen Sie deutlicher.';
          break;
        case 'audio-capture':
          errorMessage = 'Kein Mikrofon gefunden. Bitte schließen Sie ein Mikrofon an.';
          break;
        case 'network':
          errorMessage = 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.';
          break;
        default:
          errorMessage = `Spracherkennungsfehler: ${event.error}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
      
      if (onError) onError(errorMessage);
      
      cleanup();
    };
    
    recognition.onend = () => {
      debugLog('Recognition ended');
      setIsListening(false);
      
      if (onEnd) onEnd();
      
      cleanup();
    };
    
    recognitionRef.current = recognition;
    debugLog('Speech recognition setup complete');
  }, [debugLog, onTranscript, onError, onStart, onEnd]);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      debugLog('Requesting microphone permission...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      setIsEnabled(true);
      setError(null);
      
      debugLog('Microphone permission granted');
      return true;

    } catch (err) {
      debugLog('Microphone permission denied', err);
      
      let errorMessage = 'Mikrofon-Zugriff verweigert';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Mikrofon-Berechtigung verweigert. Bitte erlauben Sie den Zugriff.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Kein Mikrofon gefunden. Bitte schließen Sie ein Mikrofon an.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Mikrofon wird von diesem Browser nicht unterstützt.';
      }

      setError(errorMessage);
      if (onError) onError(errorMessage);
      return false;
    }
  }, [debugLog, onError]);

  // Start listening
  const startListening = useCallback(async () => {
    debugLog('Start listening requested');
    
    if (!isSupported) {
      const error = 'Spracherkennung wird von diesem Browser nicht unterstützt';
      setError(error);
      if (onError) onError(error);
      return false;
    }

    if (isListening) {
      debugLog('Already listening, ignoring start request');
      return true;
    }

    // Request microphone permission if not enabled
    if (!isEnabled) {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return false;
      }
    }

    if (!recognitionRef.current) {
      const error = 'Spracherkennung nicht initialisiert';
      setError(error);
      if (onError) onError(error);
      return false;
    }

    try {
      setTranscript('');
      setError(null);
      
      debugLog('Starting speech recognition...');
      recognitionRef.current.start();
      return true;
      
    } catch (err) {
      debugLog('Error starting recognition', err);
      const errorMessage = `Fehler beim Starten: ${err.message}`;
      setError(errorMessage);
      if (onError) onError(errorMessage);
      return false;
    }
  }, [isSupported, isListening, isEnabled, requestMicrophonePermission, debugLog, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    debugLog('Stop listening requested');
    
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        debugLog('Speech recognition stopped');
      } catch (err) {
        debugLog('Error stopping recognition', err);
      }
    }
    
    cleanup();
  }, [isListening, debugLog]);

  // Toggle listening
  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
    debugLog('Transcript cleared');
  }, [debugLog]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    debugLog('Error cleared');
  }, [debugLog]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  return {
    // States
    isListening,
    transcript,
    error,
    isSupported,
    isEnabled,
    
    // Actions
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    clearError,
    requestMicrophonePermission
  };
};

