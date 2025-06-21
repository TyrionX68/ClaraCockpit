/**
 * WhatsApp Business Integration für Clara360 Mieter-Kommunikation
 * Vorsichtige Integration ohne bestehende Funktionalität zu gefährden
 * Version: 2.0 - Angepasst an bestehende Struktur
 */

(function() {
  'use strict';
  
  console.log('[CLARA-WHATSAPP] Integration wird geladen...');
  
  // Warte auf vollständiges Laden der Seite
  function initWhatsAppIntegration() {
    // Prüfe ob wir auf der Mieter-Kommunikation Seite sind
    if (!window.location.pathname.includes('mieter-kommunikation')) {
      return;
    }
    
    console.log('[CLARA-WHATSAPP] Mieter-Kommunikation Seite erkannt');
    
    // Suche nach dem Header-Bereich mit den Buttons
    const headerButtons = document.querySelector('.btn-group, .button-group, [class*="button"], [class*="header"]');
    const neueNachrichtBtn = document.querySelector('button:contains("Neue Nachricht"), [class*="btn"]:contains("Neue Nachricht")');
    
    if (!neueNachrichtBtn) {
      console.log('[CLARA-WHATSAPP] Warte auf Button-Container...');
      setTimeout(initWhatsAppIntegration, 1000);
      return;
    }
    
    // Erstelle WhatsApp-Button
    createWhatsAppButton(neueNachrichtBtn);
    
    // Bereinige Dummy-Nachrichten
    cleanupDummyMessages();
  }
  
  function createWhatsAppButton(referenceButton) {
    // Prüfe ob Button bereits existiert
    if (document.getElementById('clara-whatsapp-btn')) {
      return;
    }
    
    console.log('[CLARA-WHATSAPP] Erstelle WhatsApp-Button...');
    
    // Erstelle WhatsApp-Button
    const whatsappBtn = document.createElement('button');
    whatsappBtn.id = 'clara-whatsapp-btn';
    whatsappBtn.className = referenceButton.className; // Übernehme Styling
    whatsappBtn.style.cssText = `
      background: #25D366 !important;
      color: white !important;
      border: none !important;
      margin-left: 8px !important;
      padding: 8px 16px !important;
      border-radius: 6px !important;
      font-size: 14px !important;
      cursor: pointer !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
      transition: all 0.2s ease !important;
    `;
    
    // WhatsApp SVG Icon
    whatsappBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386"/>
      </svg>
      WhatsApp
    `;
    
    // Hover-Effekte
    whatsappBtn.addEventListener('mouseenter', function() {
      this.style.background = '#128C7E !important';
      this.style.transform = 'translateY(-1px) !important';
    });
    
    whatsappBtn.addEventListener('mouseleave', function() {
      this.style.background = '#25D366 !important';
      this.style.transform = 'translateY(0) !important';
    });
    
    // Click-Handler
    whatsappBtn.addEventListener('click', function() {
      openWhatsAppModal();
    });
    
    // Button neben "Neue Nachricht" einfügen
    referenceButton.parentNode.insertBefore(whatsappBtn, referenceButton.nextSibling);
    
    console.log('[CLARA-WHATSAPP] Button erfolgreich erstellt');
  }
  
  function openWhatsAppModal() {
    console.log('[CLARA-WHATSAPP] Öffne WhatsApp-Modal...');
    
    // Erstelle Modal
    const modal = document.createElement('div');
    modal.id = 'clara-whatsapp-modal';
    modal.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0,0,0,0.5) !important;
      z-index: 10000 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    `;
    
    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h3 style="margin: 0; color: #25D366; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386"/>
            </svg>
            WhatsApp Business
          </h3>
          <button onclick="document.getElementById('clara-whatsapp-modal').remove()" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
          ">&times;</button>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Empfänger:</label>
          <select id="whatsapp-recipient" style="
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
          ">
            <option value="">Mieter auswählen...</option>
            <option value="+491601234567">Echter Mieter (1. OG rechts)</option>
            <option value="+491607654321">Mieter (EG links)</option>
            <option value="+491609876543">Frau Weber (2. OG links)</option>
          </select>
        </div>
        
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Nachrichtenvorlage:</label>
          <select id="whatsapp-template" style="
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
          ">
            <option value="">Vorlage auswählen...</option>
            <option value="mietmahnung">Mietmahnung</option>
            <option value="wartung">Wartungsankündigung</option>
            <option value="heizung">Heizungsproblem</option>
            <option value="nebenkostenabrechnung">Nebenkostenabrechnung</option>
            <option value="kuendigung">Kündigung</option>
            <option value="custom">Individuelle Nachricht</option>
          </select>
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600;">Nachricht:</label>
          <textarea id="whatsapp-message" style="
            width: 100%;
            height: 120px;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            resize: vertical;
            font-family: inherit;
          " placeholder="Nachricht wird automatisch generiert..."></textarea>
        </div>
        
        <div style="display: flex; gap: 12px; justify-content: flex-end;">
          <button onclick="document.getElementById('clara-whatsapp-modal').remove()" style="
            padding: 10px 20px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
          ">Abbrechen</button>
          <button onclick="sendWhatsAppMessage()" style="
            padding: 10px 20px;
            background: #25D366;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
          ">WhatsApp öffnen</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Template-Handler
    document.getElementById('whatsapp-template').addEventListener('change', function() {
      const template = this.value;
      const messageArea = document.getElementById('whatsapp-message');
      const recipient = document.getElementById('whatsapp-recipient');
      
      const templates = {
        'mietmahnung': 'Sehr geehrte/r {name},\n\nIhre Miete für {monat} ist noch nicht eingegangen. Bitte überweisen Sie den ausstehenden Betrag zeitnah.\n\nVielen Dank\nIhr Hausverwaltungsteam',
        'wartung': 'Liebe/r {name},\n\nam {datum} findet eine Wartung in Ihrem Gebäude statt. Bitte halten Sie Ihre Wohnung zugänglich.\n\nVielen Dank für Ihr Verständnis',
        'heizung': 'Hallo {name},\n\nwir haben Ihr Heizungsproblem zur Kenntnis genommen und werden uns umgehend darum kümmern.\n\nBeste Grüße',
        'nebenkostenabrechnung': 'Sehr geehrte/r {name},\n\nIhre Nebenkostenabrechnung für {jahr} ist verfügbar. Sie können diese in Ihrem Portal einsehen.\n\nBei Fragen stehen wir gerne zur Verfügung.',
        'kuendigung': 'Sehr geehrte/r {name},\n\nwir haben Ihre Kündigung erhalten und bestätigen diese hiermit. Weitere Details folgen per Post.\n\nVielen Dank',
        'custom': ''
      };
      
      if (templates[template]) {
        messageArea.value = templates[template].replace('{name}', 'Mieter').replace('{monat}', 'Januar 2025').replace('{datum}', '15.01.2025').replace('{jahr}', '2024');
      }
    });
    
    // Modal schließen bei Klick außerhalb
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
  
  // WhatsApp-Nachricht senden
  window.sendWhatsAppMessage = function() {
    const recipient = document.getElementById('whatsapp-recipient').value;
    const message = document.getElementById('whatsapp-message').value;
    
    if (!recipient) {
      alert('Bitte wählen Sie einen Empfänger aus.');
      return;
    }
    
    if (!message.trim()) {
      alert('Bitte geben Sie eine Nachricht ein.');
      return;
    }
    
    // WhatsApp-URL erstellen
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${recipient.replace('+', '')}?text=${encodedMessage}`;
    
    console.log('[CLARA-WHATSAPP] Öffne WhatsApp:', whatsappUrl);
    
    // WhatsApp öffnen
    window.open(whatsappUrl, '_blank');
    
    // Modal schließen
    document.getElementById('clara-whatsapp-modal').remove();
    
    // Erfolg-Feedback
    showSuccessMessage('WhatsApp wurde geöffnet. Nachricht kann gesendet werden.');
  };
  
  function showSuccessMessage(text) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #25D366;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10001;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    toast.textContent = text;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
  
  function cleanupDummyMessages() {
    console.log('[CLARA-WHATSAPP] Bereinige Dummy-Nachrichten...');
    
    // Suche nach Dummy-Inhalten
    const dummySelectors = [
      'text*="Echter Mieter"',
      'text*="Dummy"',
      'text*="Test"',
      'text*="Lorem ipsum"'
    ];
    
    // Entferne Dummy-Nachrichten vorsichtig
    setTimeout(() => {
      const messages = document.querySelectorAll('[class*="message"], [class*="chat"], [class*="nachricht"]');
      messages.forEach(msg => {
        const text = msg.textContent || '';
        if (text.includes('Dummy') || text.includes('Test-') || text.includes('Lorem')) {
          console.log('[CLARA-WHATSAPP] Entferne Dummy-Nachricht:', text.substring(0, 50));
          // msg.style.display = 'none'; // Vorsichtig ausblenden statt löschen
        }
      });
    }, 2000);
  }
  
  // Initialisierung
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsAppIntegration);
  } else {
    initWhatsAppIntegration();
  }
  
  // Fallback für React-Apps
  setTimeout(initWhatsAppIntegration, 2000);
  setTimeout(initWhatsAppIntegration, 5000);
  
  console.log('[CLARA-WHATSAPP] Integration bereit');
})();

