import React, { useState } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Basic Voice Button - Simple implementation that explicitly requests microphone permission
 */
const BasicVoiceButton = ({ 
  onTranscriptReceived,
  className = "",
  size = "default"
}) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Check if Speech Recognition is supported
  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const handleClick = async () => {
    console.log('🎤 Voice button clicked');
    
    if (!isSupported) {
      setError('Speech Recognition wird von diesem Browser nicht unterstützt');
      return;
    }

    if (isListening) {
      console.log('🛑 Stopping voice recognition');
      setIsListening(false);
      return;
    }

    try {
      // Step 1: Request microphone permission FIRST
      console.log('🔐 Requesting microphone permission...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true 
      });
      
      console.log('✅ Microphone permission granted');
      setHasPermission(true);
      setError(null);
      
      // Stop the stream immediately - we only needed permission
      stream.getTracks().forEach(track => track.stop());
      
      // Step 2: Start Speech Recognition
      console.log('🎙️ Starting speech recognition...');
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'de-DE';
      
      setIsListening(true);
      
      // Timeout after 8 seconds
      const timeout = setTimeout(() => {
        console.log('⏰ Recognition timeout');
        recognition.stop();
        setIsListening(false);
        setError('Zeitüberschreitung - keine Sprache erkannt');
      }, 8000);
      
      recognition.onstart = () => {
        console.log('✅ Recognition started');
        setError(null);
      };
      
      recognition.onresult = (event) => {
        clearTimeout(timeout);
        console.log('📝 Recognition result received');
        
        if (event.results && event.results[0]) {
          const transcript = event.results[0][0].transcript.trim();
          console.log(`📝 Transcript: "${transcript}"`);
          
          if (transcript && onTranscriptReceived) {
            onTranscriptReceived(transcript);
          }
        }
        
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        clearTimeout(timeout);
        console.error('❌ Recognition error:', event.error);
        
        let errorMessage = '';
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Mikrofon-Berechtigung verweigert. Bitte erlauben Sie den Zugriff.';
            setHasPermission(false);
            break;
          case 'no-speech':
            errorMessage = 'Keine Sprache erkannt. Sprechen Sie lauter.';
            break;
          case 'audio-capture':
            errorMessage = 'Mikrofon-Problem. Prüfen Sie die Verbindung.';
            break;
          case 'network':
            errorMessage = 'Netzwerkfehler bei der Spracherkennung.';
            break;
          default:
            errorMessage = `Fehler: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        clearTimeout(timeout);
        console.log('🔚 Recognition ended');
        setIsListening(false);
      };
      
      recognition.start();
      
    } catch (err) {
      console.error('❌ Error:', err);
      
      let errorMessage = '';
      switch (err.name) {
        case 'NotAllowedError':
          errorMessage = 'Mikrofon-Berechtigung verweigert. Bitte klicken Sie auf "Zulassen".';
          break;
        case 'NotFoundError':
          errorMessage = 'Kein Mikrofon gefunden. Schließen Sie ein Mikrofon an.';
          break;
        case 'NotReadableError':
          errorMessage = 'Mikrofon wird bereits verwendet.';
          break;
        default:
          errorMessage = `Fehler: ${err.message}`;
      }
      
      setError(errorMessage);
      setIsListening(false);
    }
  };

  // Get button styling
  const getButtonClass = () => {
    if (!isSupported) {
      return 'bg-gray-100 text-gray-500 cursor-not-allowed';
    }
    
    if (isListening) {
      return 'bg-red-500 text-white animate-pulse';
    }
    
    if (error) {
      return 'bg-red-100 text-red-700 border-red-300';
    }
    
    if (hasPermission) {
      return 'bg-green-100 text-green-700 hover:bg-green-200';
    }
    
    return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
  };

  // Get icon
  const getIcon = () => {
    if (!isSupported) return <MicOff className="w-4 h-4" />;
    if (isListening) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (error) return <AlertCircle className="w-4 h-4" />;
    return <Mic className="w-4 h-4" />;
  };

  // Get tooltip
  const getTooltip = () => {
    if (!isSupported) return 'Spracherkennung nicht unterstützt';
    if (isListening) return 'Aufnahme läuft... (Klicken zum Stoppen)';
    if (error) return 'Fehler aufgetreten - Klicken zum erneuten Versuch';
    if (hasPermission) return 'Sprachaufnahme starten';
    return 'Klicken für Mikrofon-Berechtigung';
  };

  return (
    <div className="relative">
      <Button
        size={size}
        onClick={handleClick}
        disabled={!isSupported}
        className={`${className} ${getButtonClass()}`}
        title={getTooltip()}
      >
        {getIcon()}
      </Button>

      {/* Status Indicator */}
      <div className="absolute -top-1 -right-1">
        {isListening && (
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
        {error && (
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        )}
        {hasPermission && !isListening && !error && (
          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 w-64">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800">{error}</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setError(null)}
                className="text-xs h-6 mt-2"
              >
                Schließen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicVoiceButton;

