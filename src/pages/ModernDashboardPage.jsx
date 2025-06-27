import React from 'react';
import ModernKpiCard from '../components/molecules/ModernKpiCard';
import BottomNavigation from '../components/molecules/BottomNavigation';

const ModernDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">Clara360 Dashboard</h1>
        <p className="text-slate-400">Hausverwaltung Waldhofstraße 76 - Live-Modus</p>
      </div>

      {/* Supabase Status */}
      <div className="mx-6 mb-6 glass-card border-l-4 border-orange-500">
        <div className="flex items-center gap-3">
          <span className="text-orange-500 text-xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-orange-400">Supabase Status</h3>
            <p className="text-slate-400">Verbindungsfehler: Invalid API key</p>
            <p className="text-sm text-slate-500">Letzter Test: 22.6.2025, 19:51:22</p>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 mb-6">
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
          color="orange"
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
      <div className="mx-6 mb-6 glass-card border-l-4 border-red-500">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-red-500 text-xl">⚠️</span>
          <h3 className="font-semibold text-red-400">Aktuelle Rückstände</h3>
        </div>
        <div className="space-y-3">
          <div>
            <p className="font-medium">Familie Schmidt</p>
            <p className="text-sm text-slate-400">1. OG rechts - 2 Monate</p>
            <p className="text-xl font-bold text-red-400">1.200€</p>
          </div>
        </div>
      </div>

      {/* Finanzübersicht */}
      <div className="mx-6 mb-20 glass-card">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-blue-500 text-xl">📊</span>
          <h3 className="font-semibold">Finanzübersicht</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Mieteinnahmen (Monat)</span>
            <span className="text-green-400 font-semibold">+8.360€</span>
          </div>
          <div className="flex justify-between">
            <span>Betriebskosten</span>
            <span className="text-red-400 font-semibold">-1.200€</span>
          </div>
          <hr className="border-slate-600" />
          <div className="flex justify-between font-bold">
            <span>Netto-Cashflow</span>
            <span className="text-green-400">+7.160€</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default ModernDashboardPage;
