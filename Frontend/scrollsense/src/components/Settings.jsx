import { useState } from 'react';
import Logo from './Logo';
import NavProfile, { displayName, initials } from './NavProfile';
import api from '../api';

const TabIcon = ({ name }) => {
  const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (name === 'account') return <svg {...common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
  if (name === 'connected') return <svg {...common}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>;
  if (name === 'notifications') return <svg {...common}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
  return <svg {...common}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
};

const Settings = ({ user, setUser, onLogout, onNavigateToDashboard, onNavigateToReports }) => {
  const [activeTab, setActiveTab] = useState('account');

  // Profile fields seeded from the authenticated user.
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Password change.
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  // Server-side data-collection flag (the extension reads/respects this too).
  const [collection, setCollection] = useState(!!user?.collection_enabled);
  const [collectionMsg, setCollectionMsg] = useState('');

  // Local-only notification preferences.
  const [preferences, setPreferences] = useState({ spikes: true, digest: true, streaks: true, news: false });
  const handleToggle = (key) => setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      const updated = await api.updateProfile(name, email);
      setUser(updated);
      setProfileMsg('Saved.');
    } catch (err) {
      setProfileMsg(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg('');
    if (newPw !== confirmPw) { setPwMsg('New passwords do not match.'); return; }
    try {
      await api.changePassword(curPw, newPw);
      setPwMsg('Password updated.');
      setCurPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwMsg(err.message);
    }
  };

  const toggleCollection = async (enabled) => {
    setCollection(enabled);
    setCollectionMsg('');
    try {
      await api.setCollection(enabled);
      if (setUser && user) setUser({ ...user, collection_enabled: enabled });
      setCollectionMsg(enabled ? 'Collection on.' : 'Collection paused.');
    } catch (err) {
      setCollection(!enabled); // revert
      setCollectionMsg(err.message);
    }
  };

  return (
    <div className="settings-container">
      <nav className="dash-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={{ cursor: 'pointer' }} onClick={onNavigateToDashboard}><Logo variant="dark" size={26} /></span>
          <div className="nav-links">
            <a href="#dash" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigateToDashboard(); }}>Dashboard</a>
            <a href="#rep" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigateToReports(); }}>Reports</a>
            <a href="#set" className="nav-item active">Settings</a>
          </div>
        </div>
        <NavProfile user={user} onLogout={onLogout} />
      </nav>

      <header className="settings-header-area">
        <div className="section-label" style={{ marginBottom: '0' }}>Settings</div>
        <h1 className="settings-title">Tune your scroll.</h1>
      </header>

      <div className="settings-layout-grid">
        <aside className="settings-sidebar">
          <button className={`sidebar-tab-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
            <TabIcon name="account" /> <span>Account</span>
            {activeTab === 'account' && <span className="tab-active-dot"></span>}
          </button>
          <button className={`sidebar-tab-item ${activeTab === 'connected' ? 'active' : ''}`} onClick={() => setActiveTab('connected')}>
            <TabIcon name="connected" /> <span>Data collection</span>
            {activeTab === 'connected' && <span className="tab-active-dot"></span>}
          </button>
          <button className={`sidebar-tab-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <TabIcon name="notifications" /> <span>Notifications</span>
            {activeTab === 'notifications' && <span className="tab-active-dot"></span>}
          </button>
          <button className={`sidebar-tab-item ${activeTab === 'danger' ? 'active' : ''}`} onClick={() => setActiveTab('danger')}>
            <TabIcon name="danger" /> <span>Danger zone</span>
            {activeTab === 'danger' && <span className="tab-active-dot"></span>}
          </button>
        </aside>

        <main className="settings-content-pane">
          {/* ACCOUNT */}
          {activeTab === 'account' && (
            <>
              <div className="settings-card">
                <h2 className="settings-card-title">Profile</h2>
                <p className="settings-card-subtitle">How Scroll Sense addresses you in the app and on your reports.</p>

                <form onSubmit={handleSaveChanges}>
                  <div className="profile-form-row">
                    <div className="avatar-uploader">
                      {initials(user)}
                      <div className="avatar-upload-icon">↑</div>
                    </div>

                    <div className="form-inputs-flex">
                      <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Name</label>
                        <div className="input-field-wrapper">
                          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="auth-input" />
                        </div>
                      </div>

                      <div className="input-group" style={{ flex: 1 }}>
                        <label className="input-label">Email</label>
                        <div className="input-field-wrapper">
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions-row">
                    {profileMsg && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginRight: 'auto' }}>{profileMsg}</span>}
                    <button type="button" className="btn-discard" onClick={() => { setName(user?.name || ''); setEmail(user?.email || ''); setProfileMsg(''); }}>Discard</button>
                    <button type="submit" className="btn-save-settings">Save changes</button>
                  </div>
                </form>
              </div>

              {/* Password */}
              <div className="settings-card">
                <h2 className="settings-card-title">Password</h2>
                <p className="settings-card-subtitle">This is the same login you use in the browser extension.</p>
                <form onSubmit={handleChangePassword}>
                  <div className="input-group">
                    <label className="input-label">Current password</label>
                    <div className="input-field-wrapper">
                      <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} className="auth-input" required />
                    </div>
                  </div>
                  <div className="form-inputs-flex">
                    <div className="input-group" style={{ flex: 1 }}>
                      <label className="input-label">New password</label>
                      <div className="input-field-wrapper">
                        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="auth-input" required />
                      </div>
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label className="input-label">Confirm new password</label>
                      <div className="input-field-wrapper">
                        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="auth-input" required />
                      </div>
                    </div>
                  </div>
                  <div className="form-actions-row">
                    {pwMsg && <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginRight: 'auto' }}>{pwMsg}</span>}
                    <button type="submit" className="btn-save-settings">Update password</button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* DATA COLLECTION */}
          {activeTab === 'connected' && (
            <div className="settings-card">
              <h2 className="settings-card-title">Data collection</h2>
              <p className="settings-card-subtitle">Controls whether ScrollSense scores new posts from your feed. The browser extension respects this switch too.</p>

              <div className="notification-list">
                <div className="notification-item">
                  <div className="notification-info">
                    <span className="notification-title">Collect &amp; analyze my feed</span>
                    <span className="notification-desc">When on, posts you scroll past in the extension are scored and added to your dashboard.</span>
                  </div>
                  <label className="switch-container">
                    <input type="checkbox" checked={collection} onChange={(e) => toggleCollection(e.target.checked)} />
                    <span className="switch-slider"></span>
                  </label>
                </div>
              </div>
              {collectionMsg && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>{collectionMsg}</p>}

              <div className="connected-list" style={{ marginTop: '1.5rem' }}>
                <div className="connected-row">
                  <div className="connected-info">
                    <span className="connected-name">Facebook</span>
                    <span className="connected-status"><span className="dot-connected"></span> Connected as {displayName(user)}</span>
                  </div>
                </div>
                <div className="connected-row" style={{ opacity: 0.65 }}>
                  <div className="connected-info">
                    <span className="connected-name">Instagram</span>
                    <span className="connected-status">Coming soon</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS (local-only) */}
          {activeTab === 'notifications' && (
            <div className="settings-card">
              <h2 className="settings-card-title">Notification preferences</h2>
              <p className="settings-card-subtitle">A gentle nudge, never a barrage. (Saved on this device.)</p>

              <div className="notification-list">
                {[
                  ['spikes', 'Email me when negativity spikes', "We'll send a short note if your feed swings below your baseline."],
                  ['digest', 'Weekly digest', 'Sunday evenings — a one-screen recap with your top keywords.'],
                  ['streaks', 'Bright streaks', 'A small celebration when your feed stays bright for 5 days in a row.'],
                  ['news', 'Product news', 'New features and the occasional changelog. About once a month.'],
                ].map(([key, title, desc]) => (
                  <div className="notification-item" key={key}>
                    <div className="notification-info">
                      <span className="notification-title">{title}</span>
                      <span className="notification-desc">{desc}</span>
                    </div>
                    <label className="switch-container">
                      <input type="checkbox" checked={preferences[key]} onChange={() => handleToggle(key)} />
                      <span className="switch-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DANGER ZONE */}
          {activeTab === 'danger' && (
            <div className="settings-card" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="settings-card-title" style={{ color: '#8C4A32' }}>Danger zone</h2>
              <p className="settings-card-subtitle">Quiet, reversible actions live up top. The loud ones live here.</p>

              <div className="danger-list">
                <div className="danger-action-row">
                  <div className="danger-action-info">
                    <span className="danger-action-title">Pause sentiment analysis</span>
                    <span className="danger-action-desc">Stop scoring new posts. Your historical data stays put.</span>
                  </div>
                  <button className="btn-danger-outline" onClick={() => toggleCollection(false)}>Pause</button>
                </div>

                <div className="danger-action-row">
                  <div className="danger-action-info">
                    <span className="danger-action-title">Sign out</span>
                    <span className="danger-action-desc">Sign out of the web app on this device.</span>
                  </div>
                  <button className="btn-danger-outline" onClick={onLogout}>Sign out</button>
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
