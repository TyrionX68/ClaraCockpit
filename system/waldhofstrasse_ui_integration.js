// Waldhofstraße UI Integration - Selective Banking Interface
// Clara360 Property Management System

class WaldhofstrasseUI {
  constructor() {
    this.propertyObject = 'Waldhofstraße';
    this.apiBaseUrl = window.location.hostname === 'localhost' ? 
      'http://localhost:3006' : 'https://psd2.clara360.de';
    this.selectedBankId = null;
    this.connectedAccount = null;
    this.kpiData = null;
    
    this.init();
  }

  async init() {
    console.log('🏘️ Initializing Waldhofstraße UI Integration');
    
    // Remove mock data elements
    this.removeMockData();
    
    // Initialize UI components
    this.initializeBankSelection();
    this.initializeKPIDashboard();
    this.initializeAccountView();
    
    // Check for existing connections
    await this.checkExistingConnections();
    
    console.log('✅ Waldhofstraße UI Integration initialized');
  }

  // Remove all mock data from UI
  removeMockData() {
    console.log('🧹 Removing mock data for Waldhofstraße');
    
    // Remove mock webform results
    const mockWebformElements = document.querySelectorAll('[data-mock="webform"]');
    mockWebformElements.forEach(el => el.remove());
    
    // Remove mock KPI data
    const mockKpiElements = document.querySelectorAll('[data-mock="kpi"]');
    mockKpiElements.forEach(el => el.remove());
    
    // Remove mock account data
    const mockAccountElements = document.querySelectorAll('[data-mock="account"]');
    mockAccountElements.forEach(el => el.remove());
    
    // Hide multibank elements
    const multibankElements = document.querySelectorAll('[data-feature="multibank"]');
    multibankElements.forEach(el => {
      el.style.display = 'none';
      el.setAttribute('data-disabled', 'waldhofstrasse-focus');
    });
    
    console.log('✅ Mock data removed for Waldhofstraße focus');
  }

  // Initialize bank selection UI
  initializeBankSelection() {
    const bankSelectionContainer = document.getElementById('bank-selection-container') || 
      this.createBankSelectionContainer();
    
    bankSelectionContainer.innerHTML = `
      <div class="waldhofstrasse-bank-selection">
        <div class="property-header">
          <h2>🏘️ Bankkonto für Waldhofstraße</h2>
          <p class="property-description">
            Verbinden Sie Ihr Mietkonto für die Waldhofstraße mit Clara360 für automatische Auswertungen.
          </p>
        </div>
        
        <div class="bank-search-section">
          <div class="search-container">
            <input 
              type="text" 
              id="bank-search-input" 
              placeholder="Bank suchen (z.B. Sparkasse, Deutsche Bank...)"
              class="bank-search-input"
            />
            <button id="bank-search-btn" class="search-btn">🔍 Suchen</button>
          </div>
          
          <div id="bank-results" class="bank-results-container">
            <div class="loading-placeholder">
              Geben Sie einen Banknamen ein, um mit der Suche zu beginnen.
            </div>
          </div>
        </div>
        
        <div class="selection-info">
          <div class="info-box">
            <h4>ℹ️ Wichtige Hinweise:</h4>
            <ul>
              <li>Es wird nur <strong>ein einzelnes Konto</strong> für die Waldhofstraße verbunden</li>
              <li>Wählen Sie das Konto, über das die Mietzahlungen laufen</li>
              <li>Alle Daten werden sicher und verschlüsselt übertragen</li>
              <li>Sie können die Verbindung jederzeit wieder trennen</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const searchInput = document.getElementById('bank-search-input');
    const searchBtn = document.getElementById('bank-search-btn');
    
    searchInput.addEventListener('input', this.debounce(this.searchBanks.bind(this), 500));
    searchBtn.addEventListener('click', () => this.searchBanks());
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.searchBanks();
    });
  }

  // Create bank selection container if it doesn't exist
  createBankSelectionContainer() {
    const container = document.createElement('div');
    container.id = 'bank-selection-container';
    container.className = 'waldhofstrasse-container';
    
    // Insert into main content area
    const mainContent = document.querySelector('.main-content') || 
                       document.querySelector('#app') || 
                       document.body;
    mainContent.appendChild(container);
    
    return container;
  }

  // Search banks for Waldhofstraße
  async searchBanks() {
    const searchInput = document.getElementById('bank-search-input');
    const resultsContainer = document.getElementById('bank-results');
    const query = searchInput.value.trim();
    
    if (!query || query.length < 2) {
      resultsContainer.innerHTML = '<div class="info-message">Bitte geben Sie mindestens 2 Zeichen ein.</div>';
      return;
    }
    
    resultsContainer.innerHTML = '<div class="loading">🔄 Suche Banken für Waldhofstraße...</div>';
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/finapi/waldhofstrasse/banks?search=${encodeURIComponent(query)}&perPage=10`);
      const data = await response.json();
      
      if (data.success && data.banks.length > 0) {
        this.displayBankResults(data.banks);
      } else {
        resultsContainer.innerHTML = `
          <div class="no-results">
            <p>Keine passenden Banken gefunden für "${query}".</p>
            <p>Versuchen Sie es mit einem anderen Suchbegriff.</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ Error searching banks:', error);
      resultsContainer.innerHTML = `
        <div class="error-message">
          <p>❌ Fehler bei der Banksuche.</p>
          <p>Bitte versuchen Sie es später erneut.</p>
        </div>
      `;
    }
  }

  // Display bank search results
  displayBankResults(banks) {
    const resultsContainer = document.getElementById('bank-results');
    
    const banksHtml = banks.map(bank => `
      <div class="bank-result-item" data-bank-id="${bank.id}">
        <div class="bank-info">
          <div class="bank-name">${bank.name}</div>
          <div class="bank-details">
            <span class="bank-blz">BLZ: ${bank.blz}</span>
            ${bank.location ? `<span class="bank-location">${bank.location}</span>` : ''}
          </div>
          ${bank.logo?.url ? `<img src="${bank.logo.url}" alt="${bank.name}" class="bank-logo" />` : ''}
        </div>
        <button class="select-bank-btn" data-bank-id="${bank.id}">
          🏘️ Für Waldhofstraße auswählen
        </button>
      </div>
    `).join('');
    
    resultsContainer.innerHTML = `
      <div class="bank-results-list">
        <h4>📋 Gefundene Banken (${banks.length}):</h4>
        ${banksHtml}
      </div>
    `;
    
    // Add click handlers for bank selection
    const selectButtons = resultsContainer.querySelectorAll('.select-bank-btn');
    selectButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bankId = e.target.getAttribute('data-bank-id');
        this.selectBankForWaldhofstrasse(bankId);
      });
    });
  }

  // Select bank for Waldhofstraße
  async selectBankForWaldhofstrasse(bankId) {
    console.log(`🏘️ Selecting bank ${bankId} for Waldhofstraße`);
    
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'waldhofstrasse-confirm-dialog';
    confirmDialog.innerHTML = `
      <div class="dialog-overlay">
        <div class="dialog-content">
          <h3>🏘️ Bankkonto für Waldhofstraße verbinden</h3>
          <p>Sie sind dabei, ein Bankkonto für die <strong>Waldhofstraße</strong> zu verbinden.</p>
          
          <div class="account-purpose-selection">
            <h4>Verwendungszweck bestätigen:</h4>
            <label class="radio-option">
              <input type="radio" name="account-purpose" value="mietkonto" checked>
              <span>💰 Dies ist mein Mietkonto für die Waldhofstraße</span>
            </label>
            <label class="radio-option">
              <input type="radio" name="account-purpose" value="verwaltung">
              <span>🏢 Dies ist mein Verwaltungskonto für die Waldhofstraße</span>
            </label>
          </div>
          
          <div class="dialog-actions">
            <button class="cancel-btn">Abbrechen</button>
            <button class="confirm-btn">🔗 Verbindung herstellen</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmDialog);
    
    // Handle dialog actions
    const cancelBtn = confirmDialog.querySelector('.cancel-btn');
    const confirmBtn = confirmDialog.querySelector('.confirm-btn');
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(confirmDialog);
    });
    
    confirmBtn.addEventListener('click', async () => {
      const selectedPurpose = confirmDialog.querySelector('input[name="account-purpose"]:checked').value;
      document.body.removeChild(confirmDialog);
      
      await this.createWaldhofstrasseBankConnection(bankId, selectedPurpose);
    });
  }

  // Create bank connection for Waldhofstraße
  async createWaldhofstrasseBankConnection(bankId, purpose) {
    console.log(`🔗 Creating Waldhofstraße bank connection: ${bankId} (${purpose})`);
    
    // Show loading state
    const loadingDialog = this.showLoadingDialog('Verbindung wird hergestellt...');
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/finapi/waldhofstrasse/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bankId: parseInt(bankId),
          accountPurpose: purpose,
          propertyObject: 'Waldhofstraße'
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.webform) {
        // Close loading dialog
        document.body.removeChild(loadingDialog);
        
        // Open WebForm in new window/tab
        const webformWindow = window.open(
          data.webform.url,
          'waldhofstrasse-banking',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );
        
        // Show success message
        this.showSuccessMessage('WebForm geöffnet', 
          'Das Banking-Formular wurde in einem neuen Fenster geöffnet. Folgen Sie den Anweisungen zur Kontoverbindung.');
        
        // Monitor WebForm completion
        this.monitorWebFormCompletion(webformWindow, data.webform.id);
        
      } else {
        throw new Error(data.error || 'Failed to create WebForm');
      }
    } catch (error) {
      console.error('❌ Error creating Waldhofstraße bank connection:', error);
      document.body.removeChild(loadingDialog);
      
      this.showErrorMessage('Verbindung fehlgeschlagen', 
        'Die Bankverbindung für die Waldhofstraße konnte nicht hergestellt werden. Bitte versuchen Sie es später erneut.');
    }
  }

  // Monitor WebForm completion
  monitorWebFormCompletion(webformWindow, formId) {
    const checkInterval = setInterval(() => {
      try {
        if (webformWindow.closed) {
          clearInterval(checkInterval);
          console.log('🔄 WebForm window closed, checking connection status...');
          
          // Check if connection was successful
          setTimeout(() => {
            this.checkExistingConnections();
          }, 2000);
        }
      } catch (error) {
        // Cross-origin error is expected, continue monitoring
      }
    }, 1000);
    
    // Stop monitoring after 10 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 600000);
  }

  // Check for existing Waldhofstraße connections
  async checkExistingConnections() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/finapi/waldhofstrasse/accounts`);
      const data = await response.json();
      
      if (data.success && data.accounts && data.accounts.length > 0) {
        console.log('✅ Found existing Waldhofstraße accounts:', data.accounts.length);
        this.connectedAccount = data.accounts[0]; // Use first account
        this.showConnectedAccountView();
        await this.loadKPIData();
      } else {
        console.log('ℹ️ No existing Waldhofstraße accounts found');
        this.showBankSelectionView();
      }
    } catch (error) {
      console.error('❌ Error checking existing connections:', error);
      this.showBankSelectionView();
    }
  }

  // Show connected account view
  showConnectedAccountView() {
    const container = document.getElementById('bank-selection-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="waldhofstrasse-connected-view">
        <div class="connection-status">
          <div class="status-header">
            <h2>✅ Waldhofstraße Bankkonto verbunden</h2>
            <div class="connection-badge">Aktiv</div>
          </div>
          
          <div class="account-info">
            <div class="account-details">
              <h3>📊 Verbundenes Konto</h3>
              <div class="account-item">
                <span class="account-label">Kontoinhaber:</span>
                <span class="account-value">${this.connectedAccount?.accountHolderName || 'Wird geladen...'}</span>
              </div>
              <div class="account-item">
                <span class="account-label">IBAN:</span>
                <span class="account-value">${this.connectedAccount?.iban || 'Wird geladen...'}</span>
              </div>
              <div class="account-item">
                <span class="account-label">Bank:</span>
                <span class="account-value">${this.connectedAccount?.bankName || 'Wird geladen...'}</span>
              </div>
              <div class="account-item">
                <span class="account-label">Verwendung:</span>
                <span class="account-value">🏘️ Mietkonto Waldhofstraße</span>
              </div>
            </div>
          </div>
          
          <div class="account-actions">
            <button id="refresh-data-btn" class="action-btn primary">
              🔄 Daten aktualisieren
            </button>
            <button id="disconnect-account-btn" class="action-btn secondary">
              🔌 Verbindung trennen
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    const refreshBtn = document.getElementById('refresh-data-btn');
    const disconnectBtn = document.getElementById('disconnect-account-btn');
    
    refreshBtn?.addEventListener('click', () => this.refreshAccountData());
    disconnectBtn?.addEventListener('click', () => this.disconnectAccount());
  }

  // Show bank selection view
  showBankSelectionView() {
    // Re-initialize bank selection if no connections found
    this.initializeBankSelection();
  }

  // Initialize KPI Dashboard
  initializeKPIDashboard() {
    const kpiContainer = document.getElementById('kpi-dashboard') || 
      this.createKPIDashboard();
    
    // Initially show placeholder
    kpiContainer.innerHTML = `
      <div class="waldhofstrasse-kpi-dashboard">
        <div class="kpi-header">
          <h2>📊 Waldhofstraße - Finanz-KPIs</h2>
          <div class="kpi-subtitle">Automatische Auswertungen basierend auf Ihrem Mietkonto</div>
        </div>
        
        <div class="kpi-placeholder">
          <div class="placeholder-message">
            <h3>🏦 Bankkonto verbinden</h3>
            <p>Verbinden Sie Ihr Mietkonto für die Waldhofstraße, um automatische Finanz-KPIs zu erhalten.</p>
          </div>
        </div>
      </div>
    `;
  }

  // Create KPI Dashboard container
  createKPIDashboard() {
    const container = document.createElement('div');
    container.id = 'kpi-dashboard';
    container.className = 'waldhofstrasse-kpi-container';
    
    // Insert after bank selection
    const bankContainer = document.getElementById('bank-selection-container');
    if (bankContainer) {
      bankContainer.parentNode.insertBefore(container, bankContainer.nextSibling);
    } else {
      const mainContent = document.querySelector('.main-content') || 
                         document.querySelector('#app') || 
                         document.body;
      mainContent.appendChild(container);
    }
    
    return container;
  }

  // Load KPI data for Waldhofstraße
  async loadKPIData() {
    if (!this.connectedAccount) {
      console.log('ℹ️ No connected account for KPI loading');
      return;
    }
    
    const kpiContainer = document.getElementById('kpi-dashboard');
    if (!kpiContainer) return;
    
    // Show loading state
    kpiContainer.innerHTML = `
      <div class="waldhofstrasse-kpi-dashboard">
        <div class="kpi-header">
          <h2>📊 Waldhofstraße - Finanz-KPIs</h2>
          <div class="kpi-subtitle">Lade aktuelle Daten...</div>
        </div>
        <div class="kpi-loading">🔄 KPI-Daten werden geladen...</div>
      </div>
    `;
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/finapi/waldhofstrasse/kpis?accountId=${this.connectedAccount.id}`);
      const data = await response.json();
      
      if (data.success && data.kpis) {
        this.kpiData = data.kpis;
        this.displayKPIDashboard();
      } else {
        throw new Error(data.error || 'Failed to load KPI data');
      }
    } catch (error) {
      console.error('❌ Error loading KPI data:', error);
      this.displayKPIError();
    }
  }

  // Display KPI Dashboard with real data
  displayKPIDashboard() {
    const kpiContainer = document.getElementById('kpi-dashboard');
    if (!kpiContainer || !this.kpiData) return;
    
    const kpis = this.kpiData;
    
    kpiContainer.innerHTML = `
      <div class="waldhofstrasse-kpi-dashboard">
        <div class="kpi-header">
          <h2>📊 Waldhofstraße - Finanz-KPIs</h2>
          <div class="kpi-subtitle">Automatische Auswertungen • Letztes Update: ${new Date().toLocaleDateString('de-DE')}</div>
        </div>
        
        <div class="kpi-grid">
          <!-- Kontostand -->
          <div class="kpi-card primary">
            <div class="kpi-icon">🏘️</div>
            <div class="kpi-content">
              <div class="kpi-title">Objekt-Kontostand</div>
              <div class="kpi-value">${this.formatCurrency(kpis.accountBalance)}</div>
              <div class="kpi-subtitle">Waldhofstraße</div>
            </div>
          </div>
          
          <!-- Mieteingang -->
          <div class="kpi-card success">
            <div class="kpi-icon">💰</div>
            <div class="kpi-content">
              <div class="kpi-title">Mieteingang (90 Tage)</div>
              <div class="kpi-value">${this.formatCurrency(kpis.monthlyRentIncome)}</div>
              <div class="kpi-subtitle">${kpis.rentPaymentCount} Zahlungen</div>
            </div>
          </div>
          
          <!-- Zahlungseingang nach Fälligkeit -->
          <div class="kpi-card ${kpis.latePayments > 0 ? 'warning' : 'success'}">
            <div class="kpi-icon">⏰</div>
            <div class="kpi-content">
              <div class="kpi-title">Verspätete Zahlungen</div>
              <div class="kpi-value">${kpis.latePayments}</div>
              <div class="kpi-subtitle">Nach dem 5. des Monats</div>
            </div>
          </div>
          
          <!-- Kontobewegungen 30 Tage -->
          <div class="kpi-card info">
            <div class="kpi-icon">📈</div>
            <div class="kpi-content">
              <div class="kpi-title">Bewegungen (30 Tage)</div>
              <div class="kpi-value">${kpis.transactionsLast30Days}</div>
              <div class="kpi-subtitle">Transaktionen</div>
            </div>
          </div>
          
          <!-- Zufluss 30 Tage -->
          <div class="kpi-card success">
            <div class="kpi-icon">📥</div>
            <div class="kpi-content">
              <div class="kpi-title">Zufluss (30 Tage)</div>
              <div class="kpi-value">${this.formatCurrency(kpis.totalInflowLast30Days)}</div>
              <div class="kpi-subtitle">Eingänge</div>
            </div>
          </div>
          
          <!-- Abfluss 30 Tage -->
          <div class="kpi-card warning">
            <div class="kpi-icon">📤</div>
            <div class="kpi-content">
              <div class="kpi-title">Abfluss (30 Tage)</div>
              <div class="kpi-value">${this.formatCurrency(kpis.totalOutflowLast30Days)}</div>
              <div class="kpi-subtitle">Ausgaben</div>
            </div>
          </div>
        </div>
        
        <div class="kpi-actions">
          <button id="view-transactions-btn" class="action-btn primary">
            📋 Kontobewegungen anzeigen
          </button>
          <button id="export-kpi-btn" class="action-btn secondary">
            📊 KPIs exportieren
          </button>
        </div>
      </div>
    `;
    
    // Add event listeners
    const viewTransactionsBtn = document.getElementById('view-transactions-btn');
    const exportKpiBtn = document.getElementById('export-kpi-btn');
    
    viewTransactionsBtn?.addEventListener('click', () => this.showTransactionsModal());
    exportKpiBtn?.addEventListener('click', () => this.exportKPIData());
  }

  // Display KPI error
  displayKPIError() {
    const kpiContainer = document.getElementById('kpi-dashboard');
    if (!kpiContainer) return;
    
    kpiContainer.innerHTML = `
      <div class="waldhofstrasse-kpi-dashboard">
        <div class="kpi-header">
          <h2>📊 Waldhofstraße - Finanz-KPIs</h2>
          <div class="kpi-subtitle">Fehler beim Laden der Daten</div>
        </div>
        
        <div class="kpi-error">
          <div class="error-message">
            <h3>❌ KPI-Daten konnten nicht geladen werden</h3>
            <p>Bitte versuchen Sie es später erneut oder aktualisieren Sie die Kontodaten.</p>
            <button id="retry-kpi-btn" class="action-btn primary">🔄 Erneut versuchen</button>
          </div>
        </div>
      </div>
    `;
    
    const retryBtn = document.getElementById('retry-kpi-btn');
    retryBtn?.addEventListener('click', () => this.loadKPIData());
  }

  // Initialize account view
  initializeAccountView() {
    // This will be populated when account is connected
    console.log('📊 Account view initialized for Waldhofstraße');
  }

  // Utility functions
  formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  showLoadingDialog(message) {
    const dialog = document.createElement('div');
    dialog.className = 'loading-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay">
        <div class="dialog-content">
          <div class="loading-spinner">🔄</div>
          <div class="loading-message">${message}</div>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
    return dialog;
  }

  showSuccessMessage(title, message) {
    const dialog = document.createElement('div');
    dialog.className = 'success-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay">
        <div class="dialog-content">
          <div class="success-icon">✅</div>
          <h3>${title}</h3>
          <p>${message}</p>
          <button class="close-btn">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
    
    const closeBtn = dialog.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      if (document.body.contains(dialog)) {
        document.body.removeChild(dialog);
      }
    }, 5000);
  }

  showErrorMessage(title, message) {
    const dialog = document.createElement('div');
    dialog.className = 'error-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay">
        <div class="dialog-content">
          <div class="error-icon">❌</div>
          <h3>${title}</h3>
          <p>${message}</p>
          <button class="close-btn">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
    
    const closeBtn = dialog.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }

  // Additional methods for account management
  async refreshAccountData() {
    console.log('🔄 Refreshing Waldhofstraße account data...');
    await this.checkExistingConnections();
    if (this.connectedAccount) {
      await this.loadKPIData();
    }
    this.showSuccessMessage('Daten aktualisiert', 'Die Kontodaten für die Waldhofstraße wurden erfolgreich aktualisiert.');
  }

  async disconnectAccount() {
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirm-dialog';
    confirmDialog.innerHTML = `
      <div class="dialog-overlay">
        <div class="dialog-content">
          <h3>⚠️ Verbindung trennen</h3>
          <p>Möchten Sie die Bankverbindung für die Waldhofstraße wirklich trennen?</p>
          <p><strong>Alle KPI-Daten gehen verloren!</strong></p>
          <div class="dialog-actions">
            <button class="cancel-btn">Abbrechen</button>
            <button class="confirm-btn danger">Verbindung trennen</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmDialog);
    
    const cancelBtn = confirmDialog.querySelector('.cancel-btn');
    const confirmBtn = confirmDialog.querySelector('.confirm-btn');
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(confirmDialog);
    });
    
    confirmBtn.addEventListener('click', () => {
      document.body.removeChild(confirmDialog);
      this.performDisconnect();
    });
  }

  performDisconnect() {
    // Reset state
    this.connectedAccount = null;
    this.kpiData = null;
    
    // Show bank selection again
    this.showBankSelectionView();
    this.initializeKPIDashboard();
    
    this.showSuccessMessage('Verbindung getrennt', 'Die Bankverbindung für die Waldhofstraße wurde erfolgreich getrennt.');
  }

  showTransactionsModal() {
    // Implementation for showing transaction details
    console.log('📋 Showing transactions modal for Waldhofstraße');
    // This would open a modal with detailed transaction list
  }

  exportKPIData() {
    if (!this.kpiData) return;
    
    const exportData = {
      propertyObject: 'Waldhofstraße',
      exportDate: new Date().toISOString(),
      kpis: this.kpiData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `waldhofstrasse_kpis_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    this.showSuccessMessage('Export erfolgreich', 'Die KPI-Daten für die Waldhofstraße wurden erfolgreich exportiert.');
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the right page for Waldhofstraße
  if (window.location.pathname.includes('banking') || 
      window.location.pathname.includes('waldhofstrasse') ||
      document.querySelector('#banking-section')) {
    
    console.log('🏘️ Initializing Waldhofstraße UI Integration');
    window.waldhofstrasseUI = new WaldhofstrasseUI();
  }
});

// Export for manual initialization
window.WaldhofstrasseUI = WaldhofstrasseUI;

