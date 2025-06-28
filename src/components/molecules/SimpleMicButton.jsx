import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

/**
 * SimpleMicButton - KONSOLIDIERTE VERSION v6.2.1
 * Einziger Voice-Button für Clara360 - Master-Hook Integration
 * MetaGovernor: Struktur vor Aktion - Auto-Send & Debug Support
 */
const SimpleMicButton = ({ 
  onTranscript,
  autoSend = false,
  debugMode = false,
  className = "",
  size = "default",
  variant = "outline",
  showStatus = true,
  showTranscript = true
}) => {
  const [localTranscript, setLocalTranscript] = useState('');
  const [showTranscriptPopup, setShowTranscriptPopup] = useState(false);
  
  const {
    isListening,
    transcript,
    error,
    isSupported,
    isEnabled,
    startListening,
    stopListening,
    clearTranscript,
    clearError,
    requestMicrophonePermission
  } = useVoiceRecognition({
    onTranscript: (text) => {
      console.log('[SimpleMicButton] Transcript received:', text);
      setLocalTranscript(text);
      
      if (showTranscript) {
        setShowTranscriptPopup(true);
        setTimeout(() => {
          setShowTranscriptPopup(false);
          clearTranscript();
        }, 3000);
      }
      
      // Auto-send to chat if enabled
      if (autoSend && onTranscript) {
        console.log('[SimpleMicButton] Auto-sending to chat:', text);
        onTranscript(text);
      } else if (onTranscript) {
        console.log('[SimpleMicButton] Manual transcript callback:', text);
        onTranscript(text);
      }
    },
    onError: (err) => {
      console.error('[SimpleMicButton] Voice error:', err);
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        clearError();
      }, 5000);
    },
    onStart: () => {
      console.log('[SimpleMicButton] Voice recognition started');
    },
    onEnd: () => {
      console.log('[SimpleMicButton] Voice recognition ended');
    },
    debugMode
  });

  // Handle button click
  const handleClick = async () => {
    console.log('[SimpleMicButton] Button clicked, isListening:', isListening);
    
    if (isListening) {
      stopListening();
    } else {
      clearError();
      const success = await startListening();
      if (!success && !isEnabled) {
        // Try to request permission explicitly
        await requestMicrophonePermission();
      }
    }
  };

  // Get button styling based on state
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
    
    if (isEnabled) {
      return 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300';
    }
    
    return 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300';
  };

  // Get appropriate icon
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
    
    if (isEnabled) {
      return <Mic className="w-4 h-4" />;
    }
    
    return <Mic className="w-4 h-4" />;
  };

  // Get tooltip text
  const getTooltip = () => {
    if (!isSupported) return 'Spracherkennung nicht unterstützt';
    if (error) return `Fehler: ${error}`;
    if (isListening) return 'Aufnahme läuft... (Klicken zum Stoppen)';
    if (!isEnabled) return 'Mikrofon-Berechtigung erforderlich';
    return 'Sprachaufnahme starten';
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        disabled={!isSupported}
        className={`${className} ${getButtonStyling()}`}
        title={getTooltip()}
      >
        {getIcon()}
        {size !== "sm" && (
          <span className="ml-2">
            {isListening ? 'Stoppen' : 'Sprechen'}
          </span>
        )}
      </Button>

      {/* Status Indicator */}
      {showStatus && (
        <div className="absolute -top-1 -right-1">
          {isListening && (
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          )}
          {error && (
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
          )}
          {!isListening && !error && isEnabled && (
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
          {!isListening && !error && !isEnabled && isSupported && (
            <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white"></div>
          )}
        </div>
      )}

      {/* Transcript Popup */}
      {showTranscriptPopup && (localTranscript || transcript) && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-green-50 border border-green-200 rounded-md shadow-lg z-50 min-w-48 max-w-64">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">
              {autoSend ? 'Gesendet:' : 'Erkannt:'}
            </span>
          </div>
          <div className="text-sm text-green-800">
            {localTranscript || transcript}
          </div>
          {autoSend && (
            <div className="text-xs text-green-600 mt-1">
              ✓ Automatisch an Chat gesendet
            </div>
          )}
        </div>
      )}

      {/* Error Popup */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-md shadow-lg z-50 w-64">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-700 font-medium">Fehler</span>
          </div>
          <div className="text-xs text-red-700 mb-2">{error}</div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={clearError}
              className="text-xs h-6"
            >
              Schließen
            </Button>
            {!isEnabled && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={requestMicrophonePermission}
                className="text-xs h-6"
              >
                Berechtigung
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Debug Info */}
      {debugMode && (
        <div className="absolute top-full right-0 mt-2 p-2 bg-gray-900 text-green-400 rounded text-xs font-mono z-50 w-48">
          <div>Supported: {isSupported ? '✓' : '✗'}</div>
          <div>Enabled: {isEnabled ? '✓' : '✗'}</div>
          <div>Listening: {isListening ? '✓' : '✗'}</div>
          <div>Auto-Send: {autoSend ? '✓' : '✗'}</div>
          {transcript && <div>Text: {transcript.substring(0, 20)}...</div>}
        </div>
      )}
    </div>
  );
};

export default SimpleMicButton;

