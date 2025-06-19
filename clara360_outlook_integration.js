const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Azure AD Configuration
const AZURE_CONFIG = {
  tenantId: '057f40eb-fe82-43ba-9204-85b106bafaf0',
  clientId: 'a0093b1c-b628-4a47-996b-76ae7b8b4f0f',
  clientSecret: '3202841c-fa03-4241-bfbc-fec9ef8a8b9e',
  scope: 'https://graph.microsoft.com/.default',
  tokenEndpoint: 'https://login.microsoftonline.com/057f40eb-fe82-43ba-9204-85b106bafaf0/oauth2/v2.0/token',
  graphEndpoint: 'https://graph.microsoft.com/v1.0'
};

// Token storage (in production, use Redis or database)
let accessToken = null;
let tokenExpiry = null;

// Get Access Token using Client Credentials Flow
async function getAccessToken() {
  try {
    // Check if token is still valid
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
      console.log('✅ Using cached access token');
      return accessToken;
    }

    console.log('🔄 Requesting new access token...');

    const tokenRequest = {
      client_id: AZURE_CONFIG.clientId,
      client_secret: AZURE_CONFIG.clientSecret,
      scope: AZURE_CONFIG.scope,
      grant_type: 'client_credentials'
    };

    const response = await axios.post(
      AZURE_CONFIG.tokenEndpoint,
      new URLSearchParams(tokenRequest),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minute buffer

    console.log('✅ Access token obtained successfully');
    return accessToken;
  } catch (error) {
    console.error('❌ Error getting access token:', error.response?.data || error.message);
    throw new Error('Failed to obtain access token');
  }
}

// Get all users (for multi-user support)
async function getUsers() {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(`${AZURE_CONFIG.graphEndpoint}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.value;
  } catch (error) {
    console.error('❌ Error getting users:', error.response?.data || error.message);
    throw error;
  }
}

// Get emails for a specific user
async function getEmails(userId, options = {}) {
  try {
    const token = await getAccessToken();
    
    const {
      top = 50,
      filter = null,
      orderby = 'receivedDateTime desc',
      select = 'id,subject,from,receivedDateTime,bodyPreview,isRead,hasAttachments'
    } = options;

    let url = `${AZURE_CONFIG.graphEndpoint}/users/${userId}/messages`;
    const params = new URLSearchParams({
      '$top': top,
      '$orderby': orderby,
      '$select': select
    });

    if (filter) {
      params.append('$filter', filter);
    }

    url += '?' + params.toString();

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error getting emails:', error.response?.data || error.message);
    throw error;
  }
}

// Get specific email details
async function getEmailDetails(userId, messageId) {
  try {
    const token = await getAccessToken();
    
    const response = await axios.get(
      `${AZURE_CONFIG.graphEndpoint}/users/${userId}/messages/${messageId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Error getting email details:', error.response?.data || error.message);
    throw error;
  }
}

// Send email
async function sendEmail(userId, emailData) {
  try {
    const token = await getAccessToken();
    
    const message = {
      message: {
        subject: emailData.subject,
        body: {
          contentType: emailData.bodyType || 'HTML',
          content: emailData.body
        },
        toRecipients: emailData.to.map(email => ({
          emailAddress: {
            address: email
          }
        })),
        ccRecipients: emailData.cc ? emailData.cc.map(email => ({
          emailAddress: {
            address: email
          }
        })) : [],
        bccRecipients: emailData.bcc ? emailData.bcc.map(email => ({
          emailAddress: {
            address: email
          }
        })) : []
      },
      saveToSentItems: true
    };

    const response = await axios.post(
      `${AZURE_CONFIG.graphEndpoint}/users/${userId}/sendMail`,
      message,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, messageId: response.headers['request-id'] };
  } catch (error) {
    console.error('❌ Error sending email:', error.response?.data || error.message);
    throw error;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'clara360-outlook-integration',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    azure: {
      tenantId: AZURE_CONFIG.tenantId,
      clientId: AZURE_CONFIG.clientId,
      configured: true
    }
  });
});

// Test token endpoint
app.get('/api/test-token', async (req, res) => {
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

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await getUsers();
    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        displayName: user.displayName,
        mail: user.mail,
        userPrincipalName: user.userPrincipalName
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get emails for a user
app.get('/api/users/:userId/emails', async (req, res) => {
  try {
    const { userId } = req.params;
    const { top, filter, unreadOnly } = req.query;
    
    const options = {
      top: parseInt(top) || 50
    };

    if (unreadOnly === 'true') {
      options.filter = 'isRead eq false';
    } else if (filter) {
      options.filter = filter;
    }

    const emails = await getEmails(userId, options);
    
    res.json({
      success: true,
      count: emails.value.length,
      emails: emails.value
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific email details
app.get('/api/users/:userId/emails/:messageId', async (req, res) => {
  try {
    const { userId, messageId } = req.params;
    const email = await getEmailDetails(userId, messageId);
    
    res.json({
      success: true,
      email: email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send email
app.post('/api/users/:userId/send-email', async (req, res) => {
  try {
    const { userId } = req.params;
    const emailData = req.body;

    // Validate required fields
    if (!emailData.subject || !emailData.body || !emailData.to || !Array.isArray(emailData.to)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: subject, body, to (array)'
      });
    }

    const result = await sendEmail(userId, emailData);
    
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clara360 specific endpoints

// Get unread emails count for dashboard
app.get('/api/clara360/unread-count', async (req, res) => {
  try {
    const users = await getUsers();
    const unreadCounts = {};

    for (const user of users) {
      try {
        const emails = await getEmails(user.id, {
          top: 1,
          filter: 'isRead eq false',
          select: 'id'
        });
        unreadCounts[user.mail || user.userPrincipalName] = emails['@odata.count'] || emails.value.length;
      } catch (error) {
        console.error(`Error getting unread count for ${user.mail}:`, error.message);
        unreadCounts[user.mail || user.userPrincipalName] = 0;
      }
    }

    res.json({
      success: true,
      unreadCounts: unreadCounts,
      totalUnread: Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get recent emails for Clara360 dashboard
app.get('/api/clara360/recent-emails', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const users = await getUsers();
    const allEmails = [];

    for (const user of users) {
      try {
        const emails = await getEmails(user.id, {
          top: parseInt(limit),
          select: 'id,subject,from,receivedDateTime,bodyPreview,isRead'
        });
        
        emails.value.forEach(email => {
          email.userMail = user.mail || user.userPrincipalName;
          email.userId = user.id;
        });
        
        allEmails.push(...emails.value);
      } catch (error) {
        console.error(`Error getting emails for ${user.mail}:`, error.message);
      }
    }

    // Sort by received date
    allEmails.sort((a, b) => new Date(b.receivedDateTime) - new Date(a.receivedDateTime));

    res.json({
      success: true,
      count: allEmails.length,
      emails: allEmails.slice(0, parseInt(limit))
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Clara360 Outlook Integration Server running on port ${PORT}`);
  console.log(`📧 Azure Tenant: ${AZURE_CONFIG.tenantId}`);
  console.log(`🔑 Client ID: ${AZURE_CONFIG.clientId}`);
  console.log(`⚡ Ready to process email requests`);
});

module.exports = app;

