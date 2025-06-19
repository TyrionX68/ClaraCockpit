# CLARA360 TECHNICAL RUNBOOK v2.1

## 🎯 SYSTEM OVERVIEW

**Service:** Clara360 - Intelligente Hausverwaltung mit PSD2 Banking Integration
**Environment:** Production VPS (217.154.242.134)
**Version:** v2.1 - Kernel Enhanced

## 🔧 SERVICE ARCHITECTURE

### Frontend
- **Technology:** React with Vite
- **Path:** `/var/www/clara360/`
- **Assets:** `/var/www/clara360/assets/`
- **Entry Point:** `index.html`
- **Cache Strategy:** Aggressive caching for hashed assets, no cache for HTML

### Backend
- **Technology:** Node.js Express
- **File:** `finapi_real_oauth_backend.js`
- **Port:** 3001
- **Features:** Request-ID tracking, API security, audit logging

### Web Server
- **Technology:** Nginx 1.18.0
- **Config:** `/etc/nginx/sites-available/clara360-https-complete`
- **SSL:** Let's Encrypt (clara360.de)

## 📊 SERVICE MANAGEMENT

### Backend Service Commands
```bash
# Check if backend is running
ps aux | grep finapi_real_oauth_backend

# Start backend manually
cd /var/www/clara360
node finapi_real_oauth_backend.js

# Check backend logs
tail -f /var/www/clara360/finapi_real_backend.log
tail -f /var/www/clara360/finapi_audit.log
```

### Nginx Commands
```bash
# Test configuration
nginx -t

# Reload configuration
systemctl reload nginx

# Restart nginx
systemctl restart nginx

# Check status
systemctl status nginx
```

## 🌐 API ENDPOINTS

### Health Check
- **URL:** `https://clara360.de/api/finapi/health`
- **Method:** GET
- **Auth:** None required
- **Response:** Service status and version info

### Institution Search (Protected)
- **URL:** `https://clara360.de/api/finapi/institutions/search?query=<bank>`
- **Method:** GET
- **Auth:** API Key required (`x-api-key` header)
- **Response:** List of matching banks

### OAuth Start (Protected)
- **URL:** `https://clara360.de/api/finapi/oauth/start`
- **Method:** POST
- **Auth:** API Key required
- **Body:** `{"institutionId": "277672"}`

## 🔐 SECURITY

### API Key Management
- **Environment Variable:** `CLARA360_API_KEY`
- **Location:** `/var/www/clara360/.env`
- **Usage:** Required for all protected endpoints

### SSL Certificate
- **Provider:** Let's Encrypt
- **Renewal:** Automatic via certbot
- **Check expiry:** `certbot certificates`

## 📝 MONITORING & LOGGING

### Automatic Health Checks
- **Frequency:** Every 5 minutes
- **Command:** `curl -f https://clara360.de/api/finapi/health`
- **Action on Failure:** Restart backend service
- **Crontab:** `*/5 * * * * curl -f https://clara360.de/api/finapi/health || systemctl restart finapi-backend`

### Log Files
- **Backend Log:** `/var/www/clara360/finapi_real_backend.log`
- **Audit Log:** `/var/www/clara360/finapi_audit.log`
- **Nginx Access:** `/var/log/nginx/access.log`
- **Nginx Error:** `/var/log/nginx/error.log`

### Request Tracking
- **Feature:** Every request gets unique Request-ID
- **Format:** `timestamp-randomstring`
- **Logging:** All requests logged with Request-ID for traceability

## 🚨 TROUBLESHOOTING

### Common Issues

#### Backend Not Responding
```bash
# Check if process is running
ps aux | grep finapi_real_oauth_backend

# Check logs for errors
tail -50 /var/www/clara360/finapi_real_backend.log

# Restart manually
cd /var/www/clara360
node finapi_real_oauth_backend.js
```

#### Frontend Not Loading
```bash
# Check nginx status
systemctl status nginx

# Check nginx configuration
nginx -t

# Check file permissions
ls -la /var/www/clara360/

# Clear browser cache (hard refresh)
```

#### API Errors
```bash
# Check API key configuration
cat /var/www/clara360/.env | grep CLARA360_API_KEY

# Test health endpoint
curl -I https://clara360.de/api/finapi/health

# Check audit logs
tail -20 /var/www/clara360/finapi_audit.log
```

## 🔄 DEPLOYMENT PROCEDURES

### Manual Deployment
1. Backup current version
2. Update files in `/var/www/clara360/`
3. Restart backend service
4. Reload nginx configuration
5. Validate health checks

### Rollback Procedure
1. Stop current backend
2. Restore from backup
3. Restart services
4. Validate functionality

## 📞 EMERGENCY CONTACTS

### Service Restoration Priority
1. Health check endpoint
2. Frontend accessibility
3. API functionality
4. Full feature validation

### Quick Recovery Commands
```bash
# Emergency nginx restart
systemctl restart nginx

# Emergency backend restart
pkill -f finapi_real_oauth_backend
cd /var/www/clara360 && node finapi_real_oauth_backend.js &

# Check all services
curl -I https://clara360.de
curl -I https://clara360.de/api/finapi/health
```

## 📈 PERFORMANCE MONITORING

### Key Metrics
- **Frontend Load Time:** < 2 seconds
- **API Response Time:** < 500ms
- **Health Check Success Rate:** > 99%
- **SSL Certificate Validity:** > 30 days remaining

### Monitoring Commands
```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://clara360.de

# Check SSL expiry
openssl s_client -connect clara360.de:443 -servername clara360.de 2>/dev/null | openssl x509 -noout -dates

# Check disk space
df -h /var/www/clara360
```

---

**Last Updated:** $(date)
**Version:** 2.1 - Kernel Enhanced
**Maintainer:** Manus A / Clara360 Team

