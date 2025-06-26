import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ClaraThemeProvider } from './context/ClaraThemeContext'
import ClaraFusionDashboard from './components/ClaraFusionDashboard'
import EigentuemerPage from './components/EigentuemerPage'
import ObjektePage from './components/ObjektePage'
import RueckstaendePage from './components/RueckstaendePage'
import ZahlungenPage from './components/ZahlungenPage'
import BankingPage from './components/BankingPage'
import MieterKommunikationPage from './components/MieterKommunikationPage'
import ClaraKIPanel from './components/ClaraKIPanel'
import OutlookPage from './components/OutlookPage'
import EinstellungenPage from './components/EinstellungenPage'
import ManifestViewer from './components/ManifestViewer'
import TransactionAnalyticsPage from './components/TransactionAnalyticsPage'
import { PropertyProvider } from './hooks/usePropertyContext'
import './App.css'

function App() {
  // Feature Flag für UI-Anker-Integration
  const useAnchorUI = import.meta.env.VITE_USE_ANCHOR_UI === 'true' || true;

  // Simulate MetaGovernor authentication for demo
  const authenticateMetaGovernor = () => {
    localStorage.setItem('clara_user_email', 'hiss@clara360.de');
    localStorage.setItem('clara_session_token', 'mg_session_' + Date.now());
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem('clara_user_email');
    localStorage.removeItem('clara_session_token');
    window.location.reload();
  };

  const isAuthenticated = localStorage.getItem('clara_user_email') === 'hiss@clara360.de';

  // Wenn UI-Anker aktiviert ist, zeige das vollständige Fusion-System
  if (useAnchorUI) {
    return (
      <ClaraThemeProvider>
        <PropertyProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<ClaraFusionDashboard />} />
              <Route path="/eigentuemer" element={<EigentuemerPage />} />
              <Route path="/objekte" element={<ObjektePage />} />
              <Route path="/rueckstaende" element={<RueckstaendePage />} />
              <Route path="/zahlungen" element={<ZahlungenPage />} />
              <Route path="/banking" element={<BankingPage />} />
              <Route path="/mieter-kommunikation" element={<MieterKommunikationPage />} />
              <Route path="/clara-ki" element={<ClaraKIPanel />} />
              <Route path="/outlook" element={<OutlookPage />} />
              <Route path="/einstellungen" element={<EinstellungenPage />} />
              <Route path="/manifest" element={<ManifestViewer />} />
            <Route path="/analytics" element={<TransactionAnalyticsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </PropertyProvider>
    </ClaraThemeProvider>
    );
  }

  // Fallback: Klassisches GitHub-Cockpit
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Clara Cockpit Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Clara Cockpit</h1>
                <p className="text-blue-400 text-sm">v2.3 - MetaGovernor Integration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-900/50 rounded-full border border-green-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">MetaGovernor</span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={authenticateMetaGovernor}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  MetaGovernor Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {isAuthenticated ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Willkommen im Clara Cockpit
              </h2>
              <p className="text-blue-200 text-lg">
                MetaGovernor-Zugang aktiv - Vollständige Systemkontrolle verfügbar
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-3">Manifest Viewer</h3>
                <p className="text-gray-300 mb-4">
                  Zentrale Kontrolle über das Clara360-System
                </p>
                <ManifestViewer />
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-3">System Status</h3>
                <p className="text-gray-300 mb-4">
                  Überwachung aller Systemkomponenten
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">React Version:</span>
                    <span className="text-green-400">19.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vite Version:</span>
                    <span className="text-green-400">6.3.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">UI Framework:</span>
                    <span className="text-green-400">shadcn/ui</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-3">Quick Actions</h3>
                <p className="text-gray-300 mb-4">
                  Häufig verwendete Funktionen
                </p>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Banking Integration
                  </button>
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Clara KI Panel
                  </button>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Transaction Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Clara Cockpit - MetaGovernor Zugang
            </h2>
            <p className="text-blue-200 text-lg mb-8">
              Bitte authentifizieren Sie sich für den Zugang zum System
            </p>
            <button
              onClick={authenticateMetaGovernor}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              MetaGovernor Login
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

