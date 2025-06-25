import { useState, useEffect } from 'react'
import ManifestViewer from './components/ManifestViewer'
import EigentuemerPortal from './components/EigentuemerPortal'
import ClaraGreeting from './components/ClaraGreeting'
import EigentuemerLogin_SBX from './components/EigentuemerLogin_SBX'
import ObjektePage from "./pages/ObjektePage"
import './App.css'

function App() {
  console.log("🏠 ===> App.jsx geladen!");
  const [currentRoute, setCurrentRoute] = useState('dashboard')
  console.log("🗺️ ===> Aktuelle Route:", currentRoute);
  const [count, setCount] = useState(0)

  // Handle URL routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'dashboard'
      setCurrentRoute(hash)
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange() // Initial route

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

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

  // Owner Portal Route
            {/* TyrionX Debug: Supabase Login Button */}
            <button
              onClick={() => {
                console.log("🔗 ===> Direkter Supabase Login Button geklickt!");
                setCurrentRoute("supabase-login");
              }}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              style={{ marginTop: "10px" }}
            >
              🧪 SUPABASE TEST LOGIN
            </button>
  // Supabase Login Route
            <button
              onClick={() => {
                console.log("🔗 ===> Direkter Supabase Login Button geklickt!");
                setCurrentRoute("supabase-login");
              }}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
              style={{ marginTop: "10px" }}
            >
              🧪 SUPABASE TEST LOGIN
            </button>
  console.log("🔍 ===> Prüfe Route für supabase-login...");
  // TyrionX Phase 2: /sbx Route für direkten Test
  if (currentRoute === "sbx") {
    console.log("🧪 ===> /sbx Route aktiviert - EigentuemerLogin_SBX wird gerendert!");
    return <EigentuemerLogin_SBX />;
  }

  if (currentRoute === 'supabase-login') {
    return <EigentuemerLogin_SBX />;
    console.log("✅ ===> EigentuemerLogin_SBX wird gerendert!");
  }

  if (currentRoute === "objekte") {
    return <ObjektePage />
  }
  if (currentRoute === 'eigentuemer-portal') {
    return <EigentuemerPortal />
  }

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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  MetaGovernor Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/30 backdrop-blur-sm border-b border-gray-700">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => {
                setCurrentRoute('dashboard')
                window.location.hash = 'dashboard'
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                currentRoute === 'dashboard'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}
            >
              Admin Dashboard
            </button>
            <button
              onClick={() => {
                setCurrentRoute('eigentuemer-portal')
                window.location.hash = 'eigentuemer-portal'
              }}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                currentRoute === 'eigentuemer-portal'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}
            >
              Eigentümer Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {currentRoute === 'dashboard' && (
          <div className="space-y-8">
            {/* Clara Greeting */}
            <ClaraGreeting />
            
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-white">
                Willkommen bei Clara360
              </h2>
              <p className="text-xl text-blue-300 max-w-2xl mx-auto">
                Ihre intelligente Plattform für Immobilienverwaltung und Finanzmanagement
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Eigentümer Portal Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Eigentümer Portal</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Zugang für Eigentümer zu ihren Objekten, KPIs und Portfolio-Übersicht
                </p>
                <button
                  onClick={() => {
                    setCurrentRoute('eigentuemer-portal')
                    window.location.hash = 'eigentuemer-portal'
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Portal öffnen
                </button>
              </div>

              {/* FinAPI Integration Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">FinAPI Integration</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Echte Banking-Integration für automatisierte Finanzanalyse
                </p>
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Produktiv verfügbar</span>
                </div>
              </div>

              {/* System Manifest Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">System Manifest</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Systemstatus und Konfigurationsübersicht
                </p>
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>ClaraSuite v4.2.1</span>
                </div>
              </div>
            </div>

            {/* Authentication Status */}
            {!isAuthenticated && (
              <div className="bg-yellow-900/50 border border-yellow-600 rounded-xl p-6 text-center">
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">
                  MetaGovernor Authentifizierung erforderlich
                </h3>
                <p className="text-yellow-300 mb-4">
                  Für den Zugriff auf erweiterte Funktionen ist eine MetaGovernor-Authentifizierung erforderlich.
                </p>
                <button
                  onClick={authenticateMetaGovernor}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Jetzt authentifizieren
                </button>
              </div>
            )}

            {/* Manifest Viewer */}
            {isAuthenticated && (
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-gray-700">
                <ManifestViewer />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2025 Clara360. Powered by MetaGovernor AI.</p>
            <p className="text-sm mt-2">
              Stable Fallback: <a href="https://oqiizvhn.manus.space/" className="text-blue-400 hover:text-blue-300">https://oqiizvhn.manus.space/</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App

