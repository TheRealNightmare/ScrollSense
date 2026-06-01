import { useEffect, useState } from 'react';
import Logo from './Logo';
import NavProfile from './NavProfile';
import api from '../api';

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const iso = (d) => d.toISOString().slice(0, 10);
const fmtRange = (start, end) => {
  const opts = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${new Date(start + 'T00:00:00').toLocaleDateString('en-US', opts)} – ${new Date(end + 'T00:00:00').toLocaleDateString('en-US', opts)}`;
};

const Reports = ({ user, onLogout, onNavigateToDashboard, onNavigateToSettings }) => {
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 29);

  const [startDate, setStartDate] = useState(iso(monthAgo));
  const [endDate, setEndDate] = useState(iso(today));
  const [activePill, setActivePill] = useState('30');
  const [summary, setSummary] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const loadHistory = () => {
    api.reportHistory().then(setHistory).catch((e) => setError(e.message));
  };
  useEffect(loadHistory, []);

  const applyPill = (days, key) => {
    const s = new Date();
    s.setDate(today.getDate() - (days - 1));
    setStartDate(iso(s));
    setEndDate(iso(today));
    setActivePill(key);
  };

  const generate = async () => {
    setError('');
    setGenerating(true);
    try {
      const s = await api.reportSummary(startDate, endDate);
      setSummary(s);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  // Header stat tokens, derived from real history.
  const reportsRun = history.length;
  const medianSentiment = history.length
    ? [...history].map((h) => h.avg_sentiment_pct).sort((a, b) => a - b)[Math.floor(history.length / 2)]
    : 0;

  const trendColor = (t) => (t === 'pos' ? '#1E4D3A' : t === 'neg' ? '#8C4A32' : 'var(--color-text-dark)');

  return (
    <div className="reports-container">
      <nav className="dash-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={{ cursor: 'pointer' }} onClick={onNavigateToDashboard}><Logo variant="dark" size={26} /></span>
          <div className="nav-links">
            <a href="#dash" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigateToDashboard(); }}>Dashboard</a>
            <a href="#rep" className="nav-item active">Reports</a>
            <a href="#set" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigateToSettings(); }}>Settings</a>
          </div>
        </div>
        <NavProfile user={user} onLogout={onLogout} />
      </nav>

      <header className="reports-main-header">
        <div className="reports-title-area">
          <div className="section-label" style={{ marginBottom: '0' }}>Reports</div>
          <h1 className="reports-title">Generate your sentiment report.</h1>
          <p className="reports-subtitle">Pick a range and we'll pull together a clean summary of how your feed felt over that window.</p>
        </div>

        <div className="top-stats-container">
          <div className="stat-token">
            <div className="token-num">{reportsRun}</div>
            <div className="token-lbl">Windows</div>
          </div>
          <div className="stat-token">
            <div className="token-num">14d</div>
            <div className="token-lbl">Window Size</div>
          </div>
          <div className="stat-token">
            <div className="token-num">{medianSentiment}%</div>
            <div className="token-lbl">Median Sentiment</div>
          </div>
        </div>
      </header>

      {error && <div className="dash-banner error">{error}</div>}

      <div className="reports-grid">
        {/* Left: Configuration */}
        <div className="config-column">
          <div className="step-card">
            <div className="step-meta">Step 1</div>
            <h3 className="step-title">Choose your window</h3>

            <div className="date-inputs-row">
              <div className="date-box">
                <label>Start Date</label>
                <div className="date-field">
                  <input type="date" value={startDate} max={endDate} onChange={(e) => { setStartDate(e.target.value); setActivePill(''); }} />
                  <CalendarIcon />
                </div>
              </div>
              <div className="date-box">
                <label>End Date</label>
                <div className="date-field">
                  <input type="date" value={endDate} max={iso(today)} onChange={(e) => { setEndDate(e.target.value); setActivePill(''); }} />
                  <CalendarIcon />
                </div>
              </div>
            </div>

            <div className="pill-row">
              <button className={`filter-pill ${activePill === '7' ? 'active' : ''}`} onClick={() => applyPill(7, '7')}>Last 7 days</button>
              <button className={`filter-pill ${activePill === '30' ? 'active' : ''}`} onClick={() => applyPill(30, '30')}>Last 30 days</button>
              <button className={`filter-pill ${activePill === '90' ? 'active' : ''}`} onClick={() => applyPill(90, '90')}>Last 90 days</button>
            </div>
          </div>

          <div className="step-card">
            <div className="step-meta">Step 2</div>
            <h3 className="step-title">Source</h3>
            <div className="source-row">
              <div className="source-tile connected">
                <div className="source-name">Facebook <span style={{ width: '6px', height: '6px', backgroundColor: '#4A9C6D', borderRadius: '50%' }}></span></div>
                <div className="source-status">Connected</div>
              </div>
              <div className="source-tile" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                <div className="source-name">Instagram</div>
                <div className="source-status">Coming soon</div>
              </div>
              <div className="source-tile" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                <div className="source-name">Threads</div>
                <div className="source-status">Coming soon</div>
              </div>
            </div>
          </div>

          <div className="step-card">
            <div className="step-meta">Step 3</div>
            <h3 className="step-title">Include</h3>
            <div className="badge-row">
              <button className="sentiment-badge" style={{ backgroundColor: '#1E4D3A' }}>● Positive</button>
              <button className="sentiment-badge" style={{ backgroundColor: '#8C4A32' }}>● Negative</button>
            </div>

            <button className="btn-generate" onClick={generate} disabled={generating}>
              <span>⚙</span> {generating ? 'Generating…' : 'Generate report'}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="preview-column">
          <div className="preview-card">
            <div className="preview-top-bar">
              <div>
                <div className="section-label" style={{ marginBottom: '2px' }}>Preview</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: '500' }}>
                  {fmtRange(startDate, endDate)}
                </div>
              </div>
            </div>

            {!summary ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '2rem 0', textAlign: 'center' }}>
                Pick a window and hit <strong>Generate report</strong> to see your summary.
              </p>
            ) : (
              <>
                <div className="preview-stat-grid">
                  <div className="preview-stat-item">
                    <div className="token-lbl">Total Posts</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginTop: '2px' }}>{summary.total_posts.toLocaleString()}</div>
                  </div>
                  <div className="preview-stat-item">
                    <div className="token-lbl">Avg Sentiment</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginTop: '2px' }}>{summary.avg_sentiment_pct}%</div>
                  </div>
                  <div className="preview-stat-item">
                    <div className="token-lbl">Top Keyword</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '18px', marginTop: '2px' }}>{summary.top_keyword}</div>
                  </div>
                </div>

                <div className="preview-days-counter">
                  <span style={{ color: 'var(--color-text-muted)' }}>Bright days</span>
                  <span style={{ fontFamily: 'var(--font-serif)', color: '#1E4D3A', fontSize: '16px' }}>{summary.bright_days}</span>
                  <span style={{ color: 'var(--color-text-muted)', marginLeft: '1rem' }}>Heavy days</span>
                  <span style={{ fontFamily: 'var(--font-serif)', color: '#8C4A32', fontSize: '16px' }}>{summary.heavy_days}</span>
                </div>

                {summary.total_posts === 0 && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
                    No posts were scored in this window.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="preview-card" style={{ backgroundColor: 'var(--color-bg-light)' }}>
            <div className="token-lbl" style={{ marginBottom: '0.75rem' }}>What's in this report</div>
            <div className="pdf-spec-list">
              <div className="pdf-spec-item">✓ Total posts scored</div>
              <div className="pdf-spec-item">✓ Average positive sentiment</div>
              <div className="pdf-spec-item">✓ Top keyword of the window</div>
              <div className="pdf-spec-item">✓ Bright / heavy day counts</div>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <section className="history-section">
        <div className="history-header">
          <div>
            <div className="section-label" style={{ marginBottom: '0' }}>History</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '4px 0 0 0', fontWeight: '400' }}>Past windows</h2>
          </div>
        </div>

        <div className="reports-table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Range</th>
                <th>Posts</th>
                <th>Avg Sentiment</th>
                <th>Top Keyword</th>
                <th>Generated</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr><td colSpan={6} style={{ color: 'var(--color-text-muted)', padding: '1.5rem' }}>No history yet — once your feed has scored posts, fortnightly windows appear here.</td></tr>
              )}
              {history.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div>{row.type}</div>
                    <div className="tbl-codename">{row.id}</div>
                  </td>
                  <td>{fmtRange(row.start, row.end)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.total_posts.toLocaleString()}</td>
                  <td>
                    <span style={{ color: trendColor(row.trend), fontWeight: '500' }}>● {row.avg_sentiment_pct}%</span>
                  </td>
                  <td className="tbl-keyword">{row.top_keyword}</td>
                  <td>{new Date(row.generated + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Reports;
