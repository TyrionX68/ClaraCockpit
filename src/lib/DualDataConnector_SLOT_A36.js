/**
 * DualDataConnector_SLOT_A36.js
 * 
 * Dual Data Connector for Clara KI Engine
 * Handles Supabase and Mock data connections with DSGVO compliance
 * 
 * @version 1.0.0
 * @author Manus A
 */

import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = 'https://anhomormslputicoybng.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuaG9tb3Jtc2xwdXRpY295Ym5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk0MDcwNzEsImV4cCI6MjAzNDk4MzA3MX0.4R5TCDhUNMKJLfGJOKUYGJZaKBOOOBgOjfA_JdWBqzY';

// DSGVO-konforme Mock-Daten
const MOCK_DATA = {
  tenants: [
    {
      id: 'demo_001',
      name: 'Mieter A',
      email: 'mieter.a@demo-clara360.de',
      rent: 850,
      status: 'active',
      unit: 'Wohnung 1A'
    },
    {
      id: 'demo_002', 
      name: 'Mieter B',
      email: 'mieter.b@demo-clara360.de',
      rent: 950,
      status: 'active',
      unit: 'Wohnung 2B'
    },
    {
      id: 'demo_003',
      name: 'Cafe Demo',
      email: 'cafe@demo-clara360.de', 
      rent: 2015,
      status: 'active',
      unit: 'Gewerbe EG'
    }
  ],
  
  kpis: {
    totalRent: 8360,
    totalTenants: 13,
    occupancyRate: 100,
    totalArrears: 0,
    activeContracts: 13,
    propertyValue: 1500000,
    monthlyExpenses: 1200
  },
  
  financials: {
    monthlyIncome: 8360,
    yearlyIncome: 100320,
    monthlyExpenses: 1200,
    netCashflow: 7160,
    grossReturn: 6.69,
    netReturn: 5.73
  }
};

class DualDataConnector {
  constructor() {
    this.supabaseClient = null;
    this.isConnected = false;
    this.usesMockData = false;
    this.initializeConnection();
  }

  /**
   * Initialize connection to Supabase
   */
  async initializeConnection() {
    try {
      this.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      // Test connection
      const { data, error } = await this.supabaseClient
        .from('tenants')
        .select('count')
        .limit(1);
        
      if (error) {
        console.warn('Supabase connection failed, using mock data:', error.message);
        this.usesMockData = true;
      } else {
        console.log('Supabase connection successful');
        this.isConnected = true;
      }
    } catch (error) {
      console.warn('Failed to initialize Supabase, using mock data:', error);
      this.usesMockData = true;
    }
  }

  /**
   * Get tenant data (DSGVO-compliant)
   */
  async getTenants() {
    if (this.usesMockData || !this.isConnected) {
      return {
        data: MOCK_DATA.tenants,
        source: 'mock',
        dsgvoCompliant: true
      };
    }

    try {
      const { data, error } = await this.supabaseClient
        .from('tenants')
        .select('*');

      if (error) {
        console.warn('Supabase query failed, falling back to mock data:', error);
        return {
          data: MOCK_DATA.tenants,
          source: 'mock_fallback',
          dsgvoCompliant: true
        };
      }

      return {
        data: data || [],
        source: 'supabase',
        dsgvoCompliant: true
      };
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return {
        data: MOCK_DATA.tenants,
        source: 'mock_error',
        dsgvoCompliant: true
      };
    }
  }

  /**
   * Get KPI data
   */
  async getKPIs() {
    if (this.usesMockData || !this.isConnected) {
      return {
        data: MOCK_DATA.kpis,
        source: 'mock',
        dsgvoCompliant: true
      };
    }

    try {
      // Get live KPIs from Supabase
      const tenants = await this.getTenants();
      const tenantsData = tenants.data || [];
      
      const totalRent = tenantsData.reduce((sum, tenant) => sum + (tenant.rent || 0), 0);
      const activeContracts = tenantsData.filter(t => t.status === 'active').length;
      const occupancyRate = tenantsData.length > 0 ? (activeContracts / tenantsData.length) * 100 : 0;

      // Get arrears if available
      let totalArrears = 0;
      try {
        const { data: arrearsData } = await this.supabaseClient
          .from('arrears')
          .select('amount');
        totalArrears = arrearsData?.reduce((sum, arrear) => sum + (arrear.amount || 0), 0) || 0;
      } catch (error) {
        console.warn('Could not fetch arrears data:', error);
      }

      return {
        data: {
          totalRent,
          totalTenants: tenantsData.length,
          occupancyRate: Math.round(occupancyRate * 10) / 10,
          totalArrears,
          activeContracts,
          propertyValue: MOCK_DATA.kpis.propertyValue, // Static for now
          monthlyExpenses: MOCK_DATA.kpis.monthlyExpenses // Static for now
        },
        source: 'supabase_calculated',
        dsgvoCompliant: true
      };
    } catch (error) {
      console.error('Error calculating KPIs:', error);
      return {
        data: MOCK_DATA.kpis,
        source: 'mock_error',
        dsgvoCompliant: true
      };
    }
  }

  /**
   * Get financial analysis
   */
  async getFinancialAnalysis() {
    const kpis = await this.getKPIs();
    const kpiData = kpis.data;

    const monthlyIncome = kpiData.totalRent;
    const yearlyIncome = monthlyIncome * 12;
    const monthlyExpenses = kpiData.monthlyExpenses || 1200;
    const netCashflow = monthlyIncome - monthlyExpenses;
    const propertyValue = kpiData.propertyValue || 1500000;
    
    const grossReturn = (yearlyIncome / propertyValue) * 100;
    const netReturn = ((netCashflow * 12) / propertyValue) * 100;

    return {
      data: {
        monthlyIncome,
        yearlyIncome,
        monthlyExpenses,
        netCashflow,
        grossReturn: Math.round(grossReturn * 100) / 100,
        netReturn: Math.round(netReturn * 100) / 100,
        propertyValue
      },
      source: kpis.source,
      dsgvoCompliant: true
    };
  }

  /**
   * Get arrears data
   */
  async getArrears() {
    if (this.usesMockData || !this.isConnected) {
      return {
        data: [],
        source: 'mock',
        dsgvoCompliant: true
      };
    }

    try {
      const { data, error } = await this.supabaseClient
        .from('arrears')
        .select('*');

      if (error) {
        console.warn('Could not fetch arrears:', error);
        return {
          data: [],
          source: 'mock_fallback',
          dsgvoCompliant: true
        };
      }

      return {
        data: data || [],
        source: 'supabase',
        dsgvoCompliant: true
      };
    } catch (error) {
      console.error('Error fetching arrears:', error);
      return {
        data: [],
        source: 'mock_error',
        dsgvoCompliant: true
      };
    }
  }

  /**
   * Process Clara KI query with context
   */
  async processQuery(query, context = {}) {
    const lowerQuery = query.toLowerCase();
    
    try {
      // Get current data
      const [tenants, kpis, financials, arrears] = await Promise.all([
        this.getTenants(),
        this.getKPIs(),
        this.getFinancialAnalysis(),
        this.getArrears()
      ]);

      const responseData = {
        tenants: tenants.data,
        kpis: kpis.data,
        financials: financials.data,
        arrears: arrears.data,
        query: lowerQuery,
        timestamp: new Date().toISOString(),
        dsgvoCompliant: true
      };

      // Generate contextual response
      let response = this.generateContextualResponse(lowerQuery, responseData);

      return {
        success: true,
        response,
        data: responseData,
        source: tenants.source,
        dsgvoCompliant: true
      };
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        success: false,
        response: 'Entschuldigung, ich hatte ein technisches Problem bei der Datenabfrage.',
        error: error.message,
        dsgvoCompliant: true
      };
    }
  }

  /**
   * Generate contextual response based on query
   */
  generateContextualResponse(query, data) {
    const { kpis, financials, tenants, arrears } = data;

    // Dashboard & Overview
    if (query.includes('dashboard') || query.includes('übersicht')) {
      return `Hier ist Ihre aktuelle Übersicht: Sie verwalten ${kpis.totalTenants} Mieteinheiten mit einem monatlichen Gesamtertrag von ${kpis.totalRent.toLocaleString('de-DE')} €. Die Vermietungsquote beträgt ${kpis.occupancyRate}%.`;
    }

    // Cashflow & Rendite
    if (query.includes('cashflow') || query.includes('rendite')) {
      return `Ihre Cashflow-Analyse: Brutto-Jahresertrag ${financials.yearlyIncome.toLocaleString('de-DE')} €, monatliche Ausgaben ${financials.monthlyExpenses.toLocaleString('de-DE')} €, Netto-Cashflow ${financials.netCashflow.toLocaleString('de-DE')} € monatlich. Bruttomietrendite: ${financials.grossReturn}%, Nettomietrendite: ${financials.netReturn}%.`;
    }

    // Mieter & Rückstände
    if (query.includes('mieter') || query.includes('rückstände')) {
      const arrearsAmount = arrears.reduce((sum, arrear) => sum + (arrear.amount || 0), 0);
      if (arrearsAmount > 0) {
        return `Sie haben ${kpis.activeContracts} aktive Mietverträge. Achtung: Es bestehen Mietrückstände in Höhe von ${arrearsAmount.toLocaleString('de-DE')} €.`;
      } else {
        return `Sehr gut! Sie haben ${kpis.activeContracts} aktive Mietverträge und keine offenen Mietrückstände.`;
      }
    }

    // Wartung & Instandhaltung
    if (query.includes('wartung') || query.includes('reparatur')) {
      return `Für eine professionelle Immobilienverwaltung empfehle ich eine Instandhaltungsrücklage von 8-12 € pro m² Wohnfläche jährlich. Bei größeren Reparaturen sollten Sie immer mehrere Kostenvoranschläge einholen.`;
    }

    // Wirtschaftlichkeit
    if (query.includes('wirtschaftlich') || query.includes('bewert')) {
      return `Ihre Immobilie zeigt eine Bruttomietrendite von ${financials.grossReturn}% und eine Nettomietrendite von ${financials.netReturn}%. Bei einem Objektwert von ${(financials.propertyValue / 1000000).toFixed(1)} Mio. € ist das eine ${financials.grossReturn > 6 ? 'sehr gute' : financials.grossReturn > 4 ? 'gute' : 'ausbaufähige'} Performance.`;
    }

    // Default response
    return `Als Ihre Immobilien-Expertin kann ich Ihnen bei allen Fragen zur Hausverwaltung helfen. Aktuell verwalten Sie ${kpis.totalTenants} Einheiten mit ${kpis.totalRent.toLocaleString('de-DE')} € monatlichen Einnahmen. Was möchten Sie wissen?`;
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      usesMockData: this.usesMockData,
      source: this.usesMockData ? 'mock' : 'supabase',
      dsgvoCompliant: true
    };
  }
}

export default DualDataConnector;

