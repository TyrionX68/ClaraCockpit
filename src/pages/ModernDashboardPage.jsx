import React, { useState } from 'react';
import ModernKpiCard from '../components/molecules/ModernKpiCard';
import BottomNavigation from '../components/molecules/BottomNavigation';

const ModernDashboardPage = () => {
  const [activeNav, setActiveNav] = useState('dashboard');

  return (
    <div style={{ 
      background: 'var(--bg-primary)', 
      minHeight: '100vh',
      color: 'var(--text-primary)',
      padding: '1rem',
      paddingBottom: '6rem'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700',
          marginBottom: '0.5rem'
        }}>
          Clara360 Dashboard
        </h1>
        <p style={{ 
          color: 'var(--text-secondary)',
          fontSize: '0.875rem'
        }}>
          Hausverwaltung Waldhofstraße 76 - Live-Modus
        </p>
      </div>

      {/* Supabase Status */}
      <div className="glass-card" style={{ 
        marginBottom: '2rem',
        borderLeft: '4px solid var(--accent-orange)'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⚠️ Supabase Status
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Verbindungsfehler: Invalid API key
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Letzter Test: 22.6.2025, 19:51:22
        </p>
      </div>

      {/* KPI Grid - Exakt wie Screenshots */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <ModernKpiCard
          icon="🏢"
          value="1"
          label="Objekte verwaltet"
          subtext="Waldhofstraße 76"
          color="blue"
        />
        
        <ModernKpiCard
          icon="👥"
          value="14"
          label="Mieter gesamt"
          subtext="100% Vermietungsgrad"
          color="green"
          trend="up"
        />
        
        <ModernKpiCard
          icon="💰"
          value="8.360€"
          label="Monatliche Miete"
          subtext="Gesamteinnahmen"
          color="green"
          trend="up"
        />
        
        <ModernKpiCard
          icon="📈"
          value="8.4%"
          label="Jahresrendite"
          subtext="Über Marktdurchschnitt"
          color="purple"
          trend="up"
        />
      </div>

      {/* Rückstände */}
      <div className="glass-card" style={{ 
        marginBottom: '2rem',
        borderLeft: '4px solid var(--accent-red)'
      }}>
        <h3 style={{ 
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⚠️ Aktuelle Rückstände
        </h3>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Familie Schmidt</strong>
        </div>
        <div style={{ 
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          marginBottom: '0.5rem'
        }}>
          1. OG rechts - 2 Monate
        </div>
        <div style={{ 
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--accent-red)'
        }}>
          1.200€
        </div>
      </div>

      {/* Finanzübersicht */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📊 Finanzübersicht
        </h3>
        
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--glass-border)'
        }}>
          <span>Mieteinnahmen (Monat)</span>
          <span style={{ 
            color: 'var(--accent-green)',
            fontWeight: '600'
          }}>
            +8.360€
          </span>
        </div>
        
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--glass-border)'
        }}>
          <span>Betriebskosten</span>
          <span style={{ 
            color: 'var(--accent-red)',
            fontWeight: '600'
          }}>
            -1.200€
          </span>
        </div>
        
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '1.125rem',
          fontWeight: '700'
        }}>
          <span>Netto-Cashflow</span>
          <span style={{ color: 'var(--accent-green)' }}>
            +7.160€
          </span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeItem={activeNav}
        onItemClick={setActiveNav}
      />
    </div>
  );
};

export default ModernDashboardPage;
