/**
 * useVoiceRecognition Hook - Vereinheitlichte Voice-Logik v6.2
 * Konsolidierte Implementation mit Mikrofon-Berechtigung und Callback-Support
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoiceRecognition = ({
  onTranscript = null,
  onStart = null,
  onEnd = null,
  onError = null,
  autoSend = false,
  debugMode = false
} = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [status, setStatus] = useState('inactive'); // inactive, requesting, active, error

  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Debug-Logging
  const debugLog = useCallback((message, data = null) => {
    if (debugMode) {
      console.log(`[VoiceRecognition] ${message}`, data || '');
    }
  }, [debugMode]);

  // Browser-Support prüfen
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const supported = !!SpeechRecognition;
    setIsSupported(supported);
    debugLog('Browser support check', { supported });

    if (supported) {
      recognitionRef.current = new SpeechRecognition();
      setupRecognition();
    }
  }, [debugLog]);

  // Recognition Setup
  const setupRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'de-DE';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      debugLog('Recognition started');
      setIsListening(true);
      setStatus('active');
      setError(null);
      onStart?.();
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      debugLog('Transcript received', { finalTranscript, interimTranscript });

      // Auto-Send bei finalem Transcript
      if (finalTranscript && autoSend && onTranscript) {
        debugLog('Auto-sending transcript', finalTranscript);
        onTranscript(finalTranscript.trim());
        setTranscript(''); // Reset nach Auto-Send
      } else if (onTranscript) {
        onTranscript(currentTranscript);
      }
    };

    recognition.onerror = (event) => {
      debugLog('Recognition error', event.error);
      setError(`Spracherkennungsfehler: ${event.error}`);
      setStatus('error');
      setIsListening(false);
      onError?.(event.error);
    };

    recognition.onend = () => {
      debugLog('Recognition ended');
      setIsListening(false);
      setStatus('inactive');
      onEnd?.();
    };
  }, [autoSend, onTranscript, onStart, onEnd, onError, debugLog]);

  // Mikrofon-Berechtigung anfordern
  const requestMicrophonePermission = useCallback(async () => {
    try {
      debugLog('Requesting microphone permission');
      setStatus('requesting');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stream sofort wieder stoppen (nur für Berechtigung)
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      setStatus('inactive');
      debugLog('Microphone permission granted');
      return true;
    } catch (err) {
      debugLog('Microphone permission denied', err.message);
      setError('Mikrofon-Zugriff verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.');
      setHasPermission(false);
      setStatus('error');
      return false;
    }
  }, [debugLog]);

  // Voice Recognition starten
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Spracherkennung wird von diesem Browser nicht unterstützt');
      return false;
    }

    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) return false;
    }

    if (isListening) {
      debugLog('Already listening, ignoring start request');
      return true;
    }

    try {
      debugLog('Starting voice recognition');
      setError(null);
      setTranscript('');
      recognitionRef.current?.start();
      
      // Timeout nach 30 Sekunden
      timeoutRef.current = setTimeout(() => {
        stopListening();
        debugLog('Recognition timeout after 30s');
      }, 30000);
      
      return true;
    } catch (err) {
      debugLog('Failed to start recognition', err.message);
      setError('Spracherkennung konnte nicht gestartet werden');
      setStatus('error');
      return false;
    }
  }, [isSupported, hasPermission, isListening, requestMicrophonePermission, debugLog]);

  // Voice Recognition stoppen
  const stopListening = useCallback(() => {
    if (!isListening) return;

    debugLog('Stopping voice recognition');
    recognitionRef.current?.stop();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [isListening, debugLog]);

  // Toggle Voice Recognition
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    // State
    isListening,
    transcript,
    error,
    isSupported,
    hasPermission,
    status,
    
    // Actions
    startListening,
    stopListening,
    toggleListening,
    requestMicrophonePermission,
    
    // Utils
    debugLog
  };
};

export default useVoiceRecognition;

