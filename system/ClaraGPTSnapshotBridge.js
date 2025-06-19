// ClaraGPTSnapshotBridge.js - Lokale Datenbrücke für Clara360
// Ersetzt Supabase-Aufrufe durch lokale JSON-Daten

class ClaraGPTSnapshotBridge {
  constructor() {
    this.dataCache = {};
    this.baseUrl = '/dist/data';
  }

  async fetchLocalData(endpoint) {
    if (this.dataCache[endpoint]) {
      return this.dataCache[endpoint];
    }

    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}.json`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      this.dataCache[endpoint] = data;
      return data;
    } catch (error) {
      console.error(`❌ Fehler beim Laden von ${endpoint}:`, error);
      return [];
    }
  }

  // Ersatz für supabase.from('tenants').select()
  async getTenants() {
    return await this.fetchLocalData('tenants');
  }

  // Ersatz für supabase.from('arrears').select()
  async getArrears() {
    return await this.fetchLocalData('arrears');
  }

  // Ersatz für supabase.from('transactions').select()
  async getTransactions() {
    return await this.fetchLocalData('transactions');
  }

  // GPT-Snapshot für KI-Auswertungen
  async getGPTSnapshot() {
    const [tenants, arrears, transactions] = await Promise.all([
      this.getTenants(),
      this.getArrears(),
      this.getTransactions()
    ]);

    return {
      tenants,
      arrears,
      transactions,
      summary: {
        totalTenants: tenants.length,
        totalArrears: arrears.length,
        totalTransactions: transactions.length,
        monthlyRent: tenants.reduce((sum, tenant) => sum + (tenant.Miete || 0), 0),
        timestamp: new Date().toISOString()
      }
    };
  }

  // Dashboard-Statistiken berechnen
  async getDashboardStats() {
    const snapshot = await this.getGPTSnapshot();
    
    const activeTenantsCount = snapshot.tenants.filter(t => t.Status === 'Aktiv').length;
    const totalMonthlyRent = snapshot.summary.monthlyRent;
    
    // Rückstände berechnen
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentArrears = snapshot.arrears.filter(a => 
      a.Status !== 'Pünktlich' && a.Differenz > 0
    );
    
    return {
      tenants: activeTenantsCount,
      monthlyRent: totalMonthlyRent,
      arrears: currentArrears.length,
      arrearsAmount: currentArrears.reduce((sum, a) => sum + (a.Differenz || 0), 0),
      occupancyRate: (activeTenantsCount / snapshot.tenants.length * 100).toFixed(1)
    };
  }
}

// Globale Instanz erstellen
window.claraDataBridge = new ClaraGPTSnapshotBridge();

// Kompatibilitäts-Layer für bestehenden Code
window.supabaseReplacement = {
  from: (table) => ({
    select: async (columns = '*') => {
      switch(table) {
        case 'tenants':
          return { data: await window.claraDataBridge.getTenants(), error: null };
        case 'arrears':
          return { data: await window.claraDataBridge.getArrears(), error: null };
        case 'transactions':
          return { data: await window.claraDataBridge.getTransactions(), error: null };
        default:
          return { data: [], error: { message: `Tabelle ${table} nicht gefunden` } };
      }
    }
  })
};

console.log('✅ ClaraGPTSnapshotBridge geladen - Lokale Daten verfügbar');

export { ClaraGPTSnapshotBridge };
export default window.claraDataBridge;

