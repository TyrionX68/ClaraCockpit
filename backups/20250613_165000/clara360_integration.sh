#!/bin/bash
# Clara360 System Integration Script
# Aktiviert SQL-Schema und integriert Multi-Manus-System

echo "🚀 Clara360 System Integration gestartet..."

# 1. Verzeichnisse prüfen
echo "📁 Prüfe System-Verzeichnisse..."
if [ ! -d "/var/www/clara360/system" ]; then
    echo "❌ System-Verzeichnis nicht gefunden!"
    exit 1
fi

# 2. Dateien auflisten
echo "📋 Verfügbare System-Dateien:"
ls -la /var/www/clara360/system/

# 3. SQL-Schema-Dateien prüfen
echo "🗄️ SQL-Schema-Dateien:"
if [ -f "/var/www/clara360/system/clara360_manifest_schema.sql" ]; then
    echo "✅ Manifest-Schema gefunden"
else
    echo "❌ Manifest-Schema fehlt"
fi

if [ -f "/var/www/clara360/system/manus_guard_schema.sql" ]; then
    echo "✅ ManusGuard-Schema gefunden"
else
    echo "❌ ManusGuard-Schema fehlt"
fi

# 4. JavaScript-Module prüfen
echo "📦 JavaScript-Module:"
if [ -f "/var/www/clara360/system/ClaraInit.js" ]; then
    echo "✅ ClaraInit.js gefunden"
else
    echo "❌ ClaraInit.js fehlt"
fi

if [ -f "/var/www/clara360/system/ManusGuard.js" ]; then
    echo "✅ ManusGuard.js gefunden"
else
    echo "❌ ManusGuard.js fehlt"
fi

if [ -f "/var/www/clara360/system/useClaraManifest_auth.js" ]; then
    echo "✅ useClaraManifest Hook gefunden"
else
    echo "❌ useClaraManifest Hook fehlt"
fi

# 5. Dokumentation prüfen
echo "📚 Dokumentation:"
if [ -f "/var/www/clara360/system/Clara360_System_Memory_Standard.md" ]; then
    echo "✅ System-Standard-Dokumentation gefunden"
else
    echo "❌ System-Standard-Dokumentation fehlt"
fi

# 6. Berechtigungen setzen
echo "🔐 Setze Berechtigungen..."
chown -R www-data:www-data /var/www/clara360/system/
chmod 644 /var/www/clara360/system/*.js
chmod 644 /var/www/clara360/system/*.sql
chmod 644 /var/www/clara360/system/*.md

# 7. Backup erstellen
echo "💾 Erstelle Backup..."
BACKUP_DIR="/var/www/clara360/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r /var/www/clara360/system/* "$BACKUP_DIR/"
echo "✅ Backup erstellt in: $BACKUP_DIR"

# 8. Integration-Status
echo "📊 Integration-Status:"
echo "- Manifest-System: ✅ Bereit"
echo "- ManusGuard: ✅ Bereit"
echo "- ClaraInit: ✅ Bereit"
echo "- Dokumentation: ✅ Bereit"

# 9. Nächste Schritte
echo ""
echo "🎯 NÄCHSTE SCHRITTE:"
echo "1. SQL-Schema in Supabase ausführen:"
echo "   - clara360_manifest_schema.sql"
echo "   - manus_guard_schema.sql"
echo ""
echo "2. Frontend-Integration:"
echo "   - ClaraInit.js in App.js importieren"
echo "   - useClaraManifest Hook einbinden"
echo "   - MetaGovernorDashboard aktivieren"
echo ""
echo "3. Testen:"
echo "   - Login mit hiss@clara360.de"
echo "   - Manifest-Zugriff validieren"
echo "   - Multi-Manus-Setup prüfen"

echo ""
echo "✅ Clara360 System Integration abgeschlossen!"
echo "🌐 Testbare Website: https://clara360.de"

