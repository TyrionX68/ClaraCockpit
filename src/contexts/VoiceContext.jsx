/**
 * VoiceContextProvider
 * Globaler Voice-State für Clara V6
 * MetaGovernor Phase 4: Voice Live-Aktivierung
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';

const VoiceContext = createContext();

export const useVoiceContext = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoiceContext must be used within a VoiceContextProvider');
  }
  return context;
};

export const VoiceContextProvider = ({ children, onTranscript }) => {
  const voiceHook = useVoiceRecognition();
  
  // Handle transcript changes
  useEffect(() => {
    if (voiceHook.transcript && onTranscript) {
      console.log('Voice transcript received:', voiceHook.transcript);
      onTranscript(voiceHook.transcript);
      
      // Clear transcript after processing
      setTimeout(() => {
        voiceHook.clearTranscript();
      }, 1000);
    }
  }, [voiceHook.transcript, onTranscript, voiceHook.clearTranscript]);

  // Enhanced voice methods with error handling
  const enhancedVoiceHook = {
    ...voiceHook,
    
    // Enhanced start with better error handling
    startVoiceEnhanced: async () => {
      try {
        await voiceHook.startVoice();
        console.log('Voice started successfully');
      } catch (error) {
        console.error('Failed to start voice:', error);
      }
    },
    
    // Enhanced stop with cleanup
    stopVoiceEnhanced: async () => {
      try {
        await voiceHook.stopVoice();
        console.log('Voice stopped successfully');
      } catch (error) {
        console.error('Failed to stop voice:', error);
      }
    },
    
    // Get voice status for UI
    getVoiceStatus: () => {
      if (!voiceHook.isSupported) return 'unsupported';
      if (voiceHook.error) return 'error';
      if (voiceHook.isListening) return 'listening';
      if (voiceHook.voiceActive) return 'active';
      return 'inactive';
    },
    
    // Get status message for UI
    getStatusMessage: () => {
      const status = enhancedVoiceHook.getVoiceStatus();
      switch (status) {
        case 'unsupported':
          return 'Voice-Erkennung wird von diesem Browser nicht unterstützt';
        case 'error':
          return `Voice-Fehler: ${voiceHook.error}`;
        case 'listening':
          return 'Ich höre zu... Sprechen Sie jetzt!';
        case 'active':
          return 'Voice-Erkennung ist bereit';
        case 'inactive':
        default:
          return 'Voice-Erkennung ist inaktiv';
      }
    }
  };

  return (
    <VoiceContext.Provider value={enhancedVoiceHook}>
      {children}
    </VoiceContext.Provider>
  );
};

