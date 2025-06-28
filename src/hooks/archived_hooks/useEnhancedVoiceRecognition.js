import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Enhanced Voice Recognition Hook with Wake-Word System
 * Features:
 * - Wake-word detection ("Hey Clara")
 * - Noise filtering and audio processing
 * - Continuous listening mode
 * - Confidence scoring
 * - Multi-language support
 */
export const useEnhancedVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const wakeWordTimeoutRef = useRef(null);
  const audioLevelIntervalRef = useRef(null);

  // Wake-word patterns (German and English)
  const wakeWords = [
    'hey clara', 'hallo clara', 'clara', 'hey klara', 'hallo klara', 'klara'
  ];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'de-DE';
        recognition.maxAlternatives = 3;
        
        // Enhanced settings for better accuracy
        if (recognition.serviceURI) {
          recognition.serviceURI = 'wss://speech.googleapis.com/v1/speech:recognize';
        }
        
        recognition.onstart = () => {
          console.log('🎙️ Enhanced Voice Recognition started');
          setError(null);
        };
        
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          let maxConfidence = 0;
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript;
            const confidence = result[0].confidence || 0;
            
            maxConfidence = Math.max(maxConfidence, confidence);
            
            if (result.isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          const fullTranscript = finalTranscript || interimTranscript;
          setTranscript(fullTranscript);
          setConfidence(maxConfidence);
          
          // Check for wake-word
          if (isWakeWordActive && !wakeWordDetected) {
            checkForWakeWord(fullTranscript.toLowerCase());
          }
          
          // Auto-process final results
          if (finalTranscript && (wakeWordDetected || !isWakeWordActive)) {
            processVoiceCommand(finalTranscript, maxConfidence);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('🚨 Voice Recognition Error:', event.error);
          setError(`Voice recognition error: ${event.error}`);
          
          // Auto-restart on certain errors
          if (event.error === 'network' || event.error === 'audio-capture') {
            setTimeout(() => {
              if (isListening) {
                startListening();
              }
            }, 1000);
          }
        };
        
        recognition.onend = () => {
          console.log('🎙️ Voice Recognition ended');
          setIsListening(false);
          
          // Auto-restart if in continuous mode
          if (isWakeWordActive && !error) {
            setTimeout(() => {
              startListening();
            }, 100);
          }
        };
        
        recognitionRef.current = recognition;
      } else {
        setError('Speech recognition not supported in this browser');
      }
    }
  }, []);

  // Initialize audio context for level monitoring
  const initializeAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      
      // Start monitoring audio levels
      startAudioLevelMonitoring();
      
    } catch (err) {
      console.error('🚨 Audio Context Error:', err);
      setError('Microphone access denied');
    }
  }, []);

  // Monitor audio levels for visual feedback
  const startAudioLevelMonitoring = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(Math.round((average / 255) * 100));
      }
    };
    
    audioLevelIntervalRef.current = setInterval(updateAudioLevel, 100);
  }, []);

  // Check for wake-word in transcript
  const checkForWakeWord = useCallback((transcript) => {
    const foundWakeWord = wakeWords.some(word => 
      transcript.includes(word) || 
      transcript.replace(/\s+/g, '').includes(word.replace(/\s+/g, ''))
    );
    
    if (foundWakeWord) {
      console.log('🎯 Wake-word detected:', transcript);
      setWakeWordDetected(true);
      setTranscript(''); // Clear wake-word from transcript
      
      // Auto-timeout after 30 seconds
      if (wakeWordTimeoutRef.current) {
        clearTimeout(wakeWordTimeoutRef.current);
      }
      
      wakeWordTimeoutRef.current = setTimeout(() => {
        setWakeWordDetected(false);
        console.log('⏰ Wake-word session timeout');
      }, 30000);
    }
  }, [wakeWords]);

  // Process voice command
  const processVoiceCommand = useCallback((transcript, confidence) => {
    console.log('🎤 Processing voice command:', transcript, 'Confidence:', confidence);
    
    // Emit custom event for other components to handle
    window.dispatchEvent(new CustomEvent('voiceCommand', {
      detail: {
        transcript,
        confidence,
        timestamp: new Date().toISOString(),
        wakeWordUsed: wakeWordDetected
      }
    }));
    
    // Reset wake-word state
    if (wakeWordDetected) {
      setWakeWordDetected(false);
      if (wakeWordTimeoutRef.current) {
        clearTimeout(wakeWordTimeoutRef.current);
      }
    }
  }, [wakeWordDetected]);

  // Start listening
  const startListening = useCallback(async () => {
    if (!recognitionRef.current || !isSupported) {
      setError('Speech recognition not available');
      return;
    }

    try {
      // Initialize audio context if not already done
      if (!audioContextRef.current) {
        await initializeAudioContext();
      }
      
      recognitionRef.current.start();
      setIsListening(true);
      setError(null);
      setTranscript('');
      
    } catch (err) {
      console.error('🚨 Start Listening Error:', err);
      setError('Failed to start voice recognition');
    }
  }, [isSupported, initializeAudioContext]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    setIsListening(false);
    setWakeWordDetected(false);
    
    if (wakeWordTimeoutRef.current) {
      clearTimeout(wakeWordTimeoutRef.current);
    }
    
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
    }
  }, []);

  // Toggle wake-word mode
  const toggleWakeWordMode = useCallback(() => {
    setIsWakeWordActive(prev => {
      const newState = !prev;
      
      if (newState) {
        // Start continuous listening
        startListening();
      } else {
        // Stop listening
        stopListening();
      }
      
      return newState;
    });
  }, [startListening, stopListening]);

  // Toggle regular listening
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
      if (wakeWordTimeoutRef.current) {
        clearTimeout(wakeWordTimeoutRef.current);
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    // State
    isListening,
    isWakeWordActive,
    transcript,
    confidence,
    error,
    isSupported,
    audioLevel,
    wakeWordDetected,
    
    // Actions
    startListening,
    stopListening,
    toggleListening,
    toggleWakeWordMode,
    
    // Utilities
    clearTranscript: () => setTranscript(''),
    clearError: () => setError(null),
    
    // Status
    getStatus: () => ({
      isListening,
      isWakeWordActive,
      wakeWordDetected,
      confidence,
      audioLevel,
      error
    })
  };
};

