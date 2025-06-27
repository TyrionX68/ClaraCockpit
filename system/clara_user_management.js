// Clara360 Enterprise User Management System
// Vollständige Benutzerverwaltung mit Rollen und Berechtigungen
// Basierend auf dem Clara360-Vollprojekt

class ClaraUserManagement {
  constructor() {
    this.users = [];
    this.roles = [];
    this.permissions = {};
    this.currentUser = null;
    this.auditLog = [];
    
    this.init();
  }

  async init() {
    await this.loadUserData();
    await this.setupRoleSystem();
    this.createUserManagementPanel();
    this.setupPermissionSystem();
    console.log('👥 Clara User Management initialisiert');
  }

  async loadUserData() {
    // Lade Benutzerdaten (simuliert für VPS-Only-Mode)
    this.users = [
      {
        id: 1,
        email: 'admin@demo-clara360.de',
        name: 'T. Hiss',
        role: 'MetaGovernor',
        status: 'active',
        verified: true,
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-01',
        permissions: ['all'],
        avatar: '👑',
        department: 'Management',
        phone: '+49 621 123456'
      },
      {
        id: 2,
        email: 'admin@demo-clara360.de',
        name: 'System Admin',
        role: 'Admin',
        status: 'active',
        verified: true,
        lastLogin: '2024-12-13T06:00:00Z',
        createdAt: '2024-01-15',
        permissions: ['user_management', 'system_config', 'audit_view'],
        avatar: '🛡️',
        department: 'IT',
        phone: '+49 621 123457'
      },
      {
        id: 3,
        email: 'mitarbeiter@clara360.de',
        name: 'Max Mustermann',
        role: 'Mitarbeiter',
        status: 'active',
        verified: true,
        lastLogin: '2024-12-12T14:30:00Z',
        createdAt: '2024-02-01',
        permissions: ['dashboard_view', 'tenant_management', 'maintenance_view'],
        avatar: '👤',
        department: 'Verwaltung',
        phone: '+49 621 123458'
      },
      {
        id: 4,
        email: 'extern@clara360.de',
        name: 'Externe Beratung',
        role: 'Extern',
        status: 'inactive',
        verified: false,
        lastLogin: '2024-11-15T10:00:00Z',
        createdAt: '2024-03-01',
        permissions: ['dashboard_view'],
        avatar: '🔗',
        department: 'Beratung',
        phone: '+49 621 123459'
      }
    ];

    this.roles = [
      {
        id: 'MetaGovernor',
        name: 'MetaGovernor',
        description: 'Vollzugriff auf alle Systemfunktionen',
        permissions: ['all'],
        color: '#8b5cf6',
        icon: '👑'
      },
      {
        id: 'Admin',
        name: 'Administrator',
        description: 'Systemverwaltung und Benutzermanagement',
        permissions: ['user_management', 'system_config', 'audit_view', 'backup_management'],
        color: '#3b82f6',
        icon: '🛡️'
      },
      {
        id: 'Mitarbeiter',
        name: 'Mitarbeiter',
        description: 'Tägliche Verwaltungsaufgaben',
        permissions: ['dashboard_view', 'tenant_management', 'maintenance_view', 'communication'],
        color: '#10b981',
        icon: '👤'
      },
      {
        id: 'Extern',
        name: 'Externer Zugriff',
        description: 'Eingeschränkter Lesezugriff',
        permissions: ['dashboard_view'],
        color: '#6b7280',
        icon: '🔗'
      }
    ];

    console.log('👥 Benutzerdaten geladen:', this.users.length, 'Benutzer');
  }

  setupRoleSystem() {
    // Definiere Berechtigungsmatrix
    this.permissions = {
      'all': {
        name: 'Vollzugriff',
        description: 'Zugriff auf alle Systemfunktionen',
        modules: ['*']
      },
      'user_management': {
        name: 'Benutzerverwaltung',
        description: 'Benutzer erstellen, bearbeiten, löschen',
        modules: ['users', 'roles', 'permissions']
      },
      'system_config': {
        name: 'Systemkonfiguration',
        description: 'Systemeinstellungen verwalten',
        modules: ['settings', 'integrations', 'api_keys']
      },
      'audit_view': {
        name: 'Audit-Protokoll',
        description: 'Audit-Logs einsehen',
        modules: ['audit', 'logs', 'compliance']
      },
      'backup_management': {
        name: 'Backup-Verwaltung',
        description: 'Backups erstellen und verwalten',
        modules: ['backup', 'restore', 'snapshots']
      },
      'dashboard_view': {
        name: 'Dashboard-Ansicht',
        description: 'Dashboard und Übersichten anzeigen',
        modules: ['dashboard', 'reports', 'analytics']
      },
      'tenant_management': {
        name: 'Mieterverwaltung',
        description: 'Mieter und Verträge verwalten',
        modules: ['tenants', 'contracts', 'payments']
      },
      'maintenance_view': {
        name: 'Wartungsansicht',
        description: 'Wartungsaufgaben einsehen',
        modules: ['maintenance', 'tasks', 'schedules']
      },
      'communication': {
        name: 'Kommunikation',
        description: 'WhatsApp und E-Mail-Funktionen',
        modules: ['whatsapp', 'email', 'notifications']
      }
    };
  }

  createUserManagementPanel() {
    const panel = document.createElement('div');
    panel.id = 'clara-user-management-panel';
    panel.className = 'user-management-panel hidden';
    panel.innerHTML = `
      <div class="user-management-header">
        <h3>👥 Benutzerverwaltung</h3>
        <div class="user-management-controls">
          <button class="user-add">+ Benutzer hinzufügen</button>
          <button class="user-roles">🛡️ Rollen</button>
          <button class="user-audit">📋 Audit</button>
          <button class="user-close">×</button>
        </div>
      </div>
      
      <div class="user-management-content">
        <div class="user-filters">
          <input type="text" class="user-search" placeholder="Benutzer suchen...">
          <select class="role-filter">
            <option value="all">Alle Rollen</option>
            <option value="MetaGovernor">MetaGovernor</option>
            <option value="Admin">Administrator</option>
            <option value="Mitarbeiter">Mitarbeiter</option>
            <option value="Extern">Extern</option>
          </select>
          <select class="status-filter">
            <option value="all">Alle Status</option>
            <option value="active">Aktiv</option>
            <option value="inactive">Inaktiv</option>
          </select>
        </div>
        
        <div class="user-stats">
          <div class="stat-card">
            <h4>Aktive Benutzer</h4>
            <div class="stat-value" id="active-users">0</div>
          </div>
          <div class="stat-card">
            <h4>Administratoren</h4>
            <div class="stat-value" id="admin-users">0</div>
          </div>
          <div class="stat-card">
            <h4>Letzte Anmeldung</h4>
            <div class="stat-value" id="last-login">-</div>
          </div>
          <div class="stat-card">
            <h4>Neue Benutzer (30d)</h4>
            <div class="stat-value" id="new-users">0</div>
          </div>
        </div>
        
        <div class="user-list" id="user-list">
          <!-- Benutzer werden hier eingefügt -->
        </div>
      </div>
      
      <!-- Add User Modal -->
      <div class="user-modal hidden" id="add-user-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Neuen Benutzer hinzufügen</h3>
            <button class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <form id="add-user-form">
              <div class="form-group">
                <label>E-Mail-Adresse</label>
                <input type="email" name="email" required>
              </div>
              <div class="form-group">
                <label>Name</label>
                <input type="text" name="name" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Rolle</label>
                  <select name="role" required>
                    <option value="">Wählen...</option>
                    <option value="Mitarbeiter">Mitarbeiter</option>
                    <option value="Admin">Administrator</option>
                    <option value="Extern">Extern</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Abteilung</label>
                  <input type="text" name="department">
                </div>
              </div>
              <div class="form-group">
                <label>Telefon</label>
                <input type="tel" name="phone">
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" name="verified"> Benutzer verifiziert
                </label>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-cancel">Abbrechen</button>
                <button type="submit" class="btn-primary">Benutzer erstellen</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Role Management Modal -->
      <div class="user-modal hidden" id="role-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Rollen und Berechtigungen</h3>
            <button class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <div class="role-list" id="role-list">
              <!-- Rollen werden hier eingefügt -->
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindUserManagementEvents(panel);
    document.body.appendChild(panel);
  }

  bindUserManagementEvents(panel) {
    // Close Button
    panel.querySelector('.user-close').addEventListener('click', () => {
      panel.classList.add('hidden');
    });

    // Add User Button
    panel.querySelector('.user-add').addEventListener('click', () => {
      this.showAddUserModal();
    });

    // Roles Button
    panel.querySelector('.user-roles').addEventListener('click', () => {
      this.showRoleModal();
    });

    // Audit Button
    panel.querySelector('.user-audit').addEventListener('click', () => {
      this.showAuditLog();
    });

    // Search and Filters
    panel.querySelector('.user-search').addEventListener('input', (e) => {
      this.filterUsers();
    });

    panel.querySelectorAll('.role-filter, .status-filter').forEach(select => {
      select.addEventListener('change', () => {
        this.filterUsers();
      });
    });

    // Add User Form
    const form = panel.querySelector('#add-user-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addUser(new FormData(form));
    });

    // Modal Events
    panel.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.target.closest('.user-modal').classList.add('hidden');
      });
    });

    panel.querySelector('.btn-cancel').addEventListener('click', () => {
      this.hideAddUserModal();
    });
  }

  renderUserList() {
    const container = document.getElementById('user-list');
    const filteredUsers = this.getFilteredUsers();
    
    container.innerHTML = filteredUsers.map(user => this.renderUserCard(user)).join('');
    this.updateUserStats();
  }

  renderUserCard(user) {
    const role = this.roles.find(r => r.id === user.role);
    const statusClass = user.status === 'active' ? 'active' : 'inactive';
    const verifiedClass = user.verified ? 'verified' : 'unverified';

    return `
      <div class="user-card ${statusClass}" data-id="${user.id}">
        <div class="user-header">
          <div class="user-avatar">${user.avatar}</div>
          <div class="user-info">
            <h4 class="user-name">${user.name}</h4>
            <p class="user-email">${user.email}</p>
          </div>
          <div class="user-actions">
            <button class="user-edit" onclick="window.claraUserManagement.editUser(${user.id})">✏️</button>
            <button class="user-toggle" onclick="window.claraUserManagement.toggleUserStatus(${user.id})">${user.status === 'active' ? '⏸️' : '▶️'}</button>
            <button class="user-delete" onclick="window.claraUserManagement.deleteUser(${user.id})">🗑️</button>
          </div>
        </div>
        
        <div class="user-details">
          <div class="user-role" style="background-color: ${role?.color}20; color: ${role?.color}">
            ${role?.icon} ${role?.name}
          </div>
          <div class="user-status status-${statusClass}">
            ${user.status === 'active' ? '✅ Aktiv' : '⏸️ Inaktiv'}
          </div>
          <div class="user-verified ${verifiedClass}">
            ${user.verified ? '✅ Verifiziert' : '⚠️ Nicht verifiziert'}
          </div>
        </div>
        
        <div class="user-meta">
          <div class="user-detail">
            <strong>Abteilung:</strong> ${user.department}
          </div>
          <div class="user-detail">
            <strong>Telefon:</strong> ${user.phone}
          </div>
          <div class="user-detail">
            <strong>Letzte Anmeldung:</strong> ${this.formatDate(user.lastLogin)}
          </div>
          <div class="user-detail">
            <strong>Erstellt:</strong> ${this.formatDate(user.createdAt)}
          </div>
        </div>
        
        <div class="user-permissions">
          <strong>Berechtigungen:</strong>
          <div class="permission-tags">
            ${user.permissions.map(perm => 
              `<span class="permission-tag">${this.permissions[perm]?.name || perm}</span>`
            ).join('')}
          </div>
        </div>
      </div>
    `;
  }

  getFilteredUsers() {
    const searchTerm = document.querySelector('.user-search')?.value.toLowerCase() || '';
    const roleFilter = document.querySelector('.role-filter')?.value || 'all';
    const statusFilter = document.querySelector('.status-filter')?.value || 'all';

    return this.users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm) || 
                           user.email.toLowerCase().includes(searchTerm);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  updateUserStats() {
    const activeUsers = this.users.filter(u => u.status === 'active').length;
    const adminUsers = this.users.filter(u => u.role === 'Admin' || u.role === 'MetaGovernor').length;
    const lastLogin = this.getLastLoginUser();
    const newUsers = this.getNewUsersCount(30);

    document.getElementById('active-users').textContent = activeUsers;
    document.getElementById('admin-users').textContent = adminUsers;
    document.getElementById('last-login').textContent = lastLogin ? this.formatDate(lastLogin.lastLogin) : '-';
    document.getElementById('new-users').textContent = newUsers;
  }

  getLastLoginUser() {
    return this.users
      .filter(u => u.lastLogin)
      .sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin))[0];
  }

  getNewUsersCount(days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return this.users.filter(u => new Date(u.createdAt) > cutoff).length;
  }

  showAddUserModal() {
    const modal = document.getElementById('add-user-modal');
    modal.classList.remove('hidden');
    
    // Reset form
    document.getElementById('add-user-form').reset();
  }

  hideAddUserModal() {
    const modal = document.getElementById('add-user-modal');
    modal.classList.add('hidden');
  }

  addUser(formData) {
    const newUser = {
      id: Date.now(),
      email: formData.get('email'),
      name: formData.get('name'),
      role: formData.get('role'),
      status: 'active',
      verified: formData.get('verified') === 'on',
      lastLogin: null,
      createdAt: new Date().toISOString(),
      permissions: this.roles.find(r => r.id === formData.get('role'))?.permissions || [],
      avatar: this.getAvatarForRole(formData.get('role')),
      department: formData.get('department') || 'Unbekannt',
      phone: formData.get('phone') || ''
    };

    this.users.unshift(newUser);
    this.renderUserList();
    this.hideAddUserModal();
    
    // Audit Log
    this.logAction('user_created', `Benutzer ${newUser.name} erstellt`);
    this.showNotification('Benutzer erfolgreich erstellt', 'success');
  }

  getAvatarForRole(role) {
    const avatars = {
      'MetaGovernor': '👑',
      'Admin': '🛡️',
      'Mitarbeiter': '👤',
      'Extern': '🔗'
    };
    return avatars[role] || '👤';
  }

  editUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    // Vereinfachte Bearbeitung
    const newName = prompt('Name bearbeiten:', user.name);
    if (newName && newName !== user.name) {
      user.name = newName;
      this.renderUserList();
      this.logAction('user_updated', `Benutzer ${user.email} bearbeitet`);
      this.showNotification('Benutzer aktualisiert', 'success');
    }
  }

  toggleUserStatus(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'aktivieren' : 'deaktivieren';

    if (confirm(`Benutzer "${user.name}" wirklich ${action}?`)) {
      user.status = newStatus;
      this.renderUserList();
      this.logAction('user_status_changed', `Benutzer ${user.email} ${action}`);
      this.showNotification(`Benutzer ${action}`, 'success');
    }
  }

  deleteUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    if (user.role === 'MetaGovernor') {
      this.showNotification('MetaGovernor kann nicht gelöscht werden', 'error');
      return;
    }

    if (confirm(`Benutzer "${user.name}" wirklich löschen?`)) {
      this.users = this.users.filter(u => u.id !== userId);
      this.renderUserList();
      this.logAction('user_deleted', `Benutzer ${user.email} gelöscht`);
      this.showNotification('Benutzer gelöscht', 'info');
    }
  }

  showRoleModal() {
    const modal = document.getElementById('role-modal');
    const roleList = document.getElementById('role-list');
    
    roleList.innerHTML = this.roles.map(role => `
      <div class="role-card" style="border-left: 4px solid ${role.color}">
        <div class="role-header">
          <span class="role-icon">${role.icon}</span>
          <h4>${role.name}</h4>
        </div>
        <p class="role-description">${role.description}</p>
        <div class="role-permissions">
          <strong>Berechtigungen:</strong>
          ${role.permissions.map(perm => 
            `<span class="permission-tag">${this.permissions[perm]?.name || perm}</span>`
          ).join('')}
        </div>
      </div>
    `).join('');
    
    modal.classList.remove('hidden');
  }

  showAuditLog() {
    const auditData = this.auditLog.slice(-50).reverse(); // Letzte 50 Einträge
    const auditHTML = auditData.map(entry => 
      `<div class="audit-entry">
        <strong>${this.formatDate(entry.timestamp)}</strong> - ${entry.action}: ${entry.details}
      </div>`
    ).join('');

    alert(`Audit Log (Letzte 50 Einträge):\n\n${auditData.map(e => 
      `${this.formatDate(e.timestamp)} - ${e.action}: ${e.details}`
    ).join('\n')}`);
  }

  logAction(action, details) {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      action: action,
      details: details,
      user: this.currentUser?.email || 'system'
    });
  }

  checkPermission(permission) {
    if (!this.currentUser) return false;
    if (this.currentUser.permissions.includes('all')) return true;
    return this.currentUser.permissions.includes(permission);
  }

  getCurrentUser() {
    return this.currentUser || this.users.find(u => u.email === 'admin@demo-clara360.de');
  }

  setCurrentUser(email) {
    this.currentUser = this.users.find(u => u.email === email);
    if (this.currentUser) {
      this.currentUser.lastLogin = new Date().toISOString();
    }
  }

  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE') + ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `user-notification ${type}`;
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
  openUserManagementPanel() {
    const panel = document.getElementById('clara-user-management-panel');
    if (panel) {
      panel.classList.remove('hidden');
      this.renderUserList();
    }
  }

  getUsers() {
    return this.users;
  }

  getUserStats() {
    return {
      totalUsers: this.users.length,
      activeUsers: this.users.filter(u => u.status === 'active').length,
      adminUsers: this.users.filter(u => u.role === 'Admin' || u.role === 'MetaGovernor').length,
      verifiedUsers: this.users.filter(u => u.verified).length
    };
  }
}

// CSS für User Management
const userManagementCSS = `
.user-management-panel {
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

.user-management-panel.hidden {
  display: none;
}

.user-management-header {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-management-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.user-management-controls button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.user-management-content {
  padding: 1rem;
  max-height: 75vh;
  overflow-y: auto;
}

.user-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.user-search, .role-filter, .status-filter {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.user-search {
  flex: 1;
  min-width: 200px;
}

.user-stats {
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

.user-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

.user-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #e5e7eb;
}

.user-card.active {
  border-left-color: #10b981;
}

.user-card.inactive {
  border-left-color: #6b7280;
  opacity: 0.7;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.user-avatar {
  font-size: 24px;
  margin-right: 1rem;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.user-email {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.user-actions {
  display: flex;
  gap: 5px;
}

.user-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
}

.user-actions button:hover {
  background: #f3f4f6;
}

.user-details {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.user-role, .user-status, .user-verified {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.user-status.status-active {
  background: #dcfce7;
  color: #16a34a;
}

.user-status.status-inactive {
  background: #f3f4f6;
  color: #6b7280;
}

.user-verified.verified {
  background: #dbeafe;
  color: #2563eb;
}

.user-verified.unverified {
  background: #fef3c7;
  color: #d97706;
}

.user-meta {
  margin-bottom: 1rem;
}

.user-detail {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 14px;
  color: #6b7280;
}

.user-permissions {
  font-size: 14px;
  color: #374151;
}

.permission-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.permission-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
}

.user-modal {
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

.user-modal.hidden {
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.role-card {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.role-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.role-icon {
  font-size: 18px;
}

.role-description {
  color: #6b7280;
  margin-bottom: 1rem;
}

.audit-entry {
  padding: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
}

@media (max-width: 768px) {
  .user-management-panel {
    width: 98%;
    max-height: 95vh;
  }
  
  .user-list {
    grid-template-columns: 1fr;
  }
  
  .user-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .user-filters {
    flex-direction: column;
  }
}
`;

// CSS injizieren
const userManagementStyle = document.createElement('style');
userManagementStyle.textContent = userManagementCSS;
document.head.appendChild(userManagementStyle);

// Auto-Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.claraUserManagement = new ClaraUserManagement();
    console.log('👥 Clara User Management bereit');
  }, 7000);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaraUserManagement;
}

