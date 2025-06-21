/**
 * DocumentRegistry.js
 * Verwaltet Dokumente und generiert Dokumentenvorschläge für Clara-KI
 * Basierend auf Intent und Slots werden passende Dokumente vorgeschlagen
 */

export class DocumentRegistry {
  
  /**
   * Lädt das Dokumentenregister
   */
  static async loadDocumentRegistry() {
    try {
      const response = await fetch('/data/DocumentRegistry.json');
      return await response.json();
    } catch (error) {
      console.error('[DOCUMENT REGISTRY] Fehler beim Laden:', error);
      return { documents: {}, templates: {}, quick_access: {} };
    }
  }

  /**
   * Intent-basierte Dokumenten-Mappings
   */
  static intentDocumentMappings = {
    'mietvertrag': ['mietvertraege', 'templates'],
    'vertrag': ['mietvertraege', 'templates'],
    'kontrakt': ['mietvertraege'],
    'mahnung': ['mahnungen', 'templates'],
    'rückstand': ['mahnungen', 'rechnungen'],
    'rueckstand': ['mahnungen', 'rechnungen'],
    'rechnung': ['rechnungen'],
    'wartung': ['rechnungen'],
    'reparatur': ['rechnungen'],
    'cashflow': ['berichte'],
    'bericht': ['berichte'],
    'einnahmen': ['berichte'],
    'miete': ['berichte', 'mietvertraege']
  };

  /**
   * Prüft ob für einen Intent Dokumente verfügbar sind
   */
  static hasDocuments(intent) {
    const intentLower = intent.toLowerCase();
    return Object.keys(this.intentDocumentMappings).some(key => 
      intentLower.includes(key)
    );
  }

  /**
   * Generiert Dokumentenvorschläge basierend auf Intent und Slots
   */
  static async generateDocumentSuggestions(intent, slots = {}, originalResponse = "") {
    console.log('[DOCUMENT REGISTRY] Generating suggestions for intent:', intent, 'slots:', slots);
    
    const registry = await this.loadDocumentRegistry();
    const intentLower = intent.toLowerCase();
    
    // Finde passende Dokumentenkategorien
    const relevantCategories = [];
    Object.keys(this.intentDocumentMappings).forEach(key => {
      if (intentLower.includes(key)) {
        relevantCategories.push(...this.intentDocumentMappings[key]);
      }
    });

    if (relevantCategories.length === 0) {
      return {
        text: originalResponse,
        documents: []
      };
    }

    // Sammle relevante Dokumente
    const suggestions = [];
    const uniqueCategories = [...new Set(relevantCategories)];

    uniqueCategories.forEach(category => {
      if (registry.documents[category]) {
        Object.keys(registry.documents[category]).forEach(docKey => {
          const doc = registry.documents[category][docKey];
          
          // Property-Filter anwenden
          if (slots.property && doc.property) {
            const propertyMatch = this.matchProperty(slots.property, doc.property);
            if (!propertyMatch) return;
          }

          // Mieter-Filter anwenden
          if (slots.mieter && doc.mieter) {
            const mieterMatch = this.matchMieter(slots.mieter, doc.mieter);
            if (!mieterMatch) return;
          }

          suggestions.push({
            id: docKey,
            title: doc.title,
            path: doc.path,
            type: doc.type,
            category: category,
            property: doc.property,
            mieter: doc.mieter,
            relevance: this.calculateRelevance(intent, doc, slots)
          });
        });
      }
    });

    // Templates hinzufügen wenn passend
    if (registry.templates) {
      Object.keys(registry.templates).forEach(templateKey => {
        const template = registry.templates[templateKey];
        
        if (this.isTemplateRelevant(intent, templateKey)) {
          suggestions.push({
            id: templateKey,
            title: template.title,
            path: template.path,
            type: 'template',
            category: 'templates',
            description: template.description,
            relevance: 0.7 // Templates haben mittlere Relevanz
          });
        }
      });
    }

    // Sortiere nach Relevanz
    suggestions.sort((a, b) => b.relevance - a.relevance);

    // Limitiere auf Top 3
    const topSuggestions = suggestions.slice(0, 3);

    if (topSuggestions.length === 0) {
      return {
        text: originalResponse,
        documents: []
      };
    }

    return {
      text: originalResponse + "\n\n📄 Relevante Dokumente:",
      documents: topSuggestions,
      hasDocuments: true
    };
  }

  /**
   * Berechnet Relevanz-Score für ein Dokument
   */
  static calculateRelevance(intent, document, slots) {
    let score = 0.5; // Basis-Score

    // Intent-Matching
    const intentLower = intent.toLowerCase();
    if (document.type === 'contract' && intentLower.includes('vertrag')) score += 0.3;
    if (document.type === 'invoice' && intentLower.includes('rechnung')) score += 0.3;
    if (document.type === 'reminder' && intentLower.includes('mahnung')) score += 0.3;
    if (document.type === 'report' && intentLower.includes('bericht')) score += 0.3;

    // Property-Matching
    if (slots.property && document.property) {
      if (this.matchProperty(slots.property, document.property)) {
        score += 0.2;
      }
    }

    // Mieter-Matching
    if (slots.mieter && document.mieter) {
      if (this.matchMieter(slots.mieter, document.mieter)) {
        score += 0.2;
      }
    }

    // Aktualität (neuere Dokumente bevorzugen)
    if (document.created || document.date) {
      const docDate = new Date(document.created || document.date);
      const now = new Date();
      const daysDiff = (now - docDate) / (1000 * 60 * 60 * 24);
      
      if (daysDiff < 30) score += 0.1; // Sehr aktuell
      else if (daysDiff < 90) score += 0.05; // Aktuell
    }

    return Math.min(score, 1.0); // Max 1.0
  }

  /**
   * Prüft Property-Übereinstimmung
   */
  static matchProperty(slotProperty, docProperty) {
    const slotLower = slotProperty.toLowerCase();
    const docLower = docProperty.toLowerCase();
    
    // Exakte Übereinstimmung
    if (slotLower === docLower) return true;
    
    // Teilübereinstimmung
    if (slotLower.includes(docLower) || docLower.includes(slotLower)) return true;
    
    // Straßennamen-Matching
    const slotStreet = slotLower.replace(/\d+/g, '').trim();
    const docStreet = docLower.replace(/\d+/g, '').trim();
    
    return slotStreet === docStreet;
  }

  /**
   * Prüft Mieter-Übereinstimmung
   */
  static matchMieter(slotMieter, docMieter) {
    const slotLower = slotMieter.toLowerCase();
    const docLower = docMieter.toLowerCase();
    
    // Exakte Übereinstimmung
    if (slotLower === docLower) return true;
    
    // Nachname-Matching
    const slotParts = slotLower.split(' ');
    const docParts = docLower.split(' ');
    
    return slotParts.some(part => docParts.includes(part));
  }

  /**
   * Prüft Template-Relevanz
   */
  static isTemplateRelevant(intent, templateKey) {
    const intentLower = intent.toLowerCase();
    
    if (templateKey === 'mahnung' && (intentLower.includes('mahnung') || intentLower.includes('rückstand'))) {
      return true;
    }
    if (templateKey === 'mietvertrag' && intentLower.includes('vertrag')) {
      return true;
    }
    if (templateKey === 'kuendigung' && intentLower.includes('kündigung')) {
      return true;
    }
    
    return false;
  }

  /**
   * Verarbeitet Dokument-Klicks
   */
  static handleDocumentClick(documentData) {
    console.log('[DOCUMENT REGISTRY] Handling document click:', documentData);
    
    // Öffne Dokument in neuem Tab
    if (documentData.path.startsWith('http')) {
      window.open(documentData.path, '_blank');
    } else {
      // Für Demo: Öffne relativen Pfad
      window.open(`https://clara360.de${documentData.path}`, '_blank');
    }
    
    return `${documentData.title} wurde geöffnet.`;
  }

  /**
   * Generiert Quick-Access-Dokumente
   */
  static async getQuickAccessDocuments() {
    const registry = await this.loadDocumentRegistry();
    const quickAccess = [];

    if (registry.quick_access?.recent_documents) {
      registry.quick_access.recent_documents.forEach(docId => {
        // Suche Dokument in allen Kategorien
        Object.keys(registry.documents).forEach(category => {
          if (registry.documents[category][docId]) {
            const doc = registry.documents[category][docId];
            quickAccess.push({
              id: docId,
              title: doc.title,
              path: doc.path,
              type: doc.type,
              category: category,
              quickAccess: true
            });
          }
        });
      });
    }

    return quickAccess;
  }

  /**
   * Sucht Dokumente nach Stichworten
   */
  static async searchDocuments(query) {
    const registry = await this.loadDocumentRegistry();
    const results = [];
    const queryLower = query.toLowerCase();

    Object.keys(registry.documents).forEach(category => {
      Object.keys(registry.documents[category]).forEach(docKey => {
        const doc = registry.documents[category][docKey];
        
        // Suche in Titel, Property, Mieter
        const searchText = `${doc.title} ${doc.property || ''} ${doc.mieter || ''}`.toLowerCase();
        
        if (searchText.includes(queryLower)) {
          results.push({
            id: docKey,
            title: doc.title,
            path: doc.path,
            type: doc.type,
            category: category,
            property: doc.property,
            mieter: doc.mieter,
            relevance: this.calculateSearchRelevance(queryLower, searchText)
          });
        }
      });
    });

    // Sortiere nach Relevanz
    results.sort((a, b) => b.relevance - a.relevance);
    
    return results.slice(0, 5); // Top 5 Ergebnisse
  }

  /**
   * Berechnet Such-Relevanz
   */
  static calculateSearchRelevance(query, text) {
    const queryWords = query.split(' ');
    let score = 0;
    
    queryWords.forEach(word => {
      if (text.includes(word)) {
        score += 1;
        // Bonus für exakte Wort-Übereinstimmung
        if (text.split(' ').includes(word)) {
          score += 0.5;
        }
      }
    });
    
    return score / queryWords.length;
  }
}

export default DocumentRegistry;


