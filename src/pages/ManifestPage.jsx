import React from 'react';
import BottomNavigation from '../components/molecules/BottomNavigation';

const ManifestPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">Clara360 Manifest</h1>
        <p className="text-slate-300 mt-2">System-Informationen und Konfiguration</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* System Info */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            ⚙️ System-Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/50 p-4 rounded">
              <div className="text-sm text-slate-400">Version</div>
              <div className="text-lg font-mono">Clara360 v3.1</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded">
              <div className="text-sm text-slate-400">Framework</div>
              <div className="text-lg font-mono">React 18 + Router v6</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded">
              <div className="text-sm text-slate-400">Deployment</div>
              <div className="text-lg font-mono">Vercel Auto-Deploy</div>
            </div>
            <div className="bg-slate-700/50 p-4 rounded">
              <div className="text-sm text-slate-400">Status</div>
              <div className="text-lg font-mono text-green-400">✅ Online</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            🚀 Aktivierte Features
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
              <span>Banking Integration</span>
              <span className="text-green-400">✅ Aktiv</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
              <span>Clara KI Assistant</span>
              <span className="text-green-400">✅ Aktiv</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
              <span>Kommunikation</span>
              <span className="text-green-400">✅ Aktiv</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded">
              <span>React Router Navigation</span>
              <span className="text-green-400">✅ Aktiv</span>
            </div>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            🔗 API Endpoints
          </h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="p-2 bg-slate-700/50 rounded">
              <span className="text-blue-400">GET</span> /api/banking/accounts
            </div>
            <div className="p-2 bg-slate-700/50 rounded">
              <span className="text-green-400">POST</span> /api/clara/chat
            </div>
            <div className="p-2 bg-slate-700/50 rounded">
              <span className="text-blue-400">GET</span> /api/manifest
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default ManifestPage;
