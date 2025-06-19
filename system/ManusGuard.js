// ManusGuard.js - Abweichungsschutz und Registrierungspflicht für Clara360
// Version: 1.0.0 - Multi-Manus-Sicherheitssystem

import { supabase } from '../lib/supabase';
import { ClaraInit } from './ClaraInit';

/**
 * ManusGuard - Sicherheitssystem für Multi-Manus-Koordination
 * 
 * Funktionen:
 * - Registrierungspflicht für neue Manus-Einheiten
 * - Abweichungsschutz gegen unkoordinierte Einheiten
 * - Slot-Integrität und Zugriffskontrolle
 * - Automatische Deregistrierung inaktiver Einheiten
 */

export class ManusGuard {
  static version = "1.0.0";
  static maxInactiveHours = 24;
  static requiredSlots = ["manifest_access", "system_sync"];

  /**
   * Hauptvalidierung für Manus-Einheiten
   * @param {string} manusId - Eindeutige Manus-Kennung
   * @param {Array} requiredSlots - Erforderliche Slots für diese Einheit
   * @param {boolean} autoRegister - Automatische Registrierung erlauben
   * @returns {Object} Validierungsergebnis
   */
  static async validateManus(manusId, requiredSlots = [], autoRegister = false) {
    console.log(`🛡️ ManusGuard v${this.version} - Validiere: ${manusId}`);

    try {
      // 1. Grundlegende Validierung
      if (!manusId || typeof manusId !== 'string') {
        throw new Error("Ungültige Manus-ID - Registrierung erforderlich");
      }

      // 2. Authentifizierung prüfen
      const authCheck = await this.checkAuthentication();
      if (!authCheck.success) {
        throw new Error(`Authentifizierung fehlgeschlagen: ${authCheck.error}`);
      }

      // 3. Registrierungsstatus prüfen
      const registrationStatus = await this.checkRegistration(manusId);
      
      if (!registrationStatus.isRegistered) {
        if (autoRegister) {
          const registration = await this.registerManus(manusId, authCheck.user);
          if (!registration.success) {
            throw new Error(`Auto-Registrierung fehlgeschlagen: ${registration.error}`);
          }
        } else {
          throw new Error("Unregistered slot – please sync with MetaGovernor");
        }
      }

      // 4. Slot-Integrität prüfen
      const slotCheck = await this.validateSlotIntegrity(requiredSlots);
      if (!slotCheck.valid) {
        throw new Error(`Slot-Integrität verletzt: ${slotCheck.error}`);
      }

      // 5. Zugriffsberechtigung validieren
      const accessCheck = await this.validateAccess(authCheck.user, requiredSlots);
      if (!accessCheck.hasAccess) {
        throw new Error(`Zugriff verweigert: ${accessCheck.reason}`);
      }

      // 6. Aktivitätsstatus aktualisieren
      await this.updateActivity(manusId);

      console.log('✅ ManusGuard Validierung erfolgreich:', {
        manusId,
        registrationStatus: registrationStatus.status,
        slotsValidated: requiredSlots.length,
        userRole: authCheck.user.role
      });

      return {
        valid: true,
        manusId,
        registration: registrationStatus,
        slots: slotCheck,
        access: accessCheck,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ ManusGuard Validierung fehlgeschlagen:', error);
      
      // Sicherheitsereignis protokollieren
      await this.logSecurityEvent(manusId, 'validation_failed', error.message);
      
      throw error;
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

      // Benutzer-Details laden
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        return { success: false, error: `Benutzer nicht gefunden: ${userError.message}` };
      }

      return { 
        success: true, 
        user: {
          id: userData.id,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions || []
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Registrierungsstatus prüfen
   */
  static async checkRegistration(manusId) {
    try {
      const { data, error } = await supabase
        .from('manus_registry')
        .select('*')
        .eq('manus_id', manusId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new Error(`Registrierungsabfrage fehlgeschlagen: ${error.message}`);
      }

      if (!data) {
        return {
          isRegistered: false,
          status: 'unregistered',
          reason: 'Manus-ID nicht in Registry gefunden'
        };
      }

      // Aktivitätsstatus prüfen
      const lastSeen = new Date(data.last_seen);
      const hoursInactive = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60);
      
      if (hoursInactive > this.maxInactiveHours) {
        return {
          isRegistered: true,
          status: 'inactive',
          reason: `Inaktiv seit ${Math.round(hoursInactive)} Stunden`,
          data
        };
      }

      return {
        isRegistered: true,
        status: data.status || 'active',
        data
      };

    } catch (error) {
      throw new Error(`Registrierungsprüfung fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Neue Manus-Einheit registrieren
   */
  static async registerManus(manusId, user) {
    try {
      const registrationData = {
        manus_id: manusId,
        user_id: user.id,
        role: user.role,
        registered_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        status: 'pending_approval',
        metadata: {
          registeredBy: user.email,
          version: this.version,
          autoRegistered: true
        }
      };

      const { data, error } = await supabase
        .from('manus_registry')
        .insert(registrationData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Registrierungsereignis protokollieren
      await this.logSecurityEvent(manusId, 'auto_registered', `Automatisch registriert für ${user.email}`);

      console.log('📝 Manus automatisch registriert:', manusId);

      return {
        success: true,
        data,
        requiresApproval: true
      };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Slot-Integrität validieren
   */
  static async validateSlotIntegrity(requiredSlots = []) {
    try {
      // Aktuelles Manifest laden
      const manifest = await ClaraInit.loadClaraContext('manus');
      const availableSlots = Object.keys(manifest.userContext?.slots || {});
      
      // Basis-Slots prüfen
      const allRequiredSlots = [...this.requiredSlots, ...requiredSlots];
      const missingSlots = allRequiredSlots.filter(slot => !availableSlots.includes(slot));
      
      if (missingSlots.length > 0) {
        return {
          valid: false,
          error: `Fehlende Slots: ${missingSlots.join(', ')}`,
          missingSlots,
          availableSlots
        };
      }

      // Slot-Status validieren
      const inactiveSlots = Object.entries(manifest.userContext.slots)
        .filter(([slot, status]) => allRequiredSlots.includes(slot) && status === 'inactive')
        .map(([slot]) => slot);

      if (inactiveSlots.length > 0) {
        return {
          valid: false,
          error: `Inaktive erforderliche Slots: ${inactiveSlots.join(', ')}`,
          inactiveSlots,
          availableSlots
        };
      }

      return {
        valid: true,
        availableSlots,
        validatedSlots: allRequiredSlots
      };

    } catch (error) {
      return {
        valid: false,
        error: `Slot-Validierung fehlgeschlagen: ${error.message}`
      };
    }
  }

  /**
   * Zugriffsberechtigung validieren
   */
  static async validateAccess(user, requiredSlots = []) {
    try {
      // Rolle prüfen
      const allowedRoles = ['metaGovernor', 'manus', 'admin'];
      if (!allowedRoles.includes(user.role)) {
        return {
          hasAccess: false,
          reason: `Ungültige Rolle: ${user.role}`
        };
      }

      // Basis-Berechtigungen prüfen
      const requiredPermissions = ['manifest:read'];
      if (requiredSlots.length > 0) {
        requiredPermissions.push('vault:access');
      }

      const missingPermissions = requiredPermissions.filter(
        perm => !user.permissions.includes(perm) && user.role !== 'metaGovernor'
      );

      if (missingPermissions.length > 0) {
        return {
          hasAccess: false,
          reason: `Fehlende Berechtigungen: ${missingPermissions.join(', ')}`
        };
      }

      return {
        hasAccess: true,
        role: user.role,
        permissions: user.permissions
      };

    } catch (error) {
      return {
        hasAccess: false,
        reason: `Zugriffsprüfung fehlgeschlagen: ${error.message}`
      };
    }
  }

  /**
   * Aktivitätsstatus aktualisieren
   */
  static async updateActivity(manusId) {
    try {
      const { error } = await supabase
        .from('manus_registry')
        .update({ 
          last_seen: new Date().toISOString(),
          status: 'active'
        })
        .eq('manus_id', manusId);

      if (error) {
        console.warn('Aktivitäts-Update fehlgeschlagen:', error);
      }
    } catch (error) {
      console.warn('Aktivitäts-Update-Fehler:', error);
    }
  }

  /**
   * Sicherheitsereignis protokollieren
   */
  static async logSecurityEvent(manusId, eventType, details) {
    try {
      const { error } = await supabase
        .from('security_log')
        .insert({
          manus_id: manusId,
          event_type: eventType,
          details,
          timestamp: new Date().toISOString(),
          guard_version: this.version
        });

      if (error && error.code !== '42P01') { // Tabelle existiert nicht
        console.warn('Security-Log fehlgeschlagen:', error);
      }
    } catch (error) {
      console.warn('Security-Log-Fehler:', error);
    }
  }

  /**
   * Inaktive Manus-Einheiten bereinigen (nur für MetaGovernor)
   */
  static async cleanupInactiveManus() {
    try {
      const cutoffTime = new Date(Date.now() - (this.maxInactiveHours * 60 * 60 * 1000));
      
      const { data, error } = await supabase
        .from('manus_registry')
        .update({ status: 'inactive' })
        .lt('last_seen', cutoffTime.toISOString())
        .eq('status', 'active')
        .select();

      if (error) {
        throw new Error(`Cleanup fehlgeschlagen: ${error.message}`);
      }

      console.log(`🧹 ${data?.length || 0} inaktive Manus-Einheiten markiert`);
      return { cleaned: data?.length || 0 };

    } catch (error) {
      console.error('Cleanup-Fehler:', error);
      throw error;
    }
  }

  /**
   * Notfall-Deregistrierung (nur für MetaGovernor)
   */
  static async emergencyDeregister(manusId, reason) {
    try {
      const { error } = await supabase
        .from('manus_registry')
        .update({ 
          status: 'deregistered',
          deregistered_at: new Date().toISOString(),
          deregistration_reason: reason
        })
        .eq('manus_id', manusId);

      if (error) {
        throw new Error(`Notfall-Deregistrierung fehlgeschlagen: ${error.message}`);
      }

      await this.logSecurityEvent(manusId, 'emergency_deregistered', reason);
      console.log(`🚨 Notfall-Deregistrierung: ${manusId} - ${reason}`);

    } catch (error) {
      console.error('Notfall-Deregistrierung-Fehler:', error);
      throw error;
    }
  }

  /**
   * System-Status für MetaGovernor
   */
  static async getSystemStatus() {
    try {
      const { data: registrations, error } = await supabase
        .from('manus_registry')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) {
        throw new Error(`Status-Abfrage fehlgeschlagen: ${error.message}`);
      }

      const now = Date.now();
      const stats = {
        total: registrations.length,
        active: 0,
        inactive: 0,
        pending: 0,
        deregistered: 0
      };

      registrations.forEach(reg => {
        const hoursInactive = (now - new Date(reg.last_seen).getTime()) / (1000 * 60 * 60);
        
        if (reg.status === 'deregistered') {
          stats.deregistered++;
        } else if (reg.status === 'pending_approval') {
          stats.pending++;
        } else if (hoursInactive > this.maxInactiveHours) {
          stats.inactive++;
        } else {
          stats.active++;
        }
      });

      return {
        stats,
        registrations,
        lastUpdate: new Date().toISOString()
      };

    } catch (error) {
      console.error('System-Status-Fehler:', error);
      throw error;
    }
  }
}

