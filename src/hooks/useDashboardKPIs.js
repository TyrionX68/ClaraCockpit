// useDashboardKPIs.js
// React hook for dashboard KPIs in Clara360
// Manus A compliant implementation

import { useState, useEffect, useCallback } from 'react'
import csvDataLoader from '@/utils/csvDataLoader'
import { usePropertyContext } from './usePropertyContext'
import { useFinancialAnalytics } from './useFinancialAnalytics'

/**
 * React hook for dashboard KPIs in Clara360
 * @param {Object} options - Configuration options
 * @param {string} options.propertyId - Property identifier (optional)
 * @param {boolean} options.autoLoad - Whether to automatically load data on mount
 * @param {Function} options.onKPIUpdate - Callback when KPIs are updated
 * @returns {Object} Dashboard KPIs and state
 */
export function useDashboardKPIs(options = {}) {
  const {
    propertyId = null,
    autoLoad = true,
    onKPIUpdate = null
  } = options
  
  // State
  const [kpis, setKpis] = useState({
    financial: {},
    occupancy: {},
    maintenance: {},
    trends: {}
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activePropertyId, setActivePropertyId] = useState(propertyId)
  
  // Use property context and financial analytics hooks
  const propertyContext = usePropertyContext({
    propertyId: activePropertyId,
    autoLoad: autoLoad
  })
  
  const financialAnalytics = useFinancialAnalytics({
    propertyId: activePropertyId,
    autoLoad: autoLoad
  })
  
  // Load KPI data
  const loadKPIData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Wait for property and financial data to load
      if (propertyContext.isLoading || financialAnalytics.isLoading) {
        return false
      }
      
      // Check if property and financial data are available
      if (!propertyContext.propertyData || !financialAnalytics.cashFlow.total) {
        setError('Property or financial data not available')
        setIsLoading(false)
        return false
      }
      
      // Calculate KPIs
      const calculatedKPIs = calculateKPIs(
        propertyContext.propertyData,
        propertyContext.units,
        financialAnalytics.cashFlow,
        financialAnalytics.metrics,
        financialAnalytics.trends
      )
      
      setKpis(calculatedKPIs)
      setIsLoading(false)
      
      // Call update callback if provided
      if (onKPIUpdate && typeof onKPIUpdate === 'function') {
        onKPIUpdate(calculatedKPIs)
      }
      
      return true
    } catch (err) {
      setError(err.message || 'Failed to load KPI data')
      setIsLoading(false)
      return false
    }
  }, [propertyContext, financialAnalytics, onKPIUpdate])
  
  // Calculate KPIs
  const calculateKPIs = useCallback((propertyData, units, cashFlow, metrics, trends) => {
    // Financial KPIs
    const financial = {
      monthlyRent: cashFlow.total.income || 0,
      netCashFlow: cashFlow.total.netCashFlow || 0,
      portfolioValue: parseFloat(propertyData.value) || 0,
      annualROI: metrics.netRentalYield || 0,
      grossRentYield: metrics.grossRentalYield || 0,
      valueAppreciation: calculateValueAppreciation(propertyData)
    }
    
    // Occupancy KPIs
    const occupancy = {
      totalUnits: units.total || 0,
      occupiedUnits: units.occupied || 0,
      vacantUnits: units.vacant || 0,
      occupancyRate: units.total > 0 ? (units.occupied / units.total) * 100 : 0
    }
    
    // Maintenance KPIs
    const maintenance = {
      openTasks: calculateOpenTasks(activePropertyId),
      criticalTasks: calculateCriticalTasks(activePropertyId),
      maintenanceRatio: metrics.maintenanceRatio || 0,
      averageResolutionTime: calculateAverageResolutionTime(activePropertyId)
    }
    
    // Trend KPIs
    const trendKPIs = {
      rentTrend: trends.overall?.incomeTrend || 0,
      expenseTrend: trends.overall?.expensesTrend || 0,
      cashFlowTrend: trends.overall?.netCashFlowTrend || 0,
      occupancyTrend: calculateOccupancyTrend(activePropertyId)
    }
    
    return {
      financial,
      occupancy,
      maintenance,
      trends: trendKPIs
    }
  }, [activePropertyId])
  
  // Calculate value appreciation
  const calculateValueAppreciation = useCallback((propertyData) => {
    const currentValue = parseFloat(propertyData.value) || 0
    const purchasePrice = parseFloat(propertyData.purchasePrice) || 0
    
    if (purchasePrice <= 0) {
      return {
        amount: 0,
        percentage: 0
      }
    }
    
    const appreciationAmount = currentValue - purchasePrice
    const appreciationPercentage = (appreciationAmount / purchasePrice) * 100
    
    return {
      amount: appreciationAmount,
      percentage: appreciationPercentage
    }
  }, [])
  
  // Calculate open maintenance tasks
  const calculateOpenTasks = useCallback((propertyId) => {
    try {
      const maintenanceTasks = csvDataLoader.getMaintenanceData() || []
      
      return maintenanceTasks.filter(task => 
        task.propertyId === propertyId && 
        task.status !== 'completed' && 
        task.status !== 'cancelled'
      ).length
    } catch (err) {
      return 0
    }
  }, [])
  
  // Calculate critical maintenance tasks
  const calculateCriticalTasks = useCallback((propertyId) => {
    try {
      const maintenanceTasks = csvDataLoader.getMaintenanceData() || []
      
      return maintenanceTasks.filter(task => 
        task.propertyId === propertyId && 
        task.priority === 'high' && 
        task.status !== 'completed' && 
        task.status !== 'cancelled'
      ).length
    } catch (err) {
      return 0
    }
  }, [])
  
  // Calculate average resolution time for maintenance tasks
  const calculateAverageResolutionTime = useCallback((propertyId) => {
    try {
      const maintenanceTasks = csvDataLoader.getMaintenanceData() || []
      
      const completedTasks = maintenanceTasks.filter(task => 
        task.propertyId === propertyId && 
        task.status === 'completed' &&
        task.createdAt &&
        task.completedAt
      )
      
      if (completedTasks.length === 0) {
        return 0
      }
      
      const totalResolutionTime = completedTasks.reduce((sum, task) => {
        const createdDate = new Date(task.createdAt)
        const completedDate = new Date(task.completedAt)
        const resolutionTime = (completedDate - createdDate) / (1000 * 60 * 60 * 24) // days
        
        return sum + resolutionTime
      }, 0)
      
      return totalResolutionTime / completedTasks.length
    } catch (err) {
      return 0
    }
  }, [])
  
  // Calculate occupancy trend
  const calculateOccupancyTrend = useCallback((propertyId) => {
    try {
      const occupancyHistory = csvDataLoader.getOccupancyHistoryData() || []
      
      const propertyHistory = occupancyHistory.filter(entry => 
        entry.propertyId === propertyId
      ).sort((a, b) => new Date(a.date) - new Date(b.date))
      
      if (propertyHistory.length < 2) {
        return 0
      }
      
      const firstEntry = propertyHistory[0]
      const lastEntry = propertyHistory[propertyHistory.length - 1]
      
      const firstOccupancyRate = firstEntry.occupiedUnits / firstEntry.totalUnits * 100
      const lastOccupancyRate = lastEntry.occupiedUnits / lastEntry.totalUnits * 100
      
      return lastOccupancyRate - firstOccupancyRate
    } catch (err) {
      return 0
    }
  }, [])
  
  // Set active property
  const setActiveProperty = useCallback((id) => {
    setActivePropertyId(id)
    propertyContext.setActiveProperty(id)
    financialAnalytics.setActiveProperty(id)
    return true
  }, [propertyContext, financialAnalytics])
  
  // Get KPI context for KI-Chat
  const getKPIContext = useCallback(() => {
    if (!kpis.financial || !kpis.occupancy) {
      return null
    }
    
    return {
      financial: kpis.financial,
      occupancy: kpis.occupancy,
      maintenance: kpis.maintenance,
      trends: kpis.trends
    }
  }, [kpis])
  
  // Auto-load data when property or financial data changes
  useEffect(() => {
    if (autoLoad && !propertyContext.isLoading && !financialAnalytics.isLoading) {
      loadKPIData()
    }
  }, [
    autoLoad, 
    propertyContext.propertyData, 
    financialAnalytics.cashFlow, 
    propertyContext.isLoading, 
    financialAnalytics.isLoading, 
    loadKPIData
  ])
  
  // Return hook API
  return {
    kpis,
    isLoading: isLoading || propertyContext.isLoading || financialAnalytics.isLoading,
    error: error || propertyContext.error || financialAnalytics.error,
    activePropertyId,
    setActiveProperty,
    loadKPIData,
    getKPIContext
  }
}

export default useDashboardKPIs
