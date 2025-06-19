// Clara360 Outlook Integration
class ClaraOutlookIntegration {
  constructor() {
    this.apiEndpoint = '/api/outlook';
    this.emailTemplates = new Map();
    this.contacts = new Map();
    this.emailHistory = new Map();
    this.outlookConnected = false;
    this.init();
  }

  init() {
    this.loadEmailTemplates();
    this.loadContacts();
    this.setupEventListeners();
    this.checkOutlookConnection();
    console.log('✅ Outlook Integration initialisiert');
  }

  loadEmailTemplates() {
    // Standard E-Mail-Templates für Hausverwaltung
    this.emailTemplates.set('rent_reminder_email', {
      name: 'Mietmahnung per E-Mail',
      subject: 'Erinnerung: Ausstehende Mietzahlung für {{property}}',
      content: `Sehr geehrte/r {{tenant_name}},

hiermit möchten wir Sie daran erinnern, dass Ihre Mietzahlung für die Wohnung {{property}} seit {{days}} Tagen überfällig ist.

Ausstehender Betrag: {{amount}}€
Fälligkeitsdatum: {{due_date}}

Bitte überweisen Sie den Betrag umgehend auf unser Konto:
IBAN: DE12 3456 7890 1234 5678 90
Verwendungszweck: {{property}} - {{tenant_name}}

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
Ihr Hausverwaltungsteam`,
      variables: ['tenant_name', 'property', 'days', 'amount', 'due_date']
    });

    this.emailTemplates.set('maintenance_notice_email', {
      name: 'Wartungsankündigung per E-Mail',
      subject: 'Wartungsarbeiten in {{property}} am {{date}}',
      content: `Sehr geehrte/r {{tenant_name}},

hiermit kündigen wir Ihnen Wartungsarbeiten in Ihrer Wohnung {{property}} an.

Termin: {{date}}
Uhrzeit: {{time}}
Art der Arbeiten: {{work_type}}
Dauer: ca. {{duration}}

Bitte sorgen Sie dafür, dass die Wohnung zugänglich ist. Falls Sie verhindert sind, teilen Sie uns bitte rechtzeitig mit, wo der Schlüssel hinterlegt werden kann.

Bei Rückfragen erreichen Sie uns unter: {{contact_phone}}

Mit freundlichen Grüßen
Ihr Hausverwaltungsteam`,
      variables: ['tenant_name', 'property', 'date', 'time', 'work_type', 'duration', 'contact_phone']
    });

    this.emailTemplates.set('rent_increase_email', {
      name: 'Mieterhöhung per E-Mail',
      subject: 'Mieterhöhung für {{property}} ab {{effective_date}}',
      content: `Sehr geehrte/r {{tenant_name}},

hiermit teilen wir Ihnen mit, dass wir die Miete für Ihre Wohnung {{property}} erhöhen werden.

Aktuelle Miete: {{current_rent}}€
Neue Miete: {{new_rent}}€
Erhöhung: {{increase_amount}}€ ({{increase_percentage}}%)
Wirksam ab: {{effective_date}}

Begründung der Erhöhung:
{{reason}}

Die Erhöhung erfolgt gemäß § 558 BGB. Sie haben das Recht, der Erhöhung bis zum {{deadline}} zu widersprechen.

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
Ihr Hausverwaltungsteam`,
      variables: ['tenant_name', 'property', 'current_rent', 'new_rent', 'increase_amount', 'increase_percentage', 'effective_date', 'reason', 'deadline']
    });

    this.emailTemplates.set('welcome_tenant_email', {
      name: 'Willkommen neuer Mieter',
      subject: 'Herzlich willkommen in {{property}}!',
      content: `Sehr geehrte/r {{tenant_name}},

herzlich willkommen in Ihrer neuen Wohnung {{property}}!

Hier sind die wichtigsten Informationen für Sie:

Hausmeister: {{caretaker_name}}
Telefon: {{caretaker_phone}}
E-Mail: {{caretaker_email}}

Notfallkontakt: {{emergency_contact}}
Notfall-Telefon: {{emergency_phone}}

Müllabfuhr: {{waste_schedule}}
Hausordnung: siehe Anhang

Wichtige Hinweise:
- Schlüssel bitte nicht verlieren (Ersatz kostet {{key_replacement_cost}}€)
- Ruhestunden: 22:00 - 06:00 Uhr
- Waschküche: {{laundry_hours}}

Wir wünschen Ihnen einen angenehmen Aufenthalt!

Mit freundlichen Grüßen
Ihr Hausverwaltungsteam`,
      variables: ['tenant_name', 'property', 'caretaker_name', 'caretaker_phone', 'caretaker_email', 'emergency_contact', 'emergency_phone', 'waste_schedule', 'key_replacement_cost', 'laundry_hours']
    });

    this.emailTemplates.set('inspection_notice_email', {
      name: 'Besichtigungsankündigung',
      subject: 'Wohnungsbesichtigung {{property}} am {{date}}',
      content: `Sehr geehrte/r {{tenant_name}},

hiermit kündigen wir Ihnen eine Besichtigung Ihrer Wohnung {{property}} an.

Termin: {{date}}
Uhrzeit: {{time}}
Grund: {{reason}}
Begleitung: {{inspector_name}}

Die Besichtigung ist gemäß § 536 BGB angekündigt. Bitte sorgen Sie dafür, dass die Wohnung zugänglich ist.

Falls der Termin für Sie ungünstig ist, kontaktieren Sie uns bitte bis {{contact_deadline}}, damit wir einen alternativen Termin vereinbaren können.

Kontakt: {{contact_phone}} oder {{contact_email}}

Mit freundlichen Grüßen
Ihr Hausverwaltungsteam`,
      variables: ['tenant_name', 'property', 'date', 'time', 'reason', 'inspector_name', 'contact_deadline', 'contact_phone', 'contact_email']
    });
  }

  loadContacts() {
    // Lade Mieter-Kontakte aus lokalen Daten
    if (window.claraDataBridge) {
      window.claraDataBridge.getTenants().then(tenants => {
        tenants.forEach(tenant => {
          if (tenant.email) {
            this.contacts.set(tenant.id, {
              name: tenant.name,
              email: tenant.email,
              property: tenant.property,
              phone: tenant.phone
            });
          }
        });
        console.log(`📧 ${this.contacts.size} E-Mail-Kontakte geladen`);
      });
    }
  }

  checkOutlookConnection() {
    // Prüfe ob Outlook verfügbar ist (Web oder Desktop)
    this.outlookConnected = this.isOutlookAvailable();
    console.log(`📧 Outlook Status: ${this.outlookConnected ? 'Verfügbar' : 'Nicht verfügbar'}`);
  }

  isOutlookAvailable() {
    // Prüfe verschiedene Outlook-Zugriffsmöglichkeiten
    return (
      typeof window.Office !== 'undefined' || // Office Add-in
      navigator.userAgent.includes('Outlook') || // Outlook Desktop
      window.location.hostname.includes('outlook') || // Outlook Web
      this.canUseMailto() // Fallback: mailto
    );
  }

  canUseMailto() {
    // Prüfe ob mailto: Links funktionieren
    return true; // Mailto funktioniert in allen modernen Browsern
  }

  async sendEmail(contactId, templateId, variables = {}, attachments = []) {
    const contact = this.contacts.get(contactId);
    const template = this.emailTemplates.get(templateId);
    
    if (!contact || !template) {
      throw new Error('Kontakt oder Template nicht gefunden');
    }

    // Template-Variablen ersetzen
    let subject = template.subject;
    let content = template.content;
    
    template.variables.forEach(variable => {
      const value = variables[variable] || `[${variable}]`;
      subject = subject.replace(new RegExp(`{{${variable}}}`, 'g'), value);
      content = content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });

    // E-Mail senden basierend auf verfügbarer Methode
    let result;
    if (this.isOfficeAddIn()) {
      result = await this.sendViaOfficeAddIn(contact, subject, content, attachments);
    } else if (this.isOutlookWeb()) {
      result = await this.sendViaOutlookWeb(contact, subject, content, attachments);
    } else {
      result = await this.sendViaMailto(contact, subject, content);
    }
    
    // E-Mail-Verlauf speichern
    this.saveEmailHistory(contactId, subject, content, 'sent');
    
    return result;
  }

  isOfficeAddIn() {
    return typeof window.Office !== 'undefined' && window.Office.context;
  }

  isOutlookWeb() {
    return window.location.hostname.includes('outlook.live.com') || 
           window.location.hostname.includes('outlook.office.com');
  }

  async sendViaOfficeAddIn(contact, subject, content, attachments) {
    // Office Add-in API verwenden
    return new Promise((resolve, reject) => {
      Office.context.mailbox.displayNewMessageForm({
        toRecipients: [{ displayName: contact.name, emailAddress: contact.email }],
        subject: subject,
        htmlBody: content.replace(/\n/g, '<br>')
      });
      resolve({ method: 'office_addin', success: true });
    });
  }

  async sendViaOutlookWeb(contact, subject, content, attachments) {
    // Outlook Web URL erstellen
    const params = new URLSearchParams({
      to: contact.email,
      subject: subject,
      body: content
    });
    
    const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?${params.toString()}`;
    window.open(outlookUrl, '_blank');
    
    return { method: 'outlook_web', success: true, url: outlookUrl };
  }

  async sendViaMailto(contact, subject, content) {
    // Mailto-Link erstellen
    const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
    
    // Prüfe URL-Länge (mailto hat Limits)
    if (mailtoUrl.length > 2000) {
      // Kürze Content wenn zu lang
      const maxContentLength = 1500 - subject.length - contact.email.length;
      const shortContent = content.substring(0, maxContentLength) + '\n\n[Nachricht wurde gekürzt]';
      const shortMailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shortContent)}`;
      window.open(shortMailtoUrl);
    } else {
      window.open(mailtoUrl);
    }
    
    return { method: 'mailto', success: true, url: mailtoUrl };
  }

  saveEmailHistory(contactId, subject, content, type) {
    if (!this.emailHistory.has(contactId)) {
      this.emailHistory.set(contactId, []);
    }
    
    this.emailHistory.get(contactId).push({
      timestamp: new Date().toISOString(),
      subject: subject,
      content: content,
      type: type, // 'sent' or 'received'
      status: 'sent'
    });
  }

  getEmailHistory(contactId) {
    return this.emailHistory.get(contactId) || [];
  }

  createOutlookPanel() {
    const panel = document.createElement('div');
    panel.className = 'outlook-panel';
    panel.innerHTML = `
      <div class="outlook-header">
        <h3>📧 Outlook E-Mail</h3>
        <div class="outlook-status">
          <span class="status-indicator ${this.outlookConnected ? 'connected' : 'disconnected'}"></span>
          ${this.outlookConnected ? 'Verbunden' : 'Nicht verbunden'}
        </div>
        <button class="outlook-close">×</button>
      </div>
      <div class="outlook-content">
        <div class="outlook-tabs">
          <button class="tab-btn active" data-tab="compose">E-Mail verfassen</button>
          <button class="tab-btn" data-tab="templates">Templates</button>
          <button class="tab-btn" data-tab="contacts">Kontakte</button>
          <button class="tab-btn" data-tab="history">Verlauf</button>
        </div>
        
        <div class="tab-content" id="compose-tab">
          <div class="form-group">
            <label>Empfänger:</label>
            <select id="email-contact-select">
              <option value="">Mieter auswählen...</option>
            </select>
          </div>
          <div class="form-group">
            <label>Template:</label>
            <select id="email-template-select">
              <option value="">Template auswählen...</option>
            </select>
          </div>
          <div class="form-group">
            <label>Betreff:</label>
            <input type="text" id="email-subject" placeholder="E-Mail Betreff...">
          </div>
          <div class="form-group">
            <label>Nachricht:</label>
            <textarea id="email-content" rows="8" placeholder="E-Mail Inhalt..."></textarea>
          </div>
          <div class="template-variables" id="email-template-variables"></div>
          <div class="email-actions">
            <button class="btn-primary" id="send-email">E-Mail senden</button>
            <button class="btn-secondary" id="preview-email">Vorschau</button>
          </div>
        </div>
        
        <div class="tab-content hidden" id="templates-tab">
          <div class="templates-list" id="email-templates-list"></div>
        </div>
        
        <div class="tab-content hidden" id="contacts-tab">
          <div class="contacts-list" id="email-contacts-list"></div>
        </div>
        
        <div class="tab-content hidden" id="history-tab">
          <div class="history-list" id="email-history-list"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    this.bindOutlookPanelEvents(panel);
    this.populateOutlookPanel();
    
    return panel;
  }

  bindOutlookPanelEvents(panel) {
    // Close Button
    panel.querySelector('.outlook-close').addEventListener('click', () => {
      panel.remove();
    });

    // Tab Navigation
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        this.switchOutlookTab(panel, tabId);
      });
    });

    // Template Selection
    panel.querySelector('#email-template-select').addEventListener('change', (e) => {
      this.handleEmailTemplateSelection(e.target.value);
    });

    // Send Button
    panel.querySelector('#send-email').addEventListener('click', () => {
      this.handleSendEmail();
    });

    // Preview Button
    panel.querySelector('#preview-email').addEventListener('click', () => {
      this.handlePreviewEmail();
    });
  }

  populateOutlookPanel() {
    // Populate Contacts
    const contactSelect = document.getElementById('email-contact-select');
    const contactsList = document.getElementById('email-contacts-list');
    
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
          <span>${contact.email}</span>
        </div>
        <button class="btn-small" onclick="window.claraOutlook.quickEmail('${id}')">
          E-Mail
        </button>
      `;
      contactsList.appendChild(contactItem);
    });

    // Populate Templates
    const templateSelect = document.getElementById('email-template-select');
    const templatesList = document.getElementById('email-templates-list');
    
    this.emailTemplates.forEach((template, id) => {
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
          <p><strong>Betreff:</strong> ${template.subject}</p>
          <p>${template.content.substring(0, 200)}...</p>
          <small>Variablen: ${template.variables.join(', ')}</small>
        </div>
        <button class="btn-small" onclick="window.claraOutlook.useEmailTemplate('${id}')">
          Verwenden
        </button>
      `;
      templatesList.appendChild(templateItem);
    });
  }

  switchOutlookTab(panel, tabId) {
    // Update Tab Buttons
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update Tab Content
    panel.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('hidden', content.id !== `${tabId}-tab`);
    });
  }

  handleEmailTemplateSelection(templateId) {
    if (!templateId) return;
    
    const template = this.emailTemplates.get(templateId);
    if (!template) return;
    
    // Update Subject and Content
    document.getElementById('email-subject').value = template.subject;
    document.getElementById('email-content').value = template.content;
    
    // Show Template Variables
    const variablesContainer = document.getElementById('email-template-variables');
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
          <input type="text" id="email-var-${variable}" placeholder="${variable} eingeben...">
        `;
        variablesContainer.appendChild(group);
      });
    }
  }

  handleSendEmail() {
    const contactId = document.getElementById('email-contact-select').value;
    const templateId = document.getElementById('email-template-select').value;
    const subject = document.getElementById('email-subject').value;
    const content = document.getElementById('email-content').value;
    
    if (!contactId) {
      alert('Bitte wählen Sie einen Empfänger aus.');
      return;
    }
    
    if (!subject.trim()) {
      alert('Bitte geben Sie einen Betreff ein.');
      return;
    }
    
    if (!content.trim()) {
      alert('Bitte geben Sie eine Nachricht ein.');
      return;
    }
    
    // Collect Template Variables
    const variables = {};
    if (templateId) {
      const template = this.emailTemplates.get(templateId);
      template.variables.forEach(variable => {
        const input = document.getElementById(`email-var-${variable}`);
        if (input) {
          variables[variable] = input.value;
        }
      });
    }
    
    // Send Email
    if (templateId) {
      this.sendEmail(contactId, templateId, variables);
    } else {
      // Direct email
      const contact = this.contacts.get(contactId);
      this.sendViaMailto(contact, subject, content);
      this.saveEmailHistory(contactId, subject, content, 'sent');
    }
  }

  handlePreviewEmail() {
    const subject = document.getElementById('email-subject').value;
    const content = document.getElementById('email-content').value;
    
    // Erstelle Vorschau-Fenster
    const preview = window.open('', '_blank', 'width=600,height=400');
    preview.document.write(`
      <html>
        <head>
          <title>E-Mail Vorschau</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .subject { font-weight: bold; margin-bottom: 10px; }
            .content { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <div class="subject">Betreff: ${subject}</div>
          <hr>
          <div class="content">${content}</div>
        </body>
      </html>
    `);
  }

  quickEmail(contactId) {
    const contact = this.contacts.get(contactId);
    if (contact) {
      const mailtoUrl = `mailto:${contact.email}`;
      window.open(mailtoUrl);
    }
  }

  useEmailTemplate(templateId) {
    document.getElementById('email-template-select').value = templateId;
    this.handleEmailTemplateSelection(templateId);
    this.switchOutlookTab(document.querySelector('.outlook-panel'), 'compose');
  }

  setupEventListeners() {
    // Global Event Listener für Outlook-Button in Sidebar
    document.addEventListener('click', (e) => {
      if (e.target.closest('[href*="outlook"]') || 
          e.target.textContent.includes('Outlook')) {
        e.preventDefault();
        this.openOutlookPanel();
      }
    });
  }

  openOutlookPanel() {
    // Schließe existierendes Panel
    const existingPanel = document.querySelector('.outlook-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // Erstelle neues Panel
    this.createOutlookPanel();
  }

  // Bulk-Funktionen für Massen-E-Mails
  async sendBulkRentReminders() {
    if (!window.claraDataBridge) return;
    
    try {
      const arrears = await window.claraDataBridge.getArrears();
      const results = [];
      
      for (const arrear of arrears) {
        const contactId = arrear.tenant_id;
        if (this.contacts.has(contactId)) {
          const result = await this.sendEmail(contactId, 'rent_reminder_email', {
            tenant_name: arrear.tenant_name,
            property: arrear.property,
            days: arrear.days_overdue,
            amount: arrear.amount,
            due_date: arrear.due_date
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

// CSS für Outlook Panel
const outlookCSS = `
.outlook-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1002;
  overflow: hidden;
}

.outlook-header {
  background: #0078d4;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.outlook-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.connected {
  background: #10b981;
}

.status-indicator.disconnected {
  background: #ef4444;
}

.outlook-close {
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

.outlook-content {
  padding: 1rem;
  max-height: 65vh;
  overflow-y: auto;
}

.email-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-secondary:hover {
  background: #4b5563;
}

@media (max-width: 768px) {
  .outlook-panel {
    width: 95%;
    max-height: 90vh;
  }
  
  .email-actions {
    flex-direction: column;
  }
  
  .email-actions button {
    width: 100%;
  }
}
`;

// CSS injizieren
const outlookStyle = document.createElement('style');
outlookStyle.textContent = outlookCSS;
document.head.appendChild(outlookStyle);

// Auto-Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.claraOutlook = new ClaraOutlookIntegration();
    console.log('📧 Outlook Integration bereit');
  }, 2000);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaraOutlookIntegration;
}

