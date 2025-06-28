import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDesktopVoiceRecognition } from '@/hooks/useDesktopVoiceRecognition';

/**
 * Desktop-optimized Microphone Button
 * Addresses laptop/desktop browser permission issues
 */
const DesktopMicButton = ({ 
  onTranscriptReceived,
  className = "",
  size = "default",
  variant = "outline"
}) => {
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    permissionStatus,
    microphoneAccess,
    startListening,
    stopListening,
    requestMicrophoneAccess,
    clearError
  } = useDesktopVoiceRecognition({
    onTranscriptReceived,
    onError: (err) => {
      console.error('Desktop Voice Error:', err);
    }
  });

  // Handle transcript received
  useEffect(() => {
    if (transcript && onTranscriptReceived) {
      onTranscriptReceived(transcript);
    }
  }, [transcript, onTranscriptReceived]);

  // Handle click
  const handleClick = async () => {
    clearError();
    
    if (isListening) {
      stopListening();
    } else {
      if (!microphoneAccess) {
        // Show permission help for desktop users
        setShowPermissionHelp(true);
      }
      
      const success = await startListening();
      if (success) {
        setShowPermissionHelp(false);
      }
    }
  };

  // Get button state
  const getButtonState = () => {
    if (!isSupported) return 'unsupported';
    if (error) return 'error';
    if (isListening) return 'listening';
    if (microphoneAccess) return 'ready';
    if (permissionStatus === 'denied') return 'denied';
    return 'permission-needed';
  };

  const buttonState = getButtonState();

  // Get button styling based on state
  const getButtonStyling = () => {
    switch (buttonState) {
      case 'listening':
        return 'bg-red-500 hover:bg-red-600 text-white border-red-500 animate-pulse';
      case 'ready':
        return 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300';
      case 'error':
      case 'denied':
        return 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300';
      case 'permission-needed':
        return 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'unsupported':
        return 'bg-gray-50 text-gray-400 border-gray-300 cursor-not-allowed';
      default:
        return '';
    }
  };

  // Get icon based on state
  const getIcon = () => {
    switch (buttonState) {
      case 'listening':
        return <MicOff className="w-4 h-4" />;
      case 'error':
      case 'denied':
        return <AlertCircle className="w-4 h-4" />;
      case 'ready':
        return <Mic className="w-4 h-4" />;
      case 'permission-needed':
        return <Settings className="w-4 h-4" />;
      case 'unsupported':
        return <MicOff className="w-4 h-4" />;
      default:
        return <Mic className="w-4 h-4" />;
    }
  };

  // Get tooltip text
  const getTooltipText = () => {
    switch (buttonState) {
      case 'listening':
        return 'Aufnahme stoppen';
      case 'ready':
        return 'Sprachaufnahme starten';
      case 'error':
        return `Fehler: ${error}`;
      case 'denied':
        return 'Mikrofon-Berechtigung verweigert';
      case 'permission-needed':
        return 'Mikrofon-Berechtigung erforderlich';
      case 'unsupported':
        return 'Spracherkennung nicht unterstützt';
      default:
        return 'Sprachaufnahme';
    }
  };

  if (!isSupported) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className={`${className} ${getButtonStyling()}`}
        title={getTooltipText()}
      >
        {getIcon()}
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        className={`${className} ${getButtonStyling()}`}
        title={getTooltipText()}
        disabled={buttonState === 'unsupported'}
      >
        {getIcon()}
      </Button>

      {/* Transcript Preview */}
      {(transcript || interimTranscript) && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-card border border-border rounded-md shadow-lg z-50 min-w-48 max-w-64">
          <div className="text-xs text-muted-foreground mb-1">Erkannt:</div>
          <div className="text-sm">
            {transcript && <span className="text-foreground">{transcript}</span>}
            {interimTranscript && (
              <span className="text-muted-foreground italic">{interimTranscript}</span>
            )}
          </div>
        </div>
      )}

      {/* Permission Help Modal */}
      {showPermissionHelp && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-card border border-border rounded-lg shadow-lg z-50 w-80">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium">Mikrofon-Berechtigung erforderlich</h3>
          </div>
          
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Für die Spracherkennung auf Desktop/Laptop benötigen wir Zugriff auf Ihr Mikrofon.
            </p>
            
            <div className="space-y-2">
              <p className="font-medium text-foreground">So aktivieren Sie den Zugriff:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Klicken Sie auf das Mikrofon-Symbol in der Adressleiste</li>
                <li>Wählen Sie "Zulassen" für Mikrofon-Zugriff</li>
                <li>Oder öffnen Sie Browser-Einstellungen → Datenschutz → Mikrofon</li>
              </ol>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                onClick={requestMicrophoneAccess}
                className="flex-1"
              >
                Berechtigung anfordern
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowPermissionHelp(false)}
              >
                Schließen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && !showPermissionHelp && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-md shadow-lg z-50 w-64">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Fehler</span>
          </div>
          <p className="text-xs text-red-700">{error}</p>
          
          {permissionStatus === 'denied' && (
            <div className="mt-2 pt-2 border-t border-red-200">
              <p className="text-xs text-red-600 mb-2">
                Mikrofon-Zugriff wurde verweigert. Bitte aktivieren Sie ihn in den Browser-Einstellungen.
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('chrome://settings/content/microphone', '_blank')}
                className="text-xs"
              >
                Browser-Einstellungen öffnen
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute -top-1 -right-1">
        {buttonState === 'ready' && (
          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
        {buttonState === 'listening' && (
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
        {(buttonState === 'error' || buttonState === 'denied') && (
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        )}
        {buttonState === 'permission-needed' && (
          <div className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></div>
        )}
      </div>
    </div>
  );
};

export default DesktopMicButton;

