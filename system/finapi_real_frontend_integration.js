// Real FinAPI Frontend Integration - NO MOCKUPS
// Connects to real backend endpoints on port 3001

console.log('🔐 Real FinAPI Frontend Integration loading...');

// Real FinAPI Frontend Configuration
const REAL_FINAPI_CONFIG = {
  backendUrl: window.location.origin, // https://clara360.de
  endpoints: {
    search: '/api/finapi/institutions/search',
    oauthStart: '/api/finapi/oauth/start', 
    accounts: '/api/finapi/accounts',
    transactions: '/api/finapi/transactions',
    health: '/api/finapi/health'
  }
};

// Real Bank Search Function - NO MOCKUPS
async function realBankSearch(query) {
  console.log('🔍 Real bank search via backend:', query);
  
  try {
    const response = await fetch(REAL_FINAPI_CONFIG.backendUrl + REAL_FINAPI_CONFIG.endpoints.search, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        search: query,
        limit: 10
      })
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Real banks found:', data.institutions?.length || 0);
    return data.institutions || [];

  } catch (error) {
    console.error('❌ Real bank search error:', error);
    return [];
  }
}

// Real OAuth Start Function - NO MOCKUPS
async function startRealOAuth(bankId) {
  console.log('🚀 Starting REAL OAuth flow for bank:', bankId);
  
  try {
    const state = `clara360_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store state for verification
    sessionStorage.setItem('finapi_oauth_state', state);
    sessionStorage.setItem('finapi_selected_bank', bankId);

    const response = await fetch(REAL_FINAPI_CONFIG.backendUrl + REAL_FINAPI_CONFIG.endpoints.oauthStart, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bankId: bankId,
        state: state
      })
    });

    if (!response.ok) {
      throw new Error(`OAuth start failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.redirectUrl) {
      console.log('🔗 Redirecting to real FinAPI OAuth:', data.redirectUrl);
      
      // REAL REDIRECT - NO POPUP, NO MOCK
      window.location.href = data.redirectUrl;
    } else {
      throw new Error('Invalid OAuth response');
    }

  } catch (error) {
    console.error('❌ Real OAuth start error:', error);
    alert(`OAuth-Start fehlgeschlagen: ${error.message}`);
  }
}

// Real Bank Add Modal - NO MOCKUPS
function openRealBankModal() {
  console.log('🏦 Opening REAL bank modal with live search...');
  
  // Remove existing modal
  const existingModal = document.querySelector('.real-bank-modal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.className = 'real-bank-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 32px;
      border-radius: 12px;
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 style="margin: 0; color: #111827; font-size: 24px; font-weight: 600;">Echte Bank verbinden</h2>
        <button id="close-real-modal" style="
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          line-height: 1;
        ">&times;</button>
      </div>
      
      <div style="
        background: #dbeafe;
        border: 1px solid #3b82f6;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
      ">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="color: #3b82f6; font-size: 18px;">🔐</span>
          <strong style="color: #1e40af;">Echter FinAPI OAuth-Flow</strong>
        </div>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          Sie werden zur echten FinAPI-Autorisierung weitergeleitet. 
          Geben Sie dort Ihre echten Online-Banking-Zugangsdaten ein.
        </p>
      </div>
      
      <div style="margin: 24px 0;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
          Bank suchen (live via FinAPI):
        </label>
        
        <input type="text" id="real-bank-search" placeholder="Bank suchen (z.B. Sparkasse Heidelberg, Deutsche Bank)" 
               style="
                 width: 100%; 
                 padding: 12px; 
                 border: 1px solid #d1d5db; 
                 border-radius: 6px; 
                 margin-bottom: 16px;
                 font-size: 14px;
                 box-sizing: border-box;
               ">
        
        <div id="real-bank-results" style="
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          display: none;
        "></div>
        
        <div id="real-search-status" style="
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-style: italic;
        ">
          Geben Sie den Namen Ihrer Bank ein für live Suche...
        </div>
      </div>
      
      <div style="
        display: flex; 
        gap: 12px; 
        justify-content: flex-end;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;
      ">
        <button id="cancel-real-bank" style="
          padding: 10px 20px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        ">Abbrechen</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Real search functionality
  const searchInput = document.getElementById('real-bank-search');
  const resultsDiv = document.getElementById('real-bank-results');
  const statusDiv = document.getElementById('real-search-status');
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length < 3) {
      resultsDiv.style.display = 'none';
      statusDiv.style.display = 'block';
      statusDiv.textContent = 'Mindestens 3 Zeichen für live Suche...';
      return;
    }
    
    statusDiv.style.display = 'block';
    statusDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <div style="
          width: 16px;
          height: 16px;
          border: 2px solid #f3f4f6;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        Live-Suche nach "${query}" via FinAPI...
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    searchTimeout = setTimeout(async () => {
      const banks = await realBankSearch(query);
      
      if (banks.length === 0) {
        statusDiv.textContent = `Keine Banken gefunden für "${query}" (live FinAPI)`;
        resultsDiv.style.display = 'none';
        return;
      }
      
      statusDiv.style.display = 'none';
      resultsDiv.style.display = 'block';
      
      resultsDiv.innerHTML = banks.map(bank => `
        <div class="real-bank-result" data-bank-id="${bank.id}" style="
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          transition: background 0.2s ease;
        ">
          <div style="font-weight: 500; color: #111827;">${bank.name}</div>
          <div style="font-size: 12px; color: #6b7280;">
            BLZ: ${bank.blz || 'N/A'} | BIC: ${bank.bic || 'N/A'}
          </div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">
            ID: ${bank.id} (live FinAPI)
          </div>
        </div>
      `).join('');
      
      // Real bank selection handlers
      document.querySelectorAll('.real-bank-result').forEach(result => {
        result.addEventListener('click', () => {
          const bankId = result.dataset.bankId;
          const bankName = result.querySelector('div').textContent;
          
          console.log('🏦 Real bank selected:', bankName, 'ID:', bankId);
          
          // Close modal
          modal.remove();
          
          // Start REAL OAuth flow
          startRealOAuth(bankId);
        });
        
        result.addEventListener('mouseenter', () => {
          result.style.background = '#f9fafb';
        });
        
        result.addEventListener('mouseleave', () => {
          result.style.background = 'white';
        });
      });
    }, 500);
  });
  
  // Event listeners
  document.getElementById('close-real-modal').addEventListener('click', () => modal.remove());
  document.getElementById('cancel-real-bank').addEventListener('click', () => modal.remove());
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  // Focus search input
  setTimeout(() => searchInput.focus(), 100);
}

// Real Account Data Fetcher - NO MOCKUPS
async function fetchRealAccounts() {
  console.log('📊 Fetching real account data...');
  
  try {
    const response = await fetch(REAL_FINAPI_CONFIG.backendUrl + REAL_FINAPI_CONFIG.endpoints.accounts);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('⚠️ No bank connected yet');
        return null;
      }
      throw new Error(`Accounts fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Real accounts fetched:', data.accounts?.length || 0);
    return data;

  } catch (error) {
    console.error('❌ Real accounts fetch error:', error);
    return null;
  }
}

// Real Transaction Data Fetcher - NO MOCKUPS
async function fetchRealTransactions() {
  console.log('💳 Fetching real transaction data...');
  
  try {
    const response = await fetch(REAL_FINAPI_CONFIG.backendUrl + REAL_FINAPI_CONFIG.endpoints.transactions);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('⚠️ No bank connected yet');
        return null;
      }
      throw new Error(`Transactions fetch failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Real transactions fetched:', data.transactions?.length || 0);
    return data;

  } catch (error) {
    console.error('❌ Real transactions fetch error:', error);
    return null;
  }
}

// Real Banking Button Integration - NO MOCKUPS
function addRealBankingButton() {
  console.log('🔧 Adding REAL banking button...');
  
  // Find button container
  const buttonContainers = [
    document.querySelector('.banking-actions'),
    document.querySelector('button[data-action]')?.parentElement,
    document.querySelector('.btn-group'),
    document.querySelector('button')?.parentElement
  ].filter(Boolean);
  
  if (buttonContainers.length === 0) {
    console.log('⚠️ No button container found, retrying...');
    setTimeout(addRealBankingButton, 1000);
    return;
  }
  
  const container = buttonContainers[0];
  
  // Remove existing button
  const existingButton = document.querySelector('button[data-action="real-add-bank"]');
  if (existingButton) existingButton.remove();
  
  // Create REAL banking button
  const addBankButton = document.createElement('button');
  addBankButton.setAttribute('data-action', 'real-add-bank');
  addBankButton.style.cssText = `
    background: #10b981;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 12px;
    position: relative;
    z-index: 100;
  `;
  
  addBankButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
    </svg>
    Bank verbinden (ECHT)
  `;
  
  // REAL click handler
  addBankButton.addEventListener('click', () => {
    console.log('🏦 REAL Bank verbinden clicked...');
    openRealBankModal();
  });
  
  addBankButton.addEventListener('mouseenter', () => {
    addBankButton.style.background = '#059669';
  });
  
  addBankButton.addEventListener('mouseleave', () => {
    addBankButton.style.background = '#10b981';
  });
  
  container.appendChild(addBankButton);
  console.log('✅ REAL banking button added');
}

// Real Data Integration for KPIs - NO MOCKUPS
async function updateKPIsWithRealData() {
  console.log('📊 Updating KPIs with real banking data...');
  
  const accounts = await fetchRealAccounts();
  const transactions = await fetchRealTransactions();
  
  if (!accounts || !transactions) {
    console.log('⚠️ No real banking data available yet');
    return;
  }
  
  // Calculate real KPIs
  const totalBalance = accounts.accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
  const monthlyIncome = transactions.transactions?.filter(t => 
    t.amount > 0 && new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).reduce((sum, t) => sum + t.amount, 0) || 0;
  
  // Update UI with real data
  const liquidityElement = document.querySelector('#kpi-liquiditaet, [data-kpi="liquidity"]');
  if (liquidityElement) {
    liquidityElement.textContent = `${totalBalance.toFixed(2)}€`;
    console.log('✅ Updated liquidity with real data:', totalBalance);
  }
  
  const incomeElement = document.querySelector('#kpi-income, [data-kpi="income"]');
  if (incomeElement) {
    incomeElement.textContent = `${monthlyIncome.toFixed(2)}€`;
    console.log('✅ Updated income with real data:', monthlyIncome);
  }
  
  // Add real data indicator
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    z-index: 9999;
  `;
  indicator.textContent = '🔐 ECHTE BANKDATEN AKTIV';
  document.body.appendChild(indicator);
  
  setTimeout(() => indicator.remove(), 5000);
}

// Handle OAuth Callback - NO MOCKUPS
function handleRealOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get('success');
  const error = urlParams.get('error');
  
  if (success === 'bank_connected') {
    console.log('✅ Real bank connection successful!');
    
    // Show success message
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #10b981;
      color: white;
      padding: 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    `;
    successDiv.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
        <div>Bank erfolgreich verbunden!</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.9;">Echte Bankdaten werden geladen...</div>
      </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Update KPIs with real data
    setTimeout(() => {
      updateKPIsWithRealData();
      successDiv.remove();
    }, 3000);
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  if (error) {
    console.error('❌ Real OAuth error:', error);
    alert(`Bank-Verbindung fehlgeschlagen: ${error}`);
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// Initialize Real FinAPI Integration - NO MOCKUPS
function initRealFinAPIIntegration() {
  console.log('🚀 Initializing REAL FinAPI integration...');
  
  // Handle OAuth callback if present
  handleRealOAuthCallback();
  
  // Add real banking button
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addRealBankingButton);
  } else {
    addRealBankingButton();
  }
  
  // Export real functions globally
  window.openRealBankModal = openRealBankModal;
  window.startRealOAuth = startRealOAuth;
  window.realBankSearch = realBankSearch;
  window.fetchRealAccounts = fetchRealAccounts;
  window.fetchRealTransactions = fetchRealTransactions;
  window.updateKPIsWithRealData = updateKPIsWithRealData;
  
  // Auto-update KPIs if bank is already connected
  setTimeout(updateKPIsWithRealData, 2000);
  
  console.log('✅ REAL FinAPI integration initialized - NO MOCKUPS!');
}

// Start real integration
initRealFinAPIIntegration();

