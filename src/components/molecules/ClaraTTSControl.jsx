import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Pause, Play, SkipForward, Trash2, Settings, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useNaturalTTS } from '../../hooks/useNaturalTTS';

/**
 * Clara TTS Control Component with Personality Visualization
 * Features:
 * - Emotional speech indicators
 * - Voice settings control
 * - Queue management
 * - Clara's personality display
 * - Real-time speech visualization
 */
const ClaraTTSControl = ({ 
  showSettings = false,
  showQueue = false,
  showPersonality = true,
  autoResponses = true
}) => {
  const {
    isSpeaking,
    isPaused,
    isSupported,
    currentText,
    queue,
    error,
    voiceSettings,
    speak,
    addToQueue,
    stop,
    pause,
    resume,
    clearQueue,
    speakClaraResponse,
    getClaraResponse,
    updateVoiceSettings,
    clearError,
    getStatus
  } = useNaturalTTS();

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [testText, setTestText] = useState('');
  const [currentEmotion, setCurrentEmotion] = useState('friendly');

  // Clara's emotional states with visual representations
  const emotionalStates = {
    friendly: { 
      color: 'text-green-500', 
      bg: 'bg-green-50', 
      icon: '😊', 
      description: 'Freundlich & Hilfsbereit' 
    },
    professional: { 
      color: 'text-blue-500', 
      bg: 'bg-blue-50', 
      icon: '👩‍💼', 
      description: 'Professionell & Kompetent' 
    },
    excited: { 
      color: 'text-orange-500', 
      bg: 'bg-orange-50', 
      icon: '🎉', 
      description: 'Begeistert & Energisch' 
    },
    concerned: { 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50', 
      icon: '🤔', 
      description: 'Aufmerksam & Sorgfältig' 
    },
    confident: { 
      color: 'text-purple-500', 
      bg: 'bg-purple-50', 
      icon: '💪', 
      description: 'Selbstbewusst & Zielstrebig' 
    },
    helpful: { 
      color: 'text-pink-500', 
      bg: 'bg-pink-50', 
      icon: '🤝', 
      description: 'Hilfsbereit & Unterstützend' 
    }
  };

  // Detect emotion from current text
  useEffect(() => {
    if (currentText) {
      const text = currentText.toLowerCase();
      
      if (text.includes('fehler') || text.includes('problem')) {
        setCurrentEmotion('concerned');
      } else if (text.includes('super') || text.includes('perfekt') || text.includes('toll')) {
        setCurrentEmotion('excited');
      } else if (text.includes('gerne') || text.includes('helfen') || text.includes('unterstützen')) {
        setCurrentEmotion('helpful');
      } else if (text.includes('professionell') || text.includes('analyse') || text.includes('berechnung')) {
        setCurrentEmotion('professional');
      } else if (text.includes('sicher') || text.includes('garantiert') || text.includes('definitiv')) {
        setCurrentEmotion('confident');
      } else {
        setCurrentEmotion('friendly');
      }
    }
  }, [currentText]);

  // Quick response buttons
  const quickResponses = [
    { text: 'Gerne! Das mache ich sofort für Sie.', emotion: 'helpful' },
    { text: 'Perfekt! Das hat geklappt.', emotion: 'excited' },
    { text: 'Einen Moment bitte, ich analysiere die Daten.', emotion: 'professional' },
    { text: 'Entschuldigung, könnten Sie das nochmal wiederholen?', emotion: 'concerned' }
  ];

  const handleVoiceSettingChange = (setting, value) => {
    updateVoiceSettings(prev => ({
      ...prev,
      [setting]: Array.isArray(value) ? value[0] : value
    }));
  };

  const handleTestSpeak = () => {
    if (testText.trim()) {
      speak(testText);
      setTestText('');
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
        <VolumeX className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-600">
          Sprachsynthese nicht verfügbar
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Clara Personality Display */}
      {showPersonality && (
        <div className={`p-4 rounded-lg border-2 ${emotionalStates[currentEmotion].bg} border-opacity-20`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {emotionalStates[currentEmotion].icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${emotionalStates[currentEmotion].color}`} />
                <span className={`font-medium ${emotionalStates[currentEmotion].color}`}>
                  Clara's Stimmung
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {emotionalStates[currentEmotion].description}
              </div>
            </div>
            {isSpeaking && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={isSpeaking ? (isPaused ? resume : pause) : () => speakClaraResponse('greeting')}
          variant={isSpeaking ? "default" : "outline"}
          size="sm"
          className={`flex items-center gap-2 ${
            isSpeaking ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
        >
          {isSpeaking ? (
            isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
          {isSpeaking ? (isPaused ? 'Fortsetzen' : 'Pausieren') : 'Clara Test'}
        </Button>

        {isSpeaking && (
          <Button
            onClick={stop}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <VolumeX className="w-4 h-4" />
            Stop
          </Button>
        )}

        {queue.length > 0 && (
          <>
            <Button
              onClick={clearQueue}
              variant="outline"
              size="sm"
              className="text-orange-600 hover:text-orange-700"
            >
              <Trash2 className="w-4 h-4" />
              Queue ({queue.length})
            </Button>
          </>
        )}

        <Button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          variant="ghost"
          size="sm"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Speech Display */}
      {currentText && (
        <div className={`p-3 rounded-lg border ${emotionalStates[currentEmotion].bg}`}>
          <div className="flex items-start gap-2">
            <div className="text-lg">
              {emotionalStates[currentEmotion].icon}
            </div>
            <div className="flex-1">
              <div className={`text-xs font-medium mb-1 ${emotionalStates[currentEmotion].color}`}>
                Clara spricht ({emotionalStates[currentEmotion].description}):
              </div>
              <div className="text-sm text-gray-800">
                {currentText}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Response Buttons */}
      {autoResponses && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium">
            Schnelle Clara-Antworten:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickResponses.map((response, index) => (
              <Button
                key={index}
                onClick={() => speak(response.text)}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto p-2"
                disabled={isSpeaking}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {emotionalStates[response.emotion].icon}
                  </span>
                  <span className="text-xs truncate">
                    {response.text}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {showAdvancedSettings && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700">
            Clara's Stimm-Einstellungen
          </div>
          
          {/* Voice Settings */}
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-600">
                Geschwindigkeit: {voiceSettings.rate.toFixed(1)}x
              </label>
              <Slider
                value={[voiceSettings.rate]}
                onValueChange={(value) => handleVoiceSettingChange('rate', value)}
                min={0.5}
                max={2.0}
                step={0.1}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-600">
                Tonhöhe: {voiceSettings.pitch.toFixed(1)}
              </label>
              <Slider
                value={[voiceSettings.pitch]}
                onValueChange={(value) => handleVoiceSettingChange('pitch', value)}
                min={0.5}
                max={2.0}
                step={0.1}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-600">
                Lautstärke: {Math.round(voiceSettings.volume * 100)}%
              </label>
              <Slider
                value={[voiceSettings.volume]}
                onValueChange={(value) => handleVoiceSettingChange('volume', value)}
                min={0.0}
                max={1.0}
                step={0.1}
                className="mt-1"
              />
            </div>
          </div>

          {/* Test Input */}
          <div className="space-y-2">
            <label className="text-xs text-gray-600">
              Test-Text für Clara:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Text zum Testen eingeben..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && handleTestSpeak()}
              />
              <Button
                onClick={handleTestSpeak}
                size="sm"
                disabled={!testText.trim() || isSpeaking}
              >
                Test
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Queue Display */}
      {showQueue && queue.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 font-medium">
            Warteschlange ({queue.length}):
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {queue.map((item, index) => (
              <div key={item.id} className="p-2 bg-gray-100 rounded text-xs">
                <div className="flex items-center justify-between">
                  <span className="truncate flex-1">
                    {index + 1}. {item.text}
                  </span>
                  <Button
                    onClick={() => {
                      const newQueue = queue.filter(q => q.id !== item.id);
                      clearQueue();
                      newQueue.forEach(q => addToQueue(q.text, q.options));
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="text-xs text-red-600 font-medium mb-1">
                🚨 Clara TTS Fehler:
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
    </div>
  );
};

export default ClaraTTSControl;

