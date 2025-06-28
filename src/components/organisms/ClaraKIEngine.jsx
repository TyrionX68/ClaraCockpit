import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// Immobilien-Fachwissen und Kennzahlen
const REAL_ESTATE_KNOWLEDGE = {
  // Fachbegriffe
  terminology: {
    'nettokaltmiete': 'Miete ohne Nebenkosten',
    'bruttokaltmiete': 'Miete inklusive kalte Nebenkosten',
    'warmmiete': 'Miete inklusive aller Nebenkosten',
    'mietmultiplikator': 'Kaufpreis geteilt durch Jahresnettomiete',
    'bruttomietrendite': 'Jahresnettomiete geteilt durch Kaufpreis mal 100',
    'nettomietrendite': 'Bruttomietrendite minus Bewirtschaftungskosten',
    'cashflow': 'Monatlicher Überschuss nach allen Kosten',
    'eigenkapitalrendite': 'Rendite auf das eingesetzte Eigenkapital',
    'leerstandsrisiko': 'Risiko von Mietausfällen',
    'instandhaltungsrücklage': 'Rücklagen für Reparaturen und Modernisierung'
  },

  // Kennzahlen-Berechnungen
  calculations: {
    bruttomietrendite: (jahresnettomiete, kaufpreis) => (jahresnettomiete / kaufpreis) * 100,
    nettomietrendite: (bruttomietrendite, bewirtschaftungskosten) => bruttomietrendite - bewirtschaftungskosten,
    mietmultiplikator: (kaufpreis, jahresnettomiete) => kaufpreis / jahresnettomiete,
    cashflow: (mieteinnahmen, kosten) => mieteinnahmen - kosten,
    eigenkapitalrendite: (cashflow, eigenkapital) => (cashflow * 12 / eigenkapital) * 100,
    leerstandspuffer: (mieteinnahmen, leerstandsrate) => mieteinnahmen * (leerstandsrate / 100)
  },

  // Bewertungskriterien
  benchmarks: {
    bruttomietrendite: { gut: 6, sehr_gut: 8 },
    nettomietrendite: { gut: 4, sehr_gut: 6 },
    mietmultiplikator: { gut: 20, sehr_gut: 15 },
    leerstandsrate: { gut: 5, sehr_gut: 2 }
  }
};

// Voice Commands für Immobilien-Management
const VOICE_COMMANDS = {
  // Dashboard & Übersichten
  'clara zeige dashboard': { intent: 'showDashboard', module: 'dashboard' },
  'clara übersicht': { intent: 'showOverview', module: 'dashboard' },
  'clara kpis': { intent: 'showKPIs', module: 'dashboard' },
  
  // Mieter-Management
  'clara zeige mieter': { intent: 'showTenants', module: 'tenants' },
  'clara mieterliste': { intent: 'showTenantList', module: 'tenants' },
  'clara rückstände': { intent: 'showArrears', module: 'tenants' },
  'clara mahnungen': { intent: 'showReminders', module: 'tenants' },
  
  // Finanz-Analysen
  'clara cashflow': { intent: 'showCashflow', module: 'finance' },
  'clara rendite': { intent: 'calculateReturn', module: 'finance' },
  'clara wirtschaftlichkeit': { intent: 'showProfitability', module: 'finance' },
  'clara mieteinnahmen': { intent: 'showRentIncome', module: 'finance' },
  
  // Wartung & Instandhaltung
  'clara wartung': { intent: 'showMaintenance', module: 'maintenance' },
  'clara reparaturen': { intent: 'showRepairs', module: 'maintenance' },
  'clara termine': { intent: 'showAppointments', module: 'maintenance' },
  
  // Dokumente
  'clara dokumente': { intent: 'showDocuments', module: 'documents' },
  'clara verträge': { intent: 'showContracts', module: 'documents' },
  'clara upload': { intent: 'showUpload', module: 'documents' },
  
  // Berechnungen
  'clara berechne rendite': { intent: 'calculateReturn', module: 'calculations' },
  'clara berechne cashflow': { intent: 'calculateCashflow', module: 'calculations' },
  'clara bewerte objekt': { intent: 'evaluateProperty', module: 'calculations' }
};

const ClaraKIEngine = ({ onNavigate, supabaseClient }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const [contextData, setContextData] = useState({});
  const [recognition, setRecognition] = useState(null);
  const [preferredVoice, setPreferredVoice] = useState(null);

  // Initialize preferred German female voice
  useEffect(() => {
    const initializeVoice = () => {
      if ('speechSynthesis' in window) {
        const voices = speechSynthesis.getVoices();
        
        // Suche nach deutscher Frauenstimme
        const germanFemaleVoices = voices.filter(voice => 
          voice.lang.startsWith('de') && 
          (voice.name.toLowerCase().includes('female') || 
           voice.name.toLowerCase().includes('anna') ||
           voice.name.toLowerCase().includes('petra') ||
           voice.name.toLowerCase().includes('marlene') ||
           voice.name.toLowerCase().includes('vicki') ||
           voice.name.toLowerCase().includes('katrin'))
        );

        // Fallback: Alle deutschen Stimmen
        const germanVoices = voices.filter(voice => voice.lang.startsWith('de'));
        
        // Wähle beste verfügbare Stimme
        const selectedVoice = germanFemaleVoices[0] || germanVoices[0] || voices[0];
        
        console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
        console.log('Selected voice:', selectedVoice?.name, selectedVoice?.lang);
        
        setPreferredVoice(selectedVoice);
      }
    };

    // Voices laden sich asynchron
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', initializeVoice);
    } else {
      initializeVoice();
    }

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', initializeVoice);
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'de-DE';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        setLastCommand(command);
        processVoiceCommand(command);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        speak('Entschuldigung, ich konnte Sie nicht verstehen. Bitte versuchen Sie es erneut.');
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Load context data from Supabase
  const loadContextData = useCallback(async () => {
    try {
      // Mock-Daten für Waldhofstraße 76 (DSGVO-konform)
      const mockTenants = [
        { id: 1, name: 'Mieter A', rent: 650, status: 'active', unit: '1.OG links' },
        { id: 2, name: 'Mieter B', rent: 720, status: 'active', unit: '1.OG rechts' },
        { id: 3, name: 'Mieter C', rent: 580, status: 'active', unit: 'EG links' },
        { id: 4, name: 'Mieter D', rent: 890, status: 'active', unit: '2.OG links' },
        { id: 5, name: 'Mieter E', rent: 750, status: 'active', unit: '2.OG rechts' },
        { id: 6, name: 'Mieter F', rent: 680, status: 'active', unit: 'DG links' },
        { id: 7, name: 'Mieter G', rent: 620, status: 'active', unit: 'DG rechts' },
        { id: 8, name: 'Mieter H', rent: 950, status: 'active', unit: '3.OG links' },
        { id: 9, name: 'Mieter I', rent: 780, status: 'active', unit: '3.OG rechts' },
        { id: 10, name: 'Mieter J', rent: 560, status: 'active', unit: 'Souterrain' },
        { id: 11, name: 'Mieter K', rent: 820, status: 'active', unit: '4.OG' },
        { id: 12, name: 'Mieter L', rent: 700, status: 'active', unit: 'Penthouse' },
        { id: 13, name: 'Café Schmidt', rent: 2015, status: 'active', unit: 'Gewerbe EG' }
      ];

      const mockArrears = []; // Keine Rückstände

      // Berechne KPIs
      const totalRent = mockTenants.reduce((sum, tenant) => sum + tenant.rent, 0);
      const totalArrears = mockArrears.reduce((sum, arrear) => sum + (arrear.amount || 0), 0);
      const occupancyRate = (mockTenants.filter(t => t.status === 'active').length / mockTenants.length) * 100;

      setContextData({
        tenants: mockTenants,
        arrears: mockArrears,
        kpis: {
          totalRent,
          totalArrears,
          occupancyRate,
          tenantCount: mockTenants.length,
          activeContracts: mockTenants.filter(t => t.status === 'active').length,
          propertyValue: 1250000, // €1.25M Schätzwert
          annualRent: totalRent * 12
        }
      });
    } catch (error) {
      console.error('Error loading context data:', error);
    }
  }, [supabaseClient]);

  useEffect(() => {
    loadContextData();
  }, [loadContextData]);

  // Process voice commands
  const processVoiceCommand = async (command) => {
    setIsProcessing(true);
    
    try {
      // Finde passenden Voice Command
      const matchedCommand = Object.keys(VOICE_COMMANDS).find(cmd => 
        command.includes(cmd.replace('clara ', ''))
      );

      if (matchedCommand) {
        const { intent, module } = VOICE_COMMANDS[matchedCommand];
        await executeIntent(intent, module, command);
      } else {
        // Intelligente Verarbeitung für natürliche Sprache
        await processNaturalLanguage(command);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      speak('Entschuldigung, bei der Verarbeitung Ihres Befehls ist ein Fehler aufgetreten.');
    }
    
    setIsProcessing(false);
  };

  // Process natural language queries
  const processNaturalLanguage = async (command) => {
    const lowerCommand = command.toLowerCase();
    
    // Dashboard & Übersichten
    if (lowerCommand.includes('dashboard') || lowerCommand.includes('übersicht')) {
      const { kpis } = contextData;
      speak(`Hier ist Ihre aktuelle Übersicht: Sie verwalten ${kpis?.tenantCount || 0} Mieteinheiten mit einem monatlichen Gesamtertrag von ${(kpis?.totalRent || 0).toLocaleString('de-DE')} Euro. Die Vermietungsquote beträgt ${(kpis?.occupancyRate || 0).toFixed(1)} Prozent.`);
      return;
    }
    
    // Cashflow & Rendite
    if (lowerCommand.includes('cashflow') || lowerCommand.includes('rendite')) {
      const { kpis } = contextData;
      const monthlyRent = kpis?.totalRent || 0;
      const annualRent = monthlyRent * 12;
      const estimatedCosts = annualRent * 0.25; // 25% Bewirtschaftungskosten
      const netCashflow = annualRent - estimatedCosts;
      const grossReturn = kpis?.propertyValue ? REAL_ESTATE_KNOWLEDGE.calculations.bruttomietrendite(annualRent, kpis.propertyValue) : 0;
      
      speak(`Ihre Cashflow-Analyse: Brutto-Jahresertrag ${annualRent.toLocaleString('de-DE')} Euro, geschätzte Bewirtschaftungskosten ${estimatedCosts.toLocaleString('de-DE')} Euro, Netto-Cashflow ${netCashflow.toLocaleString('de-DE')} Euro. Die Bruttomietrendite beträgt ${grossReturn.toFixed(2)} Prozent.`);
      return;
    }
    
    // Mieter & Rückstände
    if (lowerCommand.includes('mieter') || lowerCommand.includes('rückstände')) {
      const { kpis } = contextData;
      const arrears = kpis?.totalArrears || 0;
      const activeContracts = kpis?.activeContracts || 0;
      
      if (arrears > 0) {
        speak(`Sie haben ${activeContracts} aktive Mietverträge. Achtung: Es bestehen Mietrückstände in Höhe von ${arrears.toLocaleString('de-DE')} Euro. Ich empfehle eine zeitnahe Mahnung.`);
      } else {
        speak(`Sehr gut! Sie haben ${activeContracts} aktive Mietverträge und keine offenen Mietrückstände. Alle Mieter zahlen pünktlich.`);
      }
      return;
    }
    
    // Fallback
    speak('Ich bin Clara, Ihre Immobilien-Expertin. Ich kann Ihnen bei Fragen zu Cashflow, Rendite, Mietern und Wirtschaftlichkeit helfen. Was möchten Sie wissen?');
  };

  // Execute specific intents
  const executeIntent = async (intent, module, originalCommand) => {
    const { kpis } = contextData;
    
    switch (intent) {
      case 'showDashboard':
        onNavigate?.('dashboard');
        speak(`Zeige das Dashboard. Sie verwalten ${kpis?.tenantCount || 0} Mieteinheiten mit ${(kpis?.totalRent || 0).toLocaleString('de-DE')} Euro monatlichen Einnahmen.`);
        break;
        
      case 'showTenants':
        onNavigate?.('tenants');
        speak(`Sie haben ${kpis?.tenantCount || 0} Mieter. ${kpis?.activeContracts || 0} aktive Verträge mit einer Vermietungsquote von ${(kpis?.occupancyRate || 0).toFixed(1)} Prozent.`);
        break;
        
      case 'showCashflow':
      case 'calculateCashflow':
        const monthlyRent = kpis?.totalRent || 0;
        const annualRent = monthlyRent * 12;
        speak(`Ihr monatlicher Cashflow beträgt ${monthlyRent.toLocaleString('de-DE')} Euro aus ${kpis?.tenantCount || 0} Mieteinheiten. Das entspricht ${annualRent.toLocaleString('de-DE')} Euro Jahresertrag.`);
        break;
        
      case 'showArrears':
        const arrears = kpis?.totalArrears || 0;
        if (arrears > 0) {
          speak(`Achtung: Es bestehen Mietrückstände in Höhe von ${arrears.toLocaleString('de-DE')} Euro.`);
        } else {
          speak('Sehr gut! Aktuell bestehen keine Mietrückstände. Alle Mieter zahlen pünktlich.');
        }
        break;
        
      case 'calculateReturn':
        if (kpis?.propertyValue && kpis?.annualRent) {
          const grossReturn = REAL_ESTATE_KNOWLEDGE.calculations.bruttomietrendite(kpis.annualRent, kpis.propertyValue);
          speak(`Bei einem Jahresertrag von ${kpis.annualRent.toLocaleString('de-DE')} Euro und einem Objektwert von ${kpis.propertyValue.toLocaleString('de-DE')} Euro beträgt die Bruttomietrendite ${grossReturn.toFixed(2)} Prozent.`);
        } else {
          speak('Für die Renditeberechnung benötige ich den aktuellen Objektwert.');
        }
        break;
        
      default:
        speak('Funktion wird ausgeführt.');
    }
  };

  // Enhanced Text-to-Speech with German female voice
  const speak = (text) => {
    if ('speechSynthesis' in window && text) {
      // Stoppe vorherige Sprachausgabe
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Verwende bevorzugte deutsche Frauenstimme
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Optimierte Einstellungen für deutsche Sprache
      utterance.lang = 'de-DE';
      utterance.rate = 0.85; // Etwas langsamer für bessere Verständlichkeit
      utterance.pitch = 1.1; // Etwas höher für weiblichere Stimme
      utterance.volume = 0.9;
      
      // Error handling
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
      };
      
      utterance.onend = () => {
        console.log('Speech synthesis completed');
      };
      
      console.log('Speaking:', text, 'with voice:', preferredVoice?.name);
      speechSynthesis.speak(utterance);
    }
  };

  // Start/Stop voice recognition
  const toggleVoiceRecognition = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    }
  };

  return {
    isListening,
    isProcessing,
    lastCommand,
    contextData,
    preferredVoice,
    toggleVoiceRecognition,
    speak,
    processVoiceCommand,
    REAL_ESTATE_KNOWLEDGE,
    VOICE_COMMANDS
  };
};

export default ClaraKIEngine;

