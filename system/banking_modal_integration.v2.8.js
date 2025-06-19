// Clara360 Banking Modal Integration v2.8 - LIVE FinAPI
// Vollständige Live-Integration mit Bearer-Token-Authentifizierung

// FinAPI Configuration - LIVE CREDENTIALS
const FINAPI_CONFIG = {
  baseUrl: 'https://api.finapi.io/api/v2',
  clientId: '8cd21af4-49f2-42ac-84b5-c6236f9a2ae7',
  clientSecret: 'dea83606-52e1-4228-baef-250322e8c1c2'
};

// Token-Abruf mit korrekter OAuth-Authentifizierung
async function getFinAPIToken() {
  try {
    console.log('🔐 Requesting FinAPI access token...');
    
    const response = await fetch(`${FINAPI_CONFIG.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&scope=ALL_ACCOUNTS&client_id=${FINAPI_CONFIG.clientId}&client_secret=${FINAPI_CONFIG.clientSecret}`,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token request failed:', response.status, errorData);
      throw new Error(`Token-Abruf fehlgeschlagen: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Token erfolgreich erhalten');
    return data.access_token;
  } catch (error) {
    console.error('Token error:', error);
    throw new Error(`Token-Authentifizierung fehlgeschlagen: ${error.message}`);
  }
}

// WebForm mit Bearer-Token erstellen
async function createFinAPIWebForm(selectedBank, statusContainer) {
  try {
    console.log('🏦 Creating FinAPI WebForm for:', selectedBank);
    
    // Token abrufen
    const token = await getFinAPIToken();
    
    const webFormData = {
      accountTypes: ['CHECKING', 'SAVINGS'],
      redirectUri: 'https://clara360.de/banking/callback',
      callbackUrl: 'https://clara360.de/api/webform-finished'
    };

    const response = await fetch(`${FINAPI_CONFIG.baseUrl}/webForms/bankConnectionImport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webFormData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('WebForm creation failed:', response.status, errorData);
      throw new Error(`WebForm-Erstellung fehlgeschlagen: ${response.status}`);
    }

    const data = await response.json();

    if (data.url && data.formId) {
      console.log('✅ WebForm created successfully:', data.formId);
      showStatus('WebForm erfolgreich erstellt! Weiterleitung...', 'success', statusContainer);
      
      // Log für Audit
      console.log('📋 FinAPI WebForm URL:', data.url);
      
      // Redirect to FinAPI WebForm
      setTimeout(() => {
        window.location.href = data.url; // Direkte Weiterleitung statt neues Fenster
      }, 1500);
    } else {
      throw new Error(data.message || 'WebForm-Erstellung fehlgeschlagen');
    }
  } catch (error) {
    console.error('WebForm creation error:', error);
    showStatus('Fehler bei der WebForm-Erstellung: ' + error.message, 'error', statusContainer);
    
    // Log error für Debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      bank: selectedBank,
      endpoint: FINAPI_CONFIG.baseUrl
    };
    console.error('📋 Error Log:', errorLog);
  }
}

// Status-Anzeige Funktion
function showStatus(message, type, container) {
  if (container) {
    container.innerHTML = `<div class="status-${type}" style="padding: 10px; margin: 10px 0; border-radius: 5px; background: ${type === 'success' ? '#d4edda' : '#f8d7da'}; color: ${type === 'success' ? '#155724' : '#721c24'};">${message}</div>`;
  }
}

console.log('✅ Banking Modal Integration v2.8 - LIVE FinAPI loaded');
