#!/bin/bash
# Clara-KI React App Deployment Script
# This script deploys the Clara-KI React App to the VPS

# Exit on error
set -e

# Variables
DEPLOY_DIR="/var/www/clara360/clara-ki-react"
NGINX_CONF="/etc/nginx/sites-available/clara-ki-react.conf"
BACKUP_DIR="/var/www/clara360/backups/clara-ki-react-$(date +%Y%m%d%H%M%S)"

# Display banner
echo "=================================================="
echo "Clara-KI React App Deployment"
echo "=================================================="
echo "Date: $(date)"
echo "Target: $DEPLOY_DIR"
echo "=================================================="

# Create backup of existing deployment if it exists
if [ -d "$DEPLOY_DIR" ]; then
    echo "Creating backup of existing deployment..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$DEPLOY_DIR"/* "$BACKUP_DIR"
    echo "Backup created at $BACKUP_DIR"
fi

# Create deployment directory if it doesn't exist
echo "Creating deployment directory..."
mkdir -p "$DEPLOY_DIR"

# Copy files to deployment directory
echo "Copying files to deployment directory..."
cp -r ./* "$DEPLOY_DIR"

# Remove deployment script and nginx config from deployment directory
rm -f "$DEPLOY_DIR/deploy.sh"
rm -f "$DEPLOY_DIR/nginx-clara-ki-react.conf"

# Set permissions
echo "Setting permissions..."
chown -R www-data:www-data "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"

# Install nginx configuration if it doesn't exist
if [ ! -f "$NGINX_CONF" ]; then
    echo "Installing nginx configuration..."
    cp nginx-clara-ki-react.conf "$NGINX_CONF"
    
    # Check if the configuration is already included in the main nginx configuration
    if ! grep -q "include $NGINX_CONF;" /etc/nginx/sites-enabled/default; then
        echo "Adding include directive to main nginx configuration..."
        sed -i "/server_name/a \    include $NGINX_CONF;" /etc/nginx/sites-enabled/default
    fi
fi

# Test nginx configuration
echo "Testing nginx configuration..."
nginx -t

# Reload nginx
echo "Reloading nginx..."
systemctl reload nginx

echo "=================================================="
echo "Deployment completed successfully!"
echo "Clara-KI React App is now available at:"
echo "https://clara360.de/clara-ki-react/"
echo "=================================================="

