-- DSGVO-konformes Manifest-System für Clara360
-- Supabase SQL Schema für rollenbasiertes Systemgedächtnis

-- 1. Users-Tabelle erweitern (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Manifest-Tabelle erstellen
CREATE TABLE IF NOT EXISTS manifest (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  context_json JSONB NOT NULL,
  last_updated_by UUID REFERENCES users(id),
  visible_to_roles JSONB DEFAULT '["metaGovernor", "manus"]'::jsonb,
  version TEXT DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS aktivieren
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manifest ENABLE ROW LEVEL SECURITY;

-- 4. RLS-Policy für Users (nur eigene Daten oder MetaGovernor)
CREATE POLICY "Users can read own data or metaGovernor can read all"
ON users
FOR SELECT
USING (
  auth.uid() = id 
  OR 
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'metaGovernor'
  )
);

-- 5. RLS-Policy für Manifest (nur autorisierte Rollen)
CREATE POLICY "Allow read for governor & manus"
ON manifest
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users
    WHERE role = ANY(
      SELECT jsonb_array_elements_text(visible_to_roles)
      FROM manifest m2 
      WHERE m2.id = manifest.id
    )
  )
);

-- 6. RLS-Policy für Manifest Updates (nur MetaGovernor und Manus)
CREATE POLICY "Allow update for governor & manus"
ON manifest
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM users
    WHERE role IN ('metaGovernor', 'manus')
  )
);

-- 7. RLS-Policy für Manifest Insert (nur MetaGovernor und Manus)
CREATE POLICY "Allow insert for governor & manus"
ON manifest
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users
    WHERE role IN ('metaGovernor', 'manus')
  )
);

-- 8. Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manifest_updated_at 
  BEFORE UPDATE ON manifest 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Initial MetaGovernor User erstellen (falls nicht vorhanden)
INSERT INTO users (id, email, role, permissions)
SELECT 
  gen_random_uuid(),
  'hiss@clara360.de',
  'metaGovernor',
  '["manifest:read", "manifest:write", "vault:access", "system:admin"]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'hiss@clara360.de'
);

-- 10. Manus-A System User erstellen
INSERT INTO users (id, email, role, permissions)
SELECT 
  gen_random_uuid(),
  'manus-a@system',
  'manus',
  '["manifest:read", "manifest:write", "vault:access", "system:build"]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'manus-a@system'
);

-- 11. Initial Manifest erstellen
INSERT INTO manifest (context_json, visible_to_roles)
SELECT 
  '{
    "activeObject": "waldhofstraße_76",
    "userContext": {
      "metaGovernor": "hiss@clara360.de",
      "lastBuild": "2025-06-13",
      "buildStatus": "vault_integration_active",
      "slots": {
        "supabase_integration": "complete",
        "vault_system": "discovered", 
        "real_data_mapping": "in_progress",
        "dummy_data_cleanup": "pending",
        "metagovernor_dashboard": "implementing"
      }
    },
    "systemState": {
      "authSystem": "functional",
      "databaseConnection": "live",
      "vaultLocation": "/root/clara360_rebuild/dist/",
      "realDataSources": [
        "waldhofstrasse_76_mietvertraege.csv",
        "mietvertraege_aktiv_real.csv",
        "waldhofstrasse_76_cashflow_2024_komplett.csv"
      ],
      "dummyDataPresent": true,
      "realMieterCount": 4,
      "lastDataSync": "2025-06-13T17:00:00Z"
    },
    "realMieter": [
      {
        "name": "Vaida Pastarnokaite",
        "einheit": "Café (Erdgeschoss)",
        "miete": 2050.00,
        "status": "Aktiv"
      },
      {
        "name": "Prajwal Chiradoni", 
        "einheit": "1. OG Wohnung",
        "miete": 1300.00,
        "status": "Aktiv"
      },
      {
        "name": "Mohamad Rizki Nurdena",
        "einheit": "3. OG Links", 
        "miete": 445.00,
        "status": "Aktiv"
      },
      {
        "name": "Naser Alsoliman",
        "einheit": "1. OG Mitte",
        "miete": 620.00,
        "status": "Aktiv"
      }
    ],
    "dummyDataToRemove": [
      "Familie Schmidt",
      "Herr Müller", 
      "Frau Weber",
      "Lisa Davis",
      "David Martinez"
    ],
    "vaultFiles": [
      "waldhofstrasse_76_mietvertraege.csv",
      "waldhofstrasse_76_cashflow_2024_komplett.csv",
      "waldhofstrasse_76_zahlungseingaenge.csv",
      "mietvertraege_aktiv_real.csv"
    ],
    "nextModules": [
      "DummyDataCleanup.vue",
      "RealDataImporter.vue", 
      "MetaGovernorDashboard.vue"
    ],
    "criticalIssues": [
      {
        "type": "dummy_data_contamination",
        "description": "System zeigt Dummy-Mieter statt echte Waldhofstraße-Daten",
        "priority": "high",
        "assignedTo": "metagovernor",
        "realDataAvailable": true
      }
    ],
    "manifestVersion": "1.0.0",
    "lastUpdated": "2025-06-13T17:00:00Z",
    "dsgvoCompliant": true,
    "accessControl": {
      "metaGovernorOnly": ["system", "vault", "manifest"],
      "publicAccess": ["dashboard", "reports"]
    }
  }'::jsonb,
  '["metaGovernor", "manus"]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM manifest WHERE context_json->>'activeObject' = 'waldhofstraße_76'
);

