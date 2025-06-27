const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// CORS für alle Origins aktivieren
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json());

// FinAPI Konfiguration - ECHTE API-INTEGRATION
const FINAPI_CONFIG = {
    baseUrl: 'https://sandbox.finapi.io/api/v2',
};

// In-Memory Storage für WebForm-Status (in Produktion: Redis/Database)
const webFormStorage = new Map();

// Logging-Funktion
function logRequest(req, endpoint, data = null) {
    const requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Request-ID: ${requestId} – Endpoint: ${endpoint}`);
    if (data) {
        console.log(`[${timestamp}] Data:`, JSON.stringify(data, null, 2));
    }
    return requestId;
}

// FinAPI Access Token abrufen - KORRIGIERTE IMPLEMENTIERUNG
async function getFinAPIAccessToken() {
    try {
        console.log('🔑 Requesting FinAPI Access Token...');
        console.log('📊 Client ID:', FINAPI_CONFIG.clientId);
        console.log('📊 Base URL:', FINAPI_CONFIG.baseUrl);
        
        const response = await fetch(`${FINAPI_CONFIG.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=client_credentials&scope=ALL_ACCOUNTS&client_id=${FINAPI_CONFIG.clientId}&client_secret=${FINAPI_CONFIG.clientSecret}`
        });

        console.log('📊 OAuth Response Status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ OAuth Error Response:', errorText);
            throw new Error(`FinAPI OAuth failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const tokenData = await response.json();
        console.log('✅ OAuth Success - Token received');
        return tokenData.access_token;
    } catch (error) {
        console.error('❌ FinAPI Access Token Error:', error);
        throw error;
    }
}

// ECHTE FinAPI Institution Search - KEINE MOCK-DATEN
app.get('/api/search-institutions', async (req, res) => {
    const requestId = logRequest(req, '/api/search-institutions');
    const query = req.query.query;

    if (!query || query.length < 2) {
        return res.status(400).json({
            error: 'Query parameter required (min 2 characters)',
            requestId
        });
    }

    try {
        // Echten FinAPI Access Token abrufen
        const accessToken = await getFinAPIAccessToken();

        // Echte FinAPI Institution Search
        const searchUrl = `${FINAPI_CONFIG.baseUrl}/institutions?search=${encodeURIComponent(query)}&page=1&perPage=50`;
        
        console.log('🔍 Searching institutions:', searchUrl);
        
        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Institution Search Response Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Institution Search Error:', errorText);
            throw new Error(`FinAPI Institution Search failed: ${response.status} ${response.statusText}`);
        }

        const institutionsData = await response.json();
        console.log('✅ Institution Search Success - Found:', institutionsData.institutions?.length || 0, 'institutions');

        // Echte FinAPI-Daten zurückgeben
        res.json({
            institutions: institutionsData.institutions || [],
            totalCount: institutionsData.paging?.totalCount || 0,
            requestId,
            source: 'finapi-sandbox'
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] FinAPI Search Error:`, error);
        res.status(500).json({
            error: 'FinAPI search failed',
            message: error.message,
            requestId,
            source: 'finapi-sandbox'
        });
    }
});

// WebForm Creation Endpoint - ECHTE FINAPI WEBFORM
app.post('/api/webforms/bank-connection-import', async (req, res) => {
    const requestId = logRequest(req, '/api/webforms/bank-connection-import', req.body);

    try {
        // Echten FinAPI Access Token abrufen
        const accessToken = await getFinAPIAccessToken();

        const webFormData = {
            accountTypes: req.body.accountTypes || ['CHECKING', 'SAVINGS'],
            redirectUri: req.body.redirectUri || 'https://clara360.de/webform/callback',
            callbackUrl: req.body.callbackUrl || 'https://clara360.de/api/webform-finished'
        };

        console.log('🔗 Creating FinAPI WebForm:', webFormData);

        const response = await fetch(`${FINAPI_CONFIG.baseUrl}/webForms/bankConnectionImport`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webFormData)
        });

        console.log('📊 WebForm Creation Response Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ WebForm Creation Error:', errorText);
            throw new Error(`FinAPI WebForm creation failed: ${response.status} ${response.statusText}`);
        }

        const webFormResponse = await response.json();
        console.log('✅ WebForm Creation Success - Form ID:', webFormResponse.id);

        // WebForm-Status speichern
        webFormStorage.set(webFormResponse.id, {
            formId: webFormResponse.id,
            url: webFormResponse.url,
            status: 'created',
            createdAt: new Date().toISOString(),
            requestId
        });

        res.json({
            url: webFormResponse.url,
            formId: webFormResponse.id,
            requestId,
            source: 'finapi-sandbox'
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] WebForm Creation Error:`, error);
        res.status(500).json({
            error: 'WebForm creation failed',
            message: error.message,
            requestId,
            source: 'finapi-sandbox'
        });
    }
});

// WebForm Status Check
app.get('/api/webforms/:formId/status', async (req, res) => {
    const requestId = logRequest(req, '/api/webforms/status');
    const formId = req.params.formId;

    try {
        // Echten FinAPI Access Token abrufen
        const accessToken = await getFinAPIAccessToken();

        console.log('📊 Checking WebForm status for ID:', formId);

        const response = await fetch(`${FINAPI_CONFIG.baseUrl}/webForms/${formId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 WebForm Status Response:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ WebForm Status Error:', errorText);
            throw new Error(`FinAPI WebForm status check failed: ${response.status} ${response.statusText}`);
        }

        const webFormStatus = await response.json();
        console.log('✅ WebForm Status Success:', webFormStatus.status);

        // Lokalen Status aktualisieren
        if (webFormStorage.has(formId)) {
            const localStatus = webFormStorage.get(formId);
            localStatus.status = webFormStatus.status;
            localStatus.lastChecked = new Date().toISOString();
            if (webFormStatus.payload?.bankConnectionId) {
                localStatus.bankConnectionId = webFormStatus.payload.bankConnectionId;
            }
            webFormStorage.set(formId, localStatus);
        }

        res.json({
            formId,
            status: webFormStatus.status,
            bankConnectionId: webFormStatus.payload?.bankConnectionId,
            requestId,
            source: 'finapi-sandbox'
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] WebForm Status Error:`, error);
        res.status(500).json({
            error: 'WebForm status check failed',
            message: error.message,
            requestId,
            source: 'finapi-sandbox'
        });
    }
});

// WebForm Callback Handler
app.post('/api/webform-finished', (req, res) => {
    const requestId = logRequest(req, '/api/webform-finished', req.body);
    
    console.log('🎉 WebForm Callback received:', req.body);
    
    const { formId, bankConnectionId, status } = req.body;
    
    // Lokalen Status aktualisieren
    if (formId && webFormStorage.has(formId)) {
        const localStatus = webFormStorage.get(formId);
        localStatus.status = status || 'completed';
        localStatus.bankConnectionId = bankConnectionId;
        localStatus.completedAt = new Date().toISOString();
        webFormStorage.set(formId, localStatus);
        
        console.log('✅ WebForm status updated locally');
    }
    
    res.json({
        success: true,
        message: 'WebForm callback processed',
        requestId
    });
});

// Bank Connection Details
app.get('/api/bank-connections/:connectionId', async (req, res) => {
    const requestId = logRequest(req, '/api/bank-connections');
    const connectionId = req.params.connectionId;

    try {
        // Echten FinAPI Access Token abrufen
        const accessToken = await getFinAPIAccessToken();

        console.log('🏦 Getting bank connection details for ID:', connectionId);

        const response = await fetch(`${FINAPI_CONFIG.baseUrl}/bankConnections/${connectionId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Bank Connection Response:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Bank Connection Error:', errorText);
            throw new Error(`FinAPI Bank Connection failed: ${response.status} ${response.statusText}`);
        }

        const connectionData = await response.json();
        console.log('✅ Bank Connection Success');

        res.json({
            connection: connectionData,
            requestId,
            source: 'finapi-sandbox'
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Bank Connection Error:`, error);
        res.status(500).json({
            error: 'Bank connection retrieval failed',
            message: error.message,
            requestId,
            source: 'finapi-sandbox'
        });
    }
});

// Accounts List
app.get('/api/accounts', async (req, res) => {
    const requestId = logRequest(req, '/api/accounts');

    try {
        // Echten FinAPI Access Token abrufen
        const accessToken = await getFinAPIAccessToken();

        console.log('💳 Getting accounts list');

        const response = await fetch(`${FINAPI_CONFIG.baseUrl}/accounts`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Accounts Response:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Accounts Error:', errorText);
            throw new Error(`FinAPI Accounts failed: ${response.status} ${response.statusText}`);
        }

        const accountsData = await response.json();
        console.log('✅ Accounts Success - Found:', accountsData.accounts?.length || 0, 'accounts');

        res.json({
            accounts: accountsData.accounts || [],
            totalCount: accountsData.paging?.totalCount || 0,
            requestId,
            source: 'finapi-sandbox'
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Accounts Error:`, error);
        res.status(500).json({
            error: 'Accounts retrieval failed',
            message: error.message,
            requestId,
            source: 'finapi-sandbox'
        });
    }
});

// Transactions List
app.get('/api/transactions', async (req, res) => {
    const requestId = logRequest(req, '/api/transactions');
    const accountId = req.query.accountId;

    try {
        // Echten FinAPI Access Token abrufen
        const accessToken = await getFinAPIAccessToken();

        let transactionsUrl = `${FINAPI_CONFIG.baseUrl}/transactions`;
        if (accountId) {
            transactionsUrl += `?accountId=${accountId}`;
        }

        console.log('💰 Getting transactions:', transactionsUrl);

        const response = await fetch(transactionsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Transactions Response:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Transactions Error:', errorText);
            throw new Error(`FinAPI Transactions failed: ${response.status} ${response.statusText}`);
        }

        const transactionsData = await response.json();
        console.log('✅ Transactions Success - Found:', transactionsData.transactions?.length || 0, 'transactions');

        res.json({
            transactions: transactionsData.transactions || [],
            totalCount: transactionsData.paging?.totalCount || 0,
            requestId,
            source: 'finapi-sandbox'
        });

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Transactions Error:`, error);
        res.status(500).json({
            error: 'Transactions retrieval failed',
            message: error.message,
            requestId,
            source: 'finapi-sandbox'
        });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    const requestId = logRequest(req, '/api/health');
    res.json({
        status: 'healthy',
        service: 'clara360-finapi-backend',
        version: '4.0-webform-enhanced',
        timestamp: new Date().toISOString(),
        finapi: {
            baseUrl: FINAPI_CONFIG.baseUrl,
            configured: !!FINAPI_CONFIG.clientId && !!FINAPI_CONFIG.clientSecret
        },
        webForms: {
            active: webFormStorage.size,
            storage: 'in-memory'
        },
        requestId
    });
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Clara360 FinAPI Backend v4.0 (WEBFORM ENHANCED) running on port', PORT);
    console.log('📊 FinAPI Base URL:', FINAPI_CONFIG.baseUrl);
    console.log('🔑 Client ID configured:', !!FINAPI_CONFIG.clientId);
    console.log('🔗 WebForm endpoints ready');
    console.log('⚡ Ready for COMPLETE FinAPI WebForm integration');
});

