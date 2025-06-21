// clara-fusion-widget-mount.js - Modulares Widget-System für Clara360
(function() {
  'use strict';

  // Clara Fusion Widget - Modulare Integration ohne UI-Überschreibung
  class ClaraFusionWidget {
    constructor() {
      this.isInitialized = false;
      this.messages = [
        {
          id: 1,
          type: 'clara',
          content: 'Hallo! Ich bin Clara Fusion, Ihre erweiterte KI-Assistentin. Ich ergänze die bestehende Clara-Funktionalität mit zusätzlichen Features.',
          timestamp: new Date().toLocaleTimeString(),
          emotion: 'friendly'
        }
      ];
      this.isProcessing = false;
      this.isMinimized = false;
    }

    // Modulare Integration - findet optimalen Integrationspunkt
    findIntegrationPoint() {
      // Strategie 1: Nach KI-Empfehlungen
      const kiEmpfehlungen = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes('KI-Empfehlungen')
      );
      
      if (kiEmpfehlungen) {
        const container = kiEmpfehlungen.closest('div[class*="card"], div[class*="panel"], div[class*="section"]');
        if (container && container.parentElement) {
          console.log('Clara Fusion Widget: Integration nach KI-Empfehlungen');
          return container.parentElement;
        }
      }

      // Strategie 2: Hauptinhalt-Bereich
      const mainContent = document.querySelector('main') || 
                         document.querySelector('[class*="main"]') ||
                         document.querySelector('[class*="content"]') ||
                         document.querySelector('#root > div');
      
      if (mainContent) {
        console.log('Clara Fusion Widget: Integration in Hauptinhalt');
        return mainContent;
      }

      // Strategie 3: Nach Clara KI-Chat
      const claraKiChat = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes('Clara KI-Chat')
      );
      
      if (claraKiChat) {
        const container = claraKiChat.closest('div');
        if (container && container.parentElement) {
          console.log('Clara Fusion Widget: Integration nach Clara KI-Chat');
          return container.parentElement;
        }
      }

      console.warn('Clara Fusion Widget: Kein optimaler Integrationspunkt gefunden');
      return null;
    }

    // Widget-Container erstellen
    createWidgetContainer() {
      const container = document.createElement('div');
      container.id = 'clara-fusion-widget';
      container.className = 'clara-fusion-widget-container';
      container.setAttribute('data-source', 'fusion');
      container.setAttribute('data-integration', 'modular-widget');
      
      return container;
    }

    // Intelligente Response-Engine
    generateResponse(input) {
      const responses = {
        'rückstände': {
          content: 'Fusion-Analyse der Rückstände: Ich erkenne 2 kritische Fälle. Wohnung 3A (450€, 2 Monate) und 7B (280€, 1 Monat). Soll ich automatische Mahnungen mit WhatsApp-Integration erstellen?',
          emotion: 'concerned',
          actions: ['whatsapp', 'document', 'automation']
        },
        'cashflow': {
          content: 'Fusion-Cashflow-Prognose: Basierend auf erweiterten Algorithmen prognostiziere ich +8.180€ netto für nächsten Monat. Optimierungspotenzial: 12% durch Heizungsmodernisierung.',
          emotion: 'positive',
          actions: ['analysis', 'optimization', 'report']
        },
        'wartung': {
          content: 'Fusion-Wartungsmanagement: Prädiktive Analyse zeigt Heizungsservice in 3 Wochen erforderlich. Kostenschätzung: 850€. Soll ich Termine koordinieren und Kostenvoranschläge einholen?',
          emotion: 'helpful',
          actions: ['schedule', 'quotes', 'automation']
        },
        'fusion': {
          content: 'Clara Fusion Engine Status: Alle erweiterten Module aktiv. Prädiktive Analysen, WhatsApp-Integration, automatische Dokumentenerstellung und KI-Optimierungen sind verfügbar.',
          emotion: 'positive',
          actions: ['status', 'modules', 'help']
        },
        'hilfe': {
          content: 'Clara Fusion bietet erweiterte Funktionen: Prädiktive Analysen, automatische WhatsApp-Kommunikation, intelligente Dokumentenerstellung, Kostenoptimierung und erweiterte Berichte.',
          emotion: 'helpful',
          actions: ['features', 'tutorial', 'demo']
        }
      };

      const key = Object.keys(responses).find(k => 
        input.toLowerCase().includes(k)
      );

      if (key) {
        return responses[key];
      }

      return {
        content: `Clara Fusion versteht: "${input}". Als erweiterte KI kann ich Ihnen bei prädiktiven Analysen, automatisierten Prozessen und intelligenter Optimierung helfen. Was möchten Sie erkunden?`,
        emotion: 'helpful',
        actions: ['explore', 'help']
      };
    }

    // Nachrichten-Management
    addMessage(message) {
      this.messages.push(message);
      this.updateMessages();
      this.updateMessageCounter();
    }

    handleSendMessage() {
      const input = this.container.querySelector('.clara-fusion-input');
      const value = input.value.trim();
      
      if (!value || this.isProcessing) return;

      const userMessage = {
        id: this.messages.length + 1,
        type: 'user',
        content: value,
        timestamp: new Date().toLocaleTimeString()
      };

      this.addMessage(userMessage);
      this.isProcessing = true;
      this.updateProcessingState();

      setTimeout(() => {
        const response = this.generateResponse(value);
        const claraMessage = {
          id: this.messages.length + 1,
          type: 'clara',
          content: response.content,
          timestamp: new Date().toLocaleTimeString(),
          emotion: response.emotion,
          actions: response.actions
        };

        this.addMessage(claraMessage);
        this.isProcessing = false;
        this.updateProcessingState();
      }, 1800);

      input.value = '';
    }

    // UI-Updates
    updateProcessingState() {
      const button = this.container.querySelector('.clara-fusion-send-btn');
      const input = this.container.querySelector('.clara-fusion-input');
      
      if (this.isProcessing) {
        button.disabled = true;
        button.textContent = 'Verarbeitet...';
        input.disabled = true;
      } else {
        button.disabled = false;
        button.textContent = 'Senden';
        input.disabled = false;
      }
    }

    updateMessages() {
      const messagesContainer = this.container.querySelector('.clara-fusion-messages');
      if (!messagesContainer) return;

      messagesContainer.innerHTML = '';

      this.messages.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `clara-fusion-message clara-fusion-message-${message.type}`;
        
        const emotionIcon = this.getEmotionIcon(message.emotion);
        const actionsHtml = message.actions ? this.renderActions(message.actions) : '';
        
        messageEl.innerHTML = `
          <div class="clara-fusion-message-content">
            ${message.type === 'clara' ? `<div class="clara-fusion-message-header">${emotionIcon} Clara Fusion</div>` : ''}
            <div class="clara-fusion-message-text">${message.content}</div>
            <div class="clara-fusion-message-time">${message.timestamp}</div>
            ${actionsHtml}
          </div>
        `;
        
        messagesContainer.appendChild(messageEl);
      });

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    updateMessageCounter() {
      const counter = this.container.querySelector('.clara-fusion-message-count');
      if (counter) {
        counter.textContent = this.messages.length;
      }
    }

    getEmotionIcon(emotion) {
      const icons = {
        friendly: '😊',
        concerned: '🤔',
        positive: '✅',
        helpful: '💡'
      };
      return icons[emotion] || '🚀';
    }

    renderActions(actions) {
      const actionConfigs = {
        whatsapp: { label: 'WhatsApp', color: '#25D366', icon: '📱' },
        document: { label: 'Dokument', color: '#3B82F6', icon: '📄' },
        analysis: { label: 'Analyse', color: '#8B5CF6', icon: '📊' },
        schedule: { label: 'Termin', color: '#F59E0B', icon: '📅' },
        automation: { label: 'Automatisierung', color: '#10B981', icon: '⚡' },
        optimization: { label: 'Optimierung', color: '#EF4444', icon: '🎯' },
        report: { label: 'Bericht', color: '#6366F1', icon: '📋' },
        quotes: { label: 'Angebote', color: '#F97316', icon: '💰' },
        status: { label: 'Status', color: '#06B6D4', icon: '📡' },
        modules: { label: 'Module', color: '#8B5CF6', icon: '🧩' },
        features: { label: 'Features', color: '#EC4899', icon: '✨' },
        tutorial: { label: 'Tutorial', color: '#84CC16', icon: '🎓' },
        demo: { label: 'Demo', color: '#F59E0B', icon: '🎬' },
        explore: { label: 'Erkunden', color: '#6366F1', icon: '🔍' },
        help: { label: 'Hilfe', color: '#6B7280', icon: '❓' }
      };

      const buttonsHtml = actions.map(action => {
        const config = actionConfigs[action] || { label: action, color: '#6B7280', icon: '🔧' };
        return `
          <button class="clara-fusion-action-btn" style="background-color: ${config.color}" onclick="console.log('Clara Fusion Action: ${action}')">
            ${config.icon} ${config.label}
          </button>
        `;
      }).join('');

      return `<div class="clara-fusion-actions">${buttonsHtml}</div>`;
    }

    // Widget Toggle-Funktionalität
    toggleWidget() {
      this.isMinimized = !this.isMinimized;
      const content = this.container.querySelector('.clara-fusion-content');
      const toggleBtn = this.container.querySelector('.clara-fusion-toggle');
      
      if (this.isMinimized) {
        content.style.display = 'none';
        toggleBtn.textContent = '📈';
        this.container.classList.add('minimized');
      } else {
        content.style.display = 'block';
        toggleBtn.textContent = '📉';
        this.container.classList.remove('minimized');
      }
    }

    // Event Listeners
    attachEventListeners() {
      const input = this.container.querySelector('.clara-fusion-input');
      const button = this.container.querySelector('.clara-fusion-send-btn');
      const toggle = this.container.querySelector('.clara-fusion-toggle');

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });

      button.addEventListener('click', () => {
        this.handleSendMessage();
      });

      toggle.addEventListener('click', () => {
        this.toggleWidget();
      });
    }

    // Widget Rendering
    render() {
      this.container.innerHTML = `
        <style>
          .clara-fusion-widget-container {
            width: 100%;
            max-width: 600px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
            overflow: hidden;
            margin: 2rem 0;
            border: 2px solid #e2e8f0;
            transition: all 0.3s ease;
            position: relative;
          }
          .clara-fusion-widget-container:hover {
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
            transform: translateY(-2px);
          }
          .clara-fusion-widget-container.minimized {
            max-height: 80px;
          }
          .clara-fusion-header {
            background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
            color: white;
            padding: 1.25rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
          }
          .clara-fusion-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
            pointer-events: none;
          }
          .clara-fusion-header h3 {
            margin: 0;
            font-size: 1.25rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            z-index: 1;
          }
          .clara-fusion-badge {
            background: rgba(255, 255, 255, 0.25);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            backdrop-filter: blur(10px);
            z-index: 1;
          }
          .clara-fusion-toggle {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 0.5rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.2s;
            z-index: 1;
          }
          .clara-fusion-toggle:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          .clara-fusion-content {
            background: white;
          }
          .clara-fusion-messages {
            height: 320px;
            overflow-y: auto;
            padding: 1.5rem;
            background: linear-gradient(to bottom, #f8fafc, #ffffff);
          }
          .clara-fusion-message {
            margin-bottom: 1.25rem;
            display: flex;
            animation: fadeInUp 0.3s ease;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .clara-fusion-message-user {
            justify-content: flex-end;
          }
          .clara-fusion-message-clara {
            justify-content: flex-start;
          }
          .clara-fusion-message-content {
            max-width: 85%;
            padding: 1rem 1.25rem;
            border-radius: 16px;
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #f1f5f9;
            position: relative;
          }
          .clara-fusion-message-user .clara-fusion-message-content {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border-color: #6366f1;
          }
          .clara-fusion-message-header {
            font-size: 0.875rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #374151;
          }
          .clara-fusion-message-text {
            font-size: 0.9375rem;
            line-height: 1.6;
            color: #374151;
          }
          .clara-fusion-message-user .clara-fusion-message-text {
            color: white;
          }
          .clara-fusion-message-time {
            font-size: 0.8125rem;
            opacity: 0.7;
            margin-top: 0.5rem;
          }
          .clara-fusion-actions {
            margin-top: 1rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .clara-fusion-action-btn {
            font-size: 0.8125rem;
            padding: 0.5rem 0.875rem;
            border: none;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .clara-fusion-action-btn:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          .clara-fusion-input-area {
            border-top: 1px solid #e5e7eb;
            padding: 1.25rem 1.5rem;
            background: linear-gradient(to right, #f8fafc, #ffffff);
          }
          .clara-fusion-input-container {
            display: flex;
            gap: 1rem;
            align-items: flex-end;
          }
          .clara-fusion-input {
            flex: 1;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 0.875rem 1.125rem;
            font-size: 0.9375rem;
            outline: none;
            transition: all 0.2s;
            resize: none;
            min-height: 48px;
            max-height: 120px;
            background: white;
          }
          .clara-fusion-input:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          .clara-fusion-send-btn {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            border-radius: 12px;
            padding: 0.875rem 1.5rem;
            font-size: 0.9375rem;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 600;
            min-height: 48px;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }
          .clara-fusion-send-btn:hover:not(:disabled) {
            background: linear-gradient(135deg, #5b5bd6, #7c3aed);
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
          }
          .clara-fusion-send-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          .clara-fusion-status {
            background: linear-gradient(to right, #f8fafc, #e2e8f0);
            padding: 1rem 1.5rem;
            font-size: 0.8125rem;
            color: #64748b;
            border-top: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .clara-fusion-status-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .clara-fusion-status-dot {
            width: 10px;
            height: 10px;
            background: linear-gradient(45deg, #10b981, #06b6d4);
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          .clara-fusion-message-count {
            background: linear-gradient(45deg, #6366f1, #8b5cf6);
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.75rem;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
        </style>
        
        <div class="clara-fusion-header">
          <h3>
            <span>🚀 Clara Fusion Engine</span>
          </h3>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <span class="clara-fusion-badge">Erweiterte KI</span>
            <button class="clara-fusion-toggle">📉</button>
          </div>
        </div>
        
        <div class="clara-fusion-content">
          <div class="clara-fusion-messages"></div>
          
          <div class="clara-fusion-input-area">
            <div class="clara-fusion-input-container">
              <textarea 
                class="clara-fusion-input" 
                placeholder="Fragen Sie Clara Fusion nach erweiterten Analysen, Automatisierung..."
                rows="1"
              ></textarea>
              <button class="clara-fusion-send-btn">Senden</button>
            </div>
          </div>
          
          <div class="clara-fusion-status">
            <div class="clara-fusion-status-indicator">
              <div class="clara-fusion-status-dot"></div>
              <span>Fusion Engine aktiv • Erweiterte KI-Module geladen</span>
            </div>
            <span class="clara-fusion-message-count">${this.messages.length}</span>
          </div>
        </div>
      `;

      this.updateMessages();
      this.attachEventListeners();
    }

    // Hauptinitialisierung
    init() {
      if (this.isInitialized) {
        console.log('Clara Fusion Widget: Bereits initialisiert');
        return { status: 'skipped', message: 'Bereits initialisiert' };
      }

      const integrationPoint = this.findIntegrationPoint();
      if (!integrationPoint) {
        console.error('Clara Fusion Widget: Kein Integrationspunkt gefunden');
        return { status: 'error', message: 'Kein Integrationspunkt gefunden' };
      }

      this.container = this.createWidgetContainer();
      this.render();

      // Modulare Einbettung - NACH bestehenden Elementen
      integrationPoint.appendChild(this.container);

      this.isInitialized = true;
      console.log('Clara Fusion Widget: Erfolgreich initialisiert');

      return { 
        status: 'mounted', 
        widgetId: 'clara-fusion-widget',
        integration: 'modular-widget',
        message: 'Modulare Integration erfolgreich'
      };
    }
  }

  // Modulare Integration Function
  function mountClaraFusionWidget() {
    // Health Check: Clara360 UI muss geladen sein
    const clara360Root = document.getElementById('root');
    if (!clara360Root) {
      console.warn('Clara Fusion Widget: Clara360 UI nicht geladen, warte...');
      setTimeout(mountClaraFusionWidget, 3000);
      return { status: 'waiting', message: 'Warte auf Clara360 UI' };
    }

    // Prüfe ob bereits vorhanden
    if (document.getElementById('clara-fusion-widget')) {
      console.log('Clara Fusion Widget: Bereits vorhanden');
      return { status: 'skipped', message: 'Widget bereits vorhanden' };
    }

    // Initialisiere Widget
    try {
      const widget = new ClaraFusionWidget();
      return widget.init();
    } catch (error) {
      console.error('Clara Fusion Widget Error:', error);
      return { status: 'error', message: error.message };
    }
  }

  // Auto-Mount mit Verzögerung für Clara360 UI
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(mountClaraFusionWidget, 4000);
    });
  } else {
    setTimeout(mountClaraFusionWidget, 4000);
  }

  // Export für manuelle Nutzung
  window.ClaraFusionWidget = {
    mount: mountClaraFusionWidget,
    ClaraFusionWidget: ClaraFusionWidget
  };

})();

