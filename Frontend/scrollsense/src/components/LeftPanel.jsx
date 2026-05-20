import React from 'react';

const LeftPanel = () => {
  // Generates 77 data blocks matching the graphic in your design
  const gridCells = Array.from({ length: 77 }, () => {
    const hexColors = ['#8C4A32', '#1E4D3A', '#4A4742', '#2E3B34'];
    return hexColors[Math.floor(Math.random() * hexColors.length)];
  });

  return (
    <div className="left-panel">
      <div className="brand-logo">
        <div className="logo-icon">▲</div>
        <span className="brand-text">Scroll Sense</span>
      </div>

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
            {gridCells.map((bgColor, idx) => (
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