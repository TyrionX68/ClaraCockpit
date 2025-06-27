const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.finapi' });

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// FinAPI Configuration
const FINAPI_CONFIG = {
  baseUrl: process.env.FINAPI_BASE_URL,
  tokenEndpoint: process.env.FINAPI_TOKEN_ENDPOINT,
  webformEndpoint: process.env.FINAPI_WEBFORM_ENDPOINT,
  redirectUri: process.env.FINAPI_REDIRECT_URI,
  scope: process.env.FINAPI_SCOPE,
  userIdentity: process.env.FINAPI_USER_IDENTITY
};

// Token Management
let accessToken = null;
let tokenExpiry = null;

// Logging Setup
const LOG_DIR = process.env.FINAPI_LOG_DIR || '/var/log/clara360/finapi';

// Ensure log directory exists
async function ensureLogDir() {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create log directory:', error);
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

// Get Access Token using Client Credentials Flow
async function getAccessToken() {
  try {
    // Check if token is still valid
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
      console.log('✅ Using cached FinAPI access token');
      return accessToken;
    }

    console.log('🔄 Requesting new FinAPI access token...');

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

      console.log('✅ FinAPI access token obtained successfully');
      
      await logToFile('token.log', {
        event: 'token_acquired',
        userIdentity: FINAPI_CONFIG.userIdentity,
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
      error: error.response?.data || error.message,
      userIdentity: FINAPI_CONFIG.userIdentity
    });
    
    throw new Error('Failed to obtain FinAPI access token: ' + (error.response?.data?.error_description || error.message));
  }
}

// Create WebForm for Bank Connection Import
async function createWebForm(options = {}) {
  try {
    const token = await getAccessToken();
    
    const webformRequest = {
      accountTypes: options.accountTypes || ['CHECKING', 'SAVINGS'],
      redirectUri: FINAPI_CONFIG.redirectUri,
      ...options
    };

    console.log('🌐 Creating FinAPI WebForm...');
    console.log('📋 Request:', webformRequest);

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

    if (response.data) {
      console.log('✅ WebForm created successfully');
      console.log('🔗 WebForm URL:', response.data.url);
      
      await logToFile('webform.log', {
        event: 'webform_created',
        formId: response.data.id,
        url: response.data.url,
        userIdentity: FINAPI_CONFIG.userIdentity,
        timestamp: new Date().toISOString()
      });

      return response.data;
    } else {
      throw new Error('No WebForm data in response');
    }
  } catch (error) {
    console.error('❌ Error creating WebForm:', error.response?.data || error.message);
    
    await logToFile('error.log', {
      event: 'webform_error',
      error: error.response?.data || error.message,
      userIdentity: FINAPI_CONFIG.userIdentity
    });
    
    throw error;
  }
}

// Get Bank Connections
async function getBankConnections() {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${FINAPI_CONFIG.baseUrl}/bankConnections`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error getting bank connections:', error.response?.data || error.message);
    throw error;
  }
}

// Get Accounts
async function getAccounts() {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${FINAPI_CONFIG.baseUrl}/accounts`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error getting accounts:', error.response?.data || error.message);
    throw error;
  }
}

// Search Institutions
async function searchInstitutions(query) {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${FINAPI_CONFIG.baseUrl}/institutions`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          search: query,
          page: 1,
          perPage: 20
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error searching institutions:', error.response?.data || error.message);
    throw error;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'clara360-finapi-integration',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    config: {
      baseUrl: FINAPI_CONFIG.baseUrl,
      clientId: FINAPI_CONFIG.clientId,
      userIdentity: FINAPI_CONFIG.userIdentity,
      redirectUri: FINAPI_CONFIG.redirectUri
    }
  });
});

// Test token endpoint
app.get('/api/finapi/token-test', async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({
      success: true,
      tokenObtained: !!token,
      tokenLength: token ? token.length : 0,
      expiresAt: new Date(tokenExpiry).toISOString(),
      userIdentity: FINAPI_CONFIG.userIdentity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create WebForm
app.post('/api/finapi/webform', async (req, res) => {
  try {
    const options = req.body;
    const webform = await createWebForm(options);
    
    res.json({
      success: true,
      webform: webform,
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

// WebForm Callback Handler
app.get('/api/finapi/callback', async (req, res) => {
  try {
    const { formId, bankConnectionId, status, error } = req.query;
    
    console.log('📥 WebForm callback received:');
    console.log('🆔 Form ID:', formId);
    console.log('🏦 Bank Connection ID:', bankConnectionId);
    console.log('📊 Status:', status);
    
    const callbackData = {
      formId,
      bankConnectionId,
      status,
      error,
      timestamp: new Date().toISOString(),
      userIdentity: FINAPI_CONFIG.userIdentity
    };
    
    // Log callback
    await logToFile('form-status.json', callbackData);
    
    if (status === 'COMPLETED' && bankConnectionId) {
      console.log('✅ Bank connection completed successfully');
      
      // Redirect to success page
      res.redirect(`https://clara360.de/banking/success?connectionId=${bankConnectionId}`);
    } else if (status === 'ABORTED' || error) {
      console.log('❌ Bank connection aborted or failed');
      
      // Redirect to error page
      res.redirect(`https://clara360.de/banking/error?reason=${error || 'aborted'}`);
    } else {
      // Redirect to pending page
      res.redirect(`https://clara360.de/banking/pending?formId=${formId}`);
    }
  } catch (error) {
    console.error('❌ Error handling callback:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get bank connections
app.get('/api/finapi/bank-connections', async (req, res) => {
  try {
    const connections = await getBankConnections();
    res.json({
      success: true,
      connections: connections,
      userIdentity: FINAPI_CONFIG.userIdentity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get accounts
app.get('/api/finapi/accounts', async (req, res) => {
  try {
    const accounts = await getAccounts();
    res.json({
      success: true,
      accounts: accounts,
      userIdentity: FINAPI_CONFIG.userIdentity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search institutions
app.get('/api/finapi/institutions', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter required'
      });
    }
    
    const institutions = await searchInstitutions(query);
    res.json({
      success: true,
      institutions: institutions,
      query: query
    });
  } catch (error) {
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
    requestId: Date.now().toString()
  });
});

// Start server
async function startServer() {
  try {
    // Ensure log directory exists
    await ensureLogDir();
    
    // Test token acquisition on startup
    console.log('🔐 Testing FinAPI token acquisition...');
    await getAccessToken();
    console.log('✅ FinAPI token test successful');
    
    // Start HTTP server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Clara360 FinAPI Integration Server running on port ${PORT}`);
      console.log(`👤 User Identity: ${FINAPI_CONFIG.userIdentity}`);
      console.log(`🏦 FinAPI Base URL: ${FINAPI_CONFIG.baseUrl}`);
      console.log(`🔗 Redirect URI: ${FINAPI_CONFIG.redirectUri}`);
      console.log(`📂 Log Directory: ${LOG_DIR}`);
      console.log(`⚡ Ready to process FinAPI requests`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

