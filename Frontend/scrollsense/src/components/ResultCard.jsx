import React, { useState } from 'react';

const ResultCard = ({ results, onReset }) => {
  // Details dekhabo naki hide rakhbo, seta track korar jonne state
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="card">
      <h2 className="card-title">Scan Complete</h2>
      
      <div className="card-content">
        <div className="result-item positive">
          <span>Positive Impact:</span>
          <strong>{results.positive}%</strong>
        </div>
        <div className="result-item negative">
          <span>Negative Impact:</span>
          <strong>{results.negative}%</strong>
        </div>

        {/* View Details Toggle Button */}
        <button 
          className="details-toggle-btn" 
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details ▲" : "View Negative Details ▼"}
        </button>

        {/* Details Box - Shudhu tokhoni dekhabe jokhon showDetails = true */}
        {showDetails && (
          <div className="details-box">
            <h3>Negative Impact Sources</h3>
            <ul className="source-list">
              {results.negativeSources.map((source) => (
                <li key={source.id} className="source-item">
                  <div className="source-info">
                    <span className="source-name">{source.name}</span>
                    <span className="source-type">{source.type}</span>
                  </div>
                  <strong className="source-impact">-{source.impact}%</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <button className="reset-button" onClick={onReset}>
          New Scan
        </button>
      </div>
    </div>
  );
};

export default ResultCard;