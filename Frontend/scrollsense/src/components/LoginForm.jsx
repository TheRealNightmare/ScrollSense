import { useState } from 'react';
import api, { setToken } from '../api';

const LoginForm = ({ onNavigateToSignup, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token } = await api.login(email, password);
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
          <div className="section-label">Welcome Back</div>
          <h2 className="form-title">Hi again.</h2>
          <p className="form-subtitle">Sign in to pick up where your feed left off.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-field-wrapper">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-field-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                style={{ letterSpacing: showPassword ? 'normal' : '0.15em' }}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password visibility">
                <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="remember-checkbox"
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-link">Forgot password?</a>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            <span>{loading ? 'Signing in…' : 'Sign in'}</span>
            <span>→</span>
          </button>
        </form>

        <div className="form-footer">
          New to Scroll Sense?{' '}
          <a
            href="#signup"
            onClick={(e) => { e.preventDefault(); onNavigateToSignup(); }}
            style={{ cursor: 'pointer' }}
          >
            Create an account
          </a>
        </div>
      </div>

      <div className="jump-badge">
        <span className="badge-dot"></span>
        Jump to page
      </div>
    </div>
  );
};

export default LoginForm;
