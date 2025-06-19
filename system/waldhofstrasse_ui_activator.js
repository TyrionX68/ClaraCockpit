// Waldhofstraße UI Activator - Macht Banking-Integration sichtbar
// Wird automatisch geladen und aktiviert die UI-Komponenten

(function() {
  'use strict';
  
  console.log('🏘️ Waldhofstraße UI Activator loading...');
  
  // CSS für Waldhofstraße Banking-Integration
  const waldhofstrasseCSS = `
    <style id="waldhofstrasse-banking-styles">
      /* Waldhofstraße Banking Integration Styles */
      .waldhofstrasse-container {
        max-width: 1200px;
        margin: 20px auto;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      
      .waldhofstrasse-bank-selection {
        background: white;
        padding: 30px;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      
      .property-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e9ecef;
      }
      
      .property-header h2 {
        color: #2c3e50;
        font-size: 28px;
        margin-bottom: 10px;
      }
      
      .property-description {
        color: #6c757d;
        font-size: 16px;
        line-height: 1.5;
      }
      
      .bank-search-section {
        margin-bottom: 30px;
      }
      
      .search-container {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .bank-search-input {
        flex: 1;
        padding: 12px 16px;
        border: 2px solid #dee2e6;
        border-radius: 6px;
        font-size: 16px;
        transition: border-color 0.3s;
      }
      
      .bank-search-input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
      }
      
      .search-btn {
        padding: 12px 24px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .search-btn:hover {
        background: #0056b3;
      }
      
      .bank-results-container {
        min-height: 100px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 6px;
        border: 1px solid #dee2e6;
      }
      
      .bank-result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: white;
        border-radius: 6px;
        margin-bottom: 10px;
        border: 1px solid #dee2e6;
        transition: box-shadow 0.3s;
      }
      
      .bank-result-item:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .bank-info {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      .bank-name {
        font-weight: bold;
        color: #2c3e50;
        font-size: 18px;
      }
      
      .bank-details {
        display: flex;
        gap: 15px;
        color: #6c757d;
        font-size: 14px;
      }
      
      .select-bank-btn {
        padding: 10px 20px;
        background: #28a745;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: background-color 0.3s;
      }
      
      .select-bank-btn:hover {
        background: #218838;
      }
      
      .info-box {
        background: #e7f3ff;
        padding: 20px;
        border-radius: 6px;
        border-left: 4px solid #007bff;
      }
      
      .info-box h4 {
        color: #0056b3;
        margin-bottom: 10px;
      }
      
      .info-box ul {
        color: #495057;
        line-height: 1.6;
      }
      
      /* KPI Dashboard Styles */
      .waldhofstrasse-kpi-dashboard {
        background: white;
        padding: 30px;
        border-radius: 8px;
        margin-top: 20px;
      }
      
      .kpi-header {
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid #e9ecef;
      }
      
      .kpi-header h2 {
        color: #2c3e50;
        font-size: 24px;
        margin-bottom: 5px;
      }
      
      .kpi-subtitle {
        color: #6c757d;
        font-size: 14px;
      }
      
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .kpi-card {
        display: flex;
        align-items: center;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.3s;
      }
      
      .kpi-card:hover {
        transform: translateY(-2px);
      }
      
      .kpi-card.primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
      .kpi-card.success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; }
      .kpi-card.warning { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
      .kpi-card.info { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
      
      .kpi-icon {
        font-size: 36px;
        margin-right: 20px;
      }
      
      .kpi-content {
        flex: 1;
      }
      
      .kpi-title {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 5px;
      }
      
      .kpi-value {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .kpi-subtitle {
        font-size: 12px;
        opacity: 0.8;
      }
      
      .kpi-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 20px;
      }
      
      .action-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: bold;
      }
      
      .action-btn.primary {
        background: #007bff;
        color: white;
      }
      
      .action-btn.primary:hover {
        background: #0056b3;
      }
      
      .action-btn.secondary {
        background: #6c757d;
        color: white;
      }
      
      .action-btn.secondary:hover {
        background: #545b62;
      }
      
      /* Dialog Styles */
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      
      .dialog-content {
        background: white;
        padding: 30px;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .dialog-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
      }
      
      .cancel-btn {
        padding: 10px 20px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .confirm-btn {
        padding: 10px 20px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      /* Connected Account View */
      .waldhofstrasse-connected-view {
        background: white;
        padding: 30px;
        border-radius: 8px;
      }
      
      .connection-status {
        text-align: center;
      }
      
      .status-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        margin-bottom: 30px;
      }
      
      .connection-badge {
        background: #28a745;
        color: white;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
      }
      
      .account-info {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 6px;
        margin-bottom: 20px;
      }
      
      .account-item {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #dee2e6;
      }
      
      .account-item:last-child {
        border-bottom: none;
      }
      
      .account-label {
        font-weight: bold;
        color: #495057;
      }
      
      .account-value {
        color: #2c3e50;
      }
      
      /* Responsive Design */
      @media (max-width: 768px) {
        .waldhofstrasse-container {
          margin: 10px;
          padding: 15px;
        }
        
        .search-container {
          flex-direction: column;
        }
        
        .bank-result-item {
          flex-direction: column;
          gap: 15px;
          text-align: center;
        }
        
        .kpi-grid {
          grid-template-columns: 1fr;
        }
        
        .kpi-actions {
          flex-direction: column;
        }
      }
    </style>
  `;
  
  // CSS in Head einfügen
  document.head.insertAdjacentHTML('beforeend', waldhofstrasseCSS);
  
  // Warten bis DOM bereit ist
  function initializeWaldhofstrasseUI() {
    console.log('🏘️ Initializing Waldhofstraße Banking UI...');
    
    // Prüfen ob Banking-Sektion existiert
    let bankingSection = document.querySelector('#banking-section') || 
                        document.querySelector('.banking-container') ||
                        document.querySelector('[data-section="banking"]');
    
    // Wenn keine Banking-Sektion existiert, erstelle eine
    if (!bankingSection) {
      console.log('📦 Creating Waldhofstraße banking section...');
      
      bankingSection = document.createElement('div');
      bankingSection.id = 'waldhofstrasse-banking-section';
      bankingSection.className = 'waldhofstrasse-container';
      
      // In main content einfügen
      const mainContent = document.querySelector('.main-content') || 
                         document.querySelector('#app') || 
                         document.querySelector('main') ||
                         document.body;
      
      mainContent.appendChild(bankingSection);
    }
    
    // Waldhofstraße Banking UI HTML einfügen
    bankingSection.innerHTML = `
      <div class="waldhofstrasse-bank-selection">
        <div class="property-header">
          <h2>🏘️ Bankkonto für Waldhofstraße</h2>
          <p class="property-description">
            Verbinden Sie Ihr Mietkonto für die Waldhofstraße mit Clara360 für automatische Auswertungen und KPI-Tracking.
          </p>
        </div>
        
        <div class="bank-search-section">
          <div class="search-container">
            <input 
              type="text" 
              id="waldhofstrasse-bank-search" 
              placeholder="Bank suchen (z.B. Sparkasse, Deutsche Bank...)"
              class="bank-search-input"
            />
            <button id="waldhofstrasse-search-btn" class="search-btn">🔍 Suchen</button>
          </div>
          
          <div id="waldhofstrasse-bank-results" class="bank-results-container">
            <div class="loading-placeholder">
              <h4>🏦 Bankauswahl für Waldhofstraße</h4>
              <p>Geben Sie den Namen Ihrer Bank ein, um mit der Suche zu beginnen.</p>
              <p><strong>Empfohlen:</strong> Sparkasse, Deutsche Bank, Commerzbank, ING, DKB</p>
            </div>
          </div>
        </div>
        
        <div class="selection-info">
          <div class="info-box">
            <h4>ℹ️ Wichtige Hinweise zur Waldhofstraße-Integration:</h4>
            <ul>
              <li><strong>Selektive Kontoanbindung:</strong> Es wird nur ein einzelnes Konto für die Waldhofstraße verbunden</li>
              <li><strong>Objektbindung:</strong> Alle KPIs und Auswertungen sind auf die Waldhofstraße fokussiert</li>
              <li><strong>Mietkonto-Fokus:</strong> Wählen Sie das Konto, über das die Mietzahlungen für die Waldhofstraße laufen</li>
              <li><strong>Automatische KPIs:</strong> Mieteingang, Zahlungsverzug, Kontobewegungen werden automatisch analysiert</li>
              <li><strong>Sicherheit:</strong> Alle Daten werden sicher und verschlüsselt übertragen</li>
              <li><strong>Kontrolle:</strong> Sie können die Verbindung jederzeit wieder trennen</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div id="waldhofstrasse-kpi-dashboard" class="waldhofstrasse-kpi-dashboard">
        <div class="kpi-header">
          <h2>📊 Waldhofstraße - Finanz-KPIs</h2>
          <div class="kpi-subtitle">Automatische Auswertungen basierend auf Ihrem Mietkonto</div>
        </div>
        
        <div class="kpi-placeholder">
          <div class="placeholder-message">
            <h3>🏦 Bankkonto verbinden</h3>
            <p>Verbinden Sie Ihr Mietkonto für die Waldhofstraße, um automatische Finanz-KPIs zu erhalten:</p>
            <ul>
              <li>🏘️ <strong>Objekt-Kontostand:</strong> Aktueller Saldo für die Waldhofstraße</li>
              <li>💰 <strong>Mieteingang vs. Soll:</strong> Monatliche Mieteingangs-Analyse</li>
              <li>⏰ <strong>Zahlungseingang nach Fälligkeit:</strong> Rückstände tagesgenau tracken</li>
              <li>📆 <strong>Bankbewegungen:</strong> Kontoauszug-ähnliche Timeline der letzten 30 Tage</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    // Event Listeners hinzufügen
    const searchInput = document.getElementById('waldhofstrasse-bank-search');
    const searchBtn = document.getElementById('waldhofstrasse-search-btn');
    
    if (searchInput && searchBtn) {
      // Debounced search
      let searchTimeout;
      searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          performBankSearch(this.value);
        }, 500);
      });
      
      searchBtn.addEventListener('click', function() {
        performBankSearch(searchInput.value);
      });
      
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          performBankSearch(this.value);
        }
      });
    }
    
    console.log('✅ Waldhofstraße Banking UI activated and visible');
    
    // Visus-Ready-Status setzen
    setVisusReadyStatus(true);
  }
  
  // Bank-Suche durchführen
  function performBankSearch(query) {
    const resultsContainer = document.getElementById('waldhofstrasse-bank-results');
    if (!resultsContainer) return;
    
    if (!query || query.length < 2) {
      resultsContainer.innerHTML = `
        <div class="info-message">
          <p>Bitte geben Sie mindestens 2 Zeichen ein.</p>
        </div>
      `;
      return;
    }
    
    resultsContainer.innerHTML = '<div class="loading">🔄 Suche Banken für Waldhofstraße...</div>';
    
    // API-Call zu Waldhofstraße Banks-Endpoint
    const apiUrl = window.location.hostname === 'localhost' ? 
      'http://localhost:3006' : 'https://psd2.clara360.de';
    
    fetch(`${apiUrl}/api/finapi/waldhofstrasse/banks?search=${encodeURIComponent(query)}&perPage=10`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.banks && data.banks.length > 0) {
          displayBankResults(data.banks);
        } else {
          resultsContainer.innerHTML = `
            <div class="no-results">
              <p>Keine passenden Banken gefunden für "${query}".</p>
              <p>Versuchen Sie es mit einem anderen Suchbegriff (z.B. "Sparkasse", "Deutsche Bank").</p>
            </div>
          `;
        }
      })
      .catch(error => {
        console.error('❌ Error searching banks:', error);
        resultsContainer.innerHTML = `
          <div class="error-message">
            <p>❌ Fehler bei der Banksuche für Waldhofstraße.</p>
            <p>Bitte versuchen Sie es später erneut.</p>
            <button onclick="performBankSearch('${query}')" class="action-btn primary">🔄 Erneut versuchen</button>
          </div>
        `;
      });
  }
  
  // Bank-Ergebnisse anzeigen
  function displayBankResults(banks) {
    const resultsContainer = document.getElementById('waldhofstrasse-bank-results');
    if (!resultsContainer) return;
    
    const banksHtml = banks.map(bank => `
      <div class="bank-result-item" data-bank-id="${bank.id}">
        <div class="bank-info">
          <div class="bank-name">${bank.name}</div>
          <div class="bank-details">
            <span class="bank-blz">BLZ: ${bank.blz}</span>
            ${bank.location ? `<span class="bank-location">${bank.location}</span>` : ''}
            ${bank.popularity ? `<span class="bank-popularity">Beliebtheit: ${bank.popularity}%</span>` : ''}
          </div>
        </div>
        <button class="select-bank-btn" onclick="selectBankForWaldhofstrasse(${bank.id}, '${bank.name}')">
          🏘️ Für Waldhofstraße auswählen
        </button>
      </div>
    `).join('');
    
    resultsContainer.innerHTML = `
      <div class="bank-results-list">
        <h4>📋 Gefundene Banken für Waldhofstraße (${banks.length}):</h4>
        ${banksHtml}
      </div>
    `;
  }
  
  // Bank für Waldhofstraße auswählen
  window.selectBankForWaldhofstrasse = function(bankId, bankName) {
    console.log(`🏘️ Selecting bank ${bankId} (${bankName}) for Waldhofstraße`);
    
    // Bestätigungs-Dialog
    const confirmHtml = `
      <div class="dialog-overlay" id="waldhofstrasse-confirm-dialog">
        <div class="dialog-content">
          <h3>🏘️ Bankkonto für Waldhofstraße verbinden</h3>
          <p>Sie sind dabei, <strong>${bankName}</strong> für die <strong>Waldhofstraße</strong> zu verbinden.</p>
          
          <div class="account-purpose-selection">
            <h4>Verwendungszweck bestätigen:</h4>
            <label style="display: block; margin: 10px 0;">
              <input type="radio" name="waldhofstrasse-purpose" value="mietkonto" checked>
              💰 Dies ist mein Mietkonto für die Waldhofstraße
            </label>
            <label style="display: block; margin: 10px 0;">
              <input type="radio" name="waldhofstrasse-purpose" value="verwaltung">
              🏢 Dies ist mein Verwaltungskonto für die Waldhofstraße
            </label>
          </div>
          
          <div class="dialog-actions">
            <button class="cancel-btn" onclick="closeWaldhofstrasseDialog()">Abbrechen</button>
            <button class="confirm-btn" onclick="confirmWaldhofstrasseConnection(${bankId}, '${bankName}')">🔗 Verbindung herstellen</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', confirmHtml);
  };
  
  // Dialog schließen
  window.closeWaldhofstrasseDialog = function() {
    const dialog = document.getElementById('waldhofstrasse-confirm-dialog');
    if (dialog) dialog.remove();
  };
  
  // Verbindung bestätigen
  window.confirmWaldhofstrasseConnection = function(bankId, bankName) {
    const purposeElement = document.querySelector('input[name="waldhofstrasse-purpose"]:checked');
    const purpose = purposeElement ? purposeElement.value : 'mietkonto';
    
    closeWaldhofstrasseDialog();
    
    // Loading-Dialog
    const loadingHtml = `
      <div class="dialog-overlay" id="waldhofstrasse-loading-dialog">
        <div class="dialog-content">
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">🔄</div>
            <h3>Verbindung wird hergestellt...</h3>
            <p>Bitte warten Sie, während die Bankverbindung für die Waldhofstraße eingerichtet wird.</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHtml);
    
    // API-Call für Verbindung
    const apiUrl = window.location.hostname === 'localhost' ? 
      'http://localhost:3006' : 'https://psd2.clara360.de';
    
    fetch(`${apiUrl}/api/finapi/waldhofstrasse/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bankId: parseInt(bankId),
        accountPurpose: purpose,
        propertyObject: 'Waldhofstraße'
      })
    })
    .then(response => response.json())
    .then(data => {
      const loadingDialog = document.getElementById('waldhofstrasse-loading-dialog');
      if (loadingDialog) loadingDialog.remove();
      
      if (data.success && data.webform) {
        // WebForm in neuem Fenster öffnen
        const webformWindow = window.open(
          data.webform.url,
          'waldhofstrasse-banking',
          'width=800,height=600,scrollbars=yes,resizable=yes'
        );
        
        // Erfolgs-Dialog
        const successHtml = `
          <div class="dialog-overlay" id="waldhofstrasse-success-dialog">
            <div class="dialog-content">
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                <h3>WebForm geöffnet</h3>
                <p>Das Banking-Formular für die Waldhofstraße wurde in einem neuen Fenster geöffnet.</p>
                <p>Folgen Sie den Anweisungen zur Kontoverbindung.</p>
                <button class="action-btn primary" onclick="closeWaldhofstrasseSuccessDialog()">OK</button>
              </div>
            </div>
          </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', successHtml);
        
        // WebForm-Completion überwachen
        monitorWebFormCompletion(webformWindow);
        
      } else {
        showWaldhofstrasseError('Verbindung fehlgeschlagen', 
          data.error || 'Die Bankverbindung für die Waldhofstraße konnte nicht hergestellt werden.');
      }
    })
    .catch(error => {
      const loadingDialog = document.getElementById('waldhofstrasse-loading-dialog');
      if (loadingDialog) loadingDialog.remove();
      
      console.error('❌ Error creating Waldhofstraße connection:', error);
      showWaldhofstrasseError('Verbindung fehlgeschlagen', 
        'Die Bankverbindung für die Waldhofstraße konnte nicht hergestellt werden. Bitte versuchen Sie es später erneut.');
    });
  };
  
  // Erfolgs-Dialog schließen
  window.closeWaldhofstrasseSuccessDialog = function() {
    const dialog = document.getElementById('waldhofstrasse-success-dialog');
    if (dialog) dialog.remove();
  };
  
  // Fehler-Dialog anzeigen
  function showWaldhofstrasseError(title, message) {
    const errorHtml = `
      <div class="dialog-overlay" id="waldhofstrasse-error-dialog">
        <div class="dialog-content">
          <div style="text-align: center;">
            <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="action-btn primary" onclick="closeWaldhofstrasseErrorDialog()">OK</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', errorHtml);
  }
  
  // Fehler-Dialog schließen
  window.closeWaldhofstrasseErrorDialog = function() {
    const dialog = document.getElementById('waldhofstrasse-error-dialog');
    if (dialog) dialog.remove();
  };
  
  // WebForm-Completion überwachen
  function monitorWebFormCompletion(webformWindow) {
    const checkInterval = setInterval(() => {
      try {
        if (webformWindow.closed) {
          clearInterval(checkInterval);
          console.log('🔄 WebForm window closed, checking connection status...');
          
          // Nach 2 Sekunden Status prüfen
          setTimeout(() => {
            checkWaldhofstrasseConnection();
          }, 2000);
        }
      } catch (error) {
        // Cross-origin error ist erwartet
      }
    }, 1000);
    
    // Nach 10 Minuten aufhören zu überwachen
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 600000);
  }
  
  // Waldhofstraße-Verbindung prüfen
  function checkWaldhofstrasseConnection() {
    const apiUrl = window.location.hostname === 'localhost' ? 
      'http://localhost:3006' : 'https://psd2.clara360.de';
    
    fetch(`${apiUrl}/api/finapi/waldhofstrasse/accounts`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.accounts && data.accounts.length > 0) {
          console.log('✅ Waldhofstraße connection successful');
          showConnectedWaldhofstrasseView(data.accounts[0]);
          loadWaldhofstrasseKPIs(data.accounts[0].id);
        } else {
          console.log('ℹ️ No Waldhofstraße connection found yet');
        }
      })
      .catch(error => {
        console.error('❌ Error checking Waldhofstraße connection:', error);
      });
  }
  
  // Verbundene Konto-Ansicht anzeigen
  function showConnectedWaldhofstrasseView(account) {
    const bankingSection = document.querySelector('.waldhofstrasse-bank-selection');
    if (!bankingSection) return;
    
    bankingSection.innerHTML = `
      <div class="waldhofstrasse-connected-view">
        <div class="connection-status">
          <div class="status-header">
            <h2>✅ Waldhofstraße Bankkonto verbunden</h2>
            <div class="connection-badge">Aktiv</div>
          </div>
          
          <div class="account-info">
            <h3>📊 Verbundenes Konto</h3>
            <div class="account-item">
              <span class="account-label">Kontoinhaber:</span>
              <span class="account-value">${account.accountHolderName || 'Wird geladen...'}</span>
            </div>
            <div class="account-item">
              <span class="account-label">IBAN:</span>
              <span class="account-value">${account.iban || 'Wird geladen...'}</span>
            </div>
            <div class="account-item">
              <span class="account-label">Bank:</span>
              <span class="account-value">${account.bankName || 'Wird geladen...'}</span>
            </div>
            <div class="account-item">
              <span class="account-label">Verwendung:</span>
              <span class="account-value">🏘️ Mietkonto Waldhofstraße</span>
            </div>
          </div>
          
          <div class="account-actions">
            <button class="action-btn primary" onclick="refreshWaldhofstrasseData()">
              🔄 Daten aktualisieren
            </button>
            <button class="action-btn secondary" onclick="disconnectWaldhofstrasse()">
              🔌 Verbindung trennen
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  // Waldhofstraße KPIs laden
  function loadWaldhofstrasseKPIs(accountId) {
    const kpiDashboard = document.getElementById('waldhofstrasse-kpi-dashboard');
    if (!kpiDashboard) return;
    
    kpiDashboard.innerHTML = `
      <div class="kpi-header">
        <h2>📊 Waldhofstraße - Finanz-KPIs</h2>
        <div class="kpi-subtitle">Lade aktuelle Daten...</div>
      </div>
      <div class="kpi-loading">🔄 KPI-Daten werden geladen...</div>
    `;
    
    const apiUrl = window.location.hostname === 'localhost' ? 
      'http://localhost:3006' : 'https://psd2.clara360.de';
    
    fetch(`${apiUrl}/api/finapi/waldhofstrasse/kpis?accountId=${accountId}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.kpis) {
          displayWaldhofstrasseKPIs(data.kpis);
        } else {
          displayWaldhofstrasseKPIError();
        }
      })
      .catch(error => {
        console.error('❌ Error loading Waldhofstraße KPIs:', error);
        displayWaldhofstrasseKPIError();
      });
  }
  
  // KPI-Dashboard anzeigen
  function displayWaldhofstrasseKPIs(kpis) {
    const kpiDashboard = document.getElementById('waldhofstrasse-kpi-dashboard');
    if (!kpiDashboard) return;
    
    kpiDashboard.innerHTML = `
      <div class="kpi-header">
        <h2>📊 Waldhofstraße - Finanz-KPIs</h2>
        <div class="kpi-subtitle">Automatische Auswertungen • Letztes Update: ${new Date().toLocaleDateString('de-DE')}</div>
      </div>
      
      <div class="kpi-grid">
        <div class="kpi-card primary">
          <div class="kpi-icon">🏘️</div>
          <div class="kpi-content">
            <div class="kpi-title">Objekt-Kontostand</div>
            <div class="kpi-value">${formatCurrency(kpis.accountBalance)}</div>
            <div class="kpi-subtitle">Waldhofstraße</div>
          </div>
        </div>
        
        <div class="kpi-card success">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <div class="kpi-title">Mieteingang (90 Tage)</div>
            <div class="kpi-value">${formatCurrency(kpis.monthlyRentIncome)}</div>
            <div class="kpi-subtitle">${kpis.rentPaymentCount} Zahlungen</div>
          </div>
        </div>
        
        <div class="kpi-card ${kpis.latePayments > 0 ? 'warning' : 'success'}">
          <div class="kpi-icon">⏰</div>
          <div class="kpi-content">
            <div class="kpi-title">Verspätete Zahlungen</div>
            <div class="kpi-value">${kpis.latePayments}</div>
            <div class="kpi-subtitle">Nach dem 5. des Monats</div>
          </div>
        </div>
        
        <div class="kpi-card info">
          <div class="kpi-icon">📈</div>
          <div class="kpi-content">
            <div class="kpi-title">Bewegungen (30 Tage)</div>
            <div class="kpi-value">${kpis.transactionsLast30Days}</div>
            <div class="kpi-subtitle">Transaktionen</div>
          </div>
        </div>
        
        <div class="kpi-card success">
          <div class="kpi-icon">📥</div>
          <div class="kpi-content">
            <div class="kpi-title">Zufluss (30 Tage)</div>
            <div class="kpi-value">${formatCurrency(kpis.totalInflowLast30Days)}</div>
            <div class="kpi-subtitle">Eingänge</div>
          </div>
        </div>
        
        <div class="kpi-card warning">
          <div class="kpi-icon">📤</div>
          <div class="kpi-content">
            <div class="kpi-title">Abfluss (30 Tage)</div>
            <div class="kpi-value">${formatCurrency(kpis.totalOutflowLast30Days)}</div>
            <div class="kpi-subtitle">Ausgaben</div>
          </div>
        </div>
      </div>
      
      <div class="kpi-actions">
        <button class="action-btn primary" onclick="viewWaldhofstrasseTransactions()">
          📋 Kontobewegungen anzeigen
        </button>
        <button class="action-btn secondary" onclick="exportWaldhofstrasseKPIs()">
          📊 KPIs exportieren
        </button>
      </div>
    `;
  }
  
  // KPI-Fehler anzeigen
  function displayWaldhofstrasseKPIError() {
    const kpiDashboard = document.getElementById('waldhofstrasse-kpi-dashboard');
    if (!kpiDashboard) return;
    
    kpiDashboard.innerHTML = `
      <div class="kpi-header">
        <h2>📊 Waldhofstraße - Finanz-KPIs</h2>
        <div class="kpi-subtitle">Fehler beim Laden der Daten</div>
      </div>
      
      <div class="kpi-error">
        <div class="error-message">
          <h3>❌ KPI-Daten konnten nicht geladen werden</h3>
          <p>Bitte versuchen Sie es später erneut oder aktualisieren Sie die Kontodaten.</p>
          <button class="action-btn primary" onclick="checkWaldhofstrasseConnection()">🔄 Erneut versuchen</button>
        </div>
      </div>
    `;
  }
  
  // Utility-Funktionen
  function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  }
  
  // Visus-Ready-Status setzen
  function setVisusReadyStatus(ready) {
    // Status in localStorage speichern
    localStorage.setItem('waldhofstrasse_ui_ready', ready.toString());
    localStorage.setItem('waldhofstrasse_ui_timestamp', new Date().toISOString());
    
    // Event für andere Komponenten
    window.dispatchEvent(new CustomEvent('waldhofstrasseUIReady', {
      detail: { ready: ready, timestamp: new Date().toISOString() }
    }));
    
    console.log(`✅ Waldhofstraße UI Visus-Ready Status: ${ready}`);
  }
  
  // Global verfügbare Funktionen
  window.performBankSearch = performBankSearch;
  window.refreshWaldhofstrasseData = function() {
    console.log('🔄 Refreshing Waldhofstraße data...');
    checkWaldhofstrasseConnection();
  };
  
  window.disconnectWaldhofstrasse = function() {
    if (confirm('Möchten Sie die Bankverbindung für die Waldhofstraße wirklich trennen?')) {
      // Reset UI
      initializeWaldhofstrasseUI();
      console.log('🔌 Waldhofstraße connection disconnected');
    }
  };
  
  window.viewWaldhofstrasseTransactions = function() {
    console.log('📋 Viewing Waldhofstraße transactions...');
    // Hier würde eine Transaktions-Modal geöffnet
  };
  
  window.exportWaldhofstrasseKPIs = function() {
    console.log('📊 Exporting Waldhofstraße KPIs...');
    // Hier würde ein KPI-Export ausgelöst
  };
  
  // DOM Ready Check und Initialisierung
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWaldhofstrasseUI);
  } else {
    // DOM bereits geladen, sofort initialisieren
    setTimeout(initializeWaldhofstrasseUI, 100);
  }
  
  console.log('🏘️ Waldhofstraße UI Activator loaded successfully');
})();

