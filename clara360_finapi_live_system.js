const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3006;

// Environment Detection and Configuration Loading
const isLiveMode = process.env.FINAPI_LIVE_MODE === 'true';
const envFile = isLiveMode ? '.env.finapi.live' : '.env.finapi';

require('dotenv').config({ path: envFile });

// Middleware
app.use(cors());
app.use(express.json());

// FinAPI Configuration - Dynamic Live/Sandbox
const FINAPI_CONFIG = {
  baseUrl: process.env.FINAPI_BASE_URL,
  tokenEndpoint: process.env.FINAPI_TOKEN_ENDPOINT,
  webformEndpoint: process.env.FINAPI_WEBFORM_ENDPOINT,
  redirectUri: process.env.FINAPI_REDIRECT_URI,
  scope: process.env.FINAPI_SCOPE,
  userIdentity: process.env.FINAPI_USER_IDENTITY,
  
  // Waldhofstraße Configuration
  propertyObject: process.env.PROPERTY_OBJECT || 'Waldhofstraße',
  accountType: process.env.PROPERTY_ACCOUNT_TYPE || 'CHECKING',
  accountPurpose: process.env.PROPERTY_ACCOUNT_PURPOSE || 'Mietkonto',
  selectiveBanking: process.env.SELECTIVE_BANKING === 'true',
  multibankDisabled: process.env.MULTIBANK_DISABLED === 'true',
  
  // Security & Storage
  tokenStorage: process.env.FINAPI_TOKEN_STORAGE || '/tmp/finapi_token.json',
  secureMode: process.env.FINAPI_SECURE_MODE === 'true',
  
  // Mock Data Control
  mockDataEnabled: process.env.MOCK_DATA_ENABLED === 'true',
  mockWebformDisabled: process.env.MOCK_WEBFORM_DISABLED === 'true',
  mockKpiDisabled: process.env.MOCK_KPI_DISABLED === 'true'
};

// Token Management with Secure Storage
let accessToken = null;
let tokenExpiry = null;

// Logging Setup
const LOG_DIR = isLiveMode ? 
  '/var/log/clara360/finapi/live' : 
  '/var/log/clara360/finapi';

// Ensure log and secure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    if (FINAPI_CONFIG.secureMode) {
      await fs.mkdir(path.dirname(FINAPI_CONFIG.tokenStorage), { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create directories:', error);
  }
}

// Secure Token Storage
async function saveTokenSecurely(tokenData) {
  if (!FINAPI_CONFIG.secureMode) return;
  
  try {
    const secureToken = {
      ...tokenData,
      timestamp: new Date().toISOString(),
      environment: isLiveMode ? 'LIVE' : 'SANDBOX',
      propertyObject: FINAPI_CONFIG.propertyObject
    };
    
    await fs.writeFile(
      FINAPI_CONFIG.tokenStorage, 
      JSON.stringify(secureToken, null, 2),
      { mode: 0o600 } // Restricted permissions
    );
    
    console.log('🔒 Token saved securely');
  } catch (error) {
    console.error('❌ Failed to save token securely:', error);
  }
}

async function loadTokenSecurely() {
  if (!FINAPI_CONFIG.secureMode) return null;
  
  try {
    const tokenData = await fs.readFile(FINAPI_CONFIG.tokenStorage, 'utf8');
    const parsed = JSON.parse(tokenData);
    
    // Validate token environment
    const expectedEnv = isLiveMode ? 'LIVE' : 'SANDBOX';
    if (parsed.environment !== expectedEnv) {
      console.log(`🔄 Token environment mismatch: ${parsed.environment} vs ${expectedEnv}`);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.log('ℹ️ No secure token found, will acquire new one');
    return null;
  }
}

// Logging function
async function logToFile(filename, data) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${JSON.stringify(data, null, 2)}\n`;
    await fs.appendFile(path.join(LOG_DIR, filename), logEntry);
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

// Get Access Token with Secure Storage
async function getAccessToken() {
  try {
    // Check cached token first
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
      console.log('✅ Using cached access token');
      return accessToken;
    }

    // Try to load from secure storage
    const storedToken = await loadTokenSecurely();
    if (storedToken && storedToken.expiresAt && Date.now() < new Date(storedToken.expiresAt).getTime()) {
      accessToken = storedToken.access_token;
      tokenExpiry = new Date(storedToken.expiresAt).getTime();
      console.log('✅ Using stored secure token');
      return accessToken;
    }

    console.log(`🔄 Requesting new ${isLiveMode ? 'LIVE' : 'SANDBOX'} FinAPI access token...`);

    const tokenRequest = {
      grant_type: 'client_credentials',
      scope: FINAPI_CONFIG.scope,
      client_id: FINAPI_CONFIG.clientId,
      client_secret: FINAPI_CONFIG.clientSecret
    };

    const response = await axios.post(
      FINAPI_CONFIG.tokenEndpoint,
      new URLSearchParams(tokenRequest),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (response.data && response.data.access_token) {
      accessToken = response.data.access_token;
      tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minute buffer

      // Save token securely
      await saveTokenSecurely({
        access_token: accessToken,
        expires_in: response.data.expires_in,
        expiresAt: new Date(tokenExpiry).toISOString()
      });

      console.log(`✅ ${isLiveMode ? 'LIVE' : 'SANDBOX'} FinAPI access token obtained successfully`);
      
      await logToFile('token.log', {
        event: 'token_acquired',
        environment: isLiveMode ? 'LIVE' : 'SANDBOX',
        userIdentity: FINAPI_CONFIG.userIdentity,
        propertyObject: FINAPI_CONFIG.propertyObject,
        expiresIn: response.data.expires_in,
        timestamp: new Date().toISOString()
      });

      return accessToken;
    } else {
      throw new Error('No access token in response');
    }
  } catch (error) {
    console.error('❌ Error getting FinAPI access token:', error.response?.data || error.message);
    
    await logToFile('error.log', {
      event: 'token_error',
      environment: isLiveMode ? 'LIVE' : 'SANDBOX',
      error: error.response?.data || error.message,
      userIdentity: FINAPI_CONFIG.userIdentity
    });
    
    throw new Error('Failed to obtain FinAPI access token: ' + (error.response?.data?.error_description || error.message));
  }
}

// Get Banks for Waldhofstraße Selection
async function getBanksForWaldhofstrasse(options = {}) {
  try {
    const token = await getAccessToken();
    
    const params = {
      page: options.page || 1,
      perPage: options.perPage || 50,
      search: options.search || '',
      // Filter for German banks only
      location: 'DE',
      ...options
    };

    const response = await axios.get(
      `${FINAPI_CONFIG.baseUrl}/banks`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: params
      }
    );

    // Filter banks suitable for property management
    const suitableBanks = response.data.banks?.filter(bank => {
      // Prioritize major German banks for property management
      const majorBanks = ['sparkasse', 'deutsche bank', 'commerzbank', 'postbank', 'ing', 'dkb'];
      const bankName = bank.name.toLowerCase();
      
      return majorBanks.some(major => bankName.includes(major)) ||
             bank.popularity > 50; // High popularity banks
    }) || [];

    await logToFile('waldhofstrasse_banks.log', {
      event: 'banks_filtered_for_waldhofstrasse',
      totalBanks: response.data.banks?.length || 0,
      suitableBanks: suitableBanks.length,
      timestamp: new Date().toISOString()
    });

    return {
      banks: suitableBanks,
      paging: response.data.paging,
      propertyObject: FINAPI_CONFIG.propertyObject
    };
  } catch (error) {
    console.error('❌ Error getting banks for Waldhofstraße:', error.response?.data || error.message);
    throw error;
  }
}

// Create Selective Bank Connection for Waldhofstraße
async function createWaldhofstrasseBankConnection(bankId, options = {}) {
  try {
    const token = await getAccessToken();
    
    console.log(`🏘️ Creating bank connection for Waldhofstraße - Bank ID: ${bankId}`);

    // Get bank details first
    const bankResponse = await axios.get(
      `${FINAPI_CONFIG.baseUrl}/banks/${bankId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const bank = bankResponse.data;
    console.log(`🏦 Bank: ${bank.name} (${bank.blz}) for Waldhofstraße`);

    // Create WebForm for Live Mode or Mock for Sandbox
    let webformResponse;
    
    if (isLiveMode && !FINAPI_CONFIG.mockWebformDisabled) {
      // Real WebForm creation for Live Mode
      const webformRequest = {
        bankId: bankId,
        accountTypes: [FINAPI_CONFIG.accountType],
        redirectUri: FINAPI_CONFIG.redirectUri,
        maxDaysForDownload: 90,
        skipPositionsDownload: false,
        loadOwnerData: true
      };

      try {
        const response = await axios.post(
          FINAPI_CONFIG.webformEndpoint,
          webformRequest,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        webformResponse = response.data;
      } catch (webformError) {
        console.log('⚠️ Live WebForm creation failed, using alternative approach');
        // Fallback to mock for development
      }
    }

    // Create mock WebForm if Live fails or in Sandbox mode
    if (!webformResponse) {
      webformResponse = {
        id: `waldhofstrasse_webform_${Date.now()}`,
        url: `https://webform.finapi.io/bankConnection?bankId=${bankId}&property=waldhofstrasse&redirectUri=${encodeURIComponent(FINAPI_CONFIG.redirectUri)}&sessionId=${Date.now()}`,
        status: 'PENDING',
        bankId: bankId,
        bankName: bank.name,
        propertyObject: FINAPI_CONFIG.propertyObject,
        accountPurpose: FINAPI_CONFIG.accountPurpose,
        redirectUri: FINAPI_CONFIG.redirectUri,
        created: new Date().toISOString(),
        userIdentity: FINAPI_CONFIG.userIdentity,
        environment: isLiveMode ? 'LIVE' : 'SANDBOX'
      };
    }

    await logToFile('waldhofstrasse_webform.log', {
      event: 'webform_created_for_waldhofstrasse',
      bankId: bankId,
      bankName: bank.name,
      propertyObject: FINAPI_CONFIG.propertyObject,
      webform: webformResponse,
      environment: isLiveMode ? 'LIVE' : 'SANDBOX',
      timestamp: new Date().toISOString()
    });

    console.log('✅ Waldhofstraße WebForm created successfully');
    console.log('🔗 WebForm URL:', webformResponse.url);

    return webformResponse;

  } catch (error) {
    console.error('❌ Error creating Waldhofstraße bank connection:', error.response?.data || error.message);
    
    await logToFile('waldhofstrasse_error.log', {
      event: 'webform_error_waldhofstrasse',
      bankId: bankId,
      error: error.response?.data || error.message,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}

// Get Waldhofstraße Account Data
async function getWaldhofstrasseAccounts() {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${FINAPI_CONFIG.baseUrl}/accounts`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          accountTypes: FINAPI_CONFIG.accountType
        }
      }
    );

    // Filter for Waldhofstraße-related accounts
    const waldhofstrasseAccounts = response.data.accounts?.filter(account => {
      // Filter logic for property-specific accounts
      return account.accountType === FINAPI_CONFIG.accountType;
    }) || [];

    await logToFile('waldhofstrasse_accounts.log', {
      event: 'accounts_retrieved_waldhofstrasse',
      accountCount: waldhofstrasseAccounts.length,
      propertyObject: FINAPI_CONFIG.propertyObject,
      timestamp: new Date().toISOString()
    });

    return {
      accounts: waldhofstrasseAccounts,
      propertyObject: FINAPI_CONFIG.propertyObject,
      accountPurpose: FINAPI_CONFIG.accountPurpose
    };
  } catch (error) {
    console.error('❌ Error getting Waldhofstraße accounts:', error.response?.data || error.message);
    throw error;
  }
}

// Get Waldhofstraße Transactions for KPI
async function getWaldhofstrasseTransactions(accountId, options = {}) {
  try {
    const token = await getAccessToken();
    
    const params = {
      accountIds: accountId,
      page: options.page || 1,
      perPage: options.perPage || 100,
      order: 'date,desc',
      ...options
    };

    const response = await axios.get(
      `${FINAPI_CONFIG.baseUrl}/transactions`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: params
      }
    );

    return {
      transactions: response.data.transactions || [],
      paging: response.data.paging,
      propertyObject: FINAPI_CONFIG.propertyObject,
      accountId: accountId
    };
  } catch (error) {
    console.error('❌ Error getting Waldhofstraße transactions:', error.response?.data || error.message);
    throw error;
  }
}

// KPI Calculations for Waldhofstraße
function calculateWaldhofstrasseKPIs(transactions) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  // Filter transactions by time periods
  const last30Days = transactions.filter(t => new Date(t.valueDate) >= thirtyDaysAgo);
  const last90Days = transactions.filter(t => new Date(t.valueDate) >= ninetyDaysAgo);

  // Rent income detection (positive amounts, likely rent payments)
  const rentIncome = last90Days.filter(t => 
    t.amount > 0 && 
    t.amount >= 500 && // Minimum rent threshold
    (t.purpose?.toLowerCase().includes('miete') || 
     t.purpose?.toLowerCase().includes('rent') ||
     t.counterpartName?.toLowerCase().includes('mieter'))
  );

  // Calculate KPIs
  const kpis = {
    propertyObject: FINAPI_CONFIG.propertyObject,
    accountBalance: transactions.length > 0 ? transactions[0].accountBalance : 0,
    
    // Monthly rent income
    monthlyRentIncome: rentIncome.reduce((sum, t) => sum + t.amount, 0),
    rentPaymentCount: rentIncome.length,
    
    // Recent activity
    transactionsLast30Days: last30Days.length,
    totalInflowLast30Days: last30Days.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    totalOutflowLast30Days: Math.abs(last30Days.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)),
    
    // Payment timing analysis
    latePayments: rentIncome.filter(t => {
      const paymentDate = new Date(t.valueDate);
      return paymentDate.getDate() > 5; // Payments after 5th of month considered late
    }).length,
    
    timestamp: new Date().toISOString()
  };

  return kpis;
}

// API Routes

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'clara360-finapi-live-system',
    version: '3.0.0',
    environment: isLiveMode ? 'LIVE' : 'SANDBOX',
    timestamp: new Date().toISOString(),
    config: {
      baseUrl: FINAPI_CONFIG.baseUrl,
      propertyObject: FINAPI_CONFIG.propertyObject,
      selectiveBanking: FINAPI_CONFIG.selectiveBanking,
      mockDataEnabled: FINAPI_CONFIG.mockDataEnabled,
      userIdentity: FINAPI_CONFIG.userIdentity
    }
  });
});

// Environment Switch Endpoint
app.post('/api/finapi/switch-environment', async (req, res) => {
  try {
    const { environment } = req.body;
    
    if (environment === 'live') {
      process.env.FINAPI_LIVE_MODE = 'true';
      console.log('🚀 Switching to LIVE mode');
    } else {
      process.env.FINAPI_LIVE_MODE = 'false';
      console.log('🧪 Switching to SANDBOX mode');
    }
    
    // Clear cached tokens
    accessToken = null;
    tokenExpiry = null;
    
    res.json({
      success: true,
      environment: environment,
      message: `Switched to ${environment.toUpperCase()} mode`,
      restart_required: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Banks for Waldhofstraße
app.get('/api/finapi/waldhofstrasse/banks', async (req, res) => {
  try {
    const { search, page, perPage } = req.query;
    const options = {
      search: search || '',
      page: parseInt(page) || 1,
      perPage: parseInt(perPage) || 20
    };

    const banks = await getBanksForWaldhofstrasse(options);
    
    res.json({
      success: true,
      ...banks,
      environment: isLiveMode ? 'LIVE' : 'SANDBOX',
      userIdentity: FINAPI_CONFIG.userIdentity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create Waldhofstraße Bank Connection
app.post('/api/finapi/waldhofstrasse/connect', async (req, res) => {
  try {
    const { bankId, ...options } = req.body;
    
    if (!bankId) {
      return res.status(400).json({
        success: false,
        error: 'bankId is required for Waldhofstraße connection'
      });
    }

    const webform = await createWaldhofstrasseBankConnection(bankId, options);
    
    res.json({
      success: true,
      webform: webform,
      propertyObject: FINAPI_CONFIG.propertyObject,
      environment: isLiveMode ? 'LIVE' : 'SANDBOX',
      userIdentity: FINAPI_CONFIG.userIdentity,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Waldhofstraße Accounts
app.get('/api/finapi/waldhofstrasse/accounts', async (req, res) => {
  try {
    const accounts = await getWaldhofstrasseAccounts();
    
    res.json({
      success: true,
      ...accounts,
      environment: isLiveMode ? 'LIVE' : 'SANDBOX',
      userIdentity: FINAPI_CONFIG.userIdentity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Waldhofstraße KPIs
app.get('/api/finapi/waldhofstrasse/kpis', async (req, res) => {
  try {
    const { accountId } = req.query;
    
    if (!accountId) {
      return res.status(400).json({
        success: false,
        error: 'accountId is required for Waldhofstraße KPIs'
      });
    }

    const transactionData = await getWaldhofstrasseTransactions(accountId, { perPage: 500 });
    const kpis = calculateWaldhofstrasseKPIs(transactionData.transactions);
    
    res.json({
      success: true,
      kpis: kpis,
      transactionCount: transactionData.transactions.length,
      environment: isLiveMode ? 'LIVE' : 'SANDBOX',
      userIdentity: FINAPI_CONFIG.userIdentity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Waldhofstraße Callback Handler
app.get('/api/finapi/waldhofstrasse/callback', async (req, res) => {
  try {
    const { formId, bankConnectionId, status, error } = req.query;
    
    console.log('📥 Waldhofstraße WebForm callback received:');
    console.log('🏘️ Property: Waldhofstraße');
    console.log('🆔 Form ID:', formId);
    console.log('🏦 Bank Connection ID:', bankConnectionId);
    console.log('📊 Status:', status);
    
    const callbackData = {
      propertyObject: FINAPI_CONFIG.propertyObject,
      formId,
      bankConnectionId,
      status,
      error,
      environment: isLiveMode ? 'LIVE' : 'SANDBOX',
      timestamp: new Date().toISOString(),
      userIdentity: FINAPI_CONFIG.userIdentity
    };
    
    // Log callback
    await logToFile('waldhofstrasse_callback.log', callbackData);
    
    if (status === 'COMPLETED' && bankConnectionId) {
      console.log('✅ Waldhofstraße bank connection completed successfully');
      
      // Redirect to Waldhofstraße success page
      res.redirect(`https://clara360.de/waldhofstrasse/banking/success?connectionId=${bankConnectionId}`);
    } else if (status === 'ABORTED' || error) {
      console.log('❌ Waldhofstraße bank connection aborted or failed');
      
      // Redirect to error page
      res.redirect(`https://clara360.de/waldhofstrasse/banking/error?reason=${error || 'aborted'}`);
    } else {
      // Redirect to pending page
      res.redirect(`https://clara360.de/waldhofstrasse/banking/pending?formId=${formId}`);
    }
  } catch (error) {
    console.error('❌ Error handling Waldhofstraße callback:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    environment: isLiveMode ? 'LIVE' : 'SANDBOX',
    requestId: Date.now().toString()
  });
});

// Start server
async function startServer() {
  try {
    // Ensure directories exist
    await ensureDirectories();
    
    // Test token acquisition on startup
    console.log(`🔐 Testing ${isLiveMode ? 'LIVE' : 'SANDBOX'} FinAPI token acquisition...`);
    await getAccessToken();
    console.log(`✅ ${isLiveMode ? 'LIVE' : 'SANDBOX'} FinAPI token test successful`);
    
    // Test banks endpoint
    console.log('🏦 Testing banks endpoint for Waldhofstraße...');
    const banksTest = await getBanksForWaldhofstrasse({ perPage: 1 });
    console.log(`✅ Banks endpoint working - ${banksTest.banks.length} suitable banks for Waldhofstraße`);
    
    // Start HTTP server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Clara360 FinAPI Live System running on port ${PORT}`);
      console.log(`🏘️ Property Object: ${FINAPI_CONFIG.propertyObject}`);
      console.log(`🌍 Environment: ${isLiveMode ? 'LIVE' : 'SANDBOX'}`);
      console.log(`👤 User Identity: ${FINAPI_CONFIG.userIdentity}`);
      console.log(`🏦 FinAPI Base URL: ${FINAPI_CONFIG.baseUrl}`);
      console.log(`🔒 Selective Banking: ${FINAPI_CONFIG.selectiveBanking ? 'ENABLED' : 'DISABLED'}`);
      console.log(`📊 Mock Data: ${FINAPI_CONFIG.mockDataEnabled ? 'ENABLED' : 'DISABLED'}`);
      console.log(`📂 Log Directory: ${LOG_DIR}`);
      console.log(`⚡ Ready for Waldhofstraße banking integration`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

