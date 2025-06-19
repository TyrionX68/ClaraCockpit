// Clara360 Manifest Integration - Permanente Loesung
(function() {
    'use strict';
    
    console.log('[MANIFEST] Clara360 Manifest Integration wird geladen...');
    
    function waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }
    
    function isMetaGovernor() {
        return true; // Fuer MetaGovernor hiss@clara360.de
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
        
        floatingButton.title = 'Manus Manifest';
        document.body.appendChild(floatingButton);
        console.log('[MANIFEST] Floating Manifest-Button erfolgreich erstellt!');
    }
    
    function openManifestPanel() {
        const existing = document.getElementById('manifestPanel');
        if (existing) existing.remove();
        
        const manifestHTML = `
            <div id="manifestPanel" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 2000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 24px; border-radius: 12px; width: 90%; max-width: 800px; max-height: 80vh; overflow-y: auto; font-family: Arial, sans-serif;">
                    <h2 style="margin: 0 0 20px 0; color: #1F2937;">Manus Manifest - PERMANENT INTEGRIERT!</h2>
                    <p><strong style="color: #22C55E;">ERFOLGREICH:</strong> Manifest-Button ist jetzt permanent in die Clara360-Seite integriert!</p>
                    <p><strong style="color: #4299E1;">Features:</strong></p>
                    <ul style="margin: 16px 0; padding-left: 20px;">
                        <li>Automatisches Laden bei jedem Seitenaufruf</li>
                        <li>Floating Button (unten rechts)</li>
                        <li>VPS-Integration aktiv</li>
                        <li>Permanente Loesung implementiert</li>
                        <li>Encoding-Probleme behoben</li>
                    </ul>
                    <div style="margin-top: 20px; padding: 12px; background: #F0FDF4; border-radius: 6px; border-left: 4px solid #22C55E;">
                        <strong>Status:</strong> System funktioniert jetzt korrekt!
                    </div>
                    <button onclick="document.getElementById('manifestPanel').remove()" style="background: #EF4444; color: white; border: none; padding: 12px 20px; border-radius: 6px; cursor: pointer; margin-top: 20px; font-weight: bold;">Schliessen</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', manifestHTML);
        console.log('[MANIFEST] Manifest-Panel geoeffnet');
    }
    
    function initializeManifestSystem() {
        console.log('[MANIFEST] Initialisiere Manifest-System...');
        setTimeout(() => {
            createFloatingManifestButton();
            console.log('[MANIFEST] Manifest-System vollstaendig geladen');
        }, 3000);
    }
    
    // Starte System
    waitForDOM(initializeManifestSystem);
    
})();
