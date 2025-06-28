import React, { useState, useEffect, useCallback } from 'react';

/**
 * ClaraResponseStyler - React Component
 * Enhances Clara's responses with contextual richness and natural language styling
 * 
 * Converted from JavaScript class to React component for Clara V6 integration
 */

const ClaraResponseStyler = ({ 
  options = {},
  onResponseStyled,
  children 
}) => {
  // Configuration state
  const [config] = useState({
    defaultStyle: 'informative',
    enableContextualEnrichment: true,
    enableFactualExpansion: true,
    enableEmotionalScaling: options.enableEmotionalScaling || false,
    maxAdditionalContextItems: 2,
    ...options
  });

  // Response style templates
  const styleTemplates = {
    informative: {
      prefix: ['', 'Ich kann dir mitteilen, dass ', 'Hier ist die Information: '],
      suffix: ['', ' Falls du weitere Details benötigst, frag gerne nach.', ' Kann ich dir sonst noch etwas dazu erklären?'],
      connector: [', ', '. Außerdem ', '. Zusätzlich '],
      emphasis: ['wichtig', 'bemerkenswert', 'relevant']
    },
    conversational: {
      prefix: ['', 'Ich sehe, dass ', 'Es sieht so aus, als ob '],
      suffix: ['', ' Was hältst du davon?', ' Ist das hilfreich für dich?'],
      connector: [', ', '. Auch interessant: ', '. Übrigens '],
      emphasis: ['spannend', 'interessant', 'beachtenswert']
    },
    professional: {
      prefix: ['', 'Die Analyse zeigt, dass ', 'Basierend auf den Daten: '],
      suffix: ['', ' Weitere Analysen sind auf Anfrage verfügbar.', ' Möchten Sie eine detailliertere Aufschlüsselung?'],
      connector: [', ', '. Darüber hinaus ', '. Ferner '],
      emphasis: ['signifikant', 'wesentlich', 'maßgeblich']
    },
    concise: {
      prefix: [''],
      suffix: [''],
      connector: [', ', '. Auch ', '. Zudem '],
      emphasis: ['wichtig', 'zentral', 'entscheidend']
    }
  };

  // Context type templates for enrichment
  const contextTemplates = {
    property: {
      intro: ['für die Immobilie', 'bezüglich des Objekts', 'für das Gebäude'],
      detail: ['an der Adresse', 'in der Straße', 'gelegen in']
    },
    tenant: {
      intro: ['für den Mieter', 'bezüglich des Mieters', 'im Zusammenhang mit dem Mieter'],
      detail: ['seit', 'mit Vertragsbeginn', 'mit einer Mietdauer von']
    },
    financial: {
      intro: ['finanziell betrachtet', 'aus finanzieller Sicht', 'wirtschaftlich gesehen'],
      detail: ['mit einer Rendite von', 'bei einem Cashflow von', 'mit Einnahmen von']
    },
    temporal: {
      intro: ['aktuell', 'derzeit', 'momentan'],
      detail: ['im Vergleich zum Vormonat', 'seit dem letzten Quartal', 'im Jahresvergleich']
    }
  };

  // Numerical formatting functions
  const numericalTemplates = {
    percentage: (value) => `${value}%`,
    currency: (value) => `${value.toLocaleString('de-DE')} €`,
    count: (value) => value.toLocaleString('de-DE'),
    trend: (value) => {
      if (value > 0) return `um ${value}% gestiegen`;
      if (value < 0) return `um ${Math.abs(value)}% gefallen`;
      return `unverändert geblieben`;
    }
  };

  // Utility function to get random element from array
  const getRandomElement = useCallback((array) => {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return '';
    }
    return array[Math.floor(Math.random() * array.length)];
  }, []);

  // Format numerical value based on type
  const formatNumericalValue = useCallback((value, format) => {
    const formatter = numericalTemplates[format];
    
    if (formatter && typeof formatter === 'function') {
      return formatter(value);
    }
    
    return value.toString();
  }, []);

  // Apply basic styling to response
  const applyBasicStyling = useCallback((baseResponse, styleTemplate) => {
    const prefix = getRandomElement(styleTemplate.prefix);
    const suffix = getRandomElement(styleTemplate.suffix);
    
    return `${prefix}${baseResponse}${suffix}`;
  }, [getRandomElement]);

  // Add contextual enrichment to response
  const addContextualEnrichment = useCallback((response, context, styleTemplate) => {
    let enriched = response;
    const contextualPhrases = [];
    
    // Process property context
    if (context.property) {
      const propertyTemplate = contextTemplates.property;
      const intro = getRandomElement(propertyTemplate.intro);
      const detail = getRandomElement(propertyTemplate.detail);
      
      let propertyPhrase = `${intro} ${context.property.name || ''}`;
      
      if (context.property.address) {
        propertyPhrase += ` ${detail} ${context.property.address}`;
      }
      
      contextualPhrases.push(propertyPhrase);
    }
    
    // Process tenant context
    if (context.tenant) {
      const tenantTemplate = contextTemplates.tenant;
      const intro = getRandomElement(tenantTemplate.intro);
      
      let tenantPhrase = `${intro} ${context.tenant.name || ''}`;
      
      if (context.tenant.since) {
        const detail = getRandomElement(tenantTemplate.detail);
        tenantPhrase += ` ${detail} ${context.tenant.since}`;
      }
      
      contextualPhrases.push(tenantPhrase);
    }
    
    // Process financial context
    if (context.financial) {
      const financialTemplate = contextTemplates.financial;
      const intro = getRandomElement(financialTemplate.intro);
      
      let financialPhrase = intro;
      
      if (context.financial.metric && context.financial.value) {
        const detail = getRandomElement(financialTemplate.detail);
        financialPhrase += ` ${detail} ${formatNumericalValue(context.financial.value, context.financial.format || 'currency')}`;
      }
      
      contextualPhrases.push(financialPhrase);
    }
    
    // Process temporal context
    if (context.temporal) {
      const temporalTemplate = contextTemplates.temporal;
      const intro = getRandomElement(temporalTemplate.intro);
      
      let temporalPhrase = intro;
      
      if (context.temporal.comparison) {
        const detail = getRandomElement(temporalTemplate.detail);
        temporalPhrase += ` ${detail} ${context.temporal.comparison}`;
      }
      
      contextualPhrases.push(temporalPhrase);
    }
    
    // Limit number of contextual phrases
    const selectedPhrases = contextualPhrases.slice(0, config.maxAdditionalContextItems);
    
    // Add contextual phrases to response
    if (selectedPhrases.length > 0) {
      const endsWithPunctuation = /[.!?]$/.test(enriched);
      const connector = endsWithPunctuation ? ' ' : getRandomElement(styleTemplate.connector);
      
      enriched = `${enriched}${connector}${selectedPhrases.join(getRandomElement(styleTemplate.connector))}`;
    }
    
    return enriched;
  }, [getRandomElement, formatNumericalValue, config.maxAdditionalContextItems]);

  // Add factual expansion to response
  const addFactualExpansion = useCallback((response, data, styleTemplate) => {
    let expanded = response;
    const factualPhrases = [];
    
    // Process statistics
    if (data.statistics) {
      const stats = data.statistics;
      
      if (stats.total !== undefined) {
        factualPhrases.push(`insgesamt gibt es ${formatNumericalValue(stats.total, 'count')} Einträge`);
      }
      
      if (stats.average !== undefined) {
        factualPhrases.push(`der Durchschnitt liegt bei ${formatNumericalValue(stats.average, stats.format || 'count')}`);
      }
      
      if (stats.trend !== undefined) {
        factualPhrases.push(`der Wert ist ${formatNumericalValue(stats.trend, 'trend')}`);
      }
    }
    
    // Process insights
    if (data.insights && Array.isArray(data.insights)) {
      data.insights.forEach(insight => {
        if (insight.message) {
          const emphasis = insight.impact === 'high' 
            ? getRandomElement(styleTemplate.emphasis) 
            : '';
          
          factualPhrases.push(`${emphasis ? `${emphasis} ist, dass ` : ''}${insight.message}`);
        }
      });
    }
    
    // Process recommendations
    if (data.recommendations && Array.isArray(data.recommendations)) {
      data.recommendations.forEach(recommendation => {
        if (recommendation.message) {
          factualPhrases.push(`ich empfehle ${recommendation.message}`);
        }
      });
    }
    
    // Limit number of factual phrases
    const selectedPhrases = factualPhrases.slice(0, config.maxAdditionalContextItems);
    
    // Add factual phrases to response
    if (selectedPhrases.length > 0) {
      const endsWithPunctuation = /[.!?]$/.test(expanded);
      const connector = endsWithPunctuation ? ' ' : getRandomElement(styleTemplate.connector);
      
      expanded = `${expanded}${connector}${selectedPhrases.join(getRandomElement(styleTemplate.connector))}`;
    }
    
    return expanded;
  }, [getRandomElement, formatNumericalValue, config.maxAdditionalContextItems]);

  // Adjust phrasing based on confidence level
  const adjustConfidencePhrasing = useCallback((response, confidence) => {
    let adjusted = response;
    
    if (confidence < 0.5) {
      adjusted = `Ich bin mir nicht ganz sicher, aber ${adjusted.charAt(0).toLowerCase() + adjusted.slice(1)}`;
    } else if (confidence < 0.8) {
      adjusted = `Ich glaube, ${adjusted.charAt(0).toLowerCase() + adjusted.slice(1)}`;
    }
    
    return adjusted;
  }, []);

  // Main enhancement function
  const enhanceResponse = useCallback(({
    baseResponse,
    context = {},
    style = config.defaultStyle,
    data = {},
    confidence = 1.0
  }) => {
    if (!baseResponse) {
      return '';
    }
    
    // Select style template
    const styleTemplate = styleTemplates[style] || styleTemplates.informative;
    
    // Apply basic styling
    let enhancedResponse = applyBasicStyling(baseResponse, styleTemplate);
    
    // Add contextual enrichment if enabled
    if (config.enableContextualEnrichment && context) {
      enhancedResponse = addContextualEnrichment(enhancedResponse, context, styleTemplate);
    }
    
    // Add factual expansion if enabled and data available
    if (config.enableFactualExpansion && data && Object.keys(data).length > 0) {
      enhancedResponse = addFactualExpansion(enhancedResponse, data, styleTemplate);
    }
    
    // Adjust confidence-based phrasing
    if (confidence < 0.8) {
      enhancedResponse = adjustConfidencePhrasing(enhancedResponse, confidence);
    }
    
    return enhancedResponse;
  }, [config, applyBasicStyling, addContextualEnrichment, addFactualExpansion, adjustConfidencePhrasing]);

  // Transform data to natural response
  const transformDataToNaturalResponse = useCallback(({
    data,
    dataType = 'count',
    entityType = 'generic',
    context = {}
  }) => {
    if (data === undefined || data === null) {
      return '';
    }
    
    // Handle different data types
    if (typeof data === 'number') {
      const formattedValue = formatNumericalValue(data, dataType);
      
      // Entity-specific templates
      const entityTemplates = {
        property: [
          `Die Immobilie hat einen Wert von ${formattedValue}`,
          `Der Wert der Immobilie beträgt ${formattedValue}`,
          `Die Immobilie ist ${formattedValue} wert`
        ],
        tenant: [
          `Es gibt ${formattedValue} Mieter`,
          `Die Anzahl der Mieter beträgt ${formattedValue}`,
          `${formattedValue} Mieter sind registriert`
        ],
        contract: [
          `Es gibt ${formattedValue} Verträge`,
          `Die Anzahl der Verträge beträgt ${formattedValue}`,
          `${formattedValue} Verträge sind aktiv`
        ],
        financial: [
          `Der finanzielle Wert beträgt ${formattedValue}`,
          `Der Betrag liegt bei ${formattedValue}`,
          `Es handelt sich um ${formattedValue}`
        ],
        generic: [
          `Der Wert beträgt ${formattedValue}`,
          `Es sind ${formattedValue}`,
          `Der Betrag ist ${formattedValue}`
        ]
      };
      
      const templates = entityTemplates[entityType] || entityTemplates.generic;
      return getRandomElement(templates);
    } else if (typeof data === 'object') {
      // Handle arrays
      if (Array.isArray(data)) {
        if (data.length === 0) {
          return `Es gibt keine ${entityType}`;
        } else if (data.length === 1) {
          return `Es gibt einen ${entityType}`;
        } else {
          return `Es gibt ${formatNumericalValue(data.length, 'count')} ${entityType}`;
        }
      }
      
      // Handle objects with key-value pairs
      const keyValuePairs = Object.entries(data);
      
      if (keyValuePairs.length === 0) {
        return `Es gibt keine Daten für ${entityType}`;
      }
      
      // Transform key-value pairs to sentences
      const sentences = keyValuePairs.map(([key, value]) => {
        if (typeof value === 'number') {
          return `${key.charAt(0).toUpperCase() + key.slice(1)} beträgt ${formatNumericalValue(value, dataType)}`;
        } else {
          return `${key.charAt(0).toUpperCase() + key.slice(1)} ist ${value}`;
        }
      });
      
      return sentences.join(', ');
    } else {
      // Default to string representation
      return data.toString();
    }
  }, [formatNumericalValue, getRandomElement]);

  // Expose enhancement functions via callback
  useEffect(() => {
    if (onResponseStyled && typeof onResponseStyled === 'function') {
      onResponseStyled({
        enhanceResponse,
        transformDataToNaturalResponse,
        formatNumericalValue,
        config
      });
    }
  }, [enhanceResponse, transformDataToNaturalResponse, formatNumericalValue, config, onResponseStyled]);

  // Render component (can be used as a provider or utility component)
  return (
    <div className="clara-response-styler" data-component="ClaraResponseStyler">
      {children}
    </div>
  );
};

export default ClaraResponseStyler;

