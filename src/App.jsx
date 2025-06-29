import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './components/layout/MainLayout';
import DashboardLayout from './components/DashboardLayout';
import ClaraKIPanel from './components/ClaraKIPanel';
import BankingPage from './pages/BankingPage';
import MieterPage from './pages/MieterPage';
import ObjectsPage from './pages/ObjectsPage';
import MaintenancePage from './pages/MaintenancePage';
import DocumentsPage from './pages/DocumentsPage';
import AnalysenPage from './pages/AnalysenPage';
import ManifestPage from './pages/ManifestPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardLayout />} />
            <Route path="clara-ki" element={<ClaraKIPanel />} />
            <Route path="objects" element={<ObjectsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="banking" element={<BankingPage />} />
            <Route path="tenants" element={<MieterPage />} />
            <Route path="analytics" element={<AnalysenPage />} />
            <Route path="communication" element={<div className="p-8"><h1 className="text-2xl font-bold text-foreground">Kommunikation</h1><p className="text-muted-foreground mt-2">Nachrichten und Termine</p></div>} />
            <Route path="manifest" element={<ManifestPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

