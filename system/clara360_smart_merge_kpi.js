// Clara360 Smart-Merge KPI Integration v1.0
// Live Banking Data Integration with Fallback Strategy

class Clara360SmartMergeKPI {
  constructor() {
    this.isLiveDataAvailable = false;
    this.lastUpdate = null;
    this.fallbackData = this.getDefaultKPIData();
    this.liveData = null;
    
    console.log('🔄 Clara360 Smart-Merge KPI System initialized');
    this.init();
  }
  
  // Initialize the Smart-Merge system
  async init() {
    try {
      // Check if banking integration is available
      if (window.bankingIntegration) {
        console.log('✅ Banking Integration v' + window.bankingIntegration.version + ' detected');
        await this.loadLiveBankingData();
      } else {
        console.log('⚠️ Banking Integration not available - using fallback data');
      }
      
      // Start periodic updates
      this.startPeriodicUpdates();
      
      // Initial KPI update
      this.updateAllKPIs();
      
    } catch (error) {
      console.error('❌ Smart-Merge initialization failed:', error);
      this.updateAllKPIs(); // Use fallback data
    }
  }
  
  // Load live banking data from FinAPI
  async loadLiveBankingData() {
    try {
      console.log('📡 Loading live banking data...');
      
      // Test backend connection
      const healthResponse = await fetch('/api/finapi/status');
      if (!healthResponse.ok) {
        throw new Error('Backend not available');
      }
      
      // Get live banking data
      const bankingResponse = await fetch('/api/banking/data');
      if (bankingResponse.ok) {
        const bankingData = await bankingResponse.json();
        
        if (bankingData.accounts && bankingData.transactions) {
          this.liveData = this.calculateKPIsFromBankingData(bankingData);
          this.isLiveDataAvailable = true;
          this.lastUpdate = new Date().toISOString();
          
          console.log('✅ Live banking data loaded successfully');
          console.log('📊 Live KPIs calculated:', this.liveData);
        } else {
          throw new Error('Invalid banking data structure');
        }
      } else {
        throw new Error('Banking API not responding');
      }
      
    } catch (error) {
      console.error('❌ Failed to load live banking data:', error);
      this.isLiveDataAvailable = false;
      this.liveData = null;
    }
  }
  
  // Calculate KPIs from live banking data
  calculateKPIsFromBankingData(bankingData) {
    const { accounts, transactions } = bankingData;
    
    // Calculate total liquidity from all accounts
    const totalLiquidity = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
    
    // Calculate monthly income from transactions
    const currentMonth = new Date().toISOString().substring(0, 7);
    const monthlyTransactions = transactions.filter(tx => 
      tx.bookingDate && tx.bookingDate.startsWith(currentMonth)
    );
    
    const monthlyIncome = monthlyTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const monthlyCashflow = monthlyIncome - monthlyExpenses;
    
    // Calculate yearly return (simplified)
    const yearlyIncome = monthlyIncome * 12;
    const yearlyReturn = totalLiquidity > 0 ? (yearlyIncome / totalLiquidity) * 100 : 0;
    
    return {
      totalLiquidity: totalLiquidity,
      monthlyIncome: monthlyIncome,
      monthlyExpenses: monthlyExpenses,
      monthlyCashflow: monthlyCashflow,
      yearlyReturn: yearlyReturn,
      transactionCount: monthlyTransactions.length,
      lastCalculated: new Date().toISOString()
    };
  }
  
  // Get default/fallback KPI data
  getDefaultKPIData() {
    return {
      totalLiquidity: 52320, // From current dashboard
      monthlyIncome: 8360,
      monthlyExpenses: 1200,
      monthlyCashflow: 7160,
      yearlyReturn: 8.4,
      transactionCount: 156,
      lastCalculated: new Date().toISOString()
    };
  }
  
  // Smart-Merge: Get best available data
  getCurrentKPIData() {
    if (this.isLiveDataAvailable && this.liveData) {
      console.log('📊 Using live banking data');
      return {
        ...this.liveData,
        dataSource: 'live',
        isLive: true
      };
    } else {
      console.log('📊 Using fallback data');
      return {
        ...this.fallbackData,
        dataSource: 'fallback',
        isLive: false
      };
    }
  }
  
  // Update all KPI elements on the dashboard
  updateAllKPIs() {
    const kpiData = this.getCurrentKPIData();
    
    try {
      // Update monthly rent/income
      this.updateKPIElement('monthlyIncome', `+${this.formatCurrency(kpiData.monthlyIncome)}`);
      
      // Update monthly expenses
      this.updateKPIElement('monthlyExpenses', `-${this.formatCurrency(kpiData.monthlyExpenses)}`);
      
      // Update yearly return
      this.updateKPIElement('yearlyReturn', `${kpiData.yearlyReturn.toFixed(1)}%`);
      
      // Update liquidity
      this.updateKPIElement('liquidity', this.formatCurrency(kpiData.totalLiquidity));
      
      // Update transaction count
      this.updateKPIElement('transactionCount', kpiData.transactionCount.toString());
      
      // Update data source indicator
      this.updateDataSourceIndicator(kpiData.dataSource, kpiData.isLive);
      
      console.log(`✅ KPIs updated with ${kpiData.dataSource} data`);
      
    } catch (error) {
      console.error('❌ Failed to update KPIs:', error);
    }
  }
  
  // Update individual KPI element
  updateKPIElement(kpiType, value) {
    // Find elements by text content (Smart-Merge approach)
    const allElements = document.querySelectorAll('*');
    
    Array.from(allElements).forEach(el => {
      const text = el.textContent?.trim();
      
      switch (kpiType) {
        case 'monthlyIncome':
          if (text === '+8.360€' || text === '+8360€') {
            el.textContent = value;
            el.style.color = '#10B981'; // Green for income
          }
          break;
          
        case 'monthlyExpenses':
          if (text === '-1.200€' || text === '-1200€') {
            el.textContent = value;
            el.style.color = '#EF4444'; // Red for expenses
          }
          break;
          
        case 'yearlyReturn':
          if (text === '8.4%') {
            el.textContent = value;
            el.style.color = '#3B82F6'; // Blue for return
          }
          break;
          
        case 'liquidity':
          if (text === '52.320€' || text === '52320€') {
            el.textContent = this.formatCurrency(value);
            el.style.color = '#6366F1'; // Indigo for liquidity
          }
          break;
          
        case 'transactionCount':
          if (text === '156' && el.closest('*:contains("Transaktionen")')) {
            el.textContent = value;
          }
          break;
      }
    });
  }
  
  // Update data source indicator
  updateDataSourceIndicator(source, isLive) {
    // Create or update status indicator
    let indicator = document.getElementById('kpi-data-source-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'kpi-data-source-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;
      document.body.appendChild(indicator);
    }
    
    if (isLive) {
      indicator.textContent = '🟢 Live-Daten aktiv';
      indicator.style.backgroundColor = '#10B981';
      indicator.style.color = 'white';
    } else {
      indicator.textContent = '🟡 Fallback-Daten';
      indicator.style.backgroundColor = '#F59E0B';
      indicator.style.color = 'white';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (indicator) {
        indicator.style.opacity = '0.7';
      }
    }, 5000);
  }
  
  // Format currency values
  formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  // Start periodic updates
  startPeriodicUpdates() {
    // Update every 5 minutes
    setInterval(async () => {
      console.log('🔄 Periodic KPI update...');
      await this.loadLiveBankingData();
      this.updateAllKPIs();
    }, 5 * 60 * 1000);
    
    // Listen for banking data updates
    document.addEventListener('bankingDataUpdated', (event) => {
      console.log('📡 Banking data update event received');
      this.loadLiveBankingData().then(() => {
        this.updateAllKPIs();
      });
    });
  }
  
  // Manual refresh function
  async refresh() {
    console.log('🔄 Manual KPI refresh triggered');
    await this.loadLiveBankingData();
    this.updateAllKPIs();
  }
  
  // Get current status
  getStatus() {
    return {
      isLiveDataAvailable: this.isLiveDataAvailable,
      lastUpdate: this.lastUpdate,
      dataSource: this.isLiveDataAvailable ? 'live' : 'fallback',
      kpiData: this.getCurrentKPIData()
    };
  }
}

// Initialize Smart-Merge KPI system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.clara360SmartMergeKPI = new Clara360SmartMergeKPI();
});

// Make it globally available
window.Clara360SmartMergeKPI = Clara360SmartMergeKPI;

console.log('📦 Clara360 Smart-Merge KPI Integration loaded');

