// Clara360 Mobile Navigation Controller
class Clara360MobileNav {
  constructor() {
    this.sidebar = null;
    this.overlay = null;
    this.hamburger = null;
    this.isOpen = false;
    this.init();
  }

  init() {
    this.createMobileElements();
    this.bindEvents();
    this.handleResize();
  }

  createMobileElements() {
    // Mobile Header erstellen
    if (!document.querySelector('.mobile-header')) {
      const mobileHeader = document.createElement('div');
      mobileHeader.className = 'mobile-header';
      mobileHeader.innerHTML = `
        <button class="hamburger-menu" id="hamburger-menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 class="mobile-title">Clara360</h1>
        <div class="mobile-actions">
          <button class="mobile-gpt-toggle">🤖</button>
        </div>
      `;
      document.body.insertBefore(mobileHeader, document.body.firstChild);
    }

    // Sidebar Overlay erstellen
    if (!document.querySelector('.sidebar-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.id = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }

    // Referenzen setzen
    this.sidebar = document.querySelector('.sidebar') || document.querySelector('[class*="sidebar"]');
    this.overlay = document.getElementById('sidebar-overlay');
    this.hamburger = document.getElementById('hamburger-menu');

    // Sidebar für Mobile vorbereiten
    if (this.sidebar) {
      this.sidebar.classList.add('mobile-sidebar');
    }
  }

  bindEvents() {
    // Hamburger Menu Click
    if (this.hamburger) {
      this.hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleSidebar();
      });
    }

    // Overlay Click
    if (this.overlay) {
      this.overlay.addEventListener('click', () => {
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

    // Touch Gestures
    this.bindTouchEvents();
  }

  bindTouchEvents() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    // Touch Start
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      
      // Swipe von links öffnet Sidebar
      if (startX < 20 && !this.isOpen) {
        isDragging = true;
      }
      
      // Swipe von rechts schließt Sidebar
      if (startX > window.innerWidth - 20 && this.isOpen) {
        isDragging = true;
      }
    });

    // Touch Move
    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      
      // Swipe Right (öffnen)
      if (deltaX > 50 && !this.isOpen) {
        this.openSidebar();
        isDragging = false;
      }
      
      // Swipe Left (schließen)
      if (deltaX < -50 && this.isOpen) {
        this.closeSidebar();
        isDragging = false;
      }
    });

    // Touch End
    document.addEventListener('touchend', () => {
      isDragging = false;
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
    if (!this.sidebar) return;
    
    this.isOpen = true;
    this.sidebar.classList.add('open');
    this.overlay.classList.add('active');
    this.hamburger.classList.add('active');
    
    // Verhindere Body Scroll
    document.body.style.overflow = 'hidden';
    
    // Accessibility
    this.sidebar.setAttribute('aria-hidden', 'false');
    this.hamburger.setAttribute('aria-expanded', 'true');
  }

  closeSidebar() {
    if (!this.sidebar) return;
    
    this.isOpen = false;
    this.sidebar.classList.remove('open');
    this.overlay.classList.remove('active');
    this.hamburger.classList.remove('active');
    
    // Erlaube Body Scroll
    document.body.style.overflow = '';
    
    // Accessibility
    this.sidebar.setAttribute('aria-hidden', 'true');
    this.hamburger.setAttribute('aria-expanded', 'false');
  }

  handleResize() {
    // Schließe Sidebar bei Desktop-Größe
    if (window.innerWidth >= 1025 && this.isOpen) {
      this.closeSidebar();
    }
    
    // Verstecke Mobile Header bei Desktop
    const mobileHeader = document.querySelector('.mobile-header');
    if (mobileHeader) {
      if (window.innerWidth >= 1025) {
        mobileHeader.style.display = 'none';
      } else {
        mobileHeader.style.display = 'flex';
      }
    }
  }

  // Public API
  isMobile() {
    return window.innerWidth < 768;
  }

  isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1025;
  }

  isDesktop() {
    return window.innerWidth >= 1025;
  }
}

// Auto-Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Warte kurz, damit andere Scripts geladen sind
  setTimeout(() => {
    window.clara360MobileNav = new Clara360MobileNav();
    console.log('✅ Clara360 Mobile Navigation initialisiert');
  }, 500);
});

// Export für Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Clara360MobileNav;
}

