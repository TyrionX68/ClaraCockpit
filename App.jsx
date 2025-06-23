import React, { useState, useEffect } from 'react';
import EigentuemerLogin from './pages/EigentuemerLogin.jsx';
import EigentuemerDashboard from './pages/EigentuemerDashboard.jsx';

const App = () => {
  const [currentRoute, setCurrentRoute] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const ownerId = sessionStorage.getItem('ownerId');
    const loginTime = sessionStorage.getItem('loginTime');
    
    if (ownerId && loginTime) {
      // Check if login is still valid (24 hours)
      const loginDate = new Date(loginTime);
      const now = new Date();
      const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setIsAuthenticated(true);
        setCurrentRoute('dashboard');
      } else {
        // Session expired
        sessionStorage.clear();
        setIsAuthenticated(false);
        setCurrentRoute('login');
      }
    } else {
      setIsAuthenticated(false);
      setCurrentRoute('login');
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    // Handle browser navigation
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/dashboard' && isAuthenticated) {
        setCurrentRoute('dashboard');
      } else if (path === '/login' || path === '/') {
        setCurrentRoute('login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial route based on URL
    const path = window.location.pathname;
    if (path === '/dashboard' && isAuthenticated) {
      setCurrentRoute('dashboard');
    } else if (path === '/login' || path === '/') {
      setCurrentRoute('login');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated]);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentRoute('dashboard');
    
    // Update URL without page reload
    window.history.pushState({}, '', '/dashboard');
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setIsAuthenticated(false);
    setCurrentRoute('login');
    
    // Update URL without page reload
    window.history.pushState({}, '', '/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 mt-2">Clara360 wird geladen...</p>
        </div>
      </div>
    );
  }

  // Route rendering
  const renderCurrentRoute = () => {
    switch (currentRoute) {
      case 'login':
        return <EigentuemerLogin onLoginSuccess={handleLoginSuccess} />;
      case 'dashboard':
        return isAuthenticated ? <EigentuemerDashboard onLogout={handleLogout} /> : <EigentuemerLogin onLoginSuccess={handleLoginSuccess} />;
      default:
        return <EigentuemerLogin onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentRoute()}
    </div>
  );
};

export default App;

