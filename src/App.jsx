import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ModernDashboardPage from './pages/ModernDashboardPage';
import './styles/modern-design-system.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ModernDashboardPage />} />
          <Route path="/dashboard" element={<ModernDashboardPage />} />
          {/* Temporarily disabled routes for build error isolation */}
          {/* <Route path="/banking" element={<BankingPage />} /> */}
          {/* <Route path="/clara-ki" element={<ClaraKIPage />} /> */}
          {/* <Route path="/ki" element={<ClaraKIPage />} /> */}
          {/* <Route path="/manifest" element={<ManifestPage />} /> */}
          {/* <Route path="/kommunikation" element={<KommunikationPage />} /> */}
          <Route path="*" element={<ModernDashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
