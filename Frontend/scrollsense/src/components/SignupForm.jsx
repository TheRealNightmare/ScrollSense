import { useState } from 'react';
import api, { setToken } from '../api';

const SignupForm = ({ onNavigateToLogin, onLoginSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { access_token } = await api.signup(email, password, fullName);
      setToken(access_token);
      const user = await api.me();
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="right-panel">
      <div className="form-wrapper">

        <div className="form-header">
          <div className="section-label">Get Started</div>
          <h2 className="form-title" style={{ fontSize: '2rem', lineHeight: '1.2' }}>
            Make your feed <br />
            <span style={{ fontStyle: 'italic' }}>make sense.</span>
          </h2>
          <p className="form-subtitle">It takes 30 seconds. We never post anything on your behalf.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Full Name Input */}
          <div className="input-group">
            <div className="input-field-wrapper">
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="auth-input"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="input-group">
            <div className="input-field-wrapper">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="input-group">
            <div className="input-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                style={{ letterSpacing: password && !showPassword ? '0.15em' : 'normal' }}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
            </div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            <span>{loading ? 'Creating account…' : 'Create my account'}</span>
            <span>→</span>
          </button>
        </form>

        <div className="form-footer">
          Already have an account?{' '}
          <a
            href="#login"
            onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }}
            style={{ cursor: 'pointer' }}
          >
            Log in
          </a>
        </div>

        {/* Small Legal Footnote matching the layout */}
        <p style={{
          fontSize: '10px',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          lineHeight: '1.4',
          marginTop: '2rem',
          padding: '0 1rem'
        }}>
          By creating an account, you agree to our terms and privacy notice. Your feed data stays on your device until you ask us to read it.
        </p>
      </div>

    </div>
  );
};

export default SignupForm;
