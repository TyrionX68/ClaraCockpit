import React from 'react';
import DashboardStats from './dashboard/DashboardStats';
import ActivityFeed from './dashboard/ActivityFeed';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Clara360 Dashboard
        </h1>
        <p className="text-muted-foreground">
          Übersicht über Ihre Immobilien, Mieter und Finanzen
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <DashboardStats />
      </div>

      {/* Activity Feed and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed - Takes 2/3 of the space on large screens */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">
              Schnellaktionen
            </h3>
            
            <div className="space-y-3">
              <button className="w-full p-3 text-left rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <div className="font-medium">Neuen Mieter hinzufügen</div>
                <div className="text-sm text-primary-foreground/80">Mietvertrag erstellen</div>
              </button>
              
              <button className="w-full p-3 text-left rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
                <div className="font-medium">Wartung beauftragen</div>
                <div className="text-sm text-secondary-foreground/80">Reparatur anfordern</div>
              </button>
              
              <button className="w-full p-3 text-left rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors">
                <div className="font-medium">Dokument hochladen</div>
                <div className="text-sm text-accent-foreground/80">Neue Datei hinzufügen</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

