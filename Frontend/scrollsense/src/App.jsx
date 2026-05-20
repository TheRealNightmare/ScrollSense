import React, { useState } from 'react';
import LeftPanel from './components/LeftPanel';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './components/Dashboard'; // Import Dashboard page

function App() {
  // Navigation states: 'login' | 'signup' | 'dashboard'
  const [currentPage, setCurrentPage] = useState('login');

  // Route condition check
  if (currentPage === 'dashboard') {
    return <Dashboard />;
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
        <SignupForm onNavigateToLogin={() => setCurrentPage('login')} />
      )}
    </div>
  );
}

export default App;