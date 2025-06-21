import { useState } from 'react'
import ManifestViewer from './components/ManifestViewer'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  MetaGovernor Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              🏘️ Waldhofstraße Hausverwaltung
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              KI-gestützte Immobilienverwaltung mit Banking-Integration
            </p>
            
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="text-green-400 text-2xl mb-2">✅</div>
                <h3 className="text-white font-semibold mb-2">System Status</h3>
                <p className="text-gray-400">LIVE_READY</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="text-blue-400 text-2xl mb-2">🏦</div>
                <h3 className="text-white font-semibold mb-2">Banking</h3>
                <p className="text-gray-400">FinAPI Connected</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <div className="text-purple-400 text-2xl mb-2">🤖</div>
                <h3 className="text-white font-semibold mb-2">KI-Engine</h3>
                <p className="text-gray-400">Clara Fusion Active</p>
              </div>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* KPI Dashboard */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                📊 KPI Dashboard
                <span className="text-sm bg-blue-900/50 text-blue-400 px-2 py-1 rounded-full">6 Module</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Rentflow Analytics</span>
                  <span className="text-green-400">🟩 Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Account Balance</span>
                  <span className="text-green-400">🟩 Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Payment Timing</span>
                  <span className="text-green-400">🟩 Active</span>
                </div>
              </div>
            </div>

            {/* System Architecture */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                🏗️ Architecture
                <span className="text-sm bg-green-900/50 text-green-400 px-2 py-1 rounded-full">React 18</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Frontend</span>
                  <span className="text-blue-400">React + Vite</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">UI Library</span>
                  <span className="text-blue-400">shadcn/ui</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <span className="text-gray-300">Development</span>
                  <span className="text-purple-400">GitHub Copilot</span>
                </div>
              </div>
            </div>
          </div>

          {/* Authentication Notice */}
          {!isAuthenticated && (
            <div className="mt-12 p-6 bg-yellow-900/20 border border-yellow-600 rounded-xl">
              <div className="flex items-center gap-3 text-yellow-400">
                <div className="text-2xl">🔐</div>
                <div>
                  <h4 className="font-semibold">MetaGovernor-Zugang erforderlich</h4>
                  <p className="text-sm text-yellow-300">
                    Melden Sie sich als MetaGovernor an, um das Manus-Manifest zu verwalten.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ManifestViewer Component */}
      <ManifestViewer />

      {/* Footer */}
      <footer className="bg-gray-800/30 backdrop-blur-sm border-t border-gray-700 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">Clara Cockpit v2.3 - Entwickelt mit ❤️ und 🤖 GitHub Copilot</p>
            <p className="text-sm">für die Waldhofstraße Hausverwaltung</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

