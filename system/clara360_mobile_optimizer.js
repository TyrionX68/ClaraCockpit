// Clara360 Mobile UI Optimization
// Galaxy S25 Ultra + Universal Mobile Support
// Version: 3.0.0 - Mobile Presentation Ready

class Clara360MobileOptimizer {
  constructor() {
    this.currentUser = this.getCurrentUser();
    this.sidebarOpen = false;
    this.isMobile = this.detectMobile();
    this.deviceType = this.detectDeviceType();
    
    this.init();
  }
  
  init() {
    console.log("📱 [MOBILE] Clara360 Mobile Optimizer v3.0 wird initialisiert...");
    console.log("📱 [MOBILE] Device Type:", this.deviceType);
    console.log("📱 [MOBILE] Is Mobile:", this.isMobile);
    console.log("👤 [MOBILE] User Role:", this.currentUser?.role);
    
    this.setupMobileNavigation();
    this.setupAdminModules();
    this.setupResponsiveLayout();
    this.setupGestureControls();
    this.setupViewportOptimization();
    
    console.log("✅ [MOBILE] Clara360 Mobile Optimizer bereit");
  }
  
  detectMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  detectDeviceType() {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent;
    
    // Galaxy S25 Ultra: 412x915 logical pixels
    if (width >= 412 && width <= 428 && userAgent.includes('Android')) {
      return 'galaxy-s25-ultra';
    }
    // iPhone Pro Max
    if (width >= 414 && width <= 430 && userAgent.includes('iPhone')) {
      return 'iphone-pro-max';
    }
    // Standard Mobile
    if (width <= 414) {
      return 'mobile-standard';
    }
    // Tablet
    if (width <= 768) {
      return 'tablet';
    }
    
    return 'desktop';
  }
  
  getCurrentUser() {
    // Simuliere User-Daten für Demo
    return {
      role: 'metaGovernor', // oder 'admin', 'staff', 'external'
      name: 'T. Hiss',
      email: 'admin@demo-clara360.de'
    };
  }
  
  setupMobileNavigation() {
    console.log("🧭 [MOBILE] Setup Mobile Navigation...");
    
    // Erstelle Mobile Header mit Hamburger Menu
    this.createMobileHeader();
    
    // Setup Sidebar Toggle
    this.setupSidebarToggle();
    
    // Setup Auto-Close nach Navigation
    this.setupAutoClose();
  }
  
  createMobileHeader() {
    const existingHeader = document.querySelector('.mobile-header');
    if (existingHeader) existingHeader.remove();
    
    const header = document.createElement('div');
    header.className = 'mobile-header';
    header.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: linear-gradient(90deg, #1A202C, #2D3748);
        border-bottom: 1px solid #4299E1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        z-index: 1001;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      ">
        <button id="mobileMenuToggle" style="
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        ">☰</button>
        
        <div style="
          color: white;
          font-weight: 600;
          font-size: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        ">
          <span style="color: #4299E1;">📊</span>
          Clara360
        </div>
        
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
        ">
          ${this.isAdminUser() ? `
            <button id="adminPanelToggle" style="
              background: rgba(66, 153, 225, 0.2);
              border: 1px solid #4299E1;
              color: #4299E1;
              padding: 6px 12px;
              border-radius: 16px;
              font-size: 12px;
              cursor: pointer;
            ">🛠️ Admin</button>
          ` : ''}
          
          <div style="
            width: 32px;
            height: 32px;
            background: #4299E1;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 14px;
          ">${this.currentUser.name.charAt(0)}</div>
        </div>
      </div>
    `;
    
    document.body.appendChild(header);
    
    // Adjust main content for header
    const mainContent = document.getElementById('root');
    if (mainContent && this.isMobile) {
      mainContent.style.paddingTop = '60px';
    }
  }
  
  setupSidebarToggle() {
    const toggleButton = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar, nav, [class*="sidebar"]');
    
    if (toggleButton && sidebar) {
      toggleButton.addEventListener('click', () => {
        this.toggleSidebar();
      });
      
      // Initial state für mobile
      if (this.isMobile) {
        this.closeSidebar();
      }
    }
  }
  
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    const sidebar = document.querySelector('.sidebar, nav, [class*="sidebar"]');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
      if (this.sidebarOpen) {
        this.openSidebar();
      } else {
        this.closeSidebar();
      }
    }
  }
  
  openSidebar() {
    const sidebar = document.querySelector('.sidebar, nav, [class*="sidebar"]');
    
    if (sidebar) {
      // Erstelle Overlay
      this.createSidebarOverlay();
      
      // Öffne Sidebar
      sidebar.style.transform = 'translateX(0)';
      sidebar.style.position = 'fixed';
      sidebar.style.top = '60px';
      sidebar.style.left = '0';
      sidebar.style.height = 'calc(100vh - 60px)';
      sidebar.style.width = '280px';
      sidebar.style.zIndex = '1000';
      sidebar.style.transition = 'transform 0.3s ease-in-out';
      sidebar.style.background = '#1A202C';
      sidebar.style.boxShadow = '4px 0 12px rgba(0,0,0,0.15)';
      
      this.sidebarOpen = true;
      
      console.log("📱 [MOBILE] Sidebar geöffnet");
    }
  }
  
  closeSidebar() {
    const sidebar = document.querySelector('.sidebar, nav, [class*="sidebar"]');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar) {
      sidebar.style.transform = 'translateX(-100%)';
      this.sidebarOpen = false;
      
      // Entferne Overlay
      if (overlay) {
        overlay.remove();
      }
      
      console.log("📱 [MOBILE] Sidebar geschlossen");
    }
  }
  
  createSidebarOverlay() {
    const existingOverlay = document.getElementById('sidebarOverlay');
    if (existingOverlay) existingOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      backdrop-filter: blur(2px);
    `;
    
    overlay.addEventListener('click', () => {
      this.closeSidebar();
    });
    
    document.body.appendChild(overlay);
  }
  
  setupAutoClose() {
    // Auto-close nach Navigation
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // Wenn Link in Sidebar geklickt wird
      if (target.tagName === 'A' && target.closest('.sidebar, nav, [class*="sidebar"]')) {
        setTimeout(() => {
          this.closeSidebar();
        }, 300);
      }
    });
  }
  
  setupAdminModules() {
    console.log("🛠️ [MOBILE] Setup Admin Modules...");
    
    if (!this.isAdminUser()) {
      this.hideAdminModules();
      return;
    }
    
    this.createAdminPanel();
    this.setupAdminToggle();
  }
  
  isAdminUser() {
    return this.currentUser?.role === 'metaGovernor' || this.currentUser?.role === 'admin';
  }
  
  hideAdminModules() {
    // Verstecke Admin-spezifische Elemente
    const adminElements = document.querySelectorAll('[data-admin-only], .admin-only, [class*="admin"]');
    adminElements.forEach(el => {
      if (!el.classList.contains('keep-visible')) {
        el.style.display = 'none';
      }
    });
    
    console.log("🔒 [MOBILE] Admin-Module versteckt für Rolle:", this.currentUser?.role);
  }
  
  createAdminPanel() {
    const existingPanel = document.getElementById('mobileAdminPanel');
    if (existingPanel) existingPanel.remove();
    
    const panel = document.createElement('div');
    panel.id = 'mobileAdminPanel';
    panel.style.cssText = `
      position: fixed;
      top: 60px;
      right: -320px;
      width: 320px;
      height: calc(100vh - 60px);
      background: linear-gradient(180deg, #2D3748, #1A202C);
      border-left: 2px solid #4299E1;
      z-index: 1002;
      transition: right 0.3s ease-in-out;
      overflow-y: auto;
      box-shadow: -4px 0 12px rgba(0,0,0,0.2);
    `;
    
    panel.innerHTML = `
      <div style="padding: 20px;">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid #4A5568;
        ">
          <h3 style="color: white; margin: 0; font-size: 16px; font-weight: 600;">
            🛠️ Admin-Module
          </h3>
          <button id="closeAdminPanel" style="
            background: none;
            border: none;
            color: #4299E1;
            font-size: 20px;
            cursor: pointer;
          ">×</button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button class="admin-module-btn" data-module="gpt" style="
            background: rgba(66, 153, 225, 0.1);
            border: 1px solid #4299E1;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="font-weight: 600; margin-bottom: 4px;">🧠 Clara GPT-4.5</div>
            <div style="font-size: 12px; color: #A0AEC0;">Intelligence Engine</div>
          </button>
          
          <button class="admin-module-btn" data-module="audit" style="
            background: rgba(66, 153, 225, 0.1);
            border: 1px solid #4299E1;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="font-weight: 600; margin-bottom: 4px;">📋 Audit Log</div>
            <div style="font-size: 12px; color: #A0AEC0;">System-Protokoll</div>
          </button>
          
          <button class="admin-module-btn" data-module="policy" style="
            background: rgba(66, 153, 225, 0.1);
            border: 1px solid #4299E1;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="font-weight: 600; margin-bottom: 4px;">🔐 Policy Log</div>
            <div style="font-size: 12px; color: #A0AEC0;">Sicherheits-Richtlinien</div>
          </button>
          
          <button class="admin-module-btn" data-module="backup" style="
            background: rgba(66, 153, 225, 0.1);
            border: 1px solid #4299E1;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            text-align: left;
            cursor: pointer;
            transition: all 0.2s;
          ">
            <div style="font-weight: 600; margin-bottom: 4px;">💾 Backup Manager</div>
            <div style="font-size: 12px; color: #A0AEC0;">Datensicherung</div>
          </button>
          
          <div style="
            margin-top: 20px;
            padding-top: 16px;
            border-top: 1px solid #4A5568;
          ">
            <div style="color: #A0AEC0; font-size: 12px; margin-bottom: 8px;">
              System Status
            </div>
            <div style="color: #48BB78; font-size: 12px;">
              ✅ Wave 2 KI aktiv<br>
              ✅ Enterprise Mode<br>
              ✅ 95% Dummy-frei
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
  }
  
  setupAdminToggle() {
    const toggleButton = document.getElementById('adminPanelToggle');
    const closeButton = document.getElementById('closeAdminPanel');
    const panel = document.getElementById('mobileAdminPanel');
    
    if (toggleButton && panel) {
      toggleButton.addEventListener('click', () => {
        const isOpen = panel.style.right === '0px';
        panel.style.right = isOpen ? '-320px' : '0px';
        
        // Erstelle Overlay für Admin Panel
        if (!isOpen) {
          this.createAdminOverlay();
        } else {
          this.removeAdminOverlay();
        }
      });
    }
    
    if (closeButton && panel) {
      closeButton.addEventListener('click', () => {
        panel.style.right = '-320px';
        this.removeAdminOverlay();
      });
    }
    
    // Setup Admin Module Buttons
    const moduleButtons = document.querySelectorAll('.admin-module-btn');
    moduleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const module = btn.dataset.module;
        this.openAdminModule(module);
      });
      
      // Hover Effects
      btn.addEventListener('mouseenter', () => {
        btn.style.background = 'rgba(66, 153, 225, 0.2)';
        btn.style.transform = 'translateX(4px)';
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.background = 'rgba(66, 153, 225, 0.1)';
        btn.style.transform = 'translateX(0)';
      });
    });
  }
  
  createAdminOverlay() {
    const existingOverlay = document.getElementById('adminOverlay');
    if (existingOverlay) existingOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'adminOverlay';
    overlay.style.cssText = `
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.3);
      z-index: 1001;
      backdrop-filter: blur(1px);
    `;
    
    overlay.addEventListener('click', () => {
      const panel = document.getElementById('mobileAdminPanel');
      if (panel) {
        panel.style.right = '-320px';
      }
      this.removeAdminOverlay();
    });
    
    document.body.appendChild(overlay);
  }
  
  removeAdminOverlay() {
    const overlay = document.getElementById('adminOverlay');
    if (overlay) {
      overlay.remove();
    }
  }
  
  openAdminModule(module) {
    console.log("🛠️ [MOBILE] Öffne Admin-Modul:", module);
    
    // Schließe Admin Panel
    const panel = document.getElementById('mobileAdminPanel');
    if (panel) {
      panel.style.right = '-320px';
    }
    this.removeAdminOverlay();
    
    // Öffne entsprechendes Modul
    switch (module) {
      case 'gpt':
        this.openGPTModule();
        break;
      case 'audit':
        this.openAuditModule();
        break;
      case 'policy':
        this.openPolicyModule();
        break;
      case 'backup':
        this.openBackupModule();
        break;
    }
  }
  
  openGPTModule() {
    // Aktiviere Clara GPT Interface
    if (window.toggleAIChat) {
      window.toggleAIChat();
    } else {
      console.log("🧠 [MOBILE] GPT-Modul wird geladen...");
      // Fallback: Erstelle GPT Interface
      this.createMobileGPTInterface();
    }
  }
  
  createMobileGPTInterface() {
    const existingGPT = document.getElementById('mobileGPTInterface');
    if (existingGPT) {
      existingGPT.style.display = existingGPT.style.display === 'none' ? 'flex' : 'none';
      return;
    }
    
    const gptInterface = document.createElement('div');
    gptInterface.id = 'mobileGPTInterface';
    gptInterface.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      height: 400px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
      z-index: 1003;
      display: flex;
      flex-direction: column;
      animation: slideInUp 0.4s ease-out;
    `;
    
    gptInterface.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #4299E1, #3182CE);
        color: white;
        padding: 16px;
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div style="font-weight: 600; font-size: 16px;">🧠 Clara Intelligence</div>
        <button onclick="document.getElementById('mobileGPTInterface').style.display='none'" style="
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        ">×</button>
      </div>
      
      <div style="flex: 1; padding: 16px; overflow-y: auto;" id="mobileGPTMessages">
        <div style="
          background: #F7FAFC;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 14px;
        ">
          Hallo! Ich bin Clara Intelligence Engine v2.0 für Mobile. Frage mich nach Mietern, Finanzen oder Analysen.
        </div>
      </div>
      
      <div style="padding: 16px; border-top: 1px solid #E2E8F0;">
        <div style="display: flex; gap: 8px;">
          <input type="text" id="mobileGPTInput" placeholder="Frage Clara..." style="
            flex: 1;
            padding: 12px;
            border: 1px solid #E2E8F0;
            border-radius: 24px;
            font-size: 14px;
            outline: none;
          ">
          <button onclick="window.clara360Mobile.sendMobileGPTMessage()" style="
            background: #4299E1;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 24px;
            font-size: 14px;
            cursor: pointer;
            font-weight: 600;
          ">Senden</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(gptInterface);
    
    // Enter key support
    const input = document.getElementById('mobileGPTInput');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMobileGPTMessage();
        }
      });
    }
  }
  
  sendMobileGPTMessage() {
    const input = document.getElementById('mobileGPTInput');
    const messages = document.getElementById('mobileGPTMessages');
    
    if (!input || !messages) return;
    
    const query = input.value.trim();
    if (!query) return;
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.style.cssText = `
      background: #4299E1;
      color: white;
      padding: 10px 14px;
      border-radius: 16px;
      margin-bottom: 8px;
      font-size: 14px;
      margin-left: 40px;
      text-align: right;
    `;
    userMsg.textContent = query;
    messages.appendChild(userMsg);
    
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
      const aiMsg = document.createElement('div');
      aiMsg.style.cssText = `
        background: #F7FAFC;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 12px;
        font-size: 14px;
        border-left: 3px solid #4299E1;
      `;
      aiMsg.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">🧠 Clara Intelligence</div>
        <div>Basierend auf den aktuellen Daten: ${this.generateMockResponse(query)}</div>
      `;
      messages.appendChild(aiMsg);
      
      messages.scrollTop = messages.scrollHeight;
    }, 1000);
    
    messages.scrollTop = messages.scrollHeight;
  }
  
  generateMockResponse(query) {
    const responses = {
      'mieter': 'Aktuell verwalten wir 14 Mieter in der Waldhofstraße 76 mit 100% Vermietungsgrad.',
      'rückstände': 'Es gibt 1 offenen Rückstand von Familie Schmidt (1.200€, 2 Monate).',
      'finanzen': 'Monatliche Mieteinnahmen: 8.360€, Jahresrendite: 8.4% (über Marktdurchschnitt).',
      'default': 'Ich analysiere deine Anfrage. Für detaillierte Informationen nutze die entsprechenden Module.'
    };
    
    const lowerQuery = query.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuery.includes(key)) {
        return response;
      }
    }
    
    return responses.default;
  }
  
  openAuditModule() {
    console.log("📋 [MOBILE] Audit Log wird geöffnet...");
    // Trigger existing audit log functionality
    if (window.clara360AuditLog) {
      window.clara360AuditLog.showMobileView();
    }
  }
  
  openPolicyModule() {
    console.log("🔐 [MOBILE] Policy Log wird geöffnet...");
    // Trigger existing policy log functionality
  }
  
  openBackupModule() {
    console.log("💾 [MOBILE] Backup Manager wird geöffnet...");
    // Trigger existing backup functionality
    if (window.clara360BackupManager) {
      window.clara360BackupManager.showMobileView();
    }
  }
  
  setupResponsiveLayout() {
    console.log("📐 [MOBILE] Setup Responsive Layout...");
    
    // Galaxy S25 Ultra spezifische Optimierungen
    if (this.deviceType === 'galaxy-s25-ultra') {
      this.applyGalaxyS25UltraOptimizations();
    }
    
    // Allgemeine Mobile Optimierungen
    this.applyGeneralMobileOptimizations();
  }
  
  applyGalaxyS25UltraOptimizations() {
    console.log("📱 [MOBILE] Galaxy S25 Ultra Optimierungen werden angewendet...");
    
    const style = document.createElement('style');
    style.id = 'galaxy-s25-ultra-optimizations';
    style.textContent = `
      /* Galaxy S25 Ultra spezifische Optimierungen */
      @media screen and (max-width: 428px) and (min-width: 412px) {
        .mobile-header {
          height: 64px !important;
        }
        
        #root {
          padding-top: 64px !important;
        }
        
        .sidebar, nav, [class*="sidebar"] {
          width: 300px !important;
        }
        
        .card, [class*="card"] {
          margin: 8px !important;
          padding: 16px !important;
          border-radius: 12px !important;
        }
        
        .dashboard-grid {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
        }
        
        /* Touch-optimierte Buttons */
        button, .btn, [role="button"] {
          min-height: 44px !important;
          min-width: 44px !important;
          padding: 12px 16px !important;
        }
        
        /* Verbesserte Lesbarkeit */
        body, .text-base {
          font-size: 16px !important;
          line-height: 1.5 !important;
        }
        
        h1, .text-xl, .text-2xl {
          font-size: 20px !important;
        }
        
        h2, .text-lg {
          font-size: 18px !important;
        }
        
        /* Optimierte Abstände */
        .p-4 {
          padding: 16px !important;
        }
        
        .m-4 {
          margin: 16px !important;
        }
        
        /* Scroll-Optimierung */
        .overflow-auto, .overflow-y-auto {
          -webkit-overflow-scrolling: touch !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  applyGeneralMobileOptimizations() {
    const style = document.createElement('style');
    style.id = 'general-mobile-optimizations';
    style.textContent = `
      /* Allgemeine Mobile Optimierungen */
      @media screen and (max-width: 768px) {
        /* Verhindere horizontales Scrollen */
        body {
          overflow-x: hidden !important;
        }
        
        /* Optimiere Viewport */
        * {
          box-sizing: border-box !important;
        }
        
        /* Verbessere Touch-Targets */
        a, button, input, select, textarea {
          min-height: 44px !important;
        }
        
        /* Optimiere Formulare */
        input, select, textarea {
          font-size: 16px !important; /* Verhindert Zoom auf iOS */
          width: 100% !important;
        }
        
        /* Verbessere Lesbarkeit */
        .text-sm {
          font-size: 14px !important;
        }
        
        /* Optimiere Abstände */
        .container, .max-w-7xl, .max-w-6xl {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
        
        /* Verstecke Desktop-spezifische Elemente */
        .desktop-only {
          display: none !important;
        }
        
        /* Zeige Mobile-spezifische Elemente */
        .mobile-only {
          display: block !important;
        }
        
        /* Optimiere Tabellen */
        table {
          font-size: 14px !important;
        }
        
        th, td {
          padding: 8px 4px !important;
        }
        
        /* Verbessere Modals */
        .modal, .dialog {
          margin: 16px !important;
          max-height: calc(100vh - 32px) !important;
        }
      }
      
      /* Animation für Slide-In */
      @keyframes slideInUp {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  setupGestureControls() {
    console.log("👆 [MOBILE] Setup Gesture Controls...");
    
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      
      // Swipe von links nach rechts (Sidebar öffnen)
      if (deltaX > 50 && Math.abs(deltaY) < 100 && touchStartX < 50) {
        if (!this.sidebarOpen) {
          this.openSidebar();
        }
      }
      
      // Swipe von rechts nach links (Sidebar schließen)
      if (deltaX < -50 && Math.abs(deltaY) < 100 && this.sidebarOpen) {
        this.closeSidebar();
      }
    });
  }
  
  setupViewportOptimization() {
    console.log("📐 [MOBILE] Setup Viewport Optimization...");
    
    // Viewport Meta Tag optimieren
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    
    // Orientation Change Handler
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
    
    // Resize Handler
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
  
  handleOrientationChange() {
    console.log("🔄 [MOBILE] Orientation changed");
    
    // Schließe Sidebar bei Orientation Change
    if (this.sidebarOpen) {
      this.closeSidebar();
    }
    
    // Update Device Type
    this.deviceType = this.detectDeviceType();
    this.isMobile = this.detectMobile();
    
    // Re-apply optimizations
    setTimeout(() => {
      if (this.deviceType === 'galaxy-s25-ultra') {
        this.applyGalaxyS25UltraOptimizations();
      }
    }, 200);
  }
  
  handleResize() {
    // Update mobile detection
    this.isMobile = this.detectMobile();
    
    // Adjust layout for new size
    if (!this.isMobile && this.sidebarOpen) {
      this.closeSidebar();
    }
  }
  
  // Public API
  getStatus() {
    return {
      sidebarOpen: this.sidebarOpen,
      isMobile: this.isMobile,
      deviceType: this.deviceType,
      userRole: this.currentUser?.role,
      isAdminUser: this.isAdminUser()
    };
  }
}

// Initialize Clara360 Mobile Optimizer
window.clara360Mobile = new Clara360MobileOptimizer();

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Clara360MobileOptimizer;
}

