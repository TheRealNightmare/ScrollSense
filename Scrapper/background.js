chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INGEST_DATA") {
    
    // The secure bridge to your Python server
    fetch('http://127.0.0.1:8000/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      
      // THE FIX: Properly format the JSON to match your Python BaseModel
      body: JSON.stringify({ 
        id: request.payload.id,
        text: request.payload.text 
      })
    })
    .then(response => console.log("Backend response status:", response.status))
    .catch(err => console.error("FastAPI is likely offline:", err));
  }
});