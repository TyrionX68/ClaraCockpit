#!/bin/bash

### --- CLARA360 BUILD & DEPLOY SCRIPT v2.0 HYBRID ---
# Kombiniert Manus A Best-Practices mit erweiterten Features
# MetaGovernor-konform für maximale Produktionsreife
# Basiert auf Manus A Shell-Skript + erweiterte Fehlerbehandlung

# ==========================================
# KONFIGURATION & SETUP
# ==========================================

# Fehlerbehandlung aktivieren
set -e
set -o pipefail

# --- Variablen (Manus A Best-Practice) ---
REMOTE_USER="ubuntu"
REMOTE_HOST="217.154.242.134"
REMOTE_PATH="/var/www/clara360/"
LOCAL_BUILD_DIR="./dist"
BACKEND_SERVICE="clara-backend"      # Name der systemd-Unit für Node.js-API
NGINX_SERVICE="nginx"

# --- Erweiterte Konfiguration ---
SCRIPT_NAME="Clara360 Deploy v2.0"
LOG_FILE="deploy_$(date +%Y%m%d_%H%M%S).log"
BACKUP_DIR="/tmp/clara360_backups"
HEALTH_CHECK_URL="https://clara360.de"
API_HEALTH_CHECK_URL="https://clara360.de/api/finapi/health"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# ==========================================
# LOGGING FUNKTIONEN
# ==========================================

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${PURPLE}[$(date '+%Y-%m-%d %H:%M:%S')] ℹ️ $1${NC}" | tee -a "$LOG_FILE"
}

# ==========================================
# VALIDIERUNG & PREREQUISITES
# ==========================================

validate_prerequisites() {
    log "🔍 Validiere Voraussetzungen..."
    
    # Prüfe npm
    if ! command -v npm &> /dev/null; then
        log_error "npm ist nicht installiert"
        exit 1
    fi
    
    # Prüfe rsync
    if ! command -v rsync &> /dev/null; then
        log_error "rsync ist nicht installiert"
        exit 1
    fi
    
    # Prüfe curl für Health-Checks
    if ! command -v curl &> /dev/null; then
        log_warning "curl nicht verfügbar - Health-Checks werden übersprungen"
    fi
    
    # Prüfe SSH-Verbindung
    log "🔐 Teste SSH-Verbindung zu $REMOTE_HOST..."
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$REMOTE_USER@$REMOTE_HOST" exit &> /dev/null; then
        log_error "SSH-Verbindung zu $REMOTE_HOST fehlgeschlagen"
        log_warning "Stelle sicher, dass SSH-Keys konfiguriert sind"
        exit 1
    fi
    
    # Prüfe package.json
    if [ ! -f "package.json" ]; then
        log_error "package.json nicht gefunden. Führe das Skript im Projekt-Root aus."
        exit 1
    fi
    
    log_success "Alle Voraussetzungen erfüllt"
}

# ==========================================
# BUILD-FUNKTIONEN (Manus A + Erweitert)
# ==========================================

clean_build() {
    log "🧹 Bereinige alte Build-Artefakte..."
    
    # Lokale Bereinigung
    if [ -d "$LOCAL_BUILD_DIR" ]; then
        rm -rf "$LOCAL_BUILD_DIR"
        log_success "Lokale Build-Artefakte entfernt"
    fi
    
    # npm clean (Manus A Best-Practice)
    if npm run | grep -q "clean"; then
        log "📦 Führe npm clean aus..."
        npm run clean
        log_success "npm clean erfolgreich"
    else
        log_warning "Kein npm clean-Script gefunden, überspringe"
    fi
}

build_project() {
    log "📦 Baue Clara360 Frontend... (Manus A Best-Practice)"
    
    # npm build (Manus A Best-Practice)
    if npm run | grep -q "build"; then
        npm run build
        log_success "npm build erfolgreich"
    else
        log_error "Kein npm build-Script gefunden"
        exit 1
    fi
    
    # Validiere Build-Output
    if [ ! -d "$LOCAL_BUILD_DIR" ]; then
        log_error "Build-Verzeichnis $LOCAL_BUILD_DIR wurde nicht erstellt"
        exit 1
    fi
    
    # Asset-Analyse
    js_count=$(find "$LOCAL_BUILD_DIR" -name "*.js" | wc -l)
    css_count=$(find "$LOCAL_BUILD_DIR" -name "*.css" | wc -l)
    html_count=$(find "$LOCAL_BUILD_DIR" -name "*.html" | wc -l)
    
    log_success "Build abgeschlossen: $js_count JS, $css_count CSS, $html_count HTML Dateien"
}

# ==========================================
# BACKUP & ROLLBACK FUNKTIONEN
# ==========================================

create_backup() {
    log "💾 Erstelle Backup der aktuellen Version..."
    
    backup_name="clara360_backup_$(date +%Y%m%d_%H%M%S)"
    
    ssh "$REMOTE_USER@$REMOTE_HOST" "
        sudo mkdir -p '$BACKUP_DIR'
        if [ -d '$REMOTE_PATH' ]; then
            sudo cp -r '$REMOTE_PATH' '$BACKUP_DIR/$backup_name'
            echo 'Backup erstellt: $BACKUP_DIR/$backup_name'
        fi
    " 2>/dev/null
    
    if [ $? -eq 0 ]; then
        log_success "Remote-Backup erstellt: $backup_name"
        echo "$backup_name" > .last_backup
    else
        log_warning "Backup konnte nicht erstellt werden"
    fi
}

rollback_deployment() {
    log_error "🔄 Führe Rollback durch..."
    
    if [ -f ".last_backup" ]; then
        last_backup=$(cat .last_backup)
        log "📦 Stelle letzte Version wieder her: $last_backup"
        
        ssh "$REMOTE_USER@$REMOTE_HOST" "
            if [ -d '$BACKUP_DIR/$last_backup' ]; then
                sudo cp -r '$BACKUP_DIR/$last_backup'/* '$REMOTE_PATH/'
                sudo systemctl reload $NGINX_SERVICE
                echo 'Rollback abgeschlossen'
            fi
        "
        log_success "Rollback abgeschlossen"
    else
        log_error "Kein Backup für Rollback verfügbar"
    fi
}

# ==========================================
# DEPLOY-FUNKTIONEN (Manus A Best-Practice)
# ==========================================

deploy_to_server() {
    log "🚀 Deploy auf den Server ($REMOTE_HOST)... (Manus A Best-Practice)"
    
    # rsync mit --delete (Manus A Best-Practice)
    log "📤 Übertrage Assets mit rsync..."
    rsync -avz --delete --progress "$LOCAL_BUILD_DIR/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"
    
    if [ $? -eq 0 ]; then
        log_success "Assets erfolgreich übertragen"
    else
        log_error "Fehler bei der Übertragung"
        rollback_deployment
        exit 1
    fi
}

restart_services() {
    log "🔄 Backend & NGINX auf dem Server neustarten... (Manus A Best-Practice)"
    
    # Service-Restart (Manus A Best-Practice)
    ssh "$REMOTE_USER@$REMOTE_HOST" "
        # Backend-Restart (falls Service existiert)
        if systemctl is-active --quiet $BACKEND_SERVICE; then
            sudo systemctl restart $BACKEND_SERVICE
            echo 'Backend-Service neu gestartet'
        else
            echo 'Backend-Service nicht aktiv oder nicht gefunden'
        fi
        
        # Nginx-Reload (Manus A Best-Practice)
        sudo systemctl reload $NGINX_SERVICE
        echo 'Nginx neu geladen'
    "
    
    if [ $? -eq 0 ]; then
        log_success "Services erfolgreich neu gestartet"
    else
        log_error "Fehler beim Service-Restart"
        rollback_deployment
        exit 1
    fi
}

# ==========================================
# HEALTH-CHECKS (Manus A Best-Practice)
# ==========================================

perform_health_checks() {
    log "🌐 Health-Check aufrufen... (Manus A Best-Practice)"
    
    if ! command -v curl &> /dev/null; then
        log_warning "curl nicht verfügbar - Health-Checks übersprungen"
        return
    fi
    
    # Frontend Health-Check
    log "🔍 Prüfe Frontend ($HEALTH_CHECK_URL)..."
    frontend_response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" || echo "000")
    
    if [ "$frontend_response" = "200" ]; then
        log_success "Frontend erreichbar (HTTP $frontend_response)"
    else
        log_error "Frontend nicht erreichbar (HTTP $frontend_response)"
        rollback_deployment
        exit 1
    fi
    
    # API Health-Check
    log "🔍 Prüfe API ($API_HEALTH_CHECK_URL)..."
    api_response=$(curl -s -o /dev/null -w "%{http_code}" "$API_HEALTH_CHECK_URL" || echo "000")
    
    if [ "$api_response" = "200" ]; then
        log_success "API erreichbar (HTTP $api_response)"
    else
        log_warning "API nicht erreichbar (HTTP $api_response) - möglicherweise normal"
    fi
    
    # Detaillierte Header-Ausgabe (Manus A Best-Practice)
    log_info "Frontend-Header:"
    curl -I "$HEALTH_CHECK_URL" 2>/dev/null | head -5 | while read line; do
        log_info "  $line"
    done
}

# ==========================================
# AUDIT & LOGGING (Manus A + Erweitert)
# ==========================================

create_audit_log() {
    log "📝 Deploy-Log am $(date) für Clara360 auf $REMOTE_HOST (Manus A Best-Practice)"
    
    # Erweiterte Audit-Informationen
    audit_file="deploy_audit_$(date +%Y%m%d).log"
    
    {
        echo "=== CLARA360 DEPLOY AUDIT ==="
        echo "Timestamp: $(date)"
        echo "User: $(whoami)"
        echo "Host: $(hostname)"
        echo "Target: $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH"
        echo "Build Dir: $LOCAL_BUILD_DIR"
        echo "Log File: $LOG_FILE"
        echo "Status: SUCCESS"
        echo "=========================="
    } >> "$audit_file"
    
    log_success "Audit-Log erstellt: $audit_file"
}

# ==========================================
# HAUPTFUNKTION
# ==========================================

main() {
    log "🚀 Starte $SCRIPT_NAME"
    log "📝 Log-Datei: $LOG_FILE"
    log_info "Manus A Best-Practices + Erweiterte Features aktiv"
    
    # Validierung
    validate_prerequisites
    
    # Build-Prozess (Manus A Best-Practice)
    clean_build
    build_project
    
    # Backup vor Deploy
    create_backup
    
    # Deploy-Prozess (Manus A Best-Practice)
    deploy_to_server
    restart_services
    
    # Health-Checks (Manus A Best-Practice)
    perform_health_checks
    
    # Audit-Logging (Manus A Best-Practice)
    create_audit_log
    
    log_success "✅ Deploy abgeschlossen! (Manus A + Erweiterte Features)"
    log "📊 Deployment-Details in $LOG_FILE gespeichert"
}

# ==========================================
# FEHLERBEHANDLUNG & CLEANUP
# ==========================================

cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Deployment fehlgeschlagen. Prüfe $LOG_FILE für Details."
        log_warning "Rollback verfügbar mit: ./deploy_clara360.sh --rollback"
    fi
}

# Rollback-Option
if [ "$1" = "--rollback" ]; then
    log "🔄 Rollback-Modus aktiviert"
    rollback_deployment
    exit 0
fi

trap cleanup EXIT

# ==========================================
# SKRIPT AUSFÜHRUNG
# ==========================================

main "$@"

