// Clara360 Advanced Analytics System
// Erweiterte Business Intelligence für Hausverwaltung
// Basierend auf dem Clara360-Vollprojekt

class ClaraAdvancedAnalytics {
  constructor() {
    this.data = new Map();
    this.charts = new Map();
    this.filters = {
      dateRange: 'last12months',
      property: 'all',
      category: 'all'
    };
    this.realTimeData = {
      totalTransactions: 443,
      totalIncome: 212950.70,
      totalExpenses: 197105.69,
      netIncome: 15845.01,
      totalTenants: 25,
      wgUnits: 5,
      timeRange: "1.1.2024 - 9.6.2025"
    };
    
    this.init();
  }

  async init() {
    await this.loadAnalyticsData();
    this.createAnalyticsPanel();
    this.setupCharts();
    this.startRealTimeUpdates();
    console.log('📊 Clara Advanced Analytics initialisiert');
  }

  async loadAnalyticsData() {
    // Lade echte Daten für Analytics
    if (window.claraDataBridge) {
      try {
        const tenants = await window.claraDataBridge.getTenants();
        const transactions = await window.claraDataBridge.getTransactions();
        const arrears = await window.claraDataBridge.getArrears();
        
        this.data.set('tenants', tenants);
        this.data.set('transactions', transactions);
        this.data.set('arrears', arrears);
        
        // Berechne erweiterte Metriken
        this.calculateAdvancedMetrics();
        
        console.log('📈 Analytics-Daten geladen und verarbeitet');
      } catch (error) {
        console.error('Fehler beim Laden der Analytics-Daten:', error);
      }
    }
  }

  calculateAdvancedMetrics() {
    const transactions = this.data.get('transactions') || [];
    const tenants = this.data.get('tenants') || [];
    
    // Erweiterte KPIs berechnen
    const metrics = {
      // Finanz-KPIs
      totalRevenue: this.calculateTotalRevenue(transactions),
      operatingExpenses: this.calculateOperatingExpenses(transactions),
      netOperatingIncome: 0,
      capRate: this.calculateCapRate(),
      cashOnCashReturn: this.calculateCashOnCashReturn(),
      
      // Mieter-KPIs
      occupancyRate: this.calculateOccupancyRate(tenants),
      averageRent: this.calculateAverageRent(tenants),
      tenantTurnover: this.calculateTenantTurnover(tenants),
      averageTenancy: this.calculateAverageTenancy(tenants),
      
      // Performance-KPIs
      revenuePerUnit: 0,
      expenseRatio: 0,
      maintenanceRatio: this.calculateMaintenanceRatio(transactions),
      
      // Trend-Analysen
      monthlyTrends: this.calculateMonthlyTrends(transactions),
      yearOverYearGrowth: this.calculateYearOverYearGrowth(transactions),
      seasonalPatterns: this.calculateSeasonalPatterns(transactions)
    };
    
    // Berechne abgeleitete Metriken
    metrics.netOperatingIncome = metrics.totalRevenue - metrics.operatingExpenses;
    metrics.revenuePerUnit = tenants.length > 0 ? metrics.totalRevenue / tenants.length : 0;
    metrics.expenseRatio = metrics.totalRevenue > 0 ? (metrics.operatingExpenses / metrics.totalRevenue) * 100 : 0;
    
    this.data.set('metrics', metrics);
  }

  // Berechnungsmethoden für KPIs
  calculateTotalRevenue(transactions) {
    return transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  calculateOperatingExpenses(transactions) {
    return transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }

  calculateCapRate() {
    // Simuliere Cap Rate basierend auf NOI und Immobilienwert
    const estimatedPropertyValue = 2500000; // 2.5M EUR
    const noi = this.realTimeData.netIncome * 12; // Annualisiert
    return estimatedPropertyValue > 0 ? (noi / estimatedPropertyValue) * 100 : 0;
  }

  calculateCashOnCashReturn() {
    // Simuliere Cash-on-Cash Return
    const initialInvestment = 500000; // 500k EUR Eigenkapital
    const annualCashFlow = this.realTimeData.netIncome * 12;
    return initialInvestment > 0 ? (annualCashFlow / initialInvestment) * 100 : 0;
  }

  calculateOccupancyRate(tenants) {
    const totalUnits = 25; // Gesamtanzahl Einheiten
    const occupiedUnits = tenants.filter(t => t.status === 'active' || !t.status).length;
    return totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
  }

  calculateAverageRent(tenants) {
    if (tenants.length === 0) return 0;
    const totalRent = tenants.reduce((sum, tenant) => sum + (tenant.rent || 0), 0);
    return totalRent / tenants.length;
  }

  calculateTenantTurnover(tenants) {
    // Simuliere Fluktuation basierend auf Mieterdaten
    const currentYear = new Date().getFullYear();
    const moveOuts = tenants.filter(t => {
      if (!t.moveOutDate) return false;
      const moveOutYear = new Date(t.moveOutDate).getFullYear();
      return moveOutYear === currentYear;
    });
    
    return tenants.length > 0 ? (moveOuts.length / tenants.length) * 100 : 0;
  }

  calculateAverageTenancy(tenants) {
    const now = new Date();
    const tenancyDurations = tenants.map(tenant => {
      const moveInDate = new Date(tenant.moveInDate || '2020-01-01');
      return Math.floor((now - moveInDate) / (1000 * 60 * 60 * 24 * 30)); // Monate
    });
    
    return tenancyDurations.length > 0 
      ? tenancyDurations.reduce((sum, duration) => sum + duration, 0) / tenancyDurations.length 
      : 0;
  }

  calculateMaintenanceRatio(transactions) {
    const maintenanceExpenses = transactions
      .filter(tx => tx.amount < 0 && (
        tx.description?.toLowerCase().includes('wartung') ||
        tx.description?.toLowerCase().includes('reparatur') ||
        tx.description?.toLowerCase().includes('instandhaltung')
      ))
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const totalRevenue = this.calculateTotalRevenue(transactions);
    return totalRevenue > 0 ? (maintenanceExpenses / totalRevenue) * 100 : 0;
  }

  calculateMonthlyTrends(transactions) {
    const monthlyData = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, net: 0 };
      }
      
      if (tx.amount > 0) {
        monthlyData[monthKey].income += tx.amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(tx.amount);
      }
      
      monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expenses;
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Letzte 12 Monate
      .map(([month, data]) => ({
        month: this.formatMonth(month),
        ...data
      }));
  }

  calculateYearOverYearGrowth(transactions) {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const currentYearRevenue = transactions
      .filter(tx => new Date(tx.date).getFullYear() === currentYear && tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const lastYearRevenue = transactions
      .filter(tx => new Date(tx.date).getFullYear() === lastYear && tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    return lastYearRevenue > 0 ? ((currentYearRevenue - lastYearRevenue) / lastYearRevenue) * 100 : 0;
  }

  calculateSeasonalPatterns(transactions) {
    const seasonalData = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    
    transactions.forEach(tx => {
      if (tx.amount > 0) {
        const month = new Date(tx.date).getMonth() + 1;
        if (month <= 3) seasonalData.Q1 += tx.amount;
        else if (month <= 6) seasonalData.Q2 += tx.amount;
        else if (month <= 9) seasonalData.Q3 += tx.amount;
        else seasonalData.Q4 += tx.amount;
      }
    });
    
    return seasonalData;
  }

  formatMonth(monthKey) {
    const [year, month] = monthKey.split('-');
    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    return `${monthNames[parseInt(month) - 1]} ${year.slice(-2)}`;
  }

  // UI-Erstellung
  createAnalyticsPanel() {
    const panel = document.createElement('div');
    panel.id = 'clara-analytics-panel';
    panel.className = 'analytics-panel hidden';
    panel.innerHTML = `
      <div class="analytics-header">
        <h3>📊 Advanced Analytics</h3>
        <div class="analytics-controls">
          <select class="analytics-filter" id="date-range-filter">
            <option value="last12months">Letzte 12 Monate</option>
            <option value="thisyear">Dieses Jahr</option>
            <option value="lastyear">Letztes Jahr</option>
            <option value="all">Alle Daten</option>
          </select>
          <button class="analytics-refresh">🔄</button>
          <button class="analytics-export">📥</button>
          <button class="analytics-close">×</button>
        </div>
      </div>
      <div class="analytics-content">
        <div class="analytics-tabs">
          <button class="tab-btn active" data-tab="overview">Übersicht</button>
          <button class="tab-btn" data-tab="financial">Finanzen</button>
          <button class="tab-btn" data-tab="tenants">Mieter</button>
          <button class="tab-btn" data-tab="performance">Performance</button>
          <button class="tab-btn" data-tab="forecasting">Prognosen</button>
        </div>
        
        <div class="tab-content" id="overview-tab">
          <div class="kpi-dashboard">
            <div class="kpi-grid">
              <div class="kpi-card">
                <h4>Gesamteinnahmen</h4>
                <div class="kpi-value" id="total-revenue">€ 0</div>
                <div class="kpi-change" id="revenue-change">+0%</div>
              </div>
              <div class="kpi-card">
                <h4>Betriebskosten</h4>
                <div class="kpi-value" id="operating-expenses">€ 0</div>
                <div class="kpi-change" id="expenses-change">+0%</div>
              </div>
              <div class="kpi-card">
                <h4>NOI</h4>
                <div class="kpi-value" id="noi">€ 0</div>
                <div class="kpi-change" id="noi-change">+0%</div>
              </div>
              <div class="kpi-card">
                <h4>Cap Rate</h4>
                <div class="kpi-value" id="cap-rate">0%</div>
                <div class="kpi-change" id="cap-rate-change">+0%</div>
              </div>
              <div class="kpi-card">
                <h4>Auslastung</h4>
                <div class="kpi-value" id="occupancy-rate">0%</div>
                <div class="kpi-change" id="occupancy-change">+0%</div>
              </div>
              <div class="kpi-card">
                <h4>Durchschnittsmiete</h4>
                <div class="kpi-value" id="avg-rent">€ 0</div>
                <div class="kpi-change" id="rent-change">+0%</div>
              </div>
            </div>
            
            <div class="charts-grid">
              <div class="chart-container">
                <h4>Monatliche Trends</h4>
                <canvas id="monthly-trends-chart"></canvas>
              </div>
              <div class="chart-container">
                <h4>Einnahmen vs. Ausgaben</h4>
                <canvas id="income-expenses-chart"></canvas>
              </div>
            </div>
          </div>
        </div>
        
        <div class="tab-content hidden" id="financial-tab">
          <div class="financial-analytics">
            <div class="financial-metrics">
              <h4>Finanz-Performance</h4>
              <div class="metric-row">
                <span>Cash-on-Cash Return:</span>
                <span id="cash-return">0%</span>
              </div>
              <div class="metric-row">
                <span>Expense Ratio:</span>
                <span id="expense-ratio">0%</span>
              </div>
              <div class="metric-row">
                <span>Maintenance Ratio:</span>
                <span id="maintenance-ratio">0%</span>
              </div>
              <div class="metric-row">
                <span>Revenue per Unit:</span>
                <span id="revenue-per-unit">€ 0</span>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Cashflow-Entwicklung</h4>
              <canvas id="cashflow-chart"></canvas>
            </div>
          </div>
        </div>
        
        <div class="tab-content hidden" id="tenants-tab">
          <div class="tenant-analytics">
            <div class="tenant-metrics">
              <h4>Mieter-Statistiken</h4>
              <div class="metric-row">
                <span>Fluktuation:</span>
                <span id="tenant-turnover">0%</span>
              </div>
              <div class="metric-row">
                <span>Durchschnittliche Mietdauer:</span>
                <span id="avg-tenancy">0 Monate</span>
              </div>
              <div class="metric-row">
                <span>Rückstandsquote:</span>
                <span id="arrears-rate">0%</span>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Top Mieter nach Umsatz</h4>
              <canvas id="top-tenants-chart"></canvas>
            </div>
          </div>
        </div>
        
        <div class="tab-content hidden" id="performance-tab">
          <div class="performance-analytics">
            <div class="benchmark-comparison">
              <h4>Benchmark-Vergleich</h4>
              <div class="benchmark-item">
                <span>Cap Rate vs. Markt:</span>
                <span class="benchmark-value positive">+0.8%</span>
              </div>
              <div class="benchmark-item">
                <span>Auslastung vs. Markt:</span>
                <span class="benchmark-value positive">+5.2%</span>
              </div>
              <div class="benchmark-item">
                <span>Miete vs. Markt:</span>
                <span class="benchmark-value negative">-2.1%</span>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Performance-Trends</h4>
              <canvas id="performance-chart"></canvas>
            </div>
          </div>
        </div>
        
        <div class="tab-content hidden" id="forecasting-tab">
          <div class="forecasting-analytics">
            <div class="forecast-summary">
              <h4>12-Monats-Prognose</h4>
              <div class="forecast-item">
                <span>Erwartete Einnahmen:</span>
                <span>€ 255,000</span>
              </div>
              <div class="forecast-item">
                <span>Erwartete Ausgaben:</span>
                <span>€ 236,000</span>
              </div>
              <div class="forecast-item">
                <span>Prognostizierter NOI:</span>
                <span>€ 19,000</span>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Prognose-Modell</h4>
              <canvas id="forecast-chart"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;

    // Event Listeners
    this.bindAnalyticsEvents(panel);
    document.body.appendChild(panel);
  }

  bindAnalyticsEvents(panel) {
    // Close Button
    panel.querySelector('.analytics-close').addEventListener('click', () => {
      panel.classList.add('hidden');
    });

    // Tab Navigation
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        this.switchAnalyticsTab(panel, tabId);
      });
    });

    // Refresh Button
    panel.querySelector('.analytics-refresh').addEventListener('click', () => {
      this.refreshAnalytics();
    });

    // Export Button
    panel.querySelector('.analytics-export').addEventListener('click', () => {
      this.exportAnalytics();
    });

    // Date Range Filter
    panel.querySelector('#date-range-filter').addEventListener('change', (e) => {
      this.filters.dateRange = e.target.value;
      this.refreshAnalytics();
    });
  }

  switchAnalyticsTab(panel, tabId) {
    // Update Tab Buttons
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update Tab Content
    panel.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `${tabId}-tab`);
    });

    // Load tab-specific data
    this.loadTabAnalytics(tabId);
  }

  loadTabAnalytics(tabId) {
    const metrics = this.data.get('metrics');
    if (!metrics) return;

    switch (tabId) {
      case 'overview':
        this.updateOverviewMetrics(metrics);
        break;
      case 'financial':
        this.updateFinancialMetrics(metrics);
        break;
      case 'tenants':
        this.updateTenantMetrics(metrics);
        break;
      case 'performance':
        this.updatePerformanceMetrics(metrics);
        break;
      case 'forecasting':
        this.updateForecastingMetrics(metrics);
        break;
    }
  }

  updateOverviewMetrics(metrics) {
    // Update KPI Cards
    document.getElementById('total-revenue').textContent = `€ ${metrics.totalRevenue.toLocaleString()}`;
    document.getElementById('operating-expenses').textContent = `€ ${metrics.operatingExpenses.toLocaleString()}`;
    document.getElementById('noi').textContent = `€ ${metrics.netOperatingIncome.toLocaleString()}`;
    document.getElementById('cap-rate').textContent = `${metrics.capRate.toFixed(1)}%`;
    document.getElementById('occupancy-rate').textContent = `${metrics.occupancyRate.toFixed(1)}%`;
    document.getElementById('avg-rent').textContent = `€ ${metrics.averageRent.toFixed(0)}`;

    // Update Charts
    this.updateMonthlyTrendsChart(metrics.monthlyTrends);
  }

  updateFinancialMetrics(metrics) {
    document.getElementById('cash-return').textContent = `${metrics.cashOnCashReturn.toFixed(1)}%`;
    document.getElementById('expense-ratio').textContent = `${metrics.expenseRatio.toFixed(1)}%`;
    document.getElementById('maintenance-ratio').textContent = `${metrics.maintenanceRatio.toFixed(1)}%`;
    document.getElementById('revenue-per-unit').textContent = `€ ${metrics.revenuePerUnit.toLocaleString()}`;
  }

  updateTenantMetrics(metrics) {
    document.getElementById('tenant-turnover').textContent = `${metrics.tenantTurnover.toFixed(1)}%`;
    document.getElementById('avg-tenancy').textContent = `${metrics.averageTenancy.toFixed(0)} Monate`;
    
    // Berechne Rückstandsquote
    const arrears = this.data.get('arrears') || [];
    const tenants = this.data.get('tenants') || [];
    const arrearsRate = tenants.length > 0 ? (arrears.length / tenants.length) * 100 : 0;
    document.getElementById('arrears-rate').textContent = `${arrearsRate.toFixed(1)}%`;
  }

  updatePerformanceMetrics(metrics) {
    // Performance-Metriken aktualisieren
    console.log('Performance-Metriken aktualisiert');
  }

  updateForecastingMetrics(metrics) {
    // Prognose-Metriken aktualisieren
    console.log('Prognose-Metriken aktualisiert');
  }

  updateMonthlyTrendsChart(monthlyData) {
    // Vereinfachte Chart-Darstellung (ohne externe Chart-Bibliothek)
    console.log('Monatliche Trends:', monthlyData);
  }

  refreshAnalytics() {
    this.loadAnalyticsData().then(() => {
      const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'overview';
      this.loadTabAnalytics(activeTab);
    });
  }

  exportAnalytics() {
    const metrics = this.data.get('metrics');
    if (!metrics) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      filters: this.filters,
      metrics: metrics,
      realTimeData: this.realTimeData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clara360_analytics_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  startRealTimeUpdates() {
    // Aktualisiere Analytics alle 5 Minuten
    setInterval(() => {
      this.refreshAnalytics();
    }, 300000);
  }

  // Public API
  openAnalyticsPanel() {
    const panel = document.getElementById('clara-analytics-panel');
    if (panel) {
      panel.classList.remove('hidden');
      this.refreshAnalytics();
    }
  }

  getMetrics() {
    return this.data.get('metrics');
  }

  generateReport() {
    const metrics = this.data.get('metrics');
    if (!metrics) return null;

    return {
      summary: {
        totalRevenue: metrics.totalRevenue,
        netOperatingIncome: metrics.netOperatingIncome,
        capRate: metrics.capRate,
        occupancyRate: metrics.occupancyRate
      },
      recommendations: this.generateRecommendations(metrics),
      timestamp: new Date().toISOString()
    };
  }

  generateRecommendations(metrics) {
    const recommendations = [];

    if (metrics.capRate < 4) {
      recommendations.push('Cap Rate ist niedrig - prüfen Sie Mieterhöhungsmöglichkeiten');
    }

    if (metrics.expenseRatio > 50) {
      recommendations.push('Expense Ratio ist hoch - analysieren Sie Kosteneinsparungen');
    }

    if (metrics.occupancyRate < 95) {
      recommendations.push('Auslastung kann verbessert werden - optimieren Sie Marketing');
    }

    return recommendations;
  }
}

// CSS für Analytics Panel
const analyticsCSS = `
.analytics-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 95%;
  max-width: 1200px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1002;
  overflow: hidden;
}

.analytics-panel.hidden {
  display: none;
}

.analytics-header {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analytics-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.analytics-filter {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.analytics-controls button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.analytics-content {
  padding: 1rem;
  max-height: 75vh;
  overflow-y: auto;
}

.analytics-tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.tab-btn.active {
  border-bottom-color: #059669;
  color: #059669;
  font-weight: 600;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.kpi-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.kpi-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.kpi-change {
  font-size: 12px;
  font-weight: 600;
  color: #10b981;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.chart-container {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.chart-container h4 {
  margin: 0 0 1rem 0;
  font-size: 16px;
  color: #374151;
}

.financial-metrics, .tenant-metrics {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.metric-row:last-child {
  border-bottom: none;
}

.benchmark-comparison {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.benchmark-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.benchmark-value.positive {
  color: #10b981;
  font-weight: 600;
}

.benchmark-value.negative {
  color: #ef4444;
  font-weight: 600;
}

.forecast-summary {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.forecast-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .analytics-panel {
    width: 98%;
    max-height: 95vh;
  }
  
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-tabs {
    flex-wrap: wrap;
  }
}
`;

// CSS injizieren
const analyticsStyle = document.createElement('style');
analyticsStyle.textContent = analyticsCSS;
document.head.appendChild(analyticsStyle);

// Auto-Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.claraAnalytics = new ClaraAdvancedAnalytics();
    console.log('📊 Clara Advanced Analytics bereit');
  }, 5000);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaraAdvancedAnalytics;
}

