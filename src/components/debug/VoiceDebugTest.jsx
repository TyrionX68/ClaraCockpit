/**
 * VoiceDebugTest.jsx
 * Isolierter Test für Speech Recognition API
 * Debugging für Clara Voice-Integration
 */

import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceDebugTest = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);
  
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLog(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`[VoiceDebug] ${message}`);
  };

  useEffect(() => {
    addLog('VoiceDebugTest mounted');
    
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      addLog('✅ Speech Recognition API supported');
      addLog(`API: ${window.SpeechRecognition ? 'SpeechRecognition' : 'webkitSpeechRecognition'}`);
    } else {
      setIsSupported(false);
      addLog('❌ Speech Recognition API NOT supported');
    }
    
    // Check HTTPS
    if (window.location.protocol === 'https:') {
      addLog('✅ HTTPS detected');
    } else {
      addLog('⚠️ HTTP detected - Speech Recognition may not work');
    }
    
  }, []);

  const startListening = () => {
    if (!isSupported) {
      addLog('❌ Cannot start - API not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    addLog('🎤 Attempting to start recognition...');
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'de-DE';
    
    recognition.onstart = () => {
      addLog('✅ Recognition started successfully');
      setIsListening(true);
      setError(null);
    };
    
    recognition.onresult = (event) => {
      if (event.results.length > 0) {
        const result = event.results[0][0].transcript;
        addLog(`✅ Transcript received: "${result}"`);
        setTranscript(result);
      }
    };
    
    recognition.onerror = (event) => {
      addLog(`❌ Recognition error: ${event.error}`);
      setError(event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      addLog('🔴 Recognition ended');
      setIsListening(false);
    };
    
    try {
      recognition.start();
    } catch (err) {
      addLog(`❌ Failed to start recognition: ${err.message}`);
      setError(err.message);
    }
  };

  const testMicrophonePermission = async () => {
    addLog('🎤 Testing microphone permission...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      addLog('✅ Microphone permission granted');
      stream.getTracks().forEach(track => track.stop()); // Clean up
    } catch (err) {
      addLog(`❌ Microphone permission denied: ${err.message}`);
      setError(`Microphone: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-card rounded-lg border border-border max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-foreground">🔧 Voice Debug Test</h2>
      
      {/* Status */}
      <div className="mb-4 space-y-2">
        <div className={`flex items-center gap-2 ${isSupported ? 'text-green-600' : 'text-red-600'}`}>
          <div className={`w-3 h-3 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Speech Recognition: {isSupported ? 'Supported' : 'Not Supported'}</span>
        </div>
        
        <div className={`flex items-center gap-2 ${isListening ? 'text-blue-600' : 'text-gray-600'}`}>
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
          <span>Status: {isListening ? 'Listening...' : 'Inactive'}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-4 space-x-3">
        <button
          onClick={startListening}
          disabled={!isSupported || isListening}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400 flex items-center gap-2"
        >
          <Mic className="w-4 h-4" />
          Start Voice Test
        </button>
        
        <button
          onClick={testMicrophonePermission}
          className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2"
        >
          <MicOff className="w-4 h-4" />
          Test Microphone
        </button>
      </div>

      {/* Results */}
      {transcript && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800">Transcript:</h3>
          <p className="text-green-700">"{transcript}"</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Debug Log */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h3 className="font-semibold mb-2 text-gray-800">Debug Log:</h3>
        <div className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
          {debugLog.map((log, index) => (
            <div key={index} className="font-mono">{log}</div>
          ))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800">Test Instructions:</h3>
        <ol className="text-blue-700 text-sm mt-1 space-y-1">
          <li>1. Click "Test Microphone" to check permissions</li>
          <li>2. Click "Start Voice Test" to test speech recognition</li>
          <li>3. Speak clearly in German when listening starts</li>
          <li>4. Check the debug log for detailed information</li>
        </ol>
      </div>
    </div>
  );
};

export default VoiceDebugTest;

