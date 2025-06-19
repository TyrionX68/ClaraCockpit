// Clara360 Mobile Sidebar Controller
// Vollständig rückklappbare Sidebar für alle Geräte
// Version: 3.0.0 - Galaxy S25 Ultra optimiert

class Clara360MobileSidebar {
  constructor() {
    this.isOpen = false;
    this.isMobile = this.detectMobile();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isAnimating = false;
    
    this.init();
  }
  
  init() {
    console.log("📱 [SIDEBAR] Clara360 Mobile Sidebar Controller v3.0 wird initialisiert...");
    
    this.createMobileSidebar();
    this.setupEventListeners();
    this.setupGestureControls();
    this.setupAutoClose();
    
    // Initial state für mobile
    if (this.isMobile) {
      this.close(false); // Ohne Animation beim Start
    }
    
    console.log("✅ [SIDEBAR] Mobile Sidebar Controller bereit");
  }
  
  detectMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  createMobileSidebar() {
    // Finde existierende Sidebar
    let sidebar = document.querySelector('.sidebar, nav, [class*="sidebar"], [data-sidebar]');
    
    if (!sidebar) {
      // Erstelle neue Sidebar falls keine existiert
      sidebar = this.createNewSidebar();
    }
    
    // Optimiere existierende Sidebar für Mobile
    this.optimizeSidebarForMobile(sidebar);
    
    // Erstelle Overlay
    this.createOverlay();
    
    this.sidebar = sidebar;
  }
  
  createNewSidebar() {
    const sidebar = document.createElement('nav');
    sidebar.className = 'clara360-mobile-sidebar';
    sidebar.setAttribute('data-sidebar', 'true');
    
    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <span style="color: #4299E1; font-size: 24px;">📊</span>
          <span style="color: white; font-weight: 600; margin-left: 8px;">Clara360</span>
        </div>
        <button class="sidebar-close-btn" onclick="window.clara360MobileSidebar.close()">
          <span style="color: white; font-size: 20px;">×</span>
        </button>
      </div>
      
      <div class="sidebar-content">
        <div class="sidebar-section">
          <div class="sidebar-section-title">VERWALTUNG</div>
          <a href="#dashboard" class="sidebar-item">
            <span class="sidebar-icon">🏠</span>
            <span class="sidebar-label">Dashboard</span>
          </a>
          <a href="#tenants" class="sidebar-item">
            <span class="sidebar-icon">👥</span>
            <span class="sidebar-label">Eigentümer</span>
          </a>
          <a href="#objects" class="sidebar-item">
            <span class="sidebar-icon">🏢</span>
            <span class="sidebar-label">Objekte</span>
          </a>
          <a href="#arrears" class="sidebar-item">
            <span class="sidebar-icon">⚠️</span>
            <span class="sidebar-label">Rückstände</span>
          </a>
          <a href="#payments" class="sidebar-item">
            <span class="sidebar-icon">💳</span>
            <span class="sidebar-label">Zahlungen</span>
          </a>
          <a href="#banking" class="sidebar-item">
            <span class="sidebar-icon">🏦</span>
            <span class="sidebar-label">Banking</span>
          </a>
        </div>
        
        <div class="sidebar-section">
          <div class="sidebar-section-title">KOMMUNIKATION</div>
          <a href="#communication" class="sidebar-item">
            <span class="sidebar-icon">💬</span>
            <span class="sidebar-label">Mieter-Kommunikation</span>
          </a>
          <a href="#ai" class="sidebar-item">
            <span class="sidebar-icon">🧠</span>
            <span class="sidebar-label">Clara KI</span>
          </a>
          <a href="#outlook" class="sidebar-item">
            <span class="sidebar-icon">📧</span>
            <span class="sidebar-label">Outlook</span>
          </a>
        </div>
        
        <div class="sidebar-section">
          <div class="sidebar-section-title">SYSTEM</div>
          <a href="#upload" class="sidebar-item">
            <span class="sidebar-icon">📤</span>
            <span class="sidebar-label">Upload</span>
          </a>
          <a href="#reports" class="sidebar-item">
            <span class="sidebar-icon">📊</span>
            <span class="sidebar-label">Berichte</span>
          </a>
          <a href="#settings" class="sidebar-item">
            <span class="sidebar-icon">⚙️</span>
            <span class="sidebar-label">Einstellungen</span>
          </a>
        </div>
      </div>
    `;
    
    document.body.appendChild(sidebar);
    return sidebar;
  }
  
  optimizeSidebarForMobile(sidebar) {
    // Entferne existierende Mobile-Styles
    const existingStyle = document.getElementById('clara360-mobile-sidebar-styles');
    if (existingStyle) existingStyle.remove();
    
    // Erstelle Mobile-optimierte Styles
    const style = document.createElement('style');
    style.id = 'clara360-mobile-sidebar-styles';
    style.textContent = `
      /* Clara360 Mobile Sidebar Styles */
      .clara360-mobile-sidebar,
      .sidebar,
      nav[data-sidebar],
      [class*="sidebar"] {
        position: fixed !important;
        top: 60px !important;
        left: 0 !important;
        width: 280px !important;
        height: calc(100vh - 60px) !important;
        background: linear-gradient(180deg, #1A202C 0%, #2D3748 100%) !important;
        border-right: 2px solid #4299E1 !important;
        z-index: 1000 !important;
        transform: translateX(-100%) !important;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15) !important;
        -webkit-overflow-scrolling: touch !important;
      }
      
      /* Sidebar geöffnet */
      .clara360-mobile-sidebar.open,
      .sidebar.open,
      nav[data-sidebar].open,
      [class*="sidebar"].open {
        transform: translateX(0) !important;
      }
      
      /* Sidebar Header */
      .sidebar-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 16px 20px !important;
        border-bottom: 1px solid #4A5568 !important;
        background: rgba(66, 153, 225, 0.1) !important;
      }
      
      .sidebar-logo {
        display: flex !important;
        align-items: center !important;
        font-size: 18px !important;
        font-weight: 600 !important;
      }
      
      .sidebar-close-btn {
        background: none !important;
        border: none !important;
        cursor: pointer !important;
        padding: 4px !important;
        border-radius: 4px !important;
        transition: background-color 0.2s !important;
      }
      
      .sidebar-close-btn:hover {
        background: rgba(255, 255, 255, 0.1) !important;
      }
      
      /* Sidebar Content */
      .sidebar-content {
        padding: 20px 0 !important;
      }
      
      .sidebar-section {
        margin-bottom: 24px !important;
      }
      
      .sidebar-section-title {
        color: #A0AEC0 !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        padding: 0 20px 8px 20px !important;
        margin-bottom: 8px !important;
      }
      
      .sidebar-item {
        display: flex !important;
        align-items: center !important;
        padding: 12px 20px !important;
        color: white !important;
        text-decoration: none !important;
        transition: all 0.2s ease !important;
        border-left: 3px solid transparent !important;
      }
      
      .sidebar-item:hover {
        background: rgba(66, 153, 225, 0.1) !important;
        border-left-color: #4299E1 !important;
        transform: translateX(4px) !important;
      }
      
      .sidebar-item.active {
        background: rgba(66, 153, 225, 0.2) !important;
        border-left-color: #4299E1 !important;
        color: #4299E1 !important;
      }
      
      .sidebar-icon {
        font-size: 18px !important;
        margin-right: 12px !important;
        width: 24px !important;
        text-align: center !important;
      }
      
      .sidebar-label {
        font-size: 14px !important;
        font-weight: 500 !important;
      }
      
      /* Galaxy S25 Ultra spezifische Optimierungen */
      @media screen and (max-width: 428px) and (min-width: 412px) {
        .clara360-mobile-sidebar,
        .sidebar,
        nav[data-sidebar],
        [class*="sidebar"] {
          width: 300px !important;
        }
        
        .sidebar-item {
          padding: 14px 20px !important;
          min-height: 48px !important;
        }
        
        .sidebar-icon {
          font-size: 20px !important;
          margin-right: 14px !important;
        }
        
        .sidebar-label {
          font-size: 15px !important;
        }
      }
      
      /* Kleinere Mobile Geräte */
      @media screen and (max-width: 360px) {
        .clara360-mobile-sidebar,
        .sidebar,
        nav[data-sidebar],
        [class*="sidebar"] {
          width: 260px !important;
        }
      }
      
      /* Desktop: Sidebar immer sichtbar */
      @media screen and (min-width: 769px) {
        .clara360-mobile-sidebar,
        .sidebar,
        nav[data-sidebar],
        [class*="sidebar"] {
          position: relative !important;
          transform: translateX(0) !important;
          top: 0 !important;
          height: 100vh !important;
          width: 280px !important;
        }
        
        .sidebar-close-btn {
          display: none !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Füge CSS-Klassen hinzu
    sidebar.classList.add('clara360-mobile-sidebar');
    if (!this.isMobile) {
      sidebar.classList.add('open');
    }
  }
  
  createOverlay() {
    const existingOverlay = document.getElementById('clara360-sidebar-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'clara360-sidebar-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
    `;
    
    overlay.addEventListener('click', () => {
      this.close();
    });
    
    document.body.appendChild(overlay);
    this.overlay = overlay;
  }
  
  setupEventListeners() {
    // Hamburger Menu Button
    const hamburgerBtn = document.getElementById('mobileMenuToggle');
    if (hamburgerBtn) {
      hamburgerBtn.addEventListener('click', () => {
        this.toggle();
      });
    }
    
    // Sidebar Links
    if (this.sidebar) {
      const links = this.sidebar.querySelectorAll('a, [href]');
      links.forEach(link => {
        link.addEventListener('click', () => {
          // Auto-close nach Navigation auf Mobile
          if (this.isMobile) {
            setTimeout(() => {
              this.close();
            }, 200);
          }
          
          // Update active state
          this.updateActiveState(link);
        });
      });
    }
    
    // Resize Handler
    window.addEventListener('resize', () => {
      this.handleResize();
    });
    
    // Orientation Change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
    
    // Escape Key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen && this.isMobile) {
        this.close();
      }
    });
  }
  
  setupGestureControls() {
    // Touch Events für Swipe Gestures
    document.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      if (!this.isMobile) return;
      
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - this.touchStartX;
      
      // Swipe von links nach rechts (Sidebar öffnen)
      if (!this.isOpen && this.touchStartX < 50 && deltaX > 30) {
        // Zeige Sidebar-Preview während Swipe
        if (this.sidebar && deltaX > 50) {
          const progress = Math.min(deltaX / 200, 1);
          this.sidebar.style.transform = `translateX(${-100 + (progress * 100)}%)`;
        }
      }
      
      // Swipe von rechts nach links (Sidebar schließen)
      if (this.isOpen && deltaX < -30) {
        const progress = Math.min(Math.abs(deltaX) / 200, 1);
        if (this.sidebar) {
          this.sidebar.style.transform = `translateX(${-progress * 100}%)`;
        }
      }
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      if (!this.isMobile) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const deltaX = touchEndX - this.touchStartX;
      const deltaY = touchEndY - this.touchStartY;
      
      // Nur horizontale Swipes berücksichtigen
      if (Math.abs(deltaY) > 100) return;
      
      // Swipe von links nach rechts (Sidebar öffnen)
      if (!this.isOpen && this.touchStartX < 50 && deltaX > 80) {
        this.open();
      }
      // Swipe von rechts nach links (Sidebar schließen)
      else if (this.isOpen && deltaX < -80) {
        this.close();
      }
      // Reset position wenn Swipe nicht vollständig
      else if (this.sidebar) {
        if (this.isOpen) {
          this.sidebar.style.transform = 'translateX(0)';
        } else {
          this.sidebar.style.transform = 'translateX(-100%)';
        }
      }
    }, { passive: true });
  }
  
  setupAutoClose() {
    // Auto-close bei Klick außerhalb der Sidebar
    document.addEventListener('click', (e) => {
      if (!this.isOpen || !this.isMobile) return;
      
      const target = e.target;
      const sidebar = this.sidebar;
      const hamburgerBtn = document.getElementById('mobileMenuToggle');
      
      // Nicht schließen wenn Klick auf Sidebar oder Hamburger Button
      if (sidebar && (sidebar.contains(target) || target === hamburgerBtn)) {
        return;
      }
      
      this.close();
    });
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open(animate = true) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.isOpen = true;
    
    console.log("📱 [SIDEBAR] Öffne Sidebar");
    
    if (this.sidebar) {
      if (animate) {
        this.sidebar.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      } else {
        this.sidebar.style.transition = 'none';
      }
      
      this.sidebar.classList.add('open');
      this.sidebar.style.transform = 'translateX(0)';
    }
    
    if (this.overlay && this.isMobile) {
      this.overlay.style.opacity = '1';
      this.overlay.style.visibility = 'visible';
    }
    
    // Update Hamburger Button
    const hamburgerBtn = document.getElementById('mobileMenuToggle');
    if (hamburgerBtn) {
      hamburgerBtn.innerHTML = '×';
      hamburgerBtn.style.fontSize = '28px';
    }
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 300);
  }
  
  close(animate = true) {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.isOpen = false;
    
    console.log("📱 [SIDEBAR] Schließe Sidebar");
    
    if (this.sidebar) {
      if (animate) {
        this.sidebar.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      } else {
        this.sidebar.style.transition = 'none';
      }
      
      this.sidebar.classList.remove('open');
      this.sidebar.style.transform = 'translateX(-100%)';
    }
    
    if (this.overlay) {
      this.overlay.style.opacity = '0';
      this.overlay.style.visibility = 'hidden';
    }
    
    // Update Hamburger Button
    const hamburgerBtn = document.getElementById('mobileMenuToggle');
    if (hamburgerBtn) {
      hamburgerBtn.innerHTML = '☰';
      hamburgerBtn.style.fontSize = '24px';
    }
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 300);
  }
  
  updateActiveState(activeLink) {
    if (!this.sidebar) return;
    
    // Entferne active class von allen Links
    const allLinks = this.sidebar.querySelectorAll('.sidebar-item');
    allLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // Füge active class zum geklickten Link hinzu
    if (activeLink.classList.contains('sidebar-item')) {
      activeLink.classList.add('active');
    } else {
      const parentItem = activeLink.closest('.sidebar-item');
      if (parentItem) {
        parentItem.classList.add('active');
      }
    }
  }
  
  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = this.detectMobile();
    
    // Wenn von Mobile zu Desktop gewechselt wird
    if (wasMobile && !this.isMobile) {
      this.open(false); // Öffne ohne Animation
      if (this.overlay) {
        this.overlay.style.opacity = '0';
        this.overlay.style.visibility = 'hidden';
      }
    }
    // Wenn von Desktop zu Mobile gewechselt wird
    else if (!wasMobile && this.isMobile) {
      this.close(false); // Schließe ohne Animation
    }
  }
  
  handleOrientationChange() {
    console.log("🔄 [SIDEBAR] Orientation changed");
    
    // Schließe Sidebar bei Orientation Change auf Mobile
    if (this.isMobile && this.isOpen) {
      this.close();
    }
    
    // Update mobile detection
    setTimeout(() => {
      this.isMobile = this.detectMobile();
    }, 200);
  }
  
  // Public API
  getStatus() {
    return {
      isOpen: this.isOpen,
      isMobile: this.isMobile,
      isAnimating: this.isAnimating
    };
  }
  
  destroy() {
    // Cleanup
    const style = document.getElementById('clara360-mobile-sidebar-styles');
    if (style) style.remove();
    
    const overlay = document.getElementById('clara360-sidebar-overlay');
    if (overlay) overlay.remove();
    
    console.log("🗑️ [SIDEBAR] Mobile Sidebar Controller zerstört");
  }
}

// Initialize Clara360 Mobile Sidebar
window.clara360MobileSidebar = new Clara360MobileSidebar();

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Clara360MobileSidebar;
}

