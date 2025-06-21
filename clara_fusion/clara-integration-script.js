// clara-integration-script.js - Standalone script for clara360.de integration
(function() {
  'use strict';

  // Clara Integrated Engine - Standalone version
  class ClaraIntegratedEngine {
    constructor(container) {
      this.container = container;
      this.messages = [
        {
          id: 1,
          type: 'clara',
          content: 'Hallo! Ich bin Clara, Ihre erweiterte KI-Assistentin für die Hausverwaltung. Wie kann ich Ihnen helfen?',
          timestamp: new Date().toLocaleTimeString(),
          emotion: 'friendly'
        }
      ];
      this.isProcessing = false;
      this.init();
    }

    init() {
      this.render();
      this.attachEventListeners();
      console.log('ClaraFusionEngine mounted in #clara-ki-slot');
    }

    generateResponse(input) {
      const responses = {
        'rückstände': {
          content: 'Ich analysiere die aktuellen Rückstände für die Waldhofstraße 76. Basierend auf den Daten zeigen sich folgende kritische Punkte: Wohnung 3A (450€), Wohnung 7B (280€). Soll ich eine WhatsApp-Nachricht für die Mahnung erstellen?',
          emotion: 'concerned',
          actions: ['whatsapp', 'document']
        },
        'cashflow': {
          content: 'Der aktuelle Cashflow für die Waldhofstraße 76 zeigt: Einnahmen 8.360€/Monat, Ausgaben 2.180€/Monat. Netto-Cashflow: +6.180€. Die Rendite liegt bei 8,4% - ein exzellentes Ergebnis!',
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
        content: `Ich verstehe Ihre Anfrage zu "${input}". Als erweiterte KI-Assistentin für die Hausverwaltung kann ich Ihnen bei Rückständen, Cashflow-Analysen, Wartungsplanung und Dokumentenerstellung helfen. Was möchten Sie genauer wissen?`,
        emotion: 'helpful',
        actions: ['help']
      };
    }

    addMessage(message) {
      this.messages.push(message);
      this.updateMessages();
    }

    handleSendMessage() {
      const input = this.container.querySelector('.clara-input');
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
      const button = this.container.querySelector('.clara-send-btn');
      const input = this.container.querySelector('.clara-input');
      
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
      const messagesContainer = this.container.querySelector('.clara-messages');
      messagesContainer.innerHTML = '';

      this.messages.forEach(message => {
        const messageEl = document.createElement('div');
        messageEl.className = `clara-message clara-message-${message.type}`;
        
        const emotionIcon = this.getEmotionIcon(message.emotion);
        const actionsHtml = message.actions ? this.renderActions(message.actions) : '';
        
        messageEl.innerHTML = `
          <div class="clara-message-content">
            ${message.type === 'clara' ? `<div class="clara-message-header">${emotionIcon} Clara</div>` : ''}
            <div class="clara-message-text">${message.content}</div>
            <div class="clara-message-time">${message.timestamp}</div>
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
          <button class="clara-action-btn" style="background-color: ${config.color}" onclick="console.log('Action: ${action}')">
            ${config.icon} ${config.label}
          </button>
        `;
      }).join('');

      return `<div class="clara-actions">${buttonsHtml}</div>`;
    }

    attachEventListeners() {
      const input = this.container.querySelector('.clara-input');
      const button = this.container.querySelector('.clara-send-btn');

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
      this.container.innerHTML = `
        <style>
          .clara-integrated-engine {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .clara-header {
            background: linear-gradient(135deg, #8B5CF6, #3B82F6);
            color: white;
            padding: 1rem;
          }
          .clara-header h3 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .clara-header p {
            margin: 0.25rem 0 0 0;
            font-size: 0.875rem;
            opacity: 0.9;
          }
          .clara-badge {
            background: rgba(255, 255, 255, 0.2);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
          }
          .clara-messages {
            height: 400px;
            overflow-y: auto;
            padding: 1rem;
            background: #f9fafb;
          }
          .clara-message {
            margin-bottom: 1rem;
            display: flex;
          }
          .clara-message-user {
            justify-content: flex-end;
          }
          .clara-message-clara {
            justify-content: flex-start;
          }
          .clara-message-content {
            max-width: 70%;
            padding: 0.75rem;
            border-radius: 12px;
            background: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .clara-message-user .clara-message-content {
            background: #3B82F6;
            color: white;
          }
          .clara-message-header {
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
          .clara-message-text {
            font-size: 0.875rem;
            line-height: 1.4;
          }
          .clara-message-time {
            font-size: 0.75rem;
            opacity: 0.7;
            margin-top: 0.25rem;
          }
          .clara-actions {
            margin-top: 0.5rem;
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
          }
          .clara-action-btn {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .clara-action-btn:hover {
            opacity: 0.8;
          }
          .clara-input-area {
            border-top: 1px solid #e5e7eb;
            padding: 1rem;
            background: white;
          }
          .clara-input-container {
            display: flex;
            gap: 0.5rem;
          }
          .clara-input {
            flex: 1;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            transition: border-color 0.2s;
          }
          .clara-input:focus {
            border-color: #8B5CF6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          }
          .clara-send-btn {
            background: #8B5CF6;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .clara-send-btn:hover:not(:disabled) {
            background: #7C3AED;
          }
          .clara-send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .clara-status {
            background: #f9fafb;
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
        </style>
        
        <div class="clara-integrated-engine">
          <div class="clara-header">
            <h3>
              <span>🤖 Clara KI-Chat</span>
              <span class="clara-badge">Fusion Engine</span>
            </h3>
            <p>Erweiterte Hausverwaltungs-Assistentin</p>
          </div>
          
          <div class="clara-messages"></div>
          
          <div class="clara-input-area">
            <div class="clara-input-container">
              <input 
                type="text" 
                class="clara-input" 
                placeholder="Fragen Sie Clara nach Rückständen, Cashflow, Wartung..."
              />
              <button class="clara-send-btn">Senden</button>
            </div>
          </div>
          
          <div class="clara-status">
            Status: Integriert in #clara-ki-slot | Nachrichten: ${this.messages.length} | Engine: Aktiv
          </div>
        </div>
      `;

      this.updateMessages();
    }
  }

  // Integration function
  function integrateClaraFusion() {
    // Find or create integration slot
    let slot = document.getElementById('clara-ki-slot');
    
    if (!slot) {
      // Find existing chat area and replace/enhance it
      const existingChat = document.querySelector('[class*="chat"]') || 
                          document.querySelector('input[placeholder*="Clara"]')?.closest('div');
      
      if (existingChat) {
        slot = document.createElement('div');
        slot.id = 'clara-ki-slot';
        slot.className = 'clara-slot-manageable';
        existingChat.parentNode.insertBefore(slot, existingChat);
        existingChat.style.display = 'none'; // Hide original
      } else {
        // Create in main content area
        const main = document.querySelector('main') || document.body;
        slot = document.createElement('div');
        slot.id = 'clara-ki-slot';
        slot.className = 'clara-slot-manageable';
        slot.style.cssText = 'margin: 1rem; padding: 1rem;';
        main.appendChild(slot);
      }
    }

    // Initialize Clara engine
    if (slot) {
      new ClaraIntegratedEngine(slot);
      return { 
        status: 'mounted', 
        slotId: 'clara-ki-slot',
        hookName: 'ClaraFusionMount',
        message: 'Integration successful'
      };
    } else {
      return { status: 'error', message: 'Could not create integration slot' };
    }
  }

  // Auto-integrate when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', integrateClaraFusion);
  } else {
    setTimeout(integrateClaraFusion, 1000);
  }

  // Export for manual use
  window.ClaraFusionIntegration = {
    integrate: integrateClaraFusion,
    ClaraIntegratedEngine: ClaraIntegratedEngine
  };

})();

