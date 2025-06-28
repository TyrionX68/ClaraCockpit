/**
 * VoiceDebugPanel.jsx - Voice System Debug Console
 * 
 * Debug panel for troubleshooting voice system issues:
 * - Microphone permissions status
 * - Web Speech API availability
 * - Voice recognition status
 * - Real-time voice events
 */

import React, { useState, useEffect } from 'react';
import { Bug, Mic, MicOff, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const VoiceDebugPanel = ({ 
  isVisible = false, 
  onToggle,
  className = '' 
}) => {
  const [debugInfo, setDebugInfo] = useState({
    speechSupported: false,
    httpsEnabled: false,
    getUserMediaAvailable: false,
    microphonePermission: 'unknown',
    lastVoiceEvent: null,
    voiceStatus: {
      isListening: false,
      isWakewordActive: false,
      lastTranscript: '',
      lastError: null,
      confidence: 0,
      audioLevel: 0
    }
  });

  const [logs, setLogs] = useState([]);

  // Add debug log entry
  const addLog = (type, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now(),
      timestamp,
      type, // 'info', 'success', 'warning', 'error'
      message,
      data
    };
    
    setLogs(prev => [logEntry, ...prev.slice(0, 19)]); // Keep last 20 logs
    
    // Also log to browser console with prefix
    const prefix = `🔧 [VOICE DEBUG ${timestamp}]`;
    switch (type) {
      case 'error':
        console.error(prefix, message, data);
        break;
      case 'warning':
        console.warn(prefix, message, data);
        break;
      case 'success':
        console.log(prefix, '✅', message, data);
        break;
      default:
        console.log(prefix, message, data);
    }
  };

  // Initialize debug info
  useEffect(() => {
    const updateDebugInfo = async () => {
      const info = {
        speechSupported: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        httpsEnabled: window.location.protocol === 'https:',
        getUserMediaAvailable: !!navigator.mediaDevices?.getUserMedia,
        microphonePermission: 'checking...'
      };

      // Check microphone permissions
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({name: 'microphone'});
          info.microphonePermission = result.state;
          addLog('info', `Microphone permission: ${result.state}`);
        } else {
          info.microphonePermission = 'unavailable';
          addLog('warning', 'Permissions API not available');
        }
      } catch (error) {
        info.microphonePermission = 'error';
        addLog('error', 'Failed to check microphone permissions', error);
      }

      setDebugInfo(prev => ({ ...prev, ...info }));
      addLog('info', 'Debug panel initialized');
    };

    updateDebugInfo();
  }, []);

  // Listen for voice status updates
  useEffect(() => {
    const handleVoiceStatusUpdate = (event) => {
      const status = event.detail;
      setDebugInfo(prev => ({
        ...prev,
        voiceStatus: status,
        lastVoiceEvent: new Date().toLocaleTimeString()
      }));
      
      addLog('info', 'Voice status updated', {
        isListening: status.isListening,
        transcript: status.lastTranscript,
        error: status.lastError,
        confidence: status.confidence
      });
    };

    window.addEventListener('voiceStatusUpdate', handleVoiceStatusUpdate);
    return () => window.removeEventListener('voiceStatusUpdate', handleVoiceStatusUpdate);
  }, []);

  // Test microphone access
  const testMicrophone = async () => {
    addLog('info', 'Testing microphone access...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      addLog('success', 'Microphone access granted');
      
      // Stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      
      // Update permission status
      setDebugInfo(prev => ({
        ...prev,
        microphonePermission: 'granted'
      }));
    } catch (error) {
      addLog('error', 'Microphone access failed', error);
      setDebugInfo(prev => ({
        ...prev,
        microphonePermission: 'denied'
      }));
    }
  };

  // Test Web Speech API
  const testSpeechRecognition = () => {
    addLog('info', 'Testing Web Speech API...');
    
    if (!debugInfo.speechSupported) {
      addLog('error', 'Web Speech API not supported');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.onstart = () => {
        addLog('success', 'Speech recognition started successfully');
      };
      
      recognition.onerror = (event) => {
        addLog('error', 'Speech recognition error', event.error);
      };
      
      recognition.onend = () => {
        addLog('info', 'Speech recognition ended');
      };
      
      // Start and immediately stop to test
      recognition.start();
      setTimeout(() => recognition.stop(), 1000);
      
    } catch (error) {
      addLog('error', 'Failed to create speech recognition', error);
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    addLog('info', 'Debug logs cleared');
  };

  if (!isVisible) {
    return (
      <Button
        onClick={onToggle}
        size="sm"
        variant="outline"
        className={`fixed bottom-4 right-4 z-50 ${className}`}
        title="Open Voice Debug Panel"
      >
        <Bug className="w-4 h-4" />
      </Button>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'granted':
      case true:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'denied':
      case false:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'granted':
      case true:
        return 'text-green-500';
      case 'denied':
      case false:
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 w-96 bg-card border border-border rounded-lg shadow-xl z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4" />
          <span className="font-medium text-sm">Voice Debug Panel</span>
        </div>
        <Button onClick={onToggle} size="sm" variant="ghost">
          ×
        </Button>
      </div>

      {/* System Status */}
      <div className="p-3 border-b border-border">
        <h4 className="text-sm font-medium mb-2">System Status</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span>Web Speech API:</span>
            <div className="flex items-center gap-1">
              {getStatusIcon(debugInfo.speechSupported)}
              <span className={getStatusColor(debugInfo.speechSupported)}>
                {debugInfo.speechSupported ? 'Supported' : 'Not Supported'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>HTTPS:</span>
            <div className="flex items-center gap-1">
              {getStatusIcon(debugInfo.httpsEnabled)}
              <span className={getStatusColor(debugInfo.httpsEnabled)}>
                {debugInfo.httpsEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>getUserMedia:</span>
            <div className="flex items-center gap-1">
              {getStatusIcon(debugInfo.getUserMediaAvailable)}
              <span className={getStatusColor(debugInfo.getUserMediaAvailable)}>
                {debugInfo.getUserMediaAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Microphone:</span>
            <div className="flex items-center gap-1">
              {getStatusIcon(debugInfo.microphonePermission === 'granted')}
              <span className={getStatusColor(debugInfo.microphonePermission === 'granted')}>
                {debugInfo.microphonePermission}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Status */}
      <div className="p-3 border-b border-border">
        <h4 className="text-sm font-medium mb-2">Voice Status</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span>Listening:</span>
            <div className="flex items-center gap-1">
              {debugInfo.voiceStatus.isListening ? (
                <Mic className="w-3 h-3 text-green-500" />
              ) : (
                <MicOff className="w-3 h-3 text-gray-500" />
              )}
              <span className={debugInfo.voiceStatus.isListening ? 'text-green-500' : 'text-gray-500'}>
                {debugInfo.voiceStatus.isListening ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Wakeword:</span>
            <span className={debugInfo.voiceStatus.isWakewordActive ? 'text-green-500' : 'text-gray-500'}>
              {debugInfo.voiceStatus.isWakewordActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {debugInfo.voiceStatus.lastTranscript && (
            <div className="mt-1">
              <span className="text-gray-500">Last transcript:</span>
              <div className="text-blue-600 text-xs mt-1 p-1 bg-blue-50 rounded">
                "{debugInfo.voiceStatus.lastTranscript}"
              </div>
            </div>
          )}
          
          {debugInfo.voiceStatus.lastError && (
            <div className="mt-1">
              <span className="text-red-500">Last error:</span>
              <div className="text-red-600 text-xs mt-1 p-1 bg-red-50 rounded">
                {debugInfo.voiceStatus.lastError}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Buttons */}
      <div className="p-3 border-b border-border">
        <h4 className="text-sm font-medium mb-2">Tests</h4>
        <div className="flex gap-2">
          <Button onClick={testMicrophone} size="sm" variant="outline" className="text-xs">
            Test Mic
          </Button>
          <Button onClick={testSpeechRecognition} size="sm" variant="outline" className="text-xs">
            Test Speech
          </Button>
          <Button onClick={clearLogs} size="sm" variant="outline" className="text-xs">
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Debug Logs */}
      <div className="p-3 max-h-48 overflow-y-auto">
        <h4 className="text-sm font-medium mb-2">Debug Logs</h4>
        <div className="space-y-1">
          {logs.length === 0 ? (
            <div className="text-xs text-gray-500">No logs yet...</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="text-xs">
                <span className="text-gray-500">{log.timestamp}</span>
                <span className={`ml-2 ${
                  log.type === 'error' ? 'text-red-500' :
                  log.type === 'warning' ? 'text-yellow-500' :
                  log.type === 'success' ? 'text-green-500' :
                  'text-gray-700'
                }`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceDebugPanel;

