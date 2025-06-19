// Clara360 Proactive AI Insights Engine
// Intelligente Vorhersagen und Empfehlungen für Hausverwaltung
// Basierend auf dem Clara360-Vollprojekt

class ClaraProactiveInsights {
  constructor() {
    this.insights = [];
    this.dismissedInsights = [];
    this.historicalData = new Map();
    this.thresholds = {
      cashFlow: { critical: -500, warning: 0 },
      expenseRatio: { critical: 60, warning: 45 },
      occupancyRate: { critical: 80, warning: 90 },
      maintenanceRatio: { critical: 20, warning: 15 },
      rentIncrease: { opportunity: 5, warning: 10 }
    };
    this.patterns = new Map();
    this.predictions = new Map();
    
    this.init();
  }

  async init() {
    await this.loadHistoricalData();
    this.setupDataMonitoring();
    this.createInsightsPanel();
    this.startAnalysisLoop();
    console.log('🔮 Clara Proactive Insights initialisiert');
  }

  async loadHistoricalData() {
    // Lade lokale Daten für Analyse
    if (window.claraDataBridge) {
      try {
        const tenants = await window.claraDataBridge.getTenants();
        const transactions = await window.claraDataBridge.getTransactions();
        const arrears = await window.claraDataBridge.getArrears();
        
        this.historicalData.set('tenants', tenants);
        this.historicalData.set('transactions', transactions);
        this.historicalData.set('arrears', arrears);
        
        console.log('📊 Historische Daten geladen für Insights-Analyse');
      } catch (error) {
        console.error('Fehler beim Laden historischer Daten:', error);
      }
    }
  }

  setupDataMonitoring() {
    // Überwache Datenänderungen für neue Insights
    setInterval(() => {
      this.analyzeCurrentData();
    }, 300000); // Alle 5 Minuten
    
    // Überwache Benutzeraktivitäten
    document.addEventListener('click', (e) => {
      if (e.target.closest('[href*="banking"]')) {
        this.generateBankingInsights();
      }
      if (e.target.closest('[href*="rückstände"]')) {
        this.generateArrearsInsights();
      }
    });
  }

  async analyzeCurrentData() {
    const insights = [];
    
    // Finanzanalyse
    insights.push(...await this.analyzeFinancialHealth());
    
    // Mieteranalyse
    insights.push(...await this.analyzeTenantPatterns());
    
    // Wartungsanalyse
    insights.push(...await this.analyzeMaintenanceNeeds());
    
    // Marktanalyse
    insights.push(...await this.analyzeMarketOpportunities());
    
    // Risikoanalyse
    insights.push(...await this.analyzeRisks());
    
    // Neue Insights hinzufügen
    insights.forEach(insight => this.addInsight(insight));
    
    // UI aktualisieren
    this.updateInsightsUI();
  }

  async analyzeFinancialHealth() {
    const insights = [];
    const transactions = this.historicalData.get('transactions') || [];
    
    if (transactions.length === 0) return insights;
    
    // Berechne monatliche Trends
    const monthlyData = this.calculateMonthlyTrends(transactions);
    
    // Cashflow-Analyse
    const currentCashflow = monthlyData.netCashflow;
    if (currentCashflow < this.thresholds.cashFlow.critical) {
      insights.push({
        id: 'critical_cashflow',
        type: 'financial',
        severity: 'critical',
        title: 'Kritischer Cashflow',
        description: `Negativer Cashflow von ${currentCashflow.toFixed(2)}€ erkannt`,
        recommendations: [
          'Prüfen Sie alle Ausgaben auf Einsparpotential',
          'Erwägen Sie Mietanpassungen bei Neuvermietungen',
          'Überprüfen Sie Finanzierungskonditionen'
        ],
        value: currentCashflow,
        trend: this.calculateTrend(monthlyData.history, 'netCashflow'),
        confidence: 0.9
      });
    }
    
    // Ausgaben-Trend-Analyse
    const expenseTrend = this.calculateTrend(monthlyData.history, 'expenses');
    if (expenseTrend > 10) {
      insights.push({
        id: 'rising_expenses',
        type: 'financial',
        severity: 'warning',
        title: 'Steigende Ausgaben',
        description: `Ausgaben sind um ${expenseTrend.toFixed(1)}% gestiegen`,
        recommendations: [
          'Analysieren Sie die größten Kostentreiber',
          'Verhandeln Sie mit Dienstleistern neu',
          'Prüfen Sie Energieeffizienz-Maßnahmen'
        ],
        value: expenseTrend,
        confidence: 0.8
      });
    }
    
    // Einnahmen-Optimierung
    const avgRent = this.calculateAverageRent();
    const marketRent = this.estimateMarketRent();
    const rentGap = ((marketRent - avgRent) / avgRent) * 100;
    
    if (rentGap > this.thresholds.rentIncrease.opportunity) {
      insights.push({
        id: 'rent_optimization',
        type: 'opportunity',
        severity: 'info',
        title: 'Mieterhöhungspotential',
        description: `Marktmiete liegt ${rentGap.toFixed(1)}% über aktueller Miete`,
        recommendations: [
          'Prüfen Sie Mieterhöhungsmöglichkeiten',
          'Führen Sie Marktvergleich durch',
          'Planen Sie Modernisierungsmaßnahmen'
        ],
        value: rentGap,
        potentialIncome: (marketRent - avgRent) * 12,
        confidence: 0.7
      });
    }
    
    return insights;
  }

  async analyzeTenantPatterns() {
    const insights = [];
    const tenants = this.historicalData.get('tenants') || [];
    const arrears = this.historicalData.get('arrears') || [];
    
    // Zahlungsverhalten-Analyse
    const paymentPatterns = this.analyzePaymentPatterns(tenants, arrears);
    
    // Rückstände-Trend
    if (paymentPatterns.arrearsRate > 15) {
      insights.push({
        id: 'high_arrears_rate',
        type: 'tenant',
        severity: 'warning',
        title: 'Hohe Rückstandsquote',
        description: `${paymentPatterns.arrearsRate.toFixed(1)}% der Mieter haben Rückstände`,
        recommendations: [
          'Implementieren Sie frühzeitige Mahnverfahren',
          'Prüfen Sie Bonitätskriterien bei Neuvermietung',
          'Bieten Sie Ratenzahlungen an'
        ],
        value: paymentPatterns.arrearsRate,
        affectedTenants: paymentPatterns.arrearsCount,
        confidence: 0.9
      });
    }
    
    // Fluktuation-Analyse
    const turnoverRate = this.calculateTurnoverRate(tenants);
    if (turnoverRate > 20) {
      insights.push({
        id: 'high_turnover',
        type: 'tenant',
        severity: 'warning',
        title: 'Hohe Fluktuation',
        description: `Fluktuationsrate von ${turnoverRate.toFixed(1)}% ist überdurchschnittlich`,
        recommendations: [
          'Führen Sie Mieter-Zufriedenheitsumfragen durch',
          'Verbessern Sie Kommunikation und Service',
          'Prüfen Sie Mietpreise im Marktvergleich'
        ],
        value: turnoverRate,
        confidence: 0.8
      });
    }
    
    // Langzeit-Mieter Bindung
    const longTermTenants = tenants.filter(t => this.getTenancyDuration(t) > 36);
    if (longTermTenants.length > 0) {
      insights.push({
        id: 'loyal_tenants',
        type: 'opportunity',
        severity: 'info',
        title: 'Treue Langzeit-Mieter',
        description: `${longTermTenants.length} Mieter wohnen länger als 3 Jahre`,
        recommendations: [
          'Belohnen Sie Treue mit besonderen Services',
          'Führen Sie regelmäßige Gespräche',
          'Bieten Sie Modernisierungen an'
        ],
        value: longTermTenants.length,
        confidence: 0.9
      });
    }
    
    return insights;
  }

  async analyzeMaintenanceNeeds() {
    const insights = [];
    
    // Simuliere Wartungsdaten basierend auf Gebäudealter
    const buildingAge = 25; // Jahre
    const maintenanceSchedule = this.generateMaintenanceSchedule(buildingAge);
    
    // Dringende Wartungen
    const urgentMaintenance = maintenanceSchedule.filter(m => m.urgency === 'urgent');
    if (urgentMaintenance.length > 0) {
      insights.push({
        id: 'urgent_maintenance',
        type: 'maintenance',
        severity: 'warning',
        title: 'Dringende Wartungen',
        description: `${urgentMaintenance.length} dringende Wartungsarbeiten erforderlich`,
        recommendations: [
          'Planen Sie sofortige Inspektionen',
          'Holen Sie Kostenvoranschläge ein',
          'Informieren Sie betroffene Mieter'
        ],
        items: urgentMaintenance,
        estimatedCost: urgentMaintenance.reduce((sum, m) => sum + m.estimatedCost, 0),
        confidence: 0.8
      });
    }
    
    // Präventive Wartung
    const preventiveMaintenance = maintenanceSchedule.filter(m => m.type === 'preventive');
    if (preventiveMaintenance.length > 0) {
      insights.push({
        id: 'preventive_maintenance',
        type: 'opportunity',
        severity: 'info',
        title: 'Präventive Wartung empfohlen',
        description: `${preventiveMaintenance.length} präventive Maßnahmen können Kosten sparen`,
        recommendations: [
          'Planen Sie Wartungen in ruhigen Perioden',
          'Bündeln Sie Arbeiten für Kosteneffizienz',
          'Dokumentieren Sie alle Maßnahmen'
        ],
        items: preventiveMaintenance,
        potentialSavings: preventiveMaintenance.reduce((sum, m) => sum + (m.preventionSavings || 0), 0),
        confidence: 0.7
      });
    }
    
    return insights;
  }

  async analyzeMarketOpportunities() {
    const insights = [];
    
    // Markttrend-Simulation
    const marketTrends = {
      rentGrowth: 3.2, // % pro Jahr
      propertyValueGrowth: 4.1,
      demandIndex: 1.15,
      competitionLevel: 0.8
    };
    
    // Mieterhöhungspotential
    if (marketTrends.rentGrowth > 2) {
      insights.push({
        id: 'market_rent_growth',
        type: 'opportunity',
        severity: 'info',
        title: 'Positiver Markttrend',
        description: `Marktmieten steigen um ${marketTrends.rentGrowth}% jährlich`,
        recommendations: [
          'Planen Sie moderate Mietanpassungen',
          'Investieren Sie in Objektverbesserungen',
          'Nutzen Sie Modernisierungsumlagen'
        ],
        value: marketTrends.rentGrowth,
        potentialIncome: this.calculatePotentialRentIncrease(marketTrends.rentGrowth),
        confidence: 0.6
      });
    }
    
    // Nachfrage-Analyse
    if (marketTrends.demandIndex > 1.1) {
      insights.push({
        id: 'high_demand',
        type: 'opportunity',
        severity: 'info',
        title: 'Hohe Nachfrage',
        description: `Nachfrage ist ${((marketTrends.demandIndex - 1) * 100).toFixed(0)}% über Durchschnitt`,
        recommendations: [
          'Reduzieren Sie Leerstandszeiten',
          'Optimieren Sie Vermietungsprozesse',
          'Erhöhen Sie Marketingaktivitäten'
        ],
        value: marketTrends.demandIndex,
        confidence: 0.7
      });
    }
    
    return insights;
  }

  async analyzeRisks() {
    const insights = [];
    
    // Konzentrations-Risiko
    const tenants = this.historicalData.get('tenants') || [];
    const largeTenantsRatio = this.calculateLargeTenantsRatio(tenants);
    
    if (largeTenantsRatio > 50) {
      insights.push({
        id: 'concentration_risk',
        type: 'risk',
        severity: 'warning',
        title: 'Konzentrations-Risiko',
        description: `${largeTenantsRatio.toFixed(0)}% der Einnahmen von wenigen Mietern`,
        recommendations: [
          'Diversifizieren Sie Ihr Mieterportfolio',
          'Entwickeln Sie Notfallpläne',
          'Prüfen Sie Mietausfallversicherungen'
        ],
        value: largeTenantsRatio,
        confidence: 0.8
      });
    }
    
    // Liquiditäts-Risiko
    const liquidityRatio = this.calculateLiquidityRatio();
    if (liquidityRatio < 2) {
      insights.push({
        id: 'liquidity_risk',
        type: 'risk',
        severity: 'critical',
        title: 'Liquiditäts-Risiko',
        description: `Liquiditätsreserve nur ${liquidityRatio.toFixed(1)} Monatsmieten`,
        recommendations: [
          'Bauen Sie Liquiditätsreserven auf',
          'Prüfen Sie Kreditlinien',
          'Optimieren Sie Cashflow-Management'
        ],
        value: liquidityRatio,
        confidence: 0.9
      });
    }
    
    return insights;
  }

  // Hilfsmethoden für Berechnungen
  calculateMonthlyTrends(transactions) {
    const monthlyData = {};
    const now = new Date();
    
    // Gruppiere Transaktionen nach Monaten
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0, netCashflow: 0 };
      }
      
      if (tx.amount > 0) {
        monthlyData[monthKey].income += tx.amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(tx.amount);
      }
      
      monthlyData[monthKey].netCashflow = monthlyData[monthKey].income - monthlyData[monthKey].expenses;
    });
    
    const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
    return {
      netCashflow: monthlyData[currentMonth]?.netCashflow || 0,
      history: monthlyData
    };
  }

  calculateTrend(data, metric) {
    const values = Object.values(data).map(d => d[metric]).filter(v => v !== undefined);
    if (values.length < 2) return 0;
    
    const recent = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const older = values.slice(-6, -3).reduce((a, b) => a + b, 0) / 3;
    
    return older === 0 ? 0 : ((recent - older) / older) * 100;
  }

  calculateAverageRent() {
    const tenants = this.historicalData.get('tenants') || [];
    if (tenants.length === 0) return 0;
    
    const totalRent = tenants.reduce((sum, tenant) => sum + (tenant.rent || 0), 0);
    return totalRent / tenants.length;
  }

  estimateMarketRent() {
    // Simuliere Marktmiete basierend auf aktueller Miete + Marktfaktor
    const avgRent = this.calculateAverageRent();
    return avgRent * 1.08; // 8% über aktueller Miete
  }

  analyzePaymentPatterns(tenants, arrears) {
    const arrearsCount = arrears.length;
    const arrearsRate = tenants.length > 0 ? (arrearsCount / tenants.length) * 100 : 0;
    
    return {
      arrearsCount,
      arrearsRate,
      totalArrears: arrears.reduce((sum, a) => sum + (a.amount || 0), 0)
    };
  }

  calculateTurnoverRate(tenants) {
    // Simuliere Fluktuation basierend auf Mieterdaten
    const recentMoveOuts = tenants.filter(t => {
      const moveOutDate = new Date(t.moveOutDate || '2024-01-01');
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return moveOutDate > oneYearAgo;
    });
    
    return tenants.length > 0 ? (recentMoveOuts.length / tenants.length) * 100 : 0;
  }

  getTenancyDuration(tenant) {
    const moveInDate = new Date(tenant.moveInDate || '2020-01-01');
    const now = new Date();
    return Math.floor((now - moveInDate) / (1000 * 60 * 60 * 24 * 30)); // Monate
  }

  generateMaintenanceSchedule(buildingAge) {
    const schedule = [];
    
    // Basierend auf Gebäudealter
    if (buildingAge > 20) {
      schedule.push({
        item: 'Heizungsanlage',
        urgency: 'urgent',
        estimatedCost: 15000,
        description: 'Heizungsanlage benötigt Wartung'
      });
    }
    
    if (buildingAge > 15) {
      schedule.push({
        item: 'Fassade',
        type: 'preventive',
        estimatedCost: 25000,
        preventionSavings: 5000,
        description: 'Fassadensanierung empfohlen'
      });
    }
    
    schedule.push({
      item: 'Dach',
      type: 'preventive',
      estimatedCost: 12000,
      preventionSavings: 3000,
      description: 'Dachinspektion und kleinere Reparaturen'
    });
    
    return schedule;
  }

  calculateLargeTenantsRatio(tenants) {
    if (tenants.length === 0) return 0;
    
    const totalRent = tenants.reduce((sum, t) => sum + (t.rent || 0), 0);
    const sortedTenants = tenants.sort((a, b) => (b.rent || 0) - (a.rent || 0));
    const topTenants = sortedTenants.slice(0, Math.ceil(tenants.length * 0.2)); // Top 20%
    const topRent = topTenants.reduce((sum, t) => sum + (t.rent || 0), 0);
    
    return totalRent > 0 ? (topRent / totalRent) * 100 : 0;
  }

  calculateLiquidityRatio() {
    // Simuliere Liquiditätsreserve
    const monthlyRent = this.calculateAverageRent() * (this.historicalData.get('tenants')?.length || 1);
    const liquidReserves = 15000; // Angenommene Liquidität
    
    return monthlyRent > 0 ? liquidReserves / monthlyRent : 0;
  }

  calculatePotentialRentIncrease(growthRate) {
    const currentRent = this.calculateAverageRent();
    const tenantCount = this.historicalData.get('tenants')?.length || 1;
    return (currentRent * tenantCount * growthRate / 100) * 12; // Jährlich
  }

  // UI-Methoden
  createInsightsPanel() {
    const panel = document.createElement('div');
    panel.id = 'clara-insights-panel';
    panel.className = 'insights-panel';
    panel.innerHTML = `
      <div class="insights-header">
        <h3>🔮 Proactive Insights</h3>
        <div class="insights-controls">
          <button class="insights-refresh">🔄</button>
          <button class="insights-settings">⚙️</button>
          <button class="insights-toggle">−</button>
        </div>
      </div>
      <div class="insights-content">
        <div class="insights-summary">
          <div class="insight-count">0 Insights</div>
          <div class="insight-priority">Keine kritischen Probleme</div>
        </div>
        <div class="insights-list" id="insights-list"></div>
      </div>
    `;

    // Event Listeners
    panel.querySelector('.insights-refresh').addEventListener('click', () => {
      this.analyzeCurrentData();
    });

    panel.querySelector('.insights-toggle').addEventListener('click', () => {
      const content = panel.querySelector('.insights-content');
      const toggle = panel.querySelector('.insights-toggle');
      
      if (content.style.display === 'none') {
        content.style.display = 'block';
        toggle.textContent = '−';
      } else {
        content.style.display = 'none';
        toggle.textContent = '+';
      }
    });

    document.body.appendChild(panel);
  }

  updateInsightsUI() {
    const list = document.getElementById('insights-list');
    const summary = document.querySelector('.insights-summary');
    
    if (!list || !summary) return;

    // Update Summary
    const criticalCount = this.insights.filter(i => i.severity === 'critical').length;
    const warningCount = this.insights.filter(i => i.severity === 'warning').length;
    
    summary.querySelector('.insight-count').textContent = `${this.insights.length} Insights`;
    
    if (criticalCount > 0) {
      summary.querySelector('.insight-priority').textContent = `${criticalCount} kritische Probleme`;
      summary.querySelector('.insight-priority').className = 'insight-priority critical';
    } else if (warningCount > 0) {
      summary.querySelector('.insight-priority').textContent = `${warningCount} Warnungen`;
      summary.querySelector('.insight-priority').className = 'insight-priority warning';
    } else {
      summary.querySelector('.insight-priority').textContent = 'Keine kritischen Probleme';
      summary.querySelector('.insight-priority').className = 'insight-priority info';
    }

    // Update List
    list.innerHTML = this.insights.map(insight => this.renderInsight(insight)).join('');
  }

  renderInsight(insight) {
    const severityIcon = {
      'critical': '🚨',
      'warning': '⚠️',
      'info': '💡',
      'opportunity': '🎯'
    };

    return `
      <div class="insight-item ${insight.severity}" data-id="${insight.id}">
        <div class="insight-header">
          <span class="insight-icon">${severityIcon[insight.severity]}</span>
          <h4 class="insight-title">${insight.title}</h4>
          <button class="insight-dismiss" onclick="window.claraInsights.dismissInsight('${insight.id}')">×</button>
        </div>
        <p class="insight-description">${insight.description}</p>
        ${insight.recommendations ? `
          <div class="insight-recommendations">
            <strong>Empfehlungen:</strong>
            <ul>
              ${insight.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <div class="insight-meta">
          <span class="insight-confidence">Vertrauen: ${Math.round(insight.confidence * 100)}%</span>
          ${insight.value !== undefined ? `<span class="insight-value">Wert: ${insight.value}</span>` : ''}
        </div>
      </div>
    `;
  }

  addInsight(insight) {
    // Prüfe ob Insight bereits existiert
    const existingIndex = this.insights.findIndex(i => i.id === insight.id);
    
    if (existingIndex >= 0) {
      // Update existing insight
      this.insights[existingIndex] = { ...this.insights[existingIndex], ...insight };
    } else {
      // Add new insight
      this.insights.unshift(insight);
    }
    
    // Begrenze Anzahl der Insights
    if (this.insights.length > 20) {
      this.insights = this.insights.slice(0, 20);
    }
  }

  dismissInsight(insightId) {
    this.insights = this.insights.filter(i => i.id !== insightId);
    this.dismissedInsights.push(insightId);
    this.updateInsightsUI();
  }

  startAnalysisLoop() {
    // Initiale Analyse
    setTimeout(() => {
      this.analyzeCurrentData();
    }, 5000);
    
    // Regelmäßige Analyse
    setInterval(() => {
      this.analyzeCurrentData();
    }, 300000); // Alle 5 Minuten
  }

  // Public API
  getInsights() {
    return this.insights;
  }

  getCriticalInsights() {
    return this.insights.filter(i => i.severity === 'critical');
  }

  getOpportunities() {
    return this.insights.filter(i => i.type === 'opportunity');
  }
}

// CSS für Insights Panel
const insightsCSS = `
.insights-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.insights-header {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.insights-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.insights-controls {
  display: flex;
  gap: 8px;
}

.insights-controls button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.insights-content {
  max-height: 60vh;
  overflow-y: auto;
}

.insights-summary {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.insight-count {
  font-weight: 600;
  color: #374151;
}

.insight-priority {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.insight-priority.critical {
  background: #fee2e2;
  color: #dc2626;
}

.insight-priority.warning {
  background: #fef3c7;
  color: #d97706;
}

.insight-priority.info {
  background: #dbeafe;
  color: #2563eb;
}

.insights-list {
  padding: 0.5rem;
}

.insight-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-left: 4px solid #e5e7eb;
}

.insight-item.critical {
  border-left-color: #dc2626;
  background: #fef2f2;
}

.insight-item.warning {
  border-left-color: #d97706;
  background: #fffbeb;
}

.insight-item.info {
  border-left-color: #2563eb;
  background: #eff6ff;
}

.insight-item.opportunity {
  border-left-color: #059669;
  background: #ecfdf5;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.insight-title {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.insight-dismiss {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 16px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.insight-description {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.insight-recommendations {
  margin: 8px 0;
  font-size: 12px;
}

.insight-recommendations strong {
  color: #374151;
}

.insight-recommendations ul {
  margin: 4px 0 0 0;
  padding-left: 16px;
}

.insight-recommendations li {
  margin-bottom: 2px;
  color: #6b7280;
}

.insight-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 8px;
}

@media (max-width: 768px) {
  .insights-panel {
    width: 300px;
    right: 10px;
    top: 10px;
  }
}
`;

// CSS injizieren
const insightsStyle = document.createElement('style');
insightsStyle.textContent = insightsCSS;
document.head.appendChild(insightsStyle);

// Auto-Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.claraInsights = new ClaraProactiveInsights();
    console.log('🔮 Clara Proactive Insights bereit');
  }, 4000);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaraProactiveInsights;
}

