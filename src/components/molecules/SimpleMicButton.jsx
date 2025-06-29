/**
 * SimpleMicButton.jsx - Voice-Button für Chat-Integration v6.3.0
 * Enhanced mit VoiceWaveform Visualisierung für Voice UI 2.0
 */
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import VoiceWaveform from './VoiceWaveform';

const SimpleMicButton = ({ 
  onTranscript = null,
  autoSend = true,
  size = 'default',
  variant = 'outline',
  showStatus = false,
  showWaveform = true,
  debugMode = false,
  className = ''
}) => {
  const [lastTranscript, setLastTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  // Voice Recognition Hook
  const {
    isListening,
    transcript,
    error,
    isSupported,
    hasPermission,
    status,
    startListening,
    stopListening,
    toggleListening,
    requestMicrophonePermission,
    debugLog
  } = useVoiceRecognition({
    onTranscript: (text) => {
      debugLog('[SimpleMicButton] Transcript received', text);
      setLastTranscript(text);
      if (onTranscript && text.trim()) {
        onTranscript(text.trim());
      }
    },
    onStart: () => {
      debugLog('[SimpleMicButton] Voice recognition started');
    },
    onEnd: () => {
      debugLog('[SimpleMicButton] Voice recognition ended');
      setAudioLevel(0);
    },
    onError: (errorMsg) => {
      debugLog('[SimpleMicButton] Voice error', errorMsg);
      setAudioLevel(0);
    },
    autoSend,
    debugMode
  });

  // Simulate audio level for waveform (in real implementation, this would come from actual audio analysis)
  useEffect(() => {
    if (!isListening) {
      setAudioLevel(0);
      return;
    }

    const interval = setInterval(() => {
      // Simulate varying audio levels
      const baseLevel = 0.3;
      const variation = Math.random() * 0.7;
      setAudioLevel(baseLevel + variation);
    }, 100);

    return () => clearInterval(interval);
  }, [isListening]);

  // Button-Klick Handler
  const handleClick = async () => {
    debugLog('[SimpleMicButton] Button clicked', { isListening, hasPermission });
    
    if (!isSupported) {
      alert('Spracherkennung wird von diesem Browser nicht unterstützt');
      return;
    }

    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        alert('Mikrofon-Berechtigung erforderlich für Spracherkennung');
        return;
      }
    }

    toggleListening();
  };

  // Button-Styling basierend auf Status
  const getButtonVariant = () => {
    if (error) return 'destructive';
    if (isListening) return 'default';
    return variant;
  };

  const getButtonIcon = () => {
    if (error) return <VolumeX className="w-4 h-4" />;
    if (isListening) return <Mic className="w-4 h-4 text-red-500" />;
    return <MicOff className="w-4 h-4" />;
  };

  const getButtonTitle = () => {
    if (!isSupported) return 'Spracherkennung nicht unterstützt';
    if (error) return `Fehler: ${error}`;
    if (!hasPermission) return 'Mikrofon-Berechtigung erforderlich';
    if (isListening) return 'Aufnahme stoppen';
    return 'Spracherkennung starten';
  };

  // Status-Anzeige
  const StatusIndicator = () => {
    if (!showStatus) return null;

    const getStatusColor = () => {
      switch (status) {
        case 'active': return 'text-green-500';
        case 'requesting': return 'text-yellow-500';
        case 'error': return 'text-red-500';
        default: return 'text-gray-500';
      }
    };

    const getStatusText = () => {
      switch (status) {
        case 'active': return 'Hört zu...';
        case 'requesting': return 'Berechtigung...';
        case 'error': return 'Fehler';
        default: return 'Bereit';
      }
    };

    return (
      <div className={`text-xs ${getStatusColor()} mt-1`}>
        {getStatusText()}
      </div>
    );
  };

  // Debug-Info
  useEffect(() => {
    if (debugMode) {
      console.log('[SimpleMicButton] State update:', {
        isListening,
        transcript,
        error,
        isSupported,
        hasPermission,
        status
      });
    }
  }, [isListening, transcript, error, isSupported, hasPermission, status, debugMode]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Voice Waveform Visualization */}
      {showWaveform && isListening && (
        <div className="mb-2">
          <VoiceWaveform 
            isRecording={isListening}
            amplitude={audioLevel}
            color="purple"
            width={100}
            height={30}
            bars={6}
          />
        </div>
      )}
      
      <Button
        variant={getButtonVariant()}
        size={size}
        onClick={handleClick}
        disabled={!isSupported}
        title={getButtonTitle()}
        className={`
          ${isListening ? 'animate-pulse' : ''}
          ${error ? 'border-red-500' : ''}
          transition-all duration-200
        `}
      >
        {getButtonIcon()}
      </Button>
      
      <StatusIndicator />
      
      {/* Debug-Anzeige */}
      {debugMode && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded text-xs max-w-xs border border-gray-300 dark:border-gray-600">
          <div><strong>Status:</strong> {status}</div>
          <div><strong>Supported:</strong> {isSupported ? 'Ja' : 'Nein'}</div>
          <div><strong>Permission:</strong> {hasPermission ? 'Ja' : 'Nein'}</div>
          <div><strong>Listening:</strong> {isListening ? 'Ja' : 'Nein'}</div>
          <div><strong>Audio Level:</strong> {audioLevel.toFixed(2)}</div>
          {transcript && <div><strong>Transcript:</strong> {transcript}</div>}
          {error && <div className="text-red-500"><strong>Error:</strong> {error}</div>}
        </div>
      )}
    </div>
  );
};

export default SimpleMicButton;

