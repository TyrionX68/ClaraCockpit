/**
 * FixedWorkingMicButton.jsx - Fixed Voice Input without Problematic APIs
 * 
 * Fixed version without problematic Permissions API:
 * - Direct getUserMedia for permission testing
 * - Simplified error handling
 * - No complex permission queries
 * - Reliable voice-to-chat functionality
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Activity, AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FixedWorkingMicButton = ({ 
  onTranscriptReceived, 
  className = '', 
  size = 'default',
  showStatus = true,
  showPermissionHelper = true 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Helper function to dispatch voice status updates
  const dispatchVoiceStatus = (updates) => {
    const event = new CustomEvent('voiceStatusUpdate', {
      detail: {
        isListening,
        isWakewordActive: false,
        lastTranscript: transcript,
        lastError: error,
        confidence: 0,
        audioLevel,
        permissionGranted,
        ...updates
      }
    });
    window.dispatchEvent(event);
  };

  // Test microphone permission without problematic Permissions API
  const testMicrophonePermission = async () => {
    try {
      console.log('🎤 [FIXED MIC] Testing microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately - we just wanted to test permission
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionGranted(true);
      setError(null);
      console.log('✅ [FIXED MIC] Microphone permission granted');
      
      dispatchVoiceStatus({ 
        permissionGranted: true, 
        lastError: null 
      });
      
      return true;
    } catch (error) {
      console.error('🚨 [FIXED MIC] Microphone permission denied:', error);
      setPermissionGranted(false);
      setError('Mikrofon-Zugriff verweigert');
      
      dispatchVoiceStatus({ 
        permissionGranted: false, 
        lastError: 'Mikrofon-Zugriff verweigert' 
      });
      
      return false;
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      // Test permissions first
      await testMicrophonePermission();
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'de-DE';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('🎤 [FIXED MIC] Voice recognition started');
          setIsListening(true);
          setError(null);
          startAudioMonitoring();
          dispatchVoiceStatus({ isListening: true, lastError: null });
        };

        recognitionRef.current.onresult = (event) => {
          const result = event.results[event.results.length - 1];
          const transcriptText = result[0].transcript;
          const confidence = result[0].confidence || 0;
          
          setTranscript(transcriptText);
          console.log('🎯 [TRANSCRIPT]', {
            text: transcriptText,
            confidence: confidence,
            isFinal: result.isFinal,
            timestamp: new Date().toISOString()
          });
          
          dispatchVoiceStatus({ 
            lastTranscript: transcriptText, 
            confidence: confidence 
          });
          
          if (result.isFinal && transcriptText.trim()) {
            console.log('📝 [SEND] Final transcript ready for chat:', {
              transcript: transcriptText,
              length: transcriptText.length,
              confidence: confidence
            });
            
            if (onTranscriptReceived) {
              try {
                onTranscriptReceived(transcriptText);
                console.log('✅ [SUCCESS] Transcript sent to chat successfully');
              } catch (error) {
                console.error('🚨 [SEND ERROR] Failed to send transcript to chat:', error);
                setError('Fehler beim Senden');
                dispatchVoiceStatus({ lastError: 'Fehler beim Senden' });
              }
            } else {
              console.warn('⚠️ [WARNING] No onTranscriptReceived callback provided');
            }
          }
        };

        recognitionRef.current.onend = () => {
          console.log('🎤 [FIXED MIC] Voice recognition ended');
          setIsListening(false);
          stopAudioMonitoring();
          setTranscript('');
          dispatchVoiceStatus({ isListening: false, audioLevel: 0 });
        };

        recognitionRef.current.onerror = (event) => {
          console.error('🚨 [FIXED MIC ERROR] Voice recognition error:', {
            error: event.error,
            message: event.message,
            timestamp: new Date().toISOString()
          });
          
          let errorMessage = 'Spracherkennung fehlgeschlagen';
          
          switch (event.error) {
            case 'not-allowed':
              errorMessage = 'Mikrofon-Zugriff verweigert';
              setPermissionGranted(false);
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
          setIsListening(false);
          stopAudioMonitoring();
          dispatchVoiceStatus({ 
            isListening: false, 
            lastError: errorMessage,
            audioLevel: 0,
            permissionGranted: event.error !== 'not-allowed' ? permissionGranted : false
          });
        };
        
        setIsInitialized(true);
      } else {
        setError('Spracherkennung nicht unterstützt');
        console.error('🚨 FixedWorkingMicButton: Speech recognition not supported');
      }
    };

    initializeSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopAudioMonitoring();
    };
  }, [onTranscriptReceived]);

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
        if (isListening && analyzer) {
          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const normalizedLevel = Math.min(average / 128, 1);
          setAudioLevel(normalizedLevel);
          
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
      
      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (isListening) {
          stopListening();
        }
      }, 8000);
      
    } catch (error) {
      console.warn('🚨 FixedWorkingMicButton: Audio monitoring failed:', error);
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

  const startListening = async () => {
    if (!recognitionRef.current) {
      setError('Spracherkennung nicht verfügbar');
      return;
    }

    // Check permissions first
    if (!permissionGranted) {
      const granted = await testMicrophonePermission();
      if (!granted) return;
    }

    try {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (error) {
      console.error('🚨 FixedWorkingMicButton: Failed to start listening:', error);
      setError(error.message);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button disabled size={size} variant="outline" className="opacity-50">
          <Mic className="w-4 h-4" />
        </Button>
        {showStatus && (
          <span className="text-xs text-red-500">
            Spracherkennung nicht unterstützt
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Main Mic Button */}
      <div className="relative">
        <Button
          onClick={handleMicClick}
          size={size}
          variant={isListening ? "default" : "outline"}
          disabled={!isInitialized}
          className={`
            transition-all duration-200
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
              : 'hover:bg-accent'
            }
            ${error ? 'border-red-500' : ''}
            ${!permissionGranted ? 'border-yellow-500' : ''}
          `}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : !permissionGranted ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
        
        {/* Recording indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Permission Helper */}
      {showPermissionHelper && !permissionGranted && (
        <Button
          onClick={testMicrophonePermission}
          size="sm"
          variant="outline"
          className="text-xs border-yellow-500 text-yellow-600"
        >
          <Settings className="w-3 h-3 mr-1" />
          Erlauben
        </Button>
      )}

      {/* Audio Level Bars */}
      {isListening && (
        <div className="flex items-center gap-1 h-6">
          {[...Array(5)].map((_, i) => {
            const isActive = i < Math.ceil(audioLevel * 5);
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isActive ? 'bg-green-500 h-4' : 'bg-gray-300 h-2'
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
            error ? 'text-red-500' : 
            !permissionGranted ? 'text-yellow-500' :
            'text-gray-500'
          }`}>
            {isListening ? '🎧 Clara hört zu...' : 
             error ? '⚠️ Fehler' : 
             !permissionGranted ? '🔒 Berechtigung erforderlich' :
             '🎙️ Bereit'}
          </span>
          
          {error && (
            <span className="text-xs text-red-500">
              {error}
            </span>
          )}
          
          {transcript && isListening && (
            <span className="text-xs text-blue-600 max-w-32 truncate">
              "{transcript}"
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

export default FixedWorkingMicButton;

