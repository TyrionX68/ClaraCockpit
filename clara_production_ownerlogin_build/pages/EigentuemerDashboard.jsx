import React, { useState, useEffect } from 'react';
import KPIBox from '../components/KPIBox.jsx';
import ObjektListe from '../components/ObjektListe.jsx';

const EigentuemerDashboard = () => {
  const [user, setUser] = useState(null);
  const [objekte, setObjekte] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [selectedObjekt, setSelectedObjekt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const ownerId = sessionStorage.getItem('ownerId');
    const ownerName = sessionStorage.getItem('ownerName');
    
    if (!ownerId) {
      window.location.href = '/login';
      return;
    }

    setUser({ id: ownerId, name: ownerName });
    loadUserData(ownerId);
  }, []);

  const loadUserData = async (ownerId) => {
    try {
      setLoading(true);
      
      // Load objects for this owner
      const objekteResponse = await fetch('/data/objekte.json');
      const allObjekte = await objekteResponse.json();
      const userObjekte = allObjekte.filter(obj => obj.ownerId === ownerId);
      
      // Load dashboard data
      const dashboardResponse = await fetch('/data/dashboard.json');
      const allDashboardData = await dashboardResponse.json();
      
      // Filter dashboard data for user's objects
      const userDashboardData = {};
      userObjekte.forEach(obj => {
        if (allDashboardData[obj.id]) {
          userDashboardData[obj.id] = allDashboardData[obj.id];
          // Add vermietungsgrad to object
          obj.vermietungsgrad = allDashboardData[obj.id].kpis.vermietungsgrad;
        }
      });
      
      setObjekte(userObjekte);
      setDashboardData(userDashboardData);
      
      if (userObjekte.length > 0) {
        setSelectedObjekt(userObjekte[0]);
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Fehler beim Laden der Daten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const calculateTotalKPIs = () => {
    if (objekte.length === 0) return {};
    
    let totalMieteinnahmenMonat = 0;
    let totalMieteinnahmenJahr = 0;
    let totalRueckstaende = 0;
    let totalInstandhaltung = 0;
    let avgRendite = 0;
    let avgVermietungsgrad = 0;
    
    objekte.forEach(obj => {
      const kpis = dashboardData[obj.id]?.kpis;
      if (kpis) {
        totalMieteinnahmenMonat += kpis.mieteinnahmen_monat;
        totalMieteinnahmenJahr += kpis.mieteinnahmen_jahr;
        totalRueckstaende += kpis.rueckstaende;
        totalInstandhaltung += kpis.instandhaltung_jahr;
        avgRendite += kpis.netto_rendite;
        avgVermietungsgrad += kpis.vermietungsgrad;
      }
    });
    
    return {
      mieteinnahmen_monat: totalMieteinnahmenMonat,
      mieteinnahmen_jahr: totalMieteinnahmenJahr,
      rueckstaende: totalRueckstaende,
      instandhaltung_jahr: totalInstandhaltung,
      netto_rendite: avgRendite / objekte.length,
      vermietungsgrad: avgVermietungsgrad / objekte.length
    };
  };

  const getSelectedObjektKPIs = () => {
    if (!selectedObjekt || !dashboardData[selectedObjekt.id]) {
      return {};
    }
    return dashboardData[selectedObjekt.id].kpis;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 mt-2">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Fehler beim Laden</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadUserData(user?.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const totalKPIs = calculateTotalKPIs();
  const selectedKPIs = getSelectedObjektKPIs();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clara360 Eigentümer-Dashboard</h1>
              <p className="text-gray-600">Willkommen, {user?.name}</p>
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
            <KPIBox
              title="Mieteinnahmen/Monat"
              value={totalKPIs.mieteinnahmen_monat}
              unit="€"
              color="green"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
            />
            <KPIBox
              title="Jahreseinnahmen"
              value={totalKPIs.mieteinnahmen_jahr}
              unit="€"
              color="blue"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <KPIBox
              title="Rückstände"
              value={totalKPIs.rueckstaende}
              unit="€"
              color="red"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <KPIBox
              title="Instandhaltung/Jahr"
              value={totalKPIs.instandhaltung_jahr}
              unit="€"
              color="yellow"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <KPIBox
              title="Ø Rendite"
              value={totalKPIs.netto_rendite}
              unit="%"
              color="blue"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
            <KPIBox
              title="Ø Vermietungsgrad"
              value={totalKPIs.vermietungsgrad}
              unit="%"
              color="green"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Object List */}
          <div>
            <ObjektListe
              objekte={objekte}
              onObjektSelect={setSelectedObjekt}
              selectedObjekt={selectedObjekt}
            />
          </div>

          {/* Selected Object Details */}
          <div>
            {selectedObjekt ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedObjekt.name}</h3>
                  <p className="text-sm text-gray-600">{selectedObjekt.adresse}</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <KPIBox
                      title="Mieteinnahmen/Monat"
                      value={selectedKPIs.mieteinnahmen_monat}
                      unit="€"
                      color="green"
                    />
                    <KPIBox
                      title="Rückstände"
                      value={selectedKPIs.rueckstaende}
                      unit="€"
                      color="red"
                    />
                    <KPIBox
                      title="Vermietungsgrad"
                      value={selectedKPIs.vermietungsgrad}
                      unit="%"
                      color="blue"
                    />
                    <KPIBox
                      title="Netto-Rendite"
                      value={selectedKPIs.netto_rendite}
                      unit="%"
                      color="green"
                    />
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Objektdetails</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Typ:</span>
                        <span className="ml-2 font-medium">{selectedObjekt.typ}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Einheiten:</span>
                        <span className="ml-2 font-medium">{selectedObjekt.einheiten}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Baujahr:</span>
                        <span className="ml-2 font-medium">{selectedObjekt.baujahr}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Wohnfläche:</span>
                        <span className="ml-2 font-medium">{selectedObjekt.wohnflaeche} m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Kein Objekt ausgewählt</h3>
                <p className="text-gray-600">Wählen Sie ein Objekt aus der Liste aus, um Details anzuzeigen.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EigentuemerDashboard;

