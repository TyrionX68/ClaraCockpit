/**
 * Clara Phase 1.3 React Hook Integration
 * Fallback solution for ES6 module import issues
 * Direct integration into React lifecycle
 */

// Legacy script loader for Phase 1.3 modules
const loadClaraPhase13Legacy = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.ClaraPhase13Modules) {
      resolve(window.ClaraPhase13Modules);
      return;
    }

    // Create script elements for each module
    const scripts = [
      '/system/ClaraWhatsAppSuggester.js',
      '/system/SmartLinkResolver.js', 
      '/system/DocumentRegistry.js'
    ];

    let loadedCount = 0;
    const modules = {};

    scripts.forEach((src, index) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        loadedCount++;
        console.log(`[CLARA PHASE 1.3] Loaded: ${src}`);
        
        if (loadedCount === scripts.length) {
          // All scripts loaded, initialize modules
          modules.whatsapp = window.ClaraWhatsAppSuggester;
          modules.smartLinks = window.SmartLinkResolver;
          modules.documents = window.DocumentRegistry;
          
          window.ClaraPhase13Modules = modules;
          resolve(modules);
        }
      };
      script.onerror = () => {
        console.error(`[CLARA PHASE 1.3] Failed to load: ${src}`);
        reject(new Error(`Failed to load ${src}`));
      };
      document.head.appendChild(script);
    });
  });
};

// React Hook for Clara Phase 1.3 Integration
const useClaraPhase13 = () => {
  const [initialized, setInitialized] = React.useState(false);
  const [modules, setModules] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const initializeClara = async () => {
      try {
        console.log('[CLARA PHASE 1.3] React Hook initialization started');
        
        // Wait for DOM to be ready
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve();
          } else {
            window.addEventListener('load', resolve);
          }
        });

        // Load modules using legacy script loading
        const loadedModules = await loadClaraPhase13Legacy();
        setModules(loadedModules);

        // Initialize enhancement features
        initializeEnhancements(loadedModules);
        
        setInitialized(true);
        console.log('[CLARA PHASE 1.3] ✅ React Hook initialization complete');
        
      } catch (err) {
        console.error('[CLARA PHASE 1.3] ❌ React Hook initialization failed:', err);
        setError(err);
      }
    };

    initializeClara();
  }, []);

  return { initialized, modules, error };
};

// Initialize enhancement features
const initializeEnhancements = (modules) => {
  // Find chat input
  const chatInput = document.querySelector('input[placeholder*="Clara"]');
  if (!chatInput) {
    console.warn('[CLARA PHASE 1.3] Chat input not found');
    return;
  }

  // Create enhancement container
  const enhancementContainer = document.createElement('div');
  enhancementContainer.id = 'clara-phase13-react-enhancements';
  enhancementContainer.style.cssText = `
    margin-top: 10px;
    padding: 0;
    border: none;
    background: transparent;
  `;

  // Insert after chat input
  if (chatInput.parentNode) {
    chatInput.parentNode.insertBefore(enhancementContainer, chatInput.nextSibling);
  }

  // Hook chat events
  const processChatMessage = (message) => {
    if (!message || !modules) return;

    const intent = detectIntent(message);
    const slots = extractSlots(message);

    // Clear previous enhancements
    enhancementContainer.innerHTML = '';

    // Check for WhatsApp suggestions
    if (modules.whatsapp && intent === 'rückstand') {
      showWhatsAppSuggestion(enhancementContainer, intent, slots, message, modules.whatsapp);
    }

    // Check for SmartLinks
    if (modules.smartLinks && (intent === 'miete' || intent === 'cashflow')) {
      showSmartLinks(enhancementContainer, intent, message, modules.smartLinks);
    }

    // Check for Documents
    if (modules.documents && intent === 'dokument') {
      showDocuments(enhancementContainer, intent, message, modules.documents);
    }
  };

  // Hook into chat input
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      setTimeout(() => processChatMessage(chatInput.value), 100);
    }
  });

  // Hook into send button
  const sendButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Senden') || btn.textContent.includes('Send'));
  
  if (sendButton) {
    sendButton.addEventListener('click', () => {
      setTimeout(() => processChatMessage(chatInput.value), 100);
    });
  }

  console.log('[CLARA PHASE 1.3] ✅ Chat events hooked');
};

// Intent detection
const detectIntent = (message) => {
  const msg = message.toLowerCase();
  
  if (msg.includes('rückstand') || msg.includes('rückstände')) return 'rückstand';
  if (msg.includes('miete') || msg.includes('mieteinnahmen')) return 'miete';
  if (msg.includes('cashflow')) return 'cashflow';
  if (msg.includes('wartung') || msg.includes('heizung')) return 'wartung';
  if (msg.includes('vertrag') || msg.includes('dokument')) return 'dokument';
  
  return 'unknown';
};

// Slot extraction
const extractSlots = (message) => {
  const slots = {};
  const msg = message.toLowerCase();
  
  if (msg.includes('waldhof')) slots.property = 'waldhofstraße';
  if (msg.includes('hauptstraße')) slots.property = 'hauptstraße';
  if (msg.includes('letzten monat')) slots.time = 'letzten monat';
  
  return slots;
};

// Show WhatsApp suggestion
const showWhatsAppSuggestion = (container, intent, slots, message, whatsappModule) => {
  const suggestion = whatsappModule.generateWhatsAppSuggestion(intent, slots, message);
  
  const whatsappDiv = document.createElement('div');
  whatsappDiv.style.cssText = `
    background: #e3f2fd;
    padding: 10px;
    border-radius: 6px;
    margin: 5px 0;
    border-left: 4px solid #1976d2;
  `;
  
  whatsappDiv.innerHTML = `
    <div style="font-size: 12px; color: #1976d2; margin-bottom: 5px; font-weight: 600;">📱 WhatsApp-Nachricht</div>
    <div style="font-size: 14px; margin-bottom: 8px; color: #333;">${suggestion.text}</div>
    <button onclick="window.open('${suggestion.whatsappUrl}', '_blank')" 
            style="background: #25d366; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px; font-size: 12px;">
      📱 WhatsApp öffnen
    </button>
    <button onclick="navigator.clipboard.writeText('${suggestion.message}')" 
            style="background: #1976d2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 12px;">
      📋 Kopieren
    </button>
  `;
  
  container.appendChild(whatsappDiv);
};

// Show SmartLinks
const showSmartLinks = (container, intent, message, smartLinksModule) => {
  const links = smartLinksModule.generateSmartLinks(intent, {}, message);
  
  if (links.hasSmartLinks) {
    const linksDiv = document.createElement('div');
    linksDiv.style.cssText = `
      background: #f3e5f5;
      padding: 10px;
      border-radius: 6px;
      margin: 5px 0;
      border-left: 4px solid #7b1fa2;
    `;
    
    const linksHtml = links.links.map(link => `
      <button onclick="window.open('${link.url}', '_blank')" 
              style="background: ${link.type === 'primary' ? '#1976d2' : '#757575'}; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin: 2px; font-size: 12px;">
        ${link.icon} ${link.title}
      </button>
    `).join('');

    linksDiv.innerHTML = `
      <div style="font-size: 12px; color: #7b1fa2; margin-bottom: 5px; font-weight: 600;">🔗 Relevante Links</div>
      <div>${linksHtml}</div>
    `;
    
    container.appendChild(linksDiv);
  }
};

// Show Documents
const showDocuments = (container, intent, message, documentsModule) => {
  documentsModule.generateDocumentSuggestions(intent, {}, message).then(result => {
    if (result.hasDocuments) {
      const docsDiv = document.createElement('div');
      docsDiv.style.cssText = `
        background: #fff3e0;
        padding: 10px;
        border-radius: 6px;
        margin: 5px 0;
        border-left: 4px solid #f57c00;
      `;
      
      const docsHtml = result.documents.map(doc => `
        <button onclick="window.open('${doc.url}', '_blank')" 
                style="background: #ff9800; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin: 2px; font-size: 12px;">
          📄 ${doc.title}
        </button>
      `).join('');

      docsDiv.innerHTML = `
        <div style="font-size: 12px; color: #f57c00; margin-bottom: 5px; font-weight: 600;">📄 Relevante Dokumente</div>
        <div>${docsHtml}</div>
      `;
      
      container.appendChild(docsDiv);
    }
  });
};

// Auto-initialize if React is available
if (typeof React !== 'undefined') {
  console.log('[CLARA PHASE 1.3] React detected, initializing hook...');
  
  // Create a React component that uses the hook
  const ClaraPhase13Component = () => {
    const { initialized, modules, error } = useClaraPhase13();
    
    React.useEffect(() => {
      if (initialized) {
        console.log('[CLARA PHASE 1.3] ✅ React component initialized with modules:', modules);
      }
      if (error) {
        console.error('[CLARA PHASE 1.3] ❌ React component error:', error);
      }
    }, [initialized, modules, error]);
    
    return null; // This component doesn't render anything visible
  };
  
  // Try to mount the component
  setTimeout(() => {
    const mountPoint = document.createElement('div');
    mountPoint.id = 'clara-phase13-react-mount';
    mountPoint.style.display = 'none';
    document.body.appendChild(mountPoint);
    
    if (typeof ReactDOM !== 'undefined') {
      ReactDOM.render(React.createElement(ClaraPhase13Component), mountPoint);
    }
  }, 2000);
  
} else {
  console.log('[CLARA PHASE 1.3] React not detected, using legacy initialization...');
  
  // Fallback to legacy initialization
  setTimeout(() => {
    loadClaraPhase13Legacy().then(modules => {
      initializeEnhancements(modules);
      console.log('[CLARA PHASE 1.3] ✅ Legacy initialization complete');
    }).catch(error => {
      console.error('[CLARA PHASE 1.3] ❌ Legacy initialization failed:', error);
    });
  }, 2000);
}

// Export for global access
window.ClaraPhase13ReactHook = {
  useClaraPhase13,
  loadClaraPhase13Legacy,
  initializeEnhancements
};

console.log('[CLARA PHASE 1.3] 🚀 React Hook integration script loaded');

