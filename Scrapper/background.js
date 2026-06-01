importScripts("config.js");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "INGEST_DATA") {

    // 1. Check storage for the Auth Token and the Toggle Switch state
    chrome.storage.local.get(['authToken', 'scrapingEnabled'], function(result) {

      // If NOT logged in OR toggle is OFF, stop here.
      if (!result.authToken || result.scrapingEnabled !== true) {
        console.log("[ScrollSense] Collection is OFF or user logged out.");
        return;
      }

      // 2. Send the post to the local ScrollSense backend for prediction + storage
      fetch(`${CONFIG.BACKEND_URL}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Attach the user's JWT so the backend authenticates the request
          'Authorization': `Bearer ${result.authToken}`
        },
        body: JSON.stringify({
          id: request.payload.id,
          text: request.payload.text
        })
      })
      .then(res => console.log("ScrollSense backend response status:", res.status))
      .catch(err => console.error("ScrollSense backend offline:", err));
    });
  }
});