import { useEffect, useMemo, useState } from 'react';
import Logo from './Logo';
import NavProfile from './NavProfile';
import api from '../api';

const RANGE_DAYS = { '7D': 7, '30D': 30, '90D': 90 };

const sentimentColor = (s) => (s === 'pos' ? '#1E4D3A' : s === 'neg' ? '#8C4A32' : '#73706B');
const sentimentLabel = (s) => (s === 'pos' ? 'Positive' : s === 'neg' ? 'Negative' : 'Neutral');

const relativeTime = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
};

const shortDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

// Map a series of positivity percentages to an SVG polyline path (viewBox 500x160).
const linePath = (values) => {
  if (!values.length) return '';
  const w = 500;
  const stepX = values.length > 1 ? w / (values.length - 1) : 0;
  return values
    .map((pct, i) => {
      const x = i * stepX;
      const y = 150 - (pct / 100) * 130;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
};

const Dashboard = ({ user, onLogout, onNavigateToReports, onNavigateToSettings }) => {
  const [range, setRange] = useState('7D');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const days = RANGE_DAYS[range];
    Promise.all([
      api.overview(days),
      api.timeline(days),
      api.keywords(days),
      api.heatmap(30),
      api.posts(10),
    ])
      .then(([overview, timeline, keywords, heatmap, posts]) => {
        if (!cancelled) setData({ overview, timeline, keywords, heatmap, posts });
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [range]);

  const o = data?.overview;
  const isEmpty = o && o.posts_analyzed === 0;

  // Derived chart geometry.
  const volumeMax = useMemo(
    () => Math.max(1, ...((data?.timeline || []).map((t) => t.total))),
    [data]
  );
  const posLine = useMemo(() => linePath((data?.timeline || []).map((t) => t.positivity_pct)), [data]);
  const negLine = useMemo(() => linePath((data?.timeline || []).map((t) => 100 - t.positivity_pct)), [data]);
  const kwMax = useMemo(() => Math.max(1, ...((data?.keywords || []).map((k) => k.count))), [data]);

  const gaugePct = o?.positivity_pct ?? 0;
  const circumference = 408;
  const gaugeOffset = circumference * (1 - gaugePct / 100);

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="dashboard-container">
      {/* Navigation Top Header */}
      <nav className="dash-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Logo variant="dark" size={26} />
          <div className="nav-links">
            <a href="#dash" className="nav-item active">Dashboard</a>
            <a href="#rep" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigateToReports(); }}>Reports</a>
            <a href="#set" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigateToSettings(); }}>Settings</a>
          </div>
        </div>
        <NavProfile user={user} onLogout={onLogout} />
      </nav>

      {error && <div className="dash-banner error">{error}</div>}

      {isEmpty && (
        <div className="dash-banner">
          <strong>No posts analyzed yet.</strong> Install the ScrollSense browser extension, sign in
          with this same account, and turn collection on. As you scroll Facebook, your feed will fill
          in here automatically.
        </div>
      )}

      {/* Hero Analytics Metrics Banner */}
      <section className="hero-banner">
        <div className="hero-main">
          <div className="live-indicator">
            <span className="live-dot"></span> Live · {todayLabel}
          </div>
          <h1 className="hero-percentage">
            {o ? o.today_positivity_pct : '—'}% <span>positive</span> <em className="hero-muted">today.</em>
          </h1>
          <p className="hero-desc">
            {isEmpty
              ? 'Your dashboard is ready and waiting for its first scored posts.'
              : `Based on ${o?.posts_analyzed ?? 0} posts analyzed over the last ${RANGE_DAYS[range]} days.`}
          </p>
        </div>

        <div className="hero-metrics-grid">
          <div className="metric-tile">
            <div className="tile-label">Posts Analyzed</div>
            <div className="tile-val">{o ? o.posts_analyzed.toLocaleString() : '—'}</div>
          </div>
          <div className="metric-tile">
            <div className="tile-label">Most Active Hour</div>
            <div className="tile-val">{o ? o.most_active_hour : '—'}</div>
          </div>
          <div className="metric-tile">
            <div className="tile-label">Negative Share</div>
            <div className="tile-val">{o ? `${o.negative_pct}%` : '—'}</div>
          </div>
          <div className="metric-tile">
            <div className="tile-label">Bright Streak</div>
            <div className="tile-val">{o ? `${o.bright_streak_days} days` : '—'}</div>
          </div>
        </div>
      </section>

      {/* Main Structural Metrics Grid Layout */}
      <main className="dashboard-grid">

        {/* Card 1: Gauge Meter */}
        <div className="dash-card col-4">
          <div className="card-head">
            <div>
              <div className="section-label" style={{ marginBottom: '0' }}>Right Now</div>
              <div className="card-title-sm">Positivity gauge</div>
            </div>
            <span className="live-indicator"><span className="live-dot"></span> Live</span>
          </div>

          <div className="gauge-visual">
            <svg viewBox="0 0 160 160" style={{ position: 'absolute', transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="80" cy="80" r="65" stroke="#E5E2DD" strokeWidth="10" fill="transparent" />
              <circle cx="80" cy="80" r="65" stroke="#1E4D3A" strokeWidth="10" fill="transparent" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={gaugeOffset} />
            </svg>
            <div className="gauge-center-text">
              <div className="gauge-num">{gaugePct}</div>
              <div className="gauge-total">/ 100</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {gaugePct >= 50 ? 'Mostly bright' : 'Leaning heavy'}{' '}
            {o && o.delta_vs_yesterday !== 0 && (
              <span style={{ color: o.delta_vs_yesterday > 0 ? '#1E4D3A' : '#8C4A32' }}>
                {o.delta_vs_yesterday > 0 ? '▲' : '▼'} {Math.abs(o.delta_vs_yesterday)} vs yesterday
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Sentiment Timeline Curve */}
        <div className="dash-card col-8">
          <div className="card-head">
            <div>
              <div className="section-label" style={{ marginBottom: '0' }}>Sentiment Over Time</div>
              <div className="card-title-sm">Positive vs negative share</div>
            </div>
            <div className="range-toggle">
              {['7D', '30D', '90D'].map((r) => (
                <button key={r} className={`range-pill ${range === r ? 'active' : ''}`} onClick={() => setRange(r)}>{r}</button>
              ))}
            </div>
          </div>

          <div className="trend-chart">
            <div className="trend-yaxis">
              {[100, 75, 50, 25].map((y) => <span key={y}>{y}</span>)}
            </div>
            <svg viewBox="0 0 500 160" preserveAspectRatio="none" className="trend-svg">
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" x2="500" y1={20 + i * 40} y2={20 + i * 40} stroke="#EEE9E3" strokeWidth="1" />
              ))}
              {posLine && <path d={posLine} fill="none" stroke="#1E4D3A" strokeWidth="2.5" />}
              {negLine && <path d={negLine} fill="none" stroke="#8C4A32" strokeWidth="2.5" />}
            </svg>
          </div>
          <div className="trend-xaxis">
            {(data?.timeline || [])
              .filter((_, i, a) => i % Math.ceil(a.length / 7 || 1) === 0)
              .map((t) => <span key={t.date}>{shortDate(t.date)}</span>)}
          </div>
          <div className="trend-legend">
            <span><i style={{ background: '#1E4D3A' }}></i> Positive</span>
            <span><i style={{ background: '#8C4A32' }}></i> Negative</span>
          </div>
        </div>

        {/* Card 3: Positive / Negative Split Donut */}
        <div className="dash-card col-4">
          <div className="section-label" style={{ marginBottom: '0' }}>Mix</div>
          <div className="card-title-sm" style={{ marginBottom: '1.5rem' }}>Positive vs negative</div>
          <div className="mix-row">
            <div
              className="donut"
              style={{ background: `conic-gradient(#1E4D3A 0% ${gaugePct}%, #8C4A32 ${gaugePct}% 100%)` }}
            >
              <div className="donut-hole">
                <span className="donut-label">POSITIVE</span>
                <span className="donut-val">{gaugePct}%</span>
              </div>
            </div>
            <div className="mix-legend">
              <div className="mix-legend-row">
                <span className="mix-dot" style={{ background: '#1E4D3A' }}></span>
                <span className="mix-name">Positive</span>
                <span className="mix-pct">{gaugePct}%</span>
              </div>
              <div className="mix-legend-row">
                <span className="mix-dot" style={{ background: '#8C4A32' }}></span>
                <span className="mix-name">Negative</span>
                <span className="mix-pct">{o ? o.negative_pct : 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Volume Bar Chart */}
        <div className="dash-card col-4">
          <div className="section-label" style={{ marginBottom: '0' }}>Volume</div>
          <div className="card-title-sm">Posts per day</div>
          <div className="bar-chart">
            <div className="bar-yaxis">
              {[volumeMax, Math.round(volumeMax * 0.75), Math.round(volumeMax * 0.5), Math.round(volumeMax * 0.25), 0].map((y, i) => <span key={i}>{y}</span>)}
            </div>
            <div className="bar-area">
              {(data?.timeline || []).map((b, i) => (
                <div key={i} className="bar-col" title={`${shortDate(b.date)}: ${b.total}`}>
                  <div className="bar" style={{ height: `${(b.total / volumeMax) * 100}%`, background: sentimentColor(b.total === 0 ? 'neu' : b.positivity_pct >= 50 ? 'pos' : 'neg') }}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 5: Negativity Heatmap */}
        <div className="dash-card col-4">
          <div className="card-head">
            <div>
              <div className="section-label" style={{ marginBottom: '0' }}>When it Hits</div>
              <div className="card-title-sm">Negativity heatmap · 30d</div>
            </div>
            <span className="heat-axis-note">← Day</span>
          </div>
          <div className="heat-hour-row">
            <span className="heat-hour-lead">Hour →</span>
          </div>
          <div className="heatmap-block-wrap">
            {(data?.heatmap || []).map((row, di) => (
              <div key={di} className="heat-row">
                <span className="heat-day">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][di]}</span>
                <div className="heatmap-grid">
                  {row.map((lvl, hi) => <div key={hi} className={`heatmap-block lvl-${lvl}`} />)}
                </div>
              </div>
            ))}
            <div className="heat-hourlabels">
              {['12a', '3a', '6a', '9a', '12p', '3p', '6p'].map((h) => <span key={h}>{h}</span>)}
            </div>
          </div>
          <div className="heat-legend">
            <span>Calm</span>
            <div className="heat-legend-bar"></div>
            <span>Heavy</span>
          </div>
        </div>

        {/* Card 6: Keywords Cloud */}
        <div className="dash-card col-4">
          <div className="section-label" style={{ marginBottom: '0' }}>What People are Saying About</div>
          <div className="card-title-sm">Top keywords</div>
          <div className="kw-sublabel">size = frequency · color = sentiment</div>
          <div className="kw-cloud">
            {(data?.keywords || []).length === 0 && (
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No keywords yet.</span>
            )}
            {(data?.keywords || []).map((k) => (
              <span
                key={k.word}
                className="kw"
                style={{ fontSize: `${13 + Math.round((k.count / kwMax) * 17)}px`, color: sentimentColor(k.sentiment) }}
              >
                {k.word}
              </span>
            ))}
          </div>
        </div>

        {/* Card 7: Live Feed Panel List */}
        <div className="dash-card col-8">
          <div className="card-head" style={{ marginBottom: '0.5rem' }}>
            <div>
              <div className="section-label" style={{ marginBottom: '0' }}>Last 10 Posts</div>
              <div className="card-title-sm">Recent feed</div>
            </div>
          </div>

          <div>
            {(data?.posts || []).length === 0 && (
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', padding: '1rem 0' }}>
                Scored posts from your feed will appear here.
              </div>
            )}
            {(data?.posts || []).map((item) => (
              <div key={item.id} className="feed-item" style={{ borderLeft: `3px solid ${sentimentColor(item.sentiment)}` }}>
                <p className="feed-text">{item.text.length > 220 ? item.text.slice(0, 220) + '…' : item.text}</p>
                <div className="feed-header-info">
                  <div>
                    <span style={{ color: sentimentColor(item.sentiment), fontWeight: '600', marginRight: '8px' }}>● {sentimentLabel(item.sentiment)}</span>
                    <span>{Math.round((item.confidence || 0) * 100)}% confidence</span>
                    <span style={{ marginLeft: '8px' }}>· {relativeTime(item.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer className="dash-model-footer">
        Model: scrollsense-nlp · binary sentiment (positive / negative){loading ? ' · loading…' : ''}
      </footer>
    </div>
  );
};

export default Dashboard;
