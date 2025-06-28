/**
 * WakewordButton.jsx - V6.1.9
 * 
 * Optionales Wakeword-Modul (Stub):
 * - Aktivier-/deaktivierbar
 * - Statusausgabe: „🗣 Wake-Modus aktiviert"
 * - Integration mit VoiceSystemHandler
 * - Vorbereitung für echte Wakeword-Erkennung (Porcupine, etc.)
 */

import React from 'react';
import { Zap, ZapOff, Ear, EarOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceSystemHandler } from '../../hooks/VoiceSystemHandler';

const WakewordButton = ({ 
  className = '', 
  size = 'default',
  showStatus = true,
  variant = 'outline'
}) => {
  const {
    voiceStatus,
    isWakewordMode,
    error,
    isSupported,
    toggleWakewordMode,
    getStatusMessage,
    getStatusColor,
    getGlobalState
  } = useVoiceSystemHandler();

  const handleWakewordToggle = () => {
    const success = toggleWakewordMode();
    if (!success) {
      console.warn('🚨 Failed to toggle wakeword mode');
    } else {
      console.log('🗣 Wakeword mode toggled:', !isWakewordMode);
    }
  };

  // Debug info for development
  const debugInfo = getGlobalState();

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          disabled
          size={size}
          variant="outline"
          className="opacity-50"
        >
          <EarOff className="w-4 h-4" />
        </Button>
        {showStatus && (
          <span className="text-xs text-red-500">
            Wakeword nicht verfügbar
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Main Wakeword Button */}
      <div className="relative">
        <Button
          onClick={handleWakewordToggle}
          size={size}
          variant={isWakewordMode ? "default" : variant}
          className={`
            transition-all duration-200
            ${isWakewordMode 
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
              : 'hover:bg-accent'
            }
            ${error ? 'border-red-500' : ''}
          `}
          disabled={voiceStatus === 'error'}
        >
          {isWakewordMode ? (
            <Ear className="w-4 h-4" />
          ) : (
            <EarOff className="w-4 h-4" />
          )}
        </Button>
        
        {/* Active indicator */}
        {isWakewordMode && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Status Display */}
      {showStatus && (
        <div className="flex flex-col gap-1">
          <span className={`text-xs ${getStatusColor()}`}>
            {isWakewordMode ? '🗣 Wake-Modus aktiviert' : '🗣 Hey Clara inaktiv'}
          </span>
          
          {/* Error Display */}
          {error && (
            <span className="text-xs text-red-500">
              Fehler: {error}
            </span>
          )}
          
          {/* Development Info */}
          {process.env.NODE_ENV === 'development' && isWakewordMode && (
            <div className="text-xs text-gray-400 space-y-1">
              <div>Status: {voiceStatus}</div>
              <div>Manual: {debugInfo.isManualListening ? 'Aktiv' : 'Inaktiv'}</div>
              <div>Session: {debugInfo.currentSession || 'Keine'}</div>
            </div>
          )}
        </div>
      )}

      {/* Wakeword Activity Indicator */}
      {isWakewordMode && (
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-blue-500 animate-pulse" />
          <span className="text-xs text-blue-600">
            Listening for "Hey Clara"
          </span>
        </div>
      )}
    </div>
  );
};

export default WakewordButton;

