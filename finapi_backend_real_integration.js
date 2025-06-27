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

// FinAPI Access Token abrufen
async function getFinAPIAccessToken() {
    try {
        const response = await fetch(`${FINAPI_CONFIG.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${FINAPI_CONFIG.clientId}:${FINAPI_CONFIG.clientSecret}`).toString('base64')}`
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            throw new Error(`FinAPI OAuth failed: ${response.statusText}`);
        }

        const tokenData = await response.json();
        return tokenData.access_token;
    } catch (error) {
        console.error('FinAPI Access Token Error:', error);
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
        
        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`FinAPI Search failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // FinAPI Response in unser Format konvertieren
        const institutions = data.institutions.map(inst => ({
            id: inst.id,
            name: inst.name,
            bic: inst.bic,
            blz: inst.blz,
            location: inst.location || 'Deutschland',
            loginHint: inst.loginHint,
            isSupported: inst.isSupported
        }));

        const result = {
            institutions,
            query,
            count: institutions.length,
            totalCount: data.paging?.totalCount || institutions.length,
            source: 'finapi-live',
            requestId
        };

        console.log(`[${new Date().toISOString()}] FinAPI Search Success: ${institutions.length} institutions found for "${query}"`);
        res.json(result);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] FinAPI Search Error:`, error);
        res.status(500).json({
            error: 'FinAPI search failed',
            message: error.message,
            requestId,
            source: 'finapi-live'
        });
    }
});

// ECHTE FinAPI OAuth Initiation - KEINE MOCK-DATEN
app.post('/api/initiate-oauth', async (req, res) => {
    const requestId = logRequest(req, '/api/initiate-oauth', req.body);
    const { bankId, bankName } = req.body;

    if (!bankId) {
        return res.status(400).json({
            error: 'Bank ID required',
            requestId
        });
    }

    try {
        // Echten FinAPI Access Token abrufen
        const accessToken = await getFinAPIAccessToken();

        // State für OAuth-Flow generieren
        const state = requestId;
        const redirectUri = 'https://psd2.clara360.de/oauth/callback';

        // Echte FinAPI OAuth URL erstellen
        const oauthUrl = `${FINAPI_CONFIG.baseUrl}/oauth/authorize?` +
            `client_id=${FINAPI_CONFIG.clientId}&` +
            `response_type=code&` +
            `state=${state}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `bank_id=${bankId}`;

        const result = {
            oauthUrl,
            bankId: parseInt(bankId),
            bankName,
            state,
            redirectUri,
            expiresIn: 300,
            source: 'finapi-live',
            requestId
        };

        console.log(`[${new Date().toISOString()}] OAuth Initiation Success for Bank ID: ${bankId}`);
        res.json(result);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] OAuth Initiation Error:`, error);
        res.status(500).json({
            error: 'OAuth initiation failed',
            message: error.message,
            requestId,
            source: 'finapi-live'
        });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    const requestId = logRequest(req, '/api/health');
    res.json({
        status: 'healthy',
        service: 'clara360-finapi-backend',
        version: '3.0-real-integration',
        timestamp: new Date().toISOString(),
        finapi: {
            baseUrl: FINAPI_CONFIG.baseUrl,
            configured: !!(FINAPI_CONFIG.clientId && FINAPI_CONFIG.clientSecret)
        },
        requestId
    });
});

// Error Handler
app.use((error, req, res, next) => {
    console.error('Unhandled Error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Server starten
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Clara360 FinAPI Backend v3.0 (REAL INTEGRATION) running on port ${PORT}`);
    console.log(`📊 FinAPI Base URL: ${FINAPI_CONFIG.baseUrl}`);
    console.log(`🔑 Client ID configured: ${!!FINAPI_CONFIG.clientId}`);
    console.log(`⚡ Ready for REAL FinAPI integration - NO MOCK DATA`);
});

module.exports = app;

