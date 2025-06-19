// Manifest Integration v4.2 - MetaGovernor Reaktivierung mit Cache-Busting
// Lädt und rendert context_manifest.json im DOM-Panel
(function() {
    'use strict';
    
    console.log('🧭 Manifest Integration v4.2 wird geladen - CACHE-BUSTING AKTIV...');
    
    // Manifest-Daten
    let manifestData = null;
    
    // Cache-Busting Timestamp
    const cacheBuster = Date.now();
    
    // Manifest von Server laden mit Cache-Busting
    async function loadManifest() {
        try {
            const response = await fetch(`/system/context_manifest.json?v=${cacheBuster}`, {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            manifestData = await response.json();
            console.log('✅ Manifest erfolgreich geladen:', manifestData.system_version);
            return manifestData;
        } catch (error) {
            console.error('❌ Fehler beim Laden des Manifests:', error);
            return null;
        }
    }
    
    // DOM-Panel erstellen und rendern
    function createManifestPanel() {
        // Entferne existierendes Panel
        const existingPanel = document.getElementById('clara-manifest-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // Erstelle Panel-Container
        const panel = document.createElement('div');
        panel.id = 'clara-manifest-panel';
        panel.setAttribute('data-floating-manifest-panel', 'true');
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 400px;
            max-height: 80vh;
            background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
            border: 2px solid #4299E1;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
            overflow: hidden;
            transform: translateX(420px);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        if (manifestData) {
            panel.innerHTML = `
                <div style="padding: 20px; border-bottom: 1px solid #4a5568;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="margin: 0; color: #4299E1; font-size: 18px; font-weight: 700;">📋 System Manifest</h3>
                        <button id="manifest-close" style="background: none; border: none; color: #a0aec0; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px;">×</button>
                    </div>
                    <div style="font-size: 14px; color: #e2e8f0;">
                        <strong>${manifestData.system_version}</strong><br>
                        <small style="color: #a0aec0;">${new Date(manifestData.timestamp).toLocaleString('de-DE')}</small>
                    </div>
                </div>
                
                <div style="padding: 20px; max-height: 60vh; overflow-y: auto;">
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #4299E1; margin-bottom: 10px; font-size: 14px; font-weight: 600;">🎯 Vision</h4>
                        <p style="font-size: 13px; line-height: 1.4; color: #e2e8f0; margin: 0;">${manifestData.vision}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #4299E1; margin-bottom: 10px; font-size: 14px; font-weight: 600;">📋 Aktuelle Direktiven</h4>
                        <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #e2e8f0;">
                            ${manifestData.directives.map(directive => `<li style="margin-bottom: 6px;">${directive}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #4299E1; margin-bottom: 10px; font-size: 14px; font-weight: 600;">💡 Lessons Learned</h4>
                        <ul style="margin: 0; padding-left: 16px; font-size: 12px; color: #e2e8f0;">
                            ${manifestData.lessons_learned.map(lesson => `<li style="margin-bottom: 6px;">${lesson}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #4299E1; margin-bottom: 10px; font-size: 14px; font-weight: 600;">⚙️ Slot State</h4>
                        <div style="font-size: 12px;">
                            ${Object.entries(manifestData.slot_state).map(([key, value]) => 
                                `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px 8px; background: rgba(66, 153, 225, 0.1); border-radius: 4px;">
                                    <span style="color: #a0aec0;">${key}:</span>
                                    <span style="color: #68d391; font-weight: 500;">${value}</span>
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #4299E1; margin-bottom: 10px; font-size: 14px; font-weight: 600;">🔧 Aktive Komponenten</h4>
                        <div style="font-size: 12px;">
                            ${manifestData.active_components.map(component => 
                                `<div style="background: rgba(72, 187, 120, 0.1); padding: 4px 8px; margin-bottom: 4px; border-radius: 4px; color: #68d391;">
                                    ✅ ${component}
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                    
                    ${manifestData.api_endpoints ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #4299E1; margin-bottom: 10px; font-size: 14px; font-weight: 600;">🌐 API Endpoints</h4>
                        <div style="font-size: 11px;">
                            ${Object.entries(manifestData.api_endpoints).map(([key, url]) => 
                                `<div style="margin-bottom: 4px; padding: 4px 8px; background: rgba(66, 153, 225, 0.1); border-radius: 4px;">
                                    <span style="color: #a0aec0;">${key}:</span><br>
                                    <a href="${url}" target="_blank" style="color: #4299E1; text-decoration: none; word-break: break-all;">${url}</a>
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #4299E1; margin-bottom: 10px; font-size: 14px; font-weight: 600;">🏛️ Governance</h4>
                        <div style="font-size: 12px;">
                            ${Object.entries(manifestData.governance).map(([key, value]) => 
                                `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding: 4px 8px; background: rgba(66, 153, 225, 0.1); border-radius: 4px;">
                                    <span style="color: #a0aec0;">${key}:</span>
                                    <span style="color: #e2e8f0; font-weight: 500;">${value}</span>
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div style="padding: 15px 20px; border-top: 1px solid #4a5568; background: rgba(66, 153, 225, 0.1);">
                    <div style="font-size: 11px; color: #a0aec0; text-align: center;">
                        SlotCommit: manifest_panel_v4.2_reinitialized<br>
                        Cache-Buster: ${cacheBuster}
                    </div>
                </div>
            `;
        } else {
            panel.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h3 style="color: #f56565; margin-bottom: 10px;">❌ Manifest Fehler</h3>
                    <p style="color: #e2e8f0; font-size: 14px;">Manifest konnte nicht geladen werden.</p>
                    <button id="manifest-reload" style="background: #4299E1; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 10px;">Neu laden</button>
                </div>
            `;
        }
        
        document.body.appendChild(panel);
        
        // Event Listeners
        const closeBtn = panel.querySelector('#manifest-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideManifestPanel);
        }
        
        const reloadBtn = panel.querySelector('#manifest-reload');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', async () => {
                await loadManifest();
                createManifestPanel();
            });
        }
        
        console.log('✅ Manifest-Panel erstellt');
    }
    
    // Panel anzeigen
    function showManifestPanel() {
        const panel = document.getElementById('clara-manifest-panel');
        if (panel) {
            panel.style.transform = 'translateX(0)';
        }
    }
    
    // Panel verstecken
    function hideManifestPanel() {
        const panel = document.getElementById('clara-manifest-panel');
        if (panel) {
            panel.style.transform = 'translateX(420px)';
        }
    }
    
    // Toggle Panel
    function toggleManifestPanel() {
        const panel = document.getElementById('clara-manifest-panel');
        if (panel) {
            const isVisible = panel.style.transform === 'translateX(0px)';
            if (isVisible) {
                hideManifestPanel();
            } else {
                showManifestPanel();
            }
        }
    }
    
    // M-Button erstellen
    function createManifestButton() {
        // Entferne existierenden Button
        const existingBtn = document.getElementById('clara-manifest-btn');
        if (existingBtn) {
            existingBtn.remove();
        }
        
        const button = document.createElement('button');
        button.id = 'clara-manifest-btn';
        button.innerHTML = 'M';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #4299E1, #3182ce);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            z-index: 9998;
            box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
            transition: all 0.3s ease;
        `;
        
        button.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 6px 20px rgba(66, 153, 225, 0.6)';
        });
        
        button.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 12px rgba(66, 153, 225, 0.4)';
        });
        
        button.addEventListener('click', toggleManifestPanel);
        
        document.body.appendChild(button);
        console.log('✅ Manifest M-Button erstellt');
    }
    
    // Keyboard Shortcut (Ctrl+Shift+M)
    function setupKeyboardShortcut() {
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                toggleManifestPanel();
            }
        });
        console.log('✅ Keyboard Shortcut (Ctrl+Shift+M) aktiviert');
    }
    
    // Initialisierung
    async function initManifest() {
        console.log('🚀 Initialisiere Manifest Integration v4.2...');
        
        // Manifest laden
        await loadManifest();
        
        // UI erstellen
        createManifestPanel();
        createManifestButton();
        setupKeyboardShortcut();
        
        console.log('✅ Manifest Integration v4.2 vollständig geladen');
    }
    
    // Auto-Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initManifest);
    } else {
        initManifest();
    }
    
})();

