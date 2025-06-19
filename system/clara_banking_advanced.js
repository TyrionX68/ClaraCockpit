// Clara360 Advanced Banking Integration
// Basierend auf dem vollständigen Clara360-Projekt
// Kombiniert FinAPI + lokale Daten + moderne UI

class ClaraBankingAdvanced {
  constructor() {
    this.finApiClient = null;
    this.localData = new Map();
    this.transactions = new Map();
    this.accounts = new Map();
    this.analytics = new Map();
    this.isConnected = false;
    this.init();
  }

  async init() {
    await this.initializeFinAPI();
    await this.loadLocalData();
    this.setupEventListeners();
    console.log('🏦 Clara Banking Advanced initialisiert');
  }

  async initializeFinAPI() {
    try {
      // FinAPI Client aus dem vollständigen Projekt
      this.finApiClient = {
        proxyURL: 'https://banking-proxy.clara360.de/api',
        isInitialized: false,
        
        async initialize() {
          try {
            const healthResponse = await fetch(`${this.proxyURL}/health`);
            if (healthResponse.ok) {
              this.isInitialized = true;
              return { success: true };
            }
            return { success: false, error: 'Proxy not available' };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        async getSupportedBanks(searchTerm = '') {
          const mockBanks = [
            { id: 'sparkasse', name: 'Sparkasse', bic: 'SPKODE', logo: '🏦' },
            { id: 'volksbank', name: 'Volksbank', bic: 'VBKODE', logo: '🏛️' },
            { id: 'deutsche_bank', name: 'Deutsche Bank', bic: 'DEUTDE', logo: '🏢' },
            { id: 'commerzbank', name: 'Commerzbank', bic: 'COBADE', logo: '🏪' },
            { id: 'ing', name: 'ING DiBa', bic: 'INGDDE', logo: '🧡' }
          ];
          
          if (searchTerm) {
            return mockBanks.filter(bank => 
              bank.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return mockBanks;
        },

        async connectBank(bankId, credentials) {
          // Simuliere Bank-Verbindung
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const mockAccounts = [
            {
              id: 'acc_001',
              iban: 'DE89 3704 0044 0532 0130 00',
              accountName: 'Hausverwaltung Geschäftskonto',
              balance: 45678.90,
              currency: 'EUR',
              type: 'CHECKING'
            },
            {
              id: 'acc_002', 
              iban: 'DE89 3704 0044 0532 0130 01',
              accountName: 'Rücklagen Instandhaltung',
              balance: 23456.78,
              currency: 'EUR',
              type: 'SAVINGS'
            }
          ];
          
          return { success: true, accounts: mockAccounts };
        },

        async getTransactions(accountId, fromDate, toDate) {
          const mockTransactions = [
            {
              id: 'tx_001',
              amount: 850.00,
              currency: 'EUR',
              purpose: 'Miete Wohnung 1A - Schmidt',
              counterpartName: 'Echter Mieter',
              counterpartIban: 'DE12345678901234567890',
              bookingDate: '2025-06-01',
              valueDate: '2025-06-01',
              type: 'CREDIT'
            },
            {
              id: 'tx_002',
              amount: -120.50,
              currency: 'EUR',
              purpose: 'Wartung Heizung',
              counterpartName: 'Heizungsbau Müller GmbH',
              counterpartIban: 'DE09876543210987654321',
              bookingDate: '2025-06-02',
              valueDate: '2025-06-02',
              type: 'DEBIT'
            },
            {
              id: 'tx_003',
              amount: 920.00,
              currency: 'EUR',
              purpose: 'Miete Wohnung 2B - Weber',
              counterpartName: 'Familie Weber',
              counterpartIban: 'DE11223344556677889900',
              bookingDate: '2025-06-03',
              valueDate: '2025-06-03',
              type: 'CREDIT'
            }
          ];
          
          return { success: true, transactions: mockTransactions };
        }
      };

      const result = await this.finApiClient.initialize();
      this.isConnected = result.success;
      
    } catch (error) {
      console.error('FinAPI Initialisierung fehlgeschlagen:', error);
      this.isConnected = false;
    }
  }

  async loadLocalData() {
    // Lade lokale Transaktionsdaten
    if (window.claraDataBridge) {
      try {
        const transactions = await window.claraDataBridge.getTransactions();
        transactions.forEach(tx => {
          this.transactions.set(tx.id, tx);
        });
        console.log(`💰 ${this.transactions.size} lokale Transaktionen geladen`);
      } catch (error) {
        console.error('Fehler beim Laden lokaler Daten:', error);
      }
    }
  }

  createBankingPanel() {
    const panel = document.createElement('div');
    panel.className = 'banking-panel';
    panel.innerHTML = `
      <div class="banking-header">
        <h3>🏦 Banking & Finanzen</h3>
        <div class="connection-status">
          <span class="status-indicator ${this.isConnected ? 'connected' : 'disconnected'}"></span>
          ${this.isConnected ? 'FinAPI Verbunden' : 'Offline Modus'}
        </div>
        <button class="banking-close">×</button>
      </div>
      <div class="banking-content">
        <div class="banking-tabs">
          <button class="tab-btn active" data-tab="overview">Übersicht</button>
          <button class="tab-btn" data-tab="accounts">Konten</button>
          <button class="tab-btn" data-tab="transactions">Transaktionen</button>
          <button class="tab-btn" data-tab="analytics">Analytics</button>
          <button class="tab-btn" data-tab="connect">Bank verbinden</button>
        </div>
        
        <div class="tab-content" id="overview-tab">
          <div class="financial-overview">
            <div class="kpi-grid">
              <div class="kpi-card">
                <h4>Gesamtsaldo</h4>
                <div class="kpi-value">€ 69,135.68</div>
                <div class="kpi-change positive">+2.3%</div>
              </div>
              <div class="kpi-card">
                <h4>Mieteinnahmen (Monat)</h4>
                <div class="kpi-value">€ 8,360.00</div>
                <div class="kpi-change positive">+1.2%</div>
              </div>
              <div class="kpi-card">
                <h4>Ausgaben (Monat)</h4>
                <div class="kpi-value">€ 2,450.30</div>
                <div class="kpi-change negative">+5.7%</div>
              </div>
              <div class="kpi-card">
                <h4>Netto-Cashflow</h4>
                <div class="kpi-value">€ 5,909.70</div>
                <div class="kpi-change positive">+0.8%</div>
              </div>
            </div>
            
            <div class="recent-transactions">
              <h4>Letzte Transaktionen</h4>
              <div class="transaction-list" id="recent-transactions-list"></div>
            </div>
          </div>
        </div>
        
        <div class="tab-content hidden" id="accounts-tab">
          <div class="accounts-section">
            <div class="accounts-header">
              <h4>Verbundene Konten</h4>
              <button class="btn-primary" id="add-account">Konto hinzufügen</button>
            </div>
            <div class="accounts-list" id="accounts-list"></div>
          </div>
        </div>
        
        <div class="tab-content hidden" id="transactions-tab">
          <div class="transactions-section">
            <div class="transactions-filter">
              <input type="date" id="date-from" placeholder="Von">
              <input type="date" id="date-to" placeholder="Bis">
              <select id="transaction-type">
                <option value="">Alle Transaktionen</option>
                <option value="CREDIT">Eingänge</option>
                <option value="DEBIT">Ausgänge</option>
              </select>
              <button class="btn-secondary" id="filter-transactions">Filtern</button>
            </div>
            <div class="transactions-list" id="all-transactions-list"></div>
          </div>
        </div>
        
        <div class="tab-content hidden" id="analytics-tab">
          <div class="analytics-section">
            <div class="analytics-charts">
              <div class="chart-container">
                <h4>Cashflow-Entwicklung</h4>
                <canvas id="cashflow-chart"></canvas>
              </div>
              <div class="chart-container">
                <h4>Einnahmen vs. Ausgaben</h4>
                <canvas id="income-expenses-chart"></canvas>
              </div>
            </div>
            <div class="analytics-insights">
              <h4>KI-Insights</h4>
              <div class="insights-list" id="banking-insights"></div>
            </div>
          </div>
        </div>
        
        <div class="tab-content hidden" id="connect-tab">
          <div class="bank-connection">
            <div class="bank-search">
              <input type="text" id="bank-search" placeholder="Bank suchen...">
              <div class="banks-list" id="banks-list"></div>
            </div>
            <div class="connection-form hidden" id="connection-form">
              <h4>Bank-Zugangsdaten</h4>
              <div class="form-group">
                <label>Benutzername/Kontonummer:</label>
                <input type="text" id="bank-username" placeholder="Benutzername">
              </div>
              <div class="form-group">
                <label>PIN/Passwort:</label>
                <input type="password" id="bank-password" placeholder="PIN">
              </div>
              <div class="security-notice">
                <p>🔒 Ihre Zugangsdaten werden verschlüsselt übertragen und nicht gespeichert.</p>
              </div>
              <button class="btn-primary" id="connect-bank">Bank verbinden</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    this.bindBankingEvents(panel);
    this.populateBankingData();
    
    return panel;
  }

  bindBankingEvents(panel) {
    // Close Button
    panel.querySelector('.banking-close').addEventListener('click', () => {
      panel.remove();
    });

    // Tab Navigation
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        this.switchBankingTab(panel, tabId);
      });
    });

    // Bank Search
    const bankSearch = panel.querySelector('#bank-search');
    if (bankSearch) {
      bankSearch.addEventListener('input', (e) => {
        this.searchBanks(e.target.value);
      });
    }

    // Connect Bank
    const connectBtn = panel.querySelector('#connect-bank');
    if (connectBtn) {
      connectBtn.addEventListener('click', () => {
        this.handleBankConnection();
      });
    }

    // Filter Transactions
    const filterBtn = panel.querySelector('#filter-transactions');
    if (filterBtn) {
      filterBtn.addEventListener('click', () => {
        this.filterTransactions();
      });
    }
  }

  switchBankingTab(panel, tabId) {
    // Update Tab Buttons
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update Tab Content
    panel.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `${tabId}-tab`);
    });

    // Load tab-specific data
    this.loadTabData(tabId);
  }

  async loadTabData(tabId) {
    switch (tabId) {
      case 'overview':
        await this.loadOverviewData();
        break;
      case 'accounts':
        await this.loadAccountsData();
        break;
      case 'transactions':
        await this.loadTransactionsData();
        break;
      case 'analytics':
        await this.loadAnalyticsData();
        break;
      case 'connect':
        await this.loadBanksData();
        break;
    }
  }

  async loadOverviewData() {
    const recentList = document.getElementById('recent-transactions-list');
    if (!recentList) return;

    // Lade letzte 5 Transaktionen
    const recentTransactions = Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    recentList.innerHTML = recentTransactions.map(tx => `
      <div class="transaction-item">
        <div class="transaction-info">
          <strong>${tx.description || tx.purpose}</strong>
          <span class="transaction-date">${new Date(tx.date).toLocaleDateString('de-DE')}</span>
        </div>
        <div class="transaction-amount ${tx.amount > 0 ? 'positive' : 'negative'}">
          ${tx.amount > 0 ? '+' : ''}€ ${Math.abs(tx.amount).toFixed(2)}
        </div>
      </div>
    `).join('');
  }

  async loadAccountsData() {
    const accountsList = document.getElementById('accounts-list');
    if (!accountsList) return;

    // Mock-Konten anzeigen
    const accounts = [
      {
        id: 'acc_001',
        name: 'Hausverwaltung Geschäftskonto',
        iban: 'DE89 3704 0044 0532 0130 00',
        balance: 45678.90,
        bank: 'Sparkasse'
      },
      {
        id: 'acc_002',
        name: 'Rücklagen Instandhaltung',
        iban: 'DE89 3704 0044 0532 0130 01',
        balance: 23456.78,
        bank: 'Sparkasse'
      }
    ];

    accountsList.innerHTML = accounts.map(account => `
      <div class="account-card">
        <div class="account-info">
          <h5>${account.name}</h5>
          <p>${account.iban}</p>
          <small>${account.bank}</small>
        </div>
        <div class="account-balance">
          € ${account.balance.toFixed(2)}
        </div>
        <div class="account-actions">
          <button class="btn-small" onclick="window.claraBanking.viewTransactions('${account.id}')">
            Transaktionen
          </button>
        </div>
      </div>
    `).join('');
  }

  async searchBanks(searchTerm) {
    if (!this.finApiClient) return;

    try {
      const banks = await this.finApiClient.getSupportedBanks(searchTerm);
      const banksList = document.getElementById('banks-list');
      
      if (banksList) {
        banksList.innerHTML = banks.map(bank => `
          <div class="bank-item" onclick="window.claraBanking.selectBank('${bank.id}')">
            <span class="bank-logo">${bank.logo}</span>
            <div class="bank-info">
              <strong>${bank.name}</strong>
              <small>${bank.bic}</small>
            </div>
          </div>
        `).join('');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Banken:', error);
    }
  }

  selectBank(bankId) {
    this.selectedBank = bankId;
    const form = document.getElementById('connection-form');
    if (form) {
      form.classList.remove('hidden');
    }
  }

  async handleBankConnection() {
    const username = document.getElementById('bank-username').value;
    const password = document.getElementById('bank-password').value;

    if (!username || !password) {
      alert('Bitte geben Sie Ihre Zugangsdaten ein.');
      return;
    }

    try {
      const result = await this.finApiClient.connectBank(this.selectedBank, {
        username,
        password
      });

      if (result.success) {
        alert('Bank erfolgreich verbunden!');
        this.switchBankingTab(document.querySelector('.banking-panel'), 'accounts');
      } else {
        alert('Verbindung fehlgeschlagen: ' + result.error);
      }
    } catch (error) {
      alert('Fehler bei der Verbindung: ' + error.message);
    }
  }

  generateBankingInsights() {
    return [
      {
        type: 'positive',
        title: 'Stabile Mieteinnahmen',
        description: 'Ihre Mieteinnahmen sind in den letzten 3 Monaten um 2.3% gestiegen.',
        action: 'Prüfen Sie Mieterhöhungspotential'
      },
      {
        type: 'warning',
        title: 'Erhöhte Wartungskosten',
        description: 'Wartungskosten sind um 15% gestiegen. Prüfen Sie Ihre Dienstleister.',
        action: 'Angebote vergleichen'
      },
      {
        type: 'info',
        title: 'Liquiditätsreserve',
        description: 'Sie haben eine gesunde Liquiditätsreserve von 3.2 Monatsmieten.',
        action: 'Investitionsmöglichkeiten prüfen'
      }
    ];
  }

  setupEventListeners() {
    // Global Event Listener für Banking-Button in Sidebar
    document.addEventListener('click', (e) => {
      if (e.target.closest('[href*="banking"]') || 
          e.target.textContent.includes('Banking')) {
        e.preventDefault();
        this.openBankingPanel();
      }
    });
  }

  openBankingPanel() {
    // Schließe existierendes Panel
    const existingPanel = document.querySelector('.banking-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // Erstelle neues Panel
    this.createBankingPanel();
  }

  // Public API Methods
  viewTransactions(accountId) {
    this.switchBankingTab(document.querySelector('.banking-panel'), 'transactions');
    // Filter nach Account
  }

  exportTransactions(format = 'csv') {
    const transactions = Array.from(this.transactions.values());
    
    if (format === 'csv') {
      const csv = this.convertToCSV(transactions);
      this.downloadFile(csv, 'transaktionen.csv', 'text/csv');
    }
  }

  convertToCSV(data) {
    const headers = ['Datum', 'Beschreibung', 'Betrag', 'Typ'];
    const rows = data.map(tx => [
      tx.date,
      tx.description || tx.purpose,
      tx.amount,
      tx.amount > 0 ? 'Eingang' : 'Ausgang'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// CSS für Banking Panel
const bankingCSS = `
.banking-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 95%;
  max-width: 1000px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1002;
  overflow: hidden;
}

.banking-header {
  background: linear-gradient(135deg, #1e40af, #3b82f6);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
}

.banking-content {
  padding: 1rem;
  max-height: 75vh;
  overflow-y: auto;
}

.banking-tabs {
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
  border-bottom-color: #3b82f6;
  color: #3b82f6;
  font-weight: 600;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
}

.kpi-change.positive {
  color: #10b981;
}

.kpi-change.negative {
  color: #ef4444;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.transaction-amount.positive {
  color: #10b981;
  font-weight: 600;
}

.transaction-amount.negative {
  color: #ef4444;
  font-weight: 600;
}

.account-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.account-balance {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.bank-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.bank-item:hover {
  background-color: #f8fafc;
}

.bank-logo {
  font-size: 24px;
}

.security-notice {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 0.75rem;
  margin: 1rem 0;
}

.security-notice p {
  margin: 0;
  font-size: 14px;
  color: #0369a1;
}

@media (max-width: 768px) {
  .banking-panel {
    width: 98%;
    max-height: 95vh;
  }
  
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .account-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .banking-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1;
    min-width: 100px;
  }
}
`;

// CSS injizieren
const bankingStyle = document.createElement('style');
bankingStyle.textContent = bankingCSS;
document.head.appendChild(bankingStyle);

// Auto-Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.claraBanking = new ClaraBankingAdvanced();
    console.log('🏦 Clara Banking Advanced bereit');
  }, 2500);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaraBankingAdvanced;
}

