import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEnhancedVoiceRecognition } from '@/hooks/useEnhancedVoiceRecognition';

/**
 * Enhanced Microphone Button with improved voice recognition
 * Handles permissions, errors, and provides better user feedback
 */
const EnhancedMicButton = ({ 
  onTranscriptReceived, 
  onStatusChange,
  className = "",
  size = "default",
  showStatus = true,
  autoSend = true
}) => {
  const {
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
  } = useEnhancedVoiceRecognition();

  const [lastTranscript, setLastTranscript] = useState('');

  // Handle transcript changes
  useEffect(() => {
    if (transcript && transcript !== lastTranscript) {
      console.log('📝 New transcript received:', transcript);
      setLastTranscript(transcript);
      
      if (onTranscriptReceived && autoSend) {
        onTranscriptReceived(transcript);
      }
      
      // Reset transcript after sending
      setTimeout(() => {
        resetTranscript();
      }, 1000);
    }
  }, [transcript, lastTranscript, onTranscriptReceived, autoSend, resetTranscript]);

  // Notify parent of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({
        isListening,
        error,
        isSupported,
        permissionStatus,
        transcript
      });
    }
  }, [isListening, error, isSupported, permissionStatus, transcript, onStatusChange]);

  // Handle button click
  const handleClick = async () => {
    if (!isSupported) {
      return;
    }

    if (permissionStatus === 'denied' || permissionStatus === 'unknown') {
      // Try to request permission first
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return;
      }
    }

    toggleListening();
  };

  // Get button variant based on state
  const getButtonVariant = () => {
    if (error) return 'destructive';
    if (isListening) return 'default';
    return 'outline';
  };

  // Get button icon
  const getIcon = () => {
    if (error) return AlertCircle;
    if (isListening) return Volume2;
    if (permissionStatus === 'denied') return MicOff;
    return Mic;
  };

  // Get status message
  const getStatusMessage = () => {
    if (!isSupported) return 'Voice nicht unterstützt';
    if (error) return error;
    if (isListening) return 'Sprechen Sie jetzt...';
    if (permissionStatus === 'denied') return 'Mikrofon-Berechtigung erforderlich';
    if (permissionStatus === 'unknown') return 'Mikrofon-Test erforderlich';
    return 'Voice bereit';
  };

  const Icon = getIcon();

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Button
        onClick={handleClick}
        variant={getButtonVariant()}
        size={size}
        disabled={!isSupported}
        className={`relative ${isListening ? 'animate-pulse' : ''}`}
        title={getStatusMessage()}
      >
        <Icon className={`w-4 h-4 ${isListening ? 'text-green-600' : ''}`} />
        
        {/* Listening indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
        )}
        
        {/* Error indicator */}
        {error && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        )}
      </Button>
      
      {/* Status text */}
      {showStatus && (
        <div className={`text-xs text-center max-w-32 ${
          error ? 'text-red-500' : 
          isListening ? 'text-green-600' : 
          'text-muted-foreground'
        }`}>
          {getStatusMessage()}
        </div>
      )}
      
      {/* Transcript preview */}
      {transcript && (
        <div className="text-xs text-center max-w-48 p-2 bg-muted rounded border">
          <div className="font-medium text-foreground mb-1">Erkannt:</div>
          <div className="text-muted-foreground italic">"{transcript}"</div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMicButton;

