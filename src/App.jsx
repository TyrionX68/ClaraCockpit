import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/DashboardLayout';
import ClaraKIPage from './pages/ClaraKIPage';
import ObjectsPage from './pages/ObjectsPage';
import MaintenancePage from './pages/MaintenancePage';
import DocumentsPage from './pages/DocumentsPage';
import ManifestPage from './pages/ManifestPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardLayout />} />
          <Route path="clara-ki" element={<ClaraKIPage />} />
          <Route path="objects" element={<ObjectsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="banking" element={<div className="p-8"><h1 className="text-2xl font-bold">Banking & Finanzen</h1><p className="text-gray-600 mt-2">Cashflow-Management und Finanzübersicht</p></div>} />
          <Route path="tenants" element={<div className="p-8"><h1 className="text-2xl font-bold">Mieterverwaltung</h1><p className="text-gray-600 mt-2">Mieter, Verträge und Rückstände</p></div>} />
          <Route path="analytics" element={<div className="p-8"><h1 className="text-2xl font-bold">Analysen</h1><p className="text-gray-600 mt-2">Rendite-Analysen und Kennzahlen</p></div>} />
          <Route path="communication" element={<div className="p-8"><h1 className="text-2xl font-bold">Kommunikation</h1><p className="text-gray-600 mt-2">Nachrichten und Termine</p></div>} />
          <Route path="manifest" element={<ManifestPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

