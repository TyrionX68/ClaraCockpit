// Clara360 Banking API Proxy Server - LIVE FINAPI INTEGRATION
// Node.js/Express Backend für echte FinAPI-Integration
require("dotenv").config();

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// FinAPI-Konfiguration
const FINAPI_BASE_URL = 'https://api.finapi.io';
const TOKEN_FILE = '/var/www/clara360/tokens/finapi.json';

// Token-Management
async function loadTokens() {
  try {
    const data = await fs.readFile(TOKEN_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Token-Laden fehlgeschlagen:', error);
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

async function refreshTokenIfNeeded() {
  const tokens = await loadTokens();
  if (!tokens) return null;
  
  const expiresAt = new Date(tokens.expires_at);
  const now = new Date();
  
  // Refresh 5 Minuten vor Ablauf
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    console.log('🔄 Token läuft ab, erneuere...');
    return await generateNewToken();
  }
  
  return tokens.access_token;
}

async function generateNewToken() {
  try {
    const response = await fetch(`${FINAPI_BASE_URL}/api/v2/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: FINAPI_CLIENT_ID,
        client_secret: FINAPI_CLIENT_SECRET
      })
    });
    
    const data = await response.json();
    
    if (data.access_token) {
      const tokens = {
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        scope: data.scope,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (data.expires_in * 1000)).toISOString()
      };
      
      await saveTokens(tokens);
      console.log('✅ Neues Token generiert und gespeichert');
      return tokens.access_token;
    }
    
    throw new Error('Kein Access Token erhalten');
  } catch (error) {
    console.error('❌ Token-Generierung fehlgeschlagen:', error);
    return null;
  }
}

// FinAPI-Helper-Funktionen
async function makeFinAPIRequest(endpoint, options = {}) {
  const token = await refreshTokenIfNeeded();
  if (!token) {
    throw new Error('Kein gültiges Token verfügbar');
  }
  
  const url = `${FINAPI_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`FinAPI Error ${response.status}: ${errorData}`);
  }
  
  return await response.json();
}

// Mock-Daten als Fallback (für Demo-Zwecke)
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
    tx.bookingDate && tx.bookingDate.startsWith(currentMonth)
  );
  
  const income = monthlyTransactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const expenses = monthlyTransactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  
  const totalLiquidity = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  
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
    // Versuche echte FinAPI-Daten zu laden
    try {
      const finApiData = await makeFinAPIRequest('/accounts');
      
      // Konvertiere FinAPI-Format zu Clara360-Format
      const accounts = finApiData.accounts?.map(account => ({
        id: account.id,
        name: account.accountName || account.accountTypeName,
        iban: account.iban,
        balance: account.balance || 0,
        currency: account.currency || 'EUR',
        type: account.accountType?.toLowerCase() || 'checking',
        bankName: account.bank?.name || 'Unbekannte Bank',
        lastUpdate: new Date().toISOString()
      })) || [];
      
      res.json({ 
        accounts, 
        status: 'success',
        source: 'finapi_live',
        last_update: new Date().toISOString()
      });
    } catch (finApiError) {
      console.log('⚠️ FinAPI-Fehler, verwende Mock-Daten:', finApiError.message);
      
      // Fallback auf Mock-Daten
      res.json({ 
        accounts: mockAccounts, 
        status: 'success',
        source: 'mock_data_fallback',
        finapi_error: finApiError.message,
        last_update: new Date().toISOString()
      });
    }
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
    
    // Versuche echte FinAPI-Daten zu laden
    try {
      let endpoint = '/transactions';
      const params = new URLSearchParams();
      
      if (accountId) params.append('accountIds', accountId);
      if (fromDate) params.append('minBankBookingDate', fromDate);
      
      if (params.toString()) {
        endpoint += '?' + params.toString();
      }
      
      const finApiData = await makeFinAPIRequest(endpoint);
      
      // Konvertiere FinAPI-Format zu Clara360-Format
      const transactions = finApiData.transactions?.map(tx => ({
        id: tx.id,
        accountId: tx.accountId,
        amount: tx.amount,
        currency: tx.currency || 'EUR',
        purpose: tx.purpose || tx.remittanceInformationUnstructured,
        counterpartName: tx.counterpartName,
        bookingDate: tx.bankBookingDate || tx.valueDate,
        type: tx.amount > 0 ? 'Eingang' : 'Ausgang',
        category: tx.category?.name || 'uncategorized',
        status: 'Gebucht'
      })) || [];
      
      res.json({ 
        transactions, 
        status: 'success',
        source: 'finapi_live',
        filters: { accountId, fromDate },
        last_update: new Date().toISOString()
      });
    } catch (finApiError) {
      console.log('⚠️ FinAPI-Fehler, verwende Mock-Daten:', finApiError.message);
      
      // Fallback auf Mock-Daten mit Filterung
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
        source: 'mock_data_fallback',
        finapi_error: finApiError.message,
        filters: { accountId, fromDate },
        last_update: new Date().toISOString()
      });
    }
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
    let accounts = mockAccounts;
    let transactions = mockTransactions;
    let dataSource = 'mock_data_fallback';
    let finApiError = null;
    
    // Versuche echte FinAPI-Daten zu laden
    try {
      const [accountsData, transactionsData] = await Promise.all([
        makeFinAPIRequest('/accounts'),
        makeFinAPIRequest('/transactions')
      ]);
      
      // Konvertiere FinAPI-Daten
      if (accountsData.accounts) {
        accounts = accountsData.accounts.map(account => ({
          id: account.id,
          name: account.accountName || account.accountTypeName,
          iban: account.iban,
          balance: account.balance || 0,
          currency: account.currency || 'EUR',
          type: account.accountType?.toLowerCase() || 'checking',
          bankName: account.bank?.name || 'Unbekannte Bank',
          lastUpdate: new Date().toISOString()
        }));
        dataSource = 'finapi_live';
      }
      
      if (transactionsData.transactions) {
        transactions = transactionsData.transactions.map(tx => ({
          id: tx.id,
          accountId: tx.accountId,
          amount: tx.amount,
          currency: tx.currency || 'EUR',
          purpose: tx.purpose || tx.remittanceInformationUnstructured,
          counterpartName: tx.counterpartName,
          bookingDate: tx.bankBookingDate || tx.valueDate,
          type: tx.amount > 0 ? 'Eingang' : 'Ausgang',
          category: tx.category?.name || 'uncategorized',
          status: 'Gebucht'
        }));
      }
    } catch (error) {
      console.log('⚠️ FinAPI-Fehler, verwende Mock-Daten:', error.message);
      finApiError = error.message;
    }
    
    const kpis = calculateKPIs(accounts, transactions);
    
    const response = {
      accounts,
      transactions,
      kpis,
      status: 'success',
      source: dataSource,
      last_update: new Date().toISOString()
    };
    
    if (finApiError) {
      response.finapi_error = finApiError;
    }
    
    res.json(response);
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
    
    let connectionStatus = 'disconnected';
    let lastApiCall = null;
    
    if (hasTokens) {
      try {
        // Teste Verbindung mit einfachem API-Call
        await makeFinAPIRequest('/banks?page=1&perPage=1');
        connectionStatus = 'connected';
        lastApiCall = new Date().toISOString();
      } catch (error) {
        connectionStatus = 'error';
        lastApiCall = error.message;
      }
    }
    
    res.json({
      status: connectionStatus,
      base_url: FINAPI_BASE_URL,
      has_tokens: hasTokens,
      token_expiry: tokens ? tokens.expires_at : null,
      last_api_call: lastApiCall,
      last_check: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message, 
      status: 'error' 
    });
  }
});

// Verfügbare Banken
// FinAPI Authentication Endpoint
app.post('/api/finapi/authenticate', async (req, res) => {
  console.log('🔐 FinAPI-Authentifizierung gestartet...');
  
  try {
    // Lade FinAPI-Credentials aus .env oder direkt
    const FINAPI_CLIENT_ID = process.env.FINAPI_CLIENT_ID || 'clara360_finapi_client';
    const FINAPI_CLIENT_SECRET = process.env.FINAPI_CLIENT_SECRET || 'clara360_finapi_secret_2024';
    console.log("DEBUG - CLIENT_ID:", FINAPI_CLIENT_ID);
    console.log("DEBUG - CLIENT_SECRET:", FINAPI_CLIENT_SECRET ? "[HIDDEN]" : "undefined");
    
    if (!FINAPI_CLIENT_ID || !FINAPI_CLIENT_SECRET) {
      console.error('❌ FinAPI-Credentials fehlen');
      return res.status(500).json({ 
        error: 'FinAPI-Credentials nicht konfiguriert',
        status: 'configuration_error'
      });
    }
    
    console.log('📡 Sende OAuth-Request an FinAPI...');
    
    // OAuth-Token von FinAPI anfordern
    const https = require('https');
    const querystring = require('querystring');
    
    const postData = querystring.stringify({
      grant_type: 'client_credentials',
      client_id: FINAPI_CLIENT_ID,
      client_secret: FINAPI_CLIENT_SECRET
    });
    
    const options = {
      hostname: 'sandbox.finapi.io',
      port: 443,
      path: '/api/v2/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', async () => {
        try {
          if (response.statusCode === 200) {
            const tokenResponse = JSON.parse(data);
            console.log('✅ FinAPI-Token erhalten');
            
            // Token mit Timestamp speichern
            const tokenData = {
              access_token: tokenResponse.access_token,
              token_type: tokenResponse.token_type,
              expires_in: tokenResponse.expires_in,
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + (tokenResponse.expires_in * 1000)).toISOString()
            };
            
            // Token in Datei speichern
            await fs.writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
            console.log('💾 Token gespeichert in:', TOKEN_FILE);
            
            // Erfolgreiche Antwort
            res.json({ 
              status: 'token_created',
              message: 'FinAPI-Token erfolgreich erstellt und gespeichert',
              access_token: tokenData.access_token,
              expires_in: tokenData.expires_in,
              created_at: tokenData.created_at
            });
          } else {
            console.error('❌ FinAPI-Fehler:', response.statusCode, data);
            res.status(response.statusCode).json({
              error: 'FinAPI-Authentifizierung fehlgeschlagen',
              status: 'finapi_error',
              details: JSON.parse(data)
            });
          }
        } catch (parseError) {
          console.error('❌ JSON-Parse-Fehler:', parseError.message);
          res.status(500).json({
            error: 'Fehler beim Verarbeiten der FinAPI-Antwort',
            status: 'parse_error',
            details: parseError.message
          });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ HTTPS-Request-Fehler:', error.message);
      res.status(500).json({
        error: 'Netzwerkfehler bei FinAPI-Verbindung',
        status: 'network_error',
        details: error.message
      });
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ FinAPI-Authentifizierung fehlgeschlagen:', error.message);
    res.status(500).json({
      error: 'Unbekannter Fehler bei FinAPI-Authentifizierung',
      status: 'unknown_error',
      details: error.message
    });
  }
});

// GET /api/finapi/authenticate - Token-Status prüfen
app.get('/api/finapi/authenticate', async (req, res) => {
  try {
    const tokens = await loadTokens();
    
    if (!tokens || !tokens.access_token) {
      return res.json({
        status: 'no_token',
        message: 'Kein Token vorhanden'
      });
    }
    
    const now = new Date();
    const expiresAt = new Date(tokens.expires_at);
    
    if (now >= expiresAt) {
      return res.json({
        status: 'token_expired',
        message: 'Token ist abgelaufen',
        expired_at: tokens.expires_at
      });
    }
    
    res.json({
      status: 'token_valid',
      message: 'Token ist gültig',
      created_at: tokens.created_at,
      expires_at: tokens.expires_at,
      expires_in_seconds: Math.floor((expiresAt - now) / 1000)
    });
    
  } catch (error) {
    console.error('❌ Token-Status-Prüfung fehlgeschlagen:', error.message);
    res.status(500).json({
      error: 'Token-Status konnte nicht geprüft werden',
      details: error.message
    });
  }
});


app.get('/api/finapi/banks', async (req, res) => {
  try {
    const banksData = await makeFinAPIRequest('/banks?page=1&perPage=50');
    
    res.json({
      banks: banksData.banks || [],
      status: 'success',
      source: 'finapi_live',
      last_update: new Date().toISOString()
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
    version: '2.0.0-finapi-live',
    finapi_integration: 'active',
    timestamp: new Date().toISOString()
  });
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏦 Clara360 Banking API Proxy läuft auf Port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Banking Data: http://localhost:${PORT}/api/banking/data`);
  console.log(`🏛️ FinAPI Status: http://localhost:${PORT}/api/finapi/status`);
  console.log(`🌐 FinAPI Base URL: ${FINAPI_BASE_URL}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Banking API Proxy wird beendet...');
  process.exit(0);
});

module.exports = app;

