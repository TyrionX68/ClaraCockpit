import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Natural TTS Hook with Clara's Personality & Emotions
 * Features:
 * - Emotional speech synthesis
 * - Clara's characteristic speaking style
 * - SSML support for advanced control
 * - Voice modulation based on content type
 * - Interruption handling
 * - Queue management
 */
export const useNaturalTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [queue, setQueue] = useState([]);
  const [error, setError] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.1,
    volume: 1.0,
    voice: null
  });

  const utteranceRef = useRef(null);
  const queueRef = useRef([]);

  // Clara's personality traits for speech modulation
  const personalityTraits = {
    friendly: { pitch: 1.1, rate: 1.0, volume: 1.0 },
    professional: { pitch: 1.0, rate: 0.9, volume: 0.9 },
    excited: { pitch: 1.2, rate: 1.1, volume: 1.0 },
    concerned: { pitch: 0.9, rate: 0.8, volume: 0.8 },
    confident: { pitch: 1.0, rate: 1.0, volume: 1.0 },
    helpful: { pitch: 1.05, rate: 0.95, volume: 0.95 }
  };

  // Content type detection for appropriate voice modulation
  const contentTypes = {
    greeting: /^(hallo|guten|hi|hey|willkommen)/i,
    question: /\?$/,
    exclamation: /!$/,
    numbers: /\d+([.,]\d+)?/g,
    currency: /€|\$|EUR|USD/i,
    technical: /(fehler|error|problem|warnung|achtung)/i,
    positive: /(super|toll|perfekt|ausgezeichnet|großartig|wunderbar)/i,
    negative: /(leider|schade|problem|fehler|nicht möglich)/i
  };

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // Prefer German female voices for Clara
        const preferredVoices = [
          'Google Deutsch',
          'Microsoft Hedda - German (Germany)',
          'Microsoft Katja - German (Germany)',
          'Marlene',
          'Vicki'
        ];
        
        let selectedVoice = null;
        for (const preferred of preferredVoices) {
          selectedVoice = voices.find(voice => 
            voice.name.includes(preferred) || 
            (voice.lang.startsWith('de') && voice.name.toLowerCase().includes('female'))
          );
          if (selectedVoice) break;
        }
        
        // Fallback to any German voice
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith('de'));
        }
        
        setVoiceSettings(prev => ({ ...prev, voice: selectedVoice }));
      };
      
      // Load voices immediately and on voiceschanged event
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Analyze content and determine appropriate emotion/style
  const analyzeContent = useCallback((text) => {
    const analysis = {
      emotion: 'friendly',
      contentType: 'general',
      emphasis: [],
      pauses: []
    };

    // Detect content type
    if (contentTypes.greeting.test(text)) {
      analysis.emotion = 'friendly';
      analysis.contentType = 'greeting';
    } else if (contentTypes.question.test(text)) {
      analysis.emotion = 'helpful';
      analysis.contentType = 'question';
    } else if (contentTypes.exclamation.test(text)) {
      analysis.emotion = 'excited';
      analysis.contentType = 'exclamation';
    } else if (contentTypes.technical.test(text)) {
      analysis.emotion = 'professional';
      analysis.contentType = 'technical';
    } else if (contentTypes.positive.test(text)) {
      analysis.emotion = 'excited';
      analysis.contentType = 'positive';
    } else if (contentTypes.negative.test(text)) {
      analysis.emotion = 'concerned';
      analysis.contentType = 'negative';
    }

    // Find numbers for special pronunciation
    const numbers = text.match(contentTypes.numbers);
    if (numbers) {
      analysis.emphasis = numbers;
    }

    // Add natural pauses
    const sentences = text.split(/[.!?]+/);
    if (sentences.length > 1) {
      analysis.pauses = sentences.map((_, index) => index * 2); // Pause after each sentence
    }

    return analysis;
  }, []);

  // Generate SSML for advanced speech control
  const generateSSML = useCallback((text, analysis) => {
    let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="de-DE">`;
    
    // Add prosody based on emotion
    const emotion = personalityTraits[analysis.emotion] || personalityTraits.friendly;
    
    ssml += `<prosody rate="${emotion.rate}" pitch="${emotion.pitch}" volume="${emotion.volume}">`;
    
    // Process text with emphasis and pauses
    let processedText = text;
    
    // Add emphasis to numbers and currency
    if (analysis.emphasis.length > 0) {
      analysis.emphasis.forEach(item => {
        processedText = processedText.replace(
          new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          `<emphasis level="moderate">${item}</emphasis>`
        );
      });
    }
    
    // Add natural pauses
    processedText = processedText.replace(/\./g, '.<break time="500ms"/>');
    processedText = processedText.replace(/,/g, ',<break time="200ms"/>');
    processedText = processedText.replace(/;/g, ';<break time="300ms"/>');
    
    // Clara's characteristic phrases
    const claraExpressions = {
      'Gerne!': '<prosody pitch="+10%" rate="1.1">Gerne!</prosody>',
      'Natürlich!': '<prosody pitch="+5%" rate="1.05">Natürlich!</prosody>',
      'Kein Problem!': '<prosody pitch="+8%" rate="1.1">Kein Problem!</prosody>',
      'Sehr gut!': '<prosody pitch="+12%" rate="1.1">Sehr gut!</prosody>',
      'Perfekt!': '<prosody pitch="+15%" rate="1.2">Perfekt!</prosody>'
    };
    
    Object.entries(claraExpressions).forEach(([phrase, ssmlPhrase]) => {
      processedText = processedText.replace(new RegExp(phrase, 'g'), ssmlPhrase);
    });
    
    ssml += processedText;
    ssml += `</prosody></speak>`;
    
    return ssml;
  }, []);

  // Create optimized utterance
  const createUtterance = useCallback((text, options = {}) => {
    const analysis = analyzeContent(text);
    const emotion = personalityTraits[analysis.emotion] || personalityTraits.friendly;
    
    // Try SSML first, fallback to plain text
    let utteranceText = text;
    if (window.speechSynthesis.speak.toString().includes('ssml')) {
      utteranceText = generateSSML(text, analysis);
    }
    
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    
    // Apply voice settings
    if (voiceSettings.voice) {
      utterance.voice = voiceSettings.voice;
    }
    
    // Apply emotional modulation
    utterance.rate = options.rate || emotion.rate;
    utterance.pitch = options.pitch || emotion.pitch;
    utterance.volume = options.volume || emotion.volume;
    utterance.lang = 'de-DE';
    
    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentText(text);
      console.log('🔊 Clara spricht:', text.substring(0, 50) + '...');
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentText('');
      processQueue();
    };
    
    utterance.onerror = (event) => {
      console.error('🚨 TTS Error:', event.error);
      setError(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
      setCurrentText('');
      processQueue();
    };
    
    utterance.onpause = () => {
      setIsPaused(true);
    };
    
    utterance.onresume = () => {
      setIsPaused(false);
    };
    
    return utterance;
  }, [voiceSettings, analyzeContent, generateSSML]);

  // Process speech queue
  const processQueue = useCallback(() => {
    if (queueRef.current.length > 0 && !isSpeaking) {
      const nextItem = queueRef.current.shift();
      setQueue([...queueRef.current]);
      
      const utterance = createUtterance(nextItem.text, nextItem.options);
      utteranceRef.current = utterance;
      
      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('🚨 Speech synthesis failed:', err);
        setError('Failed to start speech synthesis');
        processQueue(); // Try next item
      }
    }
  }, [isSpeaking, createUtterance]);

  // Speak text immediately
  const speak = useCallback((text, options = {}) => {
    if (!isSupported || !text.trim()) return;
    
    // Stop current speech if interruption is allowed
    if (options.interrupt !== false) {
      stop();
    }
    
    const utterance = createUtterance(text, options);
    utteranceRef.current = utterance;
    
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('🚨 Speech synthesis failed:', err);
      setError('Failed to start speech synthesis');
    }
  }, [isSupported, createUtterance]);

  // Add text to queue
  const addToQueue = useCallback((text, options = {}) => {
    if (!isSupported || !text.trim()) return;
    
    const queueItem = { text, options, id: Date.now() };
    queueRef.current.push(queueItem);
    setQueue([...queueRef.current]);
    
    // Start processing if not currently speaking
    if (!isSpeaking) {
      processQueue();
    }
  }, [isSupported, isSpeaking, processQueue]);

  // Stop speech
  const stop = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentText('');
  }, []);

  // Pause speech
  const pause = useCallback(() => {
    if (window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
    }
  }, [isSpeaking]);

  // Resume speech
  const resume = useCallback(() => {
    if (window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isPaused]);

  // Clear queue
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    setQueue([]);
  }, []);

  // Clara's characteristic responses
  const claraResponses = {
    greeting: [
      "Hallo! Ich bin Clara, Ihre KI-Assistentin für Immobilienverwaltung. Wie kann ich Ihnen helfen?",
      "Guten Tag! Clara hier. Womit kann ich Ihnen behilflich sein?",
      "Hallo! Schön, Sie zu sehen. Was kann ich heute für Sie tun?"
    ],
    
    confirmation: [
      "Gerne! Das mache ich sofort für Sie.",
      "Natürlich! Einen Moment bitte.",
      "Kein Problem! Ich kümmere mich darum.",
      "Sehr gerne! Das erledige ich für Sie."
    ],
    
    error: [
      "Entschuldigung, da ist etwas schiefgelaufen. Können Sie es bitte nochmal versuchen?",
      "Tut mir leid, ich konnte das nicht verstehen. Könnten Sie das anders formulieren?",
      "Leider gab es einen Fehler. Lassen Sie es uns nochmal probieren."
    ],
    
    success: [
      "Perfekt! Das hat geklappt.",
      "Ausgezeichnet! Alles erledigt.",
      "Super! Das war erfolgreich.",
      "Wunderbar! Fertig."
    ]
  };

  // Get random Clara response
  const getClaraResponse = useCallback((type) => {
    const responses = claraResponses[type] || [];
    return responses[Math.floor(Math.random() * responses.length)] || '';
  }, []);

  // Speak Clara response
  const speakClaraResponse = useCallback((type, options = {}) => {
    const response = getClaraResponse(type);
    if (response) {
      speak(response, options);
    }
  }, [getClaraResponse, speak]);

  return {
    // State
    isSpeaking,
    isPaused,
    isSupported,
    currentText,
    queue,
    error,
    voiceSettings,
    
    // Actions
    speak,
    addToQueue,
    stop,
    pause,
    resume,
    clearQueue,
    
    // Clara-specific
    speakClaraResponse,
    getClaraResponse,
    
    // Utilities
    updateVoiceSettings: setVoiceSettings,
    clearError: () => setError(null),
    
    // Status
    getStatus: () => ({
      isSpeaking,
      isPaused,
      currentText,
      queueLength: queue.length,
      error
    })
  };
};

