// 🎤 DEUTSCHE FRAUENSTIMME TTS FIX
// Enhanced Text-to-Speech with German female voice
const speak = (text) => {
  if ('speechSynthesis' in window && text) {
    // Stoppe vorherige Sprachausgabe
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Verwende bevorzugte deutsche Frauenstimme
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Optimierte Einstellungen für deutsche Sprache
    utterance.lang = 'de-DE';
    utterance.rate = 0.85; // Etwas langsamer für bessere Verständlichkeit
    utterance.pitch = 1.1; // Etwas höher für weiblichere Stimme
    utterance.volume = 0.9;
    
    console.log('Speaking:', text, 'with voice:', preferredVoice?.name);
    speechSynthesis.speak(utterance);
  }
};
