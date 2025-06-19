// Clara360 Mobile Navigation - Verbesserte Version
class Clara360MobileNavFixed {
  constructor() {
    this.sidebar = null;
    this.overlay = null;
    this.hamburger = null;
    this.isOpen = false;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isDragging = false;
    this.init();
  }

  init() {
    this.createMobileElements();
    this.findSidebarElements();
    this.bindEvents();
    this.handleResize();
    console.log('✅ Clara360 Mobile Navigation (Fixed) initialisiert');
  }

  createMobileElements() {
    // Entferne existierende Mobile Header
    const existingHeader = document.querySelector('.mobile-header');
    if (existingHeader) {
      existingHeader.remove();
    }

    // Erstelle neuen Mobile Header
    const mobileHeader = document.createElement('div');
    mobileHeader.className = 'mobile-header';
    mobileHeader.innerHTML = `
      <button class="hamburger-menu" id="hamburger-menu" aria-label="Navigation öffnen" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <h1 class="mobile-title">Clara360</h1>
      <div class="mobile-actions">
        <button class="mobile-gpt-toggle" aria-label="GPT öffnen">🤖</button>
      </div>
    `;
    document.body.insertBefore(mobileHeader, document.body.firstChild);

    // Erstelle Overlay falls nicht vorhanden
    if (!document.querySelector('.sidebar-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.id = 'sidebar-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.appendChild(overlay);
    }
  }

  findSidebarElements() {
    // Finde Sidebar (verschiedene mögliche Selektoren)
    this.sidebar = document.querySelector('.sidebar') || 
                   document.querySelector('[class*="sidebar"]') ||
                   document.querySelector('nav') ||
                   document.querySelector('.navigation');
    
    this.overlay = document.getElementById('sidebar-overlay');
    this.hamburger = document.getElementById('hamburger-menu');

    if (this.sidebar) {
      // Füge CSS-Klassen hinzu
      this.sidebar.classList.add('mobile-sidebar');
      
      // Erstelle Sidebar Content Wrapper falls nicht vorhanden
      if (!this.sidebar.querySelector('.sidebar-content')) {
        const content = document.createElement('div');
        content.className = 'sidebar-content';
        while (this.sidebar.firstChild) {
          content.appendChild(this.sidebar.firstChild);
        }
        this.sidebar.appendChild(content);
      }
      
      console.log('✅ Sidebar gefunden und konfiguriert');
    } else {
      console.warn('⚠️ Sidebar nicht gefunden');
    }
  }

  bindEvents() {
    // Hamburger Menu Click
    if (this.hamburger) {
      this.hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleSidebar();
      });
    }

    // Overlay Click
    if (this.overlay) {
      this.overlay.addEventListener('click', (e) => {
        e.preventDefault();
        this.closeSidebar();
      });
    }

    // Escape Key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeSidebar();
      }
    });

    // Window Resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Touch Events für Swipe-Gesten
    this.bindTouchEvents();

    // Navigation Links
    this.bindNavigationLinks();

    // GPT Toggle
    const gptToggle = document.querySelector('.mobile-gpt-toggle');
    if (gptToggle) {
      gptToggle.addEventListener('click', () => {
        this.toggleGPTPanel();
      });
    }
  }

  bindTouchEvents() {
    // Touch Start
    document.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      
      // Swipe von links öffnet Sidebar (nur wenn geschlossen)
      if (this.touchStartX < 20 && !this.isOpen && this.isMobile()) {
        this.isDragging = true;
      }
    }, { passive: true });

    // Touch Move
    document.addEventListener('touchmove', (e) => {
      if (!this.isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - this.touchStartX;
      const deltaY = Math.abs(currentY - this.touchStartY);
      
      // Nur horizontale Swipes
      if (deltaY > 50) {
        this.isDragging = false;
        return;
      }
      
      // Swipe Right (öffnen)
      if (deltaX > 80 && !this.isOpen) {
        this.openSidebar();
        this.isDragging = false;
      }
    }, { passive: true });

    // Touch End
    document.addEventListener('touchend', () => {
      this.isDragging = false;
    }, { passive: true });

    // Sidebar Touch Events (für Schließen)
    if (this.sidebar) {
      this.sidebar.addEventListener('touchstart', (e) => {
        if (this.isOpen) {
          this.touchStartX = e.touches[0].clientX;
        }
      }, { passive: true });

      this.sidebar.addEventListener('touchmove', (e) => {
        if (!this.isOpen) return;
        
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - this.touchStartX;
        
        // Swipe Left (schließen)
        if (deltaX < -80) {
          this.closeSidebar();
        }
      }, { passive: true });
    }
  }

  bindNavigationLinks() {
    if (!this.sidebar) return;
    
    const navLinks = this.sidebar.querySelectorAll('a, [role="button"]');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Schließe Sidebar bei Navigation auf Mobile
        if (this.isMobile() && this.isOpen) {
          setTimeout(() => this.closeSidebar(), 150);
        }
      });
    });
  }

  toggleSidebar() {
    if (this.isOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    if (!this.sidebar || !this.isMobile()) return;
    
    this.isOpen = true;
    this.sidebar.classList.add('open');
    this.overlay.classList.add('active');
    this.hamburger.classList.add('active');
    
    // Body Scroll sperren
    document.body.classList.add('body-scroll-lock');
    
    // Accessibility
    this.sidebar.setAttribute('aria-hidden', 'false');
    this.overlay.setAttribute('aria-hidden', 'false');
    this.hamburger.setAttribute('aria-expanded', 'true');
    this.hamburger.setAttribute('aria-label', 'Navigation schließen');
    
    // Focus Management
    const firstFocusable = this.sidebar.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 300);
    }
    
    console.log('📱 Sidebar geöffnet');
  }

  closeSidebar() {
    if (!this.sidebar || !this.isMobile()) return;
    
    this.isOpen = false;
    this.sidebar.classList.remove('open');
    this.overlay.classList.remove('active');
    this.hamburger.classList.remove('active');
    
    // Body Scroll freigeben
    document.body.classList.remove('body-scroll-lock');
    
    // Accessibility
    this.sidebar.setAttribute('aria-hidden', 'true');
    this.overlay.setAttribute('aria-hidden', 'true');
    this.hamburger.setAttribute('aria-expanded', 'false');
    this.hamburger.setAttribute('aria-label', 'Navigation öffnen');
    
    // Focus zurück zum Hamburger
    this.hamburger.focus();
    
    console.log('📱 Sidebar geschlossen');
  }

  toggleGPTPanel() {
    // GPT Panel Toggle Logic
    const gptPanel = document.querySelector('.gpt-panel') || 
                     document.querySelector('[class*="gpt"]') ||
                     document.querySelector('#gpt-panel');
    
    if (gptPanel) {
      gptPanel.style.display = gptPanel.style.display === 'none' ? 'block' : 'none';
    } else {
      // Erstelle GPT Panel falls nicht vorhanden
      this.createGPTPanel();
    }
  }

  createGPTPanel() {
    const gptPanel = document.createElement('div');
    gptPanel.className = 'gpt-panel mobile-gpt-panel';
    gptPanel.innerHTML = `
      <div class="gpt-header">
        <h3>Clara GPT-4.5</h3>
        <button class="gpt-close" aria-label="GPT schließen">×</button>
      </div>
      <div class="gpt-content">
        <p>GPT-Panel wird geladen...</p>
      </div>
    `;
    
    document.body.appendChild(gptPanel);
    
    // Close Button Event
    const closeBtn = gptPanel.querySelector('.gpt-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        gptPanel.remove();
      });
    }
  }

  handleResize() {
    const wasMobile = this.isOpen;
    
    // Schließe Sidebar bei Desktop-Größe
    if (!this.isMobile() && this.isOpen) {
      this.closeSidebar();
    }
    
    // Update Mobile Header Visibility
    const mobileHeader = document.querySelector('.mobile-header');
    if (mobileHeader) {
      if (this.isMobile()) {
        mobileHeader.style.display = 'flex';
      } else {
        mobileHeader.style.display = 'none';
      }
    }
    
    // Update Body Classes
    document.body.classList.toggle('device-mobile', this.isMobile());
    document.body.classList.toggle('device-tablet', this.isTablet());
    document.body.classList.toggle('device-desktop', this.isDesktop());
  }

  // Utility Methods
  isMobile() {
    return window.innerWidth < 768;
  }

  isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  }

  isDesktop() {
    return window.innerWidth >= 1024;
  }

  // Public API
  getSidebarState() {
    return {
      isOpen: this.isOpen,
      isMobile: this.isMobile(),
      sidebarFound: !!this.sidebar
    };
  }

  // Force Close (für externe Aufrufe)
  forceClose() {
    if (this.isOpen) {
      this.closeSidebar();
    }
  }

  // Force Open (für externe Aufrufe)
  forceOpen() {
    if (!this.isOpen && this.isMobile()) {
      this.openSidebar();
    }
  }
}

// Auto-Initialize mit verbesserter Timing
document.addEventListener('DOMContentLoaded', () => {
  // Warte auf andere Scripts und DOM-Stabilisierung
  setTimeout(() => {
    if (window.clara360MobileNav) {
      console.log('🔄 Ersetze existierende Mobile Navigation...');
    }
    
    window.clara360MobileNav = new Clara360MobileNavFixed();
    
    // Global verfügbar machen
    window.toggleSidebar = () => window.clara360MobileNav.toggleSidebar();
    window.closeSidebar = () => window.clara360MobileNav.closeSidebar();
    window.openSidebar = () => window.clara360MobileNav.openSidebar();
    
  }, 1000); // Längere Wartezeit für bessere Kompatibilität
});

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Clara360MobileNavFixed;
}

