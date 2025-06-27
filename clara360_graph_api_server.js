const express = require('express');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const { Client } = require('@microsoft/microsoft-graph-client');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.graphapi' });

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Azure AD MSAL Configuration
const msalConfig = {
  auth: {
    clientId: process.env.GRAPH_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.GRAPH_TENANT_ID}`,
  }
};

const cca = new ConfidentialClientApplication(msalConfig);

// Token Management
let accessToken = null;
let tokenExpiry = null;

// Logging Setup
const LOG_DIR = process.env.GRAPH_LOG_DIR || '/var/log/clara360/graph_emails';
const TARGET_USER = process.env.GRAPH_TARGET_USER || 'hiss@clara360.de';

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
      console.log('✅ Using cached access token');
      return accessToken;
    }

    console.log('🔄 Requesting new access token...');

    const clientCredentialRequest = {
      scopes: [process.env.GRAPH_SCOPE],
    };

    const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
    
    if (response && response.accessToken) {
      accessToken = response.accessToken;
      tokenExpiry = Date.now() + (response.expiresOn.getTime() - Date.now()) - 60000; // 1 minute buffer
      
      console.log('✅ Access token obtained successfully');
      await logToFile('token.log', {
        event: 'token_acquired',
        expiresOn: response.expiresOn,
        scopes: response.scopes
      });
      
      return accessToken;
    } else {
      throw new Error('No access token in response');
    }
  } catch (error) {
    console.error('❌ Error getting access token:', error);
    await logToFile('error.log', {
      event: 'token_error',
      error: error.message,
      stack: error.stack
    });
    throw new Error('Failed to obtain access token: ' + error.message);
  }
}

// Initialize Microsoft Graph Client
async function getGraphClient() {
  const token = await getAccessToken();
  
  return Client.init({
    authProvider: (done) => {
      done(null, token);
    }
  });
}

// Get Emails from Inbox
async function getInboxEmails(options = {}) {
  try {
    const client = await getGraphClient();
    
    const {
      top = 10,
      filter = null,
      orderby = 'receivedDateTime DESC',
      select = 'id,subject,from,receivedDateTime,bodyPreview,isRead,hasAttachments,body'
    } = options;

    let query = client.api(`/users/${TARGET_USER}/messages`)
      .top(top)
      .orderby(orderby)
      .select(select);

    if (filter) {
      query = query.filter(filter);
    }

    const messages = await query.get();
    
    console.log(`✅ Retrieved ${messages.value.length} emails from ${TARGET_USER}`);
    
    await logToFile('inbox.log', {
      event: 'emails_retrieved',
      count: messages.value.length,
      user: TARGET_USER,
      timestamp: new Date().toISOString()
    });

    return messages.value;
  } catch (error) {
    console.error('❌ Error getting emails:', error);
    await logToFile('error.log', {
      event: 'inbox_error',
      error: error.message,
      user: TARGET_USER
    });
    throw error;
  }
}

// Send Email
async function sendEmail(emailData) {
  try {
    const client = await getGraphClient();
    
    const message = {
      message: {
        subject: emailData.subject,
        body: {
          contentType: emailData.bodyType || 'Text',
          content: emailData.body
        },
        toRecipients: emailData.to.map(email => ({
          emailAddress: {
            address: email
          }
        }))
      },
      saveToSentItems: true
    };

    if (emailData.cc && emailData.cc.length > 0) {
      message.message.ccRecipients = emailData.cc.map(email => ({
        emailAddress: { address: email }
      }));
    }

    if (emailData.bcc && emailData.bcc.length > 0) {
      message.message.bccRecipients = emailData.bcc.map(email => ({
        emailAddress: { address: email }
      }));
    }

    await client.api(`/users/${TARGET_USER}/sendMail`).post(message);
    
    console.log('✅ Email sent successfully');
    
    await logToFile('sent.log', {
      event: 'email_sent',
      to: emailData.to,
      subject: emailData.subject,
      timestamp: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    await logToFile('error.log', {
      event: 'send_error',
      error: error.message,
      emailData: { to: emailData.to, subject: emailData.subject }
    });
    throw error;
  }
}

// Get User Profile
async function getUserProfile() {
  try {
    const client = await getGraphClient();
    const user = await client.api(`/users/${TARGET_USER}`).get();
    
    return {
      id: user.id,
      displayName: user.displayName,
      mail: user.mail,
      userPrincipalName: user.userPrincipalName
    };
  } catch (error) {
    console.error('❌ Error getting user profile:', error);
    throw error;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'clara360-graph-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    config: {
      tenantId: process.env.GRAPH_TENANT_ID,
      clientId: process.env.GRAPH_CLIENT_ID,
      targetUser: TARGET_USER,
      configured: true
    }
  });
});

// Test token endpoint
app.get('/api/graph/token-test', async (req, res) => {
  try {
    const token = await getAccessToken();
    res.json({
      success: true,
      tokenObtained: !!token,
      tokenLength: token ? token.length : 0,
      expiresAt: new Date(tokenExpiry).toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get inbox emails
app.get('/api/graph/inbox', async (req, res) => {
  try {
    const { top, unreadOnly } = req.query;
    
    const options = {
      top: parseInt(top) || 10
    };

    if (unreadOnly === 'true') {
      options.filter = 'isRead eq false';
    }

    const emails = await getInboxEmails(options);
    
    res.json({
      success: true,
      count: emails.length,
      emails: emails,
      user: TARGET_USER,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send email
app.post('/api/graph/send', async (req, res) => {
  try {
    const emailData = req.body;

    // Validate required fields
    if (!emailData.subject || !emailData.body || !emailData.to || !Array.isArray(emailData.to)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: subject, body, to (array)'
      });
    }

    const result = await sendEmail(emailData);
    
    res.json({
      success: true,
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user profile
app.get('/api/graph/user', async (req, res) => {
  try {
    const user = await getUserProfile();
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get unread count
app.get('/api/graph/unread-count', async (req, res) => {
  try {
    const emails = await getInboxEmails({
      top: 1,
      filter: 'isRead eq false',
      select: 'id'
    });
    
    res.json({
      success: true,
      unreadCount: emails.length,
      user: TARGET_USER
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Auto-Sync Setup
let syncInterval = null;

function startAutoSync() {
  const interval = parseInt(process.env.GRAPH_SYNC_INTERVAL) || 30000;
  
  console.log(`🔄 Starting auto-sync every ${interval}ms`);
  
  syncInterval = setInterval(async () => {
    try {
      console.log('🔄 Auto-sync: Checking for new emails...');
      const emails = await getInboxEmails({ top: 5, filter: 'isRead eq false' });
      
      await logToFile('sync.log', {
        event: 'auto_sync',
        unreadCount: emails.length,
        timestamp: new Date().toISOString()
      });
      
      if (emails.length > 0) {
        console.log(`📧 Auto-sync: Found ${emails.length} unread emails`);
      }
    } catch (error) {
      console.error('❌ Auto-sync error:', error);
      await logToFile('error.log', {
        event: 'auto_sync_error',
        error: error.message
      });
    }
  }, interval);
}

function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('⏹️ Auto-sync stopped');
  }
}

// Auto-sync control endpoints
app.post('/api/graph/sync/start', (req, res) => {
  startAutoSync();
  res.json({ success: true, message: 'Auto-sync started' });
});

app.post('/api/graph/sync/stop', (req, res) => {
  stopAutoSync();
  res.json({ success: true, message: 'Auto-sync stopped' });
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📛 SIGTERM received, shutting down gracefully...');
  stopAutoSync();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📛 SIGINT received, shutting down gracefully...');
  stopAutoSync();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Ensure log directory exists
    await ensureLogDir();
    
    // Test token acquisition on startup
    console.log('🔐 Testing token acquisition...');
    await getAccessToken();
    console.log('✅ Token test successful');
    
    // Start auto-sync
    startAutoSync();
    
    // Start HTTP server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Clara360 Graph API Server running on port ${PORT}`);
      console.log(`📧 Target User: ${TARGET_USER}`);
      console.log(`🔑 Tenant ID: ${process.env.GRAPH_TENANT_ID}`);
      console.log(`📂 Log Directory: ${LOG_DIR}`);
      console.log(`⚡ Ready to process Graph API requests`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

