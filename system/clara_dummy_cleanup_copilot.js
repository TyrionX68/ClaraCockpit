/**
 * 🤖 GitHub Copilot-optimierte Clara Dummy-Bereinigung
 * Intelligente DOM-Manipulation für präzise Dummy-Elimination
 * Entwickelt mit GitHub Copilot Best Practices
 */

(function() {
  'use strict';
  
  console.log("🤖 GitHub Copilot Clara Dummy-Bereinigung aktiviert");
  
  // 🎯 Copilot-optimierte Dummy-Selektoren
  const DUMMY_PATTERNS = {
    // Spezifische Dummy-Texte
    texts: [
      'Kannst du mir mehr Details zu den Heizkosten geben?',
      'Gerne! Die Heizkosten sind in den letzten 3 Monaten um 15% gestiegen',
      'vor 5 Min',
      'vor 3 Min',
      'TH',
      'Heizkosten sind in den letzten',
      'wichtige Analyse für Sie',
      'Wartung der Heizungsanlage empfohlen'
    ],
    
    // CSS-Selektoren für Dummy-Elemente
    selectors: [
      '[style*="background: #e0e7ff"]', // Blaue User-Bubbles
      '[style*="background: #dcfce7"]', // Grüne Clara-Bubbles
      '.chat-message:has-text("TH")',
      '.message:has-text("Heizkosten")',
      '.bubble:has-text("vor")',
      '[class*="timestamp"]:has-text("Min")'
    ]
  };
  
  // 🧠 Copilot-inspirierte intelligente Bereinigung
  function intelligentDummyCleanup() {
    console.log("🔧 Starte intelligente Dummy-Bereinigung...");
    
    let cleanupCount = 0;
    
    // 1. Text-basierte Bereinigung
    DUMMY_PATTERNS.texts.forEach(dummyText => {
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        if (el.textContent && el.textContent.includes(dummyText)) {
          // Prüfe, ob es NICHT der Begrüßungstext ist
          if (!el.textContent.includes('Hallo! Ich bin Clara') && 
              !el.textContent.includes('KI-Assistent für die Hausverwaltung')) {
            console.log(`🗑️ Dummy-Element entfernt: "${el.textContent.substring(0, 50)}..."`);
            el.remove();
            cleanupCount++;
          }
        }
      });
    });
    
    // 2. CSS-Selektor-basierte Bereinigung
    DUMMY_PATTERNS.selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          if (!el.textContent.includes('Hallo! Ich bin Clara')) {
            console.log(`🗑️ CSS-Dummy entfernt: ${selector}`);
            el.remove();
            cleanupCount++;
          }
        });
      } catch (e) {
        // Ignoriere ungültige Selektoren
      }
    });
    
    // 3. Spezielle Chat-Bubble-Bereinigung
    const chatBubbles = document.querySelectorAll('[style*="padding: 12px 16px"]');
    chatBubbles.forEach(bubble => {
      const text = bubble.textContent;
      if (text && (
        text.includes('👤 Sie:') ||
        text.includes('🤖 Clara:') ||
        text.includes('TH') ||
        text.includes('Heizkosten')
      ) && !text.includes('Hallo! Ich bin Clara')) {
        console.log(`🗑️ Chat-Bubble entfernt: "${text.substring(0, 30)}..."`);
        bubble.closest('div').remove();
        cleanupCount++;
      }
    });
    
    // 4. Zeitstempel-Bereinigung
    const timeElements = document.querySelectorAll('*');
    timeElements.forEach(el => {
      if (el.textContent && /vor \d+ Min/.test(el.textContent)) {
        console.log(`🗑️ Zeitstempel entfernt: "${el.textContent}"`);
        el.remove();
        cleanupCount++;
      }
    });
    
    console.log(`✅ Bereinigung abgeschlossen: ${cleanupCount} Dummy-Elemente entfernt`);
    
    // 5. Begrüßungstext-Validierung
    const greetingElements = document.querySelectorAll('*');
    let greetingFound = false;
    greetingElements.forEach(el => {
      if (el.textContent && el.textContent.includes('Hallo! Ich bin Clara')) {
        greetingFound = true;
        console.log("✅ Begrüßungstext erhalten:", el.textContent.substring(0, 50) + "...");
      }
    });
    
    if (!greetingFound) {
      console.warn("⚠️ Begrüßungstext nicht gefunden - möglicherweise versehentlich entfernt");
    }
  }
  
  // 🎯 Copilot-optimierte Initialisierung
  function initCopilotCleanup() {
    // Prüfe Clara KI-Seite
    if (window.location.pathname.includes('/clara-ki') || 
        window.location.href.includes('clara-ki') ||
        document.querySelector('[class*="clara"]')) {
      
      console.log("🎯 Clara KI-Bereich erkannt - Copilot-Bereinigung aktiviert");
      
      // Sofortige Bereinigung
      setTimeout(intelligentDummyCleanup, 1000);
      
      // Wiederholte Bereinigung für dynamische Inhalte
      setTimeout(intelligentDummyCleanup, 3000);
      setTimeout(intelligentDummyCleanup, 5000);
      
      // Kontinuierliche Überwachung mit MutationObserver
      const observer = new MutationObserver((mutations) => {
        let shouldClean = false;
        mutations.forEach(mutation => {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.textContent && (
                node.textContent.includes('TH') ||
                node.textContent.includes('Heizkosten') ||
                node.textContent.includes('vor') && node.textContent.includes('Min')
              )) {
                shouldClean = true;
              }
            });
          }
        });
        
        if (shouldClean) {
          setTimeout(intelligentDummyCleanup, 500);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      console.log("🔄 Kontinuierliche Copilot-Überwachung aktiviert");
    }
  }
  
  // 🚀 Starte Copilot-Bereinigung
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopilotCleanup);
  } else {
    initCopilotCleanup();
  }
  
  // Auch bei Seitenwechseln (SPA)
  window.addEventListener('popstate', initCopilotCleanup);
  window.addEventListener('hashchange', initCopilotCleanup);
  
  console.log("🤖 GitHub Copilot Clara Dummy-Bereinigung bereit!");
  
})();
