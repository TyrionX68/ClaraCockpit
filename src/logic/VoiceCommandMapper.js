/**
 * VoiceCommandMapper.js
 * Clara V6.1.3 Voice & Response Optimierung
 * 
 * Zweck: Mapping von gesprochenen Befehlen → Aktionen im UI/Intent-System
 * Unterstützt natürliche deutsche Spracheingaben für Immobilien-Management
 */

// Immobilien-spezifische Befehls-Patterns
const COMMAND_PATTERNS = {
  // Dashboard & Übersichten
  dashboard: [
    'dashboard', 'übersicht', 'startseite', 'hauptseite', 'home',
    'zeige dashboard', 'gehe zum dashboard', 'öffne dashboard'
  ],
  
  // Finanz-Analysen
  cashflow: [
    'cashflow', 'cash flow', 'geldfluss', 'liquidität', 'einnahmen',
    'was ist mein cashflow', 'zeige cashflow', 'wie ist der cashflow',
    'monatliche einnahmen', 'finanzübersicht'
  ],
  
  rendite: [
    'rendite', 'return', 'ertrag', 'gewinn', 'profit',
    'berechne rendite', 'wie ist die rendite', 'rendite berechnen',
    'bruttomietrendite', 'nettomietrendite', 'eigenkapitalrendite'
  ],
  
  // Mieter-Management
  mieter: [
    'mieter', 'mieterliste', 'vermieter', 'bewohner',
    'zeige mieter', 'alle mieter', 'mieterdaten',
    'wer wohnt', 'mietverträge', 'verträge'
  ],
  
  rückstände: [
    'rückstände', 'rückstand', 'schulden', 'mahnungen', 'ausstände',
    'mietrückstände', 'offene beträge', 'zahlungsrückstände',
    'wer zahlt nicht', 'säumige mieter'
  ],
  
  // Wartung & Instandhaltung
  wartung: [
    'wartung', 'instandhaltung', 'reparatur', 'reparaturen',
    'wartungsarbeiten', 'handwerker', 'termine',
    'was muss repariert werden', 'anstehende arbeiten'
  ],
  
  // Navigation
  zurück: [
    'zurück', 'back', 'rückgängig', 'vorherige seite',
    'gehe zurück', 'zurück zum dashboard', 'navigation zurück'
  ],
  
  // Berechnungen
  berechnung: [
    'berechne', 'rechne', 'kalkuliere', 'ermittle',
    'berechne mir', 'rechne aus', 'wie viel',
    'wirtschaftlichkeit', 'kosten', 'analyse'
  ],
  
  // Dokumente
  dokumente: [
    'dokumente', 'dateien', 'unterlagen', 'papiere',
    'verträge', 'rechnungen', 'belege',
    'zeige dokumente', 'dokumentenverwaltung'
  ],
  
  // Hilfe & Support
  hilfe: [
    'hilfe', 'help', 'unterstützung', 'anleitung',
    'wie funktioniert', 'was kann ich fragen',
    'befehle', 'kommandos', 'was kannst du'
  ]
};

// Zusätzliche Kontext-Keywords für präzisere Erkennung
const CONTEXT_KEYWORDS = {
  zeitraum: ['monat', 'jahr', 'quartal', 'woche', 'heute', 'aktuell'],
  objekt: ['wohnung', 'haus', 'objekt', 'immobilie', 'gebäude'],
  finanziell: ['euro', '€', 'geld', 'kosten', 'preis', 'betrag'],
  person: ['ich', 'mein', 'meine', 'uns', 'unser', 'unsere']
};

/**
 * Hauptfunktion: Mappt Spracheingabe zu Intent
 * @param {string} input - Gesprochener Text (normalisiert)
 * @param {object} context - Zusätzlicher Kontext (optional)
 * @returns {object} Intent-Objekt mit Aktion und Parametern
 */
export const mapVoiceCommand = (input, context = {}) => {
  if (!input || typeof input !== 'string') {
    return { intent: 'unknown', confidence: 0, parameters: {} };
  }

  const normalizedInput = input.toLowerCase().trim();
  const words = normalizedInput.split(/\s+/);
  
  // Durchsuche alle Befehls-Patterns
  for (const [intentType, patterns] of Object.entries(COMMAND_PATTERNS)) {
    for (const pattern of patterns) {
      const confidence = calculateMatchConfidence(normalizedInput, pattern, words);
      
      if (confidence > 0.7) {
        return {
          intent: mapIntentToAction(intentType),
          confidence,
          parameters: extractParameters(normalizedInput, intentType, words),
          originalInput: input,
          matchedPattern: pattern
        };
      }
    }
  }
  
  // Fallback: Versuche partielle Matches
  const partialMatch = findPartialMatch(normalizedInput, words);
  if (partialMatch.confidence > 0.5) {
    return partialMatch;
  }
  
  return {
    intent: 'unknown',
    confidence: 0,
    parameters: {},
    originalInput: input,
    suggestion: generateSuggestion(normalizedInput)
  };
};

/**
 * Berechnet Match-Confidence zwischen Input und Pattern
 */
const calculateMatchConfidence = (input, pattern, words) => {
  const patternWords = pattern.toLowerCase().split(/\s+/);
  
  // Exakte Übereinstimmung
  if (input.includes(pattern)) {
    return 1.0;
  }
  
  // Wort-basierte Übereinstimmung
  let matchedWords = 0;
  for (const patternWord of patternWords) {
    if (words.includes(patternWord)) {
      matchedWords++;
    }
  }
  
  const wordMatchRatio = matchedWords / patternWords.length;
  
  // Bonus für längere Patterns (spezifischere Befehle)
  const lengthBonus = Math.min(patternWords.length / 3, 0.2);
  
  return Math.min(wordMatchRatio + lengthBonus, 1.0);
};

/**
 * Mappt Intent-Typ zu konkreter Aktion
 */
const mapIntentToAction = (intentType) => {
  const actionMap = {
    dashboard: 'zeige-dashboard',
    cashflow: 'zeige-cashflow',
    rendite: 'berechne-rendite',
    mieter: 'zeige-mieter',
    rückstände: 'zeige-rückstände',
    wartung: 'zeige-wartung',
    zurück: 'navigation-zurück',
    berechnung: 'starte-berechnung',
    dokumente: 'zeige-dokumente',
    hilfe: 'zeige-hilfe'
  };
  
  return actionMap[intentType] || 'unknown';
};

/**
 * Extrahiert Parameter aus der Spracheingabe
 */
const extractParameters = (input, intentType, words) => {
  const parameters = {};
  
  // Zeitraum-Parameter
  const zeitraumMatch = CONTEXT_KEYWORDS.zeitraum.find(keyword => 
    words.includes(keyword)
  );
  if (zeitraumMatch) {
    parameters.zeitraum = zeitraumMatch;
  }
  
  // Numerische Werte
  const numberMatch = input.match(/(\d+(?:[.,]\d+)?)/);
  if (numberMatch) {
    parameters.wert = parseFloat(numberMatch[1].replace(',', '.'));
  }
  
  // Intent-spezifische Parameter
  switch (intentType) {
    case 'rendite':
      if (input.includes('brutto')) parameters.typ = 'brutto';
      if (input.includes('netto')) parameters.typ = 'netto';
      if (input.includes('eigenkapital')) parameters.typ = 'eigenkapital';
      break;
      
    case 'mieter':
      if (input.includes('alle')) parameters.filter = 'alle';
      if (input.includes('aktiv')) parameters.filter = 'aktiv';
      break;
      
    case 'berechnung':
      if (input.includes('wirtschaftlichkeit')) parameters.typ = 'wirtschaftlichkeit';
      if (input.includes('kosten')) parameters.typ = 'kosten';
      break;
  }
  
  return parameters;
};

/**
 * Sucht nach partiellen Übereinstimmungen
 */
const findPartialMatch = (input, words) => {
  const partialMatches = [];
  
  // Suche nach Schlüsselwörtern in allen Patterns
  for (const [intentType, patterns] of Object.entries(COMMAND_PATTERNS)) {
    for (const pattern of patterns) {
      const patternWords = pattern.split(/\s+/);
      const commonWords = words.filter(word => patternWords.includes(word));
      
      if (commonWords.length > 0) {
        const confidence = commonWords.length / Math.max(patternWords.length, words.length);
        partialMatches.push({
          intent: mapIntentToAction(intentType),
          confidence,
          parameters: extractParameters(input, intentType, words),
          matchedWords: commonWords
        });
      }
    }
  }
  
  // Bestes partielles Match zurückgeben
  if (partialMatches.length > 0) {
    return partialMatches.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }
  
  return { intent: 'unknown', confidence: 0, parameters: {} };
};

/**
 * Generiert Vorschläge für unbekannte Befehle
 */
const generateSuggestion = (input) => {
  const suggestions = [
    'Versuchen Sie: "Zeige Dashboard"',
    'Versuchen Sie: "Wie ist mein Cashflow?"',
    'Versuchen Sie: "Berechne Rendite"',
    'Versuchen Sie: "Zeige Mieter"',
    'Versuchen Sie: "Zeige Wartung"'
  ];
  
  // Einfache Suggestion basierend auf Input-Länge
  const index = input.length % suggestions.length;
  return suggestions[index];
};

/**
 * Hilfsfunktion: Validiert Intent-Objekt
 */
export const validateIntent = (intentObject) => {
  return (
    intentObject &&
    typeof intentObject.intent === 'string' &&
    typeof intentObject.confidence === 'number' &&
    intentObject.confidence >= 0 &&
    intentObject.confidence <= 1 &&
    typeof intentObject.parameters === 'object'
  );
};

/**
 * Hilfsfunktion: Debug-Informationen für Intent
 */
export const getIntentDebugInfo = (input) => {
  const result = mapVoiceCommand(input);
  return {
    ...result,
    debugInfo: {
      normalizedInput: input.toLowerCase().trim(),
      wordCount: input.split(/\s+/).length,
      availableIntents: Object.keys(COMMAND_PATTERNS),
      timestamp: new Date().toISOString()
    }
  };
};

export default mapVoiceCommand;

