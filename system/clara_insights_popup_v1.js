/**
 * Clara360 KI-Chat Bereinigung - Nur Begrüßungstext
 * Entfernt alle Dummy-Konversationen und zeigt nur saubere Chat-Oberfläche
 */

(function() {
  'use strict';
  
  console.log("🧹 Clara KI-Chat Bereinigung aktiviert - Dummy-Konversation wird entfernt");
  
  // Funktion zum Bereinigen der Clara KI-Seite
  function cleanClaraKIPage() {
    console.log("🔧 Bereinige Clara KI-Seite...");
    
    // 1. Entferne alle Dummy-Chat-Nachrichten
    const chatMessages = document.querySelectorAll('[class*="message"], [class*="chat"], .chat-message, .message');
    chatMessages.forEach(message => {
      const text = message.textContent;
      if (text && (
        text.includes('Heizkosten') || 
        text.includes('Details zu den Heizkosten') ||
        text.includes('Gerne! Die Heizkosten') ||
        text.includes('wichtige Analyse für Sie') ||
        text.includes('15% gestiegen') ||
        text.includes('Wartung der Heizungsanlage')
      )) {
        console.log("🗑️ Dummy-Nachricht entfernt:", text.substring(0, 50) + "...");
        message.remove();
      }
    });
    
    // 2. Setze nur Begrüßungstext
    const textElements = document.querySelectorAll('p, div, span');
    textElements.forEach(element => {
      const text = element.textContent;
      if (text && text.includes('Hallo! Ich bin Clara') && text.length > 50) {
        console.log("📝 Begrüßungstext vereinfacht");
        element.textContent = 'Hallo! Ich bin Clara, Ihr KI-Assistent für die Hausverwaltung. Wie kann ich Ihnen helfen?';
      }
      // Entferne Analyse-Begrüßungen
      if (text && text.includes('Ich habe heute eine') && text.length > 100) {
        console.log("📝 Analyse-Begrüßung entfernt");
        element.textContent = 'Hallo! Ich bin Clara, Ihr KI-Assistent für die Hausverwaltung. Wie kann ich Ihnen helfen?';
      }
    });
    
    // 3. Entferne alle Chat-Bubble-Container mit Dummy-Inhalten
    const chatBubbles = document.querySelectorAll('[style*="background"], .chat-bubble, .message-bubble');
    chatBubbles.forEach(bubble => {
      const text = bubble.textContent;
      if (text && (
        text.includes('Kannst du mir mehr Details') ||
        text.includes('TH') ||
        text.includes('Heizkosten sind in den letzten')
      )) {
        console.log("🗑️ Chat-Bubble entfernt:", text.substring(0, 30) + "...");
        bubble.remove();
      }
    });
    
    // 4. Bereinige Chat-Container
    const chatContainers = document.querySelectorAll('[class*="chat-container"], [class*="messages"], [id*="chat"]');
    chatContainers.forEach(container => {
      // Entferne nur Dummy-Inhalte, behalte Struktur
      const dummyElements = container.querySelectorAll('*');
      dummyElements.forEach(el => {
        const text = el.textContent;
        if (text && (
          text.includes('vor 5 Min') ||
          text.includes('vor 3 Min') ||
          text.includes('TH') ||
          text.includes('Heizkosten')
        )) {
          el.remove();
        }
      });
    });
    
    console.log("✅ Clara KI-Seite bereinigt - Nur Begrüßungstext verbleibt");
  }
  
  // Initialisierung nur für Clara KI-Seite
  function initClaraKICleanup() {
    if (window.location.pathname === "/clara-ki" || 
        window.location.href.includes("/clara-ki") ||
        window.location.hash.includes("clara-ki")) {
      
      console.log("✅ Clara KI-Seite erkannt - Bereinigung aktiviert");
      
      // Sofortige Bereinigung
      setTimeout(() => {
        cleanClaraKIPage();
      }, 1000);
      
      // Wiederholte Bereinigung für React-Updates
      setTimeout(() => {
        cleanClaraKIPage();
      }, 3000);
      
      // Kontinuierliche Überwachung
      const observer = new MutationObserver(() => {
        cleanClaraKIPage();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      console.log("🔄 Kontinuierliche Bereinigung aktiviert");
    }
  }
  
  // Starte Bereinigung
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClaraKICleanup);
  } else {
    initClaraKICleanup();
  }
  
  // Auch bei Seitenwechseln (SPA)
  window.addEventListener('popstate', initClaraKICleanup);
  window.addEventListener('hashchange', initClaraKICleanup);
  
})();
