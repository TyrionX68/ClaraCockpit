// useClaraManifest.js - DSGVO-konformer Hook mit Supabase Auth
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useClaraManifest = () => {
  const [manifest, setManifest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  // Auth-Status überwachen
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await checkUserAccess(session.user);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await checkUserAccess(session.user);
        } else {
          setUser(null);
          setHasAccess(false);
          setManifest(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Benutzer-Zugriff prüfen
  const checkUserAccess = async (authUser) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('Benutzer-Zugriff-Fehler:', userError);
        setHasAccess(false);
        return;
      }

      setUser(userData);
      
      // Zugriff prüfen: MetaGovernor oder Manus
      const allowedRoles = ['metaGovernor', 'manus'];
      const userHasAccess = allowedRoles.includes(userData.role);
      setHasAccess(userHasAccess);

      if (userHasAccess) {
        await loadManifest();
      }

    } catch (err) {
      console.error('Auth-Fehler:', err);
      setHasAccess(false);
    }
  };

  // Manifest laden (nur bei Berechtigung)
  const loadManifest = async () => {
    if (!hasAccess) {
      setError('Keine Berechtigung für Manifest-Zugriff');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error: manifestError } = await supabase
        .from('manifest')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (manifestError) {
        throw new Error(`Manifest nicht gefunden: ${manifestError.message}`);
      }

      setManifest(data.context_json);
      
      // Orientierung für Manus-Einheiten
      console.log('🎯 Clara Context Manifest geladen:', {
        activeObject: data.context_json.activeObject,
        buildStatus: data.context_json.userContext.buildStatus,
        criticalIssues: data.context_json.criticalIssues?.length || 0,
        userRole: user?.role,
        manifestVersion: data.context_json.manifestVersion
      });
      
    } catch (err) {
      setError(err.message);
      console.error('❌ Manifest-Fehler:', err);
    } finally {
      setLoading(false);
    }
  };

  // Manifest aktualisieren (nur für berechtigte Benutzer)
  const updateManifest = async (updates) => {
    if (!hasAccess || !user) {
      throw new Error('Keine Berechtigung für Manifest-Updates');
    }

    try {
      const updatedManifest = {
        ...manifest,
        ...updates,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: user.email
      };

      const { error } = await supabase
        .from('manifest')
        .update({
          context_json: updatedManifest,
          last_updated_by: user.id
        })
        .eq('context_json->>activeObject', manifest.activeObject);

      if (error) {
        throw new Error(`Manifest-Update-Fehler: ${error.message}`);
      }

      setManifest(updatedManifest);
      
      console.log('📝 Manifest aktualisiert:', {
        updates,
        by: user.email,
        timestamp: updatedManifest.lastUpdated
      });
      
      return updatedManifest;
      
    } catch (err) {
      console.error('❌ Manifest-Update-Fehler:', err);
      throw err;
    }
  };

  // Slot-Status aktualisieren
  const updateSlotStatus = async (slotName, status) => {
    return updateManifest({
      userContext: {
        ...manifest.userContext,
        slots: {
          ...manifest.userContext.slots,
          [slotName]: status
        }
      }
    });
  };

  // Kritisches Problem hinzufügen
  const addCriticalIssue = async (issue) => {
    const newIssue = {
      ...issue,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      reportedBy: user.email
    };
    
    return updateManifest({
      criticalIssues: [
        ...(manifest.criticalIssues || []),
        newIssue
      ]
    });
  };

  // Problem als gelöst markieren
  const resolveCriticalIssue = async (issueId) => {
    return updateManifest({
      criticalIssues: manifest.criticalIssues?.filter(
        issue => issue.id !== issueId
      ) || []
    });
  };

  // Orientierungshilfe für neue Manus-Einheiten
  const getOrientationBriefing = () => {
    if (!manifest || !hasAccess) return null;
    
    return {
      currentFocus: manifest.activeObject,
      buildPhase: manifest.userContext.buildStatus,
      urgentTasks: manifest.criticalIssues?.filter(
        issue => issue.priority === 'high'
      ) || [],
      nextSteps: manifest.nextModules || [],
      systemHealth: {
        auth: manifest.systemState.authSystem,
        database: manifest.systemState.databaseConnection,
        dataQuality: manifest.systemState.dummyDataPresent ? 'contaminated' : 'clean'
      },
      userAccess: {
        role: user?.role,
        permissions: user?.permissions || [],
        canEdit: ['metaGovernor', 'manus'].includes(user?.role)
      }
    };
  };

  // Vault-Zugriff prüfen
  const hasVaultAccess = () => {
    return hasAccess && user?.permissions?.includes('vault:access');
  };

  // System-Admin-Zugriff prüfen
  const hasSystemAccess = () => {
    return user?.role === 'metaGovernor' || 
           user?.permissions?.includes('system:admin');
  };

  return {
    manifest,
    loading,
    error,
    user,
    hasAccess,
    hasVaultAccess,
    hasSystemAccess,
    updateManifest,
    updateSlotStatus,
    addCriticalIssue,
    resolveCriticalIssue,
    getOrientationBriefing,
    reload: loadManifest
  };
};

