/**
 * EnhancedWorkingMicButton.jsx - Enhanced Voice Input with Debug Support
 * 
 * Enhanced version of WorkingMicButton with:
 * - Better microphone permission handling
 * - Improved error messages
 * - Debug event dispatching
 * - Fallback for permission issues
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Activity, AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const EnhancedWorkingMicButton = ({ 
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
  const [permissionStatus, setPermissionStatus] = useState('unknown');
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
        permissionStatus,
        ...updates
      }
    });
    window.dispatchEvent(event);
  };

  // Check microphone permissions
  const checkPermissions = async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({name: 'microphone'});
        setPermissionStatus(result.state);
        dispatchVoiceStatus({ permissionStatus: result.state });
        
        // Listen for permission changes
        result.onchange = () => {
          setPermissionStatus(result.state);
          dispatchVoiceStatus({ permissionStatus: result.state });
        };
      } else {
        setPermissionStatus('unavailable');
      }
    } catch (error) {
      console.warn('🚨 EnhancedWorkingMicButton: Permission check failed:', error);
      setPermissionStatus('error');
    }
  };

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      console.log('🎤 [PERMISSION] Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately - we just wanted permission
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus('granted');
      setError(null);
      dispatchVoiceStatus({ permissionStatus: 'granted', lastError: null });
      
      console.log('✅ [PERMISSION] Microphone access granted');
      return true;
    } catch (error) {
      console.error('🚨 [PERMISSION] Microphone access denied:', error);
      setPermissionStatus('denied');
      setError('Mikrofon-Zugriff verweigert');
      dispatchVoiceStatus({ 
        permissionStatus: 'denied', 
        lastError: 'Mikrofon-Zugriff verweigert' 
      });
      return false;
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      // Check permissions first
      await checkPermissions();
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'de-DE';
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onstart = () => {
          console.log('🎤 [VOICE START] Enhanced voice recognition started');
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
          console.log('🎤 [VOICE END] Voice recognition ended');
          setIsListening(false);
          stopAudioMonitoring();
          setTranscript('');
          dispatchVoiceStatus({ isListening: false, audioLevel: 0 });
        };

        recognitionRef.current.onerror = (event) => {
          console.error('🚨 [VOICE ERROR] Voice recognition error:', {
            error: event.error,
            message: event.message,
            timestamp: new Date().toISOString()
          });
          
          let errorMessage = 'Spracherkennung fehlgeschlagen';
          
          switch (event.error) {
            case 'not-allowed':
              errorMessage = 'Mikrofon-Zugriff verweigert';
              setPermissionStatus('denied');
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
            permissionStatus: event.error === 'not-allowed' ? 'denied' : permissionStatus
          });
        };
        
        setIsInitialized(true);
      } else {
        setError('Spracherkennung nicht unterstützt');
        console.error('🚨 EnhancedWorkingMicButton: Speech recognition not supported');
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
      console.warn('🚨 EnhancedWorkingMicButton: Audio monitoring failed:', error);
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
    if (permissionStatus === 'denied') {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    } else if (permissionStatus === 'prompt') {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    try {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (error) {
      console.error('🚨 EnhancedWorkingMicButton: Failed to start listening:', error);
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
          disabled={!isInitialized || (permissionStatus === 'denied' && !showPermissionHelper)}
          className={`
            transition-all duration-200
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
              : 'hover:bg-accent'
            }
            ${error ? 'border-red-500' : ''}
            ${permissionStatus === 'denied' ? 'border-yellow-500' : ''}
          `}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : permissionStatus === 'denied' ? (
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
      {showPermissionHelper && permissionStatus === 'denied' && (
        <Button
          onClick={requestMicrophonePermission}
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
            permissionStatus === 'denied' ? 'text-yellow-500' :
            'text-gray-500'
          }`}>
            {isListening ? '🎧 Clara hört zu...' : 
             error ? '⚠️ Fehler' : 
             permissionStatus === 'denied' ? '🔒 Berechtigung erforderlich' :
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

export default EnhancedWorkingMicButton;

