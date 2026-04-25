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
    
    // Extract text and glue paragraphs together with new lines
    let fullText = Array.from(textElements)
      .map(el => el.innerText.trim())
      .filter(text => text.length > 0)
      .join('\n');
    
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
  // Debounce: Wait 1.5 seconds after the user stops scrolling before scanning
  clearTimeout(window.scrollSenseTimer);
  window.scrollSenseTimer = setTimeout(scrollSenseExtractor, 1500);
});

// Start observing the page
observer.observe(document.body, { childList: true, subtree: true });

log("%c[ScrollSense] Active & Watching Main Newsfeed...", "color: #3b5998; font-weight: bold;");