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
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // Load context data from Supabase
  const loadContextData = useCallback(async () => {
    if (!supabaseClient) return;

    try {
      // Lade Mieter-Daten
      const { data: tenants } = await supabaseClient
        .from('tenants')
        .select('*');

      // Lade Rückstände
      const { data: arrears } = await supabaseClient
        .from('arrears')
        .select('*');

      // Berechne KPIs
      const totalRent = tenants?.reduce((sum, tenant) => sum + (tenant.rent || 0), 0) || 0;
      const totalArrears = arrears?.reduce((sum, arrear) => sum + (arrear.amount || 0), 0) || 0;
      const occupancyRate = tenants?.length ? (tenants.filter(t => t.status === 'active').length / tenants.length) * 100 : 0;

      setContextData({
        tenants: tenants || [],
        arrears: arrears || [],
        kpis: {
          totalRent,
          totalArrears,
          occupancyRate,
          tenantCount: tenants?.length || 0,
          activeContracts: tenants?.filter(t => t.status === 'active').length || 0
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
    
    // Finde passenden Voice Command
    const matchedCommand = Object.keys(VOICE_COMMANDS).find(cmd => 
      command.includes(cmd.replace('clara ', ''))
    );

    if (matchedCommand) {
      const { intent, module } = VOICE_COMMANDS[matchedCommand];
      await executeIntent(intent, module, command);
    } else {
      // Fallback: JGPT-Proxy für komplexe Anfragen
      await processWithJGPT(command);
    }
    
    setIsProcessing(false);
  };

  // Execute specific intents
  const executeIntent = async (intent, module, originalCommand) => {
    switch (intent) {
      case 'showDashboard':
        onNavigate?.('dashboard');
        speak('Zeige das Dashboard mit aktuellen Kennzahlen.');
        break;
        
      case 'showTenants':
        onNavigate?.('tenants');
        speak(`Sie haben ${contextData.kpis?.tenantCount || 0} Mieter. ${contextData.kpis?.activeContracts || 0} aktive Verträge.`);
        break;
        
      case 'showCashflow':
        const monthlyRent = contextData.kpis?.totalRent || 0;
        speak(`Ihr monatlicher Cashflow beträgt ${monthlyRent.toLocaleString('de-DE')} Euro aus ${contextData.kpis?.tenantCount || 0} Mieteinheiten.`);
        break;
        
      case 'showArrears':
        const arrears = contextData.kpis?.totalArrears || 0;
        if (arrears > 0) {
          speak(`Achtung: Es bestehen Mietrückstände in Höhe von ${arrears.toLocaleString('de-DE')} Euro.`);
        } else {
          speak('Sehr gut! Aktuell bestehen keine Mietrückstände.');
        }
        break;
        
      case 'calculateReturn':
        await calculateAndSpeakReturn();
        break;
        
      default:
        speak('Funktion wird ausgeführt.');
    }
  };

  // Calculate and speak return on investment
  const calculateAndSpeakReturn = () => {
    const { totalRent } = contextData.kpis || {};
    if (totalRent) {
      const annualRent = totalRent * 12;
      // Beispiel-Kaufpreis (sollte aus Datenbank kommen)
      const estimatedValue = 1500000; // €1.5M Beispielwert
      const grossReturn = REAL_ESTATE_KNOWLEDGE.calculations.bruttomietrendite(annualRent, estimatedValue);
      
      speak(`Bei einem Jahresertrag von ${annualRent.toLocaleString('de-DE')} Euro beträgt die Bruttomietrendite ${grossReturn.toFixed(2)} Prozent.`);
    } else {
      speak('Für die Renditeberechnung benötige ich aktuelle Mietdaten.');
    }
  };

  // Process complex queries with JGPT-Proxy
  const processWithJGPT = async (command) => {
    try {
      // Hier würde die JGPT-Proxy-Anbindung erfolgen
      const response = await fetch('/api/jgpt-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: command,
          context: {
            domain: 'immobilienverwaltung',
            data: contextData,
            knowledge: REAL_ESTATE_KNOWLEDGE
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        speak(result.answer || 'Entschuldigung, ich konnte Ihre Anfrage nicht verarbeiten.');
      } else {
        speak('Entschuldigung, ich hatte ein technisches Problem.');
      }
    } catch (error) {
      console.error('JGPT-Proxy error:', error);
      speak('Entschuldigung, der KI-Service ist momentan nicht verfügbar.');
    }
  };

  // Text-to-Speech
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
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
    toggleVoiceRecognition,
    speak,
    processVoiceCommand,
    REAL_ESTATE_KNOWLEDGE,
    VOICE_COMMANDS
  };
};

export default ClaraKIEngine;

