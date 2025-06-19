// SystemSyncStatus.vue - Real-time Data Source Monitoring Component
// MetaGovernor Dashboard Integration Module

<template>
  <div class="system-sync-status" :class="{ 'expanded': isExpanded }">
    <!-- Compact Status Indicator -->
    <div class="status-indicator" @click="toggleExpanded">
      <div class="status-dot" :class="overallStatus"></div>
      <span class="status-text">{{ getStatusText() }}</span>
      <svg class="expand-icon" :class="{ 'rotated': isExpanded }" width="16" height="16" viewBox="0 0 16 16">
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none"/>
      </svg>
    </div>

    <!-- Expanded Status Panel -->
    <div class="status-panel" v-show="isExpanded">
      <div class="panel-header">
        <h3>System Synchronisation Status</h3>
        <div class="last-update">
          Letzte Aktualisierung: {{ formatTime(lastUpdate) }}
        </div>
      </div>

      <div class="data-sources">
        <!-- FinAPI Banking -->
        <div class="data-source" :class="getSourceStatus('finapi')">
          <div class="source-icon">🏦</div>
          <div class="source-info">
            <div class="source-name">FinAPI Banking</div>
            <div class="source-status">{{ getSourceStatusText('finapi') }}</div>
            <div class="source-details">{{ finapiDetails }}</div>
          </div>
          <div class="source-indicator" :class="getSourceStatus('finapi')"></div>
        </div>

        <!-- Supabase Database -->
        <div class="data-source" :class="getSourceStatus('supabase')">
          <div class="source-icon">🗄️</div>
          <div class="source-info">
            <div class="source-name">Supabase Database</div>
            <div class="source-status">{{ getSourceStatusText('supabase') }}</div>
            <div class="source-details">{{ supabaseDetails }}</div>
          </div>
          <div class="source-indicator" :class="getSourceStatus('supabase')"></div>
        </div>

        <!-- Voice KI Module -->
        <div class="data-source" :class="getSourceStatus('voice')">
          <div class="source-icon">🎤</div>
          <div class="source-info">
            <div class="source-name">Voice KI Module</div>
            <div class="source-status">{{ getSourceStatusText('voice') }}</div>
            <div class="source-details">{{ voiceDetails }}</div>
          </div>
          <div class="source-indicator" :class="getSourceStatus('voice')"></div>
        </div>

        <!-- Business KPI Engine -->
        <div class="data-source" :class="getSourceStatus('business')">
          <div class="source-icon">📊</div>
          <div class="source-info">
            <div class="source-name">Business KPI Engine</div>
            <div class="source-status">{{ getSourceStatusText('business') }}</div>
            <div class="source-details">{{ businessDetails }}</div>
          </div>
          <div class="source-indicator" :class="getSourceStatus('business')"></div>
        </div>
      </div>

      <!-- System Actions -->
      <div class="system-actions">
        <button @click="refreshAllSources" class="action-button primary">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 2v4l3-3-3-3zm0 12v-4l-3 3 3 3z" fill="currentColor"/>
          </svg>
          Alle Quellen aktualisieren
        </button>
        
        <button @click="toggleAutoRefresh" class="action-button" :class="{ 'active': autoRefresh }">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M8 4v4l2 2" stroke="currentColor" stroke-width="2"/>
          </svg>
          Auto-Refresh {{ autoRefresh ? 'AN' : 'AUS' }}
        </button>
      </div>

      <!-- MetaGovernor Controls (Admin Only) -->
      <div class="metagovernor-controls" v-if="isMetaGovernor">
        <div class="controls-header">MetaGovernor Controls</div>
        
        <div class="control-group">
          <label>Fallback-Modus:</label>
          <select v-model="fallbackMode" @change="updateFallbackMode">
            <option value="smart">Smart-Merge (Empfohlen)</option>
            <option value="live-only">Nur Live-Daten</option>
            <option value="fallback-only">Nur Fallback-Daten</option>
          </select>
        </div>

        <div class="control-group">
          <label>Debug-Modus:</label>
          <input type="checkbox" v-model="debugMode" @change="toggleDebugMode">
        </div>

        <div class="control-group">
          <button @click="exportSystemStatus" class="action-button secondary">
            System-Status exportieren
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemSyncStatus',
  data() {
    return {
      isExpanded: false,
      lastUpdate: new Date(),
      autoRefresh: true,
      debugMode: false,
      fallbackMode: 'smart',
      
      // Data source statuses
      sources: {
        finapi: {
          status: 'unknown', // 'live', 'fallback', 'error', 'unknown'
          lastCheck: null,
          details: 'Initialisierung...'
        },
        supabase: {
          status: 'error',
          lastCheck: null,
          details: 'Invalid API key'
        },
        voice: {
          status: 'planned',
          lastCheck: null,
          details: 'Modul in Planung'
        },
        business: {
          status: 'planned',
          lastCheck: null,
          details: 'KPI-Engine in Entwicklung'
        }
      },
      
      refreshInterval: null
    };
  },
  
  computed: {
    isMetaGovernor() {
      // Check if current user is MetaGovernor
      return this.$store?.state?.user?.role === 'metagovernor' || 
             window.location.search.includes('metagovernor=true');
    },
    
    overallStatus() {
      const statuses = Object.values(this.sources).map(s => s.status);
      
      if (statuses.includes('error')) return 'error';
      if (statuses.includes('fallback')) return 'warning';
      if (statuses.every(s => s === 'live')) return 'success';
      return 'mixed';
    },
    
    finapiDetails() {
      return this.sources.finapi.details;
    },
    
    supabaseDetails() {
      return this.sources.supabase.details;
    },
    
    voiceDetails() {
      return this.sources.voice.details;
    },
    
    businessDetails() {
      return this.sources.business.details;
    }
  },
  
  mounted() {
    this.initializeSystemMonitoring();
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  },
  
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  
  methods: {
    async initializeSystemMonitoring() {
      console.log('🔍 Initializing SystemSyncStatus monitoring...');
      
      // Check FinAPI status
      await this.checkFinAPIStatus();
      
      // Check Supabase status
      await this.checkSupabaseStatus();
      
      // Check Voice KI status
      await this.checkVoiceStatus();
      
      // Check Business KPI status
      await this.checkBusinessKPIStatus();
      
      this.lastUpdate = new Date();
    },
    
    async checkFinAPIStatus() {
      try {
        // Check if banking integration is available
        if (window.bankingIntegration) {
          const testResult = await window.bankingIntegration.testConnection();
          
          if (testResult.success) {
            this.sources.finapi.status = 'live';
            this.sources.finapi.details = `Live-Verbindung aktiv (v${window.bankingIntegration.version})`;
          } else {
            this.sources.finapi.status = 'fallback';
            this.sources.finapi.details = 'Fallback-Modus aktiv';
          }
        } else {
          this.sources.finapi.status = 'error';
          this.sources.finapi.details = 'Banking-Integration nicht geladen';
        }
        
        this.sources.finapi.lastCheck = new Date();
        
      } catch (error) {
        this.sources.finapi.status = 'error';
        this.sources.finapi.details = `Fehler: ${error.message}`;
      }
    },
    
    async checkSupabaseStatus() {
      try {
        // Check Supabase connection (if available)
        if (window.supabase) {
          const { data, error } = await window.supabase.from('test').select('*').limit(1);
          
          if (error) {
            this.sources.supabase.status = 'error';
            this.sources.supabase.details = error.message;
          } else {
            this.sources.supabase.status = 'live';
            this.sources.supabase.details = 'Verbindung aktiv';
          }
        } else {
          this.sources.supabase.status = 'error';
          this.sources.supabase.details = 'Supabase Client nicht verfügbar';
        }
        
        this.sources.supabase.lastCheck = new Date();
        
      } catch (error) {
        this.sources.supabase.status = 'error';
        this.sources.supabase.details = `Verbindungsfehler: ${error.message}`;
      }
    },
    
    async checkVoiceStatus() {
      // Check if Voice KI module is available
      if (window.voiceController || window.speechRecognition) {
        this.sources.voice.status = 'live';
        this.sources.voice.details = 'Voice-Controller aktiv';
      } else {
        this.sources.voice.status = 'planned';
        this.sources.voice.details = 'Modul in Planung';
      }
      
      this.sources.voice.lastCheck = new Date();
    },
    
    async checkBusinessKPIStatus() {
      // Check if Business KPI engine is available
      if (window.clara360SmartMergeKPI) {
        const status = window.clara360SmartMergeKPI.getStatus();
        
        this.sources.business.status = status.isLiveDataAvailable ? 'live' : 'fallback';
        this.sources.business.details = `Smart-Merge aktiv (${status.dataSource})`;
      } else {
        this.sources.business.status = 'planned';
        this.sources.business.details = 'KPI-Engine in Entwicklung';
      }
      
      this.sources.business.lastCheck = new Date();
    },
    
    toggleExpanded() {
      this.isExpanded = !this.isExpanded;
    },
    
    getStatusText() {
      switch (this.overallStatus) {
        case 'success': return 'Alle Systeme online';
        case 'warning': return 'Teilweise Fallback';
        case 'error': return 'Systemfehler erkannt';
        case 'mixed': return 'Gemischter Status';
        default: return 'Status unbekannt';
      }
    },
    
    getSourceStatus(sourceKey) {
      return this.sources[sourceKey].status;
    },
    
    getSourceStatusText(sourceKey) {
      const status = this.sources[sourceKey].status;
      
      switch (status) {
        case 'live': return 'Live-Daten';
        case 'fallback': return 'Fallback-Daten';
        case 'error': return 'Fehler';
        case 'planned': return 'Geplant';
        default: return 'Unbekannt';
      }
    },
    
    async refreshAllSources() {
      console.log('🔄 Refreshing all data sources...');
      await this.initializeSystemMonitoring();
    },
    
    toggleAutoRefresh() {
      this.autoRefresh = !this.autoRefresh;
      
      if (this.autoRefresh) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },
    
    startAutoRefresh() {
      this.refreshInterval = setInterval(() => {
        this.initializeSystemMonitoring();
      }, 30000); // Every 30 seconds
    },
    
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    },
    
    updateFallbackMode() {
      console.log('🔧 Fallback mode changed to:', this.fallbackMode);
      
      // Update Smart-Merge KPI system if available
      if (window.clara360SmartMergeKPI) {
        // Implementation depends on Smart-Merge system capabilities
      }
    },
    
    toggleDebugMode() {
      console.log('🐛 Debug mode:', this.debugMode ? 'enabled' : 'disabled');
      
      if (this.debugMode) {
        // Enable debug logging
        window.clara360Debug = true;
      } else {
        window.clara360Debug = false;
      }
    },
    
    exportSystemStatus() {
      const statusReport = {
        timestamp: new Date().toISOString(),
        overallStatus: this.overallStatus,
        sources: this.sources,
        settings: {
          autoRefresh: this.autoRefresh,
          fallbackMode: this.fallbackMode,
          debugMode: this.debugMode
        }
      };
      
      const blob = new Blob([JSON.stringify(statusReport, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clara360-system-status-${Date.now()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    },
    
    formatTime(date) {
      return new Intl.DateTimeFormat('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    }
  }
};
</script>

<style scoped>
.system-sync-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  font-family: system-ui, sans-serif;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.status-indicator:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.status-dot.success { background: #10b981; }
.status-dot.warning { background: #f59e0b; }
.status-dot.error { background: #ef4444; }
.status-dot.mixed { background: #6366f1; }

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.expand-icon {
  transition: transform 0.2s ease;
  color: #6b7280;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.status-panel {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  width: 400px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.panel-header h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.last-update {
  font-size: 11px;
  color: #6b7280;
}

.data-sources {
  padding: 12px;
}

.data-source {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.data-source:last-child {
  margin-bottom: 0;
}

.data-source.live { background: #f0fdf4; border: 1px solid #bbf7d0; }
.data-source.fallback { background: #fffbeb; border: 1px solid #fed7aa; }
.data-source.error { background: #fef2f2; border: 1px solid #fecaca; }
.data-source.planned { background: #f8fafc; border: 1px solid #e2e8f0; }

.source-icon {
  font-size: 16px;
}

.source-info {
  flex: 1;
}

.source-name {
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 2px;
}

.source-status {
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 2px;
}

.source-details {
  font-size: 10px;
  color: #6b7280;
}

.source-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.source-indicator.live { background: #10b981; }
.source-indicator.fallback { background: #f59e0b; }
.source-indicator.error { background: #ef4444; }
.source-indicator.planned { background: #94a3b8; }

.system-actions {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background: #f9fafb;
}

.action-button.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-button.primary:hover {
  background: #2563eb;
}

.action-button.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.metagovernor-controls {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.controls-header {
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.control-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 11px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group label {
  color: #6b7280;
}

.control-group select,
.control-group input {
  font-size: 11px;
}

.action-button.secondary {
  background: #6b7280;
  color: white;
  border-color: #6b7280;
  width: 100%;
  justify-content: center;
}

.action-button.secondary:hover {
  background: #4b5563;
}
</style>

