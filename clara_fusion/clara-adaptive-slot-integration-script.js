// clara-adaptive-slot-integration-script.js - Adaptive slot creation for clara360.de
(function() {
  'use strict';

  // Clara Adaptive Slot Engine - Creates slot if not exists
  class ClaraAdaptiveSlotEngine {
    constructor(targetElement) {
      this.target = targetElement;
      this.messages = [
        {
          id: 1,
          type: 'clara',
          content: 'Hallo! Ich bin Clara, Ihre erweiterte KI-Assistentin. Wie kann ich Ihnen bei der Hausverwaltung helfen?',
          timestamp: new Date().toLocaleTimeString(),
          emotion: 'friendly'
        }
      ];
      this.isProcessing = false;
      this.init();
    }

    init() {
      // Kennzeichnung für Meta-Governor
      this.target.setAttribute('data-source', 'fusion');
      this.target.setAttribute('data-integration', 'adaptive-slot');
      
      this.render();
      this.attachEventListeners();
      console.log('ClaraAdaptiveSlotEngine mounted in:', this.target.tagName, this.target.className);
    }

    generateResponse(input) {
      const responses = {
        'rückstände': {
          content: 'Ich analysiere die aktuellen Rückstände für die Waldhofstraße 76. Basierend auf den Daten zeigen sich: Wohnung 3A (450€), Wohnung 7B (280€). Soll ich eine WhatsApp-Nachricht für die Mahnung erstellen?',
          emotion: 'concerned',
          actions: ['whatsapp', 'document']
        },
        'cashflow': {
          content: 'Der aktuelle Cashflow für die Waldhofstraße 76: Einnahmen 8.360€/Monat, Ausgaben 2.180€/Monat. Netto-Cashflow: +6.180€. Die Rendite liegt bei 8,4% - ein exzellentes Ergebnis!',
          emotion: 'positive',
          actions: ['document', 'analysis']
        },
        'wartung': {
          content: 'Wartungsübersicht Waldhofstraße 76: Heizung (850€ fällig), Reinigung (280€ monatlich), Gartenpflege (150€). Nächste Inspektion: Aufzug in 3 Monaten. Soll ich die Termine koordinieren?',
          emotion: 'helpful',
          actions: ['schedule', 'document']
        },
        'whatsapp': {
          content: 'WhatsApp-Nachricht erstellt: "Sehr geehrte/r Mieter/in, wir möchten Sie daran erinnern, dass Ihre Miete für [Monat] noch aussteht. Betrag: [Summe]€. Bitte überweisen Sie bis [Datum]. Bei Fragen stehen wir gerne zur Verfügung."',
          emotion: 'helpful',
          actions: ['copy', 'send']
        }
      };

      const key = Object.keys(responses).find(k => 
        input.toLowerCase().includes(k)
      );

      if (key) {
        return responses[key];
      }

      return {
        content: `Ich verstehe Ihre Anfrage zu "${input}". Als erweiterte KI-Assistentin kann ich Ihnen bei Rückständen, Cashflow-Analysen, Wartungsplanung und Dokumentenerstellung helfen. Was möchten Sie genauer wissen?`,
        emotion: 'helpful',
        actions: ['help']
      };
    }

    addMessage(message) {
      this.messages.push(message);
      this.updateMessages();
    }

    handleSendMessage() {
      const input = this.target.querySelector('.clara-adaptive-input');
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
      }, 1500);

      input.value = '';
    }

    updateProcessingState() {
      const button = this.target.querySelector('.clara-adaptive-send-btn');
      const input = this.target.querySelector('.clara-adaptive-input');
      
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
      const messagesContainer = this.target.querySelector('.clara-adaptive-messages');
      messagesContainer.innerHTML = '';

      this.messages.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `clara-adaptive-message clara-adaptive-message-${message.type}`;
        
        const emotionIcon = this.getEmotionIcon(message.emotion);
        const actionsHtml = message.actions ? this.renderActions(message.actions) : '';
        
        messageEl.innerHTML = `
          <div class="clara-adaptive-message-content">
            ${message.type === 'clara' ? `<div class="clara-adaptive-message-header">${emotionIcon} Clara</div>` : ''}
            <div class="clara-adaptive-message-text">${message.content}</div>
            <div class="clara-adaptive-message-time">${message.timestamp}</div>
            ${actionsHtml}
          </div>
        `;
        
        messagesContainer.appendChild(messageEl);
      });

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    getEmotionIcon(emotion) {
      const icons = {
        friendly: '😊',
        concerned: '🤔',
        positive: '✅',
        helpful: '💡'
      };
      return icons[emotion] || '🤖';
    }

    renderActions(actions) {
      const actionConfigs = {
        whatsapp: { label: 'WhatsApp erstellen', color: '#25D366', icon: '📱' },
        document: { label: 'Dokument öffnen', color: '#3B82F6', icon: '📄' },
        analysis: { label: 'Detailanalyse', color: '#8B5CF6', icon: '📊' },
        schedule: { label: 'Termin planen', color: '#F59E0B', icon: '📅' },
        copy: { label: 'Kopieren', color: '#6B7280', icon: '📋' },
        send: { label: 'Senden', color: '#10B981', icon: '📤' },
        help: { label: 'Hilfe', color: '#6B7280', icon: '❓' }
      };

      const buttonsHtml = actions.map(action => {
        const config = actionConfigs[action] || { label: action, color: '#6B7280', icon: '🔧' };
        return `
          <button class="clara-adaptive-action-btn" style="background-color: ${config.color}" onclick="console.log('Action: ${action}')">
            ${config.icon} ${config.label}
          </button>
        `;
      }).join('');

      return `<div class="clara-adaptive-actions">${buttonsHtml}</div>`;
    }

    attachEventListeners() {
      const input = this.target.querySelector('.clara-adaptive-input');
      const button = this.target.querySelector('.clara-adaptive-send-btn');

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });

      button.addEventListener('click', () => {
        this.handleSendMessage();
      });
    }

    render() {
      // Adaptive Styling - integriert sich in Clara360 Design
      this.target.innerHTML = `
        <style>
          .clara-adaptive-container {
            width: 100%;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin: 1.5rem 0;
            border: 1px solid #e5e7eb;
          }
          .clara-adaptive-header {
            background: linear-gradient(135deg, #8B5CF6, #3B82F6);
            color: white;
            padding: 1rem 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .clara-adaptive-header h3 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .clara-adaptive-badge {
            background: rgba(255, 255, 255, 0.25);
            padding: 0.375rem 0.75rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
          }
          .clara-adaptive-messages {
            height: 350px;
            overflow-y: auto;
            padding: 1.25rem;
            background: #f8fafc;
          }
          .clara-adaptive-message {
            margin-bottom: 1rem;
            display: flex;
          }
          .clara-adaptive-message-user {
            justify-content: flex-end;
          }
          .clara-adaptive-message-clara {
            justify-content: flex-start;
          }
          .clara-adaptive-message-content {
            max-width: 85%;
            padding: 0.75rem 1rem;
            border-radius: 12px;
            background: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 1px solid #f1f5f9;
          }
          .clara-adaptive-message-user .clara-adaptive-message-content {
            background: #3B82F6;
            color: white;
            border-color: #3B82F6;
          }
          .clara-adaptive-message-header {
            font-size: 0.875rem;
            font-weight: 600;
            margin-bottom: 0.375rem;
            display: flex;
            align-items: center;
            gap: 0.375rem;
            color: #374151;
          }
          .clara-adaptive-message-text {
            font-size: 0.9375rem;
            line-height: 1.5;
            color: #374151;
          }
          .clara-adaptive-message-user .clara-adaptive-message-text {
            color: white;
          }
          .clara-adaptive-message-time {
            font-size: 0.8125rem;
            opacity: 0.7;
            margin-top: 0.375rem;
          }
          .clara-adaptive-actions {
            margin-top: 0.75rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.375rem;
          }
          .clara-adaptive-action-btn {
            font-size: 0.8125rem;
            padding: 0.375rem 0.75rem;
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
          }
          .clara-adaptive-action-btn:hover {
            opacity: 0.85;
            transform: translateY(-1px);
          }
          .clara-adaptive-input-area {
            border-top: 1px solid #e5e7eb;
            padding: 1rem 1.25rem;
            background: white;
          }
          .clara-adaptive-input-container {
            display: flex;
            gap: 0.75rem;
            align-items: flex-end;
          }
          .clara-adaptive-input {
            flex: 1;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 0.75rem 1rem;
            font-size: 0.9375rem;
            outline: none;
            transition: all 0.2s;
            resize: none;
            min-height: 44px;
            max-height: 120px;
          }
          .clara-adaptive-input:focus {
            border-color: #8B5CF6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          }
          .clara-adaptive-send-btn {
            background: #8B5CF6;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.75rem 1.25rem;
            font-size: 0.9375rem;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            min-height: 44px;
          }
          .clara-adaptive-send-btn:hover:not(:disabled) {
            background: #7C3AED;
            transform: translateY(-1px);
          }
          .clara-adaptive-send-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          .clara-adaptive-status {
            background: #f8fafc;
            padding: 0.75rem 1.25rem;
            font-size: 0.8125rem;
            color: #64748b;
            border-top: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .clara-adaptive-status-indicator {
            display: flex;
            align-items: center;
            gap: 0.375rem;
          }
          .clara-adaptive-status-dot {
            width: 8px;
            height: 8px;
            background: #10b981;
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        </style>
        
        <div class="clara-adaptive-container" data-source="fusion">
          <div class="clara-adaptive-header">
            <h3>
              <span>🤖 Clara KI-Chat</span>
            </h3>
            <span class="clara-adaptive-badge">Fusion Engine</span>
          </div>
          
          <div class="clara-adaptive-messages"></div>
          
          <div class="clara-adaptive-input-area">
            <div class="clara-adaptive-input-container">
              <textarea 
                class="clara-adaptive-input" 
                placeholder="Fragen Sie Clara nach Rückständen, Cashflow, Wartung..."
                rows="1"
              ></textarea>
              <button class="clara-adaptive-send-btn">Senden</button>
            </div>
          </div>
          
          <div class="clara-adaptive-status">
            <div class="clara-adaptive-status-indicator">
              <div class="clara-adaptive-status-dot"></div>
              <span>Adaptive Integration aktiv</span>
            </div>
            <span>Nachrichten: ${this.messages.length} | Engine: Fusion</span>
          </div>
        </div>
      `;

      this.updateMessages();
    }
  }

  // Adaptive Integration Function - Creates slot if needed
  function integrateClaraAdaptive() {
    // Strategie 1: Versuche vorhandenen Slot zu finden
    let targetElement = document.getElementById('clara-ki-slot');
    
    if (targetElement) {
      console.log('Clara Adaptive Integration: Vorhandener Slot gefunden');
    } else {
      // Strategie 2: Suche nach Clara KI Bereich
      const claraKiSection = document.querySelector('[class*="clara"]') ||
                            document.querySelector('h3:contains("Clara")') ||
                            document.querySelector('[id*="clara"]');
      
      if (claraKiSection) {
        // Erstelle Slot nach Clara KI Bereich
        targetElement = document.createElement('div');
        targetElement.id = 'clara-ki-slot-adaptive';
        targetElement.className = 'clara-adaptive-slot';
        claraKiSection.parentNode.insertBefore(targetElement, claraKiSection.nextSibling);
        console.log('Clara Adaptive Integration: Slot nach Clara KI Bereich erstellt');
      } else {
        // Strategie 3: Suche nach Hauptinhalt-Bereich
        const mainContent = document.querySelector('main') ||
                           document.querySelector('[class*="main"]') ||
                           document.querySelector('[class*="content"]') ||
                           document.querySelector('#root > div');
        
        if (mainContent) {
          targetElement = document.createElement('div');
          targetElement.id = 'clara-ki-slot-adaptive';
          targetElement.className = 'clara-adaptive-slot';
          mainContent.appendChild(targetElement);
          console.log('Clara Adaptive Integration: Slot in Hauptinhalt erstellt');
        } else {
          console.error('Clara Adaptive Integration: Kein geeigneter Bereich gefunden');
          return { 
            status: 'error', 
            message: 'Kein geeigneter Integrationsbereich gefunden',
            integration: 'failed'
          };
        }
      }
    }

    // Prüfe ob bereits integriert
    if (targetElement.hasAttribute('data-source')) {
      console.log('Clara Adaptive Integration: Bereits integriert');
      return { 
        status: 'skipped', 
        message: 'Bereits integriert',
        integration: 'existing'
      };
    }

    // Health Check: Clara360 UI muss vorhanden sein
    const clara360Root = document.getElementById('root');
    
    if (!clara360Root) {
      console.warn('Clara Adaptive Integration: Clara360 UI nicht geladen, warte...');
      setTimeout(integrateClaraAdaptive, 2000);
      return { 
        status: 'waiting', 
        message: 'Warte auf Clara360 UI',
        integration: 'delayed'
      };
    }

    // Initialisiere Clara Adaptive Engine
    try {
      new ClaraAdaptiveSlotEngine(targetElement);
      return { 
        status: 'mounted', 
        slotId: targetElement.id,
        hookName: 'ClaraAdaptiveSlotEngine',
        message: 'Adaptive Integration erfolgreich',
        integration: 'adaptive-slot'
      };
    } catch (error) {
      console.error('Clara Adaptive Integration Error:', error);
      return { 
        status: 'error', 
        message: error.message,
        integration: 'failed'
      };
    }
  }

  // Auto-integrate when DOM is ready - mit Verzögerung für Clara360 UI
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(integrateClaraAdaptive, 4000); // Längere Wartezeit für Clara360 UI
    });
  } else {
    setTimeout(integrateClaraAdaptive, 4000);
  }

  // Export for manual use
  window.ClaraAdaptiveIntegration = {
    integrate: integrateClaraAdaptive,
    ClaraAdaptiveSlotEngine: ClaraAdaptiveSlotEngine
  };

})();

