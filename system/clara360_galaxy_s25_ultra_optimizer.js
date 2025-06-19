// Clara360 Galaxy S25 Ultra Optimizations
// Spezifische Optimierungen für Samsung Galaxy S25 Ultra
// Version: 3.0.0 - Präsentationstauglich

class Clara360GalaxyS25UltraOptimizer {
  constructor() {
    this.deviceSpecs = {
      // Galaxy S25 Ultra Spezifikationen
      screenWidth: 412,
      screenHeight: 915,
      pixelRatio: 3.0,
      statusBarHeight: 44,
      navigationBarHeight: 48,
      safeAreaTop: 44,
      safeAreaBottom: 48,
      cornerRadius: 22
    };
    
    this.isGalaxyS25Ultra = this.detectGalaxyS25Ultra();
    this.currentOrientation = this.getOrientation();
    
    this.init();
  }
  
  init() {
    console.log("📱 [GALAXY] Clara360 Galaxy S25 Ultra Optimizer v3.0 wird initialisiert...");
    console.log("📱 [GALAXY] Device detected:", this.isGalaxyS25Ultra ? 'Galaxy S25 Ultra' : 'Other device');
    console.log("📱 [GALAXY] Orientation:", this.currentOrientation);
    
    if (this.isGalaxyS25Ultra) {
      this.applyGalaxyS25UltraOptimizations();
    }
    
    this.applyUniversalMobileOptimizations();
    this.setupOrientationHandling();
    this.setupSafeAreaHandling();
    this.setupPerformanceOptimizations();
    
    console.log("✅ [GALAXY] Galaxy S25 Ultra Optimizer bereit");
  }
  
  detectGalaxyS25Ultra() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent;
    const pixelRatio = window.devicePixelRatio;
    
    // Galaxy S25 Ultra Detection
    const isAndroid = userAgent.includes('Android');
    const isSamsung = userAgent.includes('Samsung') || userAgent.includes('SM-');
    const hasCorrectDimensions = (width === 412 && height === 915) || (width === 915 && height === 412);
    const hasCorrectPixelRatio = pixelRatio >= 2.8 && pixelRatio <= 3.2;
    
    return isAndroid && (isSamsung || hasCorrectDimensions) && hasCorrectPixelRatio;
  }
  
  getOrientation() {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }
  
  applyGalaxyS25UltraOptimizations() {
    console.log("🎯 [GALAXY] Wende Galaxy S25 Ultra spezifische Optimierungen an...");
    
    // Entferne existierende Galaxy-Styles
    const existingStyle = document.getElementById('galaxy-s25-ultra-optimizations');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.id = 'galaxy-s25-ultra-optimizations';
    style.textContent = `
      /* Galaxy S25 Ultra spezifische Optimierungen */
      
      /* Viewport und Safe Areas */
      :root {
        --safe-area-top: ${this.deviceSpecs.safeAreaTop}px;
        --safe-area-bottom: ${this.deviceSpecs.safeAreaBottom}px;
        --status-bar-height: ${this.deviceSpecs.statusBarHeight}px;
        --navigation-bar-height: ${this.deviceSpecs.navigationBarHeight}px;
        --corner-radius: ${this.deviceSpecs.cornerRadius}px;
      }
      
      /* Body Optimierungen */
      body {
        -webkit-text-size-adjust: 100% !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        text-rendering: optimizeLegibility !important;
        overflow-x: hidden !important;
      }
      
      /* Mobile Header für Galaxy S25 Ultra */
      .mobile-header {
        height: 64px !important;
        padding-top: env(safe-area-inset-top, 0px) !important;
        background: linear-gradient(135deg, #1A202C 0%, #2D3748 50%, #4299E1 100%) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border-bottom: 1px solid rgba(66, 153, 225, 0.3) !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
      }
      
      /* Root Container */
      #root {
        padding-top: calc(64px + env(safe-area-inset-top, 0px)) !important;
        padding-bottom: env(safe-area-inset-bottom, 0px) !important;
        min-height: 100vh !important;
        background: #121212 !important;
      }
      
      /* Sidebar Optimierungen */
      .clara360-mobile-sidebar,
      .sidebar,
      nav[data-sidebar] {
        width: 320px !important;
        top: calc(64px + env(safe-area-inset-top, 0px)) !important;
        height: calc(100vh - 64px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) !important;
        border-radius: 0 var(--corner-radius) var(--corner-radius) 0 !important;
        box-shadow: 8px 0 32px rgba(0, 0, 0, 0.2) !important;
      }
      
      /* Cards und Content */
      .card,
      [class*="card"],
      .dashboard-card {
        margin: 12px !important;
        padding: 20px !important;
        border-radius: 16px !important;
        background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%) !important;
        border: 1px solid rgba(66, 153, 225, 0.2) !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
      }
      
      /* Buttons Touch-optimiert */
      button,
      .btn,
      [role="button"],
      input[type="submit"],
      input[type="button"] {
        min-height: 48px !important;
        min-width: 48px !important;
        padding: 14px 20px !important;
        border-radius: 12px !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        touch-action: manipulation !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      /* Primary Buttons */
      .btn-primary,
      button[class*="primary"],
      .bg-blue-500,
      .bg-blue-600 {
        background: linear-gradient(135deg, #4299E1 0%, #3182CE 100%) !important;
        border: none !important;
        color: white !important;
        box-shadow: 0 4px 16px rgba(66, 153, 225, 0.3) !important;
      }
      
      .btn-primary:hover,
      button[class*="primary"]:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 8px 24px rgba(66, 153, 225, 0.4) !important;
      }
      
      .btn-primary:active,
      button[class*="primary"]:active {
        transform: translateY(0) !important;
        box-shadow: 0 2px 8px rgba(66, 153, 225, 0.3) !important;
      }
      
      /* Input Fields */
      input,
      select,
      textarea {
        min-height: 48px !important;
        padding: 14px 16px !important;
        font-size: 16px !important;
        border-radius: 12px !important;
        border: 2px solid #4A5568 !important;
        background: rgba(45, 55, 72, 0.8) !important;
        color: white !important;
        transition: all 0.3s ease !important;
        -webkit-appearance: none !important;
        appearance: none !important;
      }
      
      input:focus,
      select:focus,
      textarea:focus {
        border-color: #4299E1 !important;
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2) !important;
        outline: none !important;
      }
      
      /* Typography */
      h1, .text-3xl, .text-4xl {
        font-size: 24px !important;
        line-height: 1.3 !important;
        font-weight: 700 !important;
        color: white !important;
        margin-bottom: 16px !important;
      }
      
      h2, .text-2xl, .text-xl {
        font-size: 20px !important;
        line-height: 1.4 !important;
        font-weight: 600 !important;
        color: #E2E8F0 !important;
        margin-bottom: 12px !important;
      }
      
      h3, .text-lg {
        font-size: 18px !important;
        line-height: 1.4 !important;
        font-weight: 600 !important;
        color: #E2E8F0 !important;
        margin-bottom: 8px !important;
      }
      
      p, .text-base {
        font-size: 16px !important;
        line-height: 1.6 !important;
        color: #A0AEC0 !important;
        margin-bottom: 12px !important;
      }
      
      .text-sm {
        font-size: 14px !important;
        line-height: 1.5 !important;
        color: #718096 !important;
      }
      
      /* Grid Layouts */
      .grid,
      .dashboard-grid,
      [class*="grid"] {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 16px !important;
        padding: 16px !important;
      }
      
      /* Flexbox Optimierungen */
      .flex {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
      }
      
      /* Scroll Optimierungen */
      .overflow-auto,
      .overflow-y-auto,
      .overflow-x-auto {
        -webkit-overflow-scrolling: touch !important;
        scroll-behavior: smooth !important;
        scrollbar-width: thin !important;
        scrollbar-color: #4299E1 transparent !important;
      }
      
      /* Webkit Scrollbar */
      .overflow-auto::-webkit-scrollbar,
      .overflow-y-auto::-webkit-scrollbar {
        width: 4px !important;
      }
      
      .overflow-auto::-webkit-scrollbar-track,
      .overflow-y-auto::-webkit-scrollbar-track {
        background: transparent !important;
      }
      
      .overflow-auto::-webkit-scrollbar-thumb,
      .overflow-y-auto::-webkit-scrollbar-thumb {
        background: #4299E1 !important;
        border-radius: 2px !important;
      }
      
      /* Tables */
      table {
        width: 100% !important;
        font-size: 14px !important;
        border-collapse: collapse !important;
      }
      
      th {
        padding: 12px 8px !important;
        background: rgba(66, 153, 225, 0.1) !important;
        color: #4299E1 !important;
        font-weight: 600 !important;
        text-align: left !important;
        border-bottom: 2px solid #4299E1 !important;
      }
      
      td {
        padding: 12px 8px !important;
        border-bottom: 1px solid #4A5568 !important;
        color: #E2E8F0 !important;
      }
      
      tr:hover {
        background: rgba(66, 153, 225, 0.05) !important;
      }
      
      /* Modals und Overlays */
      .modal,
      .dialog,
      [role="dialog"] {
        margin: 20px !important;
        max-height: calc(100vh - 40px) !important;
        border-radius: 20px !important;
        background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%) !important;
        border: 1px solid rgba(66, 153, 225, 0.3) !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
      }
      
      /* Animations */
      @keyframes galaxyFadeIn {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @keyframes galaxySlideIn {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(0);
        }
      }
      
      /* Apply animations */
      .card,
      [class*="card"] {
        animation: galaxyFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      .clara360-mobile-sidebar.open {
        animation: galaxySlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      /* Status Bar Integration */
      .status-bar-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: env(safe-area-inset-top, 44px) !important;
        background: linear-gradient(135deg, #1A202C 0%, #2D3748 100%) !important;
        z-index: 9999 !important;
      }
      
      /* Navigation Bar Integration */
      .navigation-bar-overlay {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        height: env(safe-area-inset-bottom, 48px) !important;
        background: linear-gradient(135deg, #1A202C 0%, #2D3748 100%) !important;
        z-index: 9999 !important;
      }
      
      /* Performance Optimierungen */
      * {
        -webkit-transform: translateZ(0) !important;
        transform: translateZ(0) !important;
        -webkit-backface-visibility: hidden !important;
        backface-visibility: hidden !important;
        -webkit-perspective: 1000 !important;
        perspective: 1000 !important;
      }
      
      /* Landscape Optimierungen */
      @media screen and (orientation: landscape) and (max-height: 428px) {
        .mobile-header {
          height: 56px !important;
        }
        
        #root {
          padding-top: calc(56px + env(safe-area-inset-top, 0px)) !important;
        }
        
        .clara360-mobile-sidebar {
          top: calc(56px + env(safe-area-inset-top, 0px)) !important;
          height: calc(100vh - 56px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) !important;
          width: 280px !important;
        }
        
        .card,
        [class*="card"] {
          margin: 8px !important;
          padding: 16px !important;
        }
        
        .grid,
        .dashboard-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px !important;
          padding: 12px !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Erstelle Status Bar und Navigation Bar Overlays
    this.createStatusBarOverlay();
    this.createNavigationBarOverlay();
  }
  
  applyUniversalMobileOptimizations() {
    console.log("🌐 [GALAXY] Wende universelle Mobile-Optimierungen an...");
    
    const style = document.createElement('style');
    style.id = 'universal-mobile-optimizations';
    style.textContent = `
      /* Universelle Mobile Optimierungen für alle Geräte */
      
      /* Viewport Meta Tag Enforcement */
      html {
        -webkit-text-size-adjust: 100% !important;
        -ms-text-size-adjust: 100% !important;
        text-size-adjust: 100% !important;
      }
      
      /* Touch Optimierungen */
      * {
        -webkit-tap-highlight-color: transparent !important;
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      /* Selectable Text */
      p, span, div[class*="text"], .selectable {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      /* Input Fields */
      input, textarea, select {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      /* Prevent Zoom on Input Focus (iOS) */
      @media screen and (max-width: 768px) {
        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="number"],
        input[type="tel"],
        input[type="url"],
        input[type="search"],
        textarea,
        select {
          font-size: 16px !important;
        }
      }
      
      /* Smooth Scrolling */
      html {
        scroll-behavior: smooth !important;
      }
      
      /* Improved Touch Targets */
      a, button, input, select, textarea, [role="button"], [tabindex] {
        min-height: 44px !important;
        min-width: 44px !important;
      }
      
      /* Prevent Horizontal Scroll */
      body, html {
        overflow-x: hidden !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      
      /* Improved Readability */
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
        line-height: 1.6 !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
      
      /* Better Focus Indicators */
      *:focus {
        outline: 2px solid #4299E1 !important;
        outline-offset: 2px !important;
      }
      
      /* Hide Focus for Mouse Users */
      .js-focus-visible *:focus:not(.focus-visible) {
        outline: none !important;
      }
      
      /* Loading States */
      .loading {
        pointer-events: none !important;
        opacity: 0.6 !important;
        cursor: wait !important;
      }
      
      /* Accessibility */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* High Contrast Mode */
      @media (prefers-contrast: high) {
        .card,
        [class*="card"] {
          border: 2px solid #4299E1 !important;
        }
        
        button,
        .btn {
          border: 2px solid currentColor !important;
        }
      }
      
      /* Dark Mode Preferences */
      @media (prefers-color-scheme: dark) {
        body {
          background: #121212 !important;
          color: #E2E8F0 !important;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  createStatusBarOverlay() {
    const existingOverlay = document.getElementById('galaxy-status-bar-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'galaxy-status-bar-overlay';
    overlay.className = 'status-bar-overlay';
    
    document.body.appendChild(overlay);
  }
  
  createNavigationBarOverlay() {
    const existingOverlay = document.getElementById('galaxy-navigation-bar-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'galaxy-navigation-bar-overlay';
    overlay.className = 'navigation-bar-overlay';
    
    document.body.appendChild(overlay);
  }
  
  setupOrientationHandling() {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
    
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }
  
  handleOrientationChange() {
    const newOrientation = this.getOrientation();
    console.log("🔄 [GALAXY] Orientation changed:", this.currentOrientation, "→", newOrientation);
    
    this.currentOrientation = newOrientation;
    
    // Re-apply optimizations for new orientation
    if (this.isGalaxyS25Ultra) {
      setTimeout(() => {
        this.applyGalaxyS25UltraOptimizations();
      }, 200);
    }
    
    // Trigger resize event for other components
    window.dispatchEvent(new Event('galaxy-orientation-change'));
  }
  
  handleResize() {
    // Update device detection
    this.isGalaxyS25Ultra = this.detectGalaxyS25Ultra();
    
    // Adjust viewport height for mobile browsers
    if (this.isMobile()) {
      this.adjustViewportHeight();
    }
  }
  
  adjustViewportHeight() {
    // Fix for mobile browser address bar
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  setupSafeAreaHandling() {
    // CSS Custom Properties für Safe Areas
    const style = document.createElement('style');
    style.id = 'safe-area-handling';
    style.textContent = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top, 0px);
        --safe-area-inset-right: env(safe-area-inset-right, 0px);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        --safe-area-inset-left: env(safe-area-inset-left, 0px);
        --vh: 1vh;
      }
      
      .safe-area-top {
        padding-top: var(--safe-area-inset-top) !important;
      }
      
      .safe-area-bottom {
        padding-bottom: var(--safe-area-inset-bottom) !important;
      }
      
      .safe-area-left {
        padding-left: var(--safe-area-inset-left) !important;
      }
      
      .safe-area-right {
        padding-right: var(--safe-area-inset-right) !important;
      }
      
      .full-height {
        height: calc(var(--vh, 1vh) * 100) !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Initial viewport height adjustment
    this.adjustViewportHeight();
  }
  
  setupPerformanceOptimizations() {
    // Passive Event Listeners
    const passiveEvents = ['touchstart', 'touchmove', 'wheel', 'scroll'];
    passiveEvents.forEach(event => {
      document.addEventListener(event, () => {}, { passive: true });
    });
    
    // Intersection Observer für Lazy Loading
    if ('IntersectionObserver' in window) {
      this.setupLazyLoading();
    }
    
    // Request Animation Frame für smooth animations
    this.setupSmoothAnimations();
    
    // Memory Management
    this.setupMemoryManagement();
  }
  
  setupLazyLoading() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Lazy load images
          if (element.tagName === 'IMG' && element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
            observer.unobserve(element);
          }
          
          // Lazy load components
          if (element.classList.contains('lazy-component')) {
            element.classList.add('loaded');
            observer.unobserve(element);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    // Observe lazy elements
    document.querySelectorAll('img[data-src], .lazy-component').forEach(el => {
      observer.observe(el);
    });
  }
  
  setupSmoothAnimations() {
    let ticking = false;
    
    const updateAnimations = () => {
      // Update any ongoing animations
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
      }
    };
    
    // Throttle scroll events
    window.addEventListener('scroll', requestTick, { passive: true });
  }
  
  setupMemoryManagement() {
    // Cleanup unused elements
    const cleanup = () => {
      // Remove unused event listeners
      // Clear unused caches
      // Garbage collect if possible
      if (window.gc && typeof window.gc === 'function') {
        window.gc();
      }
    };
    
    // Cleanup on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cleanup();
      }
    });
    
    // Cleanup on low memory
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = performance.memory;
        if (memInfo.usedJSHeapSize / memInfo.totalJSHeapSize > 0.8) {
          cleanup();
        }
      }, 30000);
    }
  }
  
  isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  // Public API
  getDeviceInfo() {
    return {
      isGalaxyS25Ultra: this.isGalaxyS25Ultra,
      orientation: this.currentOrientation,
      specs: this.deviceSpecs,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio
      }
    };
  }
  
  optimizeForPresentation() {
    console.log("🎯 [GALAXY] Optimiere für Präsentation...");
    
    // Verstecke Debug-Elemente
    const debugElements = document.querySelectorAll('.debug, .dev-tools, [class*="debug"]');
    debugElements.forEach(el => {
      el.style.display = 'none';
    });
    
    // Aktiviere Präsentationsmodus
    document.body.classList.add('presentation-mode');
    
    // Optimiere Performance
    document.body.style.willChange = 'transform';
    
    console.log("✅ [GALAXY] Präsentationsmodus aktiviert");
  }
  
  destroy() {
    // Cleanup
    const styles = [
      'galaxy-s25-ultra-optimizations',
      'universal-mobile-optimizations',
      'safe-area-handling'
    ];
    
    styles.forEach(id => {
      const style = document.getElementById(id);
      if (style) style.remove();
    });
    
    const overlays = [
      'galaxy-status-bar-overlay',
      'galaxy-navigation-bar-overlay'
    ];
    
    overlays.forEach(id => {
      const overlay = document.getElementById(id);
      if (overlay) overlay.remove();
    });
    
    console.log("🗑️ [GALAXY] Galaxy S25 Ultra Optimizer zerstört");
  }
}

// Initialize Galaxy S25 Ultra Optimizer
window.clara360GalaxyOptimizer = new Clara360GalaxyS25UltraOptimizer();

// Export für andere Module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Clara360GalaxyS25UltraOptimizer;
}

