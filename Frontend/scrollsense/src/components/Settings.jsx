import React, { useState } from 'react';

const Settings = ({ onNavigateToDashboard, onNavigateToReports }) => {
  // Sidebar Sub-navigation Controller State ('account' | 'notifications' | 'danger')
  const [activeTab, setActiveTab] = useState('account');

  // Account Form Local Fields States
  const [name, setName] = useState('Maya Krishnan');
  const [email, setEmail] = useState('maya@scrollsense.app');

  // Notification Preferences Stateful Mapping
  const [preferences, setPreferences] = useState({
    spikes: true,
    digest: true,
    streaks: true,
    news: false,
  });

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    alert(`Saving account modifications for: ${name}`);
  };

  return (
    <div className="settings-container">
      {/* Top Universal Nav Bar Header */}
      <nav className="dash-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span className="brand-text" style={{ fontSize: '14px', cursor: 'pointer' }} onClick={onNavigateToDashboard}>▲ Scroll Sense</span>
          <div className="nav-links">
            <a href="#dash" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigateToDashboard(); }}>Dashboard</a>
            <a href="#rep" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigateToReports(); }}>Reports</a>
            <a href="#set" className="nav-item active">Settings</a>
          </div>
        </div>
        <div className="nav-profile">
          <span style={{ fontSize: '13px', fontWeight: '500' }}>Maya K.</span>
          <div className="profile-avatar">MK</div>
        </div>
      </nav>

      {/* Hero Header Context Title */}
      <header className="settings-header-area">
        <div className="section-label" style={{ marginBottom: '0' }}>Settings</div>
        <h1 className="settings-title">Tune your scroll.</h1>
      </header>

      {/* Main Structural Layout Grid */}
      <div className="settings-layout-grid">
        
        {/* Left Side: Dynamic Sidebar Tabs Component Controls */}
        <aside className="settings-sidebar">
          <button 
            className={`sidebar-tab-item ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <span>👤</span> Account
          </button>
       
          <button 
            className={`sidebar-tab-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span>🔔</span> Notifications
          </button>
          <button 
            className={`sidebar-tab-item ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => setActiveTab('danger')}
          >
            <span>🗑️</span> Danger zone
          </button>
        </aside>

        {/* Right Side: Tab Switching Content Window Pane */}
        <main className="settings-content-pane">
          
          {/* TAB VIEW 1: ACCOUNT PREFERENCES CONTAINER */}
          {activeTab === 'account' && (
            <>
              {/* Profile Inputs Card */}
              <div className="settings-card">
                <h2 className="settings-card-title">Profile</h2>
                <p className="settings-card-subtitle">How Scroll Sense addresses you in the app and on your reports.</p>
                
                <form onSubmit={handleSaveChanges}>
                  <div className="profile-form-row">
                    <div className="avatar-uploader">
                      MK
                      <div className="avatar-upload-icon">↑</div>
                    </div>

                    <div className="form-inputs-flex">
                      <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Name</label>
                        <div className="input-field-wrapper">
                          <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="auth-input"
                          />
                        </div>
                      </div>

                      <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Email</label>
                        <div className="input-field-wrapper">
                          <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="auth-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions-row">
                    <button type="button" className="btn-discard" onClick={() => { setName('Maya Krishnan'); setEmail('maya@scrollsense.app'); }}>Discard</button>
                    <button type="submit" className="btn-save-settings">Save changes</button>
                  </div>
                </form>
              </div>

              {/* Plan Management Info Subscription Card */}
              <div className="settings-card">
                <h2 className="settings-card-title">Plan</h2>
                <div className="plan-hero-box" style={{ marginTop: '1rem' }}>
                  <div>
                    <div className="section-label" style={{ marginBottom: '0', fontSize: '8px' }}>Current</div>
                    <h3 className="plan-title-spec" style={{ margin: '0', padding: '0', border: 'none' }}>
                      Scroll Sense <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: '400', color: 'var(--color-text-dark)', marginLeft: '4px' }}>— Reader</span>
                    </h3>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      Up to 50,000 posts / month · unlimited reports
                    </div>
                  </div>
                  <button className="btn-plan-upgrade" onClick={() => alert('Loading stripe billing subscription portal...')}>Upgrade</button>
                </div>
              </div>
            </>
          )}

          {/* TAB VIEW 2: NOTIFICATIONS PREFERENCES CONTAINER */}
          {activeTab === 'notifications' && (
            <div className="settings-card">
              <h2 className="settings-card-title">Notification preferences</h2>
              <p className="settings-card-subtitle">A gentle nudge, never a barrage.</p>
              
              <div className="notification-list">
                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Email me when negativity spikes</span>
                    <span className="notification-desc">We'll send a short note if your feed swings 15% below your baseline for more than an hour.</span>
                  </div>
                  <label className="switch-container">
                    <input type="checkbox" checked={preferences.spikes} onChange={() => handleToggle('spikes')} />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Weekly digest</span>
                    <span className="notification-desc">Sunday evenings — a one-screen recap with your top keywords and bright/heavy days.</span>
                  </div>
                  <label className="switch-container">
                    <input type="checkbox" checked={preferences.digest} onChange={() => handleToggle('digest')} />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Bright streaks</span>
                    <span className="notification-desc">A small celebration when your feed stays above 70% positive for 5 days in a row.</span>
                  </div>
                  <label className="switch-container">
                    <input type="checkbox" checked={preferences.streaks} onChange={() => handleToggle('streaks')} />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Product news</span>
                    <span className="notification-desc">New features, new platforms, and the occasional changelog. About once a month.</span>
                  </div>
                  <label className="switch-container">
                    <input type="checkbox" checked={preferences.news} onChange={() => handleToggle('news')} />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB VIEW 3: DANGER ZONE CONTAINER MATCHING THE CAPTURED IMAGE */}
          {activeTab === 'danger' && (
            <div className="settings-card" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="settings-card-title" style={{ color: '#8C4A32' }}>Danger zone</h2>
              <p className="settings-card-subtitle">Quiet, reversible actions live up top. The loud ones live here.</p>
              
              <div className="danger-list">
                
                {/* Action Block 1 */}
                <div className="danger-action-row">
                  <div className="danger-action-info">
                    <span className="danger-action-title">Pause sentiment analysis</span>
                    <span className="danger-action-desc">Stop reading new posts for now. Your historical data stays put.</span>
                  </div>
                  <button className="btn-danger-outline" onClick={() => alert('Analysis engine paused.')}>Pause</button>
                </div>

                {/* Action Block 2 */}
                <div className="danger-action-row">
                  <div className="danger-action-info">
                    <span className="danger-action-title">Export everything</span>
                    <span className="danger-action-desc">A zip of every post we've scored, every report you've generated, and your settings.</span>
                  </div>
                  <button className="btn-danger-outline" onClick={() => alert('Compiling cloud architecture backup link package...')}>Request export</button>
                </div>

                {/* Action Block 3 */}
                <div className="danger-action-row">
                  <div className="danger-action-info">
                    <span className="danger-action-title">Delete account</span>
                    <span className="danger-action-desc">Wipes your account, your feed history, and your reports. Cannot be undone.</span>
                  </div>
                  <button className="btn-danger-text-alert" onClick={() => confirm('Are you completely sure you want to permanently delete your history logs?')}>Delete account</button>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};

export default Settings;