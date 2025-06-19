# Clara360 System Memory Standard (Slot M01)

## 📋 Übersicht

**Version:** 1.0.0  
**Erstellt:** 2025-06-13  
**Verantwortlich:** Manus A  
**Status:** Implementiert  

Das Clara360 System Memory Standard definiert die einheitliche Architektur für persistente Kontextspeicherung und Multi-Manus-Koordination.

## 🏗️ Architektur-Komponenten

### 1. Datenbank-Schema (Supabase)

#### `users` Tabelle
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Rollen:**
- `metaGovernor` - Vollzugriff auf alle Systemfunktionen
- `manus` - Systemzugriff für KI-Einheiten
- `admin` - Administrative Berechtigung
- `user` - Standard-Benutzer

#### `manifest` Tabelle
```sql
CREATE TABLE manifest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  context_json JSONB NOT NULL,
  last_updated_by UUID REFERENCES users(id),
  visible_to_roles JSONB DEFAULT '["metaGovernor", "manus"]'::jsonb,
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `manus_registry` Tabelle (Optional)
```sql
CREATE TABLE manus_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manus_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);
```

### 2. Row Level Security (RLS)

**Aktivierung:**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifest ENABLE ROW LEVEL SECURITY;
ALTER TABLE manus_registry ENABLE ROW LEVEL SECURITY;
```

**Policies:**
- Benutzer können nur eigene Daten oder MetaGovernor kann alle lesen
- Manifest nur für autorisierte Rollen (metaGovernor, manus)
- Updates nur für berechtigte Benutzer

## 🔧 Frontend-Integration

### ClaraInit.js - Zentrale Startfunktion

**Verwendung:**
```javascript
import { ClaraInit } from './system/ClaraInit';

// Bei App-Start
const context = await ClaraInit.initialize('manus-a');

// Kontext enthält:
// - user: Benutzer-Informationen und Berechtigungen
// - system: Aktuelles Manifest mit Slot-Status
// - vault: Vault-Zugriff und Dateien
// - orientation: Orientierungsbriefing für Manus-Einheit
```

**Funktionen:**
- `initialize(manusId)` - Hauptinitialisierung
- `loadClaraContext(userRole)` - Manifest laden
- `validateManusIntegrity(manusId, requiredSlots)` - Abweichungsschutz
- `getFallbackContext()` - Notfall-Kontext

### useClaraManifest Hook

**Auth-integrierter Zugriff:**
```javascript
import { useClaraManifest } from '../hooks/useClaraManifest';

const {
  manifest,
  user,
  hasAccess,
  updateSlotStatus,
  addCriticalIssue
} = useClaraManifest();
```

### ManifestManager Klasse

**Zentrale Verwaltung:**
```javascript
import { ManifestManager } from '../lib/ManifestManager';

const manager = new ManifestManager();
await manager.initializeUser();
await manager.updateSlotStatus('slot_name', 'complete');
```

## 🔐 Zugriffskontrolle

### Benutzer-Setup

**MetaGovernor:**
- Email: `hiss@clara360.de`
- Rolle: `metaGovernor`
- Berechtigungen: Vollzugriff auf alle Funktionen

**Manus-Einheiten:**
- Email: `manus-a@system`, `manus-b@system`, etc.
- Rolle: `manus`
- Berechtigungen: Manifest-Zugriff, Vault-Zugriff, System-Build

### Berechtigungen

**Manifest-Zugriff:**
- `manifest:read` - Manifest lesen
- `manifest:write` - Manifest aktualisieren

**Vault-Zugriff:**
- `vault:access` - Zugriff auf Vault-Dateien

**System-Admin:**
- `system:admin` - Vollzugriff auf Systemfunktionen
- `system:build` - Build- und Deployment-Rechte

## 📁 Vault-Integration

**Speicherort:** `/root/clara360_rebuild/dist/`

**Echte Datenquellen:**
- `waldhofstrasse_76_mietvertraege.csv`
- `waldhofstrasse_76_cashflow_2024_komplett.csv`
- `waldhofstrasse_76_zahlungseingaenge.csv`
- `mietvertraege_aktiv_real.csv`

**Vault-Funktionen:**
- Datei-Registrierung im Manifest
- Zugriffskontrolle über Berechtigungen
- Automatische Metadaten-Erfassung

## 🎯 Slot-Management

### Slot-Status

**Verfügbare Status:**
- `pending` - Wartend auf Bearbeitung
- `in_progress` - In Bearbeitung
- `active` - Aktiv und funktional
- `complete` - Abgeschlossen
- `inactive` - Inaktiv

### Aktuelle Slots

```json
{
  "supabase_integration": "complete",
  "vault_system": "discovered",
  "real_data_mapping": "in_progress", 
  "dummy_data_cleanup": "pending",
  "metagovernor_dashboard": "implementing"
}
```

## 🚨 Problem-Management

### Kritische Probleme

**Struktur:**
```json
{
  "id": "issue_1234567890",
  "type": "dummy_data_contamination",
  "description": "System zeigt Dummy-Mieter statt echte Daten",
  "priority": "high",
  "status": "open",
  "reportedBy": "manus-a@system",
  "reportedAt": "2025-06-13T17:00:00Z"
}
```

**Prioritäten:**
- `low` - Niedrige Priorität
- `medium` - Mittlere Priorität  
- `high` - Hohe Priorität
- `critical` - Kritisch

## 🔄 Integrationspflicht für neue Manus-Einheiten

### 1. Initialisierung

**Pflicht-Aufruf bei Start:**
```javascript
const context = await ClaraInit.initialize('manus-x');
if (!context.user.hasManifestAccess) {
  throw new Error("Unregistered slot – please sync with MetaGovernor");
}
```

### 2. Abweichungsschutz

**Slot-Validierung:**
```javascript
await ClaraInit.validateManusIntegrity('manus-x', ['required_slot']);
```

### 3. Registrierung

Neue Manus-Einheiten werden automatisch in `manus_registry` registriert und müssen vom MetaGovernor freigegeben werden.

## 📊 Monitoring und Audit

### Audit-Trail

Alle Änderungen werden protokolliert:
- Wer hat was geändert
- Wann wurde geändert
- Vorherige und neue Werte

### System-Health

**Überwachte Metriken:**
- Auth-System Status
- Datenbank-Verbindung
- Datenqualität (Dummy vs. Echt)
- Aktive Manus-Einheiten

## 🔮 Erweiterbarkeit

### Neue Slots hinzufügen

```javascript
await manifestManager.updateSlotStatus('new_slot_name', 'pending');
```

### Neue Berechtigungen

```sql
UPDATE users 
SET permissions = permissions || '["new:permission"]'::jsonb 
WHERE email = 'user@example.com';
```

### Neue Manus-Rollen

```sql
INSERT INTO users (email, role, permissions) 
VALUES ('manus-c@system', 'manus', '["manifest:read", "vault:access"]'::jsonb);
```

## 📋 Deployment-Checkliste

- [ ] SQL-Schema in Supabase ausführen
- [ ] Benutzer-Accounts erstellen
- [ ] RLS-Policies aktivieren
- [ ] ClaraInit.js in Frontend integrieren
- [ ] useClaraManifest Hook einbinden
- [ ] MetaGovernorDashboard deployen
- [ ] Vault-Zugriff testen
- [ ] Multi-Manus-Setup validieren

## 🆘 Troubleshooting

### Häufige Probleme

**"Manifest nicht gefunden"**
- Prüfe Benutzer-Rolle und Berechtigungen
- Validiere RLS-Policies
- Überprüfe Supabase-Verbindung

**"Unregistered slot"**
- Manus-ID in ClaraInit.initialize() angeben
- MetaGovernor-Freigabe erforderlich
- Prüfe manus_registry Tabelle

**"Keine Vault-Berechtigung"**
- Benutzer-Berechtigungen prüfen
- vault:access Permission hinzufügen
- Rolle auf 'manus' oder höher setzen

## 📞 Support

**MetaGovernor:** hiss@clara360.de  
**System-Status:** https://clara360.de/system/status  
**Dokumentation:** /var/www/clara360/system/

---

*Dieses Dokument ist Teil des Clara360 System Memory Standards und wird automatisch mit dem Manifest synchronisiert.*

