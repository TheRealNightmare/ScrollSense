import React from 'react';

const Sidebar = ({ currentView, onViewChange }) => {
  return (
    <aside className="sidebar">
      <div className="client-profile">
        <h2>Client Info</h2>
        <p className="client-name">BatMan</p>
        <p className="client-status">Active Account</p>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {/* Dashboard Button */}
          <li 
            className={currentView === 'dashboard' ? 'active' : ''} 
            onClick={() => onViewChange('dashboard')}
          >
            Dashboard
          </li>
          
          {/* History Button */}
          <li 
            className={currentView === 'history' ? 'active' : ''} 
            onClick={() => onViewChange('history')}
          >
            Scan History
          </li>
          
          <li>Settings</li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;