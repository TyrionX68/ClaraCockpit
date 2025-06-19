/**
 * ClaraGreetingLoader.js
 * JSON-gesteuerte Begrüßungslogik für Clara KI
 * MetaGovernor Phase 2 - Intelligente UI mit JSON-Kontrolle
 */

// Import der JSON-Datei mit Begrüßungen
import data from '../../data/clara_ki_responses.json';

/**
 * Lädt dynamische Begrüßung aus JSON-Datei
 * @returns {string} Begrüßungstext
 */
export function getGreetingFromJSON() {
  console.log('🧠 JSON-Greeting aktiviert');
  return data.ui?.greeting || "Hallo, wie kann ich dir helfen?";
}

/**
 * Lädt Fallback-Text aus JSON-Datei
 * @returns {string} Fallback-Text
 */
export function getFallbackFromJSON() {
  return data.ui?.fallback || "Clara ist bereit für Ihre Anfragen.";
}

/**
 * Lädt Offline-Text aus JSON-Datei
 * @returns {string} Offline-Text
 */
export function getOfflineFromJSON() {
  return data.ui?.offline || "Clara ist im Ruhemodus – bitte aktualisieren.";
}

/**
 * Lädt Insight-Intro aus JSON-Datei
 * @returns {string} Insight-Intro-Text
 */
export function getInsightIntroFromJSON() {
  return data.ui?.insight_intro || "Ich habe relevante Hinweise für Sie.";
}

export default {
  getGreetingFromJSON,
  getFallbackFromJSON,
  getOfflineFromJSON,
  getInsightIntroFromJSON
};
