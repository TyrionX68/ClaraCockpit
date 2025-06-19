// Clara KI Intent-Handler API
// Nutzt die clara_json_engine.js für intelligente Antworten

const fs = require('fs');
const path = require('path');

// Lade Clara JSON-Engine
let ClaraKI;
try {
  // Dynamischer Import der JSON-Engine
  const enginePath = path.join(__dirname, '../../system/clara_json_engine.js');
  if (fs.existsSync(enginePath)) {
    delete require.cache[require.resolve(enginePath)];
    ClaraKI = require(enginePath);
  }
} catch (error) {
  console.error('Clara JSON-Engine konnte nicht geladen werden:', error);
}

// Intent-Handler Funktion
async function handleClaraIntent(req, res) {
  try {
    const { message, timestamp } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Nachricht ist erforderlich',
        reply: 'Bitte geben Sie eine gültige Nachricht ein.'
      });
    }

    let response;
    let confidence = 0.8;
    let topic = 'general';

    // Verwende Clara JSON-Engine falls verfügbar
    if (ClaraKI && typeof ClaraKI.updateCurrentTopic === 'function') {
      try {
        // Aktualisiere Topic basierend auf Nachricht
        topic = ClaraKI.updateCurrentTopic(message);
        
        // Füge zur Historie hinzu
        if (typeof ClaraKI.addToHistory === 'function') {
          ClaraKI.addToHistory(message, false); // false = user message
        }
        
        // Generiere intelligente Antwort
        if (typeof ClaraKI.enhanceResponse === 'function') {
          response = ClaraKI.enhanceResponse(getBaseResponse(message, topic));
          confidence = 0.9; // Höhere Confidence bei JSON-Engine
        } else {
          response = getBaseResponse(message, topic);
        }
        
        // Füge Clara-Antwort zur Historie hinzu
        if (typeof ClaraKI.addToHistory === 'function') {
          ClaraKI.addToHistory(response, true); // true = clara message
        }
        
      } catch (engineError) {
        console.error('JSON-Engine Fehler:', engineError);
        response = getBaseResponse(message, topic);
        confidence = 0.6;
      }
    } else {
      // Fallback ohne JSON-Engine
      response = getBaseResponse(message, topic);
      confidence = 0.7;
    }

    // Erfolgreiche Antwort
    res.json({
      reply: response,
      confidence: confidence,
      topic: topic,
      timestamp: new Date().toISOString(),
      engine: ClaraKI ? 'json-engine' : 'fallback'
    });

  } catch (error) {
    console.error('Clara Intent-Handler Fehler:', error);
    
    res.status(500).json({
      error: 'Interner Server-Fehler',
      reply: 'Entschuldigung, es gab ein technisches Problem. Bitte versuchen Sie es später erneut.',
      confidence: 0.1,
      topic: 'error'
    });
  }
}

// Basis-Response-Generator (Fallback)
function getBaseResponse(message, detectedTopic) {
  const lowerMessage = message.toLowerCase();
  
  // Hausverwaltungs-spezifische Intents
  const intents = {
    miete: {
      triggers: ['miete', 'mieteinnahmen', 'mieter', 'vermietung'],
      responses: [
        'Die aktuellen Mieteinnahmen für die Waldhofstraße 76 betragen 8.360€ monatlich bei 100% Vermietungsgrad. Möchten Sie Details zu einzelnen Wohnungen?',
        'Ihre Immobilie ist vollständig vermietet. Die Gesamtmiete beträgt 8.360€ pro Monat. Soll ich eine Aufschlüsselung nach Wohnungen erstellen?'
      ]
    },
    
    rueckstand: {
      triggers: ['rückstand', 'rückstände', 'ausstehend', 'mahnung', 'zahlungsrückstand'],
      responses: [
        'Aktuell gibt es einen Rückstand von 1.200€ vom Mieter im 1. OG rechts (2 Monate). Soll ich eine Mahnung vorbereiten?',
        'Es besteht ein Zahlungsrückstand von 1.200€. Der Mieter im 1. OG rechts ist 2 Monate im Verzug. Möchten Sie das Mahnverfahren einleiten?'
      ]
    },
    
    wartung: {
      triggers: ['wartung', 'reparatur', 'instandhaltung', 'heizung', 'defekt'],
      responses: [
        'Für Wartungsarbeiten empfehle ich eine Überprüfung der Heizungsanlage. Die Kosten sind in den letzten 3 Monaten um 15% gestiegen. Potentielle Einsparung: ca. 200€/Monat.',
        'Die Heizungskosten zeigen einen Anstieg. Eine Wartung könnte 200€ monatlich sparen. Soll ich einen Termin mit einem Techniker vereinbaren?'
      ]
    },
    
    cashflow: {
      triggers: ['cashflow', 'liquidität', 'geldfluss', 'einnahmen', 'ausgaben'],
      responses: [
        'Der aktuelle Cashflow zeigt +7.160€ monatlich (8.360€ Einnahmen - 1.200€ Kosten). Die Prognose für die nächsten 6 Monate: +37.260€.',
        'Ihr monatlicher Netto-Cashflow beträgt 7.160€. Bei gleichbleibenden Bedingungen erwarten wir +37.260€ in den nächsten 6 Monaten.'
      ]
    },
    
    rendite: {
      triggers: ['rendite', 'gewinn', 'ertrag', 'performance', 'roi'],
      responses: [
        'Die Jahresrendite beträgt aktuell 8,4% und liegt über dem Marktdurchschnitt. Das entspricht einer sehr guten Performance für Ihre Immobilie.',
        'Mit 8,4% Jahresrendite übertreffen Sie den Marktdurchschnitt deutlich. Ihre Immobilie zeigt eine ausgezeichnete Performance.'
      ]
    },
    
    finanz: {
      triggers: ['finanz', 'übersicht', 'bilanz', 'zusammenfassung', 'status'],
      responses: [
        'Finanzübersicht Waldhofstraße 76: Mieteinnahmen +8.360€, Betriebskosten -1.200€, Netto-Cashflow +7.160€. Jahresrendite: 8,4%. Alle Werte aktuell.',
        'Aktuelle Finanzlage: 100% Vermietungsgrad, 8.360€ Mieteinnahmen, 1.200€ Kosten, 7.160€ Netto-Gewinn monatlich. Rendite: 8,4% p.a.'
      ]
    }
  };

  // Intent-Matching
  for (const [intentName, intentData] of Object.entries(intents)) {
    for (const trigger of intentData.triggers) {
      if (lowerMessage.includes(trigger)) {
        const randomResponse = intentData.responses[Math.floor(Math.random() * intentData.responses.length)];
        return randomResponse;
      }
    }
  }

  // Begrüßungen
  if (lowerMessage.includes('hallo') || lowerMessage.includes('hi') || lowerMessage.includes('guten')) {
    return 'Hallo! Ich bin Clara, Ihr KI-Assistent für die Hausverwaltung. Ich kann Ihnen bei Fragen zu Mieten, Rückständen, Wartung, Cashflow und Renditen helfen. Was möchten Sie wissen?';
  }

  // Dank
  if (lowerMessage.includes('danke') || lowerMessage.includes('vielen dank')) {
    return 'Gerne! Falls Sie weitere Fragen zur Hausverwaltung haben, bin ich jederzeit für Sie da. Ich helfe bei Mieten, Finanzen, Wartung und allen anderen Immobilien-Themen.';
  }

  // Standard-Antwort
  return 'Vielen Dank für Ihre Nachricht! Ich kann Ihnen bei Fragen zu Mieten, Rückständen, Wartung, Cashflow und Renditen helfen. Können Sie Ihre Frage spezifizieren?';
}

// Export für verschiedene Frameworks
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/Express
  module.exports = handleClaraIntent;
} else if (typeof window !== 'undefined') {
  // Browser
  window.handleClaraIntent = handleClaraIntent;
}

// Next.js API Route Format
module.exports.default = handleClaraIntent;
