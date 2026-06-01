/**
 * ScrollSense - Content Script
 * Features: Groups paragraphs, ignores Messenger/Popups, waits for "See more", prevents DevTools crashes.
 */

// 1. THE DEBUG TOGGLE
// Set this to false when you aren't actively developing to save your RAM
const DEBUG_MODE = true; 

// Custom logger that only prints when debugging
const log = (message, style = "", data = "") => {
  if (DEBUG_MODE) {
    console.log(message, style, data);
  }
};

const processedPosts = new Map();

const scrollSenseExtractor = () => {
  // 2. URL GUARD
  // If the user navigates directly to the messages page, stop executing
  if (window.location.pathname.startsWith('/messages')) return; 

  // 3. MAIN FEED FILTER
  // Target only the main timeline column to completely ignore chat popups
  const mainFeedArea = document.querySelector('div[role="main"]');
  if (!mainFeedArea) return;

  // Target ENTIRE POST containers inside the main feed only
  const postContainers = mainFeedArea.querySelectorAll('div[role="article"]');

  postContainers.forEach((postContainer) => {
// 4. PARAGRAPH STITCHING
    // Find all text blocks inside this specific post
    const textElements = postContainer.querySelectorAll('div[dir="auto"]');
    
    let paragraphs = [];
    textElements.forEach(el => {
      // THE FIX: If this div contains another div[dir="auto"], skip it. 
      // This ensures we only grab the deepest inner text and avoid parent duplicates.
      if (!el.querySelector('div[dir="auto"]')) {
        let text = el.innerText.trim();
        if (text.length > 0) paragraphs.push(text);
      }
    });
    
    // Bonus Fix: Remove any exact duplicate lines just in case FB rendered it twice
    let uniqueParagraphs = [...new Set(paragraphs)];
    let fullText = uniqueParagraphs.join('\n');
    
    // Ignore short UI elements
    if (fullText.length < 45) return;

    // 5. TRUNCATION GUARD
    // If the post isn't fully expanded, ignore it and wait for the user to click "See more"
    const isTruncated = fullText.includes("… See more") || fullText.includes("... See more") || fullText.endsWith("…");
    if (isTruncated) return; 

    // Create the Unique ID (Fingerprint) from the first 50 chars of the combined text
    const postKey = fullText.substring(0, 50);
    const existingLength = processedPosts.get(postKey) || 0;

    /**
     * UPSERT LOGIC
     */
    if (fullText.length > existingLength) {
      processedPosts.set(postKey, fullText.length);

      log("%c[ScrollSense] Full Post Captured:", 'color: #00ff00; font-weight: bold;', fullText.substring(0, 60) + "...");

      // 6. CONTEXT GUARD
      // Check if the extension context is still valid before sending to prevent crash errors
      if (chrome.runtime?.id) {
        chrome.runtime.sendMessage({
          action: "INGEST_DATA",
          payload: {
            id: postKey,
            text: fullText
          }
        });
      }
    }
  });
};

// MutationObserver: Watch for Facebook's infinite scroll / DOM changes
const observer = new MutationObserver(() => {
  // 1. Debounce FIRST. Reset the timer every time a tiny change happens.
  clearTimeout(window.scrollSenseTimer);
  
  // 2. Wait 1.5 seconds after the user completely stops scrolling
  window.scrollSenseTimer = setTimeout(() => {
    
    // 3. ONLY check storage once the scrolling has stopped
    chrome.storage.local.get(['authToken', 'scrapingEnabled'], function(result) {
      // If logged out or switched off, abort.
      if (!result.authToken || !result.scrapingEnabled) {
        log("Scraping is paused or user is logged out.");
        return;
      }
      
      // If we are good to go, run the heavy extractor function
      scrollSenseExtractor();
    });
    
  }, 1500);
});

observer.observe(document.body, { childList: true, subtree: true });
log("%c[ScrollSense] Active & Watching Main Newsfeed...", "color: #3b5998; font-weight: bold;");