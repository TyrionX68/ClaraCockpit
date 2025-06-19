// FinAPI Authentication Endpoint
// Erstellt OAuth-Token für FinAPI-Integration

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// POST /api/finapi/authenticate
router.post('/', async (req, res) => {
  console.log('🔐 FinAPI-Authentifizierung gestartet...');
  
  try {
    // Lade FinAPI-Credentials aus .env
    const FINAPI_CLIENT_ID = process.env.FINAPI_CLIENT_ID;
    const FINAPI_CLIENT_SECRET = process.env.FINAPI_CLIENT_SECRET;
    
    if (!FINAPI_CLIENT_ID || !FINAPI_CLIENT_SECRET) {
      console.error('❌ FinAPI-Credentials fehlen in .env');
      return res.status(500).json({ 
        error: 'FinAPI-Credentials nicht konfiguriert',
        status: 'configuration_error'
      });
    }
    
    console.log('📡 Sende OAuth-Request an FinAPI...');
    
    // OAuth-Token von FinAPI anfordern
    const tokenResponse = await axios.post('https://api.finapi.io/oauth/token', 
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: FINAPI_CLIENT_ID,
        client_secret: FINAPI_CLIENT_SECRET
      }), {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ FinAPI-Token erhalten');
    
    // Token mit Timestamp speichern
    const tokenData = {
      access_token: tokenResponse.data.access_token,
      token_type: tokenResponse.data.token_type,
      expires_in: tokenResponse.data.expires_in,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (tokenResponse.data.expires_in * 1000)).toISOString()
    };
    
    // Token in Datei speichern
    const tokenPath = '/var/www/clara360/tokens/finapi.json';
    fs.writeFileSync(tokenPath, JSON.stringify(tokenData, null, 2));
    console.log('💾 Token gespeichert in:', tokenPath);
    
    // Erfolgreiche Antwort
    res.json({ 
      status: 'token_created',
      message: 'FinAPI-Token erfolgreich erstellt und gespeichert',
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      created_at: tokenData.created_at
    });
    
  } catch (error) {
    console.error('❌ FinAPI-Authentifizierung fehlgeschlagen:', error.message);
    
    if (error.response) {
      console.error('FinAPI-Response:', error.response.status, error.response.data);
      res.status(error.response.status).json({
        error: 'FinAPI-Authentifizierung fehlgeschlagen',
        status: 'finapi_error',
        details: error.response.data
      });
    } else if (error.request) {
      res.status(500).json({
        error: 'Keine Antwort von FinAPI-Server',
        status: 'network_error',
        details: error.message
      });
    } else {
      res.status(500).json({
        error: 'Unbekannter Fehler bei FinAPI-Authentifizierung',
        status: 'unknown_error',
        details: error.message
      });
    }
  }
});

// GET /api/finapi/authenticate - Token-Status prüfen
router.get('/', (req, res) => {
  try {
    const tokenPath = '/var/www/clara360/tokens/finapi.json';
    
    if (!fs.existsSync(tokenPath)) {
      return res.json({
        status: 'no_token',
        message: 'Kein Token vorhanden'
      });
    }
    
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now >= expiresAt) {
      return res.json({
        status: 'token_expired',
        message: 'Token ist abgelaufen',
        expired_at: tokenData.expires_at
      });
    }
    
    res.json({
      status: 'token_valid',
      message: 'Token ist gültig',
      created_at: tokenData.created_at,
      expires_at: tokenData.expires_at,
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

module.exports = router;

