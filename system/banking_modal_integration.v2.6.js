// Clara360 Banking Modal Integration v2.6 - FIXED FINAPI WEBFORM INTEGRATION
// MetaGovernor SlotCommit Compliant Version
// CRITICAL FIX: Korrigierte FinAPI WebForm-Integration mit funktionierenden Credentials

console.log('🏦 Banking Modal Integration v2.6 loading - FIXED FINAPI INTEGRATION...');

// Wait for DOM to be ready
function waitForDOM(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// FinAPI Configuration - CORRECTED CREDENTIALS
const FINAPI_CONFIG = {
  baseUrl: 'https://psd2.clara360.de/api',
  clientId: '8cd21af4-49f2-42ac-84b5-c6236f9a2ae7',
  clientSecret: 'dea83606-52e1-4228-baef-250322e8c1c2'
};

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
  
  // Check if button already exists
  if (document.getElementById('clara-bank-add-btn')) {
    console.log('✅ Bank button already exists');
    return;
  }

  // Create Bank hinzufügen button
  const bankButton = document.createElement('button');
  bankButton.id = 'clara-bank-add-btn';
  bankButton.className = 'btn btn-primary';
  bankButton.innerHTML = '🏦 Bank hinzufügen';
  bankButton.style.cssText = `
    background: linear-gradient(135deg, #4299E1, #3182ce);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    margin: 10px;
    transition: all 0.3s ease;
  `;

  bankButton.addEventListener('mouseover', function() {
    this.style.transform = 'translateY(-2px)';
    this.style.boxShadow = '0 10px 20px rgba(66, 153, 225, 0.3)';
  });

  bankButton.addEventListener('mouseout', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = 'none';
  });

  bankButton.addEventListener('click', showBankModal);
  
  container.appendChild(bankButton);
  console.log('✅ Bank hinzufügen button added successfully');
}

// Show Bank Selection Modal - CORRECTED IMPLEMENTATION
function showBankModal() {
  console.log('🏦 Opening Bank Modal...');
  
  // Remove existing modal if present
  const existingModal = document.getElementById('clara-bank-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'clara-bank-modal';
  modalOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 15px;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  `;

  modalContent.innerHTML = `
    <div style="text-align: center;">
      <h2 style="margin-bottom: 10px; color: #2d3748;">Bank hinzufügen</h2>
      <p style="color: #666; margin-bottom: 30px;">Verbinden Sie Ihr Bankkonto sicher über FinAPI. Das Backend ist konfiguriert und bereit.</p>
      
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2d3748; text-align: left;">Bank auswählen:</label>
        <input type="text" id="bank-search" placeholder="Bank suchen (z.B. Sparkasse, Deutsche Bank)" 
               style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px;">
        <div id="bank-suggestions" style="margin-top: 10px; display: none;"></div>
      </div>

      <div style="margin-bottom: 30px; text-align: left;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2d3748;">Beliebte Banken:</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <button class="bank-preset" data-bank="Sparkasse" style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f7fafc; cursor: pointer;">🏛️ Sparkasse</button>
          <button class="bank-preset" data-bank="Deutsche Bank" style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f7fafc; cursor: pointer;">🏦 Deutsche Bank</button>
          <button class="bank-preset" data-bank="Commerzbank" style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f7fafc; cursor: pointer;">🏢 Commerzbank</button>
          <button class="bank-preset" data-bank="ING" style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f7fafc; cursor: pointer;">❤️ ING</button>
        </div>
      </div>

      <div style="display: flex; gap: 15px; justify-content: center;">
        <button id="cancel-btn" style="background: #e2e8f0; color: #2d3748; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">Abbrechen</button>
        <button id="connect-btn" style="background: linear-gradient(135deg, #4299E1, #3182ce); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">Zu FinAPI weiterleiten</button>
      </div>

      <div id="status-message" style="margin-top: 20px; padding: 10px; border-radius: 8px; display: none;"></div>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // Add event listeners
  setupModalEventListeners(modalOverlay);
}

// Setup Modal Event Listeners - CORRECTED FINAPI INTEGRATION
function setupModalEventListeners(modalOverlay) {
  const bankSearch = modalOverlay.querySelector('#bank-search');
  const bankSuggestions = modalOverlay.querySelector('#bank-suggestions');
  const cancelBtn = modalOverlay.querySelector('#cancel-btn');
  const connectBtn = modalOverlay.querySelector('#connect-btn');
  const statusMessage = modalOverlay.querySelector('#status-message');
  const bankPresets = modalOverlay.querySelectorAll('.bank-preset');

  let selectedBank = null;
  let searchTimeout = null;

  // Bank search functionality
  bankSearch.addEventListener('input', function() {
    const query = this.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      bankSuggestions.style.display = 'none';
      return;
    }

    searchTimeout = setTimeout(() => {
      searchBanks(query, bankSuggestions);
    }, 300);
  });

  // Bank preset buttons
  bankPresets.forEach(btn => {
    btn.addEventListener('click', function() {
      const bankName = this.dataset.bank;
      bankSearch.value = bankName;
      selectedBank = { name: bankName };
      showStatus('Bank ausgewählt: ' + bankName, 'success', statusMessage);
      
      // Highlight selected preset
      bankPresets.forEach(b => b.style.background = '#f7fafc');
      this.style.background = '#e6fffa';
    });
  });

  // Cancel button
  cancelBtn.addEventListener('click', function() {
    modalOverlay.remove();
  });

  // Connect button - CORRECTED FINAPI WEBFORM CREATION
  connectBtn.addEventListener('click', function() {
    if (!selectedBank && !bankSearch.value.trim()) {
      showStatus('Bitte wählen Sie zuerst eine Bank aus', 'error', statusMessage);
      return;
    }

    createFinAPIWebForm(selectedBank || { name: bankSearch.value.trim() }, statusMessage, connectBtn);
  });

  // Close modal when clicking outside
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
      modalOverlay.remove();
    }
  });
}

// Search Banks via FinAPI - CORRECTED IMPLEMENTATION
async function searchBanks(query, suggestionsContainer) {
  try {
    console.log('🔍 Searching banks for:', query);
    
    const response = await fetch(`${FINAPI_CONFIG.baseUrl}/search-institutions?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.institutions && data.institutions.length > 0) {
      displayBankSuggestions(data.institutions.slice(0, 5), suggestionsContainer);
    } else {
      suggestionsContainer.style.display = 'none';
    }
  } catch (error) {
    console.error('Bank search error:', error);
    suggestionsContainer.style.display = 'none';
  }
}

// Display Bank Suggestions
function displayBankSuggestions(banks, container) {
  container.innerHTML = banks.map(bank => 
    `<div class="bank-suggestion" data-bank-id="${bank.id}" data-bank-name="${bank.name}" 
          style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 5px; cursor: pointer; background: #f7fafc;">
      <strong>${bank.name}</strong><br>
      <small style="color: #666;">${bank.blz || ''}</small>
    </div>`
  ).join('');
  
  container.style.display = 'block';

  // Add click listeners to suggestions
  container.querySelectorAll('.bank-suggestion').forEach(suggestion => {
    suggestion.addEventListener('click', function() {
      const bankId = this.dataset.bankId;
      const bankName = this.dataset.bankName;
      
      document.querySelector('#bank-search').value = bankName;
      selectedBank = { id: bankId, name: bankName };
      container.style.display = 'none';
      
      showStatus('Bank ausgewählt: ' + bankName, 'success', document.querySelector('#status-message'));
    });
  });
}

// Create FinAPI WebForm - CORRECTED IMPLEMENTATION
async function createFinAPIWebForm(bank, statusContainer, button) {
  try {
    console.log('🔗 Creating FinAPI WebForm for bank:', bank.name);
    
    // Show loading state
    button.disabled = true;
    button.innerHTML = '⏳ Erstelle WebForm...';
    showStatus('WebForm wird erstellt...', 'info', statusContainer);

    const webFormData = {
      accountTypes: ['CHECKING', 'SAVINGS'],
      redirectUri: 'https://clara360.de/banking/callback',
      callbackUrl: 'https://clara360.de/api/webform-finished'
    };

    const response = await fetch(`${FINAPI_CONFIG.baseUrl}/webforms/bank-connection-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webFormData)
    });

    const data = await response.json();

    if (data.url && data.formId) {
      console.log('✅ WebForm created successfully:', data.formId);
      showStatus('WebForm erfolgreich erstellt! Weiterleitung...', 'success', statusContainer);
      
      // Redirect to FinAPI WebForm
      setTimeout(() => {
        window.open(data.url, '_blank');
        document.getElementById('clara-bank-modal').remove();
      }, 1500);
    } else {
      throw new Error(data.message || 'WebForm-Erstellung fehlgeschlagen');
    }
  } catch (error) {
    console.error('WebForm creation error:', error);
    showStatus('Fehler bei der WebForm-Erstellung: ' + error.message, 'error', statusContainer);
    
    // Reset button
    button.disabled = false;
    button.innerHTML = 'Zu FinAPI weiterleiten';
  }
}

// Show Status Message
function showStatus(message, type, container) {
  const colors = {
    success: { bg: '#f0fff4', color: '#22543d', border: '#9ae6b4' },
    error: { bg: '#fed7d7', color: '#742a2a', border: '#feb2b2' },
    info: { bg: '#ebf8ff', color: '#2a4365', border: '#90cdf4' }
  };

  const style = colors[type] || colors.info;
  
  container.style.cssText = `
    background: ${style.bg};
    color: ${style.color};
    border: 1px solid ${style.border};
    padding: 10px;
    border-radius: 8px;
    margin-top: 20px;
    display: block;
    font-weight: 500;
  `;
  
  container.textContent = message;
}

// Initialize Banking Integration
function initBankingIntegration() {
  console.log('🚀 Initializing Banking Integration v2.6...');
  
  // Add banking button when DOM is ready
  waitForDOM(() => {
    // Try to add button immediately
    addBankingButton();
    
    // Also try when navigating to banking page
    const observer = new MutationObserver(() => {
      if (window.location.pathname.includes('banking') || 
          document.querySelector('[data-page="banking"]') ||
          document.querySelector('.banking-page')) {
        addBankingButton();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Retry every 5 seconds to ensure button is always present
    setInterval(addBankingButton, 5000);
  });
}

// Auto-initialize when script loads
initBankingIntegration();

console.log('✅ Banking Modal Integration v2.6 loaded successfully - FIXED FINAPI INTEGRATION');

