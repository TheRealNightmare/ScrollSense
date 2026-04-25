chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INGEST_DATA") {
    
    // Bridge to the server
    fetch('https://scrollsense.onrender.com/ingest', {
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