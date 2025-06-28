import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, Loader2, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Force Permission Microphone Button - Explicitly requests microphone access
 */
const ForcePermissionMicButton = ({ 
  onTranscriptReceived,
  className = "",
  size = "default",
  variant = "outline"
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [debugLog, setDebugLog] = useState([]);

  // Add debug log
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🎤 [${timestamp}] ${message}`);
    setDebugLog(prev => [...prev.slice(-2), `${timestamp}: ${message}`]);
  };

  // Check if browser supports Speech Recognition
  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Force microphone permission request
  const requestMicrophonePermission = async () => {
    setIsRequestingPermission(true);
    setError(null);
    addLog('🔐 Fordere Mikrofon-Berechtigung an...');

    try {
      // FORCE browser permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      addLog('✅ Mikrofon-Berechtigung erhalten!');
      
      // Test microphone access
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      
      addLog('🎤 Mikrofon-Test erfolgreich');
      
      // Stop the stream and close audio context
      stream.getTracks().forEach(track => {
        track.stop();
        addLog(`🛑 Audio-Track gestoppt: ${track.kind}`);
      });
      
      await audioContext.close();
      addLog('🔇 Audio-Context geschlossen');
      
      setPermissionGranted(true);
      setIsRequestingPermission(false);
      
      // Automatically start speech recognition after permission granted
      setTimeout(() => {
        startSpeechRecognition();
      }, 500);
      
      return true;
      
    } catch (err) {
      addLog(`❌ Mikrofon-Berechtigung fehlgeschlagen: ${err.name} - ${err.message}`);
      
      let errorMessage = 'Mikrofon-Zugriff fehlgeschlagen: ';
      
      switch (err.name) {
        case 'NotAllowedError':
          errorMessage += 'Berechtigung verweigert. Bitte klicken Sie auf "Zulassen" wenn der Browser fragt.';
          break;
        case 'NotFoundError':
          errorMessage += 'Kein Mikrofon gefunden. Bitte schließen Sie ein Mikrofon an.';
          break;
        case 'NotReadableError':
          errorMessage += 'Mikrofon wird bereits von einer anderen Anwendung verwendet.';
          break;
        case 'OverconstrainedError':
          errorMessage += 'Mikrofon-Einstellungen nicht unterstützt.';
          break;
        case 'SecurityError':
          errorMessage += 'Sicherheitsfehler. Bitte verwenden Sie HTTPS.';
          break;
        default:
          errorMessage += err.message;
      }
      
      setError(errorMessage);
      setIsRequestingPermission(false);
      return false;
    }
  };

  // Start speech recognition
  const startSpeechRecognition = () => {
    if (!isSupported) {
      setError('Speech Recognition wird von diesem Browser nicht unterstützt');
      return;
    }

    if (!permissionGranted) {
      addLog('⚠️ Keine Berechtigung - fordere zuerst Mikrofon-Zugriff an');
      requestMicrophonePermission();
      return;
    }

    try {
      addLog('🎙️ Starte Speech Recognition...');
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'de-DE';
      recognition.maxAlternatives = 1;

      // Set timeout
      const timeoutId = setTimeout(() => {
        addLog('⏰ Timeout nach 8 Sekunden');
        recognition.stop();
        setIsListening(false);
        setError('Zeitüberschreitung - keine Sprache erkannt');
      }, 8000);

      recognition.onstart = () => {
        addLog('✅ Speech Recognition gestartet');
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        clearTimeout(timeoutId);
        
        if (event.results && event.results[0]) {
          const result = event.results[0][0].transcript.trim();
          addLog(`📝 Transkript: "${result}"`);
          setTranscript(result);
          
          if (onTranscriptReceived && result) {
            onTranscriptReceived(result);
            addLog('📤 Transkript an Chat gesendet');
          }
        }
        
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        clearTimeout(timeoutId);
        addLog(`❌ Speech Recognition Fehler: ${event.error}`);
        
        let errorMessage = '';
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Mikrofon-Berechtigung verweigert';
            setPermissionGranted(false);
            break;
          case 'no-speech':
            errorMessage = 'Keine Sprache erkannt - sprechen Sie lauter';
            break;
          case 'audio-capture':
            errorMessage = 'Mikrofon-Problem - prüfen Sie die Verbindung';
            break;
          case 'network':
            errorMessage = 'Netzwerkfehler bei Spracherkennung';
            break;
          default:
            errorMessage = `Unbekannter Fehler: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        clearTimeout(timeoutId);
        addLog('🔚 Speech Recognition beendet');
        setIsListening(false);
      };

      recognition.start();
      
    } catch (err) {
      addLog(`❌ Fehler beim Starten: ${err.message}`);
      setError(`Fehler beim Starten der Spracherkennung: ${err.message}`);
      setIsListening(false);
    }
  };

  // Handle button click
  const handleClick = () => {
    if (isListening) {
      addLog('🛑 Stoppe Aufnahme');
      setIsListening(false);
      return;
    }

    if (!permissionGranted) {
      addLog('🔐 Berechtigung erforderlich - starte Anfrage');
      requestMicrophonePermission();
    } else {
      startSpeechRecognition();
    }
  };

  // Get button styling
  const getButtonStyling = () => {
    if (!isSupported) {
      return 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed';
    }
    
    if (isRequestingPermission) {
      return 'bg-blue-100 text-blue-700 border-blue-300 animate-pulse';
    }
    
    if (error) {
      return 'bg-red-100 text-red-700 border-red-300';
    }
    
    if (isListening) {
      return 'bg-red-500 text-white border-red-500 animate-pulse';
    }
    
    if (permissionGranted) {
      return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
    }
    
    return 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200';
  };

  // Get icon
  const getIcon = () => {
    if (!isSupported) return <MicOff className="w-4 h-4" />;
    if (isRequestingPermission) return <Shield className="w-4 h-4" />;
    if (isListening) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (error) return <AlertCircle className="w-4 h-4" />;
    if (permissionGranted) return <Mic className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  // Get tooltip
  const getTooltip = () => {
    if (!isSupported) return 'Spracherkennung nicht unterstützt';
    if (isRequestingPermission) return 'Fordere Mikrofon-Berechtigung an...';
    if (error) return 'Fehler aufgetreten';
    if (isListening) return 'Aufnahme läuft... (Klicken zum Stoppen)';
    if (permissionGranted) return 'Sprachaufnahme starten';
    return 'Klicken für Mikrofon-Berechtigung';
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

      {/* Status Indicator */}
      <div className="absolute -top-1 -right-1">
        {isRequestingPermission && (
          <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
        {isListening && (
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
        {error && (
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
        )}
        {permissionGranted && !isListening && !error && (
          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 w-72">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 mb-2">{error}</p>
              <div className="text-xs text-red-600 space-y-1">
                {debugLog.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setError(null)}
                  className="text-xs h-6"
                >
                  Schließen
                </Button>
                <Button 
                  size="sm" 
                  onClick={requestMicrophonePermission}
                  className="text-xs h-6"
                >
                  Erneut versuchen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Request Display */}
      {isRequestingPermission && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-lg z-50 w-72">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 animate-pulse" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Mikrofon-Berechtigung anfordern</p>
              <p className="text-xs text-blue-600 mt-1">
                Bitte klicken Sie auf "Zulassen" wenn der Browser fragt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {transcript && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-green-50 border border-green-200 rounded-lg shadow-lg z-50 w-64">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-green-700 font-medium">Erkannt:</p>
              <p className="text-sm text-green-800">{transcript}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForcePermissionMicButton;

