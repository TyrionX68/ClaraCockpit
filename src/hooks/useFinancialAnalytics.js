// useFinancialAnalytics.js
// React hook for property financial analytics and interpretation
// Manus A compliant implementation

import { useState, useEffect, useCallback, useRef } from 'react'
import csvDataLoader from '@/utils/csvDataLoader'
import { usePropertyContext } from './usePropertyContext'

/**
 * React hook for property financial analytics and interpretation
 * @param {Object} options - Configuration options
 * @param {string} options.propertyId - Property identifier (optional)
 * @param {boolean} options.autoLoad - Whether to automatically load financial data on mount
 * @param {string} options.transactionsSource - Data source for financial transactions (default: 'transactions')
 * @param {Function} options.onDataLoaded - Callback when data is loaded
 * @returns {Object} Financial analytics methods and state
 */
export function useFinancialAnalytics(options = {}) {
  const {
    propertyId = null,
    autoLoad = true,
    transactionsSource = 'transactions',
    onDataLoaded = null
  } = options
  
  // State
  const [transactions, setTransactions] = useState([])
  const [cashFlow, setCashFlow] = useState({})
  const [financialMetrics, setFinancialMetrics] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activePropertyId, setActivePropertyId] = useState(propertyId)
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    end: new Date()
  })
  
  // Refs
  const dataLoaded = useRef(false)
  
  // Use property context if available
  const propertyContext = usePropertyContext({
    propertyId: activePropertyId,
    autoLoad: false
  })
  
  // Load financial data
  const loadFinancialData = useCallback(async (id = null) => {
    const targetId = id || activePropertyId
    
    if (!targetId) {
      console.warn('No property ID provided')
      return false
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      await csvDataLoader.loadAllData()
      
      // Get transactions data
      const transactionsData = csvDataLoader.getData(transactionsSource) || []
      
      // Filter transactions for the specific property
      const propertyTransactions = transactionsData.filter(t => t.propertyId === targetId)
      setTransactions(propertyTransactions)
      
      // Calculate cash flow
      const calculatedCashFlow = calculateCashFlow(propertyTransactions)
      setCashFlow(calculatedCashFlow)
      
      // Calculate financial metrics
      const calculatedMetrics = calculateFinancialMetrics(propertyTransactions, targetId)
      setFinancialMetrics(calculatedMetrics)
      
      dataLoaded.current = true
      
      // Call onDataLoaded callback if provided
      if (onDataLoaded && typeof onDataLoaded === 'function') {
        onDataLoaded({
          transactions: propertyTransactions,
          cashFlow: calculatedCashFlow,
          metrics: calculatedMetrics
        })
      }
      
      setIsLoading(false)
      return true
    } catch (err) {
      setError(err.message || 'Failed to load financial data')
      setIsLoading(false)
      return false
    }
  }, [activePropertyId, transactionsSource, onDataLoaded])
  
  // Set active property
  const setActiveProperty = useCallback((id) => {
    setActivePropertyId(id)
    return loadFinancialData(id)
  }, [loadFinancialData])
  
  // Set date range
  const setAnalysisDateRange = useCallback((start, end) => {
    setDateRange({ start, end })
    
    // Recalculate with new date range
    if (transactions.length > 0) {
      const filteredTransactions = filterTransactionsByDate(transactions, start, end)
      const calculatedCashFlow = calculateCashFlow(filteredTransactions)
      setCashFlow(calculatedCashFlow)
      
      const calculatedMetrics = calculateFinancialMetrics(filteredTransactions, activePropertyId)
      setFinancialMetrics(calculatedMetrics)
    }
  }, [transactions, activePropertyId])
  
  // Filter transactions by date
  const filterTransactionsByDate = useCallback((transactionList, start, end) => {
    return transactionList.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= start && transactionDate <= end
    })
  }, [])
  
  // Calculate cash flow
  const calculateCashFlow = useCallback((transactionList) => {
    // Group by month
    const monthlyData = {}
    
    transactionList.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          income: 0,
          expenses: 0,
          netCashFlow: 0,
          transactions: []
        }
      }
      
      const amount = parseFloat(transaction.amount || 0)
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += amount
        monthlyData[monthKey].netCashFlow += amount
      } else if (transaction.type === 'expense') {
        monthlyData[monthKey].expenses += amount
        monthlyData[monthKey].netCashFlow -= amount
      }
      
      monthlyData[monthKey].transactions.push(transaction)
    })
    
    // Convert to array and sort by date
    const monthlyArray = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month))
    
    // Calculate totals
    const totalIncome = transactionList.reduce((sum, t) => 
      t.type === 'income' ? sum + parseFloat(t.amount || 0) : sum, 0)
    
    const totalExpenses = transactionList.reduce((sum, t) => 
      t.type === 'expense' ? sum + parseFloat(t.amount || 0) : sum, 0)
    
    const netCashFlow = totalIncome - totalExpenses
    
    // Calculate by category
    const incomeByCategory = {}
    const expensesByCategory = {}
    
    transactionList.forEach(transaction => {
      const amount = parseFloat(transaction.amount || 0)
      const category = transaction.category || 'uncategorized'
      
      if (transaction.type === 'income') {
        incomeByCategory[category] = (incomeByCategory[category] || 0) + amount
      } else if (transaction.type === 'expense') {
        expensesByCategory[category] = (expensesByCategory[category] || 0) + amount
      }
    })
    
    return {
      monthly: monthlyArray,
      total: {
        income: totalIncome,
        expenses: totalExpenses,
        netCashFlow
      },
      incomeByCategory,
      expensesByCategory
    }
  }, [])
  
  // Calculate financial metrics
  const calculateFinancialMetrics = useCallback((transactionList, id) => {
    // Get property data if available
    const property = propertyContext.properties.find(p => p.id === id)
    const propertyValue = property ? parseFloat(property.value || 0) : 0
    
    // Calculate annual values
    const annualIncome = transactionList.reduce((sum, t) => 
      t.type === 'income' ? sum + parseFloat(t.amount || 0) : sum, 0)
    
    const annualExpenses = transactionList.reduce((sum, t) => 
      t.type === 'expense' ? sum + parseFloat(t.amount || 0) : sum, 0)
    
    const noi = annualIncome - annualExpenses
    
    // Calculate metrics
    const capRate = propertyValue > 0 ? (noi / propertyValue) * 100 : 0
    const cashOnCash = property && property.initialInvestment ? 
      (noi / parseFloat(property.initialInvestment)) * 100 : 0
    
    const expenseRatio = annualIncome > 0 ? (annualExpenses / annualIncome) * 100 : 0
    
    // Calculate maintenance expenses
    const maintenanceExpenses = transactionList.reduce((sum, t) => 
      (t.type === 'expense' && t.category === 'maintenance') ? 
        sum + parseFloat(t.amount || 0) : sum, 0)
    
    const maintenanceRatio = annualIncome > 0 ? 
      (maintenanceExpenses / annualIncome) * 100 : 0
    
    // Calculate vacancy loss if available
    const vacancyLoss = transactionList.reduce((sum, t) => 
      (t.type === 'expense' && t.category === 'vacancy') ? 
        sum + parseFloat(t.amount || 0) : sum, 0)
    
    const vacancyRate = annualIncome > 0 ? 
      (vacancyLoss / (annualIncome + vacancyLoss)) * 100 : 0
    
    return {
      noi,
      capRate,
      cashOnCash,
      expenseRatio,
      maintenanceRatio,
      vacancyRate,
      grossRentalYield: propertyValue > 0 ? (annualIncome / propertyValue) * 100 : 0,
      netRentalYield: propertyValue > 0 ? (noi / propertyValue) * 100 : 0,
      debtServiceCoverageRatio: property && property.annualDebtService ? 
        noi / parseFloat(property.annualDebtService) : null
    }
  }, [propertyContext.properties])
  
  // Get transactions by category
  const getTransactionsByCategory = useCallback((category, type = null) => {
    if (!category) {
      return []
    }
    
    return transactions.filter(t => {
      const categoryMatch = t.category === category
      const typeMatch = type ? t.type === type : true
      return categoryMatch && typeMatch
    })
  }, [transactions])
  
  // Get transactions by date range
  const getTransactionsByDateRange = useCallback((start, end) => {
    return filterTransactionsByDate(transactions, start, end)
  }, [transactions, filterTransactionsByDate])
  
  // Get financial trends
  const getFinancialTrends = useCallback(() => {
    if (!cashFlow.monthly || cashFlow.monthly.length === 0) {
      return null
    }
    
    // Calculate month-over-month changes
    const trends = cashFlow.monthly.map((month, index, array) => {
      if (index === 0) {
        return {
          month: month.month,
          incomeChange: 0,
          expensesChange: 0,
          netCashFlowChange: 0
        }
      }
      
      const prevMonth = array[index - 1]
      
      const incomeChange = prevMonth.income > 0 ?
        ((month.income - prevMonth.income) / prevMonth.income) * 100 : 0
      
      const expensesChange = prevMonth.expenses > 0 ?
        ((month.expenses - prevMonth.expenses) / prevMonth.expenses) * 100 : 0
      
      const netCashFlowChange = prevMonth.netCashFlow !== 0 ?
        ((month.netCashFlow - prevMonth.netCashFlow) / Math.abs(prevMonth.netCashFlow)) * 100 : 0
      
      return {
        month: month.month,
        incomeChange,
        expensesChange,
        netCashFlowChange
      }
    })
    
    // Calculate overall trend
    const firstMonth = cashFlow.monthly[0]
    const lastMonth = cashFlow.monthly[cashFlow.monthly.length - 1]
    
    const overallIncomeTrend = firstMonth.income > 0 ?
      ((lastMonth.income - firstMonth.income) / firstMonth.income) * 100 : 0
    
    const overallExpensesTrend = firstMonth.expenses > 0 ?
      ((lastMonth.expenses - firstMonth.expenses) / firstMonth.expenses) * 100 : 0
    
    const overallNetCashFlowTrend = firstMonth.netCashFlow !== 0 ?
      ((lastMonth.netCashFlow - firstMonth.netCashFlow) / Math.abs(firstMonth.netCashFlow)) * 100 : 0
    
    return {
      monthly: trends,
      overall: {
        incomeTrend: overallIncomeTrend,
        expensesTrend: overallExpensesTrend,
        netCashFlowTrend: overallNetCashFlowTrend
      }
    }
  }, [cashFlow])
  
  // Get financial insights
  const getFinancialInsights = useCallback(() => {
    if (!financialMetrics || !cashFlow.total) {
      return []
    }
    
    const insights = []
    
    // Cash flow insights
    if (cashFlow.total.netCashFlow > 0) {
      insights.push({
        type: 'positive',
        category: 'cash_flow',
        message: 'Property is cash flow positive',
        metric: 'netCashFlow',
        value: cashFlow.total.netCashFlow
      })
    } else if (cashFlow.total.netCashFlow < 0) {
      insights.push({
        type: 'negative',
        category: 'cash_flow',
        message: 'Property is cash flow negative',
        metric: 'netCashFlow',
        value: cashFlow.total.netCashFlow
      })
    }
    
    // Expense ratio insights
    if (financialMetrics.expenseRatio > 50) {
      insights.push({
        type: 'negative',
        category: 'expenses',
        message: 'Expense ratio is high',
        metric: 'expenseRatio',
        value: financialMetrics.expenseRatio
      })
    } else if (financialMetrics.expenseRatio < 30) {
      insights.push({
        type: 'positive',
        category: 'expenses',
        message: 'Expense ratio is low',
        metric: 'expenseRatio',
        value: financialMetrics.expenseRatio
      })
    }
    
    // Maintenance ratio insights
    if (financialMetrics.maintenanceRatio > 15) {
      insights.push({
        type: 'negative',
        category: 'maintenance',
        message: 'Maintenance costs are high',
        metric: 'maintenanceRatio',
        value: financialMetrics.maintenanceRatio
      })
    } else if (financialMetrics.maintenanceRatio < 5) {
      insights.push({
        type: 'positive',
        category: 'maintenance',
        message: 'Maintenance costs are low',
        metric: 'maintenanceRatio',
        value: financialMetrics.maintenanceRatio
      })
    }
    
    // Cap rate insights
    if (financialMetrics.capRate > 8) {
      insights.push({
        type: 'positive',
        category: 'returns',
        message: 'Cap rate is above market average',
        metric: 'capRate',
        value: financialMetrics.capRate
      })
    } else if (financialMetrics.capRate < 4) {
      insights.push({
        type: 'negative',
        category: 'returns',
        message: 'Cap rate is below market average',
        metric: 'capRate',
        value: financialMetrics.capRate
      })
    }
    
    // Vacancy rate insights
    if (financialMetrics.vacancyRate > 10) {
      insights.push({
        type: 'negative',
        category: 'vacancy',
        message: 'Vacancy rate is high',
        metric: 'vacancyRate',
        value: financialMetrics.vacancyRate
      })
    } else if (financialMetrics.vacancyRate < 3) {
      insights.push({
        type: 'positive',
        category: 'vacancy',
        message: 'Vacancy rate is low',
        metric: 'vacancyRate',
        value: financialMetrics.vacancyRate
      })
    }
    
    // Debt service coverage ratio insights
    if (financialMetrics.debtServiceCoverageRatio) {
      if (financialMetrics.debtServiceCoverageRatio < 1.2) {
        insights.push({
          type: 'negative',
          category: 'debt',
          message: 'Debt service coverage ratio is low',
          metric: 'debtServiceCoverageRatio',
          value: financialMetrics.debtServiceCoverageRatio
        })
      } else if (financialMetrics.debtServiceCoverageRatio > 1.5) {
        insights.push({
          type: 'positive',
          category: 'debt',
          message: 'Debt service coverage ratio is strong',
          metric: 'debtServiceCoverageRatio',
          value: financialMetrics.debtServiceCoverageRatio
        })
      }
    }
    
    return insights
  }, [financialMetrics, cashFlow])
  
  // Get financial context for KI-Chat
  const getFinancialContext = useCallback(() => {
    if (!activePropertyId || !cashFlow.total) {
      return null
    }
    
    const trends = getFinancialTrends()
    const insights = getFinancialInsights()
    
    return {
      cashFlow: {
        monthly: cashFlow.monthly.map(m => ({
          month: m.month,
          income: m.income,
          expenses: m.expenses,
          netCashFlow: m.netCashFlow
        })),
        total: cashFlow.total,
        topIncomeCategories: Object.entries(cashFlow.incomeByCategory || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([category, amount]) => ({ category, amount })),
        topExpenseCategories: Object.entries(cashFlow.expensesByCategory || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([category, amount]) => ({ category, amount }))
      },
      metrics: financialMetrics,
      trends: trends ? {
        overall: trends.overall,
        recentMonths: trends.monthly.slice(-3)
      } : null,
      insights: {
        positive: insights.filter(i => i.type === 'positive'),
        negative: insights.filter(i => i.type === 'negative'),
        top: insights.slice(0, 3)
      },
      dateRange: {
        start: dateRange.start.toISOString().split('T')[0],
        end: dateRange.end.toISOString().split('T')[0],
        periodLength: Math.round((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24))
      }
    }
  }, [
    activePropertyId, 
    cashFlow, 
    financialMetrics, 
    dateRange, 
    getFinancialTrends, 
    getFinancialInsights
  ])
  
  // Auto-load financial data on mount
  useEffect(() => {
    if (autoLoad && activePropertyId && !dataLoaded.current) {
      loadFinancialData()
    }
  }, [autoLoad, activePropertyId, loadFinancialData])
  
  // Return hook API
  return {
    transactions,
    cashFlow,
    financialMetrics,
    isLoading,
    error,
    activePropertyId,
    dateRange,
    loadFinancialData,
    setActiveProperty,
    setAnalysisDateRange,
    getTransactionsByCategory,
    getTransactionsByDateRange,
    getFinancialTrends,
    getFinancialInsights,
    getFinancialContext
  }
}

export default useFinancialAnalytics
