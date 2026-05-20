
  import React, { useState } from 'react';
import SocialButton from './SocialButton';

// 1. Add 'onLoginSuccess' to your destructured props list here:
const LoginForm = ({ onNavigateToSignup, onLoginSuccess }) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Logging in data submission:', { email, password, rememberMe });
    
    // 2. Trigger the page route shift right here!
    if (onLoginSuccess) {
      onLoginSuccess();
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

        <SocialButton 
          text="Google" 
          icon={
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          }
          onClick={() => console.log('Google Auth Clicked')}
        />

        <div className="divider-container">
          <div className="divider-line"></div>
          <span className="divider-text">Or with email</span>
          <div className="divider-line"></div>
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
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-field-wrapper">
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input" 
                style={{ letterSpacing: '0.15em' }}
                required
              />
              <button type="button" className="password-toggle">
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

          <button type="submit" className="submit-btn">
            <span>Sign in</span>
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

      
    </div>
  );
};

export default LoginForm;