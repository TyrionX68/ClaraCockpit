/**
 * SimpleMicButton.jsx - V6.1.9
 * 
 * Trigger für manuelle Aufnahme:
 * - Statusanzeige & Audio-Pegelintegration
 * - Auto-Stop nach 8 Sekunden oder bei Fehler
 * - Visuelle Feedback-Anzeige
 * - Integration mit VoiceSystemHandler
 */

import React, { useEffect } from 'react';
import { Mic, MicOff, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceSystemHandler } from '../../hooks/VoiceSystemHandler';

const SimpleMicButton = ({ 
  onTranscriptReceived, 
  className = '', 
  size = 'default',
  showStatus = true,
  showAudioLevel = true 
}) => {
  const {
    voiceStatus,
    isListening,
    audioLevel,
    confidence,
    transcript,
    error,
    isSupported,
    startManualListening,
    stopManualListening,
    getStatusMessage,
    getStatusColor,
    clearTranscript
  } = useVoiceSystemHandler();

  // Handle transcript completion
  useEffect(() => {
    if (transcript && !isListening && onTranscriptReceived) {
      console.log('📝 Sending transcript to parent:', transcript);
      onTranscriptReceived(transcript);
      clearTranscript();
    }
  }, [transcript, isListening, onTranscriptReceived, clearTranscript]);

  const handleMicClick = () => {
    if (isListening) {
      stopManualListening();
    } else {
      const success = startManualListening();
      if (!success) {
        console.warn('🚨 Failed to start manual listening');
      }
    }
  };

  // Audio level visualization
  const getAudioLevelBars = () => {
    const bars = [];
    const barCount = 5;
    const activeBarCount = Math.ceil(audioLevel * barCount);
    
    for (let i = 0; i < barCount; i++) {
      const isActive = i < activeBarCount && isListening;
      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-100 ${
            isActive 
              ? 'bg-green-500 h-4' 
              : 'bg-gray-300 h-2'
          }`}
          style={{
            height: isActive ? `${8 + (audioLevel * 16)}px` : '8px'
          }}
        />
      );
    }
    
    return bars;
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          disabled
          size={size}
          variant="outline"
          className="opacity-50"
        >
          <AlertCircle className="w-4 h-4" />
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
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Main Mic Button */}
      <div className="relative">
        <Button
          onClick={handleMicClick}
          size={size}
          variant={isListening ? "default" : "outline"}
          className={`
            transition-all duration-200
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
              : 'hover:bg-accent'
            }
            ${error ? 'border-red-500' : ''}
          `}
          disabled={voiceStatus === 'error'}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
        
        {/* Recording indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Audio Level Visualization */}
      {showAudioLevel && (
        <div className="flex items-center gap-1 h-6">
          {getAudioLevelBars()}
        </div>
      )}

      {/* Status Display */}
      {showStatus && (
        <div className="flex flex-col gap-1">
          <span className={`text-xs ${getStatusColor()}`}>
            {getStatusMessage()}
          </span>
          
          {/* Confidence Score */}
          {confidence > 0 && (
            <span className="text-xs text-gray-500">
              Confidence: {(confidence * 100).toFixed(1)}%
            </span>
          )}
          
          {/* Error Display */}
          {error && (
            <span className="text-xs text-red-500">
              Fehler: {error}
            </span>
          )}
          
          {/* Transcript Preview */}
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

export default SimpleMicButton;

