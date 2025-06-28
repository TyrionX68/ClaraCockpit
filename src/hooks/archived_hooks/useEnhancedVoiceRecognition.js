import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Enhanced Voice Recognition Hook with improved microphone handling
 * Addresses common browser permission and device issues
 */
export const useEnhancedVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Check browser support and initialize
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize recognition with enhanced settings
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'de-DE';
      recognition.maxAlternatives = 1;
      
      // Enhanced event handlers
      recognition.onstart = () => {
        console.log('🎤 Enhanced Voice Recognition started');
        setIsListening(true);
        setError(null);
        retryCountRef.current = 0;
        
        // Set timeout to prevent hanging
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            setError('Timeout: Keine Sprache erkannt');
          }
        }, 10000); // 10 seconds timeout
      };
      
      recognition.onresult = (event) => {
        console.log('🎤 Enhanced Voice Recognition result received');
        clearTimeout(timeoutRef.current);
        
        if (event.results.length > 0) {
          const result = event.results[0][0].transcript;
          console.log('📝 Transcript:', result);
          setTranscript(result);
          setError(null);
        }
      };
      
      recognition.onend = () => {
        console.log('🎤 Enhanced Voice Recognition ended');
        clearTimeout(timeoutRef.current);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('🚨 Enhanced Voice Recognition error:', event.error);
        clearTimeout(timeoutRef.current);
        setIsListening(false);
        
        // Enhanced error handling with retry logic
        switch (event.error) {
          case 'not-allowed':
            setError('Mikrofon-Berechtigung verweigert. Bitte erlauben Sie den Mikrofon-Zugriff.');
            setPermissionStatus('denied');
            break;
          case 'no-speech':
            if (retryCountRef.current < maxRetries) {
              retryCountRef.current++;
              setError(`Keine Sprache erkannt. Versuch ${retryCountRef.current}/${maxRetries}`);
              // Auto-retry after 1 second
              setTimeout(() => {
                if (!isListening) {
                  startListening();
                }
              }, 1000);
            } else {
              setError('Keine Sprache erkannt. Bitte sprechen Sie deutlicher.');
            }
            break;
          case 'audio-capture':
            setError('Mikrofon nicht verfügbar. Prüfen Sie Ihre Geräte-Einstellungen.');
            break;
          case 'network':
            setError('Netzwerk-Fehler. Prüfen Sie Ihre Internetverbindung.');
            break;
          default:
            setError(`Voice-Fehler: ${event.error}`);
        }
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Speech Recognition wird von diesem Browser nicht unterstützt');
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Request microphone permission explicitly
  const requestMicrophonePermission = useCallback(async () => {
    try {
      console.log('🎤 Requesting microphone permission...');
      
      // Try to get user media to trigger permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus('granted');
      setError(null);
      console.log('✅ Microphone permission granted');
      return true;
    } catch (err) {
      console.error('❌ Microphone permission denied:', err);
      setPermissionStatus('denied');
      
      if (err.name === 'NotAllowedError') {
        setError('Mikrofon-Berechtigung verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.');
      } else if (err.name === 'NotFoundError') {
        setError('Kein Mikrofon gefunden. Bitte schließen Sie ein Mikrofon an.');
      } else {
        setError(`Mikrofon-Fehler: ${err.message}`);
      }
      return false;
    }
  }, []);

  // Start listening with enhanced error handling
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Speech Recognition wird nicht unterstützt');
      return false;
    }

    if (isListening) {
      console.log('🎤 Already listening, ignoring start request');
      return false;
    }

    // Clear previous transcript and errors
    setTranscript('');
    setError(null);

    // Request permission first if unknown
    if (permissionStatus === 'unknown' || permissionStatus === 'denied') {
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return false;
      }
    }

    try {
      if (recognitionRef.current) {
        console.log('🎤 Starting enhanced voice recognition...');
        recognitionRef.current.start();
        return true;
      }
    } catch (err) {
      console.error('🚨 Failed to start recognition:', err);
      setError(`Start-Fehler: ${err.message}`);
      return false;
    }
    
    return false;
  }, [isSupported, isListening, permissionStatus, requestMicrophonePermission]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log('🎤 Stopping enhanced voice recognition...');
      recognitionRef.current.stop();
      clearTimeout(timeoutRef.current);
    }
  }, [isListening]);

  // Toggle listening state
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    permissionStatus,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    requestMicrophonePermission
  };
};

