import Logo from './Logo';

// Deterministic mosaic (11 cols x 7 rows = 77) matching the "last week at a glance" graphic.
const GRID_PALETTE = ['#8C4A32', '#1E4D3A', '#4A4742', '#2E3B34'];
const GRID_CELLS = Array.from({ length: 77 }, (_, i) => GRID_PALETTE[(i * 7 + (i % 5)) % GRID_PALETTE.length]);

const LeftPanel = () => {

  return (
    <div className="left-panel">
      <Logo variant="light" size={28} />

      <div className="left-main-content">
        <div className="section-label">Today's Read</div>
        <h1 className="quote-heading">
          “Your feed isn’t neutral. <br />
          <span>It has a mood.</span> Now you can see it.”
        </h1>
        <p className="quote-author">— from the Scroll Sense field journal</p>

        <div className="grid-container">
          <div className="section-label">Last week, at a glance</div>
          <div className="data-grid">
            {GRID_CELLS.map((bgColor, idx) => (
              <div 
                key={idx} 
                className="grid-cell" 
                style={{ backgroundColor: bgColor }} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="left-footer">
        <span>35 Days</span>
        <span>•</span>
        <span>18,420 Posts</span>
        <span>•</span>
        <span>1 Quieter Scroll</span>
      </div>
    </div>
  );
};

export default LeftPanel;