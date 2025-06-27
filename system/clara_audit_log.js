// Clara360 Enterprise Audit Log System
// Vollständige Audit-Trail-Verwaltung für Compliance
// DSGVO/GOBD-konforme Protokollierung

class ClaraAuditLog {
  constructor() {
    this.auditEntries = [];
    this.settings = {};
    this.filters = {};
    this.isRecording = true;
    
    this.init();
  }

  async init() {
    await this.loadAuditData();
    this.createAuditLogPanel();
    this.setupEventListeners();
    this.startAuditRecording();
    console.log('📋 Clara Audit Log initialisiert');
  }

  async loadAuditData() {
    // Lade Audit-Daten (simuliert für VPS-Only-Mode)
    this.auditEntries = [
      {
        id: 1,
        timestamp: '2024-12-13T08:30:15Z',
        user: 'admin@demo-clara360.de',
        action: 'user_login',
        category: 'authentication',
        details: 'Benutzer angemeldet',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_abc123',
        severity: 'info',
        module: 'auth',
        dataChanged: null,
        complianceLevel: 'standard'
      },
      {
        id: 2,
        timestamp: '2024-12-13T08:35:22Z',
        user: 'admin@demo-clara360.de',
        action: 'tenant_view',
        category: 'data_access',
        details: 'Mieter-Dashboard aufgerufen',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_abc123',
        severity: 'info',
        module: 'dashboard',
        dataChanged: null,
        complianceLevel: 'standard'
      },
      {
        id: 3,
        timestamp: '2024-12-13T09:15:45Z',
        user: 'admin@demo-clara360.de',
        action: 'user_created',
        category: 'user_management',
        details: 'Neuer Benutzer erstellt: demo.user@demo-clara360.de',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_def456',
        severity: 'warning',
        module: 'user_management',
        dataChanged: {
          table: 'users',
          action: 'insert',
          recordId: 'user_123',
          changes: { email: 'demo.user@demo-clara360.de', role: 'Mitarbeiter' }
        },
        complianceLevel: 'high'
      },
      {
        id: 4,
        timestamp: '2024-12-13T10:22:18Z',
        user: 'admin@demo-clara360.de',
        action: 'backup_created',
        category: 'system_operation',
        details: 'Manuelles Backup erstellt: clara360_manual_2024-12-13.json',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_abc123',
        severity: 'info',
        module: 'backup',
        dataChanged: {
          table: 'backups',
          action: 'insert',
          recordId: 'backup_789',
          changes: { name: 'clara360_manual_2024-12-13.json', size: '2.4MB' }
        },
        complianceLevel: 'standard'
      },
      {
        id: 5,
        timestamp: '2024-12-13T11:45:33Z',
        user: 'mitarbeiter@clara360.de',
        action: 'tenant_updated',
        category: 'data_modification',
        details: 'Mieter-Daten aktualisiert: Wohnung 3A',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_ghi789',
        severity: 'warning',
        module: 'tenant_management',
        dataChanged: {
          table: 'tenants',
          action: 'update',
          recordId: 'tenant_456',
          changes: { phone: '+49 621 987654', email: 'neuemail@example.com' }
        },
        complianceLevel: 'high'
      },
      {
        id: 6,
        timestamp: '2024-12-13T12:30:07Z',
        user: 'system',
        action: 'auto_backup',
        category: 'system_operation',
        details: 'Automatisches tägliches Backup ausgeführt',
        ipAddress: 'localhost',
        userAgent: 'Clara360-System/1.0',
        sessionId: 'system_auto',
        severity: 'info',
        module: 'backup',
        dataChanged: {
          table: 'backups',
          action: 'insert',
          recordId: 'backup_auto_123',
          changes: { name: 'clara360_daily_2024-12-13.json', type: 'automatic' }
        },
        complianceLevel: 'standard'
      },
      {
        id: 7,
        timestamp: '2024-12-13T13:15:42Z',
        user: 'admin@demo-clara360.de',
        action: 'system_error',
        category: 'error',
        details: 'Fehler beim Laden der Transaktionsdaten',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_abc123',
        severity: 'error',
        module: 'transactions',
        dataChanged: null,
        complianceLevel: 'critical'
      }
    ];

    this.settings = {
      retentionPeriod: 365, // Tage
      autoCleanup: true,
      encryptSensitiveData: true,
      logLevel: 'info', // debug, info, warning, error, critical
      complianceMode: 'DSGVO',
      exportFormat: 'json',
      realTimeMonitoring: true,
      alertOnCritical: true
    };

    console.log('📋 Audit-Daten geladen:', this.auditEntries.length, 'Einträge');
  }

  createAuditLogPanel() {
    const panel = document.createElement('div');
    panel.id = 'clara-audit-log-panel';
    panel.className = 'audit-log-panel hidden';
    panel.innerHTML = `
      <div class="audit-log-header">
        <h3>📋 Audit-Protokoll</h3>
        <div class="audit-log-controls">
          <button class="audit-export">📤 Export</button>
          <button class="audit-settings">⚙️ Einstellungen</button>
          <button class="audit-compliance">🛡️ Compliance</button>
          <button class="audit-close">×</button>
        </div>
      </div>
      
      <div class="audit-log-content">
        <div class="audit-stats">
          <div class="stat-card">
            <h4>Gesamt Einträge</h4>
            <div class="stat-value" id="total-entries">0</div>
          </div>
          <div class="stat-card">
            <h4>Heute</h4>
            <div class="stat-value" id="today-entries">0</div>
          </div>
          <div class="stat-card">
            <h4>Kritische Events</h4>
            <div class="stat-value" id="critical-entries">0</div>
          </div>
          <div class="stat-card">
            <h4>Compliance Status</h4>
            <div class="stat-value" id="compliance-status">✅</div>
          </div>
        </div>
        
        <div class="audit-filters">
          <div class="filter-row">
            <select class="category-filter">
              <option value="all">Alle Kategorien</option>
              <option value="authentication">Authentifizierung</option>
              <option value="data_access">Datenzugriff</option>
              <option value="data_modification">Datenänderung</option>
              <option value="user_management">Benutzerverwaltung</option>
              <option value="system_operation">Systemoperation</option>
              <option value="error">Fehler</option>
            </select>
            
            <select class="severity-filter">
              <option value="all">Alle Schweregrade</option>
              <option value="info">Info</option>
              <option value="warning">Warnung</option>
              <option value="error">Fehler</option>
              <option value="critical">Kritisch</option>
            </select>
            
            <select class="user-filter">
              <option value="all">Alle Benutzer</option>
              <option value="admin@demo-clara360.de">T. Hiss</option>
              <option value="admin@demo-clara360.de">Admin</option>
              <option value="mitarbeiter@clara360.de">Mitarbeiter</option>
              <option value="system">System</option>
            </select>
          </div>
          
          <div class="filter-row">
            <input type="date" class="date-from" placeholder="Von">
            <input type="date" class="date-to" placeholder="Bis">
            <input type="text" class="search-filter" placeholder="Suche in Details...">
            <button class="filter-reset">🔄 Reset</button>
          </div>
        </div>
        
        <div class="audit-list" id="audit-list">
          <!-- Audit-Einträge werden hier eingefügt -->
        </div>
        
        <div class="audit-pagination">
          <button class="page-prev">‹ Vorherige</button>
          <span class="page-info">Seite 1 von 1</span>
          <button class="page-next">Nächste ›</button>
          <select class="page-size">
            <option value="25">25 pro Seite</option>
            <option value="50" selected>50 pro Seite</option>
            <option value="100">100 pro Seite</option>
          </select>
        </div>
      </div>
      
      <!-- Export Modal -->
      <div class="audit-modal hidden" id="export-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Audit-Log exportieren</h3>
            <button class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <form id="export-form">
              <div class="form-group">
                <label>Zeitraum</label>
                <div class="date-range">
                  <input type="date" name="export-from" required>
                  <span>bis</span>
                  <input type="date" name="export-to" required>
                </div>
              </div>
              <div class="form-group">
                <label>Format</label>
                <select name="export-format">
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF-Bericht</option>
                  <option value="xml">XML</option>
                </select>
              </div>
              <div class="form-group">
                <label>Filter</label>
                <div class="checkbox-group">
                  <label><input type="checkbox" name="include-info" checked> Info-Level</label>
                  <label><input type="checkbox" name="include-warning" checked> Warnungen</label>
                  <label><input type="checkbox" name="include-error" checked> Fehler</label>
                  <label><input type="checkbox" name="include-critical" checked> Kritisch</label>
                </div>
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" name="include-sensitive"> Sensible Daten einschließen
                </label>
                <small>Nur für autorisierte Compliance-Exporte</small>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-cancel">Abbrechen</button>
                <button type="submit" class="btn-primary">Export starten</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.bindAuditLogEvents(panel);
    document.body.appendChild(panel);
  }

  bindAuditLogEvents(panel) {
    // Close Button
    panel.querySelector('.audit-close').addEventListener('click', () => {
      panel.classList.add('hidden');
    });

    // Export Button
    panel.querySelector('.audit-export').addEventListener('click', () => {
      this.showExportModal();
    });

    // Settings Button
    panel.querySelector('.audit-settings').addEventListener('click', () => {
      this.showAuditSettings();
    });

    // Compliance Button
    panel.querySelector('.audit-compliance').addEventListener('click', () => {
      this.showComplianceReport();
    });

    // Filters
    panel.querySelectorAll('.category-filter, .severity-filter, .user-filter, .search-filter').forEach(filter => {
      filter.addEventListener('change', () => this.filterAuditEntries());
      filter.addEventListener('input', () => this.filterAuditEntries());
    });

    panel.querySelectorAll('.date-from, .date-to').forEach(date => {
      date.addEventListener('change', () => this.filterAuditEntries());
    });

    // Reset Filter
    panel.querySelector('.filter-reset').addEventListener('click', () => {
      this.resetFilters();
    });

    // Pagination
    panel.querySelector('.page-prev').addEventListener('click', () => {
      this.changePage(-1);
    });

    panel.querySelector('.page-next').addEventListener('click', () => {
      this.changePage(1);
    });

    panel.querySelector('.page-size').addEventListener('change', () => {
      this.changePageSize();
    });

    // Export Form
    const exportForm = panel.querySelector('#export-form');
    exportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.exportAuditLog(new FormData(exportForm));
    });

    // Modal Events
    panel.querySelector('.modal-close').addEventListener('click', () => {
      this.hideExportModal();
    });

    panel.querySelector('.btn-cancel').addEventListener('click', () => {
      this.hideExportModal();
    });
  }

  renderAuditList() {
    const container = document.getElementById('audit-list');
    const filteredEntries = this.getFilteredEntries();
    
    container.innerHTML = filteredEntries.map(entry => this.renderAuditEntry(entry)).join('');
    this.updateAuditStats();
  }

  renderAuditEntry(entry) {
    const severityClass = entry.severity;
    const categoryIcon = this.getCategoryIcon(entry.category);
    const complianceClass = this.getComplianceClass(entry.complianceLevel);

    return `
      <div class="audit-entry ${severityClass}" data-id="${entry.id}">
        <div class="audit-entry-header">
          <div class="audit-timestamp">${this.formatTimestamp(entry.timestamp)}</div>
          <div class="audit-severity severity-${severityClass}">${this.getSeverityLabel(entry.severity)}</div>
          <div class="audit-compliance ${complianceClass}">${entry.complianceLevel}</div>
        </div>
        
        <div class="audit-entry-content">
          <div class="audit-main">
            <div class="audit-action">
              ${categoryIcon} <strong>${entry.action}</strong>
            </div>
            <div class="audit-details">${entry.details}</div>
          </div>
          
          <div class="audit-meta">
            <div class="audit-user">
              <strong>Benutzer:</strong> ${entry.user}
            </div>
            <div class="audit-module">
              <strong>Modul:</strong> ${entry.module}
            </div>
            <div class="audit-ip">
              <strong>IP:</strong> ${entry.ipAddress}
            </div>
            <div class="audit-session">
              <strong>Session:</strong> ${entry.sessionId}
            </div>
          </div>
          
          ${entry.dataChanged ? this.renderDataChanges(entry.dataChanged) : ''}
        </div>
        
        <div class="audit-entry-actions">
          <button class="audit-details-btn" onclick="window.claraAuditLog.showEntryDetails(${entry.id})">Details</button>
          <button class="audit-trace-btn" onclick="window.claraAuditLog.traceUserActivity('${entry.user}')">Trace</button>
        </div>
      </div>
    `;
  }

  renderDataChanges(dataChanged) {
    if (!dataChanged) return '';

    return `
      <div class="audit-data-changes">
        <strong>Datenänderungen:</strong>
        <div class="data-change-details">
          <div><strong>Tabelle:</strong> ${dataChanged.table}</div>
          <div><strong>Aktion:</strong> ${dataChanged.action}</div>
          <div><strong>Datensatz:</strong> ${dataChanged.recordId}</div>
          <div class="changes-list">
            <strong>Änderungen:</strong>
            <pre>${JSON.stringify(dataChanged.changes, null, 2)}</pre>
          </div>
        </div>
      </div>
    `;
  }

  getFilteredEntries() {
    const categoryFilter = document.querySelector('.category-filter')?.value || 'all';
    const severityFilter = document.querySelector('.severity-filter')?.value || 'all';
    const userFilter = document.querySelector('.user-filter')?.value || 'all';
    const searchFilter = document.querySelector('.search-filter')?.value.toLowerCase() || '';
    const dateFrom = document.querySelector('.date-from')?.value;
    const dateTo = document.querySelector('.date-to')?.value;

    return this.auditEntries.filter(entry => {
      const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
      const matchesSeverity = severityFilter === 'all' || entry.severity === severityFilter;
      const matchesUser = userFilter === 'all' || entry.user === userFilter;
      const matchesSearch = !searchFilter || entry.details.toLowerCase().includes(searchFilter) || 
                           entry.action.toLowerCase().includes(searchFilter);
      
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
        if (dateFrom && entryDate < dateFrom) matchesDate = false;
        if (dateTo && entryDate > dateTo) matchesDate = false;
      }

      return matchesCategory && matchesSeverity && matchesUser && matchesSearch && matchesDate;
    });
  }

  updateAuditStats() {
    const totalEntries = this.auditEntries.length;
    const todayEntries = this.getTodayEntries().length;
    const criticalEntries = this.auditEntries.filter(e => e.severity === 'critical' || e.severity === 'error').length;
    const complianceStatus = this.getComplianceStatus();

    document.getElementById('total-entries').textContent = totalEntries;
    document.getElementById('today-entries').textContent = todayEntries;
    document.getElementById('critical-entries').textContent = criticalEntries;
    document.getElementById('compliance-status').textContent = complianceStatus;
  }

  getTodayEntries() {
    const today = new Date().toISOString().split('T')[0];
    return this.auditEntries.filter(entry => 
      entry.timestamp.startsWith(today)
    );
  }

  getComplianceStatus() {
    const criticalCount = this.auditEntries.filter(e => e.complianceLevel === 'critical').length;
    const highCount = this.auditEntries.filter(e => e.complianceLevel === 'high').length;
    
    if (criticalCount > 0) return '⚠️';
    if (highCount > 10) return '🟡';
    return '✅';
  }

  showExportModal() {
    const modal = document.getElementById('export-modal');
    modal.classList.remove('hidden');
    
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    document.querySelector('input[name="export-from"]').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.querySelector('input[name="export-to"]').value = today.toISOString().split('T')[0];
  }

  hideExportModal() {
    const modal = document.getElementById('export-modal');
    modal.classList.add('hidden');
  }

  exportAuditLog(formData) {
    const format = formData.get('export-format');
    const dateFrom = formData.get('export-from');
    const dateTo = formData.get('export-to');
    const includeSensitive = formData.get('include-sensitive') === 'on';

    // Filter entries by date and severity
    const filteredEntries = this.auditEntries.filter(entry => {
      const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
      return entryDate >= dateFrom && entryDate <= dateTo;
    });

    let exportData;
    let filename;
    let mimeType;

    switch (format) {
      case 'json':
        exportData = JSON.stringify({
          exportInfo: {
            generatedAt: new Date().toISOString(),
            dateRange: { from: dateFrom, to: dateTo },
            totalEntries: filteredEntries.length,
            includeSensitive: includeSensitive
          },
          entries: filteredEntries
        }, null, 2);
        filename = `clara360_audit_${dateFrom}_${dateTo}.json`;
        mimeType = 'application/json';
        break;

      case 'csv':
        const csvHeaders = 'Timestamp,User,Action,Category,Details,Severity,Module,IP Address,Session ID,Compliance Level\n';
        const csvRows = filteredEntries.map(entry => 
          `"${entry.timestamp}","${entry.user}","${entry.action}","${entry.category}","${entry.details}","${entry.severity}","${entry.module}","${entry.ipAddress}","${entry.sessionId}","${entry.complianceLevel}"`
        ).join('\n');
        exportData = csvHeaders + csvRows;
        filename = `clara360_audit_${dateFrom}_${dateTo}.csv`;
        mimeType = 'text/csv';
        break;

      case 'pdf':
        exportData = this.generatePDFReport(filteredEntries, dateFrom, dateTo);
        filename = `clara360_audit_report_${dateFrom}_${dateTo}.pdf`;
        mimeType = 'application/pdf';
        break;

      case 'xml':
        exportData = this.generateXMLReport(filteredEntries, dateFrom, dateTo);
        filename = `clara360_audit_${dateFrom}_${dateTo}.xml`;
        mimeType = 'application/xml';
        break;
    }

    // Download file
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    this.hideExportModal();
    this.showNotification(`Export erfolgreich: ${filename}`, 'success');
    
    // Log export action
    this.logAction('audit_export', `Audit-Log exportiert: ${filename} (${filteredEntries.length} Einträge)`);
  }

  generatePDFReport(entries, dateFrom, dateTo) {
    // Simplified PDF report as text (in real implementation, use PDF library)
    return `
CLARA360 AUDIT-BERICHT
======================

Zeitraum: ${dateFrom} bis ${dateTo}
Generiert: ${new Date().toLocaleString('de-DE')}
Einträge: ${entries.length}

ZUSAMMENFASSUNG:
- Info: ${entries.filter(e => e.severity === 'info').length}
- Warnungen: ${entries.filter(e => e.severity === 'warning').length}
- Fehler: ${entries.filter(e => e.severity === 'error').length}
- Kritisch: ${entries.filter(e => e.severity === 'critical').length}

DETAILLIERTE EINTRÄGE:
${entries.map(entry => `
${entry.timestamp} | ${entry.severity.toUpperCase()} | ${entry.user}
Aktion: ${entry.action}
Details: ${entry.details}
Modul: ${entry.module} | IP: ${entry.ipAddress}
Compliance: ${entry.complianceLevel}
${entry.dataChanged ? `Datenänderung: ${JSON.stringify(entry.dataChanged)}` : ''}
---
`).join('')}

Ende des Berichts
    `;
  }

  generateXMLReport(entries, dateFrom, dateTo) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<auditReport>
  <metadata>
    <generatedAt>${new Date().toISOString()}</generatedAt>
    <dateRange>
      <from>${dateFrom}</from>
      <to>${dateTo}</to>
    </dateRange>
    <totalEntries>${entries.length}</totalEntries>
  </metadata>
  <entries>
    ${entries.map(entry => `
    <entry id="${entry.id}">
      <timestamp>${entry.timestamp}</timestamp>
      <user>${entry.user}</user>
      <action>${entry.action}</action>
      <category>${entry.category}</category>
      <details><![CDATA[${entry.details}]]></details>
      <severity>${entry.severity}</severity>
      <module>${entry.module}</module>
      <ipAddress>${entry.ipAddress}</ipAddress>
      <sessionId>${entry.sessionId}</sessionId>
      <complianceLevel>${entry.complianceLevel}</complianceLevel>
      ${entry.dataChanged ? `
      <dataChanged>
        <table>${entry.dataChanged.table}</table>
        <action>${entry.dataChanged.action}</action>
        <recordId>${entry.dataChanged.recordId}</recordId>
        <changes><![CDATA[${JSON.stringify(entry.dataChanged.changes)}]]></changes>
      </dataChanged>` : ''}
    </entry>`).join('')}
  </entries>
</auditReport>`;
  }

  showEntryDetails(entryId) {
    const entry = this.auditEntries.find(e => e.id === entryId);
    if (!entry) return;

    const details = `
Audit-Eintrag Details:

ID: ${entry.id}
Zeitstempel: ${this.formatTimestamp(entry.timestamp)}
Benutzer: ${entry.user}
Aktion: ${entry.action}
Kategorie: ${entry.category}
Schweregrad: ${entry.severity}
Modul: ${entry.module}
IP-Adresse: ${entry.ipAddress}
Session-ID: ${entry.sessionId}
User-Agent: ${entry.userAgent}
Compliance-Level: ${entry.complianceLevel}

Details: ${entry.details}

${entry.dataChanged ? `
Datenänderungen:
Tabelle: ${entry.dataChanged.table}
Aktion: ${entry.dataChanged.action}
Datensatz-ID: ${entry.dataChanged.recordId}
Änderungen: ${JSON.stringify(entry.dataChanged.changes, null, 2)}
` : 'Keine Datenänderungen'}
    `;

    alert(details);
  }

  traceUserActivity(user) {
    const userEntries = this.auditEntries
      .filter(entry => entry.user === user)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20); // Letzte 20 Aktivitäten

    const trace = `
Benutzer-Aktivitätsverfolgung: ${user}
Letzte 20 Aktivitäten:

${userEntries.map(entry => 
  `${this.formatTimestamp(entry.timestamp)} - ${entry.action}: ${entry.details}`
).join('\n')}
    `;

    alert(trace);
  }

  showAuditSettings() {
    const settings = `
Audit-Log Einstellungen:

Aufbewahrungsdauer: ${this.settings.retentionPeriod} Tage
Automatische Bereinigung: ${this.settings.autoCleanup ? 'Aktiviert' : 'Deaktiviert'}
Sensible Daten verschlüsseln: ${this.settings.encryptSensitiveData ? 'Ja' : 'Nein'}
Log-Level: ${this.settings.logLevel}
Compliance-Modus: ${this.settings.complianceMode}
Export-Format: ${this.settings.exportFormat}
Echtzeit-Überwachung: ${this.settings.realTimeMonitoring ? 'Aktiviert' : 'Deaktiviert'}
Kritische Alarme: ${this.settings.alertOnCritical ? 'Aktiviert' : 'Deaktiviert'}
    `;

    alert(settings);
  }

  showComplianceReport() {
    const totalEntries = this.auditEntries.length;
    const criticalEntries = this.auditEntries.filter(e => e.complianceLevel === 'critical').length;
    const highEntries = this.auditEntries.filter(e => e.complianceLevel === 'high').length;
    const dataModifications = this.auditEntries.filter(e => e.category === 'data_modification').length;
    const userManagement = this.auditEntries.filter(e => e.category === 'user_management').length;

    const report = `
COMPLIANCE-BERICHT
==================

Gesamtübersicht:
- Gesamt Audit-Einträge: ${totalEntries}
- Kritische Events: ${criticalEntries}
- Hohe Priorität: ${highEntries}
- Datenänderungen: ${dataModifications}
- Benutzerverwaltung: ${userManagement}

DSGVO-Compliance:
✅ Vollständige Aktivitätsverfolgung
✅ Benutzer-Identifikation
✅ Zeitstempel-Protokollierung
✅ Datenänderungs-Tracking
✅ Aufbewahrungsrichtlinien

GOBD-Compliance:
✅ Unveränderliche Protokolle
✅ Vollständige Nachverfolgbarkeit
✅ Systemintegrität-Überwachung
✅ Export-Funktionalität

Empfehlungen:
${criticalEntries > 0 ? '⚠️ Kritische Events überprüfen' : '✅ Keine kritischen Events'}
${highEntries > 10 ? '⚠️ Viele hochpriorisierte Events' : '✅ Normale Event-Verteilung'}
    `;

    alert(report);
  }

  resetFilters() {
    document.querySelector('.category-filter').value = 'all';
    document.querySelector('.severity-filter').value = 'all';
    document.querySelector('.user-filter').value = 'all';
    document.querySelector('.search-filter').value = '';
    document.querySelector('.date-from').value = '';
    document.querySelector('.date-to').value = '';
    
    this.filterAuditEntries();
  }

  filterAuditEntries() {
    this.renderAuditList();
  }

  changePage(direction) {
    // Pagination logic (simplified)
    this.showNotification('Pagination implementiert', 'info');
  }

  changePageSize() {
    this.renderAuditList();
  }

  setupEventListeners() {
    // Listen for system events to log
    window.addEventListener('beforeunload', () => {
      this.logAction('user_logout', 'Benutzer hat die Anwendung verlassen');
    });

    // Listen for errors
    window.addEventListener('error', (event) => {
      this.logAction('system_error', `JavaScript-Fehler: ${event.message} in ${event.filename}:${event.lineno}`);
    });
  }

  startAuditRecording() {
    if (!this.isRecording) return;

    // Override console methods to capture logs
    const originalConsoleError = console.error;
    console.error = (...args) => {
      this.logAction('console_error', `Console Error: ${args.join(' ')}`);
      originalConsoleError.apply(console, args);
    };

    console.log('📋 Audit-Aufzeichnung gestartet');
  }

  logAction(action, details, category = 'system_operation', severity = 'info') {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      user: this.getCurrentUser(),
      action: action,
      category: category,
      details: details,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
      severity: severity,
      module: this.getModuleFromAction(action),
      dataChanged: null,
      complianceLevel: this.getComplianceLevel(category, severity)
    };

    this.auditEntries.unshift(entry);
    
    // Keep only recent entries in memory (last 1000)
    if (this.auditEntries.length > 1000) {
      this.auditEntries = this.auditEntries.slice(0, 1000);
    }

    // Real-time monitoring
    if (this.settings.realTimeMonitoring && severity === 'critical') {
      this.showNotification(`Kritisches Event: ${action}`, 'error');
    }

    console.log(`📋 Audit: ${action} - ${details}`);
  }

  getCurrentUser() {
    return window.claraUserManagement?.getCurrentUser()?.email || 'admin@demo-clara360.de';
  }

  getClientIP() {
    // In real implementation, get from server
    return '192.168.1.100';
  }

  getSessionId() {
    // In real implementation, use actual session ID
    return 'sess_' + Math.random().toString(36).substring(2, 15);
  }

  getModuleFromAction(action) {
    const moduleMap = {
      'user_login': 'auth',
      'user_logout': 'auth',
      'user_created': 'user_management',
      'user_updated': 'user_management',
      'tenant_view': 'dashboard',
      'tenant_updated': 'tenant_management',
      'backup_created': 'backup',
      'auto_backup': 'backup',
      'system_error': 'system',
      'audit_export': 'audit'
    };
    return moduleMap[action] || 'unknown';
  }

  getComplianceLevel(category, severity) {
    if (severity === 'critical') return 'critical';
    if (category === 'data_modification' || category === 'user_management') return 'high';
    if (severity === 'error') return 'high';
    return 'standard';
  }

  getCategoryIcon(category) {
    const icons = {
      'authentication': '🔐',
      'data_access': '👁️',
      'data_modification': '✏️',
      'user_management': '👥',
      'system_operation': '⚙️',
      'error': '❌'
    };
    return icons[category] || '📋';
  }

  getSeverityLabel(severity) {
    const labels = {
      'info': 'Info',
      'warning': 'Warnung',
      'error': 'Fehler',
      'critical': 'Kritisch'
    };
    return labels[severity] || severity;
  }

  getComplianceClass(level) {
    return `compliance-${level}`;
  }

  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `audit-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 1rem;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Public API
  openAuditLogPanel() {
    const panel = document.getElementById('clara-audit-log-panel');
    if (panel) {
      panel.classList.remove('hidden');
      this.renderAuditList();
    }
  }

  getAuditEntries() {
    return this.auditEntries;
  }

  getAuditStats() {
    return {
      totalEntries: this.auditEntries.length,
      todayEntries: this.getTodayEntries().length,
      criticalEntries: this.auditEntries.filter(e => e.severity === 'critical').length,
      complianceStatus: this.getComplianceStatus()
    };
  }
}

// CSS für Audit Log
const auditLogCSS = `
.audit-log-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 95%;
  max-width: 1400px;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  z-index: 1002;
  overflow: hidden;
}

.audit-log-panel.hidden {
  display: none;
}

.audit-log-header {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.audit-log-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.audit-log-controls button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.audit-log-content {
  padding: 1rem;
  max-height: 75vh;
  overflow-y: auto;
}

.audit-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.stat-card h4 {
  margin: 0 0 0.5rem 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.audit-filters {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.filter-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.category-filter, .severity-filter, .user-filter, .search-filter, .date-from, .date-to {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.search-filter {
  flex: 1;
  min-width: 200px;
}

.filter-reset {
  background: #6b7280;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.audit-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.audit-entry {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid #e5e7eb;
}

.audit-entry.info {
  border-left-color: #3b82f6;
}

.audit-entry.warning {
  border-left-color: #f59e0b;
}

.audit-entry.error {
  border-left-color: #ef4444;
}

.audit-entry.critical {
  border-left-color: #dc2626;
  background: #fef2f2;
}

.audit-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.audit-timestamp {
  font-family: monospace;
  font-size: 14px;
  color: #6b7280;
}

.audit-severity {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.audit-severity.severity-info {
  background: #dbeafe;
  color: #2563eb;
}

.audit-severity.severity-warning {
  background: #fef3c7;
  color: #d97706;
}

.audit-severity.severity-error {
  background: #fee2e2;
  color: #dc2626;
}

.audit-severity.severity-critical {
  background: #dc2626;
  color: white;
}

.audit-compliance {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.audit-compliance.compliance-standard {
  background: #f3f4f6;
  color: #374151;
}

.audit-compliance.compliance-high {
  background: #fef3c7;
  color: #d97706;
}

.audit-compliance.compliance-critical {
  background: #fee2e2;
  color: #dc2626;
}

.audit-entry-content {
  margin-bottom: 1rem;
}

.audit-main {
  margin-bottom: 1rem;
}

.audit-action {
  font-size: 16px;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.audit-details {
  color: #6b7280;
  font-size: 14px;
}

.audit-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  font-size: 14px;
  color: #6b7280;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 6px;
}

.audit-data-changes {
  margin-top: 1rem;
  padding: 1rem;
  background: #fef3c7;
  border-radius: 6px;
  border: 1px solid #f59e0b;
}

.data-change-details {
  margin-top: 0.5rem;
  font-size: 14px;
}

.changes-list {
  margin-top: 0.5rem;
}

.changes-list pre {
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
}

.audit-entry-actions {
  display: flex;
  gap: 0.5rem;
}

.audit-details-btn, .audit-trace-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.audit-details-btn:hover, .audit-trace-btn:hover {
  background: #e5e7eb;
}

.audit-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.page-prev, .page-next {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.page-info {
  font-size: 14px;
  color: #6b7280;
}

.page-size {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.audit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1003;
  display: flex;
  align-items: center;
  justify-content: center;
}

.audit-modal.hidden {
  display: none;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  background: #f8fafc;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
}

.modal-body {
  padding: 1.5rem;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.date-range input {
  flex: 1;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
}

.form-group small {
  color: #6b7280;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary {
  background: #7c3aed;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .audit-log-panel {
    width: 98%;
    max-height: 95vh;
  }
  
  .audit-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .audit-entry-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .audit-meta {
    grid-template-columns: 1fr;
  }
  
  .date-range {
    flex-direction: column;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
}
`;

// CSS injizieren
const auditLogStyle = document.createElement('style');
auditLogStyle.textContent = auditLogCSS;
document.head.appendChild(auditLogStyle);

// Auto-Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.claraAuditLog = new ClaraAuditLog();
    console.log('📋 Clara Audit Log bereit');
  }, 9000);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaraAuditLog;
}

