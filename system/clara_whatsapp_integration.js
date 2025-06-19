// Clara360 WhatsApp Integration
class ClaraWhatsAppIntegration {
  constructor() {
    this.apiEndpoint = '/api/whatsapp';
    this.templates = new Map();
    this.contacts = new Map();
    this.conversations = new Map();
    this.init();
  }

  init() {
    this.loadTemplates();
    this.loadContacts();
    this.setupEventListeners();
    console.log('✅ WhatsApp Integration initialisiert');
  }

  loadTemplates() {
    // Standard-Templates für Hausverwaltung
    this.templates.set('rent_reminder', {
      name: 'Mietmahnung',
      content: 'Hallo {{tenant_name}}, Ihre Miete für {{property}} ist seit {{days}} Tagen überfällig. Betrag: {{amount}}€. Bitte überweisen Sie umgehend.',
      variables: ['tenant_name', 'property', 'days', 'amount']
    });

    this.templates.set('maintenance_notice', {
      name: 'Wartungsankündigung',
      content: 'Liebe/r {{tenant_name}}, am {{date}} findet eine Wartung in {{property}} statt. Zeitraum: {{time}}. Bitte sorgen Sie für Zugang.',
      variables: ['tenant_name', 'date', 'property', 'time']
    });

    this.templates.set('rent_increase', {
      name: 'Mieterhöhung',
      content: 'Sehr geehrte/r {{tenant_name}}, hiermit kündigen wir eine Mieterhöhung für {{property}} an. Neue Miete: {{new_amount}}€ ab {{date}}.',
      variables: ['tenant_name', 'property', 'new_amount', 'date']
    });

    this.templates.set('welcome_tenant', {
      name: 'Willkommen neuer Mieter',
      content: 'Herzlich willkommen in {{property}}! Hier sind Ihre wichtigsten Informationen: Hausmeister: {{caretaker}}, Notfall: {{emergency}}.',
      variables: ['property', 'caretaker', 'emergency']
    });

    this.templates.set('inspection_notice', {
      name: 'Besichtigungsankündigung',
      content: 'Liebe/r {{tenant_name}}, am {{date}} um {{time}} findet eine Besichtigung in {{property}} statt. Grund: {{reason}}.',
      variables: ['tenant_name', 'date', 'time', 'property', 'reason']
    });
  }

  loadContacts() {
    // Lade Mieter-Kontakte aus lokalen Daten
    if (window.claraDataBridge) {
      window.claraDataBridge.getTenants().then(tenants => {
        tenants.forEach(tenant => {
          if (tenant.phone) {
            this.contacts.set(tenant.id, {
              name: tenant.name,
              phone: this.formatPhoneNumber(tenant.phone),
              property: tenant.property,
              email: tenant.email
            });
          }
        });
        console.log(`📱 ${this.contacts.size} WhatsApp-Kontakte geladen`);
      });
    }
  }

  formatPhoneNumber(phone) {
    // Deutsche Telefonnummer zu WhatsApp-Format
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0')) {
      formatted = '49' + formatted.substring(1);
    }
    if (!formatted.startsWith('49')) {
      formatted = '49' + formatted;
    }
    return formatted;
  }

  async sendMessage(contactId, templateId, variables = {}) {
    const contact = this.contacts.get(contactId);
    const template = this.templates.get(templateId);
    
    if (!contact || !template) {
      throw new Error('Kontakt oder Template nicht gefunden');
    }

    // Template-Variablen ersetzen
    let message = template.content;
    template.variables.forEach(variable => {
      const value = variables[variable] || `{{${variable}}}`;
      message = message.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    // WhatsApp-URL erstellen
    const whatsappUrl = `https://wa.me/${contact.phone}?text=${encodeURIComponent(message)}`;
    
    // Conversation speichern
    this.saveConversation(contactId, message, 'sent');
    
    // WhatsApp öffnen
    window.open(whatsappUrl, '_blank');
    
    return {
      success: true,
      contact: contact.name,
      message: message,
      url: whatsappUrl
    };
  }

  async sendBulkMessage(contactIds, templateId, variables = {}) {
    const results = [];
    
    for (const contactId of contactIds) {
      try {
        const result = await this.sendMessage(contactId, templateId, variables);
        results.push({ contactId, success: true, result });
        
        // Kurze Pause zwischen Nachrichten
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({ contactId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  saveConversation(contactId, message, type) {
    if (!this.conversations.has(contactId)) {
      this.conversations.set(contactId, []);
    }
    
    this.conversations.get(contactId).push({
      timestamp: new Date().toISOString(),
      message: message,
      type: type, // 'sent' or 'received'
      status: 'delivered'
    });
  }

  getConversation(contactId) {
    return this.conversations.get(contactId) || [];
  }

  createWhatsAppPanel() {
    const panel = document.createElement('div');
    panel.className = 'whatsapp-panel';
    panel.innerHTML = `
      <div class="whatsapp-header">
        <h3>📱 WhatsApp Kommunikation</h3>
        <button class="whatsapp-close">×</button>
      </div>
      <div class="whatsapp-content">
        <div class="whatsapp-tabs">
          <button class="tab-btn active" data-tab="send">Nachricht senden</button>
          <button class="tab-btn" data-tab="templates">Templates</button>
          <button class="tab-btn" data-tab="contacts">Kontakte</button>
          <button class="tab-btn" data-tab="history">Verlauf</button>
        </div>
        
        <div class="tab-content" id="send-tab">
          <div class="form-group">
            <label>Empfänger:</label>
            <select id="contact-select">
              <option value="">Mieter auswählen...</option>
            </select>
          </div>
          <div class="form-group">
            <label>Template:</label>
            <select id="template-select">
              <option value="">Template auswählen...</option>
            </select>
          </div>
          <div class="form-group">
            <label>Nachricht:</label>
            <textarea id="message-text" rows="4" placeholder="Nachricht eingeben..."></textarea>
          </div>
          <div class="template-variables" id="template-variables"></div>
          <button class="btn-primary" id="send-whatsapp">WhatsApp öffnen</button>
        </div>
        
        <div class="tab-content hidden" id="templates-tab">
          <div class="templates-list" id="templates-list"></div>
        </div>
        
        <div class="tab-content hidden" id="contacts-tab">
          <div class="contacts-list" id="contacts-list"></div>
        </div>
        
        <div class="tab-content hidden" id="history-tab">
          <div class="history-list" id="history-list"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    this.bindPanelEvents(panel);
    this.populatePanel();
    
    return panel;
  }

  bindPanelEvents(panel) {
    // Close Button
    panel.querySelector('.whatsapp-close').addEventListener('click', () => {
      panel.remove();
    });

    // Tab Navigation
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        this.switchTab(panel, tabId);
      });
    });

    // Template Selection
    panel.querySelector('#template-select').addEventListener('change', (e) => {
      this.handleTemplateSelection(e.target.value);
    });

    // Send Button
    panel.querySelector('#send-whatsapp').addEventListener('click', () => {
      this.handleSendMessage();
    });
  }

  populatePanel() {
    // Populate Contacts
    const contactSelect = document.getElementById('contact-select');
    const contactsList = document.getElementById('contacts-list');
    
    this.contacts.forEach((contact, id) => {
      // Select Option
      const option = document.createElement('option');
      option.value = id;
      option.textContent = `${contact.name} (${contact.property})`;
      contactSelect.appendChild(option);
      
      // Contacts List
      const contactItem = document.createElement('div');
      contactItem.className = 'contact-item';
      contactItem.innerHTML = `
        <div class="contact-info">
          <strong>${contact.name}</strong>
          <span>${contact.property}</span>
          <span>${contact.phone}</span>
        </div>
        <button class="btn-small" onclick="window.claraWhatsApp.quickMessage('${id}')">
          Nachricht
        </button>
      `;
      contactsList.appendChild(contactItem);
    });

    // Populate Templates
    const templateSelect = document.getElementById('template-select');
    const templatesList = document.getElementById('templates-list');
    
    this.templates.forEach((template, id) => {
      // Select Option
      const option = document.createElement('option');
      option.value = id;
      option.textContent = template.name;
      templateSelect.appendChild(option);
      
      // Templates List
      const templateItem = document.createElement('div');
      templateItem.className = 'template-item';
      templateItem.innerHTML = `
        <div class="template-info">
          <strong>${template.name}</strong>
          <p>${template.content}</p>
          <small>Variablen: ${template.variables.join(', ')}</small>
        </div>
        <button class="btn-small" onclick="window.claraWhatsApp.useTemplate('${id}')">
          Verwenden
        </button>
      `;
      templatesList.appendChild(templateItem);
    });
  }

  switchTab(panel, tabId) {
    // Update Tab Buttons
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update Tab Content
    panel.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `${tabId}-tab`);
    });
  }

  handleTemplateSelection(templateId) {
    if (!templateId) return;
    
    const template = this.templates.get(templateId);
    if (!template) return;
    
    // Update Message Text
    document.getElementById('message-text').value = template.content;
    
    // Show Template Variables
    const variablesContainer = document.getElementById('template-variables');
    variablesContainer.innerHTML = '';
    
    if (template.variables.length > 0) {
      const variablesTitle = document.createElement('h4');
      variablesTitle.textContent = 'Template-Variablen:';
      variablesContainer.appendChild(variablesTitle);
      
      template.variables.forEach(variable => {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.innerHTML = `
          <label>${variable}:</label>
          <input type="text" id="var-${variable}" placeholder="${variable} eingeben...">
        `;
        variablesContainer.appendChild(group);
      });
    }
  }

  handleSendMessage() {
    const contactId = document.getElementById('contact-select').value;
    const templateId = document.getElementById('template-select').value;
    const messageText = document.getElementById('message-text').value;
    
    if (!contactId) {
      alert('Bitte wählen Sie einen Empfänger aus.');
      return;
    }
    
    if (!messageText.trim()) {
      alert('Bitte geben Sie eine Nachricht ein.');
      return;
    }
    
    // Collect Template Variables
    const variables = {};
    if (templateId) {
      const template = this.templates.get(templateId);
      template.variables.forEach(variable => {
        const input = document.getElementById(`var-${variable}`);
        if (input) {
          variables[variable] = input.value;
        }
      });
    }
    
    // Send Message
    if (templateId) {
      this.sendMessage(contactId, templateId, variables);
    } else {
      // Direct message
      const contact = this.contacts.get(contactId);
      const whatsappUrl = `https://wa.me/${contact.phone}?text=${encodeURIComponent(messageText)}`;
      window.open(whatsappUrl, '_blank');
      this.saveConversation(contactId, messageText, 'sent');
    }
  }

  quickMessage(contactId) {
    const contact = this.contacts.get(contactId);
    if (contact) {
      const whatsappUrl = `https://wa.me/${contact.phone}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  useTemplate(templateId) {
    document.getElementById('template-select').value = templateId;
    this.handleTemplateSelection(templateId);
    this.switchTab(document.querySelector('.whatsapp-panel'), 'send');
  }

  setupEventListeners() {
    // Global Event Listener für WhatsApp-Button in Sidebar
    document.addEventListener('click', (e) => {
      if (e.target.closest('[href*="mieter-kommunikation"]') || 
          e.target.textContent.includes('Mieter-Kommunikation')) {
        e.preventDefault();
        this.openWhatsAppPanel();
      }
    });
  }

  openWhatsAppPanel() {
    // Schließe existierendes Panel
    const existingPanel = document.querySelector('.whatsapp-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // Erstelle neues Panel
    this.createWhatsAppPanel();
  }

  // Bulk-Funktionen für Massennachrichten
  async sendRentReminders() {
    if (!window.claraDataBridge) return;
    
    try {
      const arrears = await window.claraDataBridge.getArrears();
      const results = [];
      
      for (const arrear of arrears) {
        const contactId = arrear.tenant_id;
        if (this.contacts.has(contactId)) {
          const result = await this.sendMessage(contactId, 'rent_reminder', {
            tenant_name: arrear.tenant_name,
            property: arrear.property,
            days: arrear.days_overdue,
            amount: arrear.amount
          });
          results.push(result);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Fehler beim Senden der Mietmahnungen:', error);
      return [];
    }
  }
}

// CSS für WhatsApp Panel
const whatsappCSS = `
.whatsapp-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1002;
  overflow: hidden;
}

.whatsapp-header {
  background: #25D366;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.whatsapp-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.whatsapp-content {
  padding: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

.whatsapp-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-btn.active {
  border-bottom-color: #25D366;
  color: #25D366;
  font-weight: 600;
}

.tab-content.hidden {
  display: none;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.btn-primary {
  background: #25D366;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
}

.btn-primary:hover {
  background: #20B358;
}

.btn-small {
  background: #25D366;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}

.contact-item,
.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.contact-info,
.template-info {
  flex: 1;
}

.contact-info strong,
.template-info strong {
  display: block;
  margin-bottom: 0.25rem;
}

.contact-info span {
  display: block;
  color: #666;
  font-size: 12px;
}

.template-info p {
  margin: 0.5rem 0;
  color: #333;
  font-size: 14px;
}

.template-info small {
  color: #666;
}

@media (max-width: 768px) {
  .whatsapp-panel {
    width: 95%;
    max-height: 90vh;
  }
  
  .whatsapp-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1;
    min-width: 120px;
    font-size: 12px;
  }
  
  .contact-item,
  .template-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
`;

// CSS injizieren
const style = document.createElement('style');
style.textContent = whatsappCSS;
document.head.appendChild(style);

// Auto-Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.claraWhatsApp = new ClaraWhatsAppIntegration();
    console.log('📱 WhatsApp Integration bereit');
  }, 1500);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaraWhatsAppIntegration;
}

