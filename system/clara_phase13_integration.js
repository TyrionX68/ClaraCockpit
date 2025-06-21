/**
 * Clara Phase 1.3 Integration Controller
 * Autonomous integration of WhatsApp, SmartLinks, and Document features
 * into existing Clara360 UI without disrupting core functionality
 */

class ClaraPhase13Controller {
  constructor() {
    this.initialized = false;
    this.modules = {};
    this.chatContainer = null;
    this.enhancementSlot = null;
    
    console.log('[CLARA PHASE 1.3] Controller initialized');
  }

  /**
   * Initialize Phase 1.3 features when DOM is ready
   */
  async init() {
    if (this.initialized) return;
    
    try {
      // Wait for React app to be ready
      await this.waitForReactApp();
      
      // Load Phase 1.3 modules
      await this.loadModules();
      
      // Create enhancement slots
      this.createEnhancementSlots();
      
      // Integrate features
      this.integrateFeatures();
      
      this.initialized = true;
      console.log('[CLARA PHASE 1.3] ✅ Successfully initialized');
      
    } catch (error) {
      console.error('[CLARA PHASE 1.3] ❌ Initialization failed:', error);
      this.rollback();
    }
  }

  /**
   * Wait for React app to be fully loaded
   */
  waitForReactApp() {
    return new Promise((resolve) => {
      const checkReact = () => {
        const root = document.getElementById('root');
        const claraChat = document.querySelector('[placeholder*="Clara"]');
        
        if (root && root.children.length > 0 && claraChat) {
          console.log('[CLARA PHASE 1.3] React app ready');
          resolve();
        } else {
          setTimeout(checkReact, 500);
        }
      };
      checkReact();
    });
  }

  /**
   * Load Phase 1.3 modules dynamically
   */
  async loadModules() {
    try {
      // Load modules as ES6 modules
      const [whatsappModule, smartLinksModule, documentsModule] = await Promise.all([
        import('/system/ClaraWhatsAppSuggester.js'),
        import('/system/SmartLinkResolver.js'),
        import('/system/DocumentRegistry.js')
      ]);
      
      this.modules.whatsapp = whatsappModule.ClaraWhatsAppSuggester || whatsappModule.default;
      this.modules.smartLinks = smartLinksModule.SmartLinkResolver || smartLinksModule.default;
      this.modules.documents = documentsModule.DocumentRegistry || documentsModule.default;
      
      console.log('[CLARA PHASE 1.3] ✅ All modules loaded');
      
    } catch (error) {
      console.error('[CLARA PHASE 1.3] ❌ Module loading failed:', error);
      throw error;
    }
  }

  /**
   * Create isolated enhancement slots in existing UI
   */
  createEnhancementSlots() {
    // Find Clara chat container
    this.chatContainer = document.querySelector('.clara-ki-chat') || 
                        document.querySelector('[class*="chat"]') ||
                        document.querySelector('input[placeholder*="Clara"]')?.closest('div');
    
    if (!this.chatContainer) {
      console.warn('[CLARA PHASE 1.3] Chat container not found, creating fallback');
      this.createFallbackContainer();
      return;
    }

    // Create enhancement slot
    this.enhancementSlot = document.createElement('div');
    this.enhancementSlot.id = 'clara-phase13-enhancement-slot';
    this.enhancementSlot.className = 'clara-slot-manageable';
    this.enhancementSlot.style.cssText = `
      margin-top: 10px;
      padding: 0;
      border: none;
      background: transparent;
    `;

    // Insert after chat input
    const chatInput = document.querySelector('input[placeholder*="Clara"]');
    if (chatInput && chatInput.parentNode) {
      chatInput.parentNode.insertBefore(this.enhancementSlot, chatInput.nextSibling);
    } else {
      this.chatContainer.appendChild(this.enhancementSlot);
    }

    console.log('[CLARA PHASE 1.3] ✅ Enhancement slot created');
  }

  /**
   * Create fallback container if chat not found
   */
  createFallbackContainer() {
    const mainContent = document.querySelector('main') || 
                       document.querySelector('.main-content') ||
                       document.getElementById('root');
    
    if (mainContent) {
      this.enhancementSlot = document.createElement('div');
      this.enhancementSlot.id = 'clara-phase13-fallback-slot';
      this.enhancementSlot.className = 'clara-slot-manageable';
      this.enhancementSlot.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
      `;
      
      mainContent.appendChild(this.enhancementSlot);
      console.log('[CLARA PHASE 1.3] ✅ Fallback container created');
    }
  }

  /**
   * Integrate Phase 1.3 features into UI
   */
  integrateFeatures() {
    if (!this.enhancementSlot) return;

    // Create feature container
    const featureContainer = document.createElement('div');
    featureContainer.innerHTML = `
      <div id="clara-whatsapp-integration" style="margin-bottom: 10px;"></div>
      <div id="clara-smartlinks-integration" style="margin-bottom: 10px;"></div>
      <div id="clara-documents-integration" style="margin-bottom: 10px;"></div>
    `;
    
    this.enhancementSlot.appendChild(featureContainer);

    // Hook into existing chat functionality
    this.hookChatEvents();

    console.log('[CLARA PHASE 1.3] ✅ Features integrated');
  }

  /**
   * Hook into existing chat events to trigger Phase 1.3 features
   */
  hookChatEvents() {
    const chatInput = document.querySelector('input[placeholder*="Clara"]');
    const sendButton = document.querySelector('button[type="submit"], button:contains("Senden")') ||
                      Array.from(document.querySelectorAll('button')).find(btn => 
                        btn.textContent.includes('Senden') || btn.textContent.includes('Send'));

    if (chatInput && sendButton) {
      // Override send functionality
      const originalClick = sendButton.onclick;
      sendButton.onclick = (e) => {
        const message = chatInput.value;
        this.processChatMessage(message);
        
        // Call original functionality
        if (originalClick) originalClick.call(sendButton, e);
      };

      // Also handle Enter key
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const message = chatInput.value;
          this.processChatMessage(message);
        }
      });

      console.log('[CLARA PHASE 1.3] ✅ Chat events hooked');
    }
  }

  /**
   * Process chat message and trigger appropriate Phase 1.3 features
   */
  processChatMessage(message) {
    if (!message || !this.modules) return;

    try {
      // Check for WhatsApp suggestions
      if (this.modules.whatsapp && this.modules.whatsapp.hasWhatsAppSuggestion) {
        const intent = this.detectIntent(message);
        const slots = this.extractSlots(message);
        
        if (this.modules.whatsapp.hasWhatsAppSuggestion(intent, slots)) {
          this.showWhatsAppSuggestion(intent, slots, message);
        }
      }

      // Check for SmartLinks
      if (this.modules.smartLinks && this.modules.smartLinks.hasSmartLinks) {
        const intent = this.detectIntent(message);
        
        if (this.modules.smartLinks.hasSmartLinks(intent)) {
          this.showSmartLinks(intent, message);
        }
      }

      // Check for Documents
      if (this.modules.documents && this.modules.documents.hasDocuments) {
        const intent = this.detectIntent(message);
        
        if (this.modules.documents.hasDocuments(intent)) {
          this.showDocuments(intent, message);
        }
      }

    } catch (error) {
      console.error('[CLARA PHASE 1.3] Error processing message:', error);
    }
  }

  /**
   * Simple intent detection (can be enhanced)
   */
  detectIntent(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('rückstand') || msg.includes('rückstände')) return 'rückstand';
    if (msg.includes('miete') || msg.includes('mieteinnahmen')) return 'miete';
    if (msg.includes('cashflow')) return 'cashflow';
    if (msg.includes('wartung') || msg.includes('heizung')) return 'wartung';
    if (msg.includes('vertrag') || msg.includes('dokument')) return 'dokument';
    
    return 'unknown';
  }

  /**
   * Simple slot extraction
   */
  extractSlots(message) {
    const slots = {};
    const msg = message.toLowerCase();
    
    if (msg.includes('waldhof')) slots.property = 'waldhofstraße';
    if (msg.includes('hauptstraße')) slots.property = 'hauptstraße';
    if (msg.includes('letzten monat')) slots.time = 'letzten monat';
    
    return slots;
  }

  /**
   * Show WhatsApp suggestion
   */
  showWhatsAppSuggestion(intent, slots, message) {
    const container = document.getElementById('clara-whatsapp-integration');
    if (!container) return;

    const suggestion = this.modules.whatsapp.generateWhatsAppSuggestion(intent, slots, message);
    
    container.innerHTML = `
      <div style="background: #e3f2fd; padding: 10px; border-radius: 6px; margin: 5px 0;">
        <div style="font-size: 12px; color: #1976d2; margin-bottom: 5px;">📱 WhatsApp-Nachricht</div>
        <div style="font-size: 14px; margin-bottom: 8px;">${suggestion.text}</div>
        <button onclick="window.open('${suggestion.whatsappUrl}', '_blank')" 
                style="background: #25d366; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
          📱 WhatsApp öffnen
        </button>
        <button onclick="navigator.clipboard.writeText('${suggestion.message}')" 
                style="background: #1976d2; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
          📋 Kopieren
        </button>
      </div>
    `;
  }

  /**
   * Show SmartLinks
   */
  showSmartLinks(intent, message) {
    const container = document.getElementById('clara-smartlinks-integration');
    if (!container) return;

    const links = this.modules.smartLinks.generateSmartLinks(intent, {}, message);
    
    if (links.hasSmartLinks) {
      const linksHtml = links.links.map(link => `
        <button onclick="window.open('${link.url}', '_blank')" 
                style="background: ${link.type === 'primary' ? '#1976d2' : '#757575'}; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin: 2px;">
          ${link.icon} ${link.title}
        </button>
      `).join('');

      container.innerHTML = `
        <div style="background: #f3e5f5; padding: 10px; border-radius: 6px; margin: 5px 0;">
          <div style="font-size: 12px; color: #7b1fa2; margin-bottom: 5px;">🔗 Relevante Links</div>
          <div>${linksHtml}</div>
        </div>
      `;
    }
  }

  /**
   * Show Documents
   */
  showDocuments(intent, message) {
    const container = document.getElementById('clara-documents-integration');
    if (!container) return;

    this.modules.documents.generateDocumentSuggestions(intent, {}, message).then(result => {
      if (result.hasDocuments) {
        const docsHtml = result.documents.map(doc => `
          <button onclick="window.open('${doc.url}', '_blank')" 
                  style="background: #ff9800; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin: 2px;">
            📄 ${doc.title}
          </button>
        `).join('');

        container.innerHTML = `
          <div style="background: #fff3e0; padding: 10px; border-radius: 6px; margin: 5px 0;">
            <div style="font-size: 12px; color: #f57c00; margin-bottom: 5px;">📄 Relevante Dokumente</div>
            <div>${docsHtml}</div>
          </div>
        `;
      }
    });
  }

  /**
   * Rollback function in case of errors
   */
  rollback() {
    console.log('[CLARA PHASE 1.3] 🔄 Rolling back changes...');
    
    // Remove enhancement slots
    const slots = document.querySelectorAll('.clara-slot-manageable');
    slots.forEach(slot => slot.remove());
    
    // Reset initialization flag
    this.initialized = false;
    
    console.log('[CLARA PHASE 1.3] ✅ Rollback completed');
  }

  /**
   * Health check function
   */
  healthCheck() {
    const checks = {
      initialized: this.initialized,
      modulesLoaded: Object.keys(this.modules).length > 0,
      slotsCreated: !!this.enhancementSlot,
      chatFound: !!document.querySelector('input[placeholder*="Clara"]')
    };

    const healthy = Object.values(checks).every(check => check);
    
    console.log('[CLARA PHASE 1.3] Health check:', checks, healthy ? '✅' : '❌');
    
    return { healthy, checks };
  }
}

// Initialize when DOM is ready
const claraPhase13 = new ClaraPhase13Controller();

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => claraPhase13.init());
} else {
  // DOM already loaded
  setTimeout(() => claraPhase13.init(), 1000);
}

// Health check every 30 seconds
setInterval(() => {
  const health = claraPhase13.healthCheck();
  if (!health.healthy) {
    console.warn('[CLARA PHASE 1.3] Health check failed, attempting recovery...');
    claraPhase13.rollback();
    setTimeout(() => claraPhase13.init(), 2000);
  }
}, 30000);

// Export for global access
window.ClaraPhase13Controller = claraPhase13;

console.log('[CLARA PHASE 1.3] 🚀 Integration script loaded');

