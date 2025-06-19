// ClaraInit.js - Zentrale Startfunktion für alle Manus-Einheiten
// Version: 1.0.0 - Multi-Manus-Standard für Clara360

import { supabase } from '../lib/supabase';

/**
 * Clara360 System Memory Standard (Slot M01)
 * Zentrale Initialisierung für alle Manus-Einheiten
 * 
 * Verwendung:
 * import { ClaraInit } from './system/ClaraInit';
 * const context = await ClaraInit.initialize();
 */

export class ClaraInit {
  static version = "1.0.0";
  static requiredComponents = ["users", "manifest", "vault"];
  
  /**
   * Hauptinitialisierung für alle Manus-Einheiten
   * @param {string} manusId - Eindeutige Manus-Kennung (z.B. "manus-a", "manus-b")
   * @returns {Object} Vollständiger Systemkontext
   */
  static async initialize(manusId = null) {
    console.log(`🚀 ClaraInit v${this.version} - Starte Manus-Einheit: ${manusId || 'unknown'}`);
    
    try {
      // 1. Authentifizierung prüfen
      const authResult = await this.checkAuthentication();
      if (!authResult.success) {
        throw new Error(`Authentifizierung fehlgeschlagen: ${authResult.error}`);
      }

      // 2. Benutzer-Kontext laden
      const userContext = await this.loadUserContext(authResult.user);
      
      // 3. System-Manifest laden
      const systemManifest = await this.loadClaraContext(userContext.role);
      
      // 4. Manus-Registrierung prüfen/erstellen
      const manusRegistration = await this.ensureManusRegistration(manusId, userContext);
      
      // 5. Vault-Zugriff validieren
      const vaultAccess = await this.validateVaultAccess(userContext);
      
      // 6. Vollständigen Kontext zusammenstellen
      const fullContext = {
        manus: {
          id: manusId,
          registration: manusRegistration,
          initTimestamp: new Date().toISOString()
        },
        user: userContext,
        system: systemManifest,
        vault: vaultAccess,
        version: this.version,
        status: "initialized"
      };

      // 7. Orientierungsbriefing generieren
      const orientation = this.generateOrientationBriefing(fullContext);
      
      console.log('✅ ClaraInit erfolgreich - Kontext geladen:', {
        manusId,
        userRole: userContext.role,
        manifestVersion: systemManifest.manifestVersion,
        activeObject: systemManifest.activeObject,
        criticalIssues: systemManifest.criticalIssues?.length || 0
      });

      return {
        ...fullContext,
        orientation
      };

    } catch (error) {
      console.error('❌ ClaraInit Fehler:', error);
      throw new Error(`ClaraInit fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Authentifizierung prüfen
   */
  static async checkAuthentication() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      if (!session?.user) {
        return { success: false, error: "Keine aktive Session" };
      }

      return { success: true, user: session.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Benutzer-Kontext aus users-Tabelle laden
   */
  static async loadUserContext(authUser) {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        throw new Error(`Benutzer nicht gefunden: ${error.message}`);
      }

      // Berechtigungen validieren
      const allowedRoles = ['metaGovernor', 'manus', 'admin'];
      if (!allowedRoles.includes(userData.role)) {
        throw new Error(`Ungültige Rolle: ${userData.role}`);
      }

      return {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        permissions: userData.permissions || [],
        hasManifestAccess: ['metaGovernor', 'manus'].includes(userData.role),
        hasVaultAccess: userData.permissions?.includes('vault:access') || false,
        hasSystemAccess: userData.role === 'metaGovernor' || userData.permissions?.includes('system:admin') || false
      };
    } catch (error) {
      throw new Error(`Benutzer-Kontext-Fehler: ${error.message}`);
    }
  }

  /**
   * Zentrales System-Manifest laden
   */
  static async loadClaraContext(userRole) {
    try {
      const { data, error } = await supabase
        .from('manifest')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        throw new Error(`Manifest nicht gefunden: ${error.message}`);
      }

      // Zugriffsberechtigung prüfen
      const visibleRoles = data.visible_to_roles || [];
      if (!visibleRoles.includes(userRole)) {
        throw new Error(`Keine Berechtigung für Manifest-Zugriff (Rolle: ${userRole})`);
      }

      return data.context_json;
    } catch (error) {
      throw new Error(`Manifest-Lade-Fehler: ${error.message}`);
    }
  }

  /**
   * Manus-Registrierung sicherstellen
   */
  static async ensureManusRegistration(manusId, userContext) {
    if (!manusId) {
      return { registered: false, reason: "Keine Manus-ID angegeben" };
    }

    try {
      // Prüfen ob Manus bereits registriert
      const { data: existingManus, error: checkError } = await supabase
        .from('manus_registry')
        .select('*')
        .eq('manus_id', manusId)
        .single();

      if (!checkError && existingManus) {
        // Update last_seen
        await supabase
          .from('manus_registry')
          .update({ 
            last_seen: new Date().toISOString(),
            user_id: userContext.id 
          })
          .eq('manus_id', manusId);

        return {
          registered: true,
          existing: true,
          data: existingManus
        };
      }

      // Neue Registrierung erstellen
      const { data: newManus, error: insertError } = await supabase
        .from('manus_registry')
        .insert({
          manus_id: manusId,
          user_id: userContext.id,
          role: userContext.role,
          registered_at: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (insertError) {
        console.warn('Manus-Registrierung fehlgeschlagen:', insertError);
        return { registered: false, error: insertError.message };
      }

      return {
        registered: true,
        existing: false,
        data: newManus
      };

    } catch (error) {
      console.warn('Manus-Registrierung-Fehler:', error);
      return { registered: false, error: error.message };
    }
  }

  /**
   * Vault-Zugriff validieren
   */
  static async validateVaultAccess(userContext) {
    const hasAccess = userContext.hasVaultAccess;
    
    if (!hasAccess) {
      return {
        hasAccess: false,
        reason: "Keine Vault-Berechtigung"
      };
    }

    try {
      // Vault-Status prüfen (vereinfacht)
      return {
        hasAccess: true,
        location: "/root/clara360_rebuild/dist/",
        fileCount: "30+",
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      return {
        hasAccess: false,
        error: error.message
      };
    }
  }

  /**
   * Orientierungsbriefing für Manus-Einheiten generieren
   */
  static generateOrientationBriefing(context) {
    const { system, user, manus } = context;
    
    return {
      welcome: `Willkommen ${manus.id || 'Manus-Einheit'} im Clara360-System`,
      currentFocus: system.activeObject,
      buildPhase: system.userContext?.buildStatus,
      urgentTasks: system.criticalIssues?.filter(
        issue => issue.status === 'open' && issue.priority === 'high'
      ) || [],
      availableSlots: Object.keys(system.userContext?.slots || {}),
      nextSteps: system.nextModules || [],
      systemHealth: {
        auth: system.systemState?.authSystem,
        database: system.systemState?.databaseConnection,
        dataQuality: system.systemState?.dummyDataPresent ? 'contaminated' : 'clean'
      },
      userCapabilities: {
        role: user.role,
        canEditManifest: user.hasManifestAccess,
        canAccessVault: user.hasVaultAccess,
        canAdminSystem: user.hasSystemAccess
      },
      quickStart: this.generateQuickStartGuide(context)
    };
  }

  /**
   * Schnellstart-Anleitung generieren
   */
  static generateQuickStartGuide(context) {
    const { user } = context;
    const guide = [];

    if (user.hasManifestAccess) {
      guide.push("📋 Manifest-Zugriff: useClaraManifest() Hook verwenden");
    }

    if (user.hasVaultAccess) {
      guide.push("📁 Vault-Zugriff: VaultBridge für Datei-Operationen");
    }

    if (user.hasSystemAccess) {
      guide.push("⚙️ System-Admin: MetaGovernorDashboard verfügbar");
    }

    guide.push("🔄 Slot-Updates: updateSlotStatus() für Fortschritt");
    guide.push("🚨 Problem-Meldung: addCriticalIssue() für Probleme");

    return guide;
  }

  /**
   * Abweichungsschutz - Prüft ob Manus-Einheit registriert ist
   */
  static async validateManusIntegrity(manusId, requiredSlots = []) {
    if (!manusId) {
      throw new Error("Unregistered slot – please sync with MetaGovernor");
    }

    try {
      const context = await this.loadClaraContext('manus');
      const availableSlots = Object.keys(context.userContext?.slots || {});
      
      // Prüfe ob alle erforderlichen Slots verfügbar sind
      const missingSlots = requiredSlots.filter(slot => !availableSlots.includes(slot));
      
      if (missingSlots.length > 0) {
        throw new Error(`Missing required slots: ${missingSlots.join(', ')} – please sync with MetaGovernor`);
      }

      return { valid: true, availableSlots };
    } catch (error) {
      throw new Error(`Manus integrity check failed: ${error.message}`);
    }
  }

  /**
   * Fallback-Kontext für Notfälle
   */
  static getFallbackContext() {
    return {
      manus: { id: "fallback", status: "emergency" },
      user: { role: "limited", hasManifestAccess: false },
      system: {
        activeObject: "unknown",
        userContext: { buildStatus: "fallback_mode", slots: {} },
        systemState: { authSystem: "unknown", databaseConnection: "unknown" }
      },
      orientation: {
        welcome: "Fallback-Modus aktiv - Bitte MetaGovernor kontaktieren",
        urgentTasks: ["System-Wiederherstellung erforderlich"],
        quickStart: ["Kontaktiere hiss@clara360.de für Support"]
      }
    };
  }
}

