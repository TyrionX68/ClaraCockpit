/**
 * clara_debug.js
 * Debug-Skript für Clara KI
 */

// Globaler Namespace für Clara-Funktionalitäten
window.ClaraKI = window.ClaraKI || {};

// Debug-Modul
window.ClaraKI.Debug = {
  isInitialized: false,
  
  // Initialisierung
  init: function() {
    if (this.isInitialized) return true;
    
    console.group('[CLARA-DEBUG] Initialisierung');
    
    try {
      // Skript-Verfügbarkeit prüfen
      this.checkScripts();
      
      this.isInitialized = true;
      console.log('✅ Clara Debug initialisiert');
      console.groupEnd();
      return true;
    } catch (err) {
      console.error('❌ Fehler bei Debug-Initialisierung:', err);
      console.groupEnd();
      return false;
    }
  },
  
  // Skript-Verfügbarkeit prüfen
  checkScripts: function() {
    console.log('🔍 Prüfe Skript-Verfügbarkeit...');
    
    const scripts = [
      '/system/clara_json_engine.js',
      '/system/clara_voice.js',
      '/lib/clara_dialog_context.js',
      '/system/clara_integration.js'
    ];
    
    scripts.forEach(script => {
      fetch(script)
        .then(response => {
          if (response.ok) {
            console.log(`✅ ${script} ist verfügbar`);
          } else {
            console.error(`❌ ${script} ist nicht verfügbar (${response.status})`);
          }
        })
        .catch(err => {
          console.error(`❌ ${script} ist nicht verfügbar:`, err);
        });
    });
  }
};

// Initialisierung starten
document.addEventListener('DOMContentLoaded', function() {
  window.ClaraKI.Debug.init();
});

