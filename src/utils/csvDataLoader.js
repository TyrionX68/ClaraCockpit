// CSV Data Loader für Clara360 Fusion
export const csvDataLoader = {
  // Lade CSV-Daten aus dem public-Verzeichnis
  async loadCSV(filename) {
    try {
      const response = await fetch(`/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`);
      }
      const text = await response.text();
      return this.parseCSV(text);
    } catch (error) {
      console.warn(`CSV-Datei ${filename} nicht gefunden, verwende Dummy-Daten`);
      return this.getDummyData(filename);
    }
  },

  // Parse CSV-Text zu JSON
  parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return data;
  },

  // Dummy-Daten für Fusion-Dashboard
  getDummyData(filename) {
    const dummyData = {
      'objekte_portfolio.csv': [
        { name: 'Waldhofstraße 76', einheiten: '14', vermietungsgrad: '100' }
      ],
      'mietvertraege_aktiv.csv': [
        { mieter: 'Familie Schmidt', wohnung: '1. OG rechts', miete: '600' },
        { mieter: 'Herr Müller', wohnung: '2. OG links', miete: '650' }
      ],
      'waldhofstrasse_76_zahlungseingaenge.csv': [
        { datum: '2025-06-01', betrag: '8360', typ: 'Miete' }
      ],
      'wartungsanfragen.csv': [
        { datum: '2025-06-20', beschreibung: 'Heizung defekt', status: 'offen' }
      ]
    };
    
    return dummyData[filename] || [];
  },

  // Lade alle relevanten CSV-Dateien
  async loadAllData() {
    const files = [
      'objekte_portfolio.csv',
      'mietvertraege_aktiv.csv', 
      'waldhofstrasse_76_zahlungseingaenge.csv',
      'wartungsanfragen.csv'
    ];
    
    const data = {};
    for (const file of files) {
      data[file.replace('.csv', '')] = await this.loadCSV(file);
    }
    
    return data;
  }
};

export default csvDataLoader;

