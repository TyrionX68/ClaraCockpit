// Clara360 Wartungsmanagement System
// Vollständige Instandhaltungsverwaltung für Hausverwaltung
// Basierend auf dem Clara360-Vollprojekt

class ClaraMaintenanceManager {
  constructor() {
    this.tasks = [];
    this.contractors = [];
    this.schedules = [];
    this.costs = [];
    this.filters = {
      status: 'all',
      priority: 'all',
      category: 'all',
      property: 'all'
    };
    
    this.init();
  }

  async init() {
    await this.loadMaintenanceData();
    this.createMaintenancePanel();
    this.setupMaintenanceScheduler();
    this.startMaintenanceMonitoring();
    console.log('🔧 Clara Wartungsmanagement initialisiert');
  }

  async loadMaintenanceData() {
    // Lade Wartungsdaten (simuliert basierend auf Waldhofstraße 76)
    this.tasks = [
      {
        id: 1,
        title: "Treppenhaus-Reinigung",
        description: "Monatliche Grundreinigung des Treppenhauses",
        property: "Waldhofstraße 76",
        category: "Reinigung",
        priority: "Niedrig",
        status: "Abgeschlossen",
        assignedTo: "Reinigungsservice Mannheim",
        estimatedCost: 280,
        actualCost: 280,
        dueDate: "2024-12-01",
        completedDate: "2024-12-01",
        notes: "Regelmäßige Reinigung durchgeführt",
        recurring: true,
        interval: "monthly"
      },
      {
        id: 2,
        title: "Wasserboiler-Reparatur",
        description: "Reparatur des defekten Wasserboilers im 2. OG",
        property: "Waldhofstraße 76",
        category: "Reparatur",
        priority: "Hoch",
        status: "Geplant",
        assignedTo: "Heizungstechnik Schmidt",
        estimatedCost: 850,
        actualCost: 0,
        dueDate: "2024-12-15",
        completedDate: null,
        notes: "Termin vereinbart für nächste Woche",
        recurring: false
      },
      {
        id: 3,
        title: "Grundsteuer 2024",
        description: "Zahlung der jährlichen Grundsteuer",
        property: "Waldhofstraße 76",
        category: "Steuern/Abgaben",
        priority: "Kritisch",
        status: "Fällig",
        assignedTo: "Steuerberater Müller",
        estimatedCost: 750,
        actualCost: 0,
        dueDate: "2024-12-31",
        completedDate: null,
        notes: "Frist beachten - bis Jahresende",
        recurring: true,
        interval: "yearly"
      },
      {
        id: 4,
        title: "Heizungsanlage-Wartung",
        description: "Jährliche Wartung der Heizungsanlage",
        property: "Waldhofstraße 76",
        category: "Instandhaltung",
        priority: "Mittel",
        status: "Überfällig",
        assignedTo: "Heizungstechnik Schmidt",
        estimatedCost: 1200,
        actualCost: 0,
        dueDate: "2024-11-30",
        completedDate: null,
        notes: "Wartung überfällig - sofort planen",
        recurring: true,
        interval: "yearly"
      },
      {
        id: 5,
        title: "Fassadeninspektion",
        description: "Inspektion der Fassade auf Schäden",
        property: "Waldhofstraße 76",
        category: "Inspektion",
        priority: "Mittel",
        status: "Geplant",
        assignedTo: "Bausachverständiger Weber",
        estimatedCost: 450,
        actualCost: 0,
        dueDate: "2025-01-15",
        completedDate: null,
        notes: "Frühjahrsinspektion geplant",
        recurring: true,
        interval: "yearly"
      }
    ];

    this.contractors = [
      {
        id: 1,
        name: "Reinigungsservice Mannheim",
        category: "Reinigung",
        contact: "+49 621 123456",
        email: "info@reinigung-mannheim.de",
        rating: 4.5,
        specialties: ["Treppenhaus", "Gemeinschaftsräume"]
      },
      {
        id: 2,
        name: "Heizungstechnik Schmidt",
        category: "Heizung/Sanitär",
        contact: "+49 621 789012",
        email: "schmidt@heizung-ma.de",
        rating: 4.8,
        specialties: ["Heizung", "Warmwasser", "Reparaturen"]
      },
      {
        id: 3,
        name: "Steuerberater Müller",
        category: "Steuern/Recht",
        contact: "+49 621 345678",
        email: "mueller@steuer-ma.de",
        rating: 4.7,
        specialties: ["Grundsteuer", "Immobiliensteuern"]
      },
      {
        id: 4,
        name: "Bausachverständiger Weber",
        category: "Inspektion",
        contact: "+49 621 567890",
        email: "weber@bausv-ma.de",
        rating: 4.6,
        specialties: ["Fassade", "Dach", "Bausubstanz"]
      }
    ];

    console.log('🔧 Wartungsdaten geladen:', this.tasks.length, 'Aufgaben');
  }

  createMaintenancePanel() {
    const panel = document.createElement('div');
    panel.id = 'clara-maintenance-panel';
    panel.className = 'maintenance-panel hidden';
    panel.innerHTML = `
      <div class="maintenance-header">
        <h3>🔧 Wartungsmanagement</h3>
        <div class="maintenance-controls">
          <button class="maintenance-add">+ Neue Aufgabe</button>
          <button class="maintenance-calendar">📅 Kalender</button>
          <button class="maintenance-reports">📊 Berichte</button>
          <button class="maintenance-close">×</button>
        </div>
      </div>
      
      <div class="maintenance-content">
        <div class="maintenance-filters">
          <select class="filter-select" id="status-filter">
            <option value="all">Alle Status</option>
            <option value="Geplant">Geplant</option>
            <option value="In Bearbeitung">In Bearbeitung</option>
            <option value="Fällig">Fällig</option>
            <option value="Überfällig">Überfällig</option>
            <option value="Abgeschlossen">Abgeschlossen</option>
          </select>
          
          <select class="filter-select" id="priority-filter">
            <option value="all">Alle Prioritäten</option>
            <option value="Kritisch">Kritisch</option>
            <option value="Hoch">Hoch</option>
            <option value="Mittel">Mittel</option>
            <option value="Niedrig">Niedrig</option>
          </select>
          
          <select class="filter-select" id="category-filter">
            <option value="all">Alle Kategorien</option>
            <option value="Reinigung">Reinigung</option>
            <option value="Reparatur">Reparatur</option>
            <option value="Instandhaltung">Instandhaltung</option>
            <option value="Inspektion">Inspektion</option>
            <option value="Steuern/Abgaben">Steuern/Abgaben</option>
          </select>
          
          <div class="view-toggle">
            <button class="view-btn active" data-view="cards">📋 Karten</button>
            <button class="view-btn" data-view="table">📊 Tabelle</button>
          </div>
        </div>
        
        <div class="maintenance-stats">
          <div class="stat-card">
            <h4>Offene Aufgaben</h4>
            <div class="stat-value" id="open-tasks">0</div>
          </div>
          <div class="stat-card">
            <h4>Überfällige Aufgaben</h4>
            <div class="stat-value critical" id="overdue-tasks">0</div>
          </div>
          <div class="stat-card">
            <h4>Monatliche Kosten</h4>
            <div class="stat-value" id="monthly-costs">€ 0</div>
          </div>
          <div class="stat-card">
            <h4>Nächste Fälligkeit</h4>
            <div class="stat-value" id="next-due">-</div>
          </div>
        </div>
        
        <div class="maintenance-tasks" id="maintenance-tasks">
          <!-- Tasks werden hier eingefügt -->
        </div>
      </div>
      
      <!-- Add Task Modal -->
      <div class="maintenance-modal hidden" id="add-task-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Neue Wartungsaufgabe</h3>
            <button class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <form id="add-task-form">
              <div class="form-group">
                <label>Titel</label>
                <input type="text" name="title" required>
              </div>
              <div class="form-group">
                <label>Beschreibung</label>
                <textarea name="description" rows="3"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Kategorie</label>
                  <select name="category" required>
                    <option value="">Wählen...</option>
                    <option value="Reinigung">Reinigung</option>
                    <option value="Reparatur">Reparatur</option>
                    <option value="Instandhaltung">Instandhaltung</option>
                    <option value="Inspektion">Inspektion</option>
                    <option value="Steuern/Abgaben">Steuern/Abgaben</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Priorität</label>
                  <select name="priority" required>
                    <option value="">Wählen...</option>
                    <option value="Kritisch">Kritisch</option>
                    <option value="Hoch">Hoch</option>
                    <option value="Mittel">Mittel</option>
                    <option value="Niedrig">Niedrig</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Zugewiesen an</label>
                  <select name="assignedTo">
                    <option value="">Wählen...</option>
                    <option value="Reinigungsservice Mannheim">Reinigungsservice Mannheim</option>
                    <option value="Heizungstechnik Schmidt">Heizungstechnik Schmidt</option>
                    <option value="Steuerberater Müller">Steuerberater Müller</option>
                    <option value="Bausachverständiger Weber">Bausachverständiger Weber</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Geschätzte Kosten (€)</label>
                  <input type="number" name="estimatedCost" min="0" step="0.01">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Fälligkeitsdatum</label>
                  <input type="date" name="dueDate" required>
                </div>
                <div class="form-group">
                  <label>Wiederkehrend</label>
                  <select name="recurring">
                    <option value="false">Nein</option>
                    <option value="true">Ja</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label>Notizen</label>
                <textarea name="notes" rows="2"></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="btn-cancel">Abbrechen</button>
                <button type="submit" class="btn-primary">Aufgabe erstellen</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.bindMaintenanceEvents(panel);
    document.body.appendChild(panel);
  }

  bindMaintenanceEvents(panel) {
    // Close Button
    panel.querySelector('.maintenance-close').addEventListener('click', () => {
      panel.classList.add('hidden');
    });

    // Add Task Button
    panel.querySelector('.maintenance-add').addEventListener('click', () => {
      this.showAddTaskModal();
    });

    // Calendar Button
    panel.querySelector('.maintenance-calendar').addEventListener('click', () => {
      this.showMaintenanceCalendar();
    });

    // Reports Button
    panel.querySelector('.maintenance-reports').addEventListener('click', () => {
      this.generateMaintenanceReport();
    });

    // Filter Events
    panel.querySelectorAll('.filter-select').forEach(select => {
      select.addEventListener('change', () => {
        this.applyFilters();
      });
    });

    // View Toggle
    panel.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.switchView(btn.dataset.view);
      });
    });

    // Add Task Form
    const form = panel.querySelector('#add-task-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addMaintenanceTask(new FormData(form));
    });

    // Modal Events
    panel.querySelector('.modal-close').addEventListener('click', () => {
      this.hideAddTaskModal();
    });

    panel.querySelector('.btn-cancel').addEventListener('click', () => {
      this.hideAddTaskModal();
    });
  }

  updateMaintenanceStats() {
    const openTasks = this.getFilteredTasks().filter(t => t.status !== 'Abgeschlossen').length;
    const overdueTasks = this.getFilteredTasks().filter(t => 
      t.status === 'Überfällig' || (new Date(t.dueDate) < new Date() && t.status !== 'Abgeschlossen')
    ).length;
    
    const monthlyCosts = this.calculateMonthlyCosts();
    const nextDue = this.getNextDueTask();

    document.getElementById('open-tasks').textContent = openTasks;
    document.getElementById('overdue-tasks').textContent = overdueTasks;
    document.getElementById('monthly-costs').textContent = `€ ${monthlyCosts.toLocaleString()}`;
    document.getElementById('next-due').textContent = nextDue ? this.formatDate(nextDue.dueDate) : '-';
  }

  getFilteredTasks() {
    return this.tasks.filter(task => {
      if (this.filters.status !== 'all' && task.status !== this.filters.status) return false;
      if (this.filters.priority !== 'all' && task.priority !== this.filters.priority) return false;
      if (this.filters.category !== 'all' && task.category !== this.filters.category) return false;
      return true;
    });
  }

  calculateMonthlyCosts() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return this.tasks
      .filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
      })
      .reduce((sum, task) => sum + (task.estimatedCost || 0), 0);
  }

  getNextDueTask() {
    const now = new Date();
    const upcomingTasks = this.tasks
      .filter(task => new Date(task.dueDate) > now && task.status !== 'Abgeschlossen')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    return upcomingTasks[0] || null;
  }

  renderMaintenanceTasks() {
    const container = document.getElementById('maintenance-tasks');
    const filteredTasks = this.getFilteredTasks();
    
    container.innerHTML = filteredTasks.map(task => this.renderTaskCard(task)).join('');
    this.updateMaintenanceStats();
  }

  renderTaskCard(task) {
    const priorityClass = {
      'Kritisch': 'critical',
      'Hoch': 'high',
      'Mittel': 'medium',
      'Niedrig': 'low'
    }[task.priority] || 'medium';

    const statusClass = {
      'Abgeschlossen': 'completed',
      'In Bearbeitung': 'in-progress',
      'Geplant': 'planned',
      'Fällig': 'due',
      'Überfällig': 'overdue'
    }[task.status] || 'planned';

    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Abgeschlossen';
    const actualStatus = isOverdue ? 'Überfällig' : task.status;
    const actualStatusClass = isOverdue ? 'overdue' : statusClass;

    return `
      <div class="task-card ${priorityClass}" data-id="${task.id}">
        <div class="task-header">
          <h4 class="task-title">${task.title}</h4>
          <div class="task-actions">
            <button class="task-edit" onclick="window.claraMaintenance.editTask(${task.id})">✏️</button>
            <button class="task-complete" onclick="window.claraMaintenance.completeTask(${task.id})">✅</button>
            <button class="task-delete" onclick="window.claraMaintenance.deleteTask(${task.id})">🗑️</button>
          </div>
        </div>
        
        <p class="task-description">${task.description}</p>
        
        <div class="task-meta">
          <div class="task-info">
            <span class="task-category">${task.category}</span>
            <span class="task-priority priority-${priorityClass}">${task.priority}</span>
            <span class="task-status status-${actualStatusClass}">${actualStatus}</span>
          </div>
          
          <div class="task-details">
            <div class="task-detail">
              <strong>Zugewiesen:</strong> ${task.assignedTo || 'Nicht zugewiesen'}
            </div>
            <div class="task-detail">
              <strong>Fällig:</strong> ${this.formatDate(task.dueDate)}
            </div>
            <div class="task-detail">
              <strong>Kosten:</strong> € ${(task.actualCost || task.estimatedCost || 0).toLocaleString()}
            </div>
            ${task.recurring ? '<div class="task-detail recurring">🔄 Wiederkehrend</div>' : ''}
          </div>
          
          ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
        </div>
      </div>
    `;
  }

  showAddTaskModal() {
    const modal = document.getElementById('add-task-modal');
    modal.classList.remove('hidden');
    
    // Reset form
    document.getElementById('add-task-form').reset();
  }

  hideAddTaskModal() {
    const modal = document.getElementById('add-task-modal');
    modal.classList.add('hidden');
  }

  addMaintenanceTask(formData) {
    const newTask = {
      id: Date.now(),
      title: formData.get('title'),
      description: formData.get('description'),
      property: 'Waldhofstraße 76',
      category: formData.get('category'),
      priority: formData.get('priority'),
      status: 'Geplant',
      assignedTo: formData.get('assignedTo'),
      estimatedCost: parseFloat(formData.get('estimatedCost')) || 0,
      actualCost: 0,
      dueDate: formData.get('dueDate'),
      completedDate: null,
      notes: formData.get('notes'),
      recurring: formData.get('recurring') === 'true'
    };

    this.tasks.unshift(newTask);
    this.renderMaintenanceTasks();
    this.hideAddTaskModal();
    
    // Benachrichtigung
    this.showNotification('Wartungsaufgabe erfolgreich erstellt', 'success');
  }

  editTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Vereinfachte Bearbeitung - öffne Prompt
    const newTitle = prompt('Titel bearbeiten:', task.title);
    if (newTitle && newTitle !== task.title) {
      task.title = newTitle;
      this.renderMaintenanceTasks();
      this.showNotification('Aufgabe aktualisiert', 'success');
    }
  }

  completeTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (confirm(`Aufgabe "${task.title}" als abgeschlossen markieren?`)) {
      task.status = 'Abgeschlossen';
      task.completedDate = new Date().toISOString().split('T')[0];
      
      // Wenn wiederkehrend, erstelle neue Aufgabe
      if (task.recurring) {
        this.createRecurringTask(task);
      }
      
      this.renderMaintenanceTasks();
      this.showNotification('Aufgabe abgeschlossen', 'success');
    }
  }

  deleteTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    if (confirm(`Aufgabe "${task.title}" wirklich löschen?`)) {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.renderMaintenanceTasks();
      this.showNotification('Aufgabe gelöscht', 'info');
    }
  }

  createRecurringTask(originalTask) {
    const nextDueDate = this.calculateNextDueDate(originalTask.dueDate, originalTask.interval);
    
    const newTask = {
      ...originalTask,
      id: Date.now(),
      status: 'Geplant',
      dueDate: nextDueDate,
      completedDate: null,
      actualCost: 0,
      notes: `Wiederkehrende Aufgabe (vorherige: ${originalTask.completedDate})`
    };

    this.tasks.unshift(newTask);
  }

  calculateNextDueDate(currentDate, interval) {
    const date = new Date(currentDate);
    
    switch (interval) {
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    
    return date.toISOString().split('T')[0];
  }

  applyFilters() {
    this.filters.status = document.getElementById('status-filter').value;
    this.filters.priority = document.getElementById('priority-filter').value;
    this.filters.category = document.getElementById('category-filter').value;
    
    this.renderMaintenanceTasks();
  }

  switchView(view) {
    // Implementiere Tabellen-/Kartenansicht
    console.log('Wechsle zu Ansicht:', view);
  }

  showMaintenanceCalendar() {
    // Vereinfachter Kalender
    const upcomingTasks = this.tasks
      .filter(task => task.status !== 'Abgeschlossen')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 10);

    const calendarHTML = upcomingTasks.map(task => 
      `<div class="calendar-item">
        <strong>${this.formatDate(task.dueDate)}</strong> - ${task.title}
        <span class="priority-${task.priority.toLowerCase()}">${task.priority}</span>
      </div>`
    ).join('');

    alert(`Wartungskalender:\n\n${upcomingTasks.map(t => 
      `${this.formatDate(t.dueDate)} - ${t.title} (${t.priority})`
    ).join('\n')}`);
  }

  generateMaintenanceReport() {
    const stats = {
      totalTasks: this.tasks.length,
      completedTasks: this.tasks.filter(t => t.status === 'Abgeschlossen').length,
      overdueTasks: this.tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Abgeschlossen').length,
      totalCosts: this.tasks.reduce((sum, t) => sum + (t.actualCost || t.estimatedCost || 0), 0),
      avgCostPerTask: 0
    };

    stats.avgCostPerTask = stats.totalTasks > 0 ? stats.totalCosts / stats.totalTasks : 0;

    const reportData = {
      timestamp: new Date().toISOString(),
      property: 'Waldhofstraße 76',
      stats: stats,
      tasks: this.tasks
    };

    // Export als JSON
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wartungsbericht_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.showNotification('Wartungsbericht exportiert', 'success');
  }

  setupMaintenanceScheduler() {
    // Prüfe täglich auf fällige Aufgaben
    setInterval(() => {
      this.checkDueTasks();
    }, 86400000); // 24 Stunden

    // Initiale Prüfung
    setTimeout(() => {
      this.checkDueTasks();
    }, 5000);
  }

  checkDueTasks() {
    const now = new Date();
    const dueTasks = this.tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7 && daysDiff >= 0 && task.status !== 'Abgeschlossen';
    });

    if (dueTasks.length > 0) {
      this.showMaintenanceNotification(dueTasks);
    }
  }

  showMaintenanceNotification(tasks) {
    const message = `${tasks.length} Wartungsaufgabe(n) sind in den nächsten 7 Tagen fällig`;
    this.showNotification(message, 'warning');
  }

  startMaintenanceMonitoring() {
    // Überwache Wartungsaufgaben alle 30 Minuten
    setInterval(() => {
      this.updateTaskStatuses();
    }, 1800000); // 30 Minuten
  }

  updateTaskStatuses() {
    const now = new Date();
    let updated = false;

    this.tasks.forEach(task => {
      if (task.status === 'Abgeschlossen') return;

      const dueDate = new Date(task.dueDate);
      if (dueDate < now && task.status !== 'Überfällig') {
        task.status = 'Überfällig';
        updated = true;
      }
    });

    if (updated) {
      this.renderMaintenanceTasks();
    }
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  }

  showNotification(message, type = 'info') {
    // Einfache Benachrichtigung
    const notification = document.createElement('div');
    notification.className = `maintenance-notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
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
  openMaintenancePanel() {
    const panel = document.getElementById('clara-maintenance-panel');
    if (panel) {
      panel.classList.remove('hidden');
      this.renderMaintenanceTasks();
    }
  }

  getMaintenanceTasks() {
    return this.tasks;
  }

  getMaintenanceStats() {
    return {
      totalTasks: this.tasks.length,
      openTasks: this.tasks.filter(t => t.status !== 'Abgeschlossen').length,
      overdueTasks: this.tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Abgeschlossen').length,
      totalCosts: this.tasks.reduce((sum, t) => sum + (t.actualCost || t.estimatedCost || 0), 0)
    };
  }
}

// CSS für Wartungsmanagement
const maintenanceCSS = `
.maintenance-panel {
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

.maintenance-panel.hidden {
  display: none;
}

.maintenance-header {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.maintenance-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.maintenance-controls button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.maintenance-content {
  padding: 1rem;
  max-height: 75vh;
  overflow-y: auto;
}

.maintenance-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.view-toggle {
  display: flex;
  gap: 5px;
  margin-left: auto;
}

.view-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.maintenance-stats {
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

.stat-value.critical {
  color: #ef4444;
}

.maintenance-tasks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

.task-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #e5e7eb;
}

.task-card.critical {
  border-left-color: #ef4444;
}

.task-card.high {
  border-left-color: #f59e0b;
}

.task-card.medium {
  border-left-color: #3b82f6;
}

.task-card.low {
  border-left-color: #10b981;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.task-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  flex: 1;
}

.task-actions {
  display: flex;
  gap: 5px;
}

.task-actions button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 14px;
}

.task-actions button:hover {
  background: #f3f4f6;
}

.task-description {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.4;
}

.task-info {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.task-category, .task-priority, .task-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.task-category {
  background: #f3f4f6;
  color: #374151;
}

.priority-critical {
  background: #fee2e2;
  color: #dc2626;
}

.priority-high {
  background: #fef3c7;
  color: #d97706;
}

.priority-medium {
  background: #dbeafe;
  color: #2563eb;
}

.priority-low {
  background: #dcfce7;
  color: #16a34a;
}

.status-completed {
  background: #dcfce7;
  color: #16a34a;
}

.status-in-progress {
  background: #dbeafe;
  color: #2563eb;
}

.status-planned {
  background: #f3f4f6;
  color: #374151;
}

.status-due {
  background: #fef3c7;
  color: #d97706;
}

.status-overdue {
  background: #fee2e2;
  color: #dc2626;
}

.task-details {
  margin-bottom: 1rem;
}

.task-detail {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 14px;
  color: #6b7280;
}

.task-detail.recurring {
  color: #3b82f6;
  font-weight: 500;
}

.task-notes {
  background: #f9fafb;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 13px;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.maintenance-modal {
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

.maintenance-modal.hidden {
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
.form-group select,
.form-group textarea {
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

@media (max-width: 768px) {
  .maintenance-panel {
    width: 98%;
    max-height: 95vh;
  }
  
  .maintenance-tasks {
    grid-template-columns: 1fr;
  }
  
  .maintenance-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .maintenance-filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-toggle {
    margin-left: 0;
    margin-top: 1rem;
  }
}
`;

// CSS injizieren
const maintenanceStyle = document.createElement('style');
maintenanceStyle.textContent = maintenanceCSS;
document.head.appendChild(maintenanceStyle);

// Auto-Initialize
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    window.claraMaintenance = new ClaraMaintenanceManager();
    console.log('🔧 Clara Wartungsmanagement bereit');
  }, 6000);
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClaraMaintenanceManager;
}

