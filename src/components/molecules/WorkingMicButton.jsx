/**
 * WorkingMicButton.jsx - Simple Voice Input
 * 
 * Einfacher, funktionierender Mikrofon-Button:
 * - Direkte Web Speech API Integration
 * - Keine komplexen Hook-Abhängigkeiten
 * - Garantiert funktionsfähig
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WorkingMicButton = ({ 
  onTranscriptReceived, 
  className = '', 
  size = 'default',
  showStatus = true 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
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

      recognitionRef.current.onstart = () => {
        console.log('🎤 WorkingMicButton: Voice recognition started');
        setIsListening(true);
        setError(null);
        startAudioMonitoring();
      };

      recognitionRef.current.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const transcriptText = result[0].transcript;
        
        setTranscript(transcriptText);
        console.log('🎯 WorkingMicButton: Transcript:', transcriptText);
        
        if (result.isFinal && transcriptText.trim()) {
          console.log('📝 WorkingMicButton: Final transcript:', transcriptText);
          if (onTranscriptReceived) {
            onTranscriptReceived(transcriptText);
          }
        }
      };

      recognitionRef.current.onend = () => {
        console.log('🎤 WorkingMicButton: Voice recognition ended');
        setIsListening(false);
        stopAudioMonitoring();
        setTranscript('');
      };

      recognitionRef.current.onerror = (event) => {
        console.error('🚨 WorkingMicButton: Voice recognition error:', event.error);
        setError(event.error);
        setIsListening(false);
        stopAudioMonitoring();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopAudioMonitoring();
    };
  }, [onTranscriptReceived]);

  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (isListening && analyzer) {
          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const normalizedLevel = Math.min(average / 128, 1);
          setAudioLevel(normalizedLevel);
          
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
      
      // Auto-stop after 8 seconds
      setTimeout(() => {
        if (isListening) {
          stopListening();
        }
      }, 8000);
      
    } catch (error) {
      console.warn('🚨 WorkingMicButton: Audio monitoring failed:', error);
    }
  };

  const stopAudioMonitoring = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    try {
      setTranscript('');
      setError(null);
      recognitionRef.current.start();
    } catch (error) {
      console.error('🚨 WorkingMicButton: Failed to start listening:', error);
      setError(error.message);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!isSupported) {
    return (
      <Button disabled size={size} variant="outline" className={`opacity-50 ${className}`}>
        <Mic className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Main Mic Button */}
      <div className="relative">
        <Button
          onClick={handleMicClick}
          size={size}
          variant={isListening ? "default" : "outline"}
          className={`
            transition-all duration-200
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg' 
              : 'hover:bg-accent'
            }
            ${error ? 'border-red-500' : ''}
          `}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
        
        {/* Recording indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Audio Level Bars */}
      {isListening && (
        <div className="flex items-center gap-1 h-6">
          {[...Array(5)].map((_, i) => {
            const isActive = i < Math.ceil(audioLevel * 5);
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-100 ${
                  isActive ? 'bg-green-500 h-4' : 'bg-gray-300 h-2'
                }`}
              />
            );
          })}
        </div>
      )}

      {/* Status */}
      {showStatus && (
        <div className="flex flex-col gap-1">
          <span className={`text-xs ${
            isListening ? 'text-green-500' : 
            error ? 'text-red-500' : 'text-gray-500'
          }`}>
            {isListening ? '🎧 Clara hört zu...' : 
             error ? '⚠️ Fehler' : '🎙️ Bereit'}
          </span>
          
          {error && (
            <span className="text-xs text-red-500">
              {error}
            </span>
          )}
          
          {transcript && isListening && (
            <span className="text-xs text-blue-600 max-w-32 truncate">
              "{transcript}"
            </span>
          )}
        </div>
      )}

      {/* Activity Indicator */}
      {isListening && (
        <Activity className="w-4 h-4 text-green-500 animate-pulse" />
      )}
    </div>
  );
};

export default WorkingMicButton;

