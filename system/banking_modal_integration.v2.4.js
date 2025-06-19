// Clara360 Banking Modal Integration v2.4 - Backend-Proxy-Version
// MetaGovernor-Auftrag: Frontend-zu-Backend-Proxy-Umstellung
// Löst CORS-Problem und aktiviert vollständige FinAPI-Integration

console.log('🏦 Banking Modal Integration v2.4 - Backend-Proxy geladen');

// Status-Tracking für UI-Feedback
let isConnecting = false;
let connectionStatus = 'ready'; // ready, connecting, connected, error

// Backend-Proxy-Konfiguration (ersetzt direkte FinAPI-Calls)
const BACKEND_CONFIG = {
  baseURL: '', // Lokaler Backend-Proxy
  endpoints: {
    authenticate: '/api/finapi/authenticate',
    status: '/api/finapi/status',
    accounts: '/api/finapi/accounts',
    transactions: '/api/finapi/transactions'
  }
};

// API-Status über Backend prüfen
async function getApiEnvironment() {
  try {
    const response = await fetch(BACKEND_CONFIG.endpoints.status);
    if (!response.ok) {
      throw new Error('Backend nicht erreichbar');
    }
    const data = await response.json();
    console.log('🔍 Backend-Status:', data);
    return data;
  } catch (error) {
    console.error('❌ Backend-Status-Fehler:', error);
    return { status: 'error', message: error.message };
  }
}

// UI-Status aktualisieren
function updateConnectionStatus(status, message = '') {
  connectionStatus = status;
  const statusElement = document.querySelector('#banking-modal .status-display');
  
  if (statusElement) {
    switch (status) {
      case 'ready':
        statusElement.innerHTML = '📋 Status: Bereit für Bankverbindung';
        statusElement.className = 'status-display status-ready';
        break;
      case 'connecting':
        statusElement.innerHTML = '🔄 Verbindung wird aufgebaut...';
        statusElement.className = 'status-display status-connecting';
        break;
      case 'connected':
        statusElement.innerHTML = '✅ Bank erfolgreich verbunden!';
        statusElement.className = 'status-display status-connected';
        break;
      case 'error':
        statusElement.innerHTML = `❌ Verbindung fehlgeschlagen: ${message}`;
        statusElement.className = 'status-display status-error';
        break;
    }
  }
}

// KPI-Update triggern (MetaGovernor-Anforderung)
function triggerKPIUpdate() {
  try {
    // ClaraKPIUpdateEngine aktivieren
    if (window.ClaraKPIUpdateEngine && window.ClaraKPIUpdateEngine.updateBankingKPIs) {
      console.log('🔄 Triggere KPI-Update...');
      window.ClaraKPIUpdateEngine.updateBankingKPIs();
    }
    
    // bankingDataUpdated Event senden
    const event = new CustomEvent('bankingDataUpdated', {
      detail: { source: 'finapi_integration', timestamp: new Date().toISOString() }
    });
    document.dispatchEvent(event);
    console.log('📡 bankingDataUpdated Event gesendet');
    
  } catch (error) {
    console.error('❌ KPI-Update-Fehler:', error);
  }
}

// Hauptfunktion: Bank-Verbindung über Backend-Proxy
async function handleBankConnection(bank, username, pin) {
  // Mehrfach-Requests vermeiden
  if (isConnecting) {
    console.log('⚠️ Verbindung bereits in Bearbeitung...');
    return;
  }
  
  isConnecting = true;
  updateConnectionStatus('connecting');
  
  try {
    console.log('🔗 Starte Bank-Verbindung über Backend-Proxy...');
    
    // Backend-Proxy-Call (ersetzt direkte FinAPI-Calls)
    const response = await fetch(BACKEND_CONFIG.endpoints.authenticate, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client: 'metagovernor',
        bank: bank,
        username: username,
        pin: pin,
        timestamp: new Date().toISOString()
      })
    });
    
    // Response korrekt parsen (MetaGovernor-Kritikpunkt)
    if (!response.ok) {
      throw new Error(`Backend-Fehler: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Backend-Response:', data);
    
    // Erfolgsauswertung (MetaGovernor-Kritikpunkt: response.status == 200)
    if (response.status === 200 && data.status === 'token_stored') {
      console.log('🎉 Token erfolgreich gespeichert!');
      updateConnectionStatus('connected');
      
      // KPI-Update triggern
      setTimeout(() => {
        triggerKPIUpdate();
      }, 1000);
      
      // Modal nach Erfolg schließen
      setTimeout(() => {
        closeBankingModal();
      }, 2000);
      
      return {
        success: true,
        token: data.access_token,
        expires: data.expires_in,
        message: 'Bank erfolgreich verbunden'
      };
      
    } else {
      throw new Error(data.message || 'Unbekannter Backend-Fehler');
    }
    
  } catch (error) {
    console.error('❌ Banking-Verbindung fehlgeschlagen:', error);
    updateConnectionStatus('error', error.message);
    
    return {
      success: false,
      error: error.message
    };
    
  } finally {
    isConnecting = false;
  }
}

// Test-Verbindung über Backend
async function testConnection() {
  try {
    updateConnectionStatus('connecting');
    
    const response = await fetch(BACKEND_CONFIG.endpoints.status);
    const data = await response.json();
    
    if (response.ok) {
      updateConnectionStatus('ready');
      console.log('✅ Backend-Verbindung erfolgreich:', data);
      return data;
    } else {
      throw new Error(data.message || 'Backend-Test fehlgeschlagen');
    }
    
  } catch (error) {
    console.error('❌ Backend-Test fehlgeschlagen:', error);
    updateConnectionStatus('error', error.message);
    return { success: false, error: error.message };
  }
}

// Banking-Modal schließen
function closeBankingModal() {
  const modal = document.getElementById('banking-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Event-Listener für Banking-Modal
document.addEventListener('DOMContentLoaded', function() {
  console.log('🏦 Banking Modal Integration v2.4 initialisiert');
  
  // Initial-Status setzen
  updateConnectionStatus('ready');
  
  // Backend-Status beim Start prüfen
  getApiEnvironment().then(status => {
    console.log('🔍 Initial Backend-Status:', status);
  });
  
  // Bank-Verbindung Button
  const connectButton = document.querySelector('#banking-modal .connect-button');
  if (connectButton) {
    connectButton.addEventListener('click', async function() {
      const bank = document.querySelector('#banking-modal .bank-select')?.value;
      const username = document.querySelector('#banking-modal .username-input')?.value;
      const pin = document.querySelector('#banking-modal .pin-input')?.value;
      
      if (!bank || !username || !pin) {
        updateConnectionStatus('error', 'Bitte alle Felder ausfüllen');
        return;
      }
      
      const result = await handleBankConnection(bank, username, pin);
      console.log('🔗 Verbindungsergebnis:', result);
    });
  }
  
  // Test-Verbindung Button
  const testButton = document.querySelector('#banking-modal .test-button');
  if (testButton) {
    testButton.addEventListener('click', async function() {
      const result = await testConnection();
      console.log('🧪 Test-Ergebnis:', result);
    });
  }
  
  // Modal schließen Button
  const closeButton = document.querySelector('#banking-modal .close-button');
  if (closeButton) {
    closeButton.addEventListener('click', closeBankingModal);
  }
});

// Global verfügbare Funktionen
window.bankingIntegration = {
  version: 'v2.4',
  type: 'backend-proxy',
  handleBankConnection,
  testConnection,
  updateConnectionStatus,
  triggerKPIUpdate,
  getApiEnvironment
};

console.log('✅ Banking Modal Integration v2.4 - Backend-Proxy vollständig geladen');

