/**
 * App.jsx - Hauptanwendung mit modernem Design
 * Aktiviert die neuen modernen Komponenten
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ModernDashboardPage from './pages/ModernDashboardPage';
import './styles/modern-design-system.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Hauptroute - Modernes Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ModernDashboardPage />} />
          
          {/* Fallback für alle anderen Routen */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
