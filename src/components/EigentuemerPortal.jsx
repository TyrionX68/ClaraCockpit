import React, { useState, useEffect } from 'react';

const EigentuemerPortal = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedObjekt, setSelectedObjekt] = useState(null);
  const [loginError, setLoginError] = useState('');

  // Demo users data - can be replaced with Supabase later
  const users = [
    { id: "e001", name: "Müller", password: "test123", active: true },
    { id: "e002", name: "Klein", password: "abc456", active: true },
    { id: "e003", name: "Schmidt", password: "demo789", active: true }
  ];

  // Demo objects data - can be synced with Supabase
  const objekte = {
    "e001": [
      { 
        id: "obj001", 
        name: "Waldhofstraße 76", 
        adresse: "68169 Mannheim", 
        typ: "Mehrfamilienhaus", 
        einheiten: 8, 
        baujahr: 1985, 
        wohnflaeche: 420,
        kpis: { mieteinnahmen: 2800, rueckstaende: 800, vermietungsgrad: 95, rendite: 4.5 }
      },
      { 
        id: "obj002", 
        name: "Neckarstraße 12", 
        adresse: "69115 Heidelberg", 
        typ: "Einfamilienhaus", 
        einheiten: 1, 
        baujahr: 1920, 
        wohnflaeche: 120,
        kpis: { mieteinnahmen: 1200, rueckstaende: 0, vermietungsgrad: 100, rendite: 3.8 }
      }
    ],
    "e002": [
      { 
        id: "obj003", 
        name: "Hauptstraße 45", 
        adresse: "69117 Heidelberg", 
        typ: "Mehrfamilienhaus", 
        einheiten: 4, 
        baujahr: 1960, 
        wohnflaeche: 280,
        kpis: { mieteinnahmen: 1850, rueckstaende: 400, vermietungsgrad: 75, rendite: 4.1 }
      }
    ],
    "e003": [
      { 
        id: "obj001", 
        name: "Waldhofstraße 76", 
        adresse: "68169 Mannheim", 
        typ: "Mehrfamilienhaus", 
        einheiten: 8, 
        baujahr: 1985, 
        wohnflaeche: 420,
        kpis: { mieteinnahmen: 2800, rueckstaende: 800, vermietungsgrad: 95, rendite: 4.5 }
      }
    ]
  };

  useEffect(() => {
    // Check for existing session
    const ownerId = sessionStorage.getItem('ownerId');
    const ownerName = sessionStorage.getItem('ownerName');
    const loginTime = sessionStorage.getItem('loginTime');
    
    if (ownerId && ownerName && loginTime) {
      const loginDate = new Date(loginTime);
      const now = new Date();
      const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setCurrentUser({ id: ownerId, name: ownerName });
        setIsLoggedIn(true);
        
        // Set default selected object
        const userObjekte = objekte[ownerId] || [];
        if (userObjekte.length > 0) {
          setSelectedObjekt(userObjekte[0]);
        }
      } else {
        sessionStorage.clear();
      }
    }
  }, []);

  const handleLogin = (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    
    const user = users.find(u => 
      u.name.toLowerCase() === username.toLowerCase() && 
      u.password === password && 
      u.active === true
    );
    
    if (user) {
      sessionStorage.setItem('ownerId', user.id);
      sessionStorage.setItem('ownerName', user.name);
      sessionStorage.setItem('loginTime', new Date().toISOString());
      
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginError('');
      
      // Set default selected object
      const userObjekte = objekte[user.id] || [];
      if (userObjekte.length > 0) {
        setSelectedObjekt(userObjekte[0]);
      }
    } else {
      setLoginError('Ungültige Anmeldedaten');
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedObjekt(null);
    setLoginError('');
  };

  const calculatePortfolioKPIs = (userId) => {
    const userObjekte = objekte[userId] || [];
    const totalMieteinnahmen = userObjekte.reduce((sum, obj) => sum + obj.kpis.mieteinnahmen, 0);
    const totalRueckstaende = userObjekte.reduce((sum, obj) => sum + obj.kpis.rueckstaende, 0);
    const avgRendite = userObjekte.length > 0 
      ? userObjekte.reduce((sum, obj) => sum + obj.kpis.rendite, 0) / userObjekte.length 
      : 0;
    const avgVermietungsgrad = userObjekte.length > 0 
      ? userObjekte.reduce((sum, obj) => sum + obj.kpis.vermietungsgrad, 0) / userObjekte.length 
      : 0;

    return {
      mieteinnahmenMonat: totalMieteinnahmen,
      jahreseinnahmen: totalMieteinnahmen * 12,
      rueckstaende: totalRueckstaende,
      instandhaltung: Math.round(totalMieteinnahmen * 12 * 0.15), // 15% estimate
      avgRendite: avgRendite.toFixed(1),
      avgVermietungsgrad: avgVermietungsgrad.toFixed(1)
    };
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Clara360 Eigentümer-Portal
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Melden Sie sich mit Ihren Zugangsdaten an
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input 
                  name="username" 
                  type="text" 
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Benutzername"
                />
              </div>
              <div>
                <input 
                  name="password" 
                  type="password" 
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Passwort"
                />
              </div>
            </div>

            {loginError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {loginError}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button 
                type="submit" 
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Anmelden
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Demo-Zugänge: Müller/test123, Klein/abc456, Schmidt/demo789
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const userObjekte = objekte[currentUser.id] || [];
  const portfolioKPIs = calculatePortfolioKPIs(currentUser.id);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clara360 Eigentümer-Dashboard</h1>
              <p className="text-gray-600">Willkommen, {currentUser.name}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio-Übersicht</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <div className="p-6 rounded-lg border-2 bg-green-50 border-green-200 text-green-800 hover:shadow-lg transition-shadow">
              <p className="text-sm font-medium text-gray-600 mb-1">Mieteinnahmen/Monat</p>
              <p className="text-2xl font-bold text-gray-900">€ {portfolioKPIs.mieteinnahmenMonat.toLocaleString()}</p>
            </div>
            <div className="p-6 rounded-lg border-2 bg-blue-50 border-blue-200 text-blue-800 hover:shadow-lg transition-shadow">
              <p className="text-sm font-medium text-gray-600 mb-1">Jahreseinnahmen</p>
              <p className="text-2xl font-bold text-gray-900">€ {portfolioKPIs.jahreseinnahmen.toLocaleString()}</p>
            </div>
            <div className="p-6 rounded-lg border-2 bg-red-50 border-red-200 text-red-800 hover:shadow-lg transition-shadow">
              <p className="text-sm font-medium text-gray-600 mb-1">Rückstände</p>
              <p className="text-2xl font-bold text-gray-900">€ {portfolioKPIs.rueckstaende.toLocaleString()}</p>
            </div>
            <div className="p-6 rounded-lg border-2 bg-yellow-50 border-yellow-200 text-yellow-800 hover:shadow-lg transition-shadow">
              <p className="text-sm font-medium text-gray-600 mb-1">Instandhaltung/Jahr</p>
              <p className="text-2xl font-bold text-gray-900">€ {portfolioKPIs.instandhaltung.toLocaleString()}</p>
            </div>
            <div className="p-6 rounded-lg border-2 bg-blue-50 border-blue-200 text-blue-800 hover:shadow-lg transition-shadow">
              <p className="text-sm font-medium text-gray-600 mb-1">Ø Rendite</p>
              <p className="text-2xl font-bold text-gray-900">{portfolioKPIs.avgRendite}%</p>
            </div>
            <div className="p-6 rounded-lg border-2 bg-green-50 border-green-200 text-green-800 hover:shadow-lg transition-shadow">
              <p className="text-sm font-medium text-gray-600 mb-1">Ø Vermietungsgrad</p>
              <p className="text-2xl font-bold text-gray-900">{portfolioKPIs.avgVermietungsgrad}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Object List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Ihre Objekte</h3>
              <p className="text-sm text-gray-600">{userObjekte.length} Immobilie(n) in Verwaltung</p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {userObjekte.map((objekt) => (
                <div 
                  key={objekt.id}
                  className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedObjekt?.id === objekt.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedObjekt(objekt)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-gray-900">{objekt.name}</h4>
                      <p className="text-sm text-gray-600">{objekt.adresse}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{objekt.einheiten} Einheit{objekt.einheiten > 1 ? 'en' : ''}</span>
                        <span>Baujahr {objekt.baujahr}</span>
                        <span>{objekt.wohnflaeche} m²</span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        objekt.kpis.vermietungsgrad >= 95 
                          ? 'bg-green-100 text-green-600' 
                          : objekt.kpis.vermietungsgrad >= 80 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {objekt.kpis.vermietungsgrad}% vermietet
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Object Details */}
          {selectedObjekt && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{selectedObjekt.name}</h3>
                <p className="text-sm text-gray-600">{selectedObjekt.adresse}</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border-2 bg-green-50 border-green-200 hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-gray-600 mb-1">Mieteinnahmen/Monat</p>
                    <p className="text-xl font-bold text-gray-900">€ {selectedObjekt.kpis.mieteinnahmen.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg border-2 bg-red-50 border-red-200 hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-gray-600 mb-1">Rückstände</p>
                    <p className="text-xl font-bold text-gray-900">€ {selectedObjekt.kpis.rueckstaende.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200 hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-gray-600 mb-1">Vermietungsgrad</p>
                    <p className="text-xl font-bold text-gray-900">{selectedObjekt.kpis.vermietungsgrad}%</p>
                  </div>
                  <div className="p-4 rounded-lg border-2 bg-green-50 border-green-200 hover:shadow-lg transition-shadow">
                    <p className="text-sm font-medium text-gray-600 mb-1">Netto-Rendite</p>
                    <p className="text-xl font-bold text-gray-900">{selectedObjekt.kpis.rendite}%</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Objektdetails</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">Typ:</span> <span className="ml-2 font-medium">{selectedObjekt.typ}</span></div>
                    <div><span className="text-gray-600">Einheiten:</span> <span className="ml-2 font-medium">{selectedObjekt.einheiten}</span></div>
                    <div><span className="text-gray-600">Baujahr:</span> <span className="ml-2 font-medium">{selectedObjekt.baujahr}</span></div>
                    <div><span className="text-gray-600">Wohnfläche:</span> <span className="ml-2 font-medium">{selectedObjekt.wohnflaeche} m²</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EigentuemerPortal;

