// Modal Close Fix - Emergency Patch for Banking Integration
// Fixes the "Verstanden" button not closing the modal

console.log('🔧 Modal Close Fix loading...');

// Function to force close any banking modal
function forceCloseBankingModal() {
  console.log('🚨 Force closing banking modal...');
  
  // Find and remove any banking modal
  const modals = document.querySelectorAll('.bank-add-modal');
  modals.forEach(modal => {
    console.log('🗑️ Removing modal:', modal);
    modal.remove();
  });
  
  // Also remove any modal with "Backend bereit" text
  const allModals = document.querySelectorAll('[style*="position: fixed"]');
  allModals.forEach(modal => {
    if (modal.textContent.includes('Backend bereit') || 
        modal.textContent.includes('Verstanden') ||
        modal.textContent.includes('FinAPI-Backend')) {
      console.log('🗑️ Removing backend modal:', modal);
      modal.remove();
    }
  });
  
  console.log('✅ All banking modals closed');
}

// Enhanced modal close functionality
function enhanceModalClosing() {
  console.log('🔧 Enhancing modal closing functionality...');
  
  // Add global click handler for "Verstanden" buttons
  document.addEventListener('click', function(e) {
    if (e.target.textContent === 'Verstanden' || 
        e.target.textContent === 'Schließen' ||
        e.target.textContent === 'OK') {
      console.log('🎯 Verstanden button clicked - closing modal');
      
      // Find parent modal and close it
      let modal = e.target.closest('[style*="position: fixed"]');
      if (modal) {
        modal.remove();
        console.log('✅ Modal closed via Verstanden button');
      }
    }
  });
  
  // Add escape key handler
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      console.log('⌨️ Escape key pressed - closing modals');
      forceCloseBankingModal();
    }
  });
  
  // Add background click handler
  document.addEventListener('click', function(e) {
    if (e.target.style.position === 'fixed' && 
        e.target.style.background && 
        e.target.style.background.includes('rgba')) {
      console.log('🎯 Background clicked - closing modal');
      e.target.remove();
    }
  });
  
  console.log('✅ Modal closing enhancements active');
}

// Fix existing modals immediately
function fixExistingModals() {
  console.log('🔧 Fixing existing modals...');
  
  // Find all "Verstanden" buttons and fix their event handlers
  const verstandenButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent.includes('Verstanden')
  );
  
  verstandenButtons.forEach(button => {
    console.log('🔧 Fixing Verstanden button:', button);
    
    // Remove existing event listeners
    button.onclick = null;
    
    // Add new working event listener
    button.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🎯 Fixed Verstanden button clicked');
      
      // Find and close parent modal
      let modal = button.closest('[style*="position: fixed"]');
      if (!modal) {
        // Try to find modal by class
        modal = button.closest('.bank-add-modal');
      }
      if (!modal) {
        // Try to find any modal container
        modal = button.closest('div[style*="background: white"]')?.parentElement;
      }
      
      if (modal) {
        console.log('✅ Closing modal via fixed button');
        modal.remove();
      } else {
        console.log('⚠️ Modal not found, force closing all');
        forceCloseBankingModal();
      }
    });
    
    // Also add touch event for mobile
    button.addEventListener('touchend', function(e) {
      e.preventDefault();
      console.log('📱 Touch event on Verstanden button');
      button.click();
    });
  });
  
  console.log(`✅ Fixed ${verstandenButtons.length} Verstanden buttons`);
}

// Initialize modal fix
function initModalFix() {
  console.log('🚀 Initializing modal close fix...');
  
  // Fix existing modals
  fixExistingModals();
  
  // Enhance modal closing
  enhanceModalClosing();
  
  // Add global force close function
  window.forceCloseBankingModal = forceCloseBankingModal;
  
  // Monitor for new modals and fix them
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1 && 
            (node.classList?.contains('bank-add-modal') || 
             node.style?.position === 'fixed')) {
          console.log('🔍 New modal detected, fixing...');
          setTimeout(fixExistingModals, 100);
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('✅ Modal close fix initialized');
}

// Run immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initModalFix);
} else {
  initModalFix();
}

// Export for global access
window.initModalFix = initModalFix;
window.fixExistingModals = fixExistingModals;

