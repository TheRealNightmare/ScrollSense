import React, { useState } from 'react';
import LeftPanel from './components/LeftPanel';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Settings from './components/Settings'; // Import the new Settings Component

function App() {
  // Global Routing Views Key State Engine: 'login' | 'signup' | 'dashboard' | 'reports' | 'settings'
  const [currentPage, setCurrentPage] = useState('login');

  // Intercept Page Routing State Switches Definitions
  if (currentPage === 'dashboard') {
    return (
      <Dashboard 
        onNavigateToReports={() => setCurrentPage('reports')} 
        onNavigateToSettings={() => setCurrentPage('settings')}
      />
    );
  }

  if (currentPage === 'reports') {
    return (
      <Reports 
        onNavigateToDashboard={() => setCurrentPage('dashboard')} 
        onNavigateToSettings={() => setCurrentPage('settings')}
      />
    );
  }

  if (currentPage === 'settings') {
    return (
      <Settings 
        onNavigateToDashboard={() => setCurrentPage('dashboard')} 
        onNavigateToReports={() => setCurrentPage('reports')}
      />
    );
  }

  return (
    <div className="app-container">
      <LeftPanel />
      
      {currentPage === 'login' ? (
        <LoginForm 
          onNavigateToSignup={() => setCurrentPage('signup')} 
          onLoginSuccess={() => setCurrentPage('dashboard')} 
        />
      ) : (
        <SignupForm 
          onNavigateToLogin={() => setCurrentPage('login')} 
          onLoginSuccess={() => setCurrentPage('dashboard')}
        />
      )}
    </div>
  );
}

export default App;