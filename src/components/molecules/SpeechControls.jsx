import React, { useState } from 'react';
import { Volume2, VolumeX, Pause, Play, Settings, Speaker } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

/**
 * Speech Controls Component
 * Provides controls for Clara's speech synthesis settings
 */
const SpeechControls = ({ 
  className = "",
  showSettings = false,
  onSettingsChange
}) => {
  const {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    error,
    settings,
    stop,
    pause,
    resume,
    updateSettings,
    changeVoice,
    getGermanVoices
  } = useSpeechSynthesis();

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handle settings change
  const handleSettingChange = (key, value) => {
    const newSettings = { [key]: value };
    updateSettings(newSettings);
    
    if (onSettingsChange) {
      onSettingsChange({ ...settings, ...newSettings });
    }
  };

  // Handle voice change
  const handleVoiceChange = (voiceName) => {
    changeVoice(voiceName);
    
    if (onSettingsChange) {
      const voice = voices.find(v => v.name === voiceName);
      onSettingsChange({ ...settings, selectedVoice: voice });
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
        <VolumeX className="w-4 h-4" />
        <span className="text-sm">Audio nicht unterstützt</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Speaking Status */}
      <div className="flex items-center gap-2">
        {isSpeaking ? (
          <div className="flex items-center gap-1">
            <Volume2 className="w-4 h-4 text-green-600 animate-pulse" />
            <span className="text-sm text-green-600">Spricht...</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Speaker className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Audio bereit</span>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      {isSpeaking && (
        <div className="flex gap-1">
          {isPaused ? (
            <Button
              onClick={resume}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              title="Fortsetzen"
            >
              <Play className="w-3 h-3" />
            </Button>
          ) : (
            <Button
              onClick={pause}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              title="Pausieren"
            >
              <Pause className="w-3 h-3" />
            </Button>
          )}
          
          <Button
            onClick={stop}
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            title="Stoppen"
          >
            <VolumeX className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Settings Button */}
      {showSettings && (
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          title="Audio-Einstellungen"
        >
          <Settings className="w-3 h-3" />
        </Button>
      )}

      {/* Advanced Settings Panel */}
      {showAdvanced && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-card border border-border rounded-lg shadow-lg z-50 min-w-80">
          <h3 className="text-sm font-medium mb-3">Audio-Einstellungen</h3>
          
          {/* Voice Selection */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Stimme</label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => handleVoiceChange(e.target.value)}
                className="w-full mt-1 p-2 text-sm border border-input rounded bg-background"
              >
                <option value="">Standard</option>
                {getGermanVoices().map(voice => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Rate Control */}
            <div>
              <label className="text-xs text-muted-foreground">
                Geschwindigkeit: {settings.rate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.rate}
                onChange={(e) => handleSettingChange('rate', parseFloat(e.target.value))}
                className="w-full mt-1"
              />
            </div>

            {/* Pitch Control */}
            <div>
              <label className="text-xs text-muted-foreground">
                Tonhöhe: {settings.pitch.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={settings.pitch}
                onChange={(e) => handleSettingChange('pitch', parseFloat(e.target.value))}
                className="w-full mt-1"
              />
            </div>

            {/* Volume Control */}
            <div>
              <label className="text-xs text-muted-foreground">
                Lautstärke: {Math.round(settings.volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                className="w-full mt-1"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-3 text-xs text-red-500">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeechControls;

