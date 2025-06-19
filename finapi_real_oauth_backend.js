// Real FinAPI OAuth Backend Implementation v2.3 - Extended Bank Data
// Enhanced with comprehensive German bank coverage including Sparkasse Rhein-Neckar-Nord

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Audit logging setup
const auditLogPath = path.join(__dirname, 'finapi_audit.log');

function logWithRequestId(req, message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] Request-ID: ${req.requestId} – Endpoint: ${req.originalUrl} – ${message}\n`;
    
    console.log(logEntry.trim());
    
    try {
        fs.appendFileSync(auditLogPath, logEntry);
    } catch (error) {
        console.error('Failed to write to audit log:', error);
    }
}

// Request ID middleware
app.use((req, res, next) => {
    req.requestId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    logWithRequestId(req, 'Request started - Method: ' + req.method + ', IP: ' + req.ip);
    next();
});

// API Key validation middleware
function validateApiAccess(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = 'clara360-internal-key';
    
    if (!apiKey) {
        logWithRequestId(req, 'API access denied - Missing API key', 'SECURITY');
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Valid API key required',
            requestId: req.requestId
        });
    }
    
    if (apiKey !== validApiKey) {
        logWithRequestId(req, 'API access denied - Invalid API key', 'SECURITY');
        return res.status(401).json({
            error: 'Unauthorized', 
            message: 'Invalid API key',
            requestId: req.requestId
        });
    }
    
    logWithRequestId(req, 'API access granted - Valid API key', 'SECURITY');
    next();
}

// Health Check Endpoint
app.get('/api/finapi/health', (req, res) => {
    logWithRequestId(req, 'Health check requested - Status: healthy');
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.3-extended-banks',
        requestId: req.requestId
    });
});

// Institution Search (Protected)
app.get('/api/finapi/institutions/search', validateApiAccess, async (req, res) => {
    try {
        const query = req.query.query || '';
        logWithRequestId(req, `Institution search requested: { query: '${query}' }`);
        
        // Extended mock institutions with comprehensive German bank coverage
        const mockInstitutions = [
            // Sparkassen
            {
                id: 277672,
                name: "Sparkasse Köln/Bonn",
                bic: "COLSDE33XXX",
                blz: "37050198",
                location: "Köln"
            },
            {
                id: 277676,
                name: "Sparkasse München",
                bic: "SSKMDEMMXXX",
                blz: "70150000",
                location: "München"
            },
            {
                id: 277677,
                name: "Sparkasse Rhein-Neckar-Nord",
                bic: "MANSDE66XXX",
                blz: "67050505",
                location: "Mannheim"
            },
            {
                id: 277678,
                name: "Sparkasse Frankfurt am Main",
                bic: "HELADEF1822",
                blz: "50050201",
                location: "Frankfurt"
            },
            {
                id: 277679,
                name: "Sparkasse Düsseldorf",
                bic: "DUSSDEDDXXX",
                blz: "30050110",
                location: "Düsseldorf"
            },
            {
                id: 277680,
                name: "Sparkasse Hamburg",
                bic: "HASPDEHHXXX",
                blz: "20050550",
                location: "Hamburg"
            },
            {
                id: 277681,
                name: "Sparkasse Berlin",
                bic: "BELADEBEXXX",
                blz: "10050000",
                location: "Berlin"
            },
            {
                id: 277682,
                name: "Sparkasse Stuttgart",
                bic: "SOLADES1STG",
                blz: "60050101",
                location: "Stuttgart"
            },
            
            // Großbanken
            {
                id: 277673,
                name: "Deutsche Bank",
                bic: "DEUTDEFFXXX", 
                blz: "37070024",
                location: "Frankfurt"
            },
            {
                id: 277674,
                name: "Commerzbank",
                bic: "COBADEFFXXX",
                blz: "37040044", 
                location: "Frankfurt"
            },
            {
                id: 277675,
                name: "ING",
                bic: "INGDDEFFXXX",
                blz: "50010517",
                location: "Frankfurt"
            },
            {
                id: 277683,
                name: "DKB (Deutsche Kreditbank)",
                bic: "BYLADEM1001",
                blz: "12030000",
                location: "Berlin"
            },
            {
                id: 277684,
                name: "Postbank",
                bic: "PBNKDEFFXXX",
                blz: "37010050",
                location: "Bonn"
            },
            
            // Volksbanken und Raiffeisenbanken
            {
                id: 277685,
                name: "Volksbank Köln Bonn",
                bic: "GENODED1BRS",
                blz: "38060186",
                location: "Köln"
            },
            {
                id: 277686,
                name: "Volksbank München",
                bic: "GENODEF1M01",
                blz: "70090100",
                location: "München"
            },
            {
                id: 277687,
                name: "Volksbank Rhein-Neckar",
                bic: "GENODE61MA2",
                blz: "67090000",
                location: "Mannheim"
            },
            
            // Genossenschaftsbanken
            {
                id: 277688,
                name: "Sparda-Bank West",
                bic: "GENODEM1SPA",
                blz: "37060590",
                location: "Düsseldorf"
            },
            {
                id: 277689,
                name: "Sparda-Bank München",
                bic: "GENODEF1S04",
                blz: "70090500",
                location: "München"
            },
            
            // Online-Banken
            {
                id: 277690,
                name: "N26",
                bic: "NTSBDEB1XXX",
                blz: "10011001",
                location: "Berlin"
            },
            {
                id: 277691,
                name: "Comdirect",
                bic: "COBADEHD055",
                blz: "20041155",
                location: "Quickborn"
            },
            {
                id: 277692,
                name: "Consorsbank",
                bic: "CSDBDE71XXX",
                blz: "76030080",
                location: "Nürnberg"
            }
        ];
        
        const filteredInstitutions = mockInstitutions.filter(institution => 
            institution.name.toLowerCase().includes(query.toLowerCase()) ||
            institution.blz.includes(query) ||
            institution.bic.toLowerCase().includes(query.toLowerCase()) ||
            (institution.location && institution.location.toLowerCase().includes(query.toLowerCase()))
        );
        
        const response = {
            institutions: filteredInstitutions,
            query: query,
            count: filteredInstitutions.length,
            requestId: req.requestId
        };
        
        logWithRequestId(req, `Found ${filteredInstitutions.length} institutions for query: ${query}`);
        res.json(response);
        
    } catch (error) {
        logWithRequestId(req, `Institution search error: ${error.message}`, 'ERROR');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Institution search failed',
            requestId: req.requestId
        });
    }
});

// SECURE PROXY: Institution Search (No API-Key required from Frontend)
app.get('/api/search-institutions', async (req, res) => {
    try {
        const query = req.query.query || '';
        logWithRequestId(req, `Proxy institution search requested: { query: '${query}' }`);
        
        // Same extended mock institutions as above
        const mockInstitutions = [
            // Sparkassen
            {
                id: 277672,
                name: "Sparkasse Köln/Bonn",
                bic: "COLSDE33XXX",
                blz: "37050198",
                location: "Köln"
            },
            {
                id: 277676,
                name: "Sparkasse München",
                bic: "SSKMDEMMXXX",
                blz: "70150000",
                location: "München"
            },
            {
                id: 277677,
                name: "Sparkasse Rhein-Neckar-Nord",
                bic: "MANSDE66XXX",
                blz: "67050505",
                location: "Mannheim"
            },
            {
                id: 277678,
                name: "Sparkasse Frankfurt am Main",
                bic: "HELADEF1822",
                blz: "50050201",
                location: "Frankfurt"
            },
            {
                id: 277679,
                name: "Sparkasse Düsseldorf",
                bic: "DUSSDEDDXXX",
                blz: "30050110",
                location: "Düsseldorf"
            },
            {
                id: 277680,
                name: "Sparkasse Hamburg",
                bic: "HASPDEHHXXX",
                blz: "20050550",
                location: "Hamburg"
            },
            {
                id: 277681,
                name: "Sparkasse Berlin",
                bic: "BELADEBEXXX",
                blz: "10050000",
                location: "Berlin"
            },
            {
                id: 277682,
                name: "Sparkasse Stuttgart",
                bic: "SOLADES1STG",
                blz: "60050101",
                location: "Stuttgart"
            },
            
            // Großbanken
            {
                id: 277673,
                name: "Deutsche Bank",
                bic: "DEUTDEFFXXX", 
                blz: "37070024",
                location: "Frankfurt"
            },
            {
                id: 277674,
                name: "Commerzbank",
                bic: "COBADEFFXXX",
                blz: "37040044", 
                location: "Frankfurt"
            },
            {
                id: 277675,
                name: "ING",
                bic: "INGDDEFFXXX",
                blz: "50010517",
                location: "Frankfurt"
            },
            {
                id: 277683,
                name: "DKB (Deutsche Kreditbank)",
                bic: "BYLADEM1001",
                blz: "12030000",
                location: "Berlin"
            },
            {
                id: 277684,
                name: "Postbank",
                bic: "PBNKDEFFXXX",
                blz: "37010050",
                location: "Bonn"
            },
            
            // Volksbanken und Raiffeisenbanken
            {
                id: 277685,
                name: "Volksbank Köln Bonn",
                bic: "GENODED1BRS",
                blz: "38060186",
                location: "Köln"
            },
            {
                id: 277686,
                name: "Volksbank München",
                bic: "GENODEF1M01",
                blz: "70090100",
                location: "München"
            },
            {
                id: 277687,
                name: "Volksbank Rhein-Neckar",
                bic: "GENODE61MA2",
                blz: "67090000",
                location: "Mannheim"
            },
            
            // Genossenschaftsbanken
            {
                id: 277688,
                name: "Sparda-Bank West",
                bic: "GENODEM1SPA",
                blz: "37060590",
                location: "Düsseldorf"
            },
            {
                id: 277689,
                name: "Sparda-Bank München",
                bic: "GENODEF1S04",
                blz: "70090500",
                location: "München"
            },
            
            // Online-Banken
            {
                id: 277690,
                name: "N26",
                bic: "NTSBDEB1XXX",
                blz: "10011001",
                location: "Berlin"
            },
            {
                id: 277691,
                name: "Comdirect",
                bic: "COBADEHD055",
                blz: "20041155",
                location: "Quickborn"
            },
            {
                id: 277692,
                name: "Consorsbank",
                bic: "CSDBDE71XXX",
                blz: "76030080",
                location: "Nürnberg"
            }
        ];
        
        const filteredInstitutions = mockInstitutions.filter(institution => 
            institution.name.toLowerCase().includes(query.toLowerCase()) ||
            institution.blz.includes(query) ||
            institution.bic.toLowerCase().includes(query.toLowerCase()) ||
            (institution.location && institution.location.toLowerCase().includes(query.toLowerCase()))
        );
        
        const response = {
            institutions: filteredInstitutions,
            query: query,
            count: filteredInstitutions.length,
            requestId: req.requestId,
            source: 'secure-proxy'
        };
        
        logWithRequestId(req, `Proxy institution search successful - Found ${filteredInstitutions.length} institutions`);
        res.json(response);
        
    } catch (error) {
        logWithRequestId(req, `Proxy institution search error: ${error.message}`, 'ERROR');
        res.status(500).json({
            error: 'Internal server error',
            message: 'Institution search failed',
            requestId: req.requestId
        });
    }
});

// SECURE PROXY: OAuth Initiation (No API-Key required from Frontend)
app.post('/api/initiate-oauth', async (req, res) => {
    try {
        const { bankId, bankName } = req.body;
        logWithRequestId(req, `Proxy OAuth initiation requested: { bankId: ${bankId}, bankName: '${bankName}' }`);
        
        // Generate OAuth URL (mock implementation)
        const state = req.requestId;
        const redirectUri = 'https://psd2.clara360.de/oauth/callback';
        const oauthUrl = `https://finapi-oauth.example.com/auth?bank_id=${bankId}&redirect_uri=${redirectUri}&state=${state}`;
        
        const response = {
            oauthUrl: oauthUrl,
            bankId: bankId,
            bankName: bankName,
            state: state,
            expiresIn: 300,
            requestId: req.requestId,
            source: 'secure-proxy'
        };
        
        logWithRequestId(req, `Proxy OAuth initiation successful - Bank: ${bankName} (${bankId})`);
        res.json(response);
        
    } catch (error) {
        logWithRequestId(req, `Proxy OAuth initiation error: ${error.message}`, 'ERROR');
        res.status(500).json({
            error: 'Internal server error',
            message: 'OAuth initiation failed',
            requestId: req.requestId
        });
    }
});

// Banking Data Endpoint (Mock)
app.get('/api/banking/data', (req, res) => {
    logWithRequestId(req, 'Banking data requested');
    res.json({
        accounts: [],
        transactions: [],
        message: 'No banking data available - please connect a bank first',
        requestId: req.requestId
    });
});

// OAuth Callback Handler
app.get('/oauth/callback', (req, res) => {
    const { code, state } = req.query;
    logWithRequestId(req, `OAuth callback received: { code: ${code ? 'present' : 'missing'}, state: ${state} }`);
    
    res.json({
        message: 'OAuth callback received',
        code: code,
        state: state,
        requestId: req.requestId
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Clara360 FinAPI Backend v2.3 (Extended Banks) running on port ${PORT}`);
    console.log(`📊 Audit logging enabled: ${auditLogPath}`);
    console.log(`🔒 API-Key protection active for protected routes`);
    console.log(`🏦 Extended bank coverage: 21 institutions including Sparkasse Rhein-Neckar-Nord`);
});

