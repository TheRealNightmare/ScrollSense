import { useEffect, useState } from 'react';
import LeftPanel from './components/LeftPanel';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import Settings from './components/Settings';
import api, { isAuthed, clearToken } from './api';

function App() {
  // Routing views: 'login' | 'signup' | 'dashboard' | 'reports' | 'settings'
  const [currentPage, setCurrentPage] = useState(isAuthed() ? 'dashboard' : 'login');
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(isAuthed());

  // On load, if a token exists, resolve it to the current user (and bounce to
  // login if it's stale). This is the same JWT the extension uses.
  useEffect(() => {
    if (!isAuthed()) return;
    api.me()
      .then((u) => { setUser(u); setCurrentPage('dashboard'); })
      .catch(() => { clearToken(); setCurrentPage('login'); })
      .finally(() => setBootstrapping(false));
  }, []);

  const handleAuthSuccess = (u) => {
    setUser(u);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setCurrentPage('login');
  };

  if (bootstrapping) {
    return (
      <div className="app-loading">
        <span className="badge-dot"></span> Loading your feed…
      </div>
    );
  }

  if (currentPage === 'dashboard') {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onNavigateToReports={() => setCurrentPage('reports')}
        onNavigateToSettings={() => setCurrentPage('settings')}
      />
    );
  }

  if (currentPage === 'reports') {
    return (
      <Reports
        user={user}
        onLogout={handleLogout}
        onNavigateToDashboard={() => setCurrentPage('dashboard')}
        onNavigateToSettings={() => setCurrentPage('settings')}
      />
    );
  }

  if (currentPage === 'settings') {
    return (
      <Settings
        user={user}
        setUser={setUser}
        onLogout={handleLogout}
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
          onLoginSuccess={handleAuthSuccess}
        />
      ) : (
        <SignupForm
          onNavigateToLogin={() => setCurrentPage('login')}
          onLoginSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

export default App;
