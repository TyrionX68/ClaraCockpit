// Clara360 Manifest Integration - Echtes JSON-basiertes Panel
(function() {
    'use strict';
    
    console.log('[MANIFEST] Clara360 Echtes Manifest-System wird geladen...');
    
    function waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }
    
    function isMetaGovernor() {
        // Prüfe auf MetaGovernor-Berechtigung
        if (window.currentUser && window.currentUser.email === "hiss@clara360.de") {
            return true;
        }
        
        // Fallback: Prüfe localStorage oder andere Authentifizierungsmethoden
        const userEmail = localStorage.getItem('userEmail') || 
                         sessionStorage.getItem('userEmail') ||
                         getCookie('userEmail');
        
        if (userEmail === "hiss@clara360.de") {
            return true;
        }
        
        // Zusätzliche Prüfung: Ist der Benutzer als MetaGovernor eingeloggt?
        const userRole = localStorage.getItem('userRole') || 
                        sessionStorage.getItem('userRole') ||
                        getCookie('userRole');
        
        return userRole === "metaGovernor";
    }
    
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
    
    function createFloatingManifestButton() {
        if (!isMetaGovernor()) {
            console.log('[MANIFEST] Nicht MetaGovernor - Button wird nicht erstellt');
            return;
        }
        
        const existing = document.querySelector('[data-floating-manifest]');
        if (existing) {
            console.log('[MANIFEST] Button bereits vorhanden');
            return;
        }
        
        const floatingButton = document.createElement('div');
        floatingButton.innerHTML = 'M';
        floatingButton.setAttribute('data-floating-manifest', 'true');
        floatingButton.className = 'clara-theme-panel';
        floatingButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #4299E1;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            transition: all 0.3s ease;
            user-select: none;
            font-family: Arial, sans-serif;
        `;
        
        floatingButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
        });
        
        floatingButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        });
        
        floatingButton.addEventListener('click', function() {
            openManifestPanel();
        });
        
        floatingButton.title = 'Clara360 Systemmanifest (MetaGovernor)';
        document.body.appendChild(floatingButton);
        console.log('[MANIFEST] Floating Manifest-Button erfolgreich erstellt!');
    }
    
    function openManifestPanel() {
        if (!isMetaGovernor()) {
            console.log('[MANIFEST] Zugriff verweigert - Nicht MetaGovernor');
            return;
        }
        
        const existing = document.getElementById('manifestPanel');
        if (existing) existing.remove();
        
        // Lade das echte Manifest aus der JSON-Datei
        fetch('/system/context_manifest.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const manifestContent = createManifestHTML(data);
                document.body.insertAdjacentHTML('beforeend', manifestContent);
                console.log('[MANIFEST] Echtes Manifest-Panel erfolgreich geladen');
            })
            .catch(error => {
                console.error('[MANIFEST] Fehler beim Laden des Manifests:', error);
                const errorContent = createErrorHTML(error.message);
                document.body.insertAdjacentHTML('beforeend', errorContent);
            });
    }
    
    function createManifestHTML(data) {
        return `
            <div id="manifestPanel" class="clara-theme-panel" style="
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100%; 
                height: 100%; 
                background: rgba(0,0,0,0.8); 
                z-index: 2000; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                font-family: Arial, sans-serif;
            ">
                <div style="
                    background: white; 
                    padding: 24px; 
                    border-radius: 12px; 
                    width: 90vw; 
                    max-width: 900px; 
                    max-height: 80vh; 
                    overflow-y: auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="margin: 0; color: #1F2937; font-size: 24px;">🧭 Clara360 Systemmanifest</h2>
                        <button onclick="document.getElementById('manifestPanel').remove()" style="
                            background: #EF4444; 
                            color: white; 
                            border: none; 
                            padding: 8px 16px; 
                            border-radius: 6px; 
                            cursor: pointer; 
                            font-weight: bold;
                        ">✕ Schließen</button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <p><strong>Version:</strong> ${data.system_version}</p>
                            <p><strong>Zuletzt aktualisiert:</strong> ${new Date(data.timestamp).toLocaleString('de-DE')}</p>
                            <p><strong>Aktualisiert von:</strong> ${data.last_updated_by}</p>
                        </div>
                        <div>
                            <p><strong>System-Bereitschaft:</strong> ${data.performance_metrics.system_readiness}</p>
                            <p><strong>Enterprise-Bereitschaft:</strong> ${data.performance_metrics.enterprise_readiness}</p>
                            <p><strong>Komponenten aktiv:</strong> ${data.component_inventory.activated}/${data.component_inventory.total_components}</p>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #4299E1; margin-bottom: 10px;">🎯 Vision & MetaGovernor-Direktiven</h3>
                        <div style="background: #F0F9FF; padding: 12px; border-radius: 6px; border-left: 4px solid #4299E1; margin-bottom: 10px;">
                            <strong>Zielbild:</strong> ${data.vision.zielbild}
                        </div>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${data.metaGovernor_directives.map(directive => `<li>${directive}</li>`).join('')}
                        </ul>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #DC2626; margin-bottom: 10px;">⚠️ Bekannte Probleme</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${data.known_issues.map(issue => `<li style="color: #DC2626;">${issue}</li>`).join('')}
                        </ul>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #059669; margin-bottom: 10px;">🚀 Nächste Schritte für neue Manus-Einheiten</h3>
                        <ol style="margin: 0; padding-left: 20px;">
                            ${data.next_steps_for_new_manus.map(step => `<li style="margin-bottom: 5px;">${step}</li>`).join('')}
                        </ol>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #7C2D12; margin-bottom: 10px;">🧠 Lessons Learned</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${data.lessons_learned.map(lesson => `<li style="color: #7C2D12;">💡 ${lesson}</li>`).join('')}
                        </ul>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #6B21A8; margin-bottom: 10px;">⌨️ Keyboard Shortcuts</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                            <div>
                                <strong>Enterprise Wave 1:</strong><br>
                                ${Object.entries(data.keyboard_shortcuts.enterprise_wave1).map(([key, desc]) => 
                                    `<small>${key}: ${desc}</small><br>`
                                ).join('')}
                            </div>
                            <div>
                                <strong>KI Wave 2:</strong><br>
                                ${Object.entries(data.keyboard_shortcuts.ki_wave2).map(([key, desc]) => 
                                    `<small>${key}: ${desc}</small><br>`
                                ).join('')}
                            </div>
                            <div>
                                <strong>Business Features:</strong><br>
                                ${Object.entries(data.keyboard_shortcuts.business_features).map(([key, desc]) => 
                                    `<small>${key}: ${desc}</small><br>`
                                ).join('')}
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #1F2937; margin-bottom: 10px;">📊 Wave Status</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
                            ${Object.entries(data.wave_status).map(([wave, info]) => `
                                <div style="
                                    padding: 10px; 
                                    border-radius: 6px; 
                                    background: ${info.status === 'completed' ? '#F0FDF4' : '#FEF3C7'}; 
                                    border-left: 4px solid ${info.status === 'completed' ? '#22C55E' : '#F59E0B'};
                                ">
                                    <strong>${wave.replace(/_/g, ' ').toUpperCase()}</strong><br>
                                    <small>Status: ${info.status === 'completed' ? '✅ Abgeschlossen' : '⏳ Ausstehend'}</small><br>
                                    ${info.completion_date ? `<small>Datum: ${info.completion_date}</small>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #1F2937; margin-bottom: 10px;">📈 Letzte Commits</h3>
                        <div style="background: #F9FAFB; padding: 12px; border-radius: 6px; max-height: 150px; overflow-y: auto;">
                            ${data.last_commits.map(commit => `<div style="margin-bottom: 5px; font-family: monospace; font-size: 12px;">${commit}</div>`).join('')}
                        </div>
                    </div>

                    <div style="background: #FEF3C7; padding: 12px; border-radius: 6px; border-left: 4px solid #F59E0B;">
                        <strong>🔐 Zugriff:</strong> Dieses Manifest ist nur für MetaGovernor (${data.system_credentials.access_control.authorized_users.join(', ')}) sichtbar.
                    </div>
                </div>
            </div>
        `;
    }
    
    function createErrorHTML(errorMessage) {
        return `
            <div id="manifestPanel" class="clara-theme-panel" style="
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100%; 
                height: 100%; 
                background: rgba(0,0,0,0.8); 
                z-index: 2000; 
                display: flex; 
                align-items: center; 
                justify-content: center;
                font-family: Arial, sans-serif;
            ">
                <div style="
                    background: white; 
                    padding: 24px; 
                    border-radius: 12px; 
                    width: 90vw; 
                    max-width: 500px; 
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                ">
                    <h2 style="color: #DC2626; margin-bottom: 16px;">❌ Manifest-Fehler</h2>
                    <p style="margin-bottom: 16px;">Das Systemmanifest konnte nicht geladen werden:</p>
                    <div style="background: #FEF2F2; padding: 12px; border-radius: 6px; border-left: 4px solid #DC2626; margin-bottom: 16px;">
                        <code style="color: #DC2626;">${errorMessage}</code>
                    </div>
                    <p style="font-size: 14px; color: #6B7280; margin-bottom: 16px;">
                        Bitte prüfen Sie die Netzwerkverbindung und versuchen Sie es erneut.
                    </p>
                    <button onclick="document.getElementById('manifestPanel').remove()" style="
                        background: #EF4444; 
                        color: white; 
                        border: none; 
                        padding: 12px 20px; 
                        border-radius: 6px; 
                        cursor: pointer; 
                        font-weight: bold;
                    ">Schließen</button>
                </div>
            </div>
        `;
    }
    
    function initializeManifestSystem() {
        console.log('[MANIFEST] Initialisiere echtes Manifest-System...');
        
        // Keyboard Shortcut für Manifest-Panel (Ctrl+Shift+M)
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                if (isMetaGovernor()) {
                    openManifestPanel();
                } else {
                    console.log('[MANIFEST] Keyboard Shortcut - Zugriff verweigert');
                }
            }
        });
        
        setTimeout(() => {
            createFloatingManifestButton();
            console.log('[MANIFEST] Echtes Manifest-System vollständig geladen');
        }, 3000);
    }
    
    // Starte System
    waitForDOM(initializeManifestSystem);
    
})();

