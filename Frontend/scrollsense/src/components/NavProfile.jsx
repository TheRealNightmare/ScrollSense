import { useState } from 'react';

// Derives a display name + initials from the logged-in user. Extension-created
// accounts may have no name, so we fall back to the email handle.
export const displayName = (user) => {
  if (!user) return 'Account';
  if (user.name && user.name.trim()) return user.name.trim();
  return (user.email || 'account').split('@')[0];
};

export const initials = (user) => {
  const name = displayName(user);
  const parts = name.split(/[\s.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const NavProfile = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const name = displayName(user);

  return (
    <div className="nav-profile" style={{ position: 'relative' }}>
      <span className="nav-bell" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
      </span>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="profile-avatar">{initials(user)}</div>
        <span style={{ fontSize: '13px', fontWeight: '500' }}>{name}</span>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>▾</span>
      </div>

      {open && (
        <div
          style={{
            position: 'absolute', top: '120%', right: 0, background: '#fff',
            border: '1px solid var(--color-border)', borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)', padding: '6px', minWidth: '160px', zIndex: 50,
          }}
        >
          <div style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {user?.email}
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none',
              background: 'transparent', cursor: 'pointer', fontSize: '13px', color: '#8C4A32',
              borderRadius: '6px',
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default NavProfile;
