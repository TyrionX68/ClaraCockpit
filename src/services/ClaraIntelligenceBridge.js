// CLARA-HYBRID PATCH V6.4.0
// ClaraIntelligenceBridge.js - Smart Routing System
// Routes between local real estate responses and GPT-4 API

import { ClaraKeywordDatabase } from './ClaraKeywordDatabase.js';
import { ClaraGPTProxy } from './ClaraGPTProxy.js';

/**
 * Clara Intelligence Bridge - Hybrid AI Routing System
 * 
 * Determines whether to handle queries locally (real estate) or route to GPT-4 (general)
 * Implements fail-safe fallback mechanisms and confidence scoring
 */
export class ClaraIntelligenceBridge {
  constructor() {
    this.keywordDatabase = new ClaraKeywordDatabase();
    this.gptProxy = new ClaraGPTProxy();
    this.debugMode = process.env.NODE_ENV === 'development';
    
    // Performance metrics
    this.metrics = {
      localResponses: 0,
      gptResponses: 0,
      fallbacks: 0,
      errors: 0
    };
  }

  /**
   * Main routing function - determines response strategy
   * @param {string} userPrompt - User's question/input
   * @param {Object} context - Additional context (user preferences, history, etc.)
   * @returns {Promise<Object>} Response object with content, source, and metadata
   */
  async processQuery(userPrompt, context = {}) {
    try {
      this.log('🧠 Processing query:', userPrompt);
      
      // Phase 1: Check if this is a real estate question
      const immobilienAnalysis = this.isImmobilienFrage(userPrompt);
      
      if (immobilienAnalysis.isRealEstate && immobilienAnalysis.confidence >= 0.7) {
        // Route to local database
        return await this.handleLocalQuery(userPrompt, immobilienAnalysis);
      } else {
        // Route to GPT-4 with fallback
        return await this.handleGPTQuery(userPrompt, context, immobilienAnalysis);
      }
    } catch (error) {
      this.log('❌ Error in processQuery:', error);
      this.metrics.errors++;
      return this.createErrorResponse(error);
    }
  }

  /**
   * Analyzes if a prompt is related to real estate/property management
   * @param {string} prompt - User input to analyze
   * @returns {Object} Analysis result with confidence score
   */
  isImmobilienFrage(prompt) {
    const normalizedPrompt = prompt.toLowerCase().trim();
    
    // Primary real estate keywords (high confidence)
    const primaryKeywords = [
      'miete', 'mieter', 'mietvertrag', 'mieteinnahmen',
      'rückstand', 'rückstände', 'mahnung', 'zahlungsausfall',
      'objekt', 'immobilie', 'wohnung', 'haus', 'gebäude',
      'zahlung', 'zahlungseingang', 'überweisung', 'konto',
      'wartung', 'reparatur', 'instandhaltung', 'handwerker',
      'nebenkosten', 'betriebskosten', 'heizkosten',
      'vermietung', 'leerstand', 'kündigung', 'nachmieter',
      'rendite', 'cashflow', 'ertrag', 'gewinn',
      'waldhofstraße', 'clara360', 'hausverwaltung'
    ];

    // Secondary keywords (medium confidence)
    const secondaryKeywords = [
      'geld', 'euro', 'kosten', 'preis', 'budget',
      'vertrag', 'dokument', 'unterlagen', 'papiere',
      'termin', 'besichtigung', 'übergabe',
      'versicherung', 'steuer', 'abschreibung',
      'modernisierung', 'sanierung', 'renovierung'
    ];

    // Context keywords that boost confidence when combined
    const contextKeywords = [
      'monat', 'jahr', 'prozent', 'quadratmeter',
      'familie', 'person', 'bewohner', 'nachbar'
    ];

    let confidence = 0;
    let matchedKeywords = [];
    let category = 'unknown';

    // Check primary keywords
    for (const keyword of primaryKeywords) {
      if (normalizedPrompt.includes(keyword)) {
        confidence += 0.3;
        matchedKeywords.push(keyword);
        
        // Determine category based on keyword
        if (['miete', 'mieter', 'mietvertrag'].includes(keyword)) {
          category = 'rental';
        } else if (['rückstand', 'zahlung', 'zahlungseingang'].includes(keyword)) {
          category = 'payment';
        } else if (['wartung', 'reparatur', 'instandhaltung'].includes(keyword)) {
          category = 'maintenance';
        } else if (['objekt', 'immobilie', 'wohnung'].includes(keyword)) {
          category = 'property';
        } else if (['rendite', 'cashflow', 'ertrag'].includes(keyword)) {
          category = 'finance';
        }
      }
    }

    // Check secondary keywords
    for (const keyword of secondaryKeywords) {
      if (normalizedPrompt.includes(keyword)) {
        confidence += 0.1;
        matchedKeywords.push(keyword);
      }
    }

    // Context boost
    for (const keyword of contextKeywords) {
      if (normalizedPrompt.includes(keyword) && confidence > 0) {
        confidence += 0.05;
      }
    }

    // Specific property references boost confidence significantly
    if (normalizedPrompt.includes('waldhofstraße') || normalizedPrompt.includes('76')) {
      confidence += 0.4;
      category = 'property';
    }

    // Cap confidence at 1.0
    confidence = Math.min(confidence, 1.0);

    const isRealEstate = confidence >= 0.3;

    this.log(`🔍 Real Estate Analysis:`, {
      prompt: prompt.substring(0, 50) + '...',
      confidence: confidence.toFixed(2),
      isRealEstate,
      category,
      matchedKeywords: matchedKeywords.slice(0, 5) // Limit for logging
    });

    return {
      isRealEstate,
      confidence,
      category,
      matchedKeywords,
      reasoning: `Matched ${matchedKeywords.length} keywords, confidence: ${(confidence * 100).toFixed(1)}%`
    };
  }

  /**
   * Handles queries using local real estate database
   * @param {string} prompt - User prompt
   * @param {Object} analysis - Real estate analysis result
   * @returns {Promise<Object>} Local response object
   */
  async handleLocalQuery(prompt, analysis) {
    try {
      this.log('🏠 Routing to local database');
      this.metrics.localResponses++;

      const localResponse = await this.keywordDatabase.getResponse(prompt, analysis);
      
      return {
        content: localResponse.content,
        source: 'local',
        confidence: analysis.confidence,
        category: analysis.category,
        responseTime: localResponse.responseTime || 150,
        metadata: {
          matchedKeywords: analysis.matchedKeywords,
          reasoning: analysis.reasoning,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      this.log('❌ Local query error:', error);
      // Fallback to default local response
      return this.createFallbackResponse('local_error');
    }
  }

  /**
   * Handles queries using GPT-4 API with fallback
   * @param {string} prompt - User prompt
   * @param {Object} context - Additional context
   * @param {Object} analysis - Real estate analysis (for context)
   * @returns {Promise<Object>} GPT response object
   */
  async handleGPTQuery(prompt, context, analysis) {
    try {
      this.log('🤖 Routing to GPT-4');
      
      // Check if GPT service is available
      if (!await this.gptProxy.isAvailable()) {
        this.log('⚠️ GPT service unavailable, using fallback');
        return this.createFallbackResponse('gpt_unavailable');
      }

      this.metrics.gptResponses++;

      const gptResponse = await this.gptProxy.generateResponse(prompt, {
        ...context,
        realEstateContext: analysis.confidence > 0.1 ? analysis : null,
        maxTokens: 256 // Testphase limit
      });

      return {
        content: gptResponse.content,
        source: 'gpt',
        confidence: 0.9, // GPT responses are generally high confidence
        category: analysis.category || 'general',
        responseTime: gptResponse.responseTime,
        metadata: {
          model: gptResponse.model || 'gpt-4',
          tokens: gptResponse.tokens,
          reasoning: 'GPT-4 general knowledge response',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      this.log('❌ GPT query error:', error);
      this.metrics.fallbacks++;
      
      // Intelligent fallback based on error type
      if (error.status >= 400 && error.status < 500) {
        // Client error - likely API key or quota issue
        return this.createFallbackResponse('gpt_client_error');
      } else if (error.status >= 500) {
        // Server error - OpenAI service issue
        return this.createFallbackResponse('gpt_server_error');
      } else {
        // Network or other error
        return this.createFallbackResponse('gpt_network_error');
      }
    }
  }

  /**
   * Creates fallback responses for various error scenarios
   * @param {string} errorType - Type of error that occurred
   * @returns {Object} Fallback response object
   */
  createFallbackResponse(errorType) {
    const fallbackResponses = {
      local_error: {
        content: "Entschuldigung, ich hatte einen kurzen Aussetzer bei der Verarbeitung Ihrer Immobilien-Frage. Können Sie die Frage bitte anders formulieren?",
        source: 'fallback',
        category: 'error'
      },
      gpt_unavailable: {
        content: "Ich kann Ihnen gerne bei Fragen zu Mietern, Objekten, Zahlungen, Rückständen und Wartung helfen. Für allgemeine Fragen ist mein erweiterte KI-System momentan nicht verfügbar.",
        source: 'fallback',
        category: 'service_unavailable'
      },
      gpt_client_error: {
        content: "Mein erweitertes KI-System ist momentan nicht verfügbar. Ich kann Ihnen aber gerne bei Immobilien-spezifischen Fragen helfen!",
        source: 'fallback',
        category: 'api_error'
      },
      gpt_server_error: {
        content: "Die erweiterte KI-Funktionalität ist vorübergehend nicht verfügbar. Für Immobilien-Fragen stehe ich Ihnen weiterhin zur Verfügung.",
        source: 'fallback',
        category: 'server_error'
      },
      gpt_network_error: {
        content: "Verbindungsprobleme mit dem erweiterten KI-System. Ich helfe Ihnen gerne bei Fragen zur Hausverwaltung!",
        source: 'fallback',
        category: 'network_error'
      }
    };

    const response = fallbackResponses[errorType] || fallbackResponses.local_error;
    
    return {
      ...response,
      confidence: 0.5,
      responseTime: 100,
      metadata: {
        errorType,
        timestamp: new Date().toISOString(),
        reasoning: 'Fallback response due to system error'
      }
    };
  }

  /**
   * Creates error response for unexpected errors
   * @param {Error} error - The error that occurred
   * @returns {Object} Error response object
   */
  createErrorResponse(error) {
    return {
      content: "Entschuldigung, es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.",
      source: 'error',
      confidence: 0,
      category: 'system_error',
      responseTime: 50,
      metadata: {
        error: error.message,
        timestamp: new Date().toISOString(),
        reasoning: 'System error response'
      }
    };
  }

  /**
   * Gets current performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    const total = this.metrics.localResponses + this.metrics.gptResponses + this.metrics.fallbacks;
    
    return {
      ...this.metrics,
      total,
      localPercentage: total > 0 ? ((this.metrics.localResponses / total) * 100).toFixed(1) : 0,
      gptPercentage: total > 0 ? ((this.metrics.gptResponses / total) * 100).toFixed(1) : 0,
      fallbackPercentage: total > 0 ? ((this.metrics.fallbacks / total) * 100).toFixed(1) : 0,
      errorRate: total > 0 ? ((this.metrics.errors / total) * 100).toFixed(1) : 0
    };
  }

  /**
   * Resets performance metrics
   */
  resetMetrics() {
    this.metrics = {
      localResponses: 0,
      gptResponses: 0,
      fallbacks: 0,
      errors: 0
    };
  }

  /**
   * Debug logging function
   * @param {...any} args - Arguments to log
   */
  log(...args) {
    if (this.debugMode) {
      console.log('[ClaraIntelligenceBridge]', ...args);
    }
  }
}

// Export singleton instance
export const claraIntelligenceBridge = new ClaraIntelligenceBridge();

