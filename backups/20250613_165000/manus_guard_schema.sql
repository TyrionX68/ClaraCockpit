-- Erweiterte Tabellen für ManusGuard Abweichungsschutz
-- Clara360 Multi-Manus-Sicherheitssystem

-- 1. Manus Registry Tabelle (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS manus_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manus_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending_approval',
  deregistered_at TIMESTAMP WITH TIME ZONE,
  deregistration_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Security Log Tabelle
CREATE TABLE IF NOT EXISTS security_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  manus_id TEXT,
  event_type TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  guard_version TEXT,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. Slot Dependencies Tabelle
CREATE TABLE IF NOT EXISTS slot_dependencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_name TEXT NOT NULL,
  depends_on TEXT NOT NULL,
  dependency_type TEXT DEFAULT 'required', -- required, optional, conditional
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS für neue Tabellen aktivieren
ALTER TABLE manus_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_dependencies ENABLE ROW LEVEL SECURITY;

-- 5. RLS-Policies für manus_registry
CREATE POLICY "MetaGovernor can manage all manus registrations"
ON manus_registry
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'metaGovernor'
  )
);

CREATE POLICY "Manus can read own registration"
ON manus_registry
FOR SELECT
USING (
  user_id = auth.uid()
  OR
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('metaGovernor', 'admin')
  )
);

-- 6. RLS-Policies für security_log
CREATE POLICY "MetaGovernor can read all security logs"
ON security_log
FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'metaGovernor'
  )
);

CREATE POLICY "System can insert security logs"
ON security_log
FOR INSERT
WITH CHECK (true); -- Erlaubt System-Logs von allen authentifizierten Benutzern

-- 7. RLS-Policies für slot_dependencies
CREATE POLICY "All authenticated users can read slot dependencies"
ON slot_dependencies
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "MetaGovernor can manage slot dependencies"
ON slot_dependencies
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'metaGovernor'
  )
);

-- 8. Trigger für updated_at
CREATE TRIGGER update_manus_registry_updated_at 
  BEFORE UPDATE ON manus_registry 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_manus_registry_manus_id ON manus_registry(manus_id);
CREATE INDEX IF NOT EXISTS idx_manus_registry_status ON manus_registry(status);
CREATE INDEX IF NOT EXISTS idx_manus_registry_last_seen ON manus_registry(last_seen);
CREATE INDEX IF NOT EXISTS idx_security_log_manus_id ON security_log(manus_id);
CREATE INDEX IF NOT EXISTS idx_security_log_event_type ON security_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_log_timestamp ON security_log(timestamp);

-- 10. Standard Slot-Dependencies einfügen
INSERT INTO slot_dependencies (slot_name, depends_on, dependency_type) VALUES
('real_data_mapping', 'supabase_integration', 'required'),
('dummy_data_cleanup', 'real_data_mapping', 'required'),
('metagovernor_dashboard', 'manifest_access', 'required'),
('vault_system', 'manifest_access', 'required'),
('clara_connect', 'supabase_integration', 'required')
ON CONFLICT DO NOTHING;

-- 11. Automatische Bereinigung inaktiver Manus-Einheiten (Function)
CREATE OR REPLACE FUNCTION cleanup_inactive_manus()
RETURNS INTEGER AS $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  UPDATE manus_registry 
  SET status = 'inactive'
  WHERE status = 'active' 
    AND last_seen < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  INSERT INTO security_log (event_type, details, timestamp)
  VALUES ('auto_cleanup', 'Marked ' || cleanup_count || ' manus as inactive', NOW());
  
  RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Manus-Status-Übersicht (View)
CREATE OR REPLACE VIEW manus_status_overview AS
SELECT 
  mr.manus_id,
  mr.status,
  mr.role,
  u.email as user_email,
  mr.registered_at,
  mr.last_seen,
  EXTRACT(EPOCH FROM (NOW() - mr.last_seen))/3600 as hours_inactive,
  CASE 
    WHEN mr.status = 'active' AND mr.last_seen > NOW() - INTERVAL '1 hour' THEN 'online'
    WHEN mr.status = 'active' AND mr.last_seen > NOW() - INTERVAL '24 hours' THEN 'recent'
    WHEN mr.status = 'active' THEN 'stale'
    ELSE mr.status
  END as computed_status
FROM manus_registry mr
LEFT JOIN users u ON mr.user_id = u.id
ORDER BY mr.last_seen DESC;

-- 13. Security Events Summary (View)
CREATE OR REPLACE VIEW security_events_summary AS
SELECT 
  event_type,
  COUNT(*) as event_count,
  MAX(timestamp) as last_occurrence,
  COUNT(DISTINCT manus_id) as affected_manus
FROM security_log 
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY event_type
ORDER BY event_count DESC;

-- 14. Initial MetaGovernor Manus registrieren
INSERT INTO manus_registry (manus_id, user_id, role, status, metadata)
SELECT 
  'metagovernor-system',
  u.id,
  'metaGovernor',
  'active',
  '{"system": true, "auto_registered": true}'::jsonb
FROM users u 
WHERE u.email = 'hiss@clara360.de'
  AND NOT EXISTS (
    SELECT 1 FROM manus_registry WHERE manus_id = 'metagovernor-system'
  );

-- 15. Manus-A System registrieren
INSERT INTO manus_registry (manus_id, user_id, role, status, metadata)
SELECT 
  'manus-a-system',
  u.id,
  'manus',
  'active',
  '{"system": true, "auto_registered": true}'::jsonb
FROM users u 
WHERE u.email = 'manus-a@system'
  AND NOT EXISTS (
    SELECT 1 FROM manus_registry WHERE manus_id = 'manus-a-system'
  );

