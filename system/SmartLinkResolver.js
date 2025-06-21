/**
 * SmartLinkResolver.js
 * Generiert intelligente Links und Buttons für Clara-Antworten
 * Basierend auf Intent und Slots werden passende Aktions-Links erstellt
 */

export class SmartLinkResolver {
  
  /**
   * Link-Templates für verschiedene Intents und Aktionen
   */
  static linkTemplates = {
    mieteinnahmen: {
      overview: {
        text: "🏠 Mietübersicht öffnen",
        url: "/dashboard/mieten",
        description: "Detaillierte Übersicht aller Mieteinnahmen"
      },
      export: {
        text: "📊 Mieten exportieren",
        url: "/export/mieten",
        description: "Mietdaten als Excel/PDF exportieren"
      },
      details: {
        text: "📋 Mietdetails anzeigen",
        url: "/mieten/details",
        description: "Einzelne Mietverträge und Details"
      }
    },
    rueckstaende: {
      overview: {
        text: "⚠️ Rückstände anzeigen",
        url: "/dashboard/rueckstaende",
        description: "Übersicht aller offenen Zahlungen"
      },
      mahnung: {
        text: "📧 Mahnung erstellen",
        url: "/mahnungen/erstellen",
        description: "Neue Mahnung für Rückstände"
      },
      zahlungsplan: {
        text: "📅 Zahlungsplan erstellen",
        url: "/zahlungsplaene/neu",
        description: "Ratenzahlung vereinbaren"
      }
    },
    cashflow: {
      analyse: {
        text: "📈 Cashflow-Analyse",
        url: "/analytics/cashflow",
        description: "Detaillierte Cashflow-Auswertung"
      },
      prognose: {
        text: "🔮 Cashflow-Prognose",
        url: "/analytics/prognose",
        description: "Zukünftige Cashflow-Entwicklung"
      },
      export: {
        text: "💾 Cashflow exportieren",
        url: "/export/cashflow",
        description: "Cashflow-Daten herunterladen"
      }
    },
    wartung: {
      planen: {
        text: "🔧 Wartung planen",
        url: "/wartung/planen",
        description: "Neue Wartungstermine erstellen"
      },
      historie: {
        text: "📜 Wartungshistorie",
        url: "/wartung/historie",
        description: "Vergangene Wartungen anzeigen"
      },
      kosten: {
        text: "💰 Wartungskosten",
        url: "/wartung/kosten",
        description: "Wartungskosten-Übersicht"
      }
    },
    kontostand: {
      details: {
        text: "🏦 Kontodetails",
        url: "/finanzen/konten",
        description: "Detaillierte Kontoinformationen"
      },
      bewegungen: {
        text: "💸 Kontobewegungen",
        url: "/finanzen/bewegungen",
        description: "Alle Ein- und Ausgänge"
      },
      export: {
        text: "📄 Kontoauszug",
        url: "/export/kontoauszug",
        description: "Kontoauszug als PDF"
      }
    }
  };

  /**
   * Property-spezifische Link-Modifikationen
   */
  static propertyModifiers = {
    waldhofstraße: "waldhofstrasse",
    "waldhofstraße 15": "waldhofstrasse-15",
    hauptstraße: "hauptstrasse",
    "hauptstraße 42": "hauptstrasse-42"
  };

  /**
   * Prüft ob für einen Intent SmartLinks verfügbar sind
   */
  static hasSmartLinks(intent) {
    return Object.keys(this.linkTemplates).some(template => 
      intent.toLowerCase().includes(template)
    );
  }

  /**
   * Generiert SmartLinks basierend auf Intent und Slots
   */
  static generateSmartLinks(intent, slots = {}, originalResponse = "") {
    console.log('[SMARTLINK RESOLVER] Generating links for intent:', intent, 'slots:', slots);
    
    const intentKey = this.getIntentKey(intent);
    if (!intentKey || !this.linkTemplates[intentKey]) {
      return {
        text: originalResponse,
        links: []
      };
    }

    const templates = this.linkTemplates[intentKey];
    const links = [];

    // Generiere Links basierend auf Intent
    Object.keys(templates).forEach(actionKey => {
      const template = templates[actionKey];
      let url = template.url;

      // Property-spezifische URL-Modifikation
      if (slots.property) {
        const propertySlug = this.getPropertySlug(slots.property);
        url = `${url}?property=${propertySlug}`;
      }

      // Zeit-spezifische URL-Modifikation
      if (slots.time) {
        url = `${url}${url.includes('?') ? '&' : '?'}time=${slots.time}`;
      }

      links.push({
        id: `${intentKey}_${actionKey}`,
        text: template.text,
        url: url,
        description: template.description,
        action: actionKey,
        intent: intentKey,
        primary: actionKey === 'overview' || actionKey === 'details' || actionKey === 'analyse'
      });
    });

    // Sortiere Links: Primary zuerst
    links.sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0));

    return {
      text: originalResponse + "\n\n🔗 Für mehr Details:",
      links: links.slice(0, 3), // Maximal 3 Links
      hasSmartLinks: true
    };
  }

  /**
   * Extrahiert Intent-Key aus Intent-String
   */
  static getIntentKey(intent) {
    const intentLower = intent.toLowerCase();
    
    if (intentLower.includes('miete') || intentLower.includes('einnahmen')) {
      return 'mieteinnahmen';
    }
    if (intentLower.includes('rückstand') || intentLower.includes('rueckstand')) {
      return 'rueckstaende';
    }
    if (intentLower.includes('cashflow') || intentLower.includes('liquidität')) {
      return 'cashflow';
    }
    if (intentLower.includes('wartung') || intentLower.includes('reparatur')) {
      return 'wartung';
    }
    if (intentLower.includes('kontostand') || intentLower.includes('saldo')) {
      return 'kontostand';
    }
    
    return null;
  }

  /**
   * Konvertiert Property-Namen zu URL-Slug
   */
  static getPropertySlug(property) {
    const propertyLower = property.toLowerCase();
    
    // Direkte Mappings
    if (this.propertyModifiers[propertyLower]) {
      return this.propertyModifiers[propertyLower];
    }
    
    // Fallback: Normalisierung
    return propertyLower
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  /**
   * Verarbeitet SmartLink-Klicks
   */
  static handleSmartLinkClick(linkData) {
    console.log('[SMARTLINK RESOLVER] Handling link click:', linkData);
    
    // Für Demo: Öffne Link in neuem Tab
    if (linkData.url.startsWith('http')) {
      window.open(linkData.url, '_blank');
    } else {
      // Interne Navigation (würde normalerweise Router verwenden)
      window.open(`https://clara360.de${linkData.url}`, '_blank');
    }
    
    return `${linkData.description} wurde geöffnet.`;
  }

  /**
   * Generiert Kontext-sensitive Links basierend auf letzter Interaktion
   */
  static generateContextualLinks(lastIntent, currentInput) {
    const contextualActions = {
      'mieteinnahmen': ['export', 'details'],
      'rueckstaende': ['mahnung', 'zahlungsplan'],
      'cashflow': ['prognose', 'export'],
      'wartung': ['planen', 'kosten'],
      'kontostand': ['bewegungen', 'export']
    };

    if (lastIntent && contextualActions[lastIntent]) {
      const actions = contextualActions[lastIntent];
      const templates = this.linkTemplates[lastIntent];
      
      return actions.map(action => ({
        id: `contextual_${lastIntent}_${action}`,
        text: templates[action].text,
        url: templates[action].url,
        description: templates[action].description,
        contextual: true
      }));
    }

    return [];
  }

  /**
   * Erweiterte Link-Generierung mit Zeitfiltern
   */
  static generateTimeFilteredLinks(intent, timeSlot = null) {
    const intentKey = this.getIntentKey(intent);
    if (!intentKey || !this.linkTemplates[intentKey]) return [];

    const templates = this.linkTemplates[intentKey];
    const timeFilteredLinks = [];

    Object.keys(templates).forEach(actionKey => {
      const template = templates[actionKey];
      let url = template.url;

      // Zeit-spezifische URL-Modifikation
      if (timeSlot) {
        const timeParam = this.getTimeParameter(timeSlot);
        url = `${url}${url.includes('?') ? '&' : '?'}${timeParam}`;
      }

      timeFilteredLinks.push({
        id: `${intentKey}_${actionKey}_${timeSlot || 'current'}`,
        text: timeSlot ? `${template.text} (${timeSlot})` : template.text,
        url: url,
        description: template.description,
        action: actionKey,
        intent: intentKey,
        timeSlot: timeSlot,
        primary: actionKey === 'overview' || actionKey === 'details'
      });
    });

    return timeFilteredLinks;
  }

  /**
   * Konvertiert Zeit-Slots zu URL-Parametern
   */
  static getTimeParameter(timeSlot) {
    const timeMap = {
      'letzter monat': 'time=last_month',
      'letztes jahr': 'time=last_year',
      'dieses jahr': 'time=this_year',
      'q1': 'time=q1',
      'q2': 'time=q2',
      'q3': 'time=q3',
      'q4': 'time=q4',
      'ytd': 'time=year_to_date'
    };

    return timeMap[timeSlot.toLowerCase()] || `time=${encodeURIComponent(timeSlot)}`;
  }

  /**
   * Generiert Property-spezifische Links
   */
  static generatePropertyLinks(intent, propertySlot) {
    const intentKey = this.getIntentKey(intent);
    if (!intentKey || !this.linkTemplates[intentKey]) return [];

    const templates = this.linkTemplates[intentKey];
    const propertyLinks = [];
    const propertySlug = this.getPropertySlug(propertySlot);

    Object.keys(templates).forEach(actionKey => {
      const template = templates[actionKey];
      const url = `${template.url}?property=${propertySlug}`;

      propertyLinks.push({
        id: `${intentKey}_${actionKey}_${propertySlug}`,
        text: `${template.text} - ${propertySlot}`,
        url: url,
        description: `${template.description} für ${propertySlot}`,
        action: actionKey,
        intent: intentKey,
        property: propertySlot,
        primary: actionKey === 'overview' || actionKey === 'details'
      });
    });

    return propertyLinks;
  }
}

export default SmartLinkResolver;

