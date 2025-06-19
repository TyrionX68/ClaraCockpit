/**
 * ProactiveInsightsEngine.js
 * Engine for generating proactive insights from financial and property data
 * 
 * Part of Clara360 Advanced AI Integration
 * Created by Manus C
 */

class ProactiveInsightsEngine {
  constructor(options = {}) {
    // Configuration
    this.options = {
      insightThresholds: options.insightThresholds || {
        cashFlow: { critical: -500, warning: 0 },
        expenseRatio: { critical: 60, warning: 45 },
        occupancyRate: { critical: 80, warning: 90 },
        maintenanceRatio: { critical: 20, warning: 15 },
        capRate: { critical: 4, warning: 5 }
      },
      trendThresholds: options.trendThresholds || {
        income: { critical: -10, warning: -5 },
        expenses: { critical: 15, warning: 10 },
        netCashFlow: { critical: -15, warning: -10 },
        occupancy: { critical: -10, warning: -5 }
      },
      anomalyThreshold: options.anomalyThreshold || 2.5, // Standard deviations
      maxInsights: options.maxInsights || 50,
      insightPersistenceKey: options.insightPersistenceKey || 'clara360_proactive_insights',
      ...options
    };
    
    // State
    this.insights = [];
    this.dismissedInsights = [];
    this.historicalData = {};
    this.anomalyDetectors = {};
    
    // Load persisted insights if available
    this.loadPersistedInsights();
  }
  
  /**
   * Analyze financial data for insights
   * @param {Object} financialData - Financial data to analyze
   * @param {Object} propertyData - Property data for context
   * @returns {Array} Generated insights
   */
  analyzeFinancialData(financialData, propertyData) {
    if (!financialData || !financialData.cashFlow || !financialData.metrics || !financialData.trends) {
      console.error('ProactiveInsightsEngine: Invalid financial data');
      return [];
    }
    
    const newInsights = [];
    
    // Update historical data
    this.updateHistoricalData('financial', financialData);
    
    // Check cash flow
    if (financialData.cashFlow.total.netCashFlow < this.options.insightThresholds.cashFlow.critical) {
      newInsights.push(this.createInsight({
        type: 'cash_flow',
        category: 'financial',
        severity: 'critical',
        title: 'Critical negative cash flow',
        description: `The property has a critical negative cash flow of ${financialData.cashFlow.total.netCashFlow.toLocaleString()} €`,
        value: financialData.cashFlow.total.netCashFlow,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Review all expenses for potential reductions',
          'Consider rent adjustments if market allows',
          'Evaluate refinancing options to reduce debt service'
        ]
      }));
    } else if (financialData.cashFlow.total.netCashFlow < this.options.insightThresholds.cashFlow.warning) {
      newInsights.push(this.createInsight({
        type: 'cash_flow',
        category: 'financial',
        severity: 'warning',
        title: 'Negative cash flow',
        description: `The property has a negative cash flow of ${financialData.cashFlow.total.netCashFlow.toLocaleString()} €`,
        value: financialData.cashFlow.total.netCashFlow,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Identify largest expense categories for potential savings',
          'Review rental rates compared to market'
        ]
      }));
    }
    
    // Check expense ratio
    if (financialData.metrics.expenseRatio > this.options.insightThresholds.expenseRatio.critical) {
      newInsights.push(this.createInsight({
        type: 'expense_ratio',
        category: 'financial',
        severity: 'critical',
        title: 'Critical expense ratio',
        description: `Expenses are ${financialData.metrics.expenseRatio.toFixed(1)}% of income, significantly above target`,
        value: financialData.metrics.expenseRatio,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Conduct comprehensive expense audit',
          'Identify and address top expense categories',
          'Consider professional property management review'
        ]
      }));
    } else if (financialData.metrics.expenseRatio > this.options.insightThresholds.expenseRatio.warning) {
      newInsights.push(this.createInsight({
        type: 'expense_ratio',
        category: 'financial',
        severity: 'warning',
        title: 'High expense ratio',
        description: `Expenses are ${financialData.metrics.expenseRatio.toFixed(1)}% of income, above recommended levels`,
        value: financialData.metrics.expenseRatio,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Review top expense categories',
          'Compare expenses to similar properties'
        ]
      }));
    }
    
    // Check cap rate
    if (financialData.metrics.capRate < this.options.insightThresholds.capRate.critical) {
      newInsights.push(this.createInsight({
        type: 'cap_rate',
        category: 'financial',
        severity: 'critical',
        title: 'Critical cap rate',
        description: `Cap rate of ${financialData.metrics.capRate.toFixed(2)}% is significantly below market average`,
        value: financialData.metrics.capRate,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Evaluate property value assessment',
          'Develop strategy to increase net operating income',
          'Consider portfolio rebalancing if persistent'
        ]
      }));
    } else if (financialData.metrics.capRate < this.options.insightThresholds.capRate.warning) {
      newInsights.push(this.createInsight({
        type: 'cap_rate',
        category: 'financial',
        severity: 'warning',
        title: 'Low cap rate',
        description: `Cap rate of ${financialData.metrics.capRate.toFixed(2)}% is below target levels`,
        value: financialData.metrics.capRate,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Monitor market trends in the area',
          'Identify opportunities to increase income'
        ]
      }));
    }
    
    // Check maintenance ratio
    if (financialData.metrics.maintenanceRatio > this.options.insightThresholds.maintenanceRatio.critical) {
      newInsights.push(this.createInsight({
        type: 'maintenance_ratio',
        category: 'financial',
        severity: 'critical',
        title: 'Critical maintenance costs',
        description: `Maintenance costs are ${financialData.metrics.maintenanceRatio.toFixed(1)}% of income, significantly above target`,
        value: financialData.metrics.maintenanceRatio,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Conduct comprehensive maintenance audit',
          'Evaluate preventative maintenance program',
          'Consider capital improvements to reduce ongoing maintenance'
        ]
      }));
    } else if (financialData.metrics.maintenanceRatio > this.options.insightThresholds.maintenanceRatio.warning) {
      newInsights.push(this.createInsight({
        type: 'maintenance_ratio',
        category: 'financial',
        severity: 'warning',
        title: 'High maintenance costs',
        description: `Maintenance costs are ${financialData.metrics.maintenanceRatio.toFixed(1)}% of income, above recommended levels`,
        value: financialData.metrics.maintenanceRatio,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Review recent maintenance expenses',
          'Identify recurring maintenance issues'
        ]
      }));
    }
    
    // Check trends
    if (financialData.trends.incomeTrend < this.options.trendThresholds.income.critical) {
      newInsights.push(this.createInsight({
        type: 'income_trend',
        category: 'trend',
        severity: 'critical',
        title: 'Critical income decline',
        description: `Income has decreased by ${Math.abs(financialData.trends.incomeTrend).toFixed(1)}% over the period`,
        value: financialData.trends.incomeTrend,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Investigate cause of income reduction',
          'Review rental rates and occupancy',
          'Evaluate tenant satisfaction and retention strategies'
        ]
      }));
    } else if (financialData.trends.incomeTrend < this.options.trendThresholds.income.warning) {
      newInsights.push(this.createInsight({
        type: 'income_trend',
        category: 'trend',
        severity: 'warning',
        title: 'Declining income trend',
        description: `Income has decreased by ${Math.abs(financialData.trends.incomeTrend).toFixed(1)}% over the period`,
        value: financialData.trends.incomeTrend,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Monitor income sources for further decline',
          'Compare to market trends in the area'
        ]
      }));
    }
    
    if (financialData.trends.expensesTrend > this.options.trendThresholds.expenses.critical) {
      newInsights.push(this.createInsight({
        type: 'expense_trend',
        category: 'trend',
        severity: 'critical',
        title: 'Critical expense increase',
        description: `Expenses have increased by ${financialData.trends.expensesTrend.toFixed(1)}% over the period`,
        value: financialData.trends.expensesTrend,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Identify categories with largest increases',
          'Implement immediate cost control measures',
          'Review service contracts and vendors'
        ]
      }));
    } else if (financialData.trends.expensesTrend > this.options.trendThresholds.expenses.warning) {
      newInsights.push(this.createInsight({
        type: 'expense_trend',
        category: 'trend',
        severity: 'warning',
        title: 'Rising expense trend',
        description: `Expenses have increased by ${financialData.trends.expensesTrend.toFixed(1)}% over the period`,
        value: financialData.trends.expensesTrend,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Monitor expense categories for further increases',
          'Compare to inflation and market averages'
        ]
      }));
    }
    
    if (financialData.trends.netCashFlowTrend < this.options.trendThresholds.netCashFlow.critical) {
      newInsights.push(this.createInsight({
        type: 'cash_flow_trend',
        category: 'trend',
        severity: 'critical',
        title: 'Critical cash flow decline',
        description: `Cash flow has decreased by ${Math.abs(financialData.trends.netCashFlowTrend).toFixed(1)}% over the period`,
        value: financialData.trends.netCashFlowTrend,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Urgent review of income and expense trends',
          'Develop cash flow improvement plan',
          'Consider refinancing or capital injection if persistent'
        ]
      }));
    } else if (financialData.trends.netCashFlowTrend < this.options.trendThresholds.netCashFlow.warning) {
      newInsights.push(this.createInsight({
        type: 'cash_flow_trend',
        category: 'trend',
        severity: 'warning',
        title: 'Declining cash flow trend',
        description: `Cash flow has decreased by ${Math.abs(financialData.trends.netCashFlowTrend).toFixed(1)}% over the period`,
        value: financialData.trends.netCashFlowTrend,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Monitor cash flow trends closely',
          'Identify factors contributing to decline'
        ]
      }));
    }
    
    // Check for anomalies if we have historical data
    if (this.historicalData.financial && this.historicalData.financial.length > 3) {
      const anomalies = this.detectAnomalies('financial', financialData);
      newInsights.push(...anomalies);
    }
    
    // Add insights to the collection
    this.addInsights(newInsights);
    
    return newInsights;
  }
  
  /**
   * Analyze property data for insights
   * @param {Object} propertyData - Property data to analyze
   * @returns {Array} Generated insights
   */
  analyzePropertyData(propertyData) {
    if (!propertyData || !propertyData.units) {
      console.error('ProactiveInsightsEngine: Invalid property data');
      return [];
    }
    
    const newInsights = [];
    
    // Update historical data
    this.updateHistoricalData('property', propertyData);
    
    // Check occupancy rate
    const occupancyRate = propertyData.units.total > 0 
      ? (propertyData.units.occupied / propertyData.units.total) * 100 
      : 0;
    
    if (occupancyRate < this.options.insightThresholds.occupancyRate.critical) {
      newInsights.push(this.createInsight({
        type: 'occupancy_rate',
        category: 'property',
        severity: 'critical',
        title: 'Critical occupancy rate',
        description: `Occupancy rate of ${occupancyRate.toFixed(1)}% is significantly below target`,
        value: occupancyRate,
        propertyId: propertyData.id,
        propertyName: propertyData.name,
        recommendations: [
          'Review rental rates compared to market',
          'Evaluate property condition and amenities',
          'Develop comprehensive marketing strategy',
          'Consider professional property management review'
        ]
      }));
    } else if (occupancyRate < this.options.insightThresholds.occupancyRate.warning) {
      newInsights.push(this.createInsight({
        type: 'occupancy_rate',
        category: 'property',
        severity: 'warning',
        title: 'Low occupancy rate',
        description: `Occupancy rate of ${occupancyRate.toFixed(1)}% is below target levels`,
        value: occupancyRate,
        propertyId: propertyData.id,
        propertyName: propertyData.name,
        recommendations: [
          'Review tenant turnover reasons',
          'Assess marketing effectiveness',
          'Consider minor property improvements'
        ]
      }));
    }
    
    // Check for anomalies if we have historical data
    if (this.historicalData.property && this.historicalData.property.length > 3) {
      const anomalies = this.detectAnomalies('property', propertyData);
      newInsights.push(...anomalies);
    }
    
    // Add insights to the collection
    this.addInsights(newInsights);
    
    return newInsights;
  }
  
  /**
   * Analyze maintenance data for insights
   * @param {Object} maintenanceData - Maintenance data to analyze
   * @param {Object} propertyData - Property data for context
   * @returns {Array} Generated insights
   */
  analyzeMaintenanceData(maintenanceData, propertyData) {
    if (!maintenanceData || !Array.isArray(maintenanceData)) {
      console.error('ProactiveInsightsEngine: Invalid maintenance data');
      return [];
    }
    
    const newInsights = [];
    
    // Update historical data
    this.updateHistoricalData('maintenance', maintenanceData);
    
    // Count critical tasks
    const criticalTasks = maintenanceData.filter(task => 
      task.priority === 'high' && 
      task.status !== 'completed' && 
      task.status !== 'cancelled'
    );
    
    if (criticalTasks.length > 3) {
      newInsights.push(this.createInsight({
        type: 'critical_maintenance',
        category: 'maintenance',
        severity: 'critical',
        title: 'Multiple critical maintenance issues',
        description: `${criticalTasks.length} high-priority maintenance tasks require attention`,
        value: criticalTasks.length,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Address high-priority maintenance immediately',
          'Evaluate maintenance response procedures',
          'Consider preventative maintenance program'
        ],
        relatedItems: criticalTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status
        }))
      }));
    } else if (criticalTasks.length > 0) {
      newInsights.push(this.createInsight({
        type: 'critical_maintenance',
        category: 'maintenance',
        severity: 'warning',
        title: 'Critical maintenance required',
        description: `${criticalTasks.length} high-priority maintenance ${criticalTasks.length === 1 ? 'task requires' : 'tasks require'} attention`,
        value: criticalTasks.length,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Address high-priority maintenance tasks',
          'Monitor for recurring issues'
        ],
        relatedItems: criticalTasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status
        }))
      }));
    }
    
    // Check for recurring issues
    const issueCategories = {};
    maintenanceData.forEach(task => {
      const category = task.category || 'Uncategorized';
      if (!issueCategories[category]) {
        issueCategories[category] = 0;
      }
      issueCategories[category]++;
    });
    
    const recurringCategories = Object.entries(issueCategories)
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1]);
    
    if (recurringCategories.length > 0) {
      const [topCategory, topCount] = recurringCategories[0];
      
      newInsights.push(this.createInsight({
        type: 'recurring_maintenance',
        category: 'maintenance',
        severity: topCount >= 5 ? 'critical' : 'warning',
        title: 'Recurring maintenance issues',
        description: `${topCount} maintenance issues in category "${topCategory}" indicate a recurring problem`,
        value: topCount,
        propertyId: propertyData?.id,
        propertyName: propertyData?.name,
        recommendations: [
          'Investigate root cause of recurring issues',
          'Consider system replacement or upgrade',
          'Develop preventative maintenance plan'
        ]
      }));
    }
    
    // Add insights to the collection
    this.addInsights(newInsights);
    
    return newInsights;
  }
  
  /**
   * Create a new insight
   * @param {Object} insightData - Insight data
   * @returns {Object} Created insight
   * @private
   */
  createInsight(insightData) {
    if (!insightData.type || !insightData.category || !insightData.severity || !insightData.title) {
      console.error('ProactiveInsightsEngine: Invalid insight data');
      return null;
    }
    
    // Generate insight ID
    const insightId = `insight-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create insight object with timestamp
    return {
      id: insightId,
      timestamp: new Date().toISOString(),
      type: insightData.type,
      category: insightData.category,
      severity: insightData.severity,
      title: insightData.title,
      description: insightData.description || '',
      value: insightData.value,
      propertyId: insightData.propertyId,
      propertyName: insightData.propertyName,
      recommendations: insightData.recommendations || [],
      relatedItems: insightData.relatedItems || [],
      dismissed: false,
      notified: false
    };
  }
  
  /**
   * Add insights to the collection
   * @param {Array} newInsights - Insights to add
   * @private
   */
  addInsights(newInsights) {
    if (!newInsights || !Array.isArray(newInsights) || newInsights.length === 0) {
      return;
    }
    
    // Filter out insights that match dismissed insights
    const filteredInsights = newInsights.filter(newInsight => {
      return !this.dismissedInsights.some(dismissed => 
        dismissed.type === newInsight.type && 
        dismissed.propertyId === newInsight.propertyId &&
        dismissed.category === newInsight.category
      );
    });
    
    // Add new insights
    this.insights = [...filteredInsights, ...this.insights];
    
    // Limit number of insights
    if (this.insights.length > this.options.maxInsights) {
      this.insights = this.insights.slice(0, this.options.maxInsights);
    }
    
    // Persist insights
    this.persistInsights();
  }
  
  /**
   * Get all insights
   * @param {Object} filters - Optional filters
   * @param {string} filters.severity - Filter by severity
   * @param {string} filters.category - Filter by category
   * @param {string} filters.propertyId - Filter by property ID
   * @param {boolean} filters.notified - Filter by notification status
   * @returns {Array} Filtered insights
   */
  getInsights(filters = {}) {
    let filteredInsights = [...this.insights];
    
    // Apply filters
    if (filters.severity) {
      filteredInsights = filteredInsights.filter(insight => insight.severity === filters.severity);
    }
    
    if (filters.category) {
      filteredInsights = filteredInsights.filter(insight => insight.category === filters.category);
    }
    
    if (filters.propertyId) {
      filteredInsights = filteredInsights.filter(insight => insight.propertyId === filters.propertyId);
    }
    
    if (filters.notified !== undefined) {
      filteredInsights = filteredInsights.filter(insight => insight.notified === filters.notified);
    }
    
    return filteredInsights;
  }
  
  /**
   * Get insight by ID
   * @param {string} id - Insight ID
   * @returns {Object|null} Insight or null if not found
   */
  getInsightById(id) {
    return this.insights.find(insight => insight.id === id) || null;
  }
  
  /**
   * Mark insight as notified
   * @param {string} id - Insight ID
   * @returns {boolean} Success status
   */
  markAsNotified(id) {
    const insight = this.getInsightById(id);
    if (!insight) {
      return false;
    }
    
    insight.notified = true;
    this.persistInsights();
    
    return true;
  }
  
  /**
   * Dismiss insight
   * @param {string} id - Insight ID
   * @returns {boolean} Success status
   */
  dismissInsight(id) {
    const insightIndex = this.insights.findIndex(insight => insight.id === id);
    if (insightIndex === -1) {
      return false;
    }
    
    // Move to dismissed insights
    const dismissedInsight = this.insights[insightIndex];
    dismissedInsight.dismissed = true;
    this.dismissedInsights.push(dismissedInsight);
    
    // Remove from active insights
    this.insights.splice(insightIndex, 1);
    
    // Persist insights
    this.persistInsights();
    
    return true;
  }
  
  /**
   * Update historical data
   * @param {string} dataType - Type of data
   * @param {Object} data - Data to add to history
   * @private
   */
  updateHistoricalData(dataType, data) {
    if (!dataType || !data) {
      return;
    }
    
    // Initialize historical data array if needed
    if (!this.historicalData[dataType]) {
      this.historicalData[dataType] = [];
    }
    
    // Add data with timestamp
    this.historicalData[dataType].push({
      timestamp: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(data)) // Deep copy
    });
    
    // Limit history size
    if (this.historicalData[dataType].length > 12) { // Keep last 12 data points
      this.historicalData[dataType].shift();
    }
  }
  
  /**
   * Detect anomalies in data
   * @param {string} dataType - Type of data
   * @param {Object} currentData - Current data to check for anomalies
   * @returns {Array} Detected anomalies as insights
   * @private
   */
  detectAnomalies(dataType, currentData) {
    if (!dataType || !currentData || !this.historicalData[dataType]) {
      return [];
    }
    
    const anomalies = [];
    
    // Simple anomaly detection based on standard deviation
    // In a real system, this would use more sophisticated methods
    
    if (dataType === 'financial') {
      // Check for income anomalies
      const incomeValues = this.historicalData[dataType]
        .map(item => item.data.cashFlow?.total?.income)
        .filter(Boolean);
      
      if (incomeValues.length >= 3) {
        const currentIncome = currentData.cashFlow?.total?.income;
        if (currentIncome) {
          const { mean, stdDev } = this.calculateStats(incomeValues);
          const zScore = (currentIncome - mean) / stdDev;
          
          if (Math.abs(zScore) > this.options.anomalyThreshold) {
            const isIncrease = currentIncome > mean;
            
            anomalies.push(this.createInsight({
              type: 'income_anomaly',
              category: 'anomaly',
              severity: isIncrease ? 'info' : 'warning',
              title: isIncrease ? 'Unusual income increase' : 'Unusual income decrease',
              description: `Income of ${currentIncome.toLocaleString()} € is ${isIncrease ? 'significantly higher' : 'significantly lower'} than the average of ${mean.toLocaleString()} €`,
              value: currentIncome,
              propertyId: currentData.propertyId,
              recommendations: [
                isIncrease ? 'Verify the source of additional income' : 'Investigate cause of income reduction',
                'Check for data entry errors',
                'Review tenant payment records'
              ]
            }));
          }
        }
      }
      
      // Check for expense anomalies
      const expenseValues = this.historicalData[dataType]
        .map(item => item.data.cashFlow?.total?.expenses)
        .filter(Boolean);
      
      if (expenseValues.length >= 3) {
        const currentExpenses = currentData.cashFlow?.total?.expenses;
        if (currentExpenses) {
          const { mean, stdDev } = this.calculateStats(expenseValues);
          const zScore = (currentExpenses - mean) / stdDev;
          
          if (Math.abs(zScore) > this.options.anomalyThreshold) {
            const isIncrease = currentExpenses > mean;
            
            anomalies.push(this.createInsight({
              type: 'expense_anomaly',
              category: 'anomaly',
              severity: isIncrease ? 'warning' : 'info',
              title: isIncrease ? 'Unusual expense increase' : 'Unusual expense decrease',
              description: `Expenses of ${currentExpenses.toLocaleString()} € are ${isIncrease ? 'significantly higher' : 'significantly lower'} than the average of ${mean.toLocaleString()} €`,
              value: currentExpenses,
              propertyId: currentData.propertyId,
              recommendations: [
                isIncrease ? 'Investigate source of expense increase' : 'Verify expense reduction source',
                'Check for unusual transactions',
                'Review expense categorization'
              ]
            }));
          }
        }
      }
    }
    
    if (dataType === 'property') {
      // Check for occupancy anomalies
      const occupancyValues = this.historicalData[dataType]
        .map(item => {
          if (item.data.units?.total && item.data.units?.total > 0) {
            return (item.data.units.occupied / item.data.units.total) * 100;
          }
          return null;
        })
        .filter(Boolean);
      
      if (occupancyValues.length >= 3) {
        const currentOccupancy = currentData.units?.total && currentData.units?.total > 0
          ? (currentData.units.occupied / currentData.units.total) * 100
          : null;
        
        if (currentOccupancy !== null) {
          const { mean, stdDev } = this.calculateStats(occupancyValues);
          const zScore = (currentOccupancy - mean) / stdDev;
          
          if (Math.abs(zScore) > this.options.anomalyThreshold) {
            const isIncrease = currentOccupancy > mean;
            
            anomalies.push(this.createInsight({
              type: 'occupancy_anomaly',
              category: 'anomaly',
              severity: isIncrease ? 'info' : 'warning',
              title: isIncrease ? 'Unusual occupancy increase' : 'Unusual occupancy decrease',
              description: `Occupancy rate of ${currentOccupancy.toFixed(1)}% is ${isIncrease ? 'significantly higher' : 'significantly lower'} than the average of ${mean.toFixed(1)}%`,
              value: currentOccupancy,
              propertyId: currentData.id,
              propertyName: currentData.name,
              recommendations: [
                isIncrease ? 'Analyze successful leasing strategies' : 'Investigate cause of occupancy reduction',
                'Review tenant turnover patterns',
                'Assess market conditions in the area'
              ]
            }));
          }
        }
      }
    }
    
    return anomalies;
  }
  
  /**
   * Calculate mean and standard deviation
   * @param {Array} values - Numeric values
   * @returns {Object} Mean and standard deviation
   * @private
   */
  calculateStats(values) {
    if (!values || values.length === 0) {
      return { mean: 0, stdDev: 0 };
    }
    
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return { mean, stdDev };
  }
  
  /**
   * Persist insights to storage
   * @private
   */
  persistInsights() {
    try {
      const persistData = {
        insights: this.insights,
        dismissedInsights: this.dismissedInsights,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(this.options.insightPersistenceKey, JSON.stringify(persistData));
    } catch (error) {
      console.error('ProactiveInsightsEngine: Failed to persist insights', error);
    }
  }
  
  /**
   * Load persisted insights from storage
   * @private
   */
  loadPersistedInsights() {
    try {
      const persistedData = localStorage.getItem(this.options.insightPersistenceKey);
      
      if (!persistedData) {
        return;
      }
      
      const data = JSON.parse(persistedData);
      
      // Restore persisted data
      this.insights = data.insights || [];
      this.dismissedInsights = data.dismissedInsights || [];
    } catch (error) {
      console.error('ProactiveInsightsEngine: Failed to load persisted insights', error);
    }
  }
  
  /**
   * Clear all insights
   */
  clearInsights() {
    this.insights = [];
    this.dismissedInsights = [];
    this.persistInsights();
  }
}

export default ProactiveInsightsEngine;
