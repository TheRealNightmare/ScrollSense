import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ScannerCard from './components/ScannerCard';
import ResultCard from './components/ResultCard';
import HistoryView from './components/HistoryView'; // Notun file ta ekhane import kora hoyeche
import './App.css';

function App() {
  
  const [view, setView] = useState('dashboard'); 
  
  const [history, setHistory] = useState([]); 
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  const startScan = () => {
    setIsScanning(true);
    setCurrentResult(null); 

    
    setTimeout(() => {
      setIsScanning(false);
      
      const newResult = {
        id: Date.now(), 
        date: new Date().toLocaleString(), 
        positive: 80,
        negative: 20,
        negativeSources: [
          { id: 1, name: "Local Crime News", type: "Page", impact: 12 },
          { id: 2, name: "Political Debate Group", type: "Group", impact: 5 },
          { id: 3, name: "John Doe", type: "Person", impact: 3 }
        ]
      };
      
      setCurrentResult(newResult);
     
      setHistory((prevHistory) => [newResult, ...prevHistory]); 
    }, 3000);
  };

 
  const handleReset = () => {
    setCurrentResult(null);
  };

  
  const handleViewHistoryResult = (resultItem) => {
    setCurrentResult(resultItem); 
    setView('dashboard'); 
  };

  return (
    <div className="dashboard-container">
     
      <Sidebar currentView={view} onViewChange={setView} />
      
      <main className="main-content">
        
        {/* JODI VIEW DASHBOARD HOY */}
        {view === 'dashboard' && (
          !currentResult ? (
            <ScannerCard onScan={startScan} isScanning={isScanning} />
          ) : (
            <ResultCard results={currentResult} onReset={handleReset} />
          )
        )}

    
        {view === 'history' && (
          <HistoryView history={history} onViewResult={handleViewHistoryResult} />
        )}
        
      </main>
    </div>
  );
}

export default App;