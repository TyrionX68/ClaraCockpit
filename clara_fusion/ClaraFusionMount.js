// ClaraFusionMount.js - Modular DOM Injection System
// Integrates Clara Fusion Engine into existing clara360.de structure

class ClaraFusionMount {
  constructor() {
    this.mountPoint = null;
    this.fusionEngine = null;
    this.isInitialized = false;
  }

  // Find or create integration slot
  findIntegrationSlot() {
    // Try to find existing clara-ki-slot
    let slot = document.getElementById('clara-ki-slot');
    
    if (!slot) {
      // Find chat container and create slot
      const chatContainer = document.querySelector('[class*="chat"]') || 
                           document.querySelector('input[placeholder*="Clara"]')?.parentElement?.parentElement;
      
      if (chatContainer) {
        slot = document.createElement('div');
        slot.id = 'clara-ki-slot';
        slot.className = 'clara-slot-manageable clara-fusion-container';
        
        // Insert after existing chat or replace it
        chatContainer.parentNode.insertBefore(slot, chatContainer.nextSibling);
        console.log('Created clara-ki-slot after existing chat container');
      } else {
        // Fallback: create in main content area
        const mainContent = document.querySelector('main') || document.body;
        slot = document.createElement('div');
        slot.id = 'clara-ki-slot';
        slot.className = 'clara-slot-manageable clara-fusion-container';
        slot.style.cssText = 'width: 100%; min-height: 400px; padding: 1rem; margin: 1rem 0;';
        mainContent.appendChild(slot);
        console.log('Created clara-ki-slot in main content area');
      }
    }
    
    return slot;
  }

  // Initialize Clara Fusion Engine
  async initializeFusionEngine() {
    try {
      // Import Clara Fusion components
      const { ClaraFusionEngine } = await import('./ClaraFusionEngine.jsx');
      const { ClaraResponseEnhancer } = await import('./ClaraResponseEnhancer.js');
      const { AdvancedContextualMemory } = await import('./AdvancedContextualMemory.js');
      
      // Create React root and render
      const React = window.React || await import('react');
      const ReactDOM = window.ReactDOM || await import('react-dom/client');
      
      if (ReactDOM.createRoot) {
        const root = ReactDOM.createRoot(this.mountPoint);
        root.render(React.createElement(ClaraFusionEngine, {
          mode: 'integrated',
          theme: 'clara360-anker',
          slot: 'clara-ki-slot'
        }));
        
        console.log('ClaraFusionEngine mounted in #clara-ki-slot');
        return true;
      } else {
        console.error('ReactDOM.createRoot not available');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Clara Fusion Engine:', error);
      return false;
    }
  }

  // Mount Clara Fusion Engine
  async mount() {
    try {
      // Find integration slot
      this.mountPoint = this.findIntegrationSlot();
      
      if (!this.mountPoint) {
        console.error('Could not find or create integration slot');
        return { status: 'error', message: 'No integration slot available' };
      }

      // Initialize fusion engine
      const success = await this.initializeFusionEngine();
      
      if (success) {
        this.isInitialized = true;
        console.log('Clara Fusion Engine successfully mounted');
        return { 
          status: 'mounted', 
          slotId: 'clara-ki-slot',
          hookName: 'ClaraFusionMount',
          message: 'Integration successful'
        };
      } else {
        return { status: 'error', message: 'Failed to initialize engine' };
      }
    } catch (error) {
      console.error('Mount failed:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Health check
  healthCheck() {
    return {
      mounted: this.isInitialized,
      slotExists: !!document.getElementById('clara-ki-slot'),
      engineActive: !!this.fusionEngine,
      timestamp: new Date().toISOString()
    };
  }

  // Unmount (for rollback)
  unmount() {
    if (this.mountPoint) {
      this.mountPoint.innerHTML = '';
      this.mountPoint.remove();
      this.isInitialized = false;
      console.log('Clara Fusion Engine unmounted');
    }
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.ClaraFusionMount = ClaraFusionMount;
  
  // Auto-mount when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      const mount = new ClaraFusionMount();
      const result = await mount.mount();
      console.log('Auto-mount result:', result);
    });
  } else {
    // DOM already loaded
    setTimeout(async () => {
      const mount = new ClaraFusionMount();
      const result = await mount.mount();
      console.log('Auto-mount result:', result);
    }, 1000);
  }
}

export default ClaraFusionMount;

