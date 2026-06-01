// Central API client for the ScrollSense web app.
// The JWT it stores is the SAME token the backend issues to the browser
// extension — both authenticate against the same /auth endpoints and the same
// per-user account.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'scrollsense_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);
export const isAuthed = () => !!getToken();

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the ScrollSense backend. Is it running?');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    // A stale/invalid token should bounce the user back to login.
    if (res.status === 401) clearToken();
    throw new Error((data && data.detail) || `Request failed (${res.status})`);
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────
export const api = {
  signup: (email, password, name) =>
    request('/auth/signup', { method: 'POST', auth: false, body: { email, password, name } }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', auth: false, body: { email, password } }),
  me: () => request('/auth/me'),
  updateProfile: (name, email) => request('/auth/me', { method: 'PATCH', body: { name, email } }),
  changePassword: (current_password, new_password) =>
    request('/auth/change-password', { method: 'POST', body: { current_password, new_password } }),

  // ── Settings ──────────────────────────────────────────────────────────────
  getCollection: () => request('/settings/collection'),
  setCollection: (enabled) =>
    request('/settings/collection', { method: 'PUT', body: { enabled } }),

  // ── Dashboard analytics ─────────────────────────────────────────────────
  overview: (days = 7) => request(`/stats/overview?days=${days}`),
  timeline: (days = 7) => request(`/stats/timeline?days=${days}`),
  keywords: (days = 7) => request(`/stats/keywords?days=${days}`),
  heatmap: (days = 30) => request(`/stats/heatmap?days=${days}`),
  posts: (limit = 10) => request(`/posts?limit=${limit}`),

  // ── Reports ───────────────────────────────────────────────────────────────
  reportHistory: () => request('/reports/history'),
  reportSummary: (start, end) =>
    request(`/reports/summary?start=${start}&end=${end}`),
};

export default api;
