/**
 * Clara360 WhatsApp Business Integration V3.0
 * Robuste DOM-Integration mit Observer-Pattern
 * Dezenter Button mit wa.me-Integration
 */

(function() {
    'use strict';
    
    console.log('[CLARA-WHATSAPP-V3] Initialisierung gestartet...');
    
    // Konfiguration
    const CONFIG = {
        businessNumber: '491601234567', // Placeholder - wird durch echte Nummer ersetzt
        templates: {
            'mietmahnung': 'Sehr geehrte/r {name}, Ihre Miete für {monat} ist noch offen. Bitte überweisen Sie den Betrag von {betrag}€ zeitnah. Mit freundlichen Grüßen, Pro Estate Group',
            'wartung': 'Liebe/r {name}, am {datum} findet eine Wartung in Ihrer Wohnung statt. Bitte halten Sie sich verfügbar. Vielen Dank!',
            'heizung': 'Hallo {name}, wir haben Ihre Meldung bezüglich der Heizung erhalten. Ein Techniker wird sich zeitnah bei Ihnen melden.',
            'allgemein': 'Hallo {name}, vielen Dank für Ihre Nachricht. Wir melden uns zeitnah bei Ihnen zurück.'
        },
        mieter: [
            { name: 'Herr Müller', wohnung: 'Waldhofstr. 76, Wohnung 1', telefon: '491701234567' },
            { name: 'Frau Schmidt', wohnung: 'Waldhofstr. 76, Wohnung 2', telefon: '491701234568' },
            { name: 'Familie Weber', wohnung: 'Waldhofstr. 76, Wohnung 3', telefon: '491701234569' },
            { name: 'Herr Klein', wohnung: 'Waldhofstr. 76, Wohnung 4', telefon: '491701234570' }
        ]
    };
    
    let whatsappButton = null;
    let modal = null;
    
    // Robuster DOM-Observer
    function initWhatsAppIntegration() {
        console.log('[CLARA-WHATSAPP-V3] Suche nach Button-Container...');
        
        // Mehrere Selektoren versuchen
        const selectors = [
            '.mieter-kommunikation-buttons',
            '.action-buttons',
            '.button-group',
            '[class*="button"]',
            '.btn-group'
        ];
        
        let container = null;
        
        // Versuche verschiedene Selektoren
        for (const selector of selectors) {
            container = document.querySelector(selector);
            if (container) {
                console.log(`[CLARA-WHATSAPP-V3] Container gefunden: ${selector}`);
                break;
            }
        }
        
        // Fallback: Suche nach "Neue Nachricht" Button
        if (!container) {
            const neueNachrichtBtn = Array.from(document.querySelectorAll('button')).find(btn => 
                btn.textContent.includes('Neue Nachricht') || 
                btn.textContent.includes('neue nachricht') ||
                btn.classList.contains('btn-action')
            );
            
            if (neueNachrichtBtn) {
                container = neueNachrichtBtn.parentElement;
                console.log('[CLARA-WHATSAPP-V3] Container via "Neue Nachricht" Button gefunden');
            }
        }
        
        // Letzter Fallback: Suche nach beliebigem Button-Container
        if (!container) {
            const allButtons = document.querySelectorAll('button');
            if (allButtons.length > 0) {
                container = allButtons[0].parentElement;
                console.log('[CLARA-WHATSAPP-V3] Container via ersten Button gefunden');
            }
        }
        
        if (container && !document.querySelector('.whatsapp-business-btn')) {
            createWhatsAppButton(container);
            return true;
        }
        
        return false;
    }
    
    // WhatsApp-Button erstellen
    function createWhatsAppButton(container) {
        console.log('[CLARA-WHATSAPP-V3] Erstelle WhatsApp-Button...');
        
        whatsappButton = document.createElement('button');
        whatsappButton.className = 'btn btn-success whatsapp-business-btn';
        whatsappButton.style.cssText = `
            background: #25D366;
            border: none;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            margin-left: 8px;
            cursor: pointer;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(37, 211, 102, 0.2);
        `;
        
        // WhatsApp SVG Icon
        whatsappButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            WhatsApp
        `;
        
        // Hover-Effekte
        whatsappButton.addEventListener('mouseenter', () => {
            whatsappButton.style.background = '#128C7E';
            whatsappButton.style.transform = 'translateY(-1px)';
            whatsappButton.style.boxShadow = '0 4px 8px rgba(37, 211, 102, 0.3)';
        });
        
        whatsappButton.addEventListener('mouseleave', () => {
            whatsappButton.style.background = '#25D366';
            whatsappButton.style.transform = 'translateY(0)';
            whatsappButton.style.boxShadow = '0 2px 4px rgba(37, 211, 102, 0.2)';
        });
        
        whatsappButton.addEventListener('click', openWhatsAppModal);
        
        // Button hinzufügen
        container.appendChild(whatsappButton);
        console.log('[CLARA-WHATSAPP-V3] WhatsApp-Button erfolgreich hinzugefügt!');
    }
    
    // Modal erstellen und öffnen
    function openWhatsAppModal() {
        console.log('[CLARA-WHATSAPP-V3] Öffne WhatsApp-Modal...');
        
        if (modal) {
            modal.style.display = 'flex';
            return;
        }
        
        // Modal-Container
        modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(2px);
        `;
        
        // Modal-Inhalt
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            position: relative;
        `;
        
        modalContent.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #eee;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366" style="margin-right: 12px;">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <h3 style="margin: 0; color: #333; font-size: 18px;">WhatsApp Business Nachricht</h3>
                <button onclick="this.closest('.whatsapp-modal').style.display='none'" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">&times;</button>
            </div>
            
            <form id="whatsapp-form">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">Empfänger:</label>
                    <select id="mieter-select" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
                        <option value="">Mieter auswählen...</option>
                        ${CONFIG.mieter.map(mieter => `<option value="${mieter.telefon}" data-name="${mieter.name}">${mieter.name} - ${mieter.wohnung}</option>`).join('')}
                    </select>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">Nachrichtentyp:</label>
                    <select id="template-select" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px;">
                        <option value="">Template auswählen...</option>
                        <option value="mietmahnung">Mietmahnung</option>
                        <option value="wartung">Wartungsankündigung</option>
                        <option value="heizung">Heizungsproblem</option>
                        <option value="allgemein">Allgemeine Nachricht</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500; color: #333;">Nachricht:</label>
                    <textarea id="message-text" style="width: 100%; height: 120px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; resize: vertical;" placeholder="Nachricht wird automatisch generiert..."></textarea>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button type="button" onclick="this.closest('.whatsapp-modal').style.display='none'" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; font-size: 14px;">Abbrechen</button>
                    <button type="submit" style="padding: 10px 20px; background: #25D366; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">WhatsApp öffnen</button>
                </div>
            </form>
        `;
        
        modal.className = 'whatsapp-modal';
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Event-Listener für Template-Auswahl
        const templateSelect = modal.querySelector('#template-select');
        const messageText = modal.querySelector('#message-text');
        const mieterSelect = modal.querySelector('#mieter-select');
        
        templateSelect.addEventListener('change', updateMessage);
        mieterSelect.addEventListener('change', updateMessage);
        
        function updateMessage() {
            const template = templateSelect.value;
            const selectedMieter = mieterSelect.selectedOptions[0];
            
            if (template && selectedMieter) {
                const mieterName = selectedMieter.dataset.name;
                let message = CONFIG.templates[template];
                
                // Platzhalter ersetzen
                message = message.replace('{name}', mieterName);
                message = message.replace('{monat}', new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }));
                message = message.replace('{betrag}', '850'); // Beispiel-Betrag
                message = message.replace('{datum}', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE'));
                
                messageText.value = message;
            }
        }
        
        // Form-Submit
        modal.querySelector('#whatsapp-form').addEventListener('submit', function(e) {
            e.preventDefault();
            sendWhatsAppMessage();
        });
        
        // Modal schließen bei Klick außerhalb
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // WhatsApp-Nachricht senden
    function sendWhatsAppMessage() {
        const mieterSelect = modal.querySelector('#mieter-select');
        const messageText = modal.querySelector('#message-text');
        
        const telefon = mieterSelect.value;
        const message = messageText.value;
        
        if (!telefon || !message) {
            alert('Bitte wählen Sie einen Empfänger und geben Sie eine Nachricht ein.');
            return;
        }
        
        // wa.me URL erstellen
        const waUrl = `https://wa.me/${telefon}?text=${encodeURIComponent(message)}`;
        
        console.log('[CLARA-WHATSAPP-V3] Öffne WhatsApp:', waUrl);
        
        // WhatsApp öffnen
        window.open(waUrl, '_blank');
        
        // Modal schließen
        modal.style.display = 'none';
        
        // Erfolgs-Feedback
        showSuccessMessage();
    }
    
    // Erfolgs-Nachricht anzeigen
    function showSuccessMessage() {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #25D366;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10001;
            font-size: 14px;
            font-weight: 500;
        `;
        toast.textContent = 'WhatsApp wird geöffnet...';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // Initialisierung mit Observer
    function startObserver() {
        console.log('[CLARA-WHATSAPP-V3] Starte DOM-Observer...');
        
        // Sofortiger Versuch
        if (initWhatsAppIntegration()) {
            return;
        }
        
        // Observer für dynamische Inhalte
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    shouldCheck = true;
                }
            });
            
            if (shouldCheck && initWhatsAppIntegration()) {
                observer.disconnect();
                console.log('[CLARA-WHATSAPP-V3] Observer beendet - Button erfolgreich hinzugefügt');
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Timeout nach 10 Sekunden
        setTimeout(() => {
            observer.disconnect();
            console.log('[CLARA-WHATSAPP-V3] Observer-Timeout erreicht');
        }, 10000);
    }
    
    // Prüfe ob Mieter-Kommunikation Seite
    function isMieterKommunikationPage() {
        return window.location.pathname.includes('mieter-kommunikation') || 
               document.title.includes('Mieter') ||
               document.querySelector('[class*="mieter"]') ||
               document.querySelector('[class*="kommunikation"]');
    }
    
    // Hauptinitialisierung
    function init() {
        console.log('[CLARA-WHATSAPP-V3] Initialisierung...');
        
        if (!isMieterKommunikationPage()) {
            console.log('[CLARA-WHATSAPP-V3] Nicht auf Mieter-Kommunikation Seite - beende');
            return;
        }
        
        console.log('[CLARA-WHATSAPP-V3] Mieter-Kommunikation Seite erkannt');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', startObserver);
        } else {
            startObserver();
        }
    }
    
    // Start
    init();
    
})();

