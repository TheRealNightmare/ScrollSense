import React from 'react';

const Reports = ({ onNavigateToDashboard, onNavigateToSettings }) => {
  // Historical data logs matching the layout schema image
  const records = [
    { id: "rpt_0142", type: "Sentiment digest", range: "May 1 – May 14, 2026", posts: "18,420", sentiment: "68 %", key: "graduation", date: "May 15, 2026", trend: "pos" },
    { id: "rpt_0141", type: "Sentiment digest", range: "Apr 16 – Apr 30, 2026", posts: "21,704", sentiment: "61 %", key: "inflation", date: "May 1, 2026", trend: "neu" },
    { id: "rpt_0140", type: "Sentiment digest", range: "Apr 1 – Apr 15, 2026", posts: "19,238", sentiment: "64 %", key: "spring", date: "Apr 16, 2026", trend: "neu" },
    { id: "rpt_0139", type: "Sentiment digest", range: "Mar 16 – Mar 31, 2026", posts: "20,115", sentiment: "59 %", key: "taxes", date: "Apr 1, 2026", trend: "neg" },
    { id: "rpt_0138", type: "Sentiment digest", range: "Feb 14 – Mar 14, 2026", posts: "38,492", sentiment: "66 %", key: "valentines", date: "Mar 15, 2026", trend: "pos" }
  ];

  return (
    <div className="reports-container">
      {/* Top Universal Navbar Header */}
      <nav className="dash-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span className="brand-text" style={{ fontSize: '14px', cursor: 'pointer' }} onClick={onNavigateToDashboard}>▲ Scroll Sense</span>
          <div className="nav-links">
            <a href="#dash" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigateToDashboard(); }}>Dashboard</a>
            <a href="#rep" className="nav-item active">Reports</a>
            <a href="#set" className="nav-item" onClick={(e) => { e.preventDefault(); onNavigateToSettings(); }}>Settings</a>
          </div>
        </div>
        <div className="nav-profile">
          <span style={{ fontSize: '13px', fontWeight: '500' }}>Maya K.</span>
          <div className="profile-avatar">MK</div>
        </div>
      </nav>

      {/* Hero Reports Subheader Section */}
      <header className="reports-main-header">
        <div className="reports-title-area">
          <div className="section-label" style={{ marginBottom: '0' }}>Reports</div>
          <h1 className="reports-title">Generate your sentiment report.</h1>
          <p className="reports-subtitle">Pick a range, pick a feeling. We'll pull together a clean PDF you can share, archive, or quietly screenshot at 1am.</p>
        </div>

        <div className="top-stats-container">
          <div className="stat-token">
            <div className="token-num">142</div>
            <div className="token-lbl">Reports Run</div>
          </div>
          <div className="stat-token">
            <div className="token-num">38d</div>
            <div className="token-lbl">Avg Range</div>
          </div>
          <div className="stat-token">
            <div className="token-num">68%</div>
            <div className="token-lbl">Median Sentiment</div>
          </div>
        </div>
      </header>

      {/* Multi-Step Selection Layout and Document Live Preview Module */}
      <div className="reports-grid">
        
        {/* Left Side: Configuration Actions */}
        <div className="config-column">
          
          {/* Step 1: Calendar Window */}
          <div className="step-card">
            <div className="step-meta">Step 1</div>
            <h3 className="step-title">Choose your window</h3>
            
            <div className="date-inputs-row">
              <div className="date-box">
                <label>Start Date</label>
                <input type="text" defaultValue="05/01/2026" />
              </div>
              <div className="date-box">
                <label>End Date</label>
                <input type="text" defaultValue="05/15/2026" />
              </div>
            </div>

            <div className="pill-row">
              <button className="filter-pill">Last 7 days</button>
              <button className="filter-pill active">Last 30 days</button>
              <button className="filter-pill">Last 90 days</button>
              <button className="filter-pill">Year to date</button>
            </div>

            <div className="calendar-mock">
              <div className="cal-header">
                <span>‹</span>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>May 2026</span>
                <span>›</span>
              </div>
              <div className="cal-grid">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="cal-day-label">{d}</div>
                ))}
                
                {/* Visual Calendar Grid Assembly Map matching design */}
                <div className="cal-cell empty"></div>
                <div className="cal-cell empty"></div>
                <div className="cal-cell empty"></div>
                <div className="cal-cell empty"></div>
                <div className="cal-cell empty"></div>
                <div className="cal-cell range-edge">1</div>
                <div className="cal-cell range-bg">2</div>
                
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(n => (
                  <div key={n} className="cal-cell range-bg">{n}</div>
                ))}
                <div className="cal-cell range-edge">15</div>
                <div className="cal-cell">16</div>
                {[17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(n => (
                  <div key={n} className="cal-cell">{n}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Source Selection */}
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

          {/* Step 3: Include Scope Toggles */}
          <div className="step-card">
            <div className="step-meta">Step 3</div>
            <h3 className="step-title">Include</h3>
            <div className="badge-row">
              <button className="sentiment-badge" style={{ backgroundColor: '#1E4D3A' }}>● Positive</button>
              <button className="sentiment-badge" style={{ backgroundColor: '#8C4A32' }}>● Negative</button>
              <button className="sentiment-badge" style={{ backgroundColor: '#4A4742' }}>● Neutral</button>
            </div>
            
            <button className="btn-generate" onClick={() => alert('Compiling document payload metadata aggregates...')}>
              <span>⚙</span> Generate report
            </button>
          </div>

        </div>

        {/* Right Side: Document Content Blueprint Box Preview */}
        <div className="preview-column">
          <div className="preview-card">
            <div className="preview-top-bar">
              <div>
                <div className="section-label" style={{ marginBottom: '2px' }}>Preview</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: '500' }}>May 1 – May 15, 2026</div>
              </div>
              <button className="btn-download-pdf">
                <span>↓</span> Download PDF
              </button>
            </div>

            <div className="preview-stat-grid">
              <div className="preview-stat-item">
                <div className="token-lbl">Total Posts</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginTop: '2px' }}>18,420</div>
              </div>
              <div className="preview-stat-item">
                <div className="token-lbl">Avg Sentiment</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginTop: '2px' }}>68%</div>
              </div>
              <div className="preview-stat-item">
                <div className="token-lbl">Top Keyword</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '18px', marginTop: '2px' }}>graduation</div>
              </div>
            </div>

            <div className="preview-days-counter">
              <span style={{ color: 'var(--color-text-muted)' }}>Bright days</span>
              <span style={{ fontFamily: 'var(--font-serif)', color: '#1E4D3A', fontSize: '16px' }}>12</span>
              <span style={{ color: 'var(--color-text-muted)', marginLeft: '1rem' }}>Heavy days</span>
              <span style={{ fontFamily: 'var(--font-serif)', color: '#8C4A32', fontSize: '16px' }}>3</span>
            </div>

            {/* Micro Dashboard Vector Approximation Sparkline */}
            <div style={{ height: '60px', margin: '1.5rem 0', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <svg viewBox="0 0 300 50" style={{ width: '100%', height: '100%' }}>
                <path d="M0,25 Q75,10 150,20 T300,15" fill="none" stroke="#1E4D3A" strokeWidth="2" />
                <path d="M0,40 Q75,42 150,45 T300,38" fill="none" stroke="#8C4A32" strokeWidth="1.5" />
              </svg>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4', margin: '0' }}>
              You scrolled <strong>brighter</strong> than 71% of Scroll Sense readers this window. Most of your heavy days clustered around news cycles on May 6 and May 11.
            </p>
          </div>

          {/* What's Inside Checklist Meta Box */}
          <div className="preview-card" style={{ backgroundColor: 'var(--color-bg-light)' }}>
            <div className="token-lbl" style={{ marginBottom: '0.75rem' }}>What's inside the PDF</div>
            <div className="pdf-spec-list">
              <div className="pdf-spec-item">✓ Cover with score card</div>
              <div className="pdf-spec-item">✓ Daily breakdown table</div>
              <div className="pdf-spec-item">✓ Sentiment-over-time chart</div>
              <div className="pdf-spec-item">✓ Top keywords list</div>
              <div className="pdf-spec-item">✓ Content type donut</div>
              <div className="pdf-spec-item">✓ Methodology note</div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Historical Ledger Data Section */}
      <section className="history-section">
        <div className="history-header">
          <div>
            <div className="section-label" style={{ marginBottom: '0' }}>History</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: '4px 0 0 0', fontWeight: '400' }}>Past reports</h2>
          </div>
          <a href="#seeall" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>See all →</a>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div>{row.type}</div>
                    <div className="tbl-codename">{row.id}</div>
                  </td>
                  <td>{row.range}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{row.posts}</td>
                  <td>
                    <span style={{ 
                      color: row.trend === 'pos' ? '#1E4D3A' : row.trend === 'neg' ? '#8C4A32' : 'var(--color-text-dark)',
                      fontWeight: '500' 
                    }}>
                      ● {row.sentiment}
                    </span>
                  </td>
                  <td className="tbl-keyword">{row.key}</td>
                  <td>{row.date}</td>
                  <td>
                    <button className="btn-re-download" onClick={() => alert(`Re-downloading ${row.id} build...`)}>
                      ↓ Re-download
                    </button>
                  </td>
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