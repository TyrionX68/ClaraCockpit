/**
 * useVoiceRecognition Hook
 * Echte Speech Recognition Integration für Clara V6
 * MetaGovernor Phase 4: Voice Live-Aktivierung
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const useVoiceRecognition = () => {
  const [voiceActive, setVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      
      // Configuration
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'de-DE';
      recognition.maxAlternatives = 1;
      
      // Event handlers
      recognition.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
        setError(null);
        
        // Safety timeout - prevent hanging
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            setError('Voice recognition timeout');
          }
        }, 10000); // 10 second timeout
      };
      
      recognition.onresult = (event) => {
        console.log('Voice recognition result:', event);
        
        if (event.results.length > 0) {
          const result = event.results[0][0].transcript;
          console.log('Transcript:', result);
          setTranscript(result);
        }
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        setError(event.error);
        setIsListening(false);
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
      
      recognition.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
        
        // Clear timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
      
      recognitionRef.current = recognition;
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Start voice recognition
  const startVoice = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition not supported');
      return;
    }
    
    if (!recognitionRef.current) {
      setError('Speech recognition not initialized');
      return;
    }
    
    if (isListening) {
      console.log('Voice recognition already active');
      return;
    }
    
    try {
      setVoiceActive(true);
      setTranscript('');
      setError(null);
      
      // Clara greeting
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance('Wie kann ich Ihnen helfen?');
        utterance.lang = 'de-DE';
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        
        utterance.onend = () => {
          // Start recognition after greeting
          setTimeout(() => {
            if (recognitionRef.current && voiceActive) {
              recognitionRef.current.start();
            }
          }, 500);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        // Start recognition immediately if no speech synthesis
        recognitionRef.current.start();
      }
      
    } catch (err) {
      console.error('Error starting voice recognition:', err);
      setError(err.message);
      setVoiceActive(false);
    }
  }, [isSupported, isListening, voiceActive]);

  // Stop voice recognition
  const stopVoice = useCallback(() => {
    try {
      setVoiceActive(false);
      
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
    } catch (err) {
      console.error('Error stopping voice recognition:', err);
      setError(err.message);
    }
  }, [isListening]);

  // Toggle voice recognition
  const toggleVoice = useCallback(() => {
    if (voiceActive) {
      stopVoice();
    } else {
      startVoice();
    }
  }, [voiceActive, startVoice, stopVoice]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    voiceActive,
    isListening,
    transcript,
    error,
    isSupported,
    startVoice,
    stopVoice,
    toggleVoice,
    clearTranscript
  };
};

