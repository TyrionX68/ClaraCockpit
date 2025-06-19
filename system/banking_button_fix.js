// Clara360 Banking Button Fix - Direct Implementation
// Adds "Bank hinzufügen" button to Banking page header

function addBankingButtonDirect() {
  console.log('🔧 Adding Banking Button directly to header...');
  
  // Remove existing button if present
  const existingBtn = document.getElementById('clara-bank-add-btn-direct');
  if (existingBtn) {
    existingBtn.remove();
  }
  
  // Find the banking page header with existing buttons
  const headerSelectors = [
    'div:has(button:contains("Überweisung"))',
    'div:has(button:contains("Kontoauszug"))',
    '.banking-header',
    '.page-header',
    'h1:contains("Banking"):parent',
    // Fallback: any div with buttons in banking context
    'div:has(button)'
  ];
  
  let buttonContainer = null;
  
  // Try to find container with existing buttons
  for (const selector of headerSelectors) {
    try {
      if (selector.includes(':contains') || selector.includes(':has')) {
        // Manual search for containers with specific text/elements
        const allDivs = document.querySelectorAll('div');
        for (const div of allDivs) {
          const buttons = div.querySelectorAll('button');
          if (buttons.length > 0) {
            const buttonTexts = Array.from(buttons).map(btn => btn.textContent.toLowerCase());
            if (buttonTexts.some(text => text.includes('überweisung') || text.includes('kontoauszug'))) {
              buttonContainer = div;
              break;
            }
          }
        }
      } else {
        buttonContainer = document.querySelector(selector);
      }
      
      if (buttonContainer) break;
    } catch (e) {
      console.log('Selector failed:', selector);
    }
  }
  
  // If no specific container found, create one in the page header
  if (!buttonContainer) {
    console.log('Creating new button container...');
    const pageHeader = document.querySelector('h1') || document.querySelector('.page-title') || document.body;
    buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
      z-index: 1000;
    `;
    pageHeader.parentElement.style.position = 'relative';
    pageHeader.parentElement.appendChild(buttonContainer);
  }
  
  // Create the "Bank hinzufügen" button
  const bankButton = document.createElement('button');
  bankButton.id = 'clara-bank-add-btn-direct';
  bankButton.innerHTML = '🏦 Bank hinzufügen';
  bankButton.style.cssText = `
    background: linear-gradient(135deg, #4299E1, #3182ce);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(66, 153, 225, 0.3);
    transition: all 0.3s ease;
    margin-left: 10px;
  `;
  
  // Add hover effects
  bankButton.addEventListener('mouseover', function() {
    this.style.transform = 'translateY(-2px)';
    this.style.boxShadow = '0 4px 12px rgba(66, 153, 225, 0.4)';
  });
  
  bankButton.addEventListener('mouseout', function() {
    this.style.transform = 'translateY(0)';
    this.style.boxShadow = '0 2px 8px rgba(66, 153, 225, 0.3)';
  });
  
  // Add click handler to open FinAPI WebForm
  bankButton.addEventListener('click', function() {
    console.log('🏦 Bank hinzufügen clicked - opening FinAPI WebForm...');
    
    // Call existing modal function if available
    if (typeof showBankModal === 'function') {
      showBankModal();
    } else {
      // Direct FinAPI WebForm creation
      createFinAPIWebFormDirect();
    }
  });
  
  buttonContainer.appendChild(bankButton);
  console.log('✅ Bank hinzufügen button added successfully!');
}

// Direct FinAPI WebForm creation
async function createFinAPIWebFormDirect() {
  try {
    console.log('🔗 Creating FinAPI WebForm directly...');
    
    const webFormData = {
      accountTypes: ['CHECKING', 'SAVINGS'],
      redirectUri: 'https://clara360.de/banking/callback',
      callbackUrl: 'https://clara360.de/api/webform-finished'
    };
    
    const response = await fetch('/api/finapi/waldhofstrasse/webforms/bank-connection-import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webFormData)
    });
    
    const data = await response.json();
    
    if (data.url) {
      console.log('✅ WebForm created, redirecting...');
      window.open(data.url, '_blank');
    } else {
      throw new Error('WebForm URL not received');
    }
  } catch (error) {
    console.error('WebForm creation error:', error);
    alert('Fehler beim Erstellen der Bankverbindung. Bitte versuchen Sie es später erneut.');
  }
}

// Initialize when DOM is ready
function initBankingButtonFix() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addBankingButtonDirect);
  } else {
    addBankingButtonDirect();
  }
  
  // Also add on navigation changes (SPA)
  let currentPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      if (currentPath.includes('banking')) {
        setTimeout(addBankingButtonDirect, 1000);
      }
    }
  }, 1000);
}

// Auto-initialize
initBankingButtonFix();
console.log('✅ Banking Button Fix loaded - Direct implementation');
