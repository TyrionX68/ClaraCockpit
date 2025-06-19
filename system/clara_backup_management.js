// Clara360 Enterprise Backup Management System
// Vollständige Backup-Verwaltung mit automatischen Snapshots
// Basierend auf dem Clara360-Vollprojekt

class ClaraBackupManagement {
  constructor() {
    this.backups = [];
    this.schedules = [];
    this.settings = {};
    this.isRunning = false;
    
    this.init();
  }

  async init() {
    await this.loadBackupData();
    await this.setupBackupSchedules();
    this.createBackupManagementPanel();
    this.startBackupMonitoring();
    console.log('💾 Clara Backup Management initialisiert');
  }

  async loadBackupData() {
    // Lade Backup-Daten (simuliert für VPS-Only-Mode)
    this.backups = [
      {
        id: 1,
        name: 'clara360_daily_2024-12-13.json',
        type: 'automatic',
        source: 'daily_schedule',
        size: 2.4, // MB
        created: '2024-12-13T02:00:00Z',
        description: 'Tägliches automatisches Backup',
        status: 'completed',
        downloadCount: 0,
        checksum: 'sha256:a1b2c3d4e5f6...',
        contains: ['tenants', 'transactions', 'arrears', 'settings']
      },
      {
        id: 2,
        name: 'clara360_weekly_2024-12-08.json',
        type: 'automatic',
        source: 'weekly_schedule',
        size: 16.8, // MB
        created: '2024-12-08T03:00:00Z',
        description: 'Wöchentliches Vollbackup',
        status: 'completed',
        downloadCount: 2,
        checksum: 'sha256:b2c3d4e5f6a1...',
        contains: ['tenants', 'transactions', 'arrears', 'settings', 'audit_log', 'user_data']
      },
      {
        id: 3,
        name: 'clara360_manual_2024-12-12.json',
        type: 'manual',
        source: 'user_request',
        size: 3.1, // MB
        created: '2024-12-12T14:30:00Z',
        description: 'Manuelles Backup vor System-Update',
        status: 'completed',
        downloadCount: 1,
        checksum: 'sha256:c3d4e5f6a1b2...',
        contains: ['tenants', 'transactions', 'arrears', 'settings']
      },
      {
        id: 4,
        name: 'clara360_emergency_2024-12-10.json',
        type: 'emergency',
        source: 'system_error',
        size: 2.9, // MB
        created: '2024-12-10T16:45:00Z',
        description: 'Notfall-Backup nach Systemfehler',
        status: 'completed',
        downloadCount: 0,
        checksum: 'sha256:d4e5f6a1b2c3...',
        contains: ['tenants', 'transactions', 'arrears']
      }
    ];

    this.schedules = [
      {
        id: 1,
        name: 'Tägliches Backup',
        type: 'daily',
        time: '02:00',
        enabled: true,
        lastRun: '2024-12-13T02:00:00Z',
        nextRun: '2024-12-14T02:00:00Z',
        retention: 7, // Tage
        includes: ['tenants', 'transactions', 'arrears', 'settings']
      },
      {
        id: 2,
        name: 'Wöchentliches Vollbackup',
        type: 'weekly',
        time: '03:00',
        day: 'sunday',
        enabled: true,
        lastRun: '2024-12-08T03:00:00Z',
        nextRun: '2024-12-15T03:00:00Z',
        retention: 30, // Tage
        includes: ['all']
      },
      {
        id: 3,
        name: 'Monatliches Archiv',
        type: 'monthly',
        time: '01:00',
        day: 1,
        enabled: true,
        lastRun: '2024-12-01T01:00:00Z',
        nextRun: '2025-01-01T01:00:00Z',
        retention: 365, // Tage
        includes: ['all']
      }
    ];

    this.settings = {
      autoBackup: true,
      compression: true,
      encryption: false,
      maxBackupSize: 100, // MB
      retentionPolicy: 'auto',
      notifyOnSuccess: false,
      notifyOnError: true,
      backupLocation: '/var/www/clara360/backups/',
      cloudSync: false
    };

    console.log('💾 Backup-Daten geladen:', this.backups.length, 'Backups');
  }

  setupBackupSchedules() {
    // Simuliere Backup-Scheduler
    this.schedules.forEach(schedule => {
      if (schedule.enabled) {
        console.log(`📅 Backup-Schedule aktiviert: ${schedule.name}`);
      }
    });
  }

  createBackupManagementPanel() {
    const panel = document.createElement('div');
    panel.id = 'clara-backup-management-panel';
    panel.className = 'backup-management-panel hidden';
    panel.innerHTML = `
      <div class="backup-management-header">
        <h3>💾 Backup-Verwaltung</h3>
        <div class="backup-management-controls">
          <button class="backup-create">+ Backup erstellen</button>
          <button class="backup-schedule">📅 Zeitpläne</button>
          <button class="backup-settings">⚙️ Einstellungen</button>
          <button class="backup-close">×</button>
        </div>
      </div>
      
      <div class="backup-management-content">
        <div class="backup-stats">
          <div class="stat-card">
            <h4>Gesamt Backups</h4>
            <div class="stat-value" id="total-backups">0</div>
          </div>
          <div class="stat-card">
            <h4>Speicherplatz</h4>
            <div class="stat-value" id="backup-storage">0 MB</div>
          </div>
          <div class="stat-card">
            <h4>Letztes Backup</h4>
            <div class="stat-value" id="last-backup">-</div>
          </div>
          <div class="stat-card">
            <h4>Nächstes Backup</h4>
            <div class="stat-value" id="next-backup">-</div>
          </div>
        </div>
        
        <div class="backup-tabs">
          <button class="tab-btn active" data-tab="backups">📦 Backups</button>
          <button class="tab-btn" data-tab="schedules">📅 Zeitpläne</button>
          <button class="tab-btn" data-tab="restore">🔄 Wiederherstellung</button>
        </div>
        
        <div class="backup-tab-content">
          <!-- Backups Tab -->
          <div class="tab-panel active" id="backups-panel">
            <div class="backup-filters">
              <select class="type-filter">
                <option value="all">Alle Typen</option>
                <option value="automatic">Automatisch</option>
                <option value="manual">Manuell</option>
                <option value="emergency">Notfall</option>
              </select>
              <input type="file" class="backup-upload" accept=".json,.zip" style="display: none;">
              <button class="upload-btn">📤 Backup hochladen</button>
            </div>
            
            <div class="backup-list" id="backup-list">
              <!-- Backups werden hier eingefügt -->
            </div>
          </div>
          
          <!-- Schedules Tab -->
          <div class="tab-panel" id="schedules-panel">
            <div class="schedule-list" id="schedule-list">
              <!-- Zeitpläne werden hier eingefügt -->
            </div>
          </div>
          
          <!-- Restore Tab -->
          <div class="tab-panel" id="restore-panel">
            <div class="restore-section">
              <h4>Daten wiederherstellen</h4>
              <p>Wählen Sie ein Backup zur Wiederherstellung aus:</p>
              <select class="restore-backup-select" id="restore-backup-select">
                <option value="">Backup auswählen...</option>
              </select>
              <div class="restore-options">
                <label>
                  <input type="checkbox" name="restore-tenants" checked> Mieter-Daten
                </label>
                <label>
                  <input type="checkbox" name="restore-transactions" checked> Transaktionen
                </label>
                <label>
                  <input type="checkbox" name="restore-arrears" checked> Rückstände
                </label>
                <label>
                  <input type="checkbox" name="restore-settings"> Einstellungen
                </label>
              </div>
              <button class="restore-btn">🔄 Wiederherstellung starten</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Create Backup Modal -->
      <div class="backup-modal hidden" id="create-backup-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Neues Backup erstellen</h3>
            <button class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <form id="create-backup-form">
              <div class="form-group">
                <label>Backup-Name</label>
                <input type="text" name="name" placeholder="clara360_manual_YYYY-MM-DD" required>
              </div>
              <div class="form-group">
                <label>Beschreibung</label>
                <textarea name="description" rows="3" placeholder="Beschreibung des Backups..."></textarea>
              </div>
              <div class="form-group">
                <label>Daten einschließen:</label>
                <div class="checkbox-group">
                  <label><input type="checkbox" name="include" value="tenants" checked> Mieter-Daten</label>
                  <label><input type="checkbox" name="include" value="transactions" checked> Transaktionen</label>
                  <label><input type="checkbox" name="include" value="arrears" checked> Rückstände</label>
                  <label><input type="checkbox" name="include" value="settings"> Einstellungen</label>
                  <label><input type="checkbox" name="include" value="audit_log"> Audit-Log</label>
                  <label><input type="checkbox" name="include" value="user_data"> Benutzerdaten</label>
                </div>
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" name="compress" checked> Komprimierung aktivieren
                </label>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-cancel">Abbrechen</button>
                <button type="submit" class="btn-primary">Backup erstellen</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.bindBackupManagementEvents(panel);
    document.body.appendChild(panel);
  }

  bindBackupManagementEvents(panel) {
    // Close Button
    panel.querySelector('.backup-close').addEventListener('click', () => {
      panel.classList.add('hidden');
    });

    // Create Backup Button
    panel.querySelector('.backup-create').addEventListener('click', () => {
      this.showCreateBackupModal();
    });

    // Schedule Button
    panel.querySelector('.backup-schedule').addEventListener('click', () => {
      this.switchTab('schedules');
    });

    // Settings Button
    panel.querySelector('.backup-settings').addEventListener('click', () => {
      this.showBackupSettings();
    });

    // Tab Buttons
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Upload Button
    panel.querySelector('.upload-btn').addEventListener('click', () => {
      panel.querySelector('.backup-upload').click();
    });

    // File Upload
    panel.querySelector('.backup-upload').addEventListener('change', (e) => {
      this.handleFileUpload(e);
    });

    // Type Filter
    panel.querySelector('.type-filter').addEventListener('change', () => {
      this.filterBackups();
    });

    // Create Backup Form
    const form = panel.querySelector('#create-backup-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createBackup(new FormData(form));
    });

    // Restore Button
    panel.querySelector('.restore-btn').addEventListener('click', () => {
      this.restoreBackup();
    });

    // Modal Events
    panel.querySelector('.modal-close').addEventListener('click', () => {
      this.hideCreateBackupModal();
    });

    panel.querySelector('.btn-cancel').addEventListener('click', () => {
      this.hideCreateBackupModal();
    });
  }

  switchTab(tabName) {
    const panel = document.getElementById('clara-backup-management-panel');
    
    // Update tab buttons
    panel.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab panels
    panel.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `${tabName}-panel`);
    });

    // Load content based on tab
    switch (tabName) {
      case 'backups':
        this.renderBackupList();
        break;
      case 'schedules':
        this.renderScheduleList();
        break;
      case 'restore':
        this.renderRestoreOptions();
        break;
    }
  }

  renderBackupList() {
    const container = document.getElementById('backup-list');
    const filteredBackups = this.getFilteredBackups();
    
    container.innerHTML = filteredBackups.map(backup => this.renderBackupCard(backup)).join('');
    this.updateBackupStats();
  }

  renderBackupCard(backup) {
    const typeClass = {
      'automatic': 'auto',
      'manual': 'manual',
      'emergency': 'emergency'
    }[backup.type] || 'auto';

    const statusClass = backup.status === 'completed' ? 'completed' : 'pending';

    return `
      <div class="backup-card ${typeClass}" data-id="${backup.id}">
        <div class="backup-header">
          <div class="backup-info">
            <h4 class="backup-name">${backup.name}</h4>
            <p class="backup-description">${backup.description}</p>
          </div>
          <div class="backup-actions">
            <button class="backup-download" onclick="window.claraBackupManagement.downloadBackup(${backup.id})">📥</button>
            <button class="backup-info-btn" onclick="window.claraBackupManagement.showBackupInfo(${backup.id})">ℹ️</button>
            <button class="backup-delete" onclick="window.claraBackupManagement.deleteBackup(${backup.id})">🗑️</button>
          </div>
        </div>
        
        <div class="backup-meta">
          <div class="backup-detail">
            <strong>Typ:</strong> 
            <span class="backup-type type-${typeClass}">${this.getTypeLabel(backup.type)}</span>
          </div>
          <div class="backup-detail">
            <strong>Größe:</strong> ${backup.size} MB
          </div>
          <div class="backup-detail">
            <strong>Erstellt:</strong> ${this.formatDate(backup.created)}
          </div>
          <div class="backup-detail">
            <strong>Downloads:</strong> ${backup.downloadCount}
          </div>
        </div>
        
        <div class="backup-contains">
          <strong>Enthält:</strong>
          <div class="contains-tags">
            ${backup.contains.map(item => 
              `<span class="contains-tag">${this.getContainsLabel(item)}</span>`
            ).join('')}
          </div>
        </div>
        
        <div class="backup-status status-${statusClass}">
          ${backup.status === 'completed' ? '✅ Abgeschlossen' : '⏳ In Bearbeitung'}
        </div>
      </div>
    `;
  }

  renderScheduleList() {
    const container = document.getElementById('schedule-list');
    
    container.innerHTML = this.schedules.map(schedule => `
      <div class="schedule-card ${schedule.enabled ? 'enabled' : 'disabled'}">
        <div class="schedule-header">
          <h4>${schedule.name}</h4>
          <div class="schedule-toggle">
            <label class="switch">
              <input type="checkbox" ${schedule.enabled ? 'checked' : ''} 
                     onchange="window.claraBackupManagement.toggleSchedule(${schedule.id})">
              <span class="slider"></span>
            </label>
          </div>
        </div>
        
        <div class="schedule-details">
          <div class="schedule-detail">
            <strong>Typ:</strong> ${this.getScheduleTypeLabel(schedule.type)}
          </div>
          <div class="schedule-detail">
            <strong>Zeit:</strong> ${schedule.time}
          </div>
          <div class="schedule-detail">
            <strong>Letzter Lauf:</strong> ${this.formatDate(schedule.lastRun)}
          </div>
          <div class="schedule-detail">
            <strong>Nächster Lauf:</strong> ${this.formatDate(schedule.nextRun)}
          </div>
          <div class="schedule-detail">
            <strong>Aufbewahrung:</strong> ${schedule.retention} Tage
          </div>
        </div>
      </div>
    `).join('');
  }

  renderRestoreOptions() {
    const select = document.getElementById('restore-backup-select');
    select.innerHTML = '<option value="">Backup auswählen...</option>' +
      this.backups.map(backup => 
        `<option value="${backup.id}">${backup.name} (${this.formatDate(backup.created)})</option>`
      ).join('');
  }

  getFilteredBackups() {
    const typeFilter = document.querySelector('.type-filter')?.value || 'all';
    
    return this.backups.filter(backup => {
      return typeFilter === 'all' || backup.type === typeFilter;
    });
  }

  updateBackupStats() {
    const totalBackups = this.backups.length;
    const totalStorage = this.backups.reduce((sum, backup) => sum + backup.size, 0);
    const lastBackup = this.getLastBackup();
    const nextBackup = this.getNextScheduledBackup();

    document.getElementById('total-backups').textContent = totalBackups;
    document.getElementById('backup-storage').textContent = `${totalStorage.toFixed(1)} MB`;
    document.getElementById('last-backup').textContent = lastBackup ? this.formatDate(lastBackup.created) : '-';
    document.getElementById('next-backup').textContent = nextBackup ? this.formatDate(nextBackup.nextRun) : '-';
  }

  getLastBackup() {
    return this.backups
      .sort((a, b) => new Date(b.created) - new Date(a.created))[0];
  }

  getNextScheduledBackup() {
    return this.schedules
      .filter(s => s.enabled)
      .sort((a, b) => new Date(a.nextRun) - new Date(b.nextRun))[0];
  }

  showCreateBackupModal() {
    const modal = document.getElementById('create-backup-modal');
    modal.classList.remove('hidden');
    
    // Set default name
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    document.querySelector('input[name="name"]').value = `clara360_manual_${dateStr}`;
  }

  hideCreateBackupModal() {
    const modal = document.getElementById('create-backup-modal');
    modal.classList.add('hidden');
  }

  createBackup(formData) {
    const includes = Array.from(document.querySelectorAll('input[name="include"]:checked'))
      .map(cb => cb.value);

    const newBackup = {
      id: Date.now(),
      name: formData.get('name'),
      type: 'manual',
      source: 'user_request',
      size: Math.random() * 5 + 1, // Simulierte Größe
      created: new Date().toISOString(),
      description: formData.get('description') || 'Manuelles Backup',
      status: 'completed',
      downloadCount: 0,
      checksum: `sha256:${Math.random().toString(36).substring(2, 15)}...`,
      contains: includes
    };

    this.backups.unshift(newBackup);
    this.renderBackupList();
    this.hideCreateBackupModal();
    
    this.showNotification('Backup erfolgreich erstellt', 'success');
  }

  downloadBackup(backupId) {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) return;

    // Simuliere Download
    backup.downloadCount++;
    
    // Erstelle Download-Link (simuliert)
    const data = {
      backup: backup,
      data: this.generateBackupData(backup.contains),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = backup.name;
    link.click();
    URL.revokeObjectURL(url);

    this.renderBackupList();
    this.showNotification('Download gestartet', 'success');
  }

  generateBackupData(includes) {
    const data = {};
    
    if (includes.includes('tenants')) {
      data.tenants = window.claraDataBridge?.getTenants() || [];
    }
    if (includes.includes('transactions')) {
      data.transactions = window.claraDataBridge?.getTransactions() || [];
    }
    if (includes.includes('arrears')) {
      data.arrears = window.claraDataBridge?.getArrears() || [];
    }
    if (includes.includes('settings')) {
      data.settings = { theme: 'dark', language: 'de' };
    }
    if (includes.includes('audit_log')) {
      data.audit_log = window.claraUserManagement?.auditLog || [];
    }
    if (includes.includes('user_data')) {
      data.user_data = window.claraUserManagement?.getUsers() || [];
    }

    return data;
  }

  deleteBackup(backupId) {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) return;

    if (backup.type === 'automatic') {
      this.showNotification('Automatische Backups können nicht gelöscht werden', 'error');
      return;
    }

    if (confirm(`Backup "${backup.name}" wirklich löschen?`)) {
      this.backups = this.backups.filter(b => b.id !== backupId);
      this.renderBackupList();
      this.showNotification('Backup gelöscht', 'info');
    }
  }

  showBackupInfo(backupId) {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) return;

    const info = `
Backup-Informationen:

Name: ${backup.name}
Typ: ${this.getTypeLabel(backup.type)}
Größe: ${backup.size} MB
Erstellt: ${this.formatDate(backup.created)}
Status: ${backup.status}
Downloads: ${backup.downloadCount}
Prüfsumme: ${backup.checksum}

Enthält:
${backup.contains.map(item => `- ${this.getContainsLabel(item)}`).join('\n')}

Beschreibung:
${backup.description}
    `;

    alert(info);
  }

  toggleSchedule(scheduleId) {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    schedule.enabled = !schedule.enabled;
    this.renderScheduleList();
    
    const action = schedule.enabled ? 'aktiviert' : 'deaktiviert';
    this.showNotification(`Zeitplan "${schedule.name}" ${action}`, 'success');
  }

  restoreBackup() {
    const backupId = document.getElementById('restore-backup-select').value;
    if (!backupId) {
      this.showNotification('Bitte wählen Sie ein Backup aus', 'error');
      return;
    }

    const backup = this.backups.find(b => b.id == backupId);
    if (!backup) return;

    const restoreOptions = Array.from(document.querySelectorAll('input[name^="restore-"]:checked'))
      .map(cb => cb.name.replace('restore-', ''));

    if (restoreOptions.length === 0) {
      this.showNotification('Bitte wählen Sie mindestens eine Datenquelle aus', 'error');
      return;
    }

    if (confirm(`Daten aus Backup "${backup.name}" wiederherstellen?\n\nDies überschreibt die aktuellen Daten!`)) {
      // Simuliere Wiederherstellung
      setTimeout(() => {
        this.showNotification('Daten erfolgreich wiederhergestellt', 'success');
        
        // Reload page to reflect restored data
        if (confirm('Seite neu laden, um wiederhergestellte Daten anzuzeigen?')) {
          window.location.reload();
        }
      }, 2000);
      
      this.showNotification('Wiederherstellung gestartet...', 'info');
    }
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && !file.name.endsWith('.zip')) {
      this.showNotification('Nur JSON- und ZIP-Dateien werden unterstützt', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // Validiere JSON
        if (file.name.endsWith('.json')) {
          JSON.parse(e.target.result);
        }

        const newBackup = {
          id: Date.now(),
          name: file.name,
          type: 'manual',
          source: 'user_upload',
          size: (file.size / 1024 / 1024).toFixed(2), // MB
          created: new Date().toISOString(),
          description: `Hochgeladenes Backup: ${file.name}`,
          status: 'completed',
          downloadCount: 0,
          checksum: `sha256:${Math.random().toString(36).substring(2, 15)}...`,
          contains: ['unknown'] // Könnte durch Analyse bestimmt werden
        };

        this.backups.unshift(newBackup);
        this.renderBackupList();
        this.showNotification('Backup erfolgreich hochgeladen', 'success');
      } catch (error) {
        this.showNotification('Ungültige Backup-Datei', 'error');
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }

  showBackupSettings() {
    const settings = `
Backup-Einstellungen:

Automatische Backups: ${this.settings.autoBackup ? 'Aktiviert' : 'Deaktiviert'}
Komprimierung: ${this.settings.compression ? 'Aktiviert' : 'Deaktiviert'}
Verschlüsselung: ${this.settings.encryption ? 'Aktiviert' : 'Deaktiviert'}
Max. Backup-Größe: ${this.settings.maxBackupSize} MB
Aufbewahrungsrichtlinie: ${this.settings.retentionPolicy}
Backup-Speicherort: ${this.settings.backupLocation}
Cloud-Synchronisation: ${this.settings.cloudSync ? 'Aktiviert' : 'Deaktiviert'}

Benachrichtigungen:
- Bei Erfolg: ${this.settings.notifyOnSuccess ? 'Ja' : 'Nein'}
- Bei Fehlern: ${this.settings.notifyOnError ? 'Ja' : 'Nein'}
    `;

    alert(settings);
  }

  startBackupMonitoring() {
    // Überwache Backup-Status alle 30 Minuten
    setInterval(() => {
      this.checkScheduledBackups();
    }, 1800000); // 30 Minuten
  }

  checkScheduledBackups() {
    const now = new Date();
    
    this.schedules.forEach(schedule => {
      if (!schedule.enabled) return;
      
      const nextRun = new Date(schedule.nextRun);
      if (nextRun <= now) {
        this.executeScheduledBackup(schedule);
      }
    });
  }

  executeScheduledBackup(schedule) {
    console.log(`🔄 Führe geplantes Backup aus: ${schedule.name}`);
    
    // Simuliere Backup-Erstellung
    const newBackup = {
      id: Date.now(),
      name: `clara360_${schedule.type}_${new Date().toISOString().split('T')[0]}.json`,
      type: 'automatic',
      source: `${schedule.type}_schedule`,
      size: Math.random() * 10 + 5,
      created: new Date().toISOString(),
      description: `Automatisches ${schedule.name}`,
      status: 'completed',
      downloadCount: 0,
      checksum: `sha256:${Math.random().toString(36).substring(2, 15)}...`,
      contains: schedule.includes
    };

    this.backups.unshift(newBackup);
    
    // Update schedule
    schedule.lastRun = new Date().toISOString();
    schedule.nextRun = this.calculateNextRun(schedule);
    
    this.showNotification(`Automatisches Backup "${schedule.name}" erstellt`, 'success');
  }

  calculateNextRun(schedule) {
    const now = new Date();
    
    switch (schedule.type) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
    }
    
    return now.toISOString();
  }

  getTypeLabel(type) {
    const labels = {
      'automatic': 'Automatisch',
      'manual': 'Manuell',
      'emergency': 'Notfall'
    };
    return labels[type] || type;
  }

  getContainsLabel(item) {
    const labels = {
      'tenants': 'Mieter',
      'transactions': 'Transaktionen',
      'arrears': 'Rückstände',
      'settings': 'Einstellungen',
      'audit_log': 'Audit-Log',
      'user_data': 'Benutzerdaten',
      'all': 'Alle Daten'
    };
    return labels[item] || item;
  }

  getScheduleTypeLabel(type) {
    const labels = {
      'daily': 'Täglich',
      'weekly': 'Wöchentlich',
      'monthly': 'Monatlich'
    };
    return labels[type] || type;
  }

  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `backup-notification ${type}`;
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
  openBackupManagementPanel() {
    const panel = document.getElementById('clara-backup-management-panel');
    if (panel) {
      panel.classList.remove('hidden');
      this.switchTab('backups');
    }
  }

  getBackups() {
    return this.backups;
  }

  getBackupStats() {
    return {
      totalBackups: this.backups.length,
      totalStorage: this.backups.reduce((sum, b) => sum + b.size, 0),
      automaticBackups: this.backups.filter(b => b.type === 'automatic').length,
      manualBackups: this.backups.filter(b => b.type === 'manual').length
    };
  }
}

// CSS für Backup Management
const backupManagementCSS = `
.backup-management-panel {
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

.backup-management-panel.hidden {
  display: none;
}

.backup-management-header {
  background: linear-gradient(135deg, #059669, #10b981);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.backup-management-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.backup-management-controls button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.backup-management-content {
  padding: 1rem;
  max-height: 75vh;
  overflow-y: auto;
}

.backup-stats {
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

.backup-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #059669;
  border-bottom-color: #059669;
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}

.backup-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.type-filter {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.upload-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.backup-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

.backup-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #e5e7eb;
}

.backup-card.auto {
  border-left-color: #10b981;
}

.backup-card.manual {
  border-left-color: #3b82f6;
}

.backup-card.emergency {
  border-left-color: #ef4444;
}

.backup-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.backup-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.backup-description {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.backup-actions {
  display: flex;
  gap: 5px;
}

.backup-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
}

.backup-actions button:hover {
  background: #f3f4f6;
}

.backup-meta {
  margin-bottom: 1rem;
}

.backup-detail {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 14px;
  color: #6b7280;
}

.backup-type {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 500;
}

.backup-type.type-auto {
  background: #dcfce7;
  color: #16a34a;
}

.backup-type.type-manual {
  background: #dbeafe;
  color: #2563eb;
}

.backup-type.type-emergency {
  background: #fee2e2;
  color: #dc2626;
}

.backup-contains {
  margin-bottom: 1rem;
  font-size: 14px;
  color: #374151;
}

.contains-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.contains-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
}

.backup-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.backup-status.status-completed {
  background: #dcfce7;
  color: #16a34a;
}

.backup-status.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.schedule-list {
  display: grid;
  gap: 1rem;
}

.schedule-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
}

.schedule-card.enabled {
  border-left: 4px solid #10b981;
}

.schedule-card.disabled {
  border-left: 4px solid #6b7280;
  opacity: 0.7;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #10b981;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.schedule-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.schedule-detail {
  font-size: 14px;
  color: #6b7280;
}

.restore-section {
  background: #f8fafc;
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.restore-section h4 {
  margin-top: 0;
  color: #374151;
}

.restore-backup-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.restore-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.restore-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 14px;
}

.restore-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.backup-modal {
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

.backup-modal.hidden {
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
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
  background: #059669;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .backup-management-panel {
    width: 98%;
    max-height: 95vh;
  }
  
  .backup-list {
    grid-template-columns: 1fr;
  }
  
  .backup-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .backup-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .backup-tabs {
    flex-wrap: wrap;
  }
  
  .schedule-details {
    grid-template-columns: 1fr;
  }
  
  .restore-options {
    grid-template-columns: 1fr;
  }
}
`;

// CSS injizieren
const backupManagementStyle = document.createElement('style');
backupManagementStyle.textContent = backupManagementCSS;
document.head.appendChild(backupManagementStyle);

// Auto-Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.claraBackupManagement = new ClaraBackupManagement();
    console.log('💾 Clara Backup Management bereit');
  }, 8000);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaraBackupManagement;
}

