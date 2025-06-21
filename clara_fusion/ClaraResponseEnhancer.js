/**
 * ClaraResponseEnhancer.js
 * Implements contextual response enhancement features for Clara
 * 
 * Part of Clara360 Dialog Intelligence Phase 2
 * Created by Manus C
 */

import ClaraResponseStyler from './ClaraResponseStyler';

/**
 * Enhances Clara's responses with contextual information and natural language styling
 */
class ClaraResponseEnhancer {
  constructor(options = {}) {
    this.responseStyler = new ClaraResponseStyler(options.stylerOptions || {});
    
    // Configuration
    this.options = {
      enablePropertyContext: true,
      enableTenantContext: true,
      enableFinancialContext: true,
      enableTemporalContext: true,
      defaultStyle: 'conversational',
      ...options
    };
    
    // Context extractors for different data types
    this.contextExtractors = {
      property: this.extractPropertyContext.bind(this),
      tenant: this.extractTenantContext.bind(this),
      financial: this.extractFinancialContext.bind(this),
      contract: this.extractContractContext.bind(this)
    };
  }
  
  /**
   * Enhance a basic response with contextual information
   * @param {Object} params - Enhancement parameters
   * @param {string} params.baseResponse - Original response text
   * @param {Object} params.conversationContext - Current conversation context
   * @param {Object} params.dataContext - Data context from hooks
   * @param {string} params.style - Response style to apply
   * @param {number} params.confidence - Confidence level (0-1)
   * @returns {string} Enhanced response
   */
  enhanceResponse({
    baseResponse,
    conversationContext = {},
    dataContext = {},
    style = this.options.defaultStyle,
    confidence = 1.0
  }) {
    if (!baseResponse) {
      return '';
    }
    
    // Extract relevant context from data context
    const extractedContext = this.extractRelevantContext(dataContext, conversationContext);
    
    // Extract additional data for factual expansion
    const additionalData = this.extractAdditionalData(dataContext);
    
    // Use response styler to enhance the response
    return this.responseStyler.enhanceResponse({
      baseResponse,
      context: extractedContext,
      style,
      data: additionalData,
      confidence
    });
  }
  
  /**
   * Extract relevant context from data context
   * @param {Object} dataContext - Data context from hooks
   * @param {Object} conversationContext - Current conversation context
   * @returns {Object} Extracted context
   * @private
   */
  extractRelevantContext(dataContext, conversationContext) {
    const extractedContext = {};
    
    // Extract property context if enabled and available
    if (this.options.enablePropertyContext && dataContext.property) {
      extractedContext.property = this.extractPropertyContext(dataContext.property, conversationContext);
    }
    
    // Extract tenant context if enabled and available
    if (this.options.enableTenantContext && dataContext.tenant) {
      extractedContext.tenant = this.extractTenantContext(dataContext.tenant, conversationContext);
    }
    
    // Extract financial context if enabled and available
    if (this.options.enableFinancialContext && dataContext.financial) {
      extractedContext.financial = this.extractFinancialContext(dataContext.financial, conversationContext);
    }
    
    // Extract temporal context if enabled and available
    if (this.options.enableTemporalContext && dataContext.temporal) {
      extractedContext.temporal = this.extractTemporalContext(dataContext.temporal, conversationContext);
    }
    
    return extractedContext;
  }
  
  /**
   * Extract property context
   * @param {Object} propertyData - Property data
   * @param {Object} conversationContext - Conversation context
   * @returns {Object} Property context
   * @private
   */
  extractPropertyContext(propertyData, conversationContext) {
    if (!propertyData) {
      return null;
    }
    
    return {
      name: propertyData.name || propertyData.id || '',
      address: propertyData.address || '',
      type: propertyData.type || '',
      units: propertyData.units || 0
    };
  }
  
  /**
   * Extract tenant context
   * @param {Object} tenantData - Tenant data
   * @param {Object} conversationContext - Conversation context
   * @returns {Object} Tenant context
   * @private
   */
  extractTenantContext(tenantData, conversationContext) {
    if (!tenantData) {
      return null;
    }
    
    return {
      name: tenantData.name || '',
      since: tenantData.since || tenantData.startDate || '',
      unit: tenantData.unit || tenantData.unitId || ''
    };
  }
  
  /**
   * Extract financial context
   * @param {Object} financialData - Financial data
   * @param {Object} conversationContext - Conversation context
   * @returns {Object} Financial context
   * @private
   */
  extractFinancialContext(financialData, conversationContext) {
    if (!financialData) {
      return null;
    }
    
    let metric = '';
    let value = null;
    let format = 'currency';
    
    // Extract most relevant financial metric
    if (financialData.netCashFlow !== undefined) {
      metric = 'Netto-Cashflow';
      value = financialData.netCashFlow;
    } else if (financialData.income !== undefined) {
      metric = 'Einnahmen';
      value = financialData.income;
    } else if (financialData.capRate !== undefined) {
      metric = 'Kapitalisierungsrate';
      value = financialData.capRate;
      format = 'percentage';
    } else if (financialData.roi !== undefined) {
      metric = 'ROI';
      value = financialData.roi;
      format = 'percentage';
    }
    
    return {
      metric,
      value,
      format,
      trend: financialData.trend || null
    };
  }
  
  /**
   * Extract temporal context
   * @param {Object} temporalData - Temporal data
   * @param {Object} conversationContext - Conversation context
   * @returns {Object} Temporal context
   * @private
   */
  extractTemporalContext(temporalData, conversationContext) {
    if (!temporalData) {
      return null;
    }
    
    return {
      period: temporalData.period || '',
      comparison: temporalData.comparison || '',
      trend: temporalData.trend || null
    };
  }
  
  /**
   * Extract contract context
   * @param {Object} contractData - Contract data
   * @param {Object} conversationContext - Conversation context
   * @returns {Object} Contract context
   * @private
   */
  extractContractContext(contractData, conversationContext) {
    if (!contractData) {
      return null;
    }
    
    return {
      id: contractData.id || contractData.contractId || '',
      tenant: contractData.tenantName || '',
      startDate: contractData.startDate || '',
      endDate: contractData.endDate || '',
      status: this.determineContractStatus(contractData)
    };
  }
  
  /**
   * Determine contract status
   * @param {Object} contractData - Contract data
   * @returns {string} Contract status
   * @private
   */
  determineContractStatus(contractData) {
    if (!contractData || !contractData.endDate) {
      return 'unbekannt';
    }
    
    const now = new Date();
    const endDate = new Date(contractData.endDate);
    
    if (endDate < now) {
      return 'abgelaufen';
    }
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    if (endDate <= thirtyDaysFromNow) {
      return 'auslaufend';
    }
    
    return 'aktiv';
  }
  
  /**
   * Extract additional data for factual expansion
   * @param {Object} dataContext - Data context
   * @returns {Object} Additional data
   * @private
   */
  extractAdditionalData(dataContext) {
    const additionalData = {};
    
    // Extract statistics
    if (dataContext.statistics) {
      additionalData.statistics = {
        total: dataContext.statistics.total,
        average: dataContext.statistics.average,
        trend: dataContext.statistics.trend,
        format: dataContext.statistics.format || 'count'
      };
    }
    
    // Extract insights
    if (dataContext.insights && Array.isArray(dataContext.insights)) {
      // Filter to most important insights (high impact)
      additionalData.insights = dataContext.insights
        .filter(insight => insight.impact === 'high')
        .slice(0, 2);
    }
    
    // Extract recommendations
    if (dataContext.recommendations && Array.isArray(dataContext.recommendations)) {
      additionalData.recommendations = dataContext.recommendations.slice(0, 1);
    }
    
    return additionalData;
  }
  
  /**
   * Transform raw data into natural language response
   * @param {Object} params - Transformation parameters
   * @param {*} params.data - Data to transform
   * @param {string} params.dataType - Type of data
   * @param {string} params.entityType - Type of entity
   * @param {Object} params.context - Additional context
   * @returns {string} Natural language response
   */
  transformDataToResponse({
    data,
    dataType = 'count',
    entityType = 'generic',
    context = {}
  }) {
    return this.responseStyler.transformDataToNaturalResponse({
      data,
      dataType,
      entityType,
      context
    });
  }
  
  /**
   * Set response style
   * @param {string} style - Style to set
   * @returns {boolean} Success
   */
  setStyle(style) {
    this.options.defaultStyle = style;
    return this.responseStyler.setStyle(style);
  }
  
  /**
   * Enable or disable property context
   * @param {boolean} enable - Whether to enable
   */
  setPropertyContext(enable) {
    this.options.enablePropertyContext = !!enable;
  }
  
  /**
   * Enable or disable tenant context
   * @param {boolean} enable - Whether to enable
   */
  setTenantContext(enable) {
    this.options.enableTenantContext = !!enable;
  }
  
  /**
   * Enable or disable financial context
   * @param {boolean} enable - Whether to enable
   */
  setFinancialContext(enable) {
    this.options.enableFinancialContext = !!enable;
  }
  
  /**
   * Enable or disable temporal context
   * @param {boolean} enable - Whether to enable
   */
  setTemporalContext(enable) {
    this.options.enableTemporalContext = !!enable;
  }
}

export default ClaraResponseEnhancer;
