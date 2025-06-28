/**
 * RealWakewordButton.jsx - Real "Hey Clara" Wakeword Detection
 * 
 * Implements real continuous listening for "Hey Clara" wakeword:
 * - Continuous background speech recognition
 * - "Hey Clara" phrase detection
 * - Automatic voice input activation
 * - Low-power listening mode
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Ear, EarOff, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RealWakewordButton = ({ 
  onWakewordDetected,
  onTranscriptReceived,
  className = '', 
  size = 'default',
  showStatus = true 
}) => {
  const [isWakewordActive, setIsWakewordActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const wakewordRecognitionRef = useRef(null);
  const mainRecognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  // Wakeword patterns to detect
  const wakewordPatterns = [
    'hey clara',
    'hallo clara',
    'clara',
    'hey klara',
    'hallo klara',
    'klara'
  ];

  // Helper function to dispatch voice status updates
  const dispatchVoiceStatus = (updates) => {
    const event = new CustomEvent('voiceStatusUpdate', {
      detail: {
        isListening,
        isWakewordActive,
        lastTranscript: '',
        lastError: error,
        confidence: 0,
        audioLevel,
        lastWakewordDetection: lastDetection,
        ...updates
      }
    });
    window.dispatchEvent(event);
  };

  // Check if text contains wakeword
  const containsWakeword = (text) => {
    const lowerText = text.toLowerCase().trim();
    return wakewordPatterns.some(pattern => 
      lowerText.includes(pattern) || 
      lowerText.startsWith(pattern) ||
      lowerText.endsWith(pattern)
    );
  };

  // Start audio monitoring for visual feedback
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if ((isWakewordActive || isListening) && analyzer) {
          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const normalizedLevel = Math.min(average / 128, 1);
          setAudioLevel(normalizedLevel);
          
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
      
    } catch (error) {
      console.warn('🚨 RealWakewordButton: Audio monitoring failed:', error);
    }
  };

  const stopAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  // Initialize wakeword recognition (continuous background listening)
  const initializeWakewordRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Spracherkennung nicht unterstützt');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    wakewordRecognitionRef.current = new SpeechRecognition();
    
    // Configure for continuous wakeword detection
    wakewordRecognitionRef.current.continuous = true;
    wakewordRecognitionRef.current.interimResults = true;
    wakewordRecognitionRef.current.lang = 'de-DE';
    wakewordRecognitionRef.current.maxAlternatives = 1;

    wakewordRecognitionRef.current.onstart = () => {
      console.log('👂 [WAKEWORD] Continuous listening started');
      setError(null);
      dispatchVoiceStatus({ isWakewordActive: true, lastError: null });
    };

    wakewordRecognitionRef.current.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.toLowerCase().trim();
      
      console.log('👂 [WAKEWORD] Heard:', transcript);
      
      if (containsWakeword(transcript)) {
        const detection = {
          timestamp: new Date().toISOString(),
          transcript: transcript,
          confidence: result[0].confidence || 0
        };
        
        setLastDetection(detection);
        console.log('🎯 [WAKEWORD DETECTED]', detection);
        
        // Stop wakeword listening and start main voice input
        stopWakewordListening();
        startMainVoiceInput();
        
        if (onWakewordDetected) {
          onWakewordDetected(detection);
        }
        
        dispatchVoiceStatus({ 
          lastWakewordDetection: detection,
          isWakewordActive: false,
          isListening: true
        });
      }
    };

    wakewordRecognitionRef.current.onend = () => {
      console.log('👂 [WAKEWORD] Listening ended, restarting...');
      
      // Auto-restart wakeword listening after a short delay
      if (isWakewordActive) {
        restartTimeoutRef.current = setTimeout(() => {
          if (isWakewordActive && wakewordRecognitionRef.current) {
            try {
              wakewordRecognitionRef.current.start();
            } catch (error) {
              console.warn('🚨 [WAKEWORD] Restart failed:', error);
            }
          }
        }, 1000);
      }
    };

    wakewordRecognitionRef.current.onerror = (event) => {
      console.error('🚨 [WAKEWORD ERROR]', event.error);
      
      let errorMessage = 'Wakeword-Erkennung fehlgeschlagen';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Mikrofon-Zugriff verweigert';
          break;
        case 'no-speech':
          // This is normal for continuous listening, don't show as error
          return;
        case 'audio-capture':
          errorMessage = 'Mikrofon nicht verfügbar';
          break;
        case 'network':
          errorMessage = 'Netzwerkfehler';
          break;
      }
      
      setError(errorMessage);
      dispatchVoiceStatus({ lastError: errorMessage });
    };
  };

  // Initialize main voice recognition (for actual commands after wakeword)
  const initializeMainRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    mainRecognitionRef.current = new SpeechRecognition();
    
    mainRecognitionRef.current.continuous = false;
    mainRecognitionRef.current.interimResults = true;
    mainRecognitionRef.current.lang = 'de-DE';
    mainRecognitionRef.current.maxAlternatives = 1;

    mainRecognitionRef.current.onstart = () => {
      console.log('🎤 [MAIN VOICE] Started listening for command');
      setIsListening(true);
      dispatchVoiceStatus({ isListening: true });
    };

    mainRecognitionRef.current.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence || 0;
      
      console.log('🎯 [MAIN VOICE] Command:', transcript);
      
      if (result.isFinal && transcript.trim()) {
        if (onTranscriptReceived) {
          onTranscriptReceived(transcript);
        }
        
        dispatchVoiceStatus({ 
          lastTranscript: transcript,
          confidence: confidence
        });
      }
    };

    mainRecognitionRef.current.onend = () => {
      console.log('🎤 [MAIN VOICE] Command listening ended');
      setIsListening(false);
      
      // Restart wakeword listening after command is processed
      setTimeout(() => {
        if (isWakewordActive) {
          startWakewordListening();
        }
      }, 500);
      
      dispatchVoiceStatus({ isListening: false });
    };

    mainRecognitionRef.current.onerror = (event) => {
      console.error('🚨 [MAIN VOICE ERROR]', event.error);
      setIsListening(false);
      
      // Restart wakeword listening after error
      setTimeout(() => {
        if (isWakewordActive) {
          startWakewordListening();
        }
      }, 1000);
      
      dispatchVoiceStatus({ 
        isListening: false,
        lastError: `Kommando-Erkennung: ${event.error}`
      });
    };
  };

  // Start wakeword listening
  const startWakewordListening = () => {
    if (!wakewordRecognitionRef.current) return;
    
    try {
      wakewordRecognitionRef.current.start();
      startAudioMonitoring();
    } catch (error) {
      console.error('🚨 RealWakewordButton: Failed to start wakeword listening:', error);
      setError(error.message);
    }
  };

  // Stop wakeword listening
  const stopWakewordListening = () => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
    }
    
    if (wakewordRecognitionRef.current) {
      wakewordRecognitionRef.current.stop();
    }
  };

  // Start main voice input (after wakeword detected)
  const startMainVoiceInput = () => {
    if (!mainRecognitionRef.current) return;
    
    try {
      mainRecognitionRef.current.start();
      
      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (isListening && mainRecognitionRef.current) {
          mainRecognitionRef.current.stop();
        }
      }, 8000);
      
    } catch (error) {
      console.error('🚨 RealWakewordButton: Failed to start main voice input:', error);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeWakewordRecognition();
    initializeMainRecognition();

    return () => {
      stopWakewordListening();
      stopAudioMonitoring();
      
      if (mainRecognitionRef.current) {
        mainRecognitionRef.current.abort();
      }
    };
  }, []);

  // Toggle wakeword mode
  const toggleWakewordMode = () => {
    if (isWakewordActive) {
      // Stop wakeword mode
      setIsWakewordActive(false);
      stopWakewordListening();
      stopAudioMonitoring();
      
      if (isListening && mainRecognitionRef.current) {
        mainRecognitionRef.current.stop();
      }
      
      console.log('👂 [WAKEWORD] Mode deactivated');
      dispatchVoiceStatus({ 
        isWakewordActive: false,
        isListening: false,
        audioLevel: 0
      });
    } else {
      // Start wakeword mode
      setIsWakewordActive(true);
      setError(null);
      startWakewordListening();
      
      console.log('👂 [WAKEWORD] Mode activated - listening for "Hey Clara"');
      dispatchVoiceStatus({ 
        isWakewordActive: true,
        lastError: null
      });
    }
  };

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button disabled size={size} variant="outline" className="opacity-50">
          <EarOff className="w-4 h-4" />
        </Button>
        {showStatus && (
          <span className="text-xs text-red-500">
            Wakeword nicht unterstützt
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Wakeword Toggle Button */}
      <div className="relative">
        <Button
          onClick={toggleWakewordMode}
          size={size}
          variant={isWakewordActive ? "default" : "outline"}
          className={`
            transition-all duration-200
            ${isWakewordActive 
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
              : 'hover:bg-accent'
            }
            ${error ? 'border-red-500' : ''}
          `}
        >
          {isWakewordActive ? (
            <Ear className="w-4 h-4" />
          ) : (
            <EarOff className="w-4 h-4" />
          )}
        </Button>
        
        {/* Active indicator */}
        {isWakewordActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )}
        
        {/* Listening indicator */}
        {isListening && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Audio Level Bars (only when actively listening) */}
      {(isWakewordActive || isListening) && audioLevel > 0 && (
        <div className="flex items-center gap-1 h-6">
          {[...Array(3)].map((_, i) => {
            const isActive = i < Math.ceil(audioLevel * 3);
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isActive ? 'bg-blue-500 h-3' : 'bg-gray-300 h-1'
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Status */}
      {showStatus && (
        <div className="flex flex-col gap-1">
          <span className={`text-xs ${
            isListening ? 'text-green-500' : 
            isWakewordActive ? 'text-blue-500' :
            error ? 'text-red-500' : 'text-gray-500'
          }`}>
            {isListening ? '🎧 Befehl wird erkannt...' :
             isWakewordActive ? '👂 Hey Clara aktiv' :
             error ? '⚠️ Fehler' : '🗣 Hey Clara inaktiv'}
          </span>
          
          {error && (
            <span className="text-xs text-red-500">
              {error}
            </span>
          )}
          
          {lastDetection && (
            <span className="text-xs text-green-600">
              Zuletzt: {new Date(lastDetection.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      )}

      {/* Activity Indicator */}
      {(isWakewordActive || isListening) && (
        <Activity className={`w-4 h-4 animate-pulse ${
          isListening ? 'text-green-500' : 'text-blue-500'
        }`} />
      )}
    </div>
  );
};

export default RealWakewordButton;

