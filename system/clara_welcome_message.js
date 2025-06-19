/**
 * Clara360 Welcome Message Integration
 * Fügt einen kleinen Begrüßungstext auf der Clara KI Chat Seite hinzu
 * Nur auf /clara-ki aktiv, keine exemplarischen Unterhaltungen
 */

(function() {
    'use strict';
    
    // Nur auf Clara KI-Seite aktivieren
    function isOnClaraKIPage() {
        return window.location.pathname === '/clara-ki' || 
               window.location.pathname === '/clara' ||
               window.location.hash === '#clara-ki' ||
               document.title.includes('Clara KI') ||
               document.querySelector('[data-page="clara-ki"]') ||
               document.querySelector('.clara-ki-page');
    }
    
    // Begrüßungstext hinzufügen
    function addWelcomeMessage() {
        if (!isOnClaraKIPage()) {
            console.log('🚫 Clara Welcome Message: Nicht auf Clara KI-Seite, überspringe');
            return;
        }
        
        // Prüfe ob bereits vorhanden
        if (document.querySelector('#clara-welcome-message')) {
            console.log('✅ Clara Welcome Message: Bereits vorhanden');
            return;
        }
        
        // Suche nach Chat-Container oder ähnlichen Elementen
        const possibleContainers = [
            '#clara-chat-container',
            '.clara-chat',
            '.chat-container',
            '[class*="chat"]',
            '[class*="clara"]',
            '.main-content',
            '#root > div',
            'main'
        ];
        
        let targetContainer = null;
        for (const selector of possibleContainers) {
            targetContainer = document.querySelector(selector);
            if (targetContainer) {
                console.log(`✅ Clara Welcome Message: Container gefunden: ${selector}`);
                break;
            }
        }
        
        // Fallback: Füge zum body hinzu
        if (!targetContainer) {
            targetContainer = document.body;
            console.log('⚠️ Clara Welcome Message: Fallback zu body');
        }
        
        // Erstelle Begrüßungstext
        const welcomeDiv = document.createElement('div');
        welcomeDiv.id = 'clara-welcome-message';
        welcomeDiv.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                border: 1px solid #cbd5e0;
                border-radius: 12px;
                padding: 20px;
                margin: 16px 0;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                font-family: system-ui, -apple-system, sans-serif;
                max-width: 600px;
                margin-left: auto;
                margin-right: auto;
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    margin-bottom: 12px;
                ">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 12px;
                        box-shadow: 0 2px 4px rgba(66, 153, 225, 0.3);
                    ">
                        <span style="color: white; font-size: 18px; font-weight: bold;">🤖</span>
                    </div>
                    <h3 style="
                        margin: 0;
                        color: #2d3748;
                        font-size: 18px;
                        font-weight: 600;
                    ">Willkommen bei Clara KI</h3>
                </div>
                <p style="
                    margin: 0;
                    color: #4a5568;
                    font-size: 14px;
                    line-height: 1.5;
                ">
                    Hallo! Ich bin Clara, Ihr intelligenter KI-Assistent für die Hausverwaltung. 
                    Ich helfe Ihnen bei Fragen zu Mieten, Rückständen, Wartung und Finanzen. 
                    Stellen Sie mir einfach eine Frage!
                </p>
            </div>
        `;
        
        // Füge am Anfang des Containers hinzu
        if (targetContainer.firstChild) {
            targetContainer.insertBefore(welcomeDiv, targetContainer.firstChild);
        } else {
            targetContainer.appendChild(welcomeDiv);
        }
        
        console.log('✅ Clara Welcome Message: Begrüßungstext hinzugefügt');
    }
    
    // Initialisierung
    function initWelcomeMessage() {
        // Warte auf React-App-Ladung
        setTimeout(() => {
            addWelcomeMessage();
        }, 2500);
        
        // Zusätzliche Versuche für robuste Integration
        setTimeout(() => {
            addWelcomeMessage();
        }, 5000);
        
        // Bei Seitenwechsel erneut prüfen
        let lastPath = window.location.pathname;
        setInterval(() => {
            if (window.location.pathname !== lastPath) {
                lastPath = window.location.pathname;
                setTimeout(() => {
                    addWelcomeMessage();
                }, 1000);
            }
        }, 1000);
    }
    
    // Starte nach DOM-Ladung
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWelcomeMessage);
    } else {
        initWelcomeMessage();
    }
    
    console.log('🎯 Clara Welcome Message: Script geladen');
})();
