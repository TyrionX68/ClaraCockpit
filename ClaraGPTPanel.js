// ClaraGPTPanel.js - GPT-4.5-Integration für MetaGovernor
// Nur sichtbar für admin@demo-clara360.de

(function() {
    'use strict';
    
    // GPT-4.5-Panel erstellen
    function createClaraGPTPanel() {
        // Prüfe MetaGovernor-Berechtigung
        const userEmail = localStorage.getItem('clara360_user_email');
        if (userEmail !== 'admin@demo-clara360.de') {
            console.log('🚫 GPT-Panel nur für MetaGovernor verfügbar');
            return;
        }
        
        console.log('🤖 Clara GPT-Panel wird erstellt...');
        
        // Prüfe ob Panel bereits existiert
        if (document.getElementById('clara-gpt-panel')) {
            return;
        }
        
        const panel = document.createElement('div');
        panel.id = 'clara-gpt-panel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 400px;
            height: 500px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #4299E1;
            border-radius: 12px;
            color: white;
            padding: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            transform: translateY(480px);
            transition: transform 0.3s ease;
        `;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; font-size: 16px; color: #4299E1;">🤖 Clara GPT-4.5</h3>
                <div>
                    <button id="gpt-minimize" style="
                        background: none;
                        border: none;
                        color: #4299E1;
                        cursor: pointer;
                        font-size: 16px;
                        margin-right: 5px;
                    ">−</button>
                    <button id="gpt-close" style="
                        background: none;
                        border: none;
                        color: #ff6b6b;
                        cursor: pointer;
                        font-size: 16px;
                    ">×</button>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #a0aec0;">Szenario/Frage:</label>
                <textarea id="gpt-input" placeholder="z.B. Analysiere die Rückstände und gib Handlungsempfehlungen..." style="
                    width: 100%;
                    height: 80px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid #4299E1;
                    border-radius: 6px;
                    color: white;
                    padding: 8px;
                    font-size: 12px;
                    resize: vertical;
                    box-sizing: border-box;
                "></textarea>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #a0aec0;">Kontext:</label>
                <select id="gpt-context" style="
                    width: 100%;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid #4299E1;
                    border-radius: 6px;
                    color: white;
                    padding: 8px;
                    font-size: 12px;
                ">
                    <option value="manifest">Clara Manifest</option>
                    <option value="kpi">KPI Snapshot</option>
                    <option value="vault">Vault Daten</option>
                    <option value="all">Alle verfügbaren Daten</option>
                </select>
            </div>
            
            <button id="gpt-send" style="
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #4299E1 0%, #3182ce 100%);
                border: none;
                border-radius: 6px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                margin-bottom: 15px;
                transition: all 0.2s ease;
            ">🚀 An GPT-4.5 senden</button>
            
            <div style="flex: 1; overflow-y: auto;">
                <label style="display: block; margin-bottom: 5px; font-size: 12px; color: #a0aec0;">GPT-4.5 Antwort:</label>
                <div id="gpt-response" style="
                    background: rgba(0,0,0,0.3);
                    border: 1px solid #2d3748;
                    border-radius: 6px;
                    padding: 10px;
                    font-size: 12px;
                    line-height: 1.4;
                    height: 200px;
                    overflow-y: auto;
                    color: #e2e8f0;
                ">
                    <div style="color: #a0aec0; font-style: italic;">
                        Bereit für GPT-4.5-Anfragen...<br><br>
                        <strong>Verfügbare Kontexte:</strong><br>
                        • Clara Manifest (System-Status)<br>
                        • KPI Snapshot (Finanzdaten)<br>
                        • Vault Daten (Mieter-Informationen)<br>
                        • Alle Daten (Vollständiger Kontext)
                    </div>
                </div>
            </div>
            
            <button id="gpt-toggle" style="
                position: absolute;
                top: -40px;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 40px;
                background: linear-gradient(135deg, #4299E1 0%, #3182ce 100%);
                border: none;
                border-radius: 8px 8px 0 0;
                color: white;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
            ">🤖 GPT</button>
        `;
        
        document.body.appendChild(panel);
        
        // Event-Listener
        setupGPTEventListeners(panel);
        
        console.log('✅ Clara GPT-Panel erstellt');
    }
    
    // Event-Listener für GPT-Panel
    function setupGPTEventListeners(panel) {
        const toggleBtn = document.getElementById('gpt-toggle');
        const minimizeBtn = document.getElementById('gpt-minimize');
        const closeBtn = document.getElementById('gpt-close');
        const sendBtn = document.getElementById('gpt-send');
        const input = document.getElementById('gpt-input');
        
        // Panel ein-/ausblenden
        toggleBtn.addEventListener('click', () => {
            const isOpen = panel.style.transform === 'translateY(0px)';
            panel.style.transform = isOpen ? 'translateY(480px)' : 'translateY(0px)';
        });
        
        // Panel minimieren
        minimizeBtn.addEventListener('click', () => {
            panel.style.transform = 'translateY(480px)';
        });
        
        // Panel schließen
        closeBtn.addEventListener('click', () => {
            panel.remove();
        });
        
        // GPT-Anfrage senden
        sendBtn.addEventListener('click', () => {
            sendGPTRequest();
        });
        
        // Enter-Taste für Senden
        input.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                sendGPTRequest();
            }
        });
    }
    
    // GPT-Anfrage senden
    async function sendGPTRequest() {
        const input = document.getElementById('gpt-input');
        const contextSelect = document.getElementById('gpt-context');
        const responseDiv = document.getElementById('gpt-response');
        const sendBtn = document.getElementById('gpt-send');
        
        const query = input.value.trim();
        if (!query) {
            responseDiv.innerHTML = '<div style="color: #ff6b6b;">❌ Bitte geben Sie eine Frage oder ein Szenario ein.</div>';
            return;
        }
        
        // Loading-State
        sendBtn.textContent = '⏳ Sende an GPT-4.5...';
        sendBtn.disabled = true;
        responseDiv.innerHTML = '<div style="color: #4299E1;">🔄 GPT-4.5 verarbeitet Ihre Anfrage...</div>';
        
        try {
            // Kontext laden
            const context = await loadGPTContext(contextSelect.value);
            
            // GPT-4.5-Anfrage simulieren (in echter Implementierung würde hier API-Call stehen)
            const response = await simulateGPTResponse(query, context);
            
            // Antwort anzeigen
            displayGPTResponse(response);
            
        } catch (error) {
            console.error('GPT-Anfrage fehlgeschlagen:', error);
            responseDiv.innerHTML = `<div style="color: #ff6b6b;">❌ Fehler bei GPT-4.5-Anfrage: ${error.message}</div>`;
        } finally {
            sendBtn.textContent = '🚀 An GPT-4.5 senden';
            sendBtn.disabled = false;
        }
    }
    
    // Kontext für GPT laden
    async function loadGPTContext(contextType) {
        console.log(`📋 Lade Kontext: ${contextType}`);
        
        const context = {
            timestamp: new Date().toISOString(),
            contextType: contextType,
            data: {}
        };
        
        switch (contextType) {
            case 'manifest':
                context.data = {
                    activeObject: "waldhofstraße_76",
                    systemStatus: "manifest_system_active",
                    buildStatus: "complete",
                    dummyDataPresent: false,
                    realDataAvailable: true
                };
                break;
                
            case 'kpi':
                context.data = {
                    monthlyRent: 8360,
                    totalTenants: 14,
                    occupancyRate: "100%",
                    yearlyReturn: "8.4%",
                    outstandingPayments: 1200,
                    operatingCosts: 1200
                };
                break;
                
            case 'vault':
                context.data = {
                    realTenants: 4,
                    []: 10,
                    vaultFiles: ["waldhofstrasse_76_mietvertraege.csv", "mietvertraege_aktiv_real.csv"],
                    dataQuality: "mixed_real_and_dummy"
                };
                break;
                
            case 'all':
                context.data = {
                    system: { status: "active", dummyDataPresent: false },
                    financial: { monthlyRent: 8360, outstandingPayments: 1200 },
                    tenants: { total: 14, real: 4, dummy: 10 },
                    vault: { filesAvailable: true, realDataMixed: true }
                };
                break;
        }
        
        return context;
    }
    
    // GPT-4.5-Antwort simulieren
    async function simulateGPTResponse(query, context) {
        // Simuliere API-Delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Intelligente Antwort basierend auf Query und Kontext
        let response = "";
        
        if (query.toLowerCase().includes('rückstände') || query.toLowerCase().includes('zahlungen')) {
            response = `
**📊 Rückstände-Analyse (Clara GPT-4.5)**

Basierend auf den aktuellen Daten:

**Situation:**
• Ausstehende Zahlung: 1.200€ (Echter Mieter)
• Betrifft: 1. OG rechts, 2 Monate Rückstand
• Anteil an Gesamtmiete: 14,4% (1.200€ von 8.360€)

**Handlungsempfehlungen:**
1. **Sofortige Maßnahmen:**
   - Persönliches Gespräch mit Echter Mieter
   - Ratenzahlungsvereinbarung anbieten
   - Schriftliche Mahnung mit Fristsetzung

2. **Präventive Maßnahmen:**
   - Monatliche Zahlungserinnerungen einführen
   - SEPA-Lastschrift vorschlagen
   - Frühwarnsystem bei Zahlungsverzug

**Risikobewertung:** MITTEL
- Kurzer Rückstand (2 Monate)
- Stabile Mieterstruktur (100% Vermietung)
- Gute Gesamtrendite (8,4%)

*Hinweis: Diese Analyse basiert auf aktuellen Systemdaten. Dummy-Daten sollten durch echte Mieterinformationen ersetzt werden.*
            `;
        } else if (query.toLowerCase().includes('system') || query.toLowerCase().includes('status')) {
            response = `
**🔧 System-Status-Analyse (Clara GPT-4.5)**

**Aktueller Zustand:**
• ✅ Manifest-System: Aktiv und funktional
• ✅ Supabase-Integration: Verbunden
• ⚠️ Datenqualität: Gemischt (echte + Dummy-Daten)
• ✅ MetaGovernor-Dashboard: Verfügbar

**Identifizierte Probleme:**
1. **Dummy-Daten-Kontamination:**
   - "Echter Mieter" ist Platzhalter-Daten
   - Echte Mieter: 4 von 14 sind real
   - Vault enthält echte CSV-Dateien

2. **API-Konfiguration:**
   - Supabase zeigt "Invalid API key" 
   - Funktionalität trotzdem gegeben

**Empfohlene Aktionen:**
1. Dummy-Daten vollständig entfernen
2. Echte Vault-Daten in Supabase importieren
3. API-Key-Konfiguration überprüfen
4. Datenvalidierung implementieren

**Priorität:** HOCH - Datenintegrität kritisch für Produktivbetrieb
            `;
        } else {
            response = `
**🤖 Clara GPT-4.5 Antwort**

Ihre Anfrage: "${query}"

Basierend auf dem geladenen Kontext (${context.contextType}) kann ich folgende Einschätzung geben:

**Kontext-Analyse:**
${JSON.stringify(context.data, null, 2)}

**Empfehlung:**
Für spezifischere Analysen können Sie gezielter nach folgenden Bereichen fragen:
• Rückstände und Zahlungsmanagement
• System-Status und Datenqualität  
• Finanzielle Performance-Analyse
• Mieter-Management-Strategien

**Verfügbare Aktionen:**
• Detailanalyse anfordern
• Handlungsempfehlungen generieren
• Risikobewertung durchführen
• Optimierungsvorschläge entwickeln

*Clara GPT-4.5 ist bereit für weitere spezifische Anfragen.*
            `;
        }
        
        return {
            query: query,
            context: context.contextType,
            response: response,
            timestamp: new Date().toISOString(),
            model: "GPT-4.5",
            tokens: response.length
        };
    }
    
    // GPT-Antwort anzeigen
    function displayGPTResponse(gptResponse) {
        const responseDiv = document.getElementById('gpt-response');
        
        responseDiv.innerHTML = `
            <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #2d3748;">
                <div style="font-size: 10px; color: #a0aec0; margin-bottom: 5px;">
                    🤖 ${gptResponse.model} • ${new Date(gptResponse.timestamp).toLocaleTimeString()} • ${gptResponse.tokens} Zeichen
                </div>
                <div style="font-size: 10px; color: #4299E1; margin-bottom: 8px;">
                    <strong>Kontext:</strong> ${gptResponse.context}
                </div>
            </div>
            <div style="white-space: pre-line; line-height: 1.5;">
                ${gptResponse.response}
            </div>
        `;
        
        // Scroll to top of response
        responseDiv.scrollTop = 0;
        
        console.log('✅ GPT-Antwort angezeigt:', gptResponse);
    }
    
    // KPI-Snapshot generieren
    function generateKPISnapshot() {
        const snapshot = {
            timestamp: new Date().toISOString(),
            financial: {
                monthlyRent: 8360,
                yearlyRent: 8360 * 12,
                outstandingPayments: 1200,
                operatingCosts: 1200,
                netIncome: 8360 - 1200,
                returnRate: 8.4
            },
            occupancy: {
                totalUnits: 14,
                occupiedUnits: 14,
                occupancyRate: 100,
                vacantUnits: 0
            },
            risks: {
                paymentDelays: 1,
                maintenanceIssues: 0,
                legalIssues: 0,
                overallRisk: "LOW"
            },
            dataQuality: {
                realTenants: 4,
                []: 10,
                dataIntegrity: "MIXED",
                lastUpdate: "2025-06-13"
            }
        };
        
        return snapshot;
    }
    
    // GPT-Panel beim Laden erstellen (nur für MetaGovernor)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createClaraGPTPanel);
    } else {
        createClaraGPTPanel();
    }
    
    // Globale GPT-Funktionen
    window.ClaraGPT = {
        createPanel: createClaraGPTPanel,
        generateKPISnapshot: generateKPISnapshot,
        version: '1.0.0'
    };
    
    console.log('✅ Clara GPT-4.5-Panel geladen');
    
})();

