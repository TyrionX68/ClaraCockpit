// Clara Insights Chat Integration - STRENG NUR FÜR /clara-ki
// SOFORTIGE BEREINIGUNG - Keine Aktivierung auf anderen Seiten
(function() {
  'use strict';
  
  console.log('📊 Clara Insights Chat Integration - STRICT MODE loading...');
  
  // ULTRA-STRENGE Prüfung ob wir auf der Clara KI-Seite sind
  function isOnClaraKIPageStrict() {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const title = document.title || '';
    
    // NUR exakte Clara KI-Seite - KEINE anderen Seiten
    const isExactClaraKI = (
      path === '/clara-ki' || 
      path.endsWith('/clara-ki') ||
      hash === '#/clara-ki' || 
      hash === '#clara-ki'
    );
    
    // ZUSÄTZLICHE Prüfung: Titel muss "Clara KI" enthalten
    const hasClaraKITitle = title.toLowerCase().includes('clara ki');
    
    // ZUSÄTZLICHE Prüfung: URL muss clara-ki enthalten
    const urlContainsClaraKI = window.location.href.includes('clara-ki');
    
    // ALLE Bedingungen müssen erfüllt sein
    const result = isExactClaraKI && (hasClaraKITitle || urlContainsClaraKI);
    
    console.log('📊 STRICT PAGE CHECK:', {
      path,
      hash,
      title,
      isExactClaraKI,
      hasClaraKITitle,
      urlContainsClaraKI,
      finalResult: result
    });
    
    return result;
  }
  
  // SOFORTIGE DEAKTIVIERUNG wenn nicht auf Clara KI-Seite
  function immediateDeactivation() {
    if (!isOnClaraKIPageStrict()) {
      console.log('📊 NOT on Clara KI page - IMMEDIATE DEACTIVATION');
      
      // Entferne alle Insights-Elemente falls vorhanden
      const existingBtn = document.querySelector('.clara-insights-btn');
      const existingPanel = document.querySelector('#clara-insights-panel');
      const existingStyles = document.querySelector('#clara-insights-styles');
      
      if (existingBtn) {
        existingBtn.remove();
        console.log('📊 Removed insights button from wrong page');
      }
      
      if (existingPanel) {
        existingPanel.remove();
        console.log('📊 Removed insights panel from wrong page');
      }
      
      if (existingStyles) {
        existingStyles.remove();
        console.log('📊 Removed insights styles from wrong page');
      }
      
      return true; // Deaktiviert
    }
    
    return false; // Nicht deaktiviert
  }
  
  // CSS-Styles für Insights-Integration - NUR für Clara KI
  function injectInsightsStyles() {
    if (!isOnClaraKIPageStrict()) {
      console.log('📊 BLOCKED: Style injection on non-Clara-KI page');
      return;
    }
    
    if (document.getElementById('clara-insights-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'clara-insights-styles';
    style.textContent = `
      .clara-insights-btn {
        margin-top: 16px;
        padding: 12px 16px;
        background: linear-gradient(135deg, #e5f4ff 0%, #d9efff 100%);
        border: 1px solid #0077cc;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #0066aa;
        width: 100%;
        justify-content: center;
      }
      
      .clara-insights-btn:hover {
        background: linear-gradient(135deg, #d9efff 0%, #cce7ff 100%);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 119, 204, 0.2);
      }
      
      #clara-insights-panel {
        margin-top: 16px;
        padding: 20px;
        background: #f8fcff;
        border: 1px solid #b3d9ff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 119, 204, 0.1);
        animation: slideIn 0.3s ease;
      }
      
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .insights-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e0f0ff;
      }
      
      .insights-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #1a365d;
      }
      
      .insights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 12px;
        margin-top: 16px;
      }
      
      .insight-card {
        background: white;
        padding: 14px;
        border-radius: 8px;
        border-left: 4px solid #0077cc;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      .insight-title {
        font-weight: 600;
        font-size: 14px;
        color: #1f2937;
        margin-bottom: 6px;
      }
      
      .insight-value {
        font-size: 16px;
        font-weight: 700;
        color: #0077cc;
        margin-bottom: 4px;
      }
      
      .insight-description {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.4;
      }
    `;
    
    document.head.appendChild(style);
    console.log('📊 Insights styles injected - ONLY for Clara KI page');
  }
  
  // Insights-Daten generieren - NUR für Clara KI
  function generateInsightsData() {
    if (!isOnClaraKIPageStrict()) {
      console.log('📊 BLOCKED: Insights data generation on non-Clara-KI page');
      return [];
    }
    
    return [
      {
        title: 'Mieteinnahmen Juni',
        value: '8.760 €',
        description: 'Vollständig eingegangen, +400€ über Vormonat'
      },
      {
        title: 'Offene Rückstände',
        value: '1.200 €',
        description: '1 Mieter, Mahnung bereits versendet'
      },
      {
        title: 'Empfohlene Mietanpassung',
        value: '+3%',
        description: 'Bei Neuvermietung, entspricht Marktentwicklung'
      },
      {
        title: 'Portfolio-Performance',
        value: '8.6%',
        description: 'Rendite über Marktdurchschnitt'
      }
    ];
  }
  
  // InsightsPanel erstellen und togglen - NUR für Clara KI
  function toggleInsightsPanel() {
    if (!isOnClaraKIPageStrict()) {
      console.log('📊 BLOCKED: Panel toggle on non-Clara-KI page');
      return;
    }
    
    let existing = document.querySelector('#clara-insights-panel');
    
    if (existing) {
      existing.remove();
      const btn = document.querySelector('.clara-insights-btn');
      if (btn) {
        btn.innerHTML = '📈 Clara Insights anzeigen';
      }
      console.log('📊 Clara Insights Panel closed');
      return;
    }
    
    const insights = generateInsightsData();
    const panel = document.createElement('div');
    panel.id = 'clara-insights-panel';
    
    panel.innerHTML = `
      <div class="insights-header">
        <div>
          <h3 class="insights-title">📊 Clara Insights</h3>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Proaktive Empfehlungen für Waldhofstraße 76</p>
        </div>
      </div>
      
      <div class="insights-grid">
        ${insights.map(insight => `
          <div class="insight-card">
            <div class="insight-title">${insight.title}</div>
            <div class="insight-value">${insight.value}</div>
            <div class="insight-description">${insight.description}</div>
          </div>
        `).join('')}
      </div>
    `;
    
    const chatContainer = findChatContainer();
    if (chatContainer && chatContainer.parentNode) {
      chatContainer.parentNode.appendChild(panel);
      
      const btn = document.querySelector('.clara-insights-btn');
      if (btn) {
        btn.innerHTML = '📊 Clara Insights ausblenden';
      }
      
      console.log('📊 Clara Insights Panel opened - ONLY on Clara KI page');
    }
  }
  
  // Chat-Container finden - NUR für Clara KI
  function findChatContainer() {
    if (!isOnClaraKIPageStrict()) {
      console.log('📊 BLOCKED: Chat container search on non-Clara-KI page');
      return null;
    }
    
    const selectors = [
      '#clara-chat-container',
      '.clara-chat-container',
      '.chat-container',
      '[data-testid="chat-container"]',
      '.p-6',
      '.chat-interface',
      '.clara-ki-panel'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`📊 Found chat container: ${selector} - ONLY on Clara KI page`);
        return element;
      }
    }
    
    console.log('📊 No chat container found on Clara KI page');
    return null;
  }
  
  // Button einfügen - NUR für Clara KI
  function injectInsightsToggle() {
    // SOFORTIGE DEAKTIVIERUNG wenn nicht auf Clara KI-Seite
    if (immediateDeactivation()) {
      return;
    }
    
    if (!isOnClaraKIPageStrict()) {
      console.log('📊 BLOCKED: Button injection on non-Clara-KI page');
      return;
    }
    
    if (document.querySelector('.clara-insights-btn')) {
      console.log('📊 Insights button already exists on Clara KI page');
      return;
    }
    
    const chatContainer = findChatContainer();
    if (!chatContainer) {
      console.log('📊 No chat container found for insights integration on Clara KI page');
      return;
    }
    
    const insightsBtn = document.createElement('button');
    insightsBtn.className = 'clara-insights-btn';
    insightsBtn.innerHTML = '📈 Clara Insights anzeigen';
    insightsBtn.onclick = toggleInsightsPanel;
    
    if (chatContainer.parentNode) {
      chatContainer.parentNode.insertBefore(insightsBtn, chatContainer.nextSibling);
      console.log('📊 Clara Insights button injected - ONLY on Clara KI page');
    }
    
    // URL-Parameter prüfen
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('insights') === '1') {
      setTimeout(() => {
        toggleInsightsPanel();
        console.log('📊 Auto-opened insights via URL parameter - ONLY on Clara KI page');
      }, 500);
    }
  }
  
  // Initialisierung - ULTRA-STRENGE Prüfung
  function initClaraInsightsIntegration() {
    console.log('📊 Initializing Clara Insights - STRICT MODE...');
    
    // SOFORTIGE DEAKTIVIERUNG wenn nicht auf Clara KI-Seite
    if (immediateDeactivation()) {
      console.log('📊 DEACTIVATED - Not on Clara KI page');
      return;
    }
    
    if (!isOnClaraKIPageStrict()) {
      console.log('📊 BLOCKED - Not on Clara KI page - Clara Insights disabled');
      return;
    }
    
    console.log('📊 CONFIRMED - On Clara KI page - Proceeding with integration');
    
    injectInsightsStyles();
    
    setTimeout(() => {
      injectInsightsToggle();
    }, 2000);
  }
  
  // KONTINUIERLICHE Überwachung - Deaktivierung bei Seitenwechsel
  function continuousMonitoring() {
    setInterval(() => {
      if (immediateDeactivation()) {
        console.log('📊 CONTINUOUS MONITORING - Deactivated on page change');
      }
    }, 1000);
  }
  
  // DOM Ready Check - ULTRA-STRENGE Prüfung
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initClaraInsightsIntegration();
      continuousMonitoring();
    });
  } else {
    initClaraInsightsIntegration();
    continuousMonitoring();
  }
  
  console.log('📊 Clara Insights Chat Integration loaded - ULTRA-STRICT MODE - ONLY /clara-ki');
})();
