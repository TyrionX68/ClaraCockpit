// Manifest Integration v4.1 - MetaGovernor Reaktivierung
// Lädt und rendert context_manifest.json im DOM-Panel

(function() {
    'use strict';
    
    console.log('🧭 Manifest Integration v4.1 wird geladen...');
    
    // Manifest-Daten
    let manifestData = null;
    
    // Manifest von Server laden
    async function loadManifest() {
        try {
            const response = await fetch('/system/context_manifest.json', {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            manifestData = await response.json();
            console.log('✅ Manifest geladen:', manifestData);
            return manifestData;
        } catch (error) {
            console.error('❌ Manifest-Laden fehlgeschlagen:', error);
            // Fallback-Manifest
            manifestData = {
                system_version: "ClaraSuite v4.2.1",
                timestamp: new Date().toISOString(),
                vision: "Autonome KI-Assistenz für komplexe Geschäftsprozesse",
                directives: ["Echte FinAPI-Integration", "Cache-Busting", "SSH-Standardisierung"],
                slot_state: { manifest_panel: "fallback_active" },
                governance: { metagovernor_active: true }
            };
            return manifestData;
        }
    }
    
    // DOM-Panel erstellen
    function createManifestPanel() {
        // Entferne existierendes Panel
        const existing = document.querySelector('[data-floating-manifest-panel]');
        if (existing) {
            existing.remove();
        }
        
        const panel = document.createElement('div');
        panel.setAttribute('data-floating-manifest-panel', 'true');
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #4299E1;
            border-radius: 12px;
            padding: 20px;
            color: #E2E8F0;
            font-family: 'Segoe UI', system-ui, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            overflow-y: auto;
            display: none;
            backdrop-filter: blur(10px);
        `;
        
        return panel;
    }
    
    // Panel-Inhalt rendern
    function renderManifestContent(panel, data) {
        const formatTimestamp = (ts) => {
            return new Date(ts).toLocaleString('de-DE');
        };
        
        const formatList = (items) => {
            return items.map(item => `<li style="margin: 4px 0;">${item}</li>`).join('');
        };
        
        const formatSlotState = (slots) => {
            return Object.entries(slots).map(([key, value]) => 
                `<div style="display: flex; justify-content: space-between; margin: 2px 0;">
                    <span>${key}:</span>
                    <span style="color: #4299E1; font-weight: 600;">${value}</span>
                </div>`
            ).join('');
        };
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #4299E1; font-size: 18px; font-weight: 600;">
                    📛 MetaGovernor Manifest
                </h3>
                <button id="closeManifest" style="
                    background: #E53E3E;
                    border: none;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            </div>
            
            <div style="margin-bottom: 12px;">
                <strong style="color: #4299E1;">System:</strong> ${data.system_version}<br>
                <strong style="color: #4299E1;">Aktualisiert:</strong> ${formatTimestamp(data.timestamp)}
            </div>
            
            <div style="margin-bottom: 12px;">
                <strong style="color: #4299E1;">Vision:</strong><br>
                <div style="background: rgba(66, 153, 225, 0.1); padding: 8px; border-radius: 6px; margin-top: 4px;">
                    ${data.vision}
                </div>
            </div>
            
            <div style="margin-bottom: 12px;">
                <strong style="color: #4299E1;">Aktuelle Direktiven:</strong>
                <ul style="margin: 4px 0; padding-left: 20px;">
                    ${formatList(data.directives || [])}
                </ul>
            </div>
            
            <div style="margin-bottom: 12px;">
                <strong style="color: #4299E1;">Slot-Status:</strong>
                <div style="background: rgba(66, 153, 225, 0.1); padding: 8px; border-radius: 6px; margin-top: 4px; font-family: monospace; font-size: 12px;">
                    ${formatSlotState(data.slot_state || {})}
                </div>
            </div>
            
            ${data.lessons_learned ? `
            <div style="margin-bottom: 12px;">
                <strong style="color: #4299E1;">Lessons Learned:</strong>
                <ul style="margin: 4px 0; padding-left: 20px; font-size: 12px;">
                    ${formatList(data.lessons_learned)}
                </ul>
            </div>
            ` : ''}
            
            <div style="margin-bottom: 12px;">
                <strong style="color: #4299E1;">Governance:</strong>
                <div style="background: rgba(66, 153, 225, 0.1); padding: 8px; border-radius: 6px; margin-top: 4px; font-size: 12px;">
                    MetaGovernor: ${data.governance?.metagovernor_active ? '✅ Aktiv' : '❌ Inaktiv'}<br>
                    Deployment: ${data.governance?.deployment_status || 'unknown'}<br>
                    Fallback: ${data.governance?.stable_fallback || 'nicht konfiguriert'}
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px solid #4A5568;">
                <small style="color: #A0AEC0;">
                    SlotCommit: manifest_panel_v4_reinitialized
                </small>
            </div>
        `;
        
        // Close-Button Event
        panel.querySelector('#closeManifest').addEventListener('click', () => {
            panel.style.display = 'none';
        });
    }
    
    // M-Button erstellen
    function createMButton() {
        const existing = document.querySelector('#manifestButton');
        if (existing) {
            existing.remove();
        }
        
        const button = document.createElement('button');
        button.id = 'manifestButton';
        button.textContent = 'M';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #4299E1 0%, #3182CE 100%);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(66, 153, 225, 0.4);
            z-index: 9999;
            transition: all 0.3s ease;
            font-family: 'Segoe UI', system-ui, sans-serif;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 20px rgba(66, 153, 225, 0.6)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 15px rgba(66, 153, 225, 0.4)';
        });
        
        return button;
    }
    
    // Panel anzeigen/verstecken
    function toggleManifestPanel() {
        const panel = document.querySelector('[data-floating-manifest-panel]');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    // Keyboard-Shortcut (Ctrl+Shift+M)
    function setupKeyboardShortcut() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                toggleManifestPanel();
            }
        });
    }
    
    // SlotCommit setzen
    function setSlotCommit() {
        const slotCommit = {
            manifest_rendered: true,
            manifest_source: "context_manifest.json",
            slotcommit: "manifest_panel_v4_reinitialized",
            timestamp: new Date().toISOString()
        };
        
        // In localStorage speichern
        localStorage.setItem('clara360_manifest_slotcommit', JSON.stringify(slotCommit));
        console.log('✅ SlotCommit gesetzt:', slotCommit);
    }
    
    // Hauptinitialisierung
    async function initializeManifest() {
        try {
            console.log('🚀 Initialisiere Manifest-Panel...');
            
            // Manifest laden
            const data = await loadManifest();
            
            // DOM-Elemente erstellen
            const panel = createManifestPanel();
            const button = createMButton();
            
            // Panel-Inhalt rendern
            renderManifestContent(panel, data);
            
            // Zur Seite hinzufügen
            document.body.appendChild(panel);
            document.body.appendChild(button);
            
            // Button-Event
            button.addEventListener('click', toggleManifestPanel);
            
            // Keyboard-Shortcut
            setupKeyboardShortcut();
            
            // SlotCommit setzen
            setSlotCommit();
            
            console.log('✅ Manifest-Panel v4.1 erfolgreich initialisiert');
            console.log('🎯 Verwendung: Ctrl+Shift+M oder blauer M-Button');
            
        } catch (error) {
            console.error('❌ Manifest-Initialisierung fehlgeschlagen:', error);
        }
    }
    
    // Warten auf DOM-Ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeManifest);
    } else {
        initializeManifest();
    }
    
})();

