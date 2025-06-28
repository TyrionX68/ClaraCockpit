/**
 * VoiceSystemHandler.js - V6.1.9
 * 
 * Zentrale Verwaltung für Voice-Modi:
 * - Trennung von Wakeword & Manual Mode
 * - Gemeinsames State-Management
 * - Event-Blocker für parallele Sessions
 * - Konflikt-Vermeidung zwischen Voice-Systemen
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Global state to prevent conflicts between voice systems
let globalVoiceState = {
  isManualListening: false,
  isWakewordActive: false,
  currentSession: null,
  audioContext: null,
  mediaStream: null
};

export const useVoiceSystemHandler = () => {
  const [voiceStatus, setVoiceStatus] = useState('inactive'); // inactive, listening, wakeword, error
  const [isListening, setIsListening] = useState(false);
  const [isWakewordMode, setIsWakewordMode] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);
  const audioAnalyzerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'de-DE';
      recognitionRef.current.maxAlternatives = 1;

      // Event handlers
      recognitionRef.current.onstart = () => {
        console.log('🎤 Voice recognition started');
        setIsListening(true);
        setVoiceStatus('listening');
        setError(null);
        startAudioLevelMonitoring();
      };

      recognitionRef.current.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcriptText = result[0].transcript;
        const confidenceScore = result[0].confidence || 0;
        
        setTranscript(transcriptText);
        setConfidence(confidenceScore);
        
        console.log('🎯 Transcript:', transcriptText, 'Confidence:', confidenceScore);
      };

      recognitionRef.current.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
        setVoiceStatus(isWakewordMode ? 'wakeword' : 'inactive');
        stopAudioLevelMonitoring();
        globalVoiceState.isManualListening = false;
        globalVoiceState.currentSession = null;
      };

      recognitionRef.current.onerror = (event) => {
        console.error('🚨 Voice recognition error:', event.error);
        setError(event.error);
        setIsListening(false);
        setVoiceStatus('error');
        stopAudioLevelMonitoring();
        globalVoiceState.isManualListening = false;
        globalVoiceState.currentSession = null;
      };

      recognitionRef.current.onaudiostart = () => {
        console.log('🎧 Audio input started');
      };

      recognitionRef.current.onaudioend = () => {
        console.log('🎧 Audio input ended');
        stopAudioLevelMonitoring();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopAudioLevelMonitoring();
    };
  }, [isWakewordMode]);

  // Audio Level Monitoring
  const startAudioLevelMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      globalVoiceState.mediaStream = stream;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      globalVoiceState.audioContext = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      audioAnalyzerRef.current = analyzer;
      
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (audioAnalyzerRef.current && isListening) {
          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const normalizedLevel = Math.min(average / 128, 1);
          setAudioLevel(normalizedLevel);
          
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
      
    } catch (error) {
      console.warn('🚨 Audio level monitoring failed:', error);
    }
  }, [isListening]);

  const stopAudioLevelMonitoring = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (globalVoiceState.audioContext) {
      globalVoiceState.audioContext.close();
      globalVoiceState.audioContext = null;
    }
    
    if (globalVoiceState.mediaStream) {
      globalVoiceState.mediaStream.getTracks().forEach(track => track.stop());
      globalVoiceState.mediaStream = null;
    }
    
    setAudioLevel(0);
  }, []);

  // Manual Speech Recognition (Sprechen Button)
  const startManualListening = useCallback(() => {
    // Conflict prevention
    if (globalVoiceState.isManualListening || globalVoiceState.isWakewordActive) {
      console.warn('⚠️ Voice system conflict! Manual listening blocked.');
      setError('Voice system already active');
      return false;
    }

    if (!recognitionRef.current) {
      setError('Speech recognition not supported');
      return false;
    }

    try {
      globalVoiceState.isManualListening = true;
      globalVoiceState.currentSession = 'manual';
      
      setTranscript('');
      setConfidence(0);
      setError(null);
      
      recognitionRef.current.start();
      
      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (globalVoiceState.isManualListening && recognitionRef.current) {
          console.log('⏰ Auto-stopping manual listening after 8 seconds');
          stopManualListening();
        }
      }, 8000);
      
      return true;
    } catch (error) {
      console.error('🚨 Failed to start manual listening:', error);
      setError(error.message);
      globalVoiceState.isManualListening = false;
      globalVoiceState.currentSession = null;
      return false;
    }
  }, []);

  const stopManualListening = useCallback(() => {
    if (recognitionRef.current && globalVoiceState.isManualListening) {
      recognitionRef.current.stop();
    }
  }, []);

  // Wakeword Mode (Hey Clara)
  const toggleWakewordMode = useCallback(() => {
    // Conflict prevention
    if (globalVoiceState.isManualListening) {
      console.warn('⚠️ Cannot activate wakeword while manual listening is active');
      setError('Manual listening is active');
      return false;
    }

    const newWakewordState = !isWakewordMode;
    setIsWakewordMode(newWakewordState);
    globalVoiceState.isWakewordActive = newWakewordState;
    
    if (newWakewordState) {
      setVoiceStatus('wakeword');
      console.log('🗣 Wake-Modus aktiviert - Hey Clara listening...');
      // TODO: Implement actual wakeword detection (Porcupine, etc.)
    } else {
      setVoiceStatus('inactive');
      console.log('🗣 Wake-Modus deaktiviert');
    }
    
    return true;
  }, [isWakewordMode]);

  // Status helpers
  const getStatusMessage = useCallback(() => {
    switch (voiceStatus) {
      case 'inactive':
        return '🎙️ Erkennung ist inaktiv';
      case 'listening':
        return '🎧 Clara hört zu...';
      case 'wakeword':
        return '🗣 Wake-Modus aktiviert';
      case 'error':
        return '⚠️ Fehler in Sprachmodul';
      default:
        return '🎙️ Erkennung ist inaktiv';
    }
  }, [voiceStatus]);

  const getStatusColor = useCallback(() => {
    switch (voiceStatus) {
      case 'inactive':
        return 'text-gray-500';
      case 'listening':
        return 'text-green-500';
      case 'wakeword':
        return 'text-blue-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }, [voiceStatus]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
  }, []);

  // Check if voice recognition is supported
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return {
    // State
    voiceStatus,
    isListening,
    isWakewordMode,
    audioLevel,
    confidence,
    transcript,
    error,
    isSupported,
    
    // Manual listening controls
    startManualListening,
    stopManualListening,
    
    // Wakeword controls
    toggleWakewordMode,
    
    // Utilities
    getStatusMessage,
    getStatusColor,
    clearTranscript,
    
    // Global state access (for debugging)
    getGlobalState: () => ({ ...globalVoiceState })
  };
};

