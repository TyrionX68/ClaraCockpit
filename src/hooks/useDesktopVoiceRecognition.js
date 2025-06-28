import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Desktop-optimized Voice Recognition Hook
 * Addresses laptop/desktop browser permission issues
 */
export const useDesktopVoiceRecognition = (options = {}) => {
  const {
    onTranscriptReceived = null,
    onError = null,
    continuous = false,
    interimResults = true,
    lang = 'de-DE',
    maxRetries = 3
  } = options;

  // State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown'); // 'granted', 'denied', 'prompt', 'unknown'
  const [microphoneAccess, setMicrophoneAccess] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const retryCountRef = useRef(0);
  const streamRef = useRef(null);

  // Check browser support and initialize
  useEffect(() => {
    const checkSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const isSupported = !!SpeechRecognition && !!navigator.mediaDevices?.getUserMedia;
      
      setIsSupported(isSupported);
      
      if (isSupported) {
        console.log('🎤 Desktop Voice Recognition: Supported');
        checkMicrophonePermission();
      } else {
        console.warn('🚨 Desktop Voice Recognition: Not supported');
        setError('Speech Recognition wird von diesem Browser nicht unterstützt');
      }
    };

    checkSupport();
  }, []);

  // Check microphone permission status
  const checkMicrophonePermission = useCallback(async () => {
    try {
      // Check permission API if available
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        setPermissionStatus(permission.state);
        
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state);
        });
      }
    } catch (err) {
      console.warn('🚨 Permission API not available:', err);
    }
  }, []);

  // Request microphone access explicitly (Desktop-specific)
  const requestMicrophoneAccess = useCallback(async () => {
    try {
      console.log('🎤 Requesting microphone access for desktop...');
      
      // Clean up any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Request microphone access with specific constraints for desktop
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;
      setMicrophoneAccess(true);
      setPermissionStatus('granted');
      setError(null);
      
      console.log('✅ Microphone access granted');
      return true;
    } catch (err) {
      console.error('🚨 Microphone access denied:', err);
      setMicrophoneAccess(false);
      setPermissionStatus('denied');
      
      let errorMessage = 'Mikrofon-Zugriff verweigert';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Mikrofon-Berechtigung verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Kein Mikrofon gefunden. Bitte schließen Sie ein Mikrofon an.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Mikrofon wird bereits von einer anderen Anwendung verwendet.';
      }
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
      return false;
    }
  }, [onError]);

  // Initialize Speech Recognition with desktop optimizations
  const initializeSpeechRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Desktop-optimized settings
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    // Event handlers
    recognition.onstart = () => {
      console.log('🎤 Desktop Speech Recognition started');
      setIsListening(true);
      setError(null);
      retryCountRef.current = 0;
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        setInterimTranscript('');
        
        if (onTranscriptReceived) {
          onTranscriptReceived(finalTranscript.trim());
        }
        
        console.log('🎤 Final transcript:', finalTranscript);
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognition.onerror = (event) => {
      console.error('🚨 Desktop Speech Recognition error:', event.error);
      setIsListening(false);
      
      let errorMessage = 'Spracherkennung fehlgeschlagen';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Mikrofon-Berechtigung verweigert. Bitte erlauben Sie den Zugriff.';
          setPermissionStatus('denied');
          break;
        case 'no-speech':
          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            console.log(`🔄 Retry ${retryCountRef.current}/${maxRetries} - No speech detected`);
            setTimeout(() => {
              if (microphoneAccess) {
                recognition.start();
              }
            }, 1000);
            return;
          }
          errorMessage = 'Keine Sprache erkannt. Bitte sprechen Sie deutlicher.';
          break;
        case 'audio-capture':
          errorMessage = 'Mikrofon kann nicht verwendet werden. Prüfen Sie die Verbindung.';
          break;
        case 'network':
          errorMessage = 'Netzwerkfehler bei der Spracherkennung.';
          break;
        default:
          errorMessage = `Spracherkennung-Fehler: ${event.error}`;
      }
      
      setError(errorMessage);
      if (onError) onError(errorMessage);
    };

    recognition.onend = () => {
      console.log('🎤 Desktop Speech Recognition ended');
      setIsListening(false);
      setInterimTranscript('');
    };

    return recognition;
  }, [isSupported, continuous, interimResults, lang, maxRetries, onTranscriptReceived, onError, microphoneAccess]);

  // Start listening with desktop-specific flow
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech Recognition wird nicht unterstützt');
      return false;
    }

    try {
      // Step 1: Ensure microphone access
      if (!microphoneAccess) {
        const accessGranted = await requestMicrophoneAccess();
        if (!accessGranted) {
          return false;
        }
      }

      // Step 2: Initialize and start recognition
      if (!recognitionRef.current) {
        recognitionRef.current = initializeSpeechRecognition();
      }

      if (recognitionRef.current && !isListening) {
        recognitionRef.current.start();
        return true;
      }
    } catch (err) {
      console.error('🚨 Failed to start listening:', err);
      setError('Spracherkennung konnte nicht gestartet werden');
      if (onError) onError('Spracherkennung konnte nicht gestartet werden');
      return false;
    }

    return false;
  }, [isSupported, microphoneAccess, requestMicrophoneAccess, initializeSpeechRecognition, isListening, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    // State
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    permissionStatus,
    microphoneAccess,
    
    // Actions
    startListening,
    stopListening,
    requestMicrophoneAccess,
    
    // Utils
    clearTranscript: () => {
      setTranscript('');
      setInterimTranscript('');
    },
    clearError: () => setError(null)
  };
};

