// Central API client for the ScrollSense web app.
// The JWT it stores is the SAME token the backend issues to the browser
// extension — both authenticate against the same /auth endpoints and the same
// per-user account.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'scrollsense_token';
const MOCK = import.meta.env.VITE_MOCK === 'true';

export const getToken  = MOCK ? () => 'mock-token'                    : () => localStorage.getItem(TOKEN_KEY);
export const setToken  = MOCK ? () => {}                               : (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken= MOCK ? () => {}                               : () => localStorage.removeItem(TOKEN_KEY);
export const isAuthed  = MOCK ? () => true                             : () => !!getToken();

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

// ── Mock API (used when VITE_MOCK=true) ───────────────────────────────────
const mockApi = {
  signup:  () => Promise.resolve({ token: 'mock-token' }),
  login:   () => Promise.resolve({ token: 'mock-token' }),
  me:      () => Promise.resolve({ id: 1, name: 'Demo User', email: 'demo@scrollsense.app' }),
  updateProfile: (name, email) => Promise.resolve({ id: 1, name, email }),
  changePassword: () => Promise.resolve({ ok: true }),

  getCollection: () => Promise.resolve({ enabled: true }),
  setCollection: (enabled) => Promise.resolve({ enabled }),

  overview: (days = 7) => Promise.resolve({
    today_positivity_pct: 73,
    posts_analyzed: 428,
    most_active_hour: '8 PM',
    negative_pct: 27,
    bright_streak_days: 12,
    delta_vs_yesterday: 5,
    days,
  }),
  timeline: (days = 7) => Promise.resolve(
    Array.from({ length: days }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      const total = 40 + Math.round(Math.sin(i) * 15 + Math.random() * 20);
      const positive = Math.round(total * (0.6 + Math.sin(i * 0.7) * 0.15));
      return { date: d.toISOString().slice(0, 10), positive, negative: total - positive, total, positivity_pct: Math.round((positive / total) * 100) };
    })
  ),
  keywords: () => Promise.resolve([
    { word: 'family',   count: 42, sentiment: 'positive' },
    { word: 'friends',  count: 38, sentiment: 'positive' },
    { word: 'weekend',  count: 31, sentiment: 'positive' },
    { word: 'birthday', count: 27, sentiment: 'positive' },
    { word: 'food',     count: 24, sentiment: 'positive' },
    { word: 'travel',   count: 21, sentiment: 'positive' },
    { word: 'tired',    count: 19, sentiment: 'negative' },
    { word: 'work',     count: 18, sentiment: 'negative' },
    { word: 'traffic',  count: 16, sentiment: 'negative' },
    { word: 'coffee',   count: 14, sentiment: 'positive' },
  ]),
  heatmap: () => Promise.resolve(
    Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, (_, hr) => {
        const peak = hr >= 18 && hr <= 22;
        const low  = hr >= 1  && hr <= 6;
        return low ? 0 : peak ? (2 + Math.round(Math.random() * 2)) : Math.round(Math.random() * 2);
      })
    )
  ),
  posts: (limit = 10) => Promise.resolve([
    { id: 1,  text: 'Amazing sunset today — feeling so grateful for moments like this!',     sentiment: 'positive', confidence: 0.96, created_at: new Date(Date.now() -  1*3600000).toISOString() },
    { id: 2,  text: 'Why is traffic always the worst on Fridays? Took 2 hours to get home.', sentiment: 'negative', confidence: 0.88, created_at: new Date(Date.now() -  3*3600000).toISOString() },
    { id: 3,  text: 'Had the best birthday dinner with family. So much love in one room!',   sentiment: 'positive', confidence: 0.97, created_at: new Date(Date.now() -  6*3600000).toISOString() },
    { id: 4,  text: 'Absolutely exhausted after this week. Need a proper rest.',              sentiment: 'negative', confidence: 0.82, created_at: new Date(Date.now() - 10*3600000).toISOString() },
    { id: 5,  text: 'Coffee with an old friend — some friendships just never fade.',          sentiment: 'positive', confidence: 0.93, created_at: new Date(Date.now() - 14*3600000).toISOString() },
    { id: 6,  text: 'Weekend trip to the hills was exactly what I needed. Recharged!',       sentiment: 'positive', confidence: 0.91, created_at: new Date(Date.now() - 20*3600000).toISOString() },
    { id: 7,  text: 'Disappointed with the service at the restaurant today.',                 sentiment: 'negative', confidence: 0.79, created_at: new Date(Date.now() - 26*3600000).toISOString() },
    { id: 8,  text: 'Watched the kids play in the park all afternoon. Pure joy.',             sentiment: 'positive', confidence: 0.95, created_at: new Date(Date.now() - 32*3600000).toISOString() },
    { id: 9,  text: 'Meeting after meeting with nothing resolved. So draining.',              sentiment: 'negative', confidence: 0.85, created_at: new Date(Date.now() - 40*3600000).toISOString() },
    { id: 10, text: 'Made homemade pasta for the first time. Came out perfect!',              sentiment: 'positive', confidence: 0.92, created_at: new Date(Date.now() - 48*3600000).toISOString() },
  ].slice(0, limit)),
  reportHistory: () => Promise.resolve([
    { start: '2026-06-01', end: '2026-06-14', total_posts: 203, positivity_pct: 71, top_keyword: 'family' },
    { start: '2026-05-18', end: '2026-05-31', total_posts: 178, positivity_pct: 68, top_keyword: 'weekend' },
    { start: '2026-05-04', end: '2026-05-17', total_posts: 225, positivity_pct: 75, top_keyword: 'friends' },
    { start: '2026-04-20', end: '2026-05-03', total_posts: 190, positivity_pct: 66, top_keyword: 'travel' },
  ]),
  reportSummary: () => Promise.resolve({ total_posts: 156, avg_sentiment_pct: 68, top_keyword: 'family', bright_days: 8, heavy_days: 2 }),
};

// ── Auth ──────────────────────────────────────────────────────────────────
export const api = MOCK ? mockApi : {
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
