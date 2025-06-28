import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSimpleVoiceRecognition } from '@/hooks/useSimpleVoiceRecognition';

/**
 * Simple Microphone Button
 * No endless loops, clean timeouts, proper cleanup
 */
const SimpleMicButton = ({ 
  onTranscriptReceived,
  className = "",
  size = "default",
  variant = "outline"
}) => {
  const [showTranscript, setShowTranscript] = useState(false);
  
  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearError,
    clearTranscript
  } = useSimpleVoiceRecognition({
    onTranscriptReceived: (text) => {
      console.log('📝 Transcript received:', text);
      setShowTranscript(true);
      
      if (onTranscriptReceived) {
        onTranscriptReceived(text);
      }
      
      // Hide transcript after 3 seconds
      setTimeout(() => {
        setShowTranscript(false);
        clearTranscript();
      }, 3000);
    },
    onError: (err) => {
      console.error('🚨 Voice error:', err);
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        clearError();
      }, 5000);
    }
  });

  // Handle click
  const handleClick = async () => {
    if (isListening) {
      stopListening();
    } else {
      clearError();
      await startListening();
    }
  };

  // Get button styling
  const getButtonStyling = () => {
    if (!isSupported) {
      return 'bg-gray-50 text-gray-400 border-gray-300 cursor-not-allowed';
    }
    
    if (error) {
      return 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300';
    }
    
    if (isListening) {
      return 'bg-red-500 hover:bg-red-600 text-white border-red-500 animate-pulse';
    }
    
    return 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300';
  };

  // Get icon
  const getIcon = () => {
    if (!isSupported) {
      return <MicOff className="w-4 h-4" />;
    }
    
    if (isListening) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    
    if (error) {
      return <AlertCircle className="w-4 h-4" />;
    }
    
    return <Mic className="w-4 h-4" />;
  };

  // Get tooltip
  const getTooltip = () => {
    if (!isSupported) return 'Spracherkennung nicht unterstützt';
    if (error) return `Fehler: ${error}`;
    if (isListening) return 'Aufnahme läuft... (Klicken zum Stoppen)';
    return 'Sprachaufnahme starten';
  };

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={!isSupported}
        className={`${className} ${getButtonStyling()}`}
        title={getTooltip()}
      >
        {getIcon()}
      </Button>

      {/* Transcript Display */}
      {showTranscript && transcript && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-green-50 border border-green-200 rounded-md shadow-lg z-50 min-w-48 max-w-64">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-700 font-medium">Erkannt:</span>
          </div>
          <div className="text-sm text-green-800">{transcript}</div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-md shadow-lg z-50 w-64">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-700 font-medium">Fehler</span>
          </div>
          <div className="text-xs text-red-700">{error}</div>
          <div className="mt-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={clearError}
              className="text-xs h-6"
            >
              Schließen
            </Button>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute -top-1 -right-1">
        {isListening && (
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
        {error && (
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        )}
        {!isListening && !error && isSupported && (
          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
    </div>
  );
};

export default SimpleMicButton;

