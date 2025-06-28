// React hook for property financial analytics and interpretation
// Enhanced with Clara KI Integration for intelligent financial insights
// Manus A compliant implementation

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * React hook for property financial analytics and interpretation with Clara KI integration
 * @param {Object} options - Configuration options
 * @param {string} options.propertyId - Property identifier (optional)
 * @param {boolean} options.autoLoad - Whether to automatically load financial data on mount
 * @param {string} options.transactionsSource - Data source for financial transactions (default: 'transactions')
 * @param {Function} options.onDataLoaded - Callback when data is loaded
 * @param {Function} options.onClaraInsight - Callback for Clara KI insights
 * @returns {Object} Financial analytics methods and state
 */
export function useFinancialAnalytics(options = {}) {
  const {
    propertyId = null,
    autoLoad = true,
    transactionsSource = 'transactions',
    onDataLoaded = null,
    onClaraInsight = null
  } = options;
  
  // State
  const [transactions, setTransactions] = useState([]);
  const [cashFlow, setCashFlow] = useState({});
  const [financialMetrics, setFinancialMetrics] = useState({});
  const [claraInsights, setClaraInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activePropertyId, setActivePropertyId] = useState(propertyId);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    end: new Date()
  });
  
  // Refs
  const dataLoaded = useRef(false);
  
  // Generate dummy financial data for demonstration
  const generateDummyTransactions = useCallback(() => {
    const dummyTransactions = [
      {
        id: 'tx_001',
        propertyId: 'prop_001',
        date: '2024-06-01',
        type: 'income',
        category: 'Miete',
        amount: 1200.00,
        description: 'Miete Wohnung 1A - Juni 2024',
        tenant: 'Max Mustermann',
        unit: '1A'
      },
      {
        id: 'tx_002',
        propertyId: 'prop_001',
        date: '2024-06-05',
        type: 'expense',
        category: 'Wartung',
        amount: -150.00,
        description: 'Heizungsreparatur Wohnung 1A',
        vendor: 'Heizung Service GmbH',
        unit: '1A'
      },
      {
        id: 'tx_003',
        propertyId: 'prop_001',
        date: '2024-06-01',
        type: 'income',
        category: 'Miete',
        amount: 950.00,
        description: 'Miete Wohnung 2B - Juni 2024',
        tenant: 'Anna Schmidt',
        unit: '2B'
      },
      {
        id: 'tx_004',
        propertyId: 'prop_001',
        date: '2024-06-10',
        type: 'expense',
        category: 'Verwaltung',
        amount: -85.00,
        description: 'Hausverwaltung Gebühren Juni',
        vendor: 'Verwaltung Plus GmbH'
      },
      {
        id: 'tx_005',
        propertyId: 'prop_001',
        date: '2024-06-15',
        type: 'income',
        category: 'Nebenkosten',
        amount: 180.00,
        description: 'Nebenkostenabrechnung Wohnung 1A',
        tenant: 'Max Mustermann',
        unit: '1A'
      },
      {
        id: 'tx_006',
        propertyId: 'prop_001',
        date: '2024-06-20',
        type: 'expense',
        category: 'Instandhaltung',
        amount: -320.00,
        description: 'Malerarbeiten Treppenhaus',
        vendor: 'Malerbetrieb Weber'
      }
    ];
    
    return dummyTransactions;
  }, []);

  // Calculate cash flow from transactions
  const calculateCashFlow = useCallback((transactionData) => {
    const income = transactionData
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const expenses = transactionData
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netCashFlow = income - expenses;
    
    return {
      income,
      expenses,
      netCashFlow,
      profitMargin: income > 0 ? ((netCashFlow / income) * 100).toFixed(2) : 0
    };
  }, []);

  // Calculate financial metrics
  const calculateFinancialMetrics = useCallback((transactionData) => {
    const monthlyData = {};
    
    transactionData.forEach(transaction => {
      const month = transaction.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += Math.abs(transaction.amount);
      } else {
        monthlyData[month].expenses += Math.abs(transaction.amount);
      }
    });
    
    const months = Object.keys(monthlyData).sort();
    const avgIncome = months.length > 0 
      ? months.reduce((sum, month) => sum + monthlyData[month].income, 0) / months.length 
      : 0;
    const avgExpenses = months.length > 0 
      ? months.reduce((sum, month) => sum + monthlyData[month].expenses, 0) / months.length 
      : 0;
    
    return {
      monthlyData,
      avgIncome: Math.round(avgIncome),
      avgExpenses: Math.round(avgExpenses),
      avgNetIncome: Math.round(avgIncome - avgExpenses),
      totalTransactions: transactionData.length
    };
  }, []);

  // Generate Clara KI insights based on financial data
  const generateClaraInsights = useCallback((transactionData, cashFlowData, metricsData) => {
    const insights = [];
    
    // Cash flow analysis
    if (cashFlowData.netCashFlow > 0) {
      insights.push({
        type: 'positive',
        category: 'Cashflow',
        message: `Positiver Cashflow von €${cashFlowData.netCashFlow.toFixed(2)}. Ihre Immobilie ist profitabel!`,
        suggestion: 'Erwägen Sie Reinvestitionen in Modernisierung für höhere Mieteinnahmen.',
        priority: 'medium'
      });
    } else {
      insights.push({
        type: 'warning',
        category: 'Cashflow',
        message: `Negativer Cashflow von €${Math.abs(cashFlowData.netCashFlow).toFixed(2)}. Handlungsbedarf!`,
        suggestion: 'Prüfen Sie Mietanpassungen oder reduzieren Sie Ausgaben.',
        priority: 'high'
      });
    }
    
    // Expense analysis
    const maintenanceExpenses = transactionData
      .filter(t => t.type === 'expense' && (t.category === 'Wartung' || t.category === 'Instandhaltung'))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    if (maintenanceExpenses > cashFlowData.income * 0.15) {
      insights.push({
        type: 'warning',
        category: 'Wartungskosten',
        message: `Hohe Wartungskosten: €${maintenanceExpenses.toFixed(2)} (${((maintenanceExpenses/cashFlowData.income)*100).toFixed(1)}% der Einnahmen)`,
        suggestion: 'Überprüfen Sie Wartungsverträge und planen Sie präventive Maßnahmen.',
        priority: 'medium'
      });
    }
    
    // Income stability
    const incomeTransactions = transactionData.filter(t => t.type === 'income' && t.category === 'Miete');
    if (incomeTransactions.length < 2) {
      insights.push({
        type: 'info',
        category: 'Vermietung',
        message: 'Niedrige Mieteinnahmen-Frequenz erkannt.',
        suggestion: 'Prüfen Sie Leerstandszeiten und Mietvertragskonditionen.',
        priority: 'low'
      });
    }
    
    return insights;
  }, []);
  
  // Load financial data
  const loadFinancialData = useCallback(async (id = null) => {
    const targetId = id || activePropertyId || 'prop_001'; // Default property for demo
    
    setIsLoading(true);
    setError(null);
    
    try {
      // For demo: use dummy data
      const dummyData = generateDummyTransactions();
      const propertyTransactions = dummyData.filter(t => t.propertyId === targetId);
      
      setTransactions(propertyTransactions);
      
      // Calculate cash flow
      const calculatedCashFlow = calculateCashFlow(propertyTransactions);
      setCashFlow(calculatedCashFlow);
      
      // Calculate financial metrics
      const calculatedMetrics = calculateFinancialMetrics(propertyTransactions);
      setFinancialMetrics(calculatedMetrics);
      
      // Generate Clara insights
      const insights = generateClaraInsights(propertyTransactions, calculatedCashFlow, calculatedMetrics);
      setClaraInsights(insights);
      
      dataLoaded.current = true;
      
      // Call callbacks
      if (onDataLoaded && typeof onDataLoaded === 'function') {
        onDataLoaded({
          transactions: propertyTransactions,
          cashFlow: calculatedCashFlow,
          metrics: calculatedMetrics,
          insights
        });
      }
      
      if (onClaraInsight && typeof onClaraInsight === 'function') {
        insights.forEach(insight => onClaraInsight(insight));
      }
      
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to load financial data');
      setIsLoading(false);
      return false;
    }
  }, [activePropertyId, generateDummyTransactions, calculateCashFlow, calculateFinancialMetrics, generateClaraInsights, onDataLoaded, onClaraInsight]);
  
  // Set active property
  const setActiveProperty = useCallback((id) => {
    setActivePropertyId(id);
    return loadFinancialData(id);
  }, [loadFinancialData]);
  
  // Filter transactions by date range
  const filterTransactionsByDateRange = useCallback((startDate, endDate) => {
    setDateRange({ start: startDate, end: endDate });
    
    const filtered = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    const filteredCashFlow = calculateCashFlow(filtered);
    const filteredMetrics = calculateFinancialMetrics(filtered);
    const filteredInsights = generateClaraInsights(filtered, filteredCashFlow, filteredMetrics);
    
    return {
      transactions: filtered,
      cashFlow: filteredCashFlow,
      metrics: filteredMetrics,
      insights: filteredInsights
    };
  }, [transactions, calculateCashFlow, calculateFinancialMetrics, generateClaraInsights]);
  
  // Get transactions by category
  const getTransactionsByCategory = useCallback((category) => {
    return transactions.filter(t => t.category === category);
  }, [transactions]);
  
  // Export data for Clara KI context
  const exportForClaraContext = useCallback(() => {
    return {
      summary: {
        totalIncome: cashFlow.income,
        totalExpenses: cashFlow.expenses,
        netCashFlow: cashFlow.netCashFlow,
        profitMargin: cashFlow.profitMargin,
        transactionCount: transactions.length
      },
      insights: claraInsights,
      recentTransactions: transactions.slice(-5),
      metrics: financialMetrics,
      propertyId: activePropertyId
    };
  }, [cashFlow, transactions, claraInsights, financialMetrics, activePropertyId]);
  
  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad && !dataLoaded.current) {
      loadFinancialData();
    }
  }, [autoLoad, loadFinancialData]);
  
  return {
    // State
    transactions,
    cashFlow,
    financialMetrics,
    claraInsights,
    isLoading,
    error,
    activePropertyId,
    dateRange,
    
    // Actions
    loadFinancialData,
    setActiveProperty,
    filterTransactionsByDateRange,
    getTransactionsByCategory,
    
    // Clara Integration
    exportForClaraContext,
    
    // Computed
    hasData: transactions.length > 0,
    isPositiveCashFlow: cashFlow.netCashFlow > 0
  };
}

