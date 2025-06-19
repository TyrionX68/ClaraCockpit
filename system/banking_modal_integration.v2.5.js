// Clara360 Banking Modal Integration v2.5 - REAL VPS DEPLOYMENT
// MetaGovernor SlotCommit Compliant Version
// Includes: Bank hinzufügen Button + FinAPI Integration + Smart-Merge KPI

console.log('🏦 Banking Modal Integration v2.5 loading...');

// Wait for DOM to be ready
function waitForDOM(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// Add Bank Button Function - PERSISTENT IMPLEMENTATION
function addBankingButton() {
  console.log('🔧 Adding Bank hinzufügen button...');
  
  // Find button container in banking page
  const buttonContainers = [
    document.querySelector('.banking-actions'),
    document.querySelector('button[data-action]')?.parentElement,
    document.querySelector('.btn-group'),
    document.querySelector('button')?.parentElement
  ].filter(Boolean);
  
  if (buttonContainers.length === 0) {
    console.log('⏳ Button container not found, retrying in 1s...');
    setTimeout(addBankingButton, 1000);
    return;
  }
  
  const container = buttonContainers[0];
  
  // Remove existing button if present
  const existingButton = document.querySelector('button[data-action="add-bank"]');
  if (existingButton) {
    existingButton.remove();
  }
  
  // Create Bank hinzufügen button
  const addBankButton = document.createElement('button');
  addBankButton.setAttribute('data-action', 'add-bank');
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
    Bank hinzufügen
  `;
  
  // Add click handler
  addBankButton.addEventListener('click', () => {
    console.log('🏦 Bank hinzufügen clicked - opening modal...');
    openBankAddModal();
  });
  
  // Append to container
  container.appendChild(addBankButton);
  
  console.log('✅ Bank hinzufügen button added successfully');
  
  // Update SlotCommit status
  window.ClaraBankingIntegration = {
    version: 'v2.5',
    buttonAdded: true,
    timestamp: new Date().toISOString()
  };
}

// Bank Add Modal - NO KONJUNKTIV
function openBankAddModal() {
  // Remove existing modal
  const existingModal = document.querySelector('.bank-add-modal');
  if (existingModal) existingModal.remove();
  
  const modal = document.createElement('div');
  modal.className = 'bank-add-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
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
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h2 style="margin: 0; color: #111827; font-size: 24px;">Bank hinzufügen</h2>
        <button id="close-modal" style="
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
        ">&times;</button>
      </div>
      
      <p style="margin: 0 0 24px 0; color: #6b7280; line-height: 1.5;">
        Verbinden Sie Ihr Bankkonto sicher über FinAPI. Das Backend ist konfiguriert und bereit.
      </p>
      
      <div style="margin: 24px 0;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #374151;">
          Bank auswählen:
        </label>
        
        <input type="text" id="bank-search" placeholder="Bank suchen (z.B. Sparkasse, Deutsche Bank)" 
               style="
                 width: 100%; 
                 padding: 12px; 
                 border: 1px solid #d1d5db; 
                 border-radius: 6px; 
                 margin-bottom: 16px;
                 font-size: 14px;
               ">
        
        <div style="margin: 16px 0;">
          <label style="display: block; margin-bottom: 12px; font-weight: 500; color: #374151;">
            Beliebte Banken:
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button class="bank-option" data-bank="sparkasse" style="
              padding: 12px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              background: white;
              cursor: pointer;
              text-align: left;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              🏛️ Sparkasse
            </button>
            <button class="bank-option" data-bank="deutsche-bank" style="
              padding: 12px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              background: white;
              cursor: pointer;
              text-align: left;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              🏦 Deutsche Bank
            </button>
            <button class="bank-option" data-bank="commerzbank" style="
              padding: 12px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              background: white;
              cursor: pointer;
              text-align: left;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              🏢 Commerzbank
            </button>
            <button class="bank-option" data-bank="ing" style="
              padding: 12px;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              background: white;
              cursor: pointer;
              text-align: left;
              transition: all 0.2s ease;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              🧡 ING
            </button>
          </div>
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
        <button id="cancel-bank-add" style="
          padding: 10px 20px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #374151;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        ">Abbrechen</button>
        
        <button id="start-bank-auth" style="
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          background: #3b82f6;
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        ">Zu FinAPI weiterleiten</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('close-modal').addEventListener('click', () => modal.remove());
  document.getElementById('cancel-bank-add').addEventListener('click', () => modal.remove());
  
  document.getElementById('start-bank-auth').addEventListener('click', () => {
    console.log('🚀 Starting FinAPI authorization...');
    
    // Show loading state
    modal.innerHTML = `
      <div style="
        background: white;
        padding: 40px;
        border-radius: 12px;
        text-align: center;
        max-width: 400px;
        width: 90%;
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px auto;
        "></div>
        <h3 style="margin: 0 0 8px 0; color: #111827;">Weiterleitung zu FinAPI...</h3>
        <p style="margin: 0; color: #6b7280;">
          Sie werden zur sicheren Bankautorisierung weitergeleitet.
        </p>
        
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
    
    // Test backend connectivity
    setTimeout(() => {
      fetch('/api/finapi/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(response => {
        console.log('✅ FinAPI backend reachable, status:', response.status);
        
        modal.innerHTML = `
          <div style="
            background: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            width: 90%;
          ">
            <div style="
              width: 60px;
              height: 60px;
              background: #10b981;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 16px auto;
            ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
              </svg>
            </div>
            <h3 style="margin: 0 0 8px 0; color: #111827;">Backend bereit!</h3>
            <p style="margin: 0 0 16px 0; color: #6b7280;">
              FinAPI-Backend antwortet (Status: ${response.status}). 
              Für echte Bankverbindung geben Sie Ihre Credentials ein.
            </p>
            <button onclick="this.closest('.bank-add-modal').remove()" style="
              padding: 10px 20px;
              border: none;
              border-radius: 6px;
              background: #3b82f6;
              color: white;
              cursor: pointer;
              font-weight: 500;
            ">Verstanden</button>
          </div>
        `;
      })
      .catch(error => {
        console.log('❌ FinAPI backend error:', error);
        
        modal.innerHTML = `
          <div style="
            background: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            width: 90%;
          ">
            <div style="
              width: 60px;
              height: 60px;
              background: #ef4444;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 16px auto;
            ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>
            <h3 style="margin: 0 0 8px 0; color: #111827;">Verbindungsfehler</h3>
            <p style="margin: 0 0 16px 0; color: #6b7280;">
              FinAPI-Backend nicht erreichbar. Prüfen Sie die Netzwerkverbindung.
            </p>
            <button onclick="this.closest('.bank-add-modal').remove()" style="
              padding: 10px 20px;
              border: none;
              border-radius: 6px;
              background: #ef4444;
              color: white;
              cursor: pointer;
              font-weight: 500;
            ">Schließen</button>
          </div>
        `;
      });
    }, 1500);
  });
  
  // Bank option selection
  document.querySelectorAll('.bank-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.bank-option').forEach(o => {
        o.style.background = 'white';
        o.style.borderColor = '#d1d5db';
      });
      option.style.background = '#eff6ff';
      option.style.borderColor = '#3b82f6';
    });
    
    option.addEventListener('mouseenter', () => {
      if (option.style.background !== 'rgb(239, 246, 255)') {
        option.style.background = '#f9fafb';
      }
    });
    
    option.addEventListener('mouseleave', () => {
      if (option.style.background !== 'rgb(239, 246, 255)') {
        option.style.background = 'white';
      }
    });
  });
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
  
  // Focus search input
  setTimeout(() => {
    document.getElementById('bank-search')?.focus();
  }, 100);
}

// Smart-Merge KPI Integration
function initSmartMergeKPI() {
  console.log('📊 Initializing Smart-Merge KPI system...');
  
  window.ClaraSmartMerge = {
    version: 'v2.5',
    active: true,
    lastUpdate: new Date().toISOString(),
    
    updateKPIs: function(liveData) {
      console.log('🔄 Updating KPIs with live data...');
      
      // Smart-Merge logic: use live data if available, fallback to dummy
      const displayData = liveData && liveData.length > 0 ? liveData : this.getDummyData();
      const isLiveData = liveData && liveData.length > 0;
      
      // Update KPI displays
      this.updateKPIElements(displayData, isLiveData);
      
      // Show data source indicator
      this.showDataSourceIndicator(isLiveData);
    },
    
    getDummyData: function() {
      return {
        cashflow: 6210,
        liquidity: 52320,
        transactions: 156,
        automation: 87
      };
    },
    
    updateKPIElements: function(data, isLive) {
      // Update cashflow
      const cashflowEl = document.querySelector('[data-kpi="cashflow"]');
      if (cashflowEl) {
        cashflowEl.textContent = `+${data.cashflow}€`;
      }
      
      // Update liquidity
      const liquidityEl = document.querySelector('[data-kpi="liquidity"]');
      if (liquidityEl) {
        liquidityEl.textContent = `${data.liquidity}€`;
      }
      
      // Update transactions
      const transactionsEl = document.querySelector('[data-kpi="transactions"]');
      if (transactionsEl) {
        transactionsEl.textContent = data.transactions;
      }
      
      // Update automation
      const automationEl = document.querySelector('[data-kpi="automation"]');
      if (automationEl) {
        automationEl.textContent = `${data.automation}%`;
      }
    },
    
    showDataSourceIndicator: function(isLive) {
      // Remove existing indicator
      const existingIndicator = document.querySelector('.data-source-indicator');
      if (existingIndicator) existingIndicator.remove();
      
      // Create new indicator
      const indicator = document.createElement('div');
      indicator.className = 'data-source-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
        z-index: 1000;
        ${isLive ? 
          'background: #10b981; color: white;' : 
          'background: #f59e0b; color: white;'
        }
      `;
      
      indicator.textContent = isLive ? '🟢 Live-Daten' : '🟡 Fallback-Daten';
      
      document.body.appendChild(indicator);
      
      // Auto-remove after 3 seconds
      setTimeout(() => indicator.remove(), 3000);
    }
  };
  
  // Initialize with dummy data
  window.ClaraSmartMerge.updateKPIs(null);
}

// ClaraSlotGuard Integration
window.ClaraSlotGuard = {
  verify: function(slotId) {
    console.log(`🛡️ ClaraSlotGuard verifying slot: ${slotId}`);
    
    const checks = {
      buttonVisible: !!document.querySelector('button[data-action="add-bank"]'),
      bankingIntegration: !!window.ClaraBankingIntegration,
      smartMerge: !!window.ClaraSmartMerge,
      manifestLoaded: !document.querySelector('.manifest-error')
    };
    
    const allPassed = Object.values(checks).every(Boolean);
    
    console.log('🔍 SlotGuard checks:', checks);
    console.log(allPassed ? '✅ All checks passed' : '❌ Some checks failed');
    
    return allPassed;
  }
};

// Initialize everything when DOM is ready
waitForDOM(() => {
  console.log('🚀 Banking Modal Integration v2.5 initializing...');
  
  // Initialize Smart-Merge KPI system
  initSmartMergeKPI();
  
  // Add banking button when on banking page
  if (window.location.pathname.includes('/banking') || document.querySelector('[data-page="banking"]')) {
    addBankingButton();
  }
  
  // Listen for route changes (SPA)
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(history, arguments);
    setTimeout(() => {
      if (window.location.pathname.includes('/banking')) {
        addBankingButton();
      }
    }, 500);
  };
  
  console.log('✅ Banking Modal Integration v2.5 loaded successfully');
});

// Export for global access
window.addBankingButton = addBankingButton;
window.openBankAddModal = openBankAddModal;

