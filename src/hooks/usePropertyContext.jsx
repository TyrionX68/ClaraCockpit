import { createContext, useContext, useState, useEffect } from 'react';

// Property Context für Clara360 Fusion
const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
  const [propertyData, setPropertyData] = useState({
    objekte: [],
    mieter: [],
    vertraege: [],
    zahlungen: [],
    loading: false,
    error: null
  });

  // Lade Dummy-Daten für Fusion-Dashboard
  useEffect(() => {
    const loadDummyData = async () => {
      try {
        setPropertyData(prev => ({ ...prev, loading: true }));
        
        // Simuliere API-Call mit Dashboard-Daten
        const response = await fetch('/data/dashboard.json');
        const data = await response.json();
        
        setPropertyData({
          objekte: [{ name: "Waldhofstraße 76", einheiten: 14 }],
          mieter: Array.from({ length: 14 }, (_, i) => ({ id: i + 1, name: `Mieter ${i + 1}` })),
          vertraege: [],
          zahlungen: [],
          kpis: data.kpis || {},
          loading: false,
          error: null
        });
      } catch (error) {
        setPropertyData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
      }
    };

    loadDummyData();
  }, []);

  return (
    <PropertyContext.Provider value={propertyData}>
      {children}
    </PropertyContext.Provider>
  );
};

export const usePropertyContext = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('usePropertyContext must be used within a PropertyProvider');
  }
  return context;
};

export default usePropertyContext;

