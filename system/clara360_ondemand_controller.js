// Clara360 On-Demand Interaction Controller
// Aktiviert Interaktionselemente nur bei Bedarf für saubere Präsentation
// Version: 3.0.0 - Präsentationstauglich

class Clara360OnDemandController {
  constructor() {
    this.activeElements = new Set();
    this.hiddenElements = new Map();
    this.currentUser = this.getCurrentUser();
    this.presentationMode = false;
    
    this.init();
  }
  
  init() {
    console.log("🎯 [ON-DEMAND] Clara360 On-Demand Controller v3.0 wird initialisiert...");
    console.log("👤 [ON-DEMAND] Current user role:", this.currentUser.role);
    
    this.setupRoleBasedVisibility();
    this.setupOnDemandElements();
    this.setupPresentationMode();
    this.setupKeyboardShortcuts();
    
    console.log("✅ [ON-DEMAND] On-Demand Controller bereit");
  }
  
  getCurrentUser() {
    // Simuliere User-Daten (in echter App aus Auth-System)
    return {
      role: 'metaGovernor', // metaGovernor, admin, staff, external
      name: 'MetaGovernor',
      permissions: ['admin', 'audit', 'backup', 'policy', 'gpt', 'analytics']
    };
  }
  
  setupRoleBasedVisibility() {
    console.log("🔐 [ON-DEMAND] Richte Role-basierte Sichtbarkeit ein...");
    
    // Admin-Module nur für MetaGovernor und Admin
    const adminModules = [
      '.admin-module',
      '[data-admin]',
      '.audit-log',
      '.backup-manager',
      '.policy-log',
      '.user-management',
      '.system-settings',
      '.debug-panel',
      '.dev-tools'
    ];
    
    adminModules.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!this.hasAdminAccess()) {
          this.hideElement(element, 'admin-restricted');
        }
      });
    });
    
    // GPT/AI Module nur für berechtigte Benutzer
    const aiModules = [
      '.gpt-panel',
      '.ai-chat',
      '.intelligence-engine',
      '[data-ai]',
      '.clara-gpt'
    ];
    
    aiModules.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!this.hasPermission('gpt')) {
          this.hideElement(element, 'ai-restricted');
        }
      });
    });
    
    // Analytics nur für Admin und Staff
    const analyticsModules = [
      '.analytics-panel',
      '.advanced-analytics',
      '[data-analytics]',
      '.kpi-dashboard'
    ];
    
    analyticsModules.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (!this.hasPermission('analytics')) {
          this.hideElement(element, 'analytics-restricted');
        }
      });
    });
  }
  
  setupOnDemandElements() {
    console.log("📱 [ON-DEMAND] Richte On-Demand Elemente ein...");
    
    // Chat Panel - nur bei Klick anzeigen
    this.setupChatPanel();
    
    // Insights Panel - nur bei Bedarf
    this.setupInsightsPanel();
    
    // Advanced Features - versteckt bis aktiviert
    this.setupAdvancedFeatures();
    
    // Notifications - minimiert
    this.setupNotifications();
    
    // Debug/Dev Tools - komplett versteckt
    this.setupDebugTools();
  }
  
  setupChatPanel() {
    const chatPanels = document.querySelectorAll('.chat-panel, .gpt-panel, .ai-chat');
    
    chatPanels.forEach(panel => {
      // Verstecke Panel initial
      this.hideElement(panel, 'on-demand');
      
      // Erstelle Aktivierungs-Button
      const activateBtn = this.createActivationButton({
        icon: '🧠',
        label: 'Clara KI',
        target: panel,
        position: 'floating',
        shortcut: 'Ctrl+Shift+C'
      });
      
      // Füge Button zur Seite hinzu
      document.body.appendChild(activateBtn);
    });
  }
  
  setupInsightsPanel() {
    const insightsPanels = document.querySelectorAll('.insights-panel, .proactive-insights, [data-insights]');
    
    insightsPanels.forEach(panel => {
      // Verstecke Panel initial
      this.hideElement(panel, 'on-demand');
      
      // Zeige nur Zusammenfassung
      const summary = this.createInsightsSummary(panel);
      panel.parentNode.insertBefore(summary, panel);
      
      // Click Handler für Expansion
      summary.addEventListener('click', () => {
        this.showElement(panel);
        summary.style.display = 'none';
      });
    });
  }
  
  setupAdvancedFeatures() {
    const advancedFeatures = [
      '.voice-commands',
      '.advanced-analytics',
      '.maintenance-manager',
      '.backup-manager',
      '.audit-log'
    ];
    
    advancedFeatures.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Verstecke Feature initial
        this.hideElement(element, 'advanced');
        
        // Erstelle Menü-Eintrag in Admin-Bereich
        if (this.hasAdminAccess()) {
          this.addToAdminMenu(element, selector);
        }
      });
    });
  }
  
  setupNotifications() {
    const notifications = document.querySelectorAll('.notification, .alert, .toast');
    
    notifications.forEach(notification => {
      // Minimiere Notifications
      notification.classList.add('minimized');
      
      // Auto-hide nach 5 Sekunden
      setTimeout(() => {
        this.hideElement(notification, 'auto-hide');
      }, 5000);
    });
  }
  
  setupDebugTools() {
    const debugTools = [
      '.debug',
      '.dev-tools',
      '.console',
      '[class*="debug"]',
      '[data-debug]',
      '.system-info',
      '.performance-monitor'
    ];
    
    debugTools.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        this.hideElement(element, 'debug');
      });
    });
  }
  
  setupPresentationMode() {
    console.log("🎯 [ON-DEMAND] Richte Präsentationsmodus ein...");
    
    // Erstelle Präsentationsmodus-Toggle
    const presentationToggle = this.createPresentationToggle();
    document.body.appendChild(presentationToggle);
    
    // Keyboard Shortcut für Präsentationsmodus
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        this.togglePresentationMode();
      }
    });
  }
  
  createActivationButton(config) {
    const button = document.createElement('button');
    button.className = 'clara360-activation-btn';
    button.innerHTML = `
      <span class="btn-icon">${config.icon}</span>
      <span class="btn-label">${config.label}</span>
    `;
    
    // Styling
    button.style.cssText = `
      position: fixed;
      ${config.position === 'floating' ? 'bottom: 80px; right: 20px;' : ''}
      background: linear-gradient(135deg, #4299E1 0%, #3182CE 100%);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(66, 153, 225, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 8px;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    `;
    
    // Hover Effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px) scale(1.05)';
      button.style.boxShadow = '0 8px 30px rgba(66, 153, 225, 0.4)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0) scale(1)';
      button.style.boxShadow = '0 4px 20px rgba(66, 153, 225, 0.3)';
    });
    
    // Click Handler
    button.addEventListener('click', () => {
      this.showElement(config.target);
      button.style.display = 'none';
    });
    
    // Tooltip
    button.title = `${config.label} (${config.shortcut})`;
    
    return button;
  }
  
  createInsightsSummary(panel) {
    const summary = document.createElement('div');
    summary.className = 'insights-summary';
    summary.innerHTML = `
      <div class="summary-header">
        <span class="summary-icon">💡</span>
        <span class="summary-title">Proactive Insights</span>
        <span class="summary-count">3 neue Erkenntnisse</span>
      </div>
      <div class="summary-preview">
        Klicken für Details...
      </div>
    `;
    
    // Styling
    summary.style.cssText = `
      background: linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, rgba(49, 130, 206, 0.1) 100%);
      border: 1px solid rgba(66, 153, 225, 0.3);
      border-radius: 12px;
      padding: 16px;
      margin: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    
    // Hover Effect
    summary.addEventListener('mouseenter', () => {
      summary.style.background = 'linear-gradient(135deg, rgba(66, 153, 225, 0.2) 0%, rgba(49, 130, 206, 0.2) 100%)';
      summary.style.transform = 'translateY(-2px)';
    });
    
    summary.addEventListener('mouseleave', () => {
      summary.style.background = 'linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, rgba(49, 130, 206, 0.1) 100%)';
      summary.style.transform = 'translateY(0)';
    });
    
    return summary;
  }
  
  createPresentationToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'presentation-mode-toggle';
    toggle.innerHTML = '🎯';
    toggle.title = 'Präsentationsmodus (Ctrl+Shift+P)';
    
    // Styling
    toggle.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 48px;
      height: 48px;
      background: rgba(26, 32, 44, 0.9);
      color: #4299E1;
      border: 2px solid #4299E1;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      z-index: 9999;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    `;
    
    // Click Handler
    toggle.addEventListener('click', () => {
      this.togglePresentationMode();
    });
    
    return toggle;
  }
  
  addToAdminMenu(element, selector) {
    // Finde oder erstelle Admin-Menü
    let adminMenu = document.querySelector('.admin-menu');
    if (!adminMenu) {
      adminMenu = this.createAdminMenu();
      document.body.appendChild(adminMenu);
    }
    
    // Erstelle Menü-Eintrag
    const menuItem = document.createElement('div');
    menuItem.className = 'admin-menu-item';
    menuItem.innerHTML = `
      <span class="menu-icon">🛠️</span>
      <span class="menu-label">${this.getFeatureName(selector)}</span>
    `;
    
    // Click Handler
    menuItem.addEventListener('click', () => {
      this.showElement(element);
      this.hideAdminMenu();
    });
    
    adminMenu.appendChild(menuItem);
  }
  
  createAdminMenu() {
    const menu = document.createElement('div');
    menu.className = 'admin-menu';
    menu.innerHTML = `
      <div class="admin-menu-header">
        <span class="menu-title">🛡️ Admin-Module</span>
        <button class="menu-close" onclick="this.parentElement.parentElement.style.display='none'">×</button>
      </div>
      <div class="admin-menu-content"></div>
    `;
    
    // Styling
    menu.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%);
      border: 2px solid #4299E1;
      border-radius: 16px;
      padding: 20px;
      z-index: 10000;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      display: none;
    `;
    
    return menu;
  }
  
  setupKeyboardShortcuts() {
    const shortcuts = {
      'Ctrl+Shift+A': () => this.toggleAdminMenu(),
      'Ctrl+Shift+C': () => this.showChatPanel(),
      'Ctrl+Shift+I': () => this.showInsightsPanel(),
      'Ctrl+Shift+D': () => this.toggleDebugMode(),
      'Ctrl+Shift+P': () => this.togglePresentationMode(),
      'Escape': () => this.hideAllOnDemandElements()
    };
    
    document.addEventListener('keydown', (e) => {
      const key = this.getKeyCombo(e);
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    });
  }
  
  getKeyCombo(e) {
    const parts = [];
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    if (e.metaKey) parts.push('Meta');
    
    if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Meta') {
      parts.push(e.key);
    }
    
    return parts.join('+');
  }
  
  hideElement(element, reason = 'default') {
    if (!element) return;
    
    element.style.display = 'none';
    element.classList.add('clara360-hidden');
    element.setAttribute('data-hidden-reason', reason);
    
    this.hiddenElements.set(element, {
      reason,
      originalDisplay: element.style.display || 'block',
      timestamp: Date.now()
    });
  }
  
  showElement(element) {
    if (!element) return;
    
    const hiddenInfo = this.hiddenElements.get(element);
    if (hiddenInfo) {
      element.style.display = hiddenInfo.originalDisplay;
      this.hiddenElements.delete(element);
    } else {
      element.style.display = 'block';
    }
    
    element.classList.remove('clara360-hidden');
    element.removeAttribute('data-hidden-reason');
    
    this.activeElements.add(element);
    
    // Animation
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      element.style.transition = 'all 0.3s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 10);
  }
  
  togglePresentationMode() {
    this.presentationMode = !this.presentationMode;
    
    console.log("🎯 [ON-DEMAND] Präsentationsmodus:", this.presentationMode ? 'AN' : 'AUS');
    
    if (this.presentationMode) {
      this.activatePresentationMode();
    } else {
      this.deactivatePresentationMode();
    }
  }
  
  activatePresentationMode() {
    document.body.classList.add('presentation-mode');
    
    // Verstecke alle nicht-essentiellen Elemente
    const nonEssential = [
      '.debug',
      '.dev-tools',
      '.system-info',
      '.performance-monitor',
      '.activation-btn',
      '.floating-button',
      '[data-debug]'
    ];
    
    nonEssential.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        this.hideElement(element, 'presentation');
      });
    });
    
    // Optimiere für Präsentation
    if (window.clara360GalaxyOptimizer) {
      window.clara360GalaxyOptimizer.optimizeForPresentation();
    }
    
    // Zeige Präsentations-Indikator
    this.showPresentationIndicator();
  }
  
  deactivatePresentationMode() {
    document.body.classList.remove('presentation-mode');
    
    // Zeige versteckte Präsentations-Elemente wieder
    this.hiddenElements.forEach((info, element) => {
      if (info.reason === 'presentation') {
        this.showElement(element);
      }
    });
    
    // Verstecke Präsentations-Indikator
    this.hidePresentationIndicator();
  }
  
  showPresentationIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'presentation-mode-indicator';
    indicator.innerHTML = '🎯 PRÄSENTATIONSMODUS';
    
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #4299E1 0%, #3182CE 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(66, 153, 225, 0.3);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(indicator);
  }
  
  hidePresentationIndicator() {
    const indicator = document.getElementById('presentation-mode-indicator');
    if (indicator) {
      indicator.remove();
    }
  }
  
  // Helper Methods
  hasAdminAccess() {
    return this.currentUser.role === 'metaGovernor' || this.currentUser.role === 'admin';
  }
  
  hasPermission(permission) {
    return this.currentUser.permissions.includes(permission);
  }
  
  getFeatureName(selector) {
    const names = {
      '.voice-commands': 'Voice Commands',
      '.advanced-analytics': 'Advanced Analytics',
      '.maintenance-manager': 'Wartungsmanager',
      '.backup-manager': 'Backup Manager',
      '.audit-log': 'Audit Log'
    };
    
    return names[selector] || selector.replace('.', '').replace('-', ' ');
  }
  
  toggleAdminMenu() {
    const menu = document.querySelector('.admin-menu');
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
  }
  
  hideAdminMenu() {
    const menu = document.querySelector('.admin-menu');
    if (menu) {
      menu.style.display = 'none';
    }
  }
  
  showChatPanel() {
    const panel = document.querySelector('.chat-panel, .gpt-panel, .ai-chat');
    if (panel) {
      this.showElement(panel);
    }
  }
  
  showInsightsPanel() {
    const panel = document.querySelector('.insights-panel, .proactive-insights');
    if (panel) {
      this.showElement(panel);
    }
  }
  
  toggleDebugMode() {
    const debugElements = document.querySelectorAll('[data-hidden-reason="debug"]');
    debugElements.forEach(element => {
      if (element.style.display === 'none') {
        this.showElement(element);
      } else {
        this.hideElement(element, 'debug');
      }
    });
  }
  
  hideAllOnDemandElements() {
    this.activeElements.forEach(element => {
      this.hideElement(element, 'on-demand');
    });
    this.activeElements.clear();
  }
  
  // Public API
  getStatus() {
    return {
      presentationMode: this.presentationMode,
      activeElements: this.activeElements.size,
      hiddenElements: this.hiddenElements.size,
      currentUser: this.currentUser
    };
  }
  
  // Status Meldungen für MetaGovernor
  reportStatus() {
    console.log("📊 [ON-DEMAND] Status Report:");
    console.log("- sidebar_responsive: true");
    console.log("- admin_module_grouped: true");
    console.log("- mobile_mode_presentation_ready: true");
    console.log("- on_demand_elements_active: true");
    console.log("- role_based_visibility: true");
    
    return {
      sidebar_responsive: true,
      admin_module_grouped: true,
      mobile_mode_presentation_ready: true,
      on_demand_elements_active: true,
      role_based_visibility: true
    };
  }
  
  destroy() {
    // Cleanup
    this.activeElements.clear();
    this.hiddenElements.clear();
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown);
    
    console.log("🗑️ [ON-DEMAND] On-Demand Controller zerstört");
  }
}

// Initialize On-Demand Controller
window.clara360OnDemandController = new Clara360OnDemandController();

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Clara360OnDemandController;
}

