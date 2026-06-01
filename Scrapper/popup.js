const BACKEND_URL = CONFIG.BACKEND_URL;

// ── Server-side collection flag helpers ──────────────────────────────────────
// The collection switch is stored per-user in the backend, so it stays in sync
// with the web app's Settings page. chrome.storage keeps a local cache that the
// content/background scripts read on every scroll.
async function fetchCollectionFromServer(token) {
  const res = await fetch(`${BACKEND_URL}/settings/collection`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Could not read collection setting");
  const data = await res.json();
  return !!data.enabled;
}

async function pushCollectionToServer(token, enabled) {
  await fetch(`${BACKEND_URL}/settings/collection`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ enabled }),
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const authView = document.getElementById("auth-view");
  const dashboardView = document.getElementById("dashboard-view");
  const errorMsg = document.getElementById("error-msg");
  const toggleSwitch = document.getElementById("toggle-switch");
  const submitBtn = document.getElementById("submit-btn");
  const switchModeBtn = document.getElementById("switch-mode-btn");
  const authSubtitle = document.getElementById("auth-subtitle");

  let isLoginMode = true;

  // --- Initialization ---
  chrome.storage.local.get(["authToken", "scrapingEnabled", "userEmail"], (result) => {
    if (result.authToken) {
      if (result.userEmail) {
        document.getElementById("user-email-display").innerText = "Signed in as: " + result.userEmail;
      }
      showDashboard();

      // Sync the toggle from the server so the extension and web app agree.
      toggleSwitch.checked = result.scrapingEnabled || false;
      fetchCollectionFromServer(result.authToken)
        .then((enabled) => {
          toggleSwitch.checked = enabled;
          chrome.storage.local.set({ scrapingEnabled: enabled });
        })
        .catch(() => { /* offline — keep local cache */ });
    } else {
      toggleSwitch.checked = result.scrapingEnabled || false;
    }
  });

  // --- Toggle Switch Listener (writes to server + local cache) ---
  toggleSwitch.addEventListener("change", () => {
    const isEnabled = toggleSwitch.checked;
    chrome.storage.local.set({ scrapingEnabled: isEnabled });
    chrome.storage.local.get(["authToken"], (result) => {
      if (result.authToken) {
        pushCollectionToServer(result.authToken, isEnabled).catch(() => {
          console.warn("[ScrollSense] Could not save collection setting to server.");
        });
      }
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
    const endpoint = isLoginMode ? `${BACKEND_URL}/auth/login` : `${BACKEND_URL}/auth/signup`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Authentication failed");

      // Read the user's current server-side collection preference (defaults to on).
      let enabled = true;
      try {
        enabled = await fetchCollectionFromServer(data.access_token);
      } catch { /* offline — fall back to on */ }

      chrome.storage.local.set(
        { authToken: data.access_token, scrapingEnabled: enabled, userEmail: email },
        () => {
          document.getElementById("user-email-display").innerText = "Signed in as: " + email;
          toggleSwitch.checked = enabled;
          showDashboard();
        }
      );
    } catch (err) {
      errorMsg.innerText = err.message;
    }
  });

  // --- Logout ---
  document.getElementById("logout-btn").addEventListener("click", () => {
    chrome.storage.local.remove(["authToken", "scrapingEnabled", "userEmail"], () => {
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
