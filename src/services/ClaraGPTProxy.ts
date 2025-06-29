// 🧠 LEGACY INTEGRATION - CLARA-HYBRID PATCH V6.4.1
// ClaraGPTProxy.ts - GPT-4 API Integration for Hybrid Intelligence
// Connects existing ClaraIntelligenceEngine with OpenAI GPT-4

/**
 * Clara GPT Proxy - OpenAI GPT-4 Integration
 * 
 * Provides GPT-4 API integration for the existing ClaraIntelligenceEngine
 * Implements fallback strategies and error handling for hybrid intelligence
 */
export class ClaraGPTProxy {
  private apiKey: string | null;
  private baseUrl: string;
  private model: string;
  private maxTokens: number;
  private temperature: number;
  private debugMode: boolean;
  private requestCount: number;
  private errorCount: number;

  constructor(config: {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    debugMode?: boolean;
  } = {}) {
    // 🧠 LEGACY INTEGRATION: Environment-based configuration
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY || null;
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = config.model || 'gpt-4';
    this.maxTokens = config.maxTokens || 256; // Testphase limit as specified
    this.temperature = config.temperature || 0.7;
    this.debugMode = config.debugMode ?? (process.env.NODE_ENV === 'development');
    
    // Performance tracking
    this.requestCount = 0;
    this.errorCount = 0;

    this.log('🤖 ClaraGPTProxy initialized', {
      model: this.model,
      maxTokens: this.maxTokens,
      hasApiKey: !!this.apiKey,
      debugMode: this.debugMode
    });
  }

  /**
   * Check if GPT service is available
   * @returns {Promise<boolean>} Service availability status
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Quick availability check
      if (!this.apiKey) {
        this.log('⚠️ GPT service unavailable: No API key');
        return false;
      }

      // For development, we can add a simple ping test
      if (this.debugMode) {
        // In production, you might want to do a lightweight API call
        return true;
      }

      return true;
    } catch (error) {
      this.log('❌ GPT availability check failed:', error);
      return false;
    }
  }

  /**
   * Generate response using GPT-4 API
   * @param {string} prompt - User prompt
   * @param {Object} context - Additional context for the request
   * @returns {Promise<Object>} GPT response object
   */
  async generateResponse(prompt: string, context: {
    realEstateContext?: any;
    conversationHistory?: any[];
    maxTokens?: number;
    temperature?: number;
  } = {}): Promise<{
    content: string;
    model: string;
    tokens: number;
    responseTime: number;
    confidence: number;
  }> {
    const startTime = Date.now();
    this.requestCount++;

    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

      this.log('🤖 Generating GPT response for:', prompt.substring(0, 50) + '...');

      // 🧠 LEGACY INTEGRATION: Build system message with real estate context
      const systemMessage = this.buildSystemMessage(context);
      
      // Build conversation messages
      const messages = [
        { role: 'system', content: systemMessage },
        ...this.buildConversationHistory(context.conversationHistory || []),
        { role: 'user', content: prompt }
      ];

      // API request configuration
      const requestConfig = {
        model: this.model,
        messages: messages,
        max_tokens: context.maxTokens || this.maxTokens,
        temperature: context.temperature || this.temperature,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      };

      this.log('🔄 Making GPT API request:', {
        model: requestConfig.model,
        maxTokens: requestConfig.max_tokens,
        messagesCount: messages.length
      });

      // Make API request
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestConfig)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`GPT API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      // Extract response content
      const content = data.choices?.[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
      const tokens = data.usage?.total_tokens || 0;

      this.log('✅ GPT response generated:', {
        responseTime: `${responseTime}ms`,
        tokens,
        contentLength: content.length
      });

      return {
        content: content.trim(),
        model: data.model || this.model,
        tokens,
        responseTime,
        confidence: 0.9 // GPT responses are generally high confidence
      };

    } catch (error) {
      this.errorCount++;
      const responseTime = Date.now() - startTime;
      
      this.log('❌ GPT request failed:', {
        error: error.message,
        responseTime: `${responseTime}ms`,
        requestCount: this.requestCount,
        errorCount: this.errorCount
      });

      // Re-throw with additional context
      const enhancedError = new Error(`GPT Proxy Error: ${error.message}`);
      (enhancedError as any).status = (error as any).status || 500;
      (enhancedError as any).responseTime = responseTime;
      throw enhancedError;
    }
  }

  /**
   * Build system message with real estate context
   * @param {Object} context - Request context
   * @returns {string} System message for GPT
   */
  private buildSystemMessage(context: any): string {
    let systemMessage = `Du bist Clara, eine professionelle KI-Assistentin für Hausverwaltung und Immobilien-Management.

DEINE ROLLE:
- Professionelle, freundliche und kompetente Beratung
- Spezialisiert auf Immobilienverwaltung, Finanzen und Mieter-Management
- Datenschutzfreundlich und DSGVO-konform

ANTWORT-STIL:
- Präzise und hilfreich
- Maximal 2-3 Sätze (wegen Token-Limit)
- Deutsch als Hauptsprache
- Professioneller aber zugänglicher Ton`;

    // Add real estate context if available
    if (context.realEstateContext) {
      systemMessage += `

IMMOBILIEN-KONTEXT:
- Hauptobjekt: Waldhofstraße 76, Mannheim
- Portfolio-Wert: ca. 1.2M€
- Durchschnittliche Rendite: 7.8%
- Auslastung: 94%`;
    }

    systemMessage += `

WICHTIG:
- Bei Immobilien-spezifischen Fragen: Nutze den Kontext
- Bei allgemeinen Fragen: Beantworte normal, aber kurz
- Bei unklaren Anfragen: Nachfragen stellen`;

    return systemMessage;
  }

  /**
   * Build conversation history for context
   * @param {any[]} history - Conversation history
   * @returns {any[]} Formatted messages for GPT
   */
  private buildConversationHistory(history: any[]): any[] {
    // Limit conversation history to last 3 exchanges to stay within token limits
    const recentHistory = history.slice(-6); // 3 exchanges = 6 messages (user + assistant)
    
    return recentHistory.map(exchange => {
      if (exchange.role) {
        return exchange; // Already formatted
      }
      
      // Convert legacy format
      return [
        { role: 'user', content: exchange.query || exchange.user || '' },
        { role: 'assistant', content: exchange.response || exchange.assistant || '' }
      ];
    }).flat().filter(msg => msg.content.trim());
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics(): {
    requestCount: number;
    errorCount: number;
    successRate: string;
    errorRate: string;
  } {
    const successRate = this.requestCount > 0 
      ? (((this.requestCount - this.errorCount) / this.requestCount) * 100).toFixed(1)
      : '0';
    
    const errorRate = this.requestCount > 0
      ? ((this.errorCount / this.requestCount) * 100).toFixed(1)
      : '0';

    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      successRate: `${successRate}%`,
      errorRate: `${errorRate}%`
    };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.requestCount = 0;
    this.errorCount = 0;
  }

  /**
   * Update configuration
   * @param {Object} config - New configuration
   */
  updateConfig(config: {
    apiKey?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): void {
    if (config.apiKey !== undefined) this.apiKey = config.apiKey;
    if (config.model !== undefined) this.model = config.model;
    if (config.maxTokens !== undefined) this.maxTokens = config.maxTokens;
    if (config.temperature !== undefined) this.temperature = config.temperature;

    this.log('🔧 GPT Proxy configuration updated:', config);
  }

  /**
   * Debug logging function
   * @param {...any} args - Arguments to log
   */
  private log(...args: any[]): void {
    if (this.debugMode) {
      console.log('[ClaraGPTProxy]', ...args);
    }
  }
}

// Export singleton instance for easy use
export const claraGPTProxy = new ClaraGPTProxy();

// Export TypeScript interfaces
export interface GPTResponse {
  content: string;
  model: string;
  tokens: number;
  responseTime: number;
  confidence: number;
}

export interface GPTContext {
  realEstateContext?: any;
  conversationHistory?: any[];
  maxTokens?: number;
  temperature?: number;
}

