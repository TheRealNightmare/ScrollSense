/**
 * ScrollSense - Content Script
 * Approach: Passive Observation (High Safety)
 */

// We use a Map to store the length of the longest version of a post we've sent.
// Key: A snippet of the first 50 chars (Unique ID). Value: Length of the text.
const processedPosts = new Map();

const scrollSenseExtractor = () => {
  // Facebook's post text usually lives in divs with dir="auto"
  const postElements = document.querySelectorAll('div[dir="auto"]');

  postElements.forEach((el) => {
    const fullText = el.innerText.trim();
    
    // Ignore short UI elements like "Like", "Share", or timestamps
    if (fullText.length < 45) return;

    // Create a unique key (ID) for this post based on the start of the text
    const postKey = fullText.substring(0, 50);
    const existingLength = processedPosts.get(postKey) || 0;

    /**
     * UPSERT FRONTEND LOGIC: 
     * 1. If we've never seen this post (length 0), send it.
     * 2. If we HAVE seen it, but now the text is LONGER (e.g., user manually clicked 'See More'),
     * send it again to update the backend database with the full version.
     */
    if (fullText.length > existingLength) {
      processedPosts.set(postKey, fullText.length);

      console.log(`%c[ScrollSense] ${existingLength === 0 ? 'New Post' : 'Expanded Post'}:`, 
                  'color: #00ff00; font-weight: bold;', 
                  fullText.substring(0, 60) + "...");

      // Send the payload (ID + Text) to background.js
      chrome.runtime.sendMessage({
        action: "INGEST_DATA",
        payload: {
          id: postKey,
          text: fullText
        }
      });
    }
  });
};

// MutationObserver: Watch for Facebook's infinite scroll / DOM changes
const observer = new MutationObserver(() => {
  // Debounce: Wait 1.5 seconds after the user stops scrolling to scan
  clearTimeout(window.scrollSenseTimer);
  window.scrollSenseTimer = setTimeout(scrollSenseExtractor, 1500);
});

// Start observing the page
observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log("%c[ScrollSense] Active & Watching Newsfeed Safely...", "color: #3b5998; font-size: 14px; font-weight: bold;");