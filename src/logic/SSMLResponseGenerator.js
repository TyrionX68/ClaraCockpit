/**
 * SSMLResponseGenerator.js
 * Clara V6.1.3 Voice & Response Optimierung
 * 
 * Zweck: Dynamische Sprachausgabe mit emotionaler Färbung (SSML)
 * Generiert kontextabhängige, natürliche Sprachantworten für Clara KI
 */

// SSML-Templates für verschiedene Response-Typen
const SSML_TEMPLATES = {
  // Dashboard & Übersichten
  dashboard: {
    success: `<speak>
      <prosody rate="medium" pitch="+2%">
        Hier ist Ihre <emphasis level="moderate">Immobilien-Übersicht</emphasis>:
        <break time="500ms"/>
        Sie verwalten <prosody rate="slow" volume="loud">{tenantCount} Mieteinheiten</prosody>
        mit einem monatlichen Gesamtertrag von 
        <prosody pitch="+5%" rate="slow">{totalRent} Euro</prosody>.
        <break time="300ms"/>
        Die Vermietungsquote beträgt <emphasis level="strong">{occupancyRate} Prozent</emphasis>.
      </prosody>
    </speak>`,
    
    empty: `<speak>
      <prosody rate="medium" pitch="-2%">
        <emphasis level="moderate">Willkommen</emphasis> in Ihrem Clara Dashboard.
        <break time="500ms"/>
        Hier werden Ihre Immobilien-Kennzahlen angezeigt, sobald Daten verfügbar sind.
      </prosody>
    </speak>`
  },

  // Cashflow-Analysen
  cashflow: {
    positive: `<speak>
      <prosody rate="medium" pitch="+3%">
        Ihr monatlicher <emphasis level="strong">Cashflow</emphasis> beträgt
        <break time="500ms"/>
        <prosody rate="slow" pitch="+8%" volume="loud">{cashflow} Euro</prosody>.
        <break time="300ms"/>
        <prosody rate="fast" pitch="+2%">Das ist ein sehr gutes Ergebnis!</prosody>
      </prosody>
    </speak>`,
    
    neutral: `<speak>
      <prosody rate="medium">
        Ihr monatlicher <emphasis level="moderate">Cashflow</emphasis> liegt bei
        <break time="400ms"/>
        <prosody rate="slow">{cashflow} Euro</prosody>.
        <break time="200ms"/>
        Ein solider, stabiler Wert.
      </prosody>
    </speak>`,
    
    negative: `<speak>
      <prosody rate="medium" pitch="-3%">
        Ihr aktueller <emphasis level="moderate">Cashflow</emphasis> beträgt
        <break time="500ms"/>
        <prosody rate="slow" pitch="-5%">{cashflow} Euro</prosody>.
        <break time="400ms"/>
        <prosody rate="slow">Hier gibt es Optimierungspotential.</prosody>
      </prosody>
    </speak>`
  },

  // Rendite-Berechnungen
  rendite: {
    excellent: `<speak>
      <prosody rate="medium" pitch="+4%">
        <emphasis level="strong">Ausgezeichnet!</emphasis>
        <break time="300ms"/>
        Die berechnete {renditeTyp} beträgt 
        <prosody pitch="+10%" rate="slow" volume="loud">{rendite} Prozent</prosody>.
        <break time="400ms"/>
        <prosody rate="fast" pitch="+3%">Das liegt deutlich über dem Marktdurchschnitt!</prosody>
      </prosody>
    </speak>`,
    
    good: `<speak>
      <prosody rate="medium" pitch="+2%">
        Die berechnete <emphasis level="moderate">{renditeTyp}</emphasis> beträgt 
        <prosody pitch="+5%" rate="slow">{rendite} Prozent</prosody>.
        <break time="300ms"/>
        Ein gutes Ergebnis für Ihre Investition.
      </prosody>
    </speak>`,
    
    average: `<speak>
      <prosody rate="medium">
        Die <emphasis level="moderate">{renditeTyp}</emphasis> liegt bei 
        <prosody rate="slow">{rendite} Prozent</prosody>.
        <break time="300ms"/>
        Das entspricht etwa dem Marktdurchschnitt.
      </prosody>
    </speak>`,
    
    poor: `<speak>
      <prosody rate="medium" pitch="-2%">
        Die berechnete <emphasis level="moderate">{renditeTyp}</emphasis> beträgt 
        <prosody pitch="-3%" rate="slow">{rendite} Prozent</prosody>.
        <break time="400ms"/>
        <prosody rate="slow">Hier sollten wir über Optimierungen sprechen.</prosody>
      </prosody>
    </speak>`
  },

  // Mieter-Management
  mieter: {
    allGood: `<speak>
      <prosody rate="medium" pitch="+2%">
        Sie haben <emphasis level="moderate">{tenantCount} aktive Mietverträge</emphasis>.
        <break time="400ms"/>
        <prosody rate="fast" pitch="+3%">Alle Mieter zahlen pünktlich</prosody> - 
        keine offenen Rückstände!
      </prosody>
    </speak>`,
    
    withArrears: `<speak>
      <prosody rate="medium">
        Sie haben <emphasis level="moderate">{tenantCount} Mietverträge</emphasis>.
        <break time="500ms"/>
        <prosody pitch="-2%" rate="slow">
          Achtung: Es bestehen Rückstände in Höhe von {arrears} Euro.
        </prosody>
      </prosody>
    </speak>`,
    
    overview: `<speak>
      <prosody rate="medium">
        Hier ist Ihre <emphasis level="moderate">Mieterübersicht</emphasis>:
        <break time="400ms"/>
        {tenantCount} Mieteinheiten, davon {activeContracts} aktive Verträge.
        <break time="300ms"/>
        Vermietungsquote: <prosody pitch="+3%">{occupancyRate} Prozent</prosody>.
      </prosody>
    </speak>`
  },

  // Wartung & Instandhaltung
  wartung: {
    urgent: `<speak>
      <prosody rate="fast" pitch="+2%">
        <emphasis level="strong">Achtung!</emphasis>
        <break time="300ms"/>
        Es gibt <prosody pitch="+5%">{urgentCount} dringende Wartungsaufgaben</prosody>.
        <break time="400ms"/>
        Bitte prüfen Sie diese zeitnah.
      </prosody>
    </speak>`,
    
    scheduled: `<speak>
      <prosody rate="medium">
        Sie haben <emphasis level="moderate">{scheduledCount} geplante Wartungsarbeiten</emphasis>.
        <break time="400ms"/>
        Alle Termine sind ordnungsgemäß eingeplant.
      </prosody>
    </speak>`,
    
    none: `<speak>
      <prosody rate="medium" pitch="+1%">
        <emphasis level="moderate">Sehr gut!</emphasis>
        <break time="300ms"/>
        Aktuell stehen keine Wartungsarbeiten an.
        <break time="200ms"/>
        Alle Systeme laufen einwandfrei.
      </prosody>
    </speak>`
  },

  // Fehler & Unbekannte Befehle
  error: {
    notUnderstood: `<speak>
      <prosody rate="medium" pitch="-1%">
        <emphasis level="moderate">Entschuldigung</emphasis>,
        <break time="300ms"/>
        ich habe das leider nicht verstanden.
        <break time="400ms"/>
        <prosody rate="slow">Möchten Sie es anders formulieren?</prosody>
      </prosody>
    </speak>`,
    
    noData: `<speak>
      <prosody rate="medium">
        Für diese Anfrage sind aktuell <emphasis level="moderate">keine Daten verfügbar</emphasis>.
        <break time="400ms"/>
        Bitte versuchen Sie es später erneut.
      </prosody>
    </speak>`,
    
    systemError: `<speak>
      <prosody rate="slow" pitch="-2%">
        <emphasis level="moderate">Es ist ein Fehler aufgetreten</emphasis>.
        <break time="500ms"/>
        Bitte versuchen Sie es in einem Moment erneut.
      </prosody>
    </speak>`
  },

  // Hilfe & Navigation
  help: {
    general: `<speak>
      <prosody rate="medium" pitch="+1%">
        Ich bin <emphasis level="moderate">Clara</emphasis>, Ihre Immobilien-Expertin.
        <break time="400ms"/>
        Sie können mich fragen:
        <break time="300ms"/>
        <prosody rate="slow">
          "Wie ist mein Cashflow?", "Berechne Rendite", oder "Zeige Mieter".
        </prosody>
      </prosody>
    </speak>`,
    
    navigation: `<speak>
      <prosody rate="medium">
        <emphasis level="moderate">Zurück zum Dashboard</emphasis>.
        <break time="300ms"/>
        Hier finden Sie Ihre Immobilien-Übersicht.
      </prosody>
    </speak>`
  }
};

// Bewertungskriterien für verschiedene Kennzahlen
const EVALUATION_CRITERIA = {
  rendite: {
    excellent: 8.0,
    good: 6.0,
    average: 4.0
  },
  cashflow: {
    positive: 0,
    neutral: -500
  },
  occupancy: {
    excellent: 95,
    good: 85,
    average: 75
  }
};

/**
 * Hauptfunktion: Generiert SSML-Response basierend auf Intent und Daten
 * @param {string} intent - Intent aus VoiceCommandMapper
 * @param {object} payload - Daten für die Response
 * @param {object} options - Zusätzliche Optionen
 * @returns {object} SSML-Response mit Fallback-Text
 */
export const generateSSML = (intent, payload = {}, options = {}) => {
  try {
    const responseData = {
      ssml: '',
      text: '',
      emotion: 'neutral',
      confidence: 1.0,
      metadata: {
        intent,
        timestamp: new Date().toISOString(),
        hasSSML: false
      }
    };

    // Intent-basierte SSML-Generierung
    switch (intent) {
      case 'zeige-dashboard':
        return generateDashboardResponse(payload, responseData);
        
      case 'zeige-cashflow':
        return generateCashflowResponse(payload, responseData);
        
      case 'berechne-rendite':
        return generateRenditeResponse(payload, responseData);
        
      case 'zeige-mieter':
        return generateMieterResponse(payload, responseData);
        
      case 'zeige-wartung':
        return generateWartungResponse(payload, responseData);
        
      case 'navigation-zurück':
        return generateNavigationResponse(payload, responseData);
        
      case 'zeige-hilfe':
        return generateHelpResponse(payload, responseData);
        
      case 'unknown':
      default:
        return generateErrorResponse('notUnderstood', payload, responseData);
    }
  } catch (error) {
    console.error('Error generating SSML:', error);
    return generateErrorResponse('systemError', payload, {
      ssml: '',
      text: 'Es ist ein Fehler bei der Sprachgenerierung aufgetreten.',
      emotion: 'error',
      confidence: 0.5,
      metadata: { intent, error: error.message }
    });
  }
};

/**
 * Dashboard-Response Generator
 */
const generateDashboardResponse = (payload, responseData) => {
  const { tenantCount = 0, totalRent = 0, occupancyRate = 0 } = payload;
  
  if (tenantCount === 0) {
    responseData.ssml = SSML_TEMPLATES.dashboard.empty;
    responseData.text = 'Willkommen in Ihrem Clara Dashboard. Hier werden Ihre Immobilien-Kennzahlen angezeigt, sobald Daten verfügbar sind.';
    responseData.emotion = 'neutral';
  } else {
    responseData.ssml = SSML_TEMPLATES.dashboard.success
      .replace('{tenantCount}', tenantCount)
      .replace('{totalRent}', totalRent.toLocaleString('de-DE'))
      .replace('{occupancyRate}', occupancyRate.toFixed(1));
    
    responseData.text = `Hier ist Ihre Immobilien-Übersicht: Sie verwalten ${tenantCount} Mieteinheiten mit einem monatlichen Gesamtertrag von ${totalRent.toLocaleString('de-DE')} Euro. Die Vermietungsquote beträgt ${occupancyRate.toFixed(1)} Prozent.`;
    responseData.emotion = 'positive';
  }
  
  responseData.hasSSML = true;
  return responseData;
};

/**
 * Cashflow-Response Generator
 */
const generateCashflowResponse = (payload, responseData) => {
  const { cashflow = 0 } = payload;
  
  let templateKey, emotion;
  if (cashflow > EVALUATION_CRITERIA.cashflow.positive) {
    templateKey = 'positive';
    emotion = 'positive';
  } else if (cashflow > EVALUATION_CRITERIA.cashflow.neutral) {
    templateKey = 'neutral';
    emotion = 'neutral';
  } else {
    templateKey = 'negative';
    emotion = 'concern';
  }
  
  responseData.ssml = SSML_TEMPLATES.cashflow[templateKey]
    .replace('{cashflow}', cashflow.toLocaleString('de-DE'));
  
  responseData.text = `Ihr monatlicher Cashflow beträgt ${cashflow.toLocaleString('de-DE')} Euro.`;
  responseData.emotion = emotion;
  responseData.hasSSML = true;
  
  return responseData;
};

/**
 * Rendite-Response Generator
 */
const generateRenditeResponse = (payload, responseData) => {
  const { rendite = 0, typ = 'Bruttomietrendite' } = payload;
  
  let templateKey, emotion;
  if (rendite >= EVALUATION_CRITERIA.rendite.excellent) {
    templateKey = 'excellent';
    emotion = 'excited';
  } else if (rendite >= EVALUATION_CRITERIA.rendite.good) {
    templateKey = 'good';
    emotion = 'positive';
  } else if (rendite >= EVALUATION_CRITERIA.rendite.average) {
    templateKey = 'average';
    emotion = 'neutral';
  } else {
    templateKey = 'poor';
    emotion = 'concern';
  }
  
  responseData.ssml = SSML_TEMPLATES.rendite[templateKey]
    .replace('{rendite}', rendite.toFixed(2))
    .replace('{renditeTyp}', typ);
  
  responseData.text = `Die berechnete ${typ} beträgt ${rendite.toFixed(2)} Prozent.`;
  responseData.emotion = emotion;
  responseData.hasSSML = true;
  
  return responseData;
};

/**
 * Mieter-Response Generator
 */
const generateMieterResponse = (payload, responseData) => {
  const { 
    tenantCount = 0, 
    activeContracts = 0, 
    arrears = 0, 
    occupancyRate = 0 
  } = payload;
  
  let templateKey, emotion;
  if (arrears === 0) {
    templateKey = 'allGood';
    emotion = 'positive';
  } else if (arrears > 0) {
    templateKey = 'withArrears';
    emotion = 'concern';
  } else {
    templateKey = 'overview';
    emotion = 'neutral';
  }
  
  responseData.ssml = SSML_TEMPLATES.mieter[templateKey]
    .replace('{tenantCount}', tenantCount)
    .replace('{activeContracts}', activeContracts)
    .replace('{arrears}', arrears.toLocaleString('de-DE'))
    .replace('{occupancyRate}', occupancyRate.toFixed(1));
  
  if (arrears === 0) {
    responseData.text = `Sie haben ${tenantCount} aktive Mietverträge. Alle Mieter zahlen pünktlich - keine offenen Rückstände!`;
  } else {
    responseData.text = `Sie haben ${tenantCount} Mietverträge. Achtung: Es bestehen Rückstände in Höhe von ${arrears.toLocaleString('de-DE')} Euro.`;
  }
  
  responseData.emotion = emotion;
  responseData.hasSSML = true;
  
  return responseData;
};

/**
 * Wartung-Response Generator
 */
const generateWartungResponse = (payload, responseData) => {
  const { urgentCount = 0, scheduledCount = 0 } = payload;
  
  let templateKey, emotion;
  if (urgentCount > 0) {
    templateKey = 'urgent';
    emotion = 'urgent';
  } else if (scheduledCount > 0) {
    templateKey = 'scheduled';
    emotion = 'neutral';
  } else {
    templateKey = 'none';
    emotion = 'positive';
  }
  
  responseData.ssml = SSML_TEMPLATES.wartung[templateKey]
    .replace('{urgentCount}', urgentCount)
    .replace('{scheduledCount}', scheduledCount);
  
  if (urgentCount > 0) {
    responseData.text = `Achtung! Es gibt ${urgentCount} dringende Wartungsaufgaben. Bitte prüfen Sie diese zeitnah.`;
  } else if (scheduledCount > 0) {
    responseData.text = `Sie haben ${scheduledCount} geplante Wartungsarbeiten. Alle Termine sind ordnungsgemäß eingeplant.`;
  } else {
    responseData.text = 'Sehr gut! Aktuell stehen keine Wartungsarbeiten an. Alle Systeme laufen einwandfrei.';
  }
  
  responseData.emotion = emotion;
  responseData.hasSSML = true;
  
  return responseData;
};

/**
 * Navigation-Response Generator
 */
const generateNavigationResponse = (payload, responseData) => {
  responseData.ssml = SSML_TEMPLATES.help.navigation;
  responseData.text = 'Zurück zum Dashboard. Hier finden Sie Ihre Immobilien-Übersicht.';
  responseData.emotion = 'neutral';
  responseData.hasSSML = true;
  
  return responseData;
};

/**
 * Hilfe-Response Generator
 */
const generateHelpResponse = (payload, responseData) => {
  responseData.ssml = SSML_TEMPLATES.help.general;
  responseData.text = 'Ich bin Clara, Ihre Immobilien-Expertin. Sie können mich fragen: "Wie ist mein Cashflow?", "Berechne Rendite", oder "Zeige Mieter".';
  responseData.emotion = 'helpful';
  responseData.hasSSML = true;
  
  return responseData;
};

/**
 * Fehler-Response Generator
 */
const generateErrorResponse = (errorType, payload, responseData) => {
  const template = SSML_TEMPLATES.error[errorType] || SSML_TEMPLATES.error.notUnderstood;
  
  responseData.ssml = template;
  responseData.emotion = 'apologetic';
  responseData.hasSSML = true;
  
  switch (errorType) {
    case 'notUnderstood':
      responseData.text = 'Entschuldigung, ich habe das leider nicht verstanden. Möchten Sie es anders formulieren?';
      break;
    case 'noData':
      responseData.text = 'Für diese Anfrage sind aktuell keine Daten verfügbar. Bitte versuchen Sie es später erneut.';
      break;
    case 'systemError':
    default:
      responseData.text = 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es in einem Moment erneut.';
      break;
  }
  
  return responseData;
};

/**
 * Hilfsfunktion: Konvertiert SSML zu Plain Text (Fallback)
 */
export const ssmlToText = (ssml) => {
  if (!ssml) return '';
  
  return ssml
    .replace(/<[^>]*>/g, '') // Entferne alle XML/SSML Tags
    .replace(/\s+/g, ' ')    // Normalisiere Whitespace
    .trim();
};

/**
 * Hilfsfunktion: Validiert SSML-Response
 */
export const validateSSMLResponse = (response) => {
  return (
    response &&
    typeof response.ssml === 'string' &&
    typeof response.text === 'string' &&
    typeof response.emotion === 'string' &&
    typeof response.confidence === 'number' &&
    response.confidence >= 0 &&
    response.confidence <= 1 &&
    typeof response.metadata === 'object'
  );
};

/**
 * Hilfsfunktion: Erstellt Test-Response für Debugging
 */
export const createTestResponse = (intent, testData = {}) => {
  return generateSSML(intent, testData, { debug: true });
};

export default generateSSML;

