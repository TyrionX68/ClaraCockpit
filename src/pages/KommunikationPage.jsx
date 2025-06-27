import React from 'react';
import BottomNavigation from '../components/molecules/BottomNavigation';

const KommunikationPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">💬 Mieter-Kommunikation</h1>
        <p className="text-slate-300 mt-2">Nachrichten und Anfragen der Mieter</p>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">Kommunikations-Center</h2>
          <p className="text-slate-400 mb-4">
            Hier können Sie Nachrichten mit Ihren Mietern austauschen und Anfragen bearbeiten.
          </p>
          <div className="text-sm text-slate-500">
            Feature wird in Kürze verfügbar sein.
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default KommunikationPage;
