// ManifestManager.js - Zentrale Verwaltung für Manifest-System
import { supabase } from '../lib/supabase';

export class ManifestManager {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
  }

  // Benutzer initialisieren
  async initializeUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('Nicht authentifiziert');
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        throw new Error(`Benutzer nicht gefunden: ${error.message}`);
      }

      this.currentUser = userData;
      this.userRole = userData.role;

      return userData;
    } catch (error) {
      console.error('Benutzer-Initialisierung fehlgeschlagen:', error);
      throw error;
    }
  }

  // Berechtigung prüfen
  hasPermission(permission) {
    if (!this.currentUser) return false;
    
    // MetaGovernor hat alle Rechte
    if (this.userRole === 'metaGovernor') return true;
    
    // Spezifische Berechtigung prüfen
    return this.currentUser.permissions?.includes(permission) || false;
  }

  // Manifest erstellen
  async createManifest(contextData, visibleToRoles = ['metaGovernor', 'manus']) {
    if (!this.hasPermission('manifest:write')) {
      throw new Error('Keine Berechtigung zum Erstellen von Manifesten');
    }

    try {
      const { data, error } = await supabase
        .from('manifest')
        .insert({
          context_json: {
            ...contextData,
            manifestVersion: '1.0.0',
            lastUpdated: new Date().toISOString(),
            createdBy: this.currentUser.email
          },
          last_updated_by: this.currentUser.id,
          visible_to_roles: visibleToRoles
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Manifest-Erstellung fehlgeschlagen: ${error.message}`);
      }

      console.log('✅ Manifest erstellt:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Manifest-Erstellung-Fehler:', error);
      throw error;
    }
  }

  // Aktuelles Manifest laden
  async getCurrentManifest() {
    if (!this.hasPermission('manifest:read')) {
      throw new Error('Keine Berechtigung zum Lesen von Manifesten');
    }

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

      return data;
    } catch (error) {
      console.error('❌ Manifest-Lade-Fehler:', error);
      throw error;
    }
  }

  // Slot-Status aktualisieren
  async updateSlotStatus(slotName, status, description = null) {
    if (!this.hasPermission('manifest:write')) {
      throw new Error('Keine Berechtigung zum Aktualisieren von Slots');
    }

    try {
      const manifest = await this.getCurrentManifest();
      const updatedContext = {
        ...manifest.context_json,
        userContext: {
          ...manifest.context_json.userContext,
          slots: {
            ...manifest.context_json.userContext.slots,
            [slotName]: status
          }
        },
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: this.currentUser.email
      };

      // Optional: Slot-Änderung in History protokollieren
      if (!updatedContext.slotHistory) {
        updatedContext.slotHistory = [];
      }
      
      updatedContext.slotHistory.push({
        slot: slotName,
        oldStatus: manifest.context_json.userContext.slots[slotName],
        newStatus: status,
        description,
        timestamp: new Date().toISOString(),
        updatedBy: this.currentUser.email
      });

      const { error } = await supabase
        .from('manifest')
        .update({
          context_json: updatedContext,
          last_updated_by: this.currentUser.id
        })
        .eq('id', manifest.id);

      if (error) {
        throw new Error(`Slot-Update fehlgeschlagen: ${error.message}`);
      }

      console.log(`🔄 Slot ${slotName} → ${status} (${this.currentUser.email})`);
      return updatedContext;
    } catch (error) {
      console.error('❌ Slot-Update-Fehler:', error);
      throw error;
    }
  }

  // Kritisches Problem melden
  async reportCriticalIssue(issue) {
    if (!this.hasPermission('manifest:write')) {
      throw new Error('Keine Berechtigung zum Melden von Problemen');
    }

    try {
      const manifest = await this.getCurrentManifest();
      const newIssue = {
        id: `issue_${Date.now()}`,
        ...issue,
        reportedBy: this.currentUser.email,
        reportedAt: new Date().toISOString(),
        status: 'open'
      };

      const updatedContext = {
        ...manifest.context_json,
        criticalIssues: [
          ...(manifest.context_json.criticalIssues || []),
          newIssue
        ],
        lastUpdated: new Date().toISOString()
      };

      const { error } = await supabase
        .from('manifest')
        .update({
          context_json: updatedContext,
          last_updated_by: this.currentUser.id
        })
        .eq('id', manifest.id);

      if (error) {
        throw new Error(`Problem-Meldung fehlgeschlagen: ${error.message}`);
      }

      console.log('🚨 Kritisches Problem gemeldet:', newIssue.id);
      return newIssue;
    } catch (error) {
      console.error('❌ Problem-Meldung-Fehler:', error);
      throw error;
    }
  }

  // Vault-Datei registrieren
  async registerVaultFile(fileName, category = 'data', metadata = {}) {
    if (!this.hasPermission('vault:access')) {
      throw new Error('Keine Berechtigung für Vault-Zugriff');
    }

    try {
      const manifest = await this.getCurrentManifest();
      const vaultEntry = {
        fileName,
        category,
        registeredBy: this.currentUser.email,
        registeredAt: new Date().toISOString(),
        metadata
      };

      const updatedContext = {
        ...manifest.context_json,
        vaultFiles: [
          ...(manifest.context_json.vaultFiles || []),
          vaultEntry
        ],
        lastUpdated: new Date().toISOString()
      };

      const { error } = await supabase
        .from('manifest')
        .update({
          context_json: updatedContext,
          last_updated_by: this.currentUser.id
        })
        .eq('id', manifest.id);

      if (error) {
        throw new Error(`Vault-Registrierung fehlgeschlagen: ${error.message}`);
      }

      console.log('📁 Vault-Datei registriert:', fileName);
      return vaultEntry;
    } catch (error) {
      console.error('❌ Vault-Registrierung-Fehler:', error);
      throw error;
    }
  }

  // Manus-Orientierung generieren
  async generateManusOrientation() {
    try {
      const manifest = await this.getCurrentManifest();
      const context = manifest.context_json;

      return {
        timestamp: new Date().toISOString(),
        activeObject: context.activeObject,
        buildStatus: context.userContext.buildStatus,
        criticalIssues: context.criticalIssues?.filter(
          issue => issue.status === 'open' && issue.priority === 'high'
        ) || [],
        nextSteps: context.nextModules || [],
        slotStatus: context.userContext.slots || {},
        systemHealth: {
          auth: context.systemState.authSystem,
          database: context.systemState.databaseConnection,
          dataQuality: context.systemState.dummyDataPresent ? 'contaminated' : 'clean'
        },
        userContext: {
          role: this.userRole,
          permissions: this.currentUser?.permissions || [],
          canEdit: this.hasPermission('manifest:write'),
          hasVaultAccess: this.hasPermission('vault:access')
        },
        quickActions: this.getQuickActions()
      };
    } catch (error) {
      console.error('❌ Orientierung-Generierung-Fehler:', error);
      throw error;
    }
  }

  // Schnellaktionen basierend auf Rolle
  getQuickActions() {
    const actions = [];

    if (this.hasPermission('manifest:write')) {
      actions.push('updateSlotStatus', 'reportIssue');
    }

    if (this.hasPermission('vault:access')) {
      actions.push('accessVault', 'registerFile');
    }

    if (this.userRole === 'metaGovernor') {
      actions.push('systemAdmin', 'userManagement', 'fullAccess');
    }

    return actions;
  }
}

