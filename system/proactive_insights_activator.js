// ProactiveInsights Activator - Aktiviert automatische Empfehlungen
// Manus A compliant implementation - Systematische Komponenten-Aktivierung
(function() {
  'use strict';
  
  console.log('🧠 ProactiveInsights Activator loading...');
  
  // ProactiveInsightsEngine Class laden (vereinfacht für DOM-Integration)
  class ProactiveInsightsEngine {
    constructor(options = {}) {
      this.options = {
        insightThresholds: {
          cashFlow: { critical: -500, warning: 0 },
          expenseRatio: { critical: 60, warning: 45 },
          occupancyRate: { critical: 80, warning: 90 },
          maintenanceRatio: { critical: 20, warning: 15 },
          capRate: { critical: 4, warning: 5 }
        },
        trendThresholds: {
          income: { critical: -10, warning: -5 },
          expenses: { critical: 15, warning: 10 },
          netCashFlow: { critical: -15, warning: -10 },
          occupancy: { critical: -10, warning: -5 }
        },
        anomalyThreshold: 2.5,
        maxInsights: 50,
        ...options
      };
      
      this.insights = [];
      this.lastAnalysis = null;
    }
    
    // Waldhofstraße-spezifische Datenanalyse
    analyzeWaldhofstrasseData() {
      const waldhofData = {
        monthlyRent: 8760,
        expenses: 1200,
        occupancyRate: 100,
        units: 14,
        portfolioValue: 1250000,
        yearlyIncome: 8760 * 12,
        netCashFlow: 8760 - 1200
      };
      
      return this.generateInsights(waldhofData);
    }
    
    // Insights generieren
    generateInsights(data) {
      const insights = [];
      
      // Cashflow-Analyse
      if (data.netCashFlow > 5000) {
        insights.push({
          type: 'positive',
          category: 'cashflow',
          title: 'Starker Cashflow',
          message: `Monatlicher Überschuss von ${data.netCashFlow.toLocaleString('de-DE')}€ ermöglicht Reinvestitionen`,
          priority: 'medium',
          actionable: true,
          action: 'Überschuss in Modernisierung oder Expansion investieren'
        });
      }
      
      // Rendite-Analyse
      const capRate = (data.yearlyIncome / data.portfolioValue * 100);
      if (capRate > 8) {
        insights.push({
          type: 'positive',
          category: 'performance',
          title: 'Überdurchschnittliche Rendite',
          message: `Aktuelle Rendite von ${capRate.toFixed(1)}% liegt über Marktdurchschnitt`,
          priority: 'high',
          actionable: true,
          action: 'Portfolio-Expansion bei ähnlichen Objekten prüfen'
        });
      }
      
      // Vollvermietung-Analyse
      if (data.occupancyRate === 100) {
        insights.push({
          type: 'positive',
          category: 'occupancy',
          title: 'Vollvermietung erreicht',
          message: 'Optimale Auslastung - Mietanpassung bei Neuvermietung möglich',
          priority: 'medium',
          actionable: true,
          action: 'Marktmieten für zukünftige Anpassungen analysieren'
        });
      }
      
      // Wartungsempfehlung
      const maintenanceRatio = (data.expenses / data.monthlyRent * 100);
      if (maintenanceRatio < 20) {
        insights.push({
          type: 'warning',
          category: 'maintenance',
          title: 'Wartungsrücklage prüfen',
          message: `Aktuelle Ausgabenquote von ${maintenanceRatio.toFixed(1)}% könnte zu niedrig sein`,
          priority: 'medium',
          actionable: true,
          action: 'Wartungsplan und Rücklagen für 2025 überprüfen'
        });
      }
      
      // Steueroptimierung
      insights.push({
        type: 'info',
        category: 'tax',
        title: 'Steueroptimierung möglich',
        message: 'Bei hoher Rendite Abschreibungsmöglichkeiten und Modernisierungsmaßnahmen prüfen',
        priority: 'low',
        actionable: true,
        action: 'Steuerberater für Optimierungsstrategien konsultieren'
      });
      
      this.insights = insights;
      this.lastAnalysis = new Date();
      
      console.log(`🧠 Generated ${insights.length} proactive insights for Waldhofstraße`);
      return insights;
    }
    
    // Insights im DOM anzeigen
    displayInsights() {
      const insights = this.analyzeWaldhofstrasseData();
      
      // Suche nach geeignetem Container
      let container = document.querySelector('#proactive-insights-container');
      
      if (!container) {
        // Erstelle Container nach dem Dashboard
        container = document.createElement('div');
        container.id = 'proactive-insights-container';
        container.style.cssText = `
          margin: 20px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        // Füge nach dem Dashboard-Bereich ein
        const dashboardArea = document.querySelector('.p-6') || document.querySelector('#root');
        if (dashboardArea && dashboardArea.parentNode) {
          dashboardArea.parentNode.insertBefore(container, dashboardArea.nextSibling);
        }
      }
      
      // Insights-HTML generieren
      const insightsHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 12px;">
            🧠
          </div>
          <div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Clara Proactive Insights</h3>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Automatische Empfehlungen für Waldhofstraße 76</p>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px;">
          ${insights.map(insight => `
            <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; border-left: 4px solid ${this.getInsightColor(insight.type)};">
              <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 8px;">
                <h4 style="margin: 0; font-size: 14px; font-weight: 600;">${insight.title}</h4>
                <span style="background: ${this.getInsightColor(insight.type)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">${insight.priority.toUpperCase()}</span>
              </div>
              <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.4; opacity: 0.95;">${insight.message}</p>
              ${insight.actionable ? `<p style="margin: 0; font-size: 12px; opacity: 0.8; font-style: italic;">💡 ${insight.action}</p>` : ''}
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 16px; text-align: center; opacity: 0.8; font-size: 12px;">
          Letzte Analyse: ${this.lastAnalysis.toLocaleString('de-DE')} • ${insights.length} Empfehlungen
        </div>
      `;
      
      container.innerHTML = insightsHTML;
      console.log('🧠 ProactiveInsights displayed successfully');
    }
    
    getInsightColor(type) {
      const colors = {
        positive: '#10B981',
        warning: '#F59E0B', 
        critical: '#EF4444',
        info: '#3B82F6'
      };
      return colors[type] || colors.info;
    }
  }
  
  // Global verfügbar machen
  window.ProactiveInsightsEngine = ProactiveInsightsEngine;
  
  // Automatische Initialisierung
  function initProactiveInsights() {
    console.log('🧠 Initializing ProactiveInsights...');
    
    const engine = new ProactiveInsightsEngine();
    window.claraProactiveInsights = engine;
    
    // Insights anzeigen
    setTimeout(() => {
      engine.displayInsights();
      
      // Periodische Updates alle 5 Minuten
      setInterval(() => {
        engine.displayInsights();
      }, 300000);
      
    }, 3000); // 3 Sekunden nach DOM-Ready
  }
  
  // DOM Ready Check und Initialisierung
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProactiveInsights);
  } else {
    initProactiveInsights();
  }
  
  console.log('🧠 ProactiveInsights Activator loaded successfully');
})();
