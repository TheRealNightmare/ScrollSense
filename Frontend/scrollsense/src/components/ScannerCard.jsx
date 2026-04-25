import React from 'react';

const ScannerCard = ({ onScan, isScanning }) => {
  return (
    <div className="card">
      <h1 className="card-title">Feed Sentiment Analyzer</h1>
      <div className="card-content">
        {!isScanning ? (
          <button className="round-button" onClick={onScan}>
            GO
          </button>
        ) : (
          <div className="scanning-text">
            <p>Scanning feed data...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerCard;