// clara-slot-integration-script.js - Modular slot-based integration for clara360.de
(function() {
  'use strict';

  // Clara Slot-Based Engine - Respects existing Clara360 UI
  class ClaraSlotEngine {
    constructor(slotElement) {
      this.slot = slotElement;
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
      this.slot.setAttribute('data-source', 'fusion');
      this.slot.setAttribute('data-integration', 'slot-based');
      
      this.render();
      this.attachEventListeners();
      console.log('ClaraSlotEngine mounted in slot:', this.slot.id);
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
      const input = this.slot.querySelector('.clara-slot-input');
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
      const button = this.slot.querySelector('.clara-slot-send-btn');
      const input = this.slot.querySelector('.clara-slot-input');
      
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
      const messagesContainer = this.slot.querySelector('.clara-slot-messages');
      messagesContainer.innerHTML = '';

      this.messages.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `clara-slot-message clara-slot-message-${message.type}`;
        
        const emotionIcon = this.getEmotionIcon(message.emotion);
        const actionsHtml = message.actions ? this.renderActions(message.actions) : '';
        
        messageEl.innerHTML = `
          <div class="clara-slot-message-content">
            ${message.type === 'clara' ? `<div class="clara-slot-message-header">${emotionIcon} Clara</div>` : ''}
            <div class="clara-slot-message-text">${message.content}</div>
            <div class="clara-slot-message-time">${message.timestamp}</div>
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
          <button class="clara-slot-action-btn" style="background-color: ${config.color}" onclick="console.log('Action: ${action}')">
            ${config.icon} ${config.label}
          </button>
        `;
      }).join('');

      return `<div class="clara-slot-actions">${buttonsHtml}</div>`;
    }

    attachEventListeners() {
      const input = this.slot.querySelector('.clara-slot-input');
      const button = this.slot.querySelector('.clara-slot-send-btn');

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
      // Slot-spezifisches Styling - respektiert Clara360 UI
      this.slot.innerHTML = `
        <style>
          .clara-slot-container {
            width: 100%;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            margin: 1rem 0;
          }
          .clara-slot-header {
            background: linear-gradient(135deg, #8B5CF6, #3B82F6);
            color: white;
            padding: 0.75rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .clara-slot-header h3 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .clara-slot-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
          }
          .clara-slot-messages {
            height: 300px;
            overflow-y: auto;
            padding: 1rem;
            background: #f9fafb;
          }
          .clara-slot-message {
            margin-bottom: 0.75rem;
            display: flex;
          }
          .clara-slot-message-user {
            justify-content: flex-end;
          }
          .clara-slot-message-clara {
            justify-content: flex-start;
          }
          .clara-slot-message-content {
            max-width: 80%;
            padding: 0.5rem 0.75rem;
            border-radius: 8px;
            background: white;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          .clara-slot-message-user .clara-slot-message-content {
            background: #3B82F6;
            color: white;
          }
          .clara-slot-message-header {
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
          .clara-slot-message-text {
            font-size: 0.875rem;
            line-height: 1.4;
          }
          .clara-slot-message-time {
            font-size: 0.75rem;
            opacity: 0.7;
            margin-top: 0.25rem;
          }
          .clara-slot-actions {
            margin-top: 0.5rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
          }
          .clara-slot-action-btn {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border: none;
            border-radius: 4px;
            color: white;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .clara-slot-action-btn:hover {
            opacity: 0.8;
          }
          .clara-slot-input-area {
            border-top: 1px solid #e5e7eb;
            padding: 0.75rem 1rem;
            background: white;
          }
          .clara-slot-input-container {
            display: flex;
            gap: 0.5rem;
          }
          .clara-slot-input {
            flex: 1;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            transition: border-color 0.2s;
          }
          .clara-slot-input:focus {
            border-color: #8B5CF6;
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
          }
          .clara-slot-send-btn {
            background: #8B5CF6;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .clara-slot-send-btn:hover:not(:disabled) {
            background: #7C3AED;
          }
          .clara-slot-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .clara-slot-status {
            background: #f9fafb;
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
        </style>
        
        <div class="clara-slot-container" data-source="fusion">
          <div class="clara-slot-header">
            <h3>
              <span>🤖 Clara KI-Chat</span>
            </h3>
            <span class="clara-slot-badge">Fusion Engine</span>
          </div>
          
          <div class="clara-slot-messages"></div>
          
          <div class="clara-slot-input-area">
            <div class="clara-slot-input-container">
              <input 
                type="text" 
                class="clara-slot-input" 
                placeholder="Fragen Sie Clara nach Rückständen, Cashflow, Wartung..."
              />
              <button class="clara-slot-send-btn">Senden</button>
            </div>
          </div>
          
          <div class="clara-slot-status">
            Status: Slot-Integration aktiv | Nachrichten: ${this.messages.length} | Engine: Fusion
          </div>
        </div>
      `;

      this.updateMessages();
    }
  }

  // Modular Slot Integration Function
  function integrateClaraSlot() {
    // KRITISCH: Nur in vorgesehenen Slot integrieren
    const slot = document.getElementById('clara-ki-slot');
    
    if (!slot) {
      console.warn('Clara Slot Integration: #clara-ki-slot nicht gefunden');
      return { 
        status: 'error', 
        message: 'Slot #clara-ki-slot nicht verfügbar',
        integration: 'failed'
      };
    }

    // Prüfe ob bereits integriert
    if (slot.hasAttribute('data-source')) {
      console.log('Clara Slot Integration: Bereits integriert');
      return { 
        status: 'skipped', 
        message: 'Bereits integriert',
        integration: 'existing'
      };
    }

    // Health Check: Clara360 UI muss vorhanden sein
    const clara360Root = document.getElementById('root');
    const clara360Sidebar = document.querySelector('[class*="sidebar"]') || 
                           document.querySelector('nav') ||
                           document.querySelector('[class*="nav"]');

    if (!clara360Root || !clara360Sidebar) {
      console.warn('Clara Slot Integration: Clara360 UI nicht vollständig geladen');
      // Warte und versuche erneut
      setTimeout(integrateClaraSlot, 2000);
      return { 
        status: 'waiting', 
        message: 'Warte auf Clara360 UI',
        integration: 'delayed'
      };
    }

    // Initialisiere Clara Slot Engine
    try {
      new ClaraSlotEngine(slot);
      return { 
        status: 'mounted', 
        slotId: 'clara-ki-slot',
        hookName: 'ClaraSlotEngine',
        message: 'Slot-Integration erfolgreich',
        integration: 'slot-based'
      };
    } catch (error) {
      console.error('Clara Slot Integration Error:', error);
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
      setTimeout(integrateClaraSlot, 3000); // Warte auf Clara360 UI
    });
  } else {
    setTimeout(integrateClaraSlot, 3000);
  }

  // Export for manual use
  window.ClaraSlotIntegration = {
    integrate: integrateClaraSlot,
    ClaraSlotEngine: ClaraSlotEngine
  };

})();

