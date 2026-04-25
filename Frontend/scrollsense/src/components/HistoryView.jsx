import React from 'react';

const HistoryView = ({ history, onViewResult }) => {
  return (
    <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
      <h2 className="card-title" style={{ marginBottom: '20px' }}>Scan History</h2>
      
      <div className="card-content" style={{ width: '100%' }}>
        {history.length === 0 ? (
          <p style={{ color: '#7B8A8B' }}>No previous scans found. Run a scan from the Dashboard!</p>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              className="result-item" 
              style={{ cursor: 'pointer', border: '1px solid #E0E0E0', backgroundColor: '#F9F9F9', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '15px' }}
              onClick={() => onViewResult(item)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#7B8A8B' }}>{item.date}</span>
                <strong style={{ fontSize: '14px', color: '#556B4A' }}>Click to view details ➔</strong>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <strong style={{ color: '#556B4A' }}>Pos: {item.positive}%</strong>
                <strong style={{ color: '#8A5A5A' }}>Neg: {item.negative}%</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;