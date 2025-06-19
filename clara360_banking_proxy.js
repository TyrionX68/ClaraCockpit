// Clara360 Banking API Proxy Server
// Node.js/Express Backend für FinAPI-Integration

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// FinAPI-Integration laden
let finApiIntegration = null;

// Token-Speicherung
const TOKEN_FILE = '/var/www/clara360/tokens/finapi.json';

// Hilfsfunktionen
async function loadTokens() {
  try {
    const data = await fs.readFile(TOKEN_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

async function saveTokens(tokens) {
  try {
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens, null, 2));
    return true;
  } catch (error) {
    console.error('Token-Speicherung fehlgeschlagen:', error);
    return false;
  }
}

// Mock-Daten für Entwicklung/Demo
const mockAccounts = [
  {
    id: 'acc_001',
    name: 'Haupt-Geschäftskonto',
    iban: 'DE89 3704 0044 0532 0130 00',
    balance: 24580,
    currency: 'EUR',
    type: 'main_business',
    bankName: 'Sparkasse Mannheim',
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'acc_002',
    name: 'Rücklage-Konto',
    iban: 'DE89 3704 0044 0532 0130 01',
    balance: 15200,
    currency: 'EUR',
    type: 'reserve',
    bankName: 'Sparkasse Mannheim',
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'acc_003',
    name: 'Kautions-Konto',
    iban: 'DE89 3704 0044 0532 0130 02',
    balance: 12540,
    currency: 'EUR',
    type: 'deposit',
    bankName: 'Sparkasse Mannheim',
    lastUpdate: new Date().toISOString()
  }
];

const mockTransactions = [
  {
    id: 'tx_001',
    accountId: 'acc_001',
    amount: 850,
    currency: 'EUR',
    purpose: 'Miete Juni 2024',
    counterpartName: 'Herr Müller',
    bookingDate: '2024-06-13',
    type: 'Eingang',
    category: 'rent',
    status: 'Gebucht'
  },
  {
    id: 'tx_002',
    accountId: 'acc_001',
    amount: -450,
    currency: 'EUR',
    purpose: 'Gartenpflege Juni',
    counterpartName: 'Hausmeister Service',
    bookingDate: '2024-06-12',
    type: 'Ausgang',
    category: 'maintenance',
    status: 'Gebucht'
  },
  {
    id: 'tx_003',
    accountId: 'acc_002',
    amount: 500,
    currency: 'EUR',
    purpose: 'Monatliche Rücklage',
    counterpartName: 'Interne Überweisung',
    bookingDate: '2024-06-11',
    type: 'Eingang',
    category: 'transfer',
    status: 'Gebucht'
  },
  {
    id: 'tx_004',
    accountId: 'acc_001',
    amount: 1200,
    currency: 'EUR',
    purpose: 'Nachzahlung Rückstand',
    counterpartName: 'Familie Schmidt',
    bookingDate: '2024-06-10',
    type: 'Eingang',
    category: 'rent',
    status: 'Gebucht'
  }
];

// KPI-Berechnung
function calculateKPIs(accounts, transactions) {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const monthlyTransactions = transactions.filter(tx => 
    tx.bookingDate.startsWith(currentMonth)
  );
  
  const income = monthlyTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const expenses = monthlyTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  
  const totalLiquidity = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  const automatedTransactions = monthlyTransactions.filter(tx => 
    tx.category === 'rent' || tx.category === 'utilities'
  ).length;
  
  const automationRate = monthlyTransactions.length > 0 
    ? Math.round((automatedTransactions / monthlyTransactions.length) * 100)
    : 0;
  
  return {
    monthly_cashflow: income - expenses,
    total_liquidity: totalLiquidity,
    monthly_income: income,
    monthly_expenses: expenses,
    automation_rate: automationRate,
    monthly_transactions: monthlyTransactions.length,
    last_update: new Date().toISOString()
  };
}

// API-Endpoints

// Konten abrufen
app.get('/api/banking/accounts', async (req, res) => {
  try {
    // TODO: Echte FinAPI-Integration
    // const accounts = await finApiIntegration.getAccounts();
    
    // Aktuell: Mock-Daten
    const accounts = mockAccounts;
    
    res.json({ 
      accounts, 
      status: 'success',
      source: 'mock_data',
      last_update: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message, 
      status: 'error' 
    });
  }
});

// Transaktionen abrufen
app.get('/api/banking/transactions', async (req, res) => {
  try {
    const { accountId, fromDate } = req.query;
    
    // TODO: Echte FinAPI-Integration
    // const transactions = await finApiIntegration.getTransactions(accountId, fromDate);
    
    // Aktuell: Mock-Daten mit Filterung
    let transactions = mockTransactions;
    
    if (accountId) {
      transactions = transactions.filter(tx => tx.accountId === accountId);
    }
    
    if (fromDate) {
      transactions = transactions.filter(tx => tx.bookingDate >= fromDate);
    }
    
    res.json({ 
      transactions, 
      status: 'success',
      source: 'mock_data',
      filters: { accountId, fromDate },
      last_update: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message, 
      status: 'error' 
    });
  }
});

// Vollständige Banking-Daten
app.get('/api/banking/data', async (req, res) => {
  try {
    const accounts = mockAccounts;
    const transactions = mockTransactions;
    const kpis = calculateKPIs(accounts, transactions);
    
    res.json({
      accounts,
      transactions,
      kpis,
      status: 'success',
      source: 'mock_data',
      last_update: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message, 
      status: 'error' 
    });
  }
});

// FinAPI Status
app.get('/api/finapi/status', async (req, res) => {
  try {
    const tokens = await loadTokens();
    const hasTokens = tokens && tokens.access_token;
    
    res.json({
      status: hasTokens ? 'connected' : 'disconnected',
      base_url: 'https://api.finapi.io',
      has_tokens: hasTokens,
      token_expiry: tokens ? tokens.expires_at : null,
      last_check: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message, 
      status: 'error' 
    });
  }
});

// Token-Speicherung
app.post('/api/tokens/store', async (req, res) => {
  try {
    const tokens = req.body;
    const success = await saveTokens(tokens);
    
    if (success) {
      res.json({ 
        status: 'success', 
        message: 'Tokens gespeichert',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        status: 'error', 
        message: 'Token-Speicherung fehlgeschlagen' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message, 
      status: 'error' 
    });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'clara360-banking-proxy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏦 Clara360 Banking API Proxy läuft auf Port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Banking Data: http://localhost:${PORT}/api/banking/data`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Banking API Proxy wird beendet...');
  process.exit(0);
});

module.exports = app;

