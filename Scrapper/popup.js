const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY; 

document.addEventListener("DOMContentLoaded", () => {
  const authView = document.getElementById("auth-view");
  const dashboardView = document.getElementById("dashboard-view");
  const errorMsg = document.getElementById("error-msg");
  
  // New UI elements for sliding switch
  const toggleSwitch = document.getElementById("toggle-switch");
  
  const submitBtn = document.getElementById("submit-btn");
  const switchModeBtn = document.getElementById("switch-mode-btn");
  const authSubtitle = document.getElementById("auth-subtitle");

  let isLoginMode = true;

// --- Initialization ---
  chrome.storage.local.get(["supabaseToken", "scrapingEnabled", "userEmail"], (result) => {
    if (result.supabaseToken) {
      // Set the email text if it exists
      if (result.userEmail) {
        document.getElementById("user-email-display").innerText = "Signed in as: " + result.userEmail;
      }
      showDashboard();
    }
    
    toggleSwitch.checked = result.scrapingEnabled || false;
  });
  // --- Toggle Switch Listener (The Slider) ---
  toggleSwitch.addEventListener("change", () => {
    const isEnabled = toggleSwitch.checked;
    chrome.storage.local.set({ scrapingEnabled: isEnabled }, () => {
      console.log("Collection is now:", isEnabled);
    });
  });

  // --- Auth Switch Mode ---
  switchModeBtn.addEventListener("click", () => {
    isLoginMode = !isLoginMode;
    errorMsg.innerText = "";
    if (isLoginMode) {
      authSubtitle.innerText = "Login to start analyzing your feed.";
      submitBtn.innerText = "Sign In";
      switchModeBtn.innerText = "Don't have an account? Sign Up";
    } else {
      authSubtitle.innerText = "Create an account to track your feed.";
      submitBtn.innerText = "Create Account";
      switchModeBtn.innerText = "Already have an account? Log In";
    }
  });

  // --- Authentication (Login/Register) ---
  submitBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    if (!email || !password) return (errorMsg.innerText = "Please enter an email and password.");
    
    errorMsg.innerText = isLoginMode ? "Logging in..." : "Creating account...";
    const endpoint = isLoginMode ? `${SUPABASE_URL}/auth/v1/token?grant_type=password` : `${SUPABASE_URL}/auth/v1/signup`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "apikey": SUPABASE_ANON_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error_description || data.msg || "Authentication failed");

      // Success! Save token, toggle state, AND the email
      chrome.storage.local.set({ 
        supabaseToken: data.access_token, 
        scrapingEnabled: true,
        userEmail: email // <--- ADD THIS LINE
      }, () => {
        document.getElementById("user-email-display").innerText = "Signed in as: " + email;
        toggleSwitch.checked = true;
        showDashboard();
      });
    } catch (err) {
      errorMsg.innerText = err.message;
    }
  });

  // --- Logout ---
  document.getElementById("logout-btn").addEventListener("click", () => {
    chrome.storage.local.remove(["supabaseToken", "scrapingEnabled"], () => {
      authView.classList.remove("hidden");
      dashboardView.classList.add("hidden");
      document.getElementById("email").value = "";
      document.getElementById("password").value = "";
    });
  });

  function showDashboard() {
    authView.classList.add("hidden");
    dashboardView.classList.remove("hidden");
  }
});