/**
 * WhatsApp Business Button Integration für Clara360 Mieter-Kommunikation
 * Direkte DOM-Integration für statische HTML-Seite
 * Author: 📛 Manus A | Communication Specialist
 * Date: 2025-06-19
 */

(function() {
  'use strict';
  
  console.log('📱 [WHATSAPP] WhatsApp Business Button Integration wird geladen...');
  
  // Warte bis DOM geladen ist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhatsAppButton);
  } else {
    initWhatsAppButton();
  }
  
  function initWhatsAppButton() {
    // Prüfe ob wir auf der Mieter-Kommunikation Seite sind
    if (!window.location.pathname.includes('mieter-kommunikation')) {
      return;
    }
    
    console.log('📱 [WHATSAPP] Initialisiere WhatsApp Button auf Mieter-Kommunikation Seite');
    
    // Finde die Button-Container (neben "Neue Nachricht" und "Rundschreiben")
    const buttonContainer = findButtonContainer();
    if (!buttonContainer) {
      console.error('❌ [WHATSAPP] Button-Container nicht gefunden');
      return;
    }
    
    // Erstelle WhatsApp Button
    const whatsappButton = createWhatsAppButton();
    
    // Füge Button zum Container hinzu
    buttonContainer.appendChild(whatsappButton);
    
    // Erstelle Modal
    createWhatsAppModal();
    
    console.log('✅ [WHATSAPP] WhatsApp Business Button erfolgreich integriert');
  }
  
  function findButtonContainer() {
    // Suche nach dem Container mit "Neue Nachricht" und "Rundschreiben"
    const buttons = document.querySelectorAll('button');
    let neueNachrichtButton = null;
    let rundschreibenButton = null;
    
    buttons.forEach(button => {
      if (button.textContent.includes('Neue Nachricht')) {
        neueNachrichtButton = button;
      }
      if (button.textContent.includes('Rundschreiben')) {
        rundschreibenButton = button;
      }
    });
    
    if (neueNachrichtButton && rundschreibenButton) {
      // Finde gemeinsamen Parent-Container
      return neueNachrichtButton.parentElement;
    }
    
    // Fallback: Suche nach Header-Bereich
    const header = document.querySelector('h1, h2, .header, [class*="header"]');
    if (header) {
      return header.parentElement;
    }
    
    return document.body;
  }
  
  function createWhatsAppButton() {
    const button = document.createElement('button');
    button.id = 'clara360-whatsapp-button';
    button.className = 'whatsapp-business-btn';
    button.innerHTML = `
      <svg class="whatsapp-icon" viewBox="0 0 24 24" width="20" height="20">
        <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386"/>
      </svg>
      <span class="whatsapp-status" id="whatsapp-status-indicator"></span>
    `;
    
    // Event Listener
    button.addEventListener('click', openWhatsAppModal);
    
    // Prüfe WhatsApp-Integration Status
    if (window.ClaraWhatsAppIntegration) {
      button.classList.add('connected');
      document.getElementById('whatsapp-status-indicator').style.display = 'block';
    }
    
    return button;
  }
  
  function createWhatsAppModal() {
    const modal = document.createElement('div');
    modal.id = 'clara360-whatsapp-modal';
    modal.className = 'whatsapp-modal hidden';
    
    modal.innerHTML = `
      <div class="modal-overlay" onclick="closeWhatsAppModal()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>WhatsApp Business Nachricht</h3>
          <button onclick="closeWhatsAppModal()" class="modal-close">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="whatsapp-template">Nachrichtenvorlage:</label>
            <select id="whatsapp-template">
              <option value="">Template auswählen...</option>
              <option value="rent_reminder">Mietmahnung</option>
              <option value="maintenance_notice">Wartungsankündigung</option>
              <option value="rent_increase">Mieterhöhung</option>
              <option value="welcome_tenant">Willkommen neuer Mieter</option>
              <option value="inspection_notice">Besichtigungsankündigung</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="whatsapp-contact">Empfänger:</label>
            <select id="whatsapp-contact">
              <option value="">Mieter auswählen...</option>
              <option value="tenant_1">Echter Mieter (1. OG rechts)</option>
              <option value="tenant_2">Mieter (EG links)</option>
              <option value="tenant_3">Frau Weber (2. OG links)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="whatsapp-preview">Nachrichtenvorschau:</label>
            <textarea id="whatsapp-preview" readonly placeholder="Wählen Sie ein Template aus..."></textarea>
          </div>
        </div>
        
        <div class="modal-actions">
          <button onclick="closeWhatsAppModal()" class="btn-secondary">Abbrechen</button>
          <button onclick="sendWhatsAppMessage()" class="btn-primary">WhatsApp öffnen</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Template Preview Update
    document.getElementById('whatsapp-template').addEventListener('change', updateMessagePreview);
  }
  
  function updateMessagePreview() {
    const templateSelect = document.getElementById('whatsapp-template');
    const previewTextarea = document.getElementById('whatsapp-preview');
    
    const templates = {
      'rent_reminder': 'Hallo {{tenant_name}}, Ihre Miete für {{property}} ist seit {{days}} Tagen überfällig. Betrag: {{amount}}€. Bitte überweisen Sie umgehend.',
      'maintenance_notice': 'Liebe/r {{tenant_name}}, am {{date}} findet eine Wartung in {{property}} statt. Zeitraum: {{time}}. Bitte sorgen Sie für Zugang.',
      'rent_increase': 'Sehr geehrte/r {{tenant_name}}, hiermit kündigen wir eine Mieterhöhung für {{property}} an. Neue Miete: {{new_amount}}€ ab {{date}}.',
      'welcome_tenant': 'Herzlich willkommen in {{property}}! Hier sind Ihre wichtigsten Informationen: Hausmeister: {{caretaker}}, Notfall: {{emergency}}.',
      'inspection_notice': 'Liebe/r {{tenant_name}}, am {{date}} um {{time}} findet eine Besichtigung in {{property}} statt. Grund: {{reason}}.'
    };
    
    const selectedTemplate = templateSelect.value;
    if (selectedTemplate && templates[selectedTemplate]) {
      // Ersetze Variablen mit Beispielwerten
      let preview = templates[selectedTemplate];
      preview = preview.replace(/{{tenant_name}}/g, 'Echter Mieter');
      preview = preview.replace(/{{property}}/g, 'Waldhofstraße 76');
      preview = preview.replace(/{{amount}}/g, '1200');
      preview = preview.replace(/{{days}}/g, '30');
      preview = preview.replace(/{{date}}/g, '15.07.2025');
      preview = preview.replace(/{{time}}/g, '09:00-12:00');
      preview = preview.replace(/{{new_amount}}/g, '1250');
      preview = preview.replace(/{{caretaker}}/g, 'Herr Schmidt (0621-123456)');
      preview = preview.replace(/{{emergency}}/g, '0621-987654');
      preview = preview.replace(/{{reason}}/g, 'Routineinspektion');
      
      previewTextarea.value = preview;
    } else {
      previewTextarea.value = 'Wählen Sie ein Template aus...';
    }
  }
  
  // Globale Funktionen für Modal
  window.openWhatsAppModal = function() {
    const modal = document.getElementById('clara360-whatsapp-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };
  
  window.closeWhatsAppModal = function() {
    const modal = document.getElementById('clara360-whatsapp-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    
    // Reset Form
    document.getElementById('whatsapp-template').value = '';
    document.getElementById('whatsapp-contact').value = '';
    document.getElementById('whatsapp-preview').value = 'Wählen Sie ein Template aus...';
  };
  
  window.sendWhatsAppMessage = async function() {
    const templateSelect = document.getElementById('whatsapp-template');
    const contactSelect = document.getElementById('whatsapp-contact');
    
    const selectedTemplate = templateSelect.value;
    const selectedContact = contactSelect.value;
    
    if (!selectedTemplate || !selectedContact) {
      alert('Bitte Template und Empfänger auswählen');
      return;
    }
    
    try {
      if (window.ClaraWhatsAppIntegration) {
        // Nutze bestehende Clara WhatsApp Integration
        const result = await window.ClaraWhatsAppIntegration.sendMessage(
          selectedContact,
          selectedTemplate,
          {
            tenant_name: 'Echter Mieter',
            property: 'Waldhofstraße 76',
            amount: '1200',
            days: '30',
            date: '15.07.2025',
            time: '09:00-12:00',
            new_amount: '1250',
            caretaker: 'Herr Schmidt (0621-123456)',
            emergency: '0621-987654',
            reason: 'Routineinspektion'
          }
        );
        
        alert(`✅ WhatsApp-Nachricht gesendet an: ${result.contact}`);
        closeWhatsAppModal();
      } else {
        // Fallback: Direkte WhatsApp-URL
        const preview = document.getElementById('whatsapp-preview').value;
        const whatsappUrl = `https://wa.me/4917612345678?text=${encodeURIComponent(preview)}`;
        window.open(whatsappUrl, '_blank');
        
        alert('✅ WhatsApp wird geöffnet');
        closeWhatsAppModal();
      }
    } catch (error) {
      console.error('❌ [WHATSAPP] Fehler beim Senden:', error);
      alert('❌ Fehler beim Senden: ' + error.message);
    }
  };
  
  // CSS Styles hinzufügen
  const styles = `
    <style>
      .whatsapp-business-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        background: #25D366;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        width: 40px;
        height: 40px;
        margin: 0.25rem;
        box-shadow: 0 2px 4px rgba(37, 211, 102, 0.2);
      }
      
      .whatsapp-business-btn:hover {
        background: #22C55E;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
      }
      
      .whatsapp-business-btn.connected {
        background: #059669;
      }
      
      .whatsapp-icon {
        color: white;
        flex-shrink: 0;
      }
      
      .whatsapp-status {
        position: absolute;
        top: -2px;
        right: -2px;
        width: 8px;
        height: 8px;
        background: #10B981;
        border: 2px solid white;
        border-radius: 50%;
        display: none;
      }
      
      .whatsapp-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .whatsapp-modal.hidden {
        display: none;
      }
      
      .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
      }
      
      .modal-content {
        position: relative;
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .modal-header h3 {
        margin: 0;
        color: #25D366;
        font-size: 1.25rem;
      }
      
      .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .form-group {
        margin-bottom: 1rem;
      }
      
      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
      }
      
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 1rem;
        font-family: system-ui, sans-serif;
      }
      
      .form-group textarea {
        min-height: 100px;
        resize: vertical;
        background: #f9fafb;
      }
      
      .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }
      
      .modal-actions button {
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid #d1d5db;
        font-family: system-ui, sans-serif;
      }
      
      .btn-secondary {
        background: #f3f4f6;
        color: #374151;
      }
      
      .btn-primary {
        background: #25D366;
        color: white;
        border-color: #25D366;
      }
      
      .btn-primary:hover {
        background: #22C55E;
      }
      
      @media (max-width: 768px) {
        .whatsapp-business-btn {
          width: 36px;
          height: 36px;
          padding: 0.4rem;
        }
        
        .whatsapp-icon {
          width: 18px;
          height: 18px;
        }
        
        .modal-content {
          margin: 1rem;
          padding: 1rem;
        }
        
        .modal-actions {
          flex-direction: column;
        }
      }
    </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', styles);
  
})();

console.log('✅ [WHATSAPP] WhatsApp Business Integration Script geladen');

