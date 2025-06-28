import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Zap, ZapOff, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEnhancedVoiceRecognition } from '../../hooks/archived_hooks/useEnhancedVoiceRecognition';

/**
 * Enhanced Voice Control Component with Wake-Word System
 * Features:
 * - Wake-word toggle ("Hey Clara")
 * - Audio level visualization
 * - Confidence indicator
 * - Status feedback
 * - Voice command processing
 */
const EnhancedVoiceControl = ({ 
  onVoiceCommand, 
  autoSendToChat = false,
  showAudioLevel = true,
  showConfidence = true 
}) => {
  const {
    isListening,
    isWakeWordActive,
    transcript,
    confidence,
    error,
    isSupported,
    audioLevel,
    wakeWordDetected,
    startListening,
    stopListening,
    toggleListening,
    toggleWakeWordMode,
    clearTranscript,
    clearError,
    getStatus
  } = useEnhancedVoiceRecognition();

  const [lastCommand, setLastCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);

  // Handle voice commands
  useEffect(() => {
    const handleVoiceCommand = (event) => {
      const { transcript, confidence, timestamp, wakeWordUsed } = event.detail;
      
      console.log('🎤 Voice Command Received:', transcript);
      
      setLastCommand(transcript);
      setCommandHistory(prev => [
        { transcript, confidence, timestamp, wakeWordUsed },
        ...prev.slice(0, 9) // Keep last 10 commands
      ]);
      
      // Send to parent component
      if (onVoiceCommand) {
        onVoiceCommand(transcript, confidence);
      }
      
      // Auto-send to chat if enabled
      if (autoSendToChat && window.claraChat) {
        window.claraChat.sendMessage(transcript);
      }
    };

    window.addEventListener('voiceCommand', handleVoiceCommand);
    return () => window.removeEventListener('voiceCommand', handleVoiceCommand);
  }, [onVoiceCommand, autoSendToChat]);

  // Audio level visualization
  const getAudioLevelColor = () => {
    if (audioLevel < 20) return 'bg-gray-300';
    if (audioLevel < 50) return 'bg-green-400';
    if (audioLevel < 80) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // Confidence color
  const getConfidenceColor = () => {
    if (confidence < 0.3) return 'text-red-500';
    if (confidence < 0.7) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Status message
  const getStatusMessage = () => {
    if (error) return `Fehler: ${error}`;
    if (!isSupported) return 'Spracherkennung nicht unterstützt';
    if (wakeWordDetected) return 'Clara hört zu... 👂';
    if (isWakeWordActive) return 'Warte auf "Hey Clara"... 🎯';
    if (isListening) return 'Aufnahme läuft... 🎙️';
    return 'Bereit für Sprachbefehle';
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
        <MicOff className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-600">
          Spracherkennung nicht verfügbar
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <div className="flex items-center gap-3">
        {/* Wake-Word Toggle */}
        <Button
          onClick={toggleWakeWordMode}
          variant={isWakeWordActive ? "default" : "outline"}
          size="sm"
          className={`flex items-center gap-2 ${
            isWakeWordActive 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'border-purple-200 hover:bg-purple-50'
          }`}
        >
          {isWakeWordActive ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
          Hey Clara
        </Button>

        {/* Manual Mic Toggle */}
        <Button
          onClick={toggleListening}
          variant={isListening && !isWakeWordActive ? "default" : "outline"}
          size="sm"
          disabled={isWakeWordActive}
          className={`flex items-center gap-2 ${
            isListening && !isWakeWordActive
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          {isListening ? 'Stop' : 'Sprechen'}
        </Button>

        {/* Audio Level Indicator */}
        {showAudioLevel && isListening && (
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-150 ${getAudioLevelColor()}`}
                style={{ width: `${audioLevel}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{audioLevel}%</span>
          </div>
        )}
      </div>

      {/* Status Display */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            error ? 'bg-red-500' :
            wakeWordDetected ? 'bg-purple-500 animate-pulse' :
            isListening ? 'bg-green-500 animate-pulse' :
            'bg-gray-300'
          }`} />
          <span className="text-sm text-gray-700">
            {getStatusMessage()}
          </span>
        </div>

        {/* Confidence Indicator */}
        {showConfidence && confidence > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Genauigkeit:</span>
            <span className={`text-xs font-medium ${getConfidenceColor()}`}>
              {Math.round(confidence * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Current Transcript */}
      {transcript && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="text-xs text-blue-600 font-medium mb-1">
                {wakeWordDetected ? '🎯 Clara Command:' : '🎤 Erkannt:'}
              </div>
              <div className="text-sm text-blue-800">
                {transcript}
              </div>
            </div>
            <Button
              onClick={clearTranscript}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Last Command */}
      {lastCommand && lastCommand !== transcript && (
        <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-xs text-green-600 font-medium mb-1">
            ✅ Letzter Befehl:
          </div>
          <div className="text-sm text-green-800">
            {lastCommand}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="text-xs text-red-600 font-medium mb-1">
                🚨 Fehler:
              </div>
              <div className="text-sm text-red-800">
                {error}
              </div>
            </div>
            <Button
              onClick={clearError}
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Command History (Debug) */}
      {commandHistory.length > 0 && process.env.NODE_ENV === 'development' && (
        <details className="text-xs">
          <summary className="text-gray-500 cursor-pointer">
            Command History ({commandHistory.length})
          </summary>
          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {commandHistory.map((cmd, index) => (
              <div key={index} className="p-2 bg-gray-100 rounded text-gray-700">
                <div className="flex items-center justify-between">
                  <span>{cmd.transcript}</span>
                  <span className="text-gray-500">
                    {Math.round(cmd.confidence * 100)}%
                    {cmd.wakeWordUsed && ' 🎯'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default EnhancedVoiceControl;

