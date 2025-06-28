import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, Loader2, Settings, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Improved Microphone Button with full error display and debugging
 */
const ImprovedMicButton = ({ 
  onTranscriptReceived,
  className = "",
  size = "default",
  variant = "outline"
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [debugInfo, setDebugInfo] = useState([]);
  const [showFullError, setShowFullError] = useState(false);

  // Add debug log
  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev.slice(-4), { timestamp, message, type }]);
    console.log(`🎤 [${timestamp}] ${message}`);
  };

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const supported = !!SpeechRecognition;
      
      setIsSupported(supported);
      
      if (supported) {
        addDebugLog('Speech Recognition API supported', 'success');
        checkPermissions();
      } else {
        addDebugLog('Speech Recognition API not supported in this browser', 'error');
        setError('Speech Recognition wird von diesem Browser nicht unterstützt. Bitte verwenden Sie Chrome, Edge oder Safari.');
      }
    };

    checkSupport();
  }, []);

  // Check microphone permissions
  const checkPermissions = async () => {
    try {
      addDebugLog('Checking microphone permissions...');
      
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' });
        setPermissionStatus(permission.state);
        addDebugLog(`Permission status: ${permission.state}`, permission.state === 'granted' ? 'success' : 'warning');
        
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state);
          addDebugLog(`Permission changed to: ${permission.state}`);
        });
      } else {
        addDebugLog('Permissions API not available', 'warning');
      }
    } catch (err) {
      addDebugLog(`Permission check failed: ${err.message}`, 'error');
    }
  };

  // Request microphone access
  const requestMicrophoneAccess = async () => {
    try {
      addDebugLog('Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      addDebugLog('Microphone access granted', 'success');
      
      // Stop the stream immediately as we only needed permission
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionStatus('granted');
      setError(null);
      return true;
    } catch (err) {
      const errorMessage = `Mikrofon-Zugriff fehlgeschlagen: ${err.name} - ${err.message}`;
      addDebugLog(errorMessage, 'error');
      setError(errorMessage);
      setPermissionStatus('denied');
      return false;
    }
  };

  // Start voice recognition
  const startListening = async () => {
    if (!isSupported) {
      const errorMsg = 'Speech Recognition wird nicht unterstützt';
      setError(errorMsg);
      addDebugLog(errorMsg, 'error');
      return;
    }

    try {
      addDebugLog('Starting voice recognition...');
      
      // Request microphone access if not granted
      if (permissionStatus !== 'granted') {
        const accessGranted = await requestMicrophoneAccess();
        if (!accessGranted) {
          return;
        }
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'de-DE';
      recognition.maxAlternatives = 1;

      let timeoutId = setTimeout(() => {
        addDebugLog('Recognition timeout after 10 seconds', 'warning');
        recognition.stop();
        setIsListening(false);
        setError('Zeitüberschreitung - keine Sprache erkannt');
      }, 10000);

      recognition.onstart = () => {
        addDebugLog('Recognition started successfully', 'success');
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        clearTimeout(timeoutId);
        
        if (event.results && event.results[0]) {
          const result = event.results[0][0].transcript.trim();
          addDebugLog(`Transcript received: "${result}"`, 'success');
          setTranscript(result);
          
          // Auto-stop listening after successful recognition
          setIsListening(false);
          recognition.stop();
          
          if (onTranscriptReceived && result) {
            onTranscriptReceived(result);
          }
          
          // Clear transcript after 3 seconds
          setTimeout(() => {
            setTranscript('');
          }, 3000);
        }
      };

      recognition.onerror = (event) => {
        clearTimeout(timeoutId);
        
        let errorMessage = `Speech Recognition Fehler: ${event.error}`;
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Mikrofon-Berechtigung verweigert. Bitte erlauben Sie den Zugriff in den Browser-Einstellungen.';
            setPermissionStatus('denied');
            break;
          case 'no-speech':
            errorMessage = 'Keine Sprache erkannt. Bitte sprechen Sie deutlicher und näher zum Mikrofon.';
            break;
          case 'audio-capture':
            errorMessage = 'Mikrofon kann nicht verwendet werden. Prüfen Sie, ob es angeschlossen und verfügbar ist.';
            break;
          case 'network':
            errorMessage = 'Netzwerkfehler bei der Spracherkennung. Prüfen Sie Ihre Internetverbindung.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Spracherkennungsdienst nicht verfügbar. Versuchen Sie es später erneut.';
            break;
          case 'bad-grammar':
            errorMessage = 'Grammatikfehler in der Spracherkennung.';
            break;
          case 'language-not-supported':
            errorMessage = 'Deutsche Sprache wird nicht unterstützt.';
            break;
          default:
            errorMessage = `Unbekannter Fehler: ${event.error}`;
        }
        
        addDebugLog(errorMessage, 'error');
        setError(errorMessage);
        setIsListening(false);
      };

      recognition.onend = () => {
        clearTimeout(timeoutId);
        addDebugLog('Recognition ended');
        setIsListening(false);
      };

      recognition.start();
      
    } catch (err) {
      const errorMessage = `Fehler beim Starten der Spracherkennung: ${err.message}`;
      addDebugLog(errorMessage, 'error');
      setError(errorMessage);
      setIsListening(false);
    }
  };

  // Stop listening
  const stopListening = () => {
    addDebugLog('Stopping voice recognition...');
    setIsListening(false);
  };

  // Handle click
  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
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
    
    if (permissionStatus === 'granted') {
      return 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300';
    }
    
    return 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300';
  };

  // Get icon
  const getIcon = () => {
    if (!isSupported) return <MicOff className="w-4 h-4" />;
    if (isListening) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (error) return <AlertCircle className="w-4 h-4" />;
    if (permissionStatus === 'granted') return <Mic className="w-4 h-4" />;
    return <Settings className="w-4 h-4" />;
  };

  // Get tooltip
  const getTooltip = () => {
    if (!isSupported) return 'Spracherkennung nicht unterstützt';
    if (error) return 'Fehler - Klicken für Details';
    if (isListening) return 'Aufnahme läuft... (Klicken zum Stoppen)';
    if (permissionStatus === 'granted') return 'Sprachaufnahme starten';
    return 'Mikrofon-Berechtigung erforderlich';
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

      {/* Full Error Display */}
      {error && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-red-50 border border-red-200 rounded-lg shadow-xl z-[9999] w-80 max-w-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2">Voice Recognition Fehler</h3>
              <p className="text-xs text-red-700 mb-3 leading-relaxed">{error}</p>
              
              {/* Debug Information */}
              <div className="border-t border-red-200 pt-3">
                <h4 className="text-xs font-medium text-red-800 mb-2">Debug-Informationen:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {debugInfo.slice(-3).map((log, index) => (
                    <div key={index} className="text-xs">
                      <span className="text-red-600">{log.timestamp}:</span>
                      <span className={`ml-1 ${
                        log.type === 'error' ? 'text-red-800' :
                        log.type === 'success' ? 'text-green-700' :
                        log.type === 'warning' ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setError(null)}
                  className="text-xs h-6"
                >
                  Schließen
                </Button>
                {permissionStatus !== 'granted' && (
                  <Button 
                    size="sm" 
                    onClick={requestMicrophoneAccess}
                    className="text-xs h-6"
                  >
                    Berechtigung anfordern
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 p-3 bg-green-50 border border-green-200 rounded-md shadow-xl z-[9998] min-w-48 max-w-64">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Erkannt:</span>
          </div>
          <div className="text-sm text-green-800">{transcript}</div>
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
        {!isListening && !error && permissionStatus === 'granted' && (
          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
        {permissionStatus === 'unknown' && (
          <div className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-white"></div>
        )}
      </div>
    </div>
  );
};

export default ImprovedMicButton;

