/**
 * VoiceDebugTest.jsx - ERWEITERTE VERSION v6.2.1
 * Debug-Panel für Voice-Integration mit Master-Hook
 * MetaGovernor: Auto-Send-Checkbox & Live-Status-Monitoring
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, MessageSquare, Settings, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import SimpleMicButton from '../molecules/SimpleMicButton';

const VoiceDebugTest = ({ onTranscriptReceived, onSendToChat }) => {
  const [debugLog, setDebugLog] = useState([]);
  const [autoSendEnabled, setAutoSendEnabled] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testTranscript, setTestTranscript] = useState('');
  
  // Voice Recognition with Debug Mode
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
      addLog(`📝 Transcript received: "${text}"`);
      setTestTranscript(text);
      
      if (onTranscriptReceived) {
        onTranscriptReceived(text);
      }
      
      if (autoSendEnabled && onSendToChat) {
        addLog(`📤 Auto-sending to chat: "${text}"`);
        onSendToChat(text);
      }
    },
    onError: (err) => {
      addLog(`❌ Voice error: ${err}`);
    },
    onStart: () => {
      addLog('🎤 Voice recognition started');
    },
    onEnd: () => {
      addLog('⏹️ Voice recognition ended');
    },
    debugMode: true
  });

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev.slice(-19), `${timestamp}: ${message}`]);
    console.log(`[VoiceDebugTest] ${message}`);
  };

  useEffect(() => {
    addLog('🚀 Voice Debug Test initialized');
    addLog(`Browser: ${navigator.userAgent.split(' ')[0]}`);
    addLog(`Protocol: ${window.location.protocol}`);
    addLog(`Speech Recognition: ${isSupported ? 'Supported' : 'Not Supported'}`);
    
    if (isSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      addLog(`API: ${window.SpeechRecognition ? 'Standard' : 'WebKit'}`);
    }
  }, [isSupported]);

  const handleTestVoice = async () => {
    addLog('🧪 Manual voice test triggered');
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const handleManualSend = () => {
    if (testTranscript && onSendToChat) {
      addLog(`📤 Manual send: "${testTranscript}"`);
      onSendToChat(testTranscript);
    }
  };

  const handleClearLogs = () => {
    setDebugLog([]);
    addLog('🧹 Debug logs cleared');
  };

  const getStatusColor = () => {
    if (!isSupported) return 'text-gray-500';
    if (error) return 'text-red-500';
    if (isListening) return 'text-blue-500';
    if (isEnabled) return 'text-green-500';
    return 'text-orange-500';
  };

  const getStatusIcon = () => {
    if (!isSupported) return <MicOff className="w-4 h-4" />;
    if (error) return <AlertCircle className="w-4 h-4" />;
    if (isListening) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (isEnabled) return <CheckCircle className="w-4 h-4" />;
    return <Mic className="w-4 h-4" />;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Voice Debug Test + Chat Integration
          <div className={`ml-auto flex items-center gap-2 ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium">
              {!isSupported ? 'Not Supported' : 
               error ? 'Error' :
               isListening ? 'Listening' :
               isEnabled ? 'Ready' : 'Permission Required'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Auto-Send Checkbox - DAS WAR DAS PROBLEM! */}
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <label className="flex items-center gap-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoSendEnabled}
              onChange={(e) => {
                setAutoSendEnabled(e.target.checked);
                addLog(`🔄 Auto-send ${e.target.checked ? 'enabled' : 'disabled'}`);
              }}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="font-medium text-blue-800">
              Auto-send transcript to chat
            </span>
          </label>
          <p className="text-sm text-gray-600 mt-2">
            ✅ <strong>Das war das Problem!</strong> Diese Checkbox war nicht aktiviert.
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg mb-1">
              {isSupported ? '✅' : '❌'}
            </div>
            <div className="text-xs font-medium">Speech Recognition</div>
            <div className="text-xs text-gray-500">
              {isSupported ? 'Supported' : 'Not Supported'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg mb-1">
              {isEnabled ? '✅' : '❌'}
            </div>
            <div className="text-xs font-medium">Microphone</div>
            <div className="text-xs text-gray-500">
              {isEnabled ? 'Enabled' : 'Permission Required'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg mb-1">
              {isListening ? '🎤' : '⏸️'}
            </div>
            <div className="text-xs font-medium">Status</div>
            <div className="text-xs text-gray-500">
              {isListening ? 'Listening' : 'Idle'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-lg mb-1">
              {autoSendEnabled ? '✅' : '❌'}
            </div>
            <div className="text-xs font-medium">Auto-Send</div>
            <div className="text-xs text-gray-500">
              {autoSendEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleTestVoice}
            disabled={!isSupported}
            variant={isListening ? "destructive" : "default"}
            className="flex-1"
          >
            {isListening ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Stop Voice Test
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 mr-2" />
                Start Voice Test
              </>
            )}
          </Button>
          
          {!isEnabled && (
            <Button 
              onClick={requestMicrophonePermission}
              variant="outline"
            >
              Request Permission
            </Button>
          )}
          
          <Button 
            onClick={handleClearLogs}
            variant="outline"
            size="sm"
          >
            Clear Logs
          </Button>
        </div>

        {/* Current Transcript */}
        {(transcript || testTranscript) && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Current Transcript:</span>
            </div>
            <div className="text-sm text-green-700 mb-2">
              "{transcript || testTranscript}"
            </div>
            {!autoSendEnabled && (
              <Button 
                onClick={handleManualSend}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Send to Chat
              </Button>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Error:</span>
            </div>
            <div className="text-sm text-red-700 mb-2">{error}</div>
            <Button 
              onClick={clearError}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              Clear Error
            </Button>
          </div>
        )}

        {/* Advanced Controls */}
        <div>
          <Button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Controls
          </Button>
          
          {showAdvanced && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <div className="mb-3">
                <label className="block text-xs font-medium mb-1">
                  Integrated Voice Button:
                </label>
                <SimpleMicButton
                  onTranscript={(text) => {
                    addLog(`📝 Integrated button transcript: "${text}"`);
                    if (autoSendEnabled && onSendToChat) {
                      onSendToChat(text);
                    }
                  }}
                  autoSend={autoSendEnabled}
                  debugMode={true}
                  size="sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Debug Logs */}
        <div>
          <div className="text-sm font-medium mb-2">Debug Logs:</div>
          <div className="bg-black text-green-400 p-3 rounded font-mono text-xs h-32 overflow-y-auto">
            {debugLog.length === 0 ? (
              <div className="text-gray-500">No logs yet...</div>
            ) : (
              debugLog.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>

        {/* Test Instructions */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <strong>Test Instructions:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Ensure "Auto-send transcript to chat" is checked ✓</li>
            <li>Click "Start Voice Test" to begin</li>
            <li>Speak clearly in German</li>
            <li>Transcript should automatically be sent to chat</li>
            <li>Check debug logs for detailed information</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceDebugTest;

