import { useState, useCallback, useMemo } from 'react';

/**
 * React Hook for Clara Suggestion Module
 * Provides proactive suggestions when information is incomplete or additional actions would be helpful
 */
export const useClaraSuggestions = (options = {}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Configuration
  const config = useMemo(() => ({
    enableMissingParameterSuggestions: true,
    enableRelatedInformationSuggestions: true,
    enableActionSuggestions: true,
    enableLowConfidenceSuggestions: true,
    maxSuggestions: 2,
    suggestionConfidenceThreshold: 0.7,
    ...options
  }), [options]);
  
  // Suggestion templates
  const suggestionTemplates = useMemo(() => ({
    missingParameter: [
      'Möchtest du mir {parameter} nennen, damit ich {action} kann?',
      'Für eine genauere Antwort benötige ich {parameter}. Kannst du das angeben?',
      'Um {action} zu können, fehlt mir noch {parameter}.'
    ],
    relatedInformation: [
      'Soll ich dir auch {information} zeigen?',
      'Möchtest du zusätzlich {information} sehen?',
      'Interessiert dich auch {information}?'
    ],
    action: [
      'Ich könnte {action}, wenn das hilfreich wäre.',
      'Soll ich {action}?',
      'Möchtest du, dass ich {action}?'
    ],
    lowConfidence: [
      'Meinst du {alternative}?',
      'Suchst du nach {alternative}?',
      'Vielleicht interessiert dich {alternative}?'
    ]
  }), []);
  
  // Domain-specific parameter definitions
  const parameterDefinitions = useMemo(() => ({
    property: {
      id: { name: 'die Immobilien-ID', required: true },
      address: { name: 'die Adresse', required: false },
      type: { name: 'den Immobilientyp', required: false }
    },
    tenant: {
      name: { name: 'den Namen des Mieters', required: true },
      since: { name: 'das Einzugsdatum', required: false },
      unit: { name: 'die Wohnungseinheit', required: false }
    },
    financial: {
      period: { name: 'den Zeitraum', required: true },
      metric: { name: 'die gewünschte Kennzahl', required: true },
      comparison: { name: 'den Vergleichszeitraum', required: false }
    },
    contract: {
      id: { name: 'die Vertrags-ID', required: true },
      tenant: { name: 'den Mieter', required: false },
      startDate: { name: 'das Startdatum', required: false },
      endDate: { name: 'das Enddatum', required: false }
    }
  }), []);
  
  // Related information mappings
  const relatedInformationMappings = useMemo(() => ({
    property: [
      { trigger: 'miete', suggestion: 'die Mieteinnahmen für diese Immobilie' },
      { trigger: 'wert', suggestion: 'die Wertentwicklung der Immobilie' },
      { trigger: 'kosten', suggestion: 'die Betriebskosten der Immobilie' }
    ],
    tenant: [
      { trigger: 'vertrag', suggestion: 'die Vertragsdetails dieses Mieters' },
      { trigger: 'zahlungen', suggestion: 'den Zahlungsverlauf des Mieters' },
      { trigger: 'kommunikation', suggestion: 'die Kommunikationshistorie mit dem Mieter' }
    ],
    financial: [
      { trigger: 'cashflow', suggestion: 'die Cashflow-Entwicklung' },
      { trigger: 'rendite', suggestion: 'die Renditeberechnung' },
      { trigger: 'prognose', suggestion: 'eine Prognose für die kommenden Monate' }
    ],
    contract: [
      { trigger: 'verlängerung', suggestion: 'Optionen zur Vertragsverlängerung' },
      { trigger: 'anpassung', suggestion: 'mögliche Mietanpassungen' },
      { trigger: 'kündigung', suggestion: 'Kündigungsfristen und -bedingungen' }
    ]
  }), []);
  
  // Action suggestion mappings
  const actionSuggestionMappings = useMemo(() => ({
    property: [
      { trigger: 'leerstand', action: 'Strategien zur Leerstandsreduzierung vorschlagen' },
      { trigger: 'wert', action: 'eine detaillierte Wertanalyse erstellen' },
      { trigger: 'verkauf', action: 'eine Verkaufspreisschätzung durchführen' }
    ],
    tenant: [
      { trigger: 'kommunikation', action: 'eine Nachricht an den Mieter vorbereiten' },
      { trigger: 'verlängerung', action: 'einen Vertragsverlängerungsentwurf erstellen' },
      { trigger: 'zahlungen', action: 'eine Zahlungsübersicht generieren' }
    ],
    financial: [
      { trigger: 'bericht', action: 'einen detaillierten Finanzbericht erstellen' },
      { trigger: 'optimierung', action: 'Kostenoptimierungspotenziale identifizieren' },
      { trigger: 'prognose', action: 'eine 12-Monats-Prognose berechnen' }
    ],
    contract: [
      { trigger: 'anpassung', action: 'Mietanpassungsoptionen berechnen' },
      { trigger: 'verlängerung', action: 'einen Vertragsverlängerungsentwurf vorbereiten' },
      { trigger: 'kündigung', action: 'die Kündigungsfristen prüfen' }
    ]
  }), []);
  
  /**
   * Generate suggestions based on query and context
   */
  const generateSuggestions = useCallback(async ({
    query,
    context = {},
    entities = [],
    intentType = 'unknown',
    confidence = 1.0,
    missingParameters = {}
  }) => {
    if (!query) {
      setSuggestions([]);
      return [];
    }
    
    setIsGenerating(true);
    
    try {
      const newSuggestions = [];
      
      // Generate missing parameter suggestions
      if (config.enableMissingParameterSuggestions && Object.keys(missingParameters).length > 0) {
        const parameterSuggestions = generateMissingParameterSuggestions(
          missingParameters, 
          intentType, 
          context
        );
        newSuggestions.push(...parameterSuggestions);
      }
      
      // Generate related information suggestions
      if (config.enableRelatedInformationSuggestions) {
        const relatedSuggestions = generateRelatedInformationSuggestions(
          query, 
          entities, 
          context
        );
        newSuggestions.push(...relatedSuggestions);
      }
      
      // Generate action suggestions
      if (config.enableActionSuggestions) {
        const actionSuggestions = generateActionSuggestions(
          query, 
          entities, 
          context
        );
        newSuggestions.push(...actionSuggestions);
      }
      
      // Generate low confidence suggestions
      if (config.enableLowConfidenceSuggestions && confidence < config.suggestionConfidenceThreshold) {
        const confidenceSuggestions = generateLowConfidenceSuggestions(
          query, 
          intentType, 
          confidence
        );
        newSuggestions.push(...confidenceSuggestions);
      }
      
      // Limit number of suggestions and sort by confidence
      const limitedSuggestions = newSuggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, config.maxSuggestions);
      
      setSuggestions(limitedSuggestions);
      return limitedSuggestions;
      
    } finally {
      setIsGenerating(false);
    }
  }, [config]);
  
  /**
   * Generate suggestions for missing parameters
   */
  const generateMissingParameterSuggestions = useCallback((missingParameters, intentType, context) => {
    const suggestions = [];
    
    // Determine domain from intent type
    const domain = extractDomainFromIntent(intentType);
    
    // Get parameter definitions for domain
    const parameterDefs = parameterDefinitions[domain] || {};
    
    // Generate suggestions for required missing parameters
    Object.entries(missingParameters).forEach(([param, value]) => {
      const paramDef = parameterDefs[param];
      
      // Skip if parameter is not defined or not required
      if (!paramDef || !paramDef.required) {
        return;
      }
      
      // Determine action based on intent type
      let action = 'eine genaue Antwort geben';
      
      if (intentType.includes('get') || intentType.includes('retrieve')) {
        action = 'die Information abrufen';
      } else if (intentType.includes('calculate') || intentType.includes('compute')) {
        action = 'die Berechnung durchführen';
      } else if (intentType.includes('analyze') || intentType.includes('analyse')) {
        action = 'die Analyse durchführen';
      }
      
      // Generate suggestion
      const template = getRandomElement(suggestionTemplates.missingParameter);
      const suggestion = template
        .replace('{parameter}', paramDef.name)
        .replace('{action}', action);
      
      suggestions.push({
        type: 'missing_parameter',
        text: suggestion,
        parameter: param,
        parameterName: paramDef.name,
        confidence: 0.9,
        actionable: true
      });
    });
    
    return suggestions;
  }, [parameterDefinitions, suggestionTemplates]);
  
  /**
   * Generate suggestions for related information
   */
  const generateRelatedInformationSuggestions = useCallback((query, entities, context) => {
    const suggestions = [];
    
    // Get primary entity type
    const primaryEntityType = entities.length > 0 ? entities[0].type : null;
    
    if (!primaryEntityType) {
      return suggestions;
    }
    
    // Get related information mappings for entity type
    const mappings = relatedInformationMappings[primaryEntityType] || [];
    
    // Check for triggers in query
    const queryLower = query.toLowerCase();
    
    mappings.forEach(mapping => {
      if (queryLower.includes(mapping.trigger)) {
        // Generate suggestion
        const template = getRandomElement(suggestionTemplates.relatedInformation);
        const suggestion = template.replace('{information}', mapping.suggestion);
        
        suggestions.push({
          type: 'related_information',
          text: suggestion,
          information: mapping.suggestion,
          confidence: 0.8,
          actionable: true
        });
      }
    });
    
    return suggestions;
  }, [relatedInformationMappings, suggestionTemplates]);
  
  /**
   * Generate suggestions for actions
   */
  const generateActionSuggestions = useCallback((query, entities, context) => {
    const suggestions = [];
    
    // Get primary entity type
    const primaryEntityType = entities.length > 0 ? entities[0].type : null;
    
    if (!primaryEntityType) {
      return suggestions;
    }
    
    // Get action mappings for entity type
    const mappings = actionSuggestionMappings[primaryEntityType] || [];
    
    // Check for triggers in query
    const queryLower = query.toLowerCase();
    
    mappings.forEach(mapping => {
      if (queryLower.includes(mapping.trigger)) {
        // Generate suggestion
        const template = getRandomElement(suggestionTemplates.action);
        const suggestion = template.replace('{action}', mapping.action);
        
        suggestions.push({
          type: 'action',
          text: suggestion,
          action: mapping.action,
          confidence: 0.75,
          actionable: true
        });
      }
    });
    
    return suggestions;
  }, [actionSuggestionMappings, suggestionTemplates]);
  
  /**
   * Generate suggestions for low confidence queries
   */
  const generateLowConfidenceSuggestions = useCallback((query, intentType, confidence) => {
    const suggestions = [];
    
    // Only generate for very low confidence
    if (confidence > 0.5) {
      return suggestions;
    }
    
    // Generate alternative intents based on query
    const alternatives = generateAlternatives(query, intentType);
    
    alternatives.forEach(alternative => {
      // Generate suggestion
      const template = getRandomElement(suggestionTemplates.lowConfidence);
      const suggestion = template.replace('{alternative}', alternative.text);
      
      suggestions.push({
        type: 'low_confidence',
        text: suggestion,
        alternative: alternative.text,
        alternativeIntent: alternative.intent,
        confidence: 0.6,
        actionable: true
      });
    });
    
    return suggestions;
  }, [suggestionTemplates]);
  
  /**
   * Generate alternative intents for query
   */
  const generateAlternatives = useCallback((query, currentIntent) => {
    const alternatives = [];
    const queryLower = query.toLowerCase();
    
    // Property alternatives
    if (queryLower.includes('immobilie') || queryLower.includes('gebäude') || queryLower.includes('objekt')) {
      if (queryLower.includes('wert')) {
        alternatives.push({ text: 'den Wert der Immobilie', intent: 'get_property_value' });
      }
      if (queryLower.includes('miete') || queryLower.includes('einkommen')) {
        alternatives.push({ text: 'die Mieteinnahmen der Immobilie', intent: 'get_property_income' });
      }
      if (queryLower.includes('kosten')) {
        alternatives.push({ text: 'die Betriebskosten der Immobilie', intent: 'get_property_expenses' });
      }
    }
    
    // Tenant alternatives
    if (queryLower.includes('mieter') || queryLower.includes('bewohner')) {
      if (queryLower.includes('vertrag')) {
        alternatives.push({ text: 'die Vertragsdetails des Mieters', intent: 'get_tenant_contract' });
      }
      if (queryLower.includes('zahlung')) {
        alternatives.push({ text: 'den Zahlungsverlauf des Mieters', intent: 'get_tenant_payments' });
      }
    }
    
    // Financial alternatives
    if (queryLower.includes('finanz') || queryLower.includes('geld') || queryLower.includes('rendite')) {
      if (queryLower.includes('bericht')) {
        alternatives.push({ text: 'einen Finanzbericht', intent: 'get_financial_report' });
      }
      if (queryLower.includes('rendite')) {
        alternatives.push({ text: 'die Renditeberechnung', intent: 'calculate_roi' });
      }
      if (queryLower.includes('prognose') || queryLower.includes('vorhersage')) {
        alternatives.push({ text: 'eine Finanzprognose', intent: 'get_financial_forecast' });
      }
    }
    
    // Limit to 2 alternatives
    return alternatives.slice(0, 2);
  }, []);
  
  /**
   * Extract domain from intent type
   */
  const extractDomainFromIntent = useCallback((intentType) => {
    if (!intentType || intentType === 'unknown') {
      return 'generic';
    }
    
    if (intentType.includes('property')) {
      return 'property';
    } else if (intentType.includes('tenant')) {
      return 'tenant';
    } else if (intentType.includes('financial') || intentType.includes('finance')) {
      return 'financial';
    } else if (intentType.includes('contract')) {
      return 'contract';
    }
    
    return 'generic';
  }, []);
  
  /**
   * Get random element from array
   */
  const getRandomElement = useCallback((array) => {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return '';
    }
    
    return array[Math.floor(Math.random() * array.length)];
  }, []);
  
  /**
   * Clear suggestions
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);
  
  /**
   * Execute a suggestion action
   */
  const executeSuggestion = useCallback((suggestion, onExecute) => {
    if (!suggestion.actionable) {
      return;
    }
    
    // Call the provided execution handler
    if (onExecute && typeof onExecute === 'function') {
      onExecute(suggestion);
    }
    
    // Remove the executed suggestion
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  }, []);
  
  return {
    // State
    suggestions,
    isGenerating,
    
    // Methods
    generateSuggestions,
    clearSuggestions,
    executeSuggestion,
    
    // Configuration
    config,
    
    // Utilities
    extractDomainFromIntent,
    generateAlternatives
  };
};

