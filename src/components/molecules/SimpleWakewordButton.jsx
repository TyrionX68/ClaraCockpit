/**
 * SimpleWakewordButton.jsx - Simplified "Hey Clara" Wakeword Detection
 * 
 * Simplified approach without problematic APIs:
 * - Manual activation (not continuous background listening)
 * - Direct getUserMedia for permissions
 * - Simple phrase detection
 * - No complex auto-restart logic
 */

import React, { useState, useRef, useEffect } from 'react';
import { Ear, EarOff, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SimpleWakewordButton = ({ 
  onWakewordDetected,
  onTranscriptReceived,
  className = '', 
  size = 'default',
  showStatus = true 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

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
        isWakewordActive: isActive,
        lastTranscript: '',
        lastError: error,
        confidence: 0,
        audioLevel: 0,
        lastWakewordDetection: lastDetection,
        permissionGranted,
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

  // Test microphone permission without problematic Permissions API
  const testMicrophonePermission = async () => {
    try {
      console.log('🎤 [SIMPLE WAKEWORD] Testing microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately - we just wanted to test permission
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionGranted(true);
      setError(null);
      console.log('✅ [SIMPLE WAKEWORD] Microphone permission granted');
      
      dispatchVoiceStatus({ 
        permissionGranted: true, 
        lastError: null 
      });
      
      return true;
    } catch (error) {
      console.error('🚨 [SIMPLE WAKEWORD] Microphone permission denied:', error);
      setPermissionGranted(false);
      setError('Mikrofon-Zugriff erforderlich');
      
      dispatchVoiceStatus({ 
        permissionGranted: false, 
        lastError: 'Mikrofon-Zugriff erforderlich' 
      });
      
      return false;
    }
  };

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Spracherkennung nicht unterstützt');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Configure for wakeword detection
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'de-DE';
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      console.log('👂 [SIMPLE WAKEWORD] Listening started');
      setIsListening(true);
      setError(null);
      
      dispatchVoiceStatus({ 
        isListening: true, 
        lastError: null 
      });
    };

    recognitionRef.current.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.toLowerCase().trim();
      const confidence = result[0].confidence || 0;
      
      console.log('👂 [SIMPLE WAKEWORD] Heard:', transcript);
      
      if (containsWakeword(transcript)) {
        const detection = {
          timestamp: new Date().toISOString(),
          transcript: transcript,
          confidence: confidence
        };
        
        setLastDetection(detection);
        console.log('🎯 [WAKEWORD DETECTED]', detection);
        
        // Stop listening and process the command
        stopListening();
        
        // Extract command after wakeword
        const command = extractCommand(transcript);
        if (command && onTranscriptReceived) {
          console.log('📝 [COMMAND] Extracted:', command);
          onTranscriptReceived(command);
        }
        
        if (onWakewordDetected) {
          onWakewordDetected(detection);
        }
        
        dispatchVoiceStatus({ 
          lastWakewordDetection: detection,
          isListening: false
        });
        
        // Auto-restart listening after a short delay
        setTimeout(() => {
          if (isActive) {
            startListening();
          }
        }, 2000);
      }
    };

    recognitionRef.current.onend = () => {
      console.log('👂 [SIMPLE WAKEWORD] Listening ended');
      setIsListening(false);
      
      dispatchVoiceStatus({ isListening: false });
      
      // Auto-restart if still active (unless manually stopped)
      if (isActive && !error) {
        setTimeout(() => {
          if (isActive && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.warn('🚨 [SIMPLE WAKEWORD] Auto-restart failed:', error);
            }
          }
        }, 1000);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('🚨 [SIMPLE WAKEWORD ERROR]', event.error);
      setIsListening(false);
      
      let errorMessage = 'Wakeword-Erkennung fehlgeschlagen';
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Mikrofon-Zugriff verweigert';
          setPermissionGranted(false);
          break;
        case 'no-speech':
          // This is normal, don't show as error
          return;
        case 'audio-capture':
          errorMessage = 'Mikrofon nicht verfügbar';
          break;
        case 'network':
          errorMessage = 'Netzwerkfehler';
          break;
      }
      
      setError(errorMessage);
      dispatchVoiceStatus({ 
        isListening: false,
        lastError: errorMessage,
        permissionGranted: event.error !== 'not-allowed' ? permissionGranted : false
      });
    };

    return true;
  };

  // Extract command from transcript (remove wakeword)
  const extractCommand = (transcript) => {
    const lowerText = transcript.toLowerCase().trim();
    
    for (const pattern of wakewordPatterns) {
      if (lowerText.startsWith(pattern)) {
        const command = lowerText.substring(pattern.length).trim();
        return command || transcript; // Return original if no command after wakeword
      }
      if (lowerText.includes(pattern)) {
        const parts = lowerText.split(pattern);
        const command = parts[1]?.trim();
        return command || transcript;
      }
    }
    
    return transcript;
  };

  // Start listening for wakeword
  const startListening = async () => {
    if (!recognitionRef.current) {
      if (!initializeSpeechRecognition()) {
        return;
      }
    }

    // Check permission first
    if (!permissionGranted) {
      const granted = await testMicrophonePermission();
      if (!granted) return;
    }

    try {
      recognitionRef.current.start();
      
      // Auto-stop after 30 seconds to prevent infinite listening
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (isListening) {
          console.log('⏰ [SIMPLE WAKEWORD] Auto-stop after 30 seconds');
          stopListening();
        }
      }, 30000);
      
    } catch (error) {
      console.error('🚨 [SIMPLE WAKEWORD] Failed to start listening:', error);
      setError(error.message);
    }
  };

  // Stop listening
  const stopListening = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Toggle wakeword mode
  const toggleWakewordMode = async () => {
    if (isActive) {
      // Deactivate wakeword mode
      setIsActive(false);
      stopListening();
      setError(null);
      
      console.log('👂 [SIMPLE WAKEWORD] Mode deactivated');
      dispatchVoiceStatus({ 
        isWakewordActive: false,
        isListening: false,
        lastError: null
      });
    } else {
      // Activate wakeword mode
      setIsActive(true);
      setError(null);
      
      // Test permission and start listening
      const granted = await testMicrophonePermission();
      if (granted) {
        if (!recognitionRef.current) {
          initializeSpeechRecognition();
        }
        startListening();
        
        console.log('👂 [SIMPLE WAKEWORD] Mode activated - listening for "Hey Clara"');
        dispatchVoiceStatus({ 
          isWakewordActive: true,
          lastError: null
        });
      } else {
        setIsActive(false);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

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
          variant={isActive ? "default" : "outline"}
          className={`
            transition-all duration-200
            ${isActive 
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
              : 'hover:bg-accent'
            }
            ${error ? 'border-red-500' : ''}
            ${!permissionGranted && isActive ? 'border-yellow-500' : ''}
          `}
        >
          {isActive ? (
            <Ear className="w-4 h-4" />
          ) : (
            <EarOff className="w-4 h-4" />
          )}
        </Button>
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )}
        
        {/* Listening indicator */}
        {isListening && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
        
        {/* Error indicator */}
        {error && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full">
            <AlertCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Status */}
      {showStatus && (
        <div className="flex flex-col gap-1">
          <span className={`text-xs ${
            isListening ? 'text-green-500' : 
            isActive ? 'text-blue-500' :
            error ? 'text-red-500' : 'text-gray-500'
          }`}>
            {isListening ? '👂 Hört auf "Hey Clara"...' :
             isActive ? '👂 Hey Clara aktiv' :
             error ? '⚠️ Fehler' : '🗣 Hey Clara inaktiv'}
          </span>
          
          {error && (
            <span className="text-xs text-red-500">
              {error}
            </span>
          )}
          
          {!permissionGranted && isActive && (
            <span className="text-xs text-yellow-600">
              Mikrofon-Berechtigung erforderlich
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
      {isListening && (
        <Activity className="w-4 h-4 text-green-500 animate-pulse" />
      )}
    </div>
  );
};

export default SimpleWakewordButton;

