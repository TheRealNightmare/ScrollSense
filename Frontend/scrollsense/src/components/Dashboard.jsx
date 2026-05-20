import React from 'react';

const Dashboard = () => {
  // Mock recent data tracking matching the interface capture
  const feeds = [
    { text: "Finally hit my running goal — 100 km this month. Knees are toast, heart is full.", cat: "PERSONAL", conf: "96% confidence", time: "2 min ago", type: "pos" },
    { text: "Op-ed: why the new housing bill won't move the needle in any city under 500k people.", cat: "NEWS", conf: "81% confidence", time: "11 min ago", type: "neg" },
    { text: "Anyone else getting served the same 3 ads on a loop today? It's the same loafer.", cat: "AD", conf: "62% confidence", time: "24 min ago", type: "neu" }
  ];

  return (
    <div className="dashboard-container">
      {/* Navigation Top Header */}
      <nav className="dash-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span className="brand-text" style={{ fontSize: '14px' }}>▲ Scroll Sense</span>
          <div className="nav-links">
            <a href="#dash" className="nav-item active">Dashboard</a>
            <a href="#rep" className="nav-item">Reports</a>
            <a href="#set" className="nav-item">Settings</a>
          </div>
        </div>
        <div className="nav-profile">
          <span style={{ fontSize: '13px', fontWeight: '500' }}>Maya K.</span>
          <div className="profile-avatar">MK</div>
        </div>
      </nav>

      {/* Hero Analytics Metrics Banner */}
      <section className="hero-banner">
        <div className="hero-main">
          <div className="live-indicator">
            <span className="live-dot"></span> Live • Saturday, May 16
          </div>
          <h1 className="hero-percentage">72% <span>positive today.</span></h1>
          <p className="hero-desc">Your feed is leaning bright. Three heavy notes — housing, layoffs, weather — are doing most of the lift.</p>
        </div>
        
        <div className="hero-metrics-grid">
          <div className="metric-tile">
            <div className="tile-label">Posts Analyzed</div>
            <div className="tile-val">1,284</div>
          </div>
          <div className="metric-tile">
            <div className="tile-label">Most Active Hour</div>
            <div className="tile-val">9-10 PM</div>
          </div>
          <div className="metric-tile">
            <div className="tile-label">Dominant Emotion</div>
            <div className="tile-val" style={{ color: '#1E4D3A' }}>Hopeful</div>
          </div>
          <div className="metric-tile">
            <div className="tile-label">Bright Streak</div>
            <div className="tile-val">12 days</div>
          </div>
        </div>
      </section>

      {/* Main Structural Metrics Grid Layout */}
      <main className="dashboard-grid">
        
        {/* Card 1: Gauge Meter */}
        <div className="dash-card col-4">
          <div className="section-label" style={{ marginBottom: '0' }}>Right Now</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>Positivity gauge</div>
          
          <div className="gauge-visual">
            {/* SVG Circular Dial Backdrop Line */}
            <svg style={{ position: 'absolute', transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="80" cy="80" r="65" stroke="#E5E2DD" strokeWidth="8" fill="transparent" />
              <circle cx="80" cy="80" r="65" stroke="#1E4D3A" strokeWidth="8" fill="transparent" strokeDasharray="408" strokeDashoffset="114" />
            </svg>
            <div className="gauge-center-text">
              <div className="gauge-num">72</div>
              <div className="gauge-total">/ 100</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Mostly bright <span style={{ color: '#4A9C6D' }}>▲ 6 vs yesterday</span>
          </div>
        </div>

        {/* Card 2: Sentiment Timeline Curve */}
        <div className="dash-card col-8">
          <div className="section-label" style={{ marginBottom: '0' }}>Sentiment Over Time</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>Last week</div>
          <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', borderBottom: '1px solid #E5E2DD', margin: '1rem 0' }}>
            {/* SVG Vector Line Approximation Chart */}
            <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%' }}>
              <path d="M0,30 Q125,60 250,45 T500,20" fill="none" stroke="#1E4D3A" strokeWidth="2" />
              <path d="M0,80 Q125,50 250,70 T500,60" fill="none" stroke="#73706B" strokeWidth="1.5" strokeDasharray="3" />
              <path d="M0,120 Q125,125 250,135 T500,140" fill="none" stroke="#8C4A32" strokeWidth="2" />
            </svg>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#1E4D3A' }}>● Positive</span>
            <span style={{ color: '#73706B' }}>--- Neutral</span>
            <span style={{ color: '#8C4A32' }}>● Negative</span>
          </div>
        </div>

        {/* Card 3: Content Category Donut Share */}
        <div className="dash-card col-4">
          <div className="section-label">Mix</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '1.5rem' }}>What's in your feed</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '90px', height: '90px', borderRadius: '50%', border: '16px solid #8C4A32', boxSizing: 'border-box' }} />
            <div style={{ fontSize: '12px', flex: '1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>Personal posts <span style={{ float: 'right', fontWeight: 'bold' }}>38%</span></div>
              <div>News & opinion <span style={{ float: 'right', fontWeight: 'bold' }}>24%</span></div>
              <div>Memes & humor <span style={{ float: 'right', fontWeight: 'bold' }}>19%</span></div>
            </div>
          </div>
        </div>

        {/* Card 4: Heatmap Bound Constraint Fix Layout */}
        <div className="dash-card col-8">
          <div className="section-label" style={{ marginBottom: '0' }}>When it Hits</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>Negativity heatmap</div>
          
          <div className="heatmap-wrapper">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', width: '24px', color: 'var(--color-text-muted)' }}>{day}</span>
                  <div className="heatmap-grid" style={{ flex: '1' }}>
                    {Array.from({ length: 24 }).map((_, i) => {
                      const lvls = ['lvl-0', 'lvl-1', 'lvl-2', 'lvl-3', 'lvl-4'];
                      const randomLvl = lvls[Math.floor(Math.random() * lvls.length)];
                      return <div key={i} className={`heatmap-block ${randomLvl}`} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 5: Keywords Cloud List */}
        <div className="dash-card col-4">
          <div className="section-label">What People are Saying About</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '1rem' }}>Top keywords this week</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', alignContent: 'center', minHeight: '160px' }}>
            <span style={{ fontSize: '22px', color: '#1E4D3A', fontFamily: 'var(--font-serif)' }}>climate</span>
            <span style={{ fontSize: '18px', color: '#8C4A32' }}>layoffs</span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>startup</span>
            <span style={{ fontSize: '20px', color: '#1E4D3A', fontStyle: 'italic' }}>graduation</span>
            <span style={{ fontSize: '16px', color: '#8C4A32' }}>inflation</span>
          </div>
        </div>

        {/* Card 6: Live Feed Panel List */}
        <div className="dash-card col-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div className="section-label" style={{ marginBottom: '0' }}>Last 10 Posts</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>Recent feed</div>
            </div>
            <button style={{ background: 'none', border: 'none', fontSize: '11px', fontFamily: 'var(--font-mono)', textDecoration: 'underline', cursor: 'pointer' }}>View all →</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {feeds.map((item, index) => (
              <div key={index} className="feed-item">
                <div className="feed-header-info">
                  <div>
                    <span style={{ 
                      color: item.type === 'pos' ? '#1E4D3A' : item.type === 'neg' ? '#8C4A32' : 'var(--color-text-muted)',
                      fontWeight: 'bold', marginRight: '6px'
                    }}>● {item.type === 'pos' ? 'Positive' : item.type === 'neg' ? 'Negative' : 'Neutral'}</span>
                    <span>{item.conf}</span>
                  </div>
                  <div>{item.time} <span style={{ background: '#E5E2DD', padding: '2px 4px', borderRadius: '3px', marginLeft: '6px', fontSize: '9px' }}>{item.cat}</span></div>
                </div>
                <p className="feed-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;