chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INGEST_DATA") {
    
    // 1. Check storage for the Auth Token and the Toggle Switch state
    chrome.storage.local.get(['supabaseToken', 'scrapingEnabled'], function(result) {
      
      // If NOT logged in OR toggle is OFF, stop here.
      if (!result.supabaseToken || result.scrapingEnabled !== true) {
        console.log("[ScrollSense] Collection is OFF or user logged out.");
        return;
      }

      // 2. Bridge to the LIVE server on Render
      fetch('https://scrollsense.onrender.com/ingest', { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // CRITICAL: Attach the user's token so the backend accepts it
          'Authorization': `Bearer ${result.supabaseToken}` 
        },
        body: JSON.stringify({ 
          id: request.payload.id, 
          text: request.payload.text 
        })
      })
      .then(res => console.log("Render Backend response status:", res.status))
      .catch(err => console.error("Render Backend offline:", err));
    });
  }
});