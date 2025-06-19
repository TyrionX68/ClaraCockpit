// Clara360 Banking Modal Integration v2.7 - FIXED PLACEMENT AND CACHING
// MetaGovernor SlotCommit Compliant Version
// CRITICAL FIX: Bank-Button nur im Banking-Bereich, nicht im Login

console.log('🏦 Banking Modal Integration v2.7 loading - FIXED PLACEMENT...');

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
  baseUrl: 'https://api.finapi.io/api/v2',
  clientId: '8cd21af4-49f2-42ac-84b5-c6236f9a2ae7',
  clientSecret: 'dea83606-52e1-4228-baef-250322e8c1c2'
};

// Check if we're in banking context - CRITICAL FIX
function isBankingContext() {
  // Check URL path
  if (window.location.pathname.includes('banking')) return true;
  
  // Check for banking page indicators
  if (document.querySelector('[data-page="banking"]')) return true;
  if (document.querySelector('.banking-page')) return true;
  if (document.querySelector('.banking-container')) return true;
  
  // Check for banking-related text content
  const pageText = document.body.textContent.toLowerCase();
  if (pageText.includes('banking') && pageText.includes('konto')) return true;
  
  // Check for login context (should NOT show button)
  if (document.querySelector('input[type="password"]')) return false;
  if (document.querySelector('.login-form')) return false;
  if (document.querySelector('[data-page="login"]')) return false;
  
  return false;
}

// Add Bank Button Function - FIXED PLACEMENT
function addBankingButton() {
  console.log('🔧 Checking if banking button should be added...');
  
  // CRITICAL: Only add button in banking context
  if (!isBankingContext()) {
    console.log('❌ Not in banking context - skipping button');
    return;
  }
  
  console.log('✅ In banking context - adding button');
  
  // Find button container in banking page
  const buttonContainers = [
    document.querySelector('.banking-actions'),
    document.querySelector('.banking-controls'),
    document.querySelector('.banking-toolbar'),
    document.querySelector('button[data-action]')?.parentElement,
    document.querySelector('.btn-group'),
    // Fallback: any button container in banking context
    ...Array.from(document.querySelectorAll('div')).filter(div => 
      div.querySelector('button') && 
      div.textContent.toLowerCase().includes('bank')
    )
  ].filter(Boolean);
  
  if (buttonContainers.length === 0) {
    console.log('⏳ Banking button container not found, retrying in 2s...');
    setTimeout(addBankingButton, 2000);
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
  bankButton.className = 'btn btn-primary clara-banking-btn';
  bankButton.innerHTML = '🏦 Bank hinzufügen';
  bankButton.style.cssText = `
    background: linear-gradient(135deg, #4299E1, #3182ce);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    margin: 10px;
    transition: all 0.3s ease;
    font-size: 14px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `;

  bankButton.addEventListener('mouseover', function() {
    this.style.transform = 'translateY(-2px)';
    this.style.boxShadow = '0 10px 20px rgba(66, 153, 225, 0.3)';
  });

  bankButton.addEventListener('mouseout', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
  });

  bankButton.addEventListener('click', showBankModal);
  
  container.appendChild(bankButton);
  console.log('✅ Bank hinzufügen button added successfully to banking area');
}

// Remove Bank Button from Login Area - NEW FUNCTION
function removeBankButtonFromLogin() {
  const loginButtons = document.querySelectorAll('#clara-bank-add-btn');
  loginButtons.forEach(btn => {
    if (!isBankingContext()) {
      console.log('🗑️ Removing bank button from login area');
      btn.remove();
    }
  });
}

// Show Bank Selection Modal - IMPROVED UI
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
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
  `;

  // Create modal content - IMPROVED DESIGN
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 550px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    transform: scale(0.9);
    animation: modalAppear 0.3s ease forwards;
  `;

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes modalAppear {
      to {
        transform: scale(1);
      }
    }
    .bank-preset:hover {
      background: #e6fffa !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .bank-suggestion:hover {
      background: #f0f9ff !important;
      transform: translateX(4px);
    }
  `;
  document.head.appendChild(style);

  modalContent.innerHTML = `
    <div style="text-align: center;">
      <div style="background: linear-gradient(135deg, #4299E1, #3182ce); width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🏦</div>
      <h2 style="margin-bottom: 10px; color: #2d3748; font-size: 24px; font-weight: 700;">Bank hinzufügen</h2>
      <p style="color: #666; margin-bottom: 30px; font-size: 16px; line-height: 1.5;">Verbinden Sie Ihr Bankkonto sicher über FinAPI. Ihre Daten werden verschlüsselt übertragen.</p>
      
      <div style="margin-bottom: 25px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2d3748; text-align: left; font-size: 14px;">Bank suchen:</label>
        <input type="text" id="bank-search" placeholder="z.B. Sparkasse, Deutsche Bank, Volksbank..." 
               style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 16px; transition: border-color 0.3s ease;">
        <div id="bank-suggestions" style="margin-top: 10px; display: none;"></div>
      </div>

      <div style="margin-bottom: 30px; text-align: left;">
        <label style="display: block; margin-bottom: 12px; font-weight: 600; color: #2d3748; font-size: 14px;">Beliebte Banken:</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button class="bank-preset" data-bank="Sparkasse" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; background: #f7fafc; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">🏛️ Sparkasse</button>
          <button class="bank-preset" data-bank="Deutsche Bank" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; background: #f7fafc; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">🏦 Deutsche Bank</button>
          <button class="bank-preset" data-bank="Commerzbank" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; background: #f7fafc; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">🏢 Commerzbank</button>
          <button class="bank-preset" data-bank="ING" style="padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; background: #f7fafc; cursor: pointer; transition: all 0.3s ease; font-weight: 500;">🧡 ING</button>
        </div>
      </div>

      <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
        <button id="cancel-btn" style="background: #f7fafc; color: #4a5568; border: 2px solid #e2e8f0; padding: 14px 28px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">Abbrechen</button>
        <button id="connect-btn" style="background: linear-gradient(135deg, #4299E1, #3182ce); color: white; border: none; padding: 14px 28px; border-radius: 10px; cursor: pointer; font-weight: 600; transition: all 0.3s ease; box-shadow: 0 4px 8px rgba(66, 153, 225, 0.3);">Zu FinAPI weiterleiten</button>
      </div>

      <div id="status-message" style="margin-top: 20px; padding: 12px; border-radius: 10px; display: none; font-weight: 500;"></div>
    </div>
  `;

  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // Add event listeners
  setupModalEventListeners(modalOverlay);
}

// Setup Modal Event Listeners - SAME AS BEFORE
function setupModalEventListeners(modalOverlay) {
  const bankSearch = modalOverlay.querySelector('#bank-search');
  const bankSuggestions = modalOverlay.querySelector('#bank-suggestions');
  const cancelBtn = modalOverlay.querySelector('#cancel-btn');
  const connectBtn = modalOverlay.querySelector('#connect-btn');
  const statusMessage = modalOverlay.querySelector('#status-message');
  const bankPresets = modalOverlay.querySelectorAll('.bank-preset');

  let selectedBank = null;
  let searchTimeout = null;

  // Focus on search input
  setTimeout(() => bankSearch.focus(), 100);

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
      bankPresets.forEach(b => {
        b.style.background = '#f7fafc';
        b.style.borderColor = '#e2e8f0';
      });
      this.style.background = '#e6fffa';
      this.style.borderColor = '#4299E1';
    });
  });

  // Cancel button
  cancelBtn.addEventListener('click', function() {
    modalOverlay.style.animation = 'modalDisappear 0.3s ease forwards';
    setTimeout(() => modalOverlay.remove(), 300);
  });

  // Connect button
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
      modalOverlay.style.animation = 'modalDisappear 0.3s ease forwards';
      setTimeout(() => modalOverlay.remove(), 300);
    }
  });

  // Add disappear animation
  const disappearStyle = document.createElement('style');
  disappearStyle.textContent = `
    @keyframes modalDisappear {
      to {
        opacity: 0;
        transform: scale(0.9);
      }
    }
  `;
  document.head.appendChild(disappearStyle);
}

// Search Banks via FinAPI - SAME AS BEFORE
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

// Display Bank Suggestions - IMPROVED STYLING
function displayBankSuggestions(banks, container) {
  container.innerHTML = banks.map(bank => 
    `<div class="bank-suggestion" data-bank-id="${bank.id}" data-bank-name="${bank.name}" 
          style="padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 6px; cursor: pointer; background: #f7fafc; transition: all 0.3s ease;">
      <strong style="color: #2d3748;">${bank.name}</strong><br>
      <small style="color: #666;">${bank.blz || 'BLZ nicht verfügbar'}</small>
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

// Create FinAPI WebForm - SAME AS BEFORE
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

// Show Status Message - IMPROVED STYLING
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
    padding: 12px;
    border-radius: 10px;
    margin-top: 20px;
    display: block;
    font-weight: 500;
    text-align: center;
  `;
  
  container.textContent = message;
}

// Initialize Banking Integration - FIXED LOGIC
function initBankingIntegration() {
  console.log('🚀 Initializing Banking Integration v2.7...');
  
  // Clean up any existing buttons in wrong places
  removeBankButtonFromLogin();
  
  // Add banking button when DOM is ready
  waitForDOM(() => {
    // Try to add button immediately if in banking context
    if (isBankingContext()) {
      addBankingButton();
    }
    
    // Monitor for navigation changes
    const observer = new MutationObserver(() => {
      // Remove button from login areas
      removeBankButtonFromLogin();
      
      // Add button only in banking context
      if (isBankingContext()) {
        addBankingButton();
      }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Also listen for URL changes (SPA navigation)
    let currentPath = window.location.pathname;
    setInterval(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname;
        console.log('🔄 Navigation detected:', currentPath);
        
        // Clean up and re-evaluate
        removeBankButtonFromLogin();
        if (isBankingContext()) {
          setTimeout(addBankingButton, 500);
        }
      }
    }, 1000);
  });
}

// Auto-initialize when script loads
initBankingIntegration();

console.log('✅ Banking Modal Integration v2.7 loaded successfully - FIXED PLACEMENT AND UI');

