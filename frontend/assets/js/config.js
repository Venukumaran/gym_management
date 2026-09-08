/* =========================================================
   IRONLOG — shared config & API helper
   ========================================================= */

// 👉 Change this to wherever your Spring Boot backend runs.
const API_BASE_URL = "http://localhost:8080";

const STORAGE_KEYS = {
  TOKEN: "ironlog_token",
  EMAIL: "ironlog_email",
  GYM_NAME: "ironlog_gym_name",
  GYM_ABOUT: "ironlog_gym_about",
};

const Auth = {
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },
  setSession(token, email) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.EMAIL, email);
  },
  getEmail() {
    return localStorage.getItem(STORAGE_KEYS.EMAIL) || "";
  },
  clear() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EMAIL);
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = "index.html";
    }
  },
  redirectIfLoggedIn() {
    if (this.isLoggedIn()) {
      window.location.href = "dashboard.html";
    }
  },
  logout() {
    this.clear();
    window.location.href = "index.html";
  },
};

/**
 * Wrapper around fetch() that:
 *  - prefixes API_BASE_URL
 *  - attaches the Bearer token (if present)
 *  - throws a readable Error on non-2xx responses
 *  - auto-logs-out on 401/403 (expired / invalid token)
 */
async function apiFetch(path, options = {}) {
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {}
  );

  const token = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    throw new Error(
      "Could not reach the server. Check that the backend is running and CORS is configured."
    );
  }

  if (response.status === 401 || response.status === 403) {
    Auth.clear();
    if (!location.pathname.endsWith("index.html") && location.pathname !== "/") {
      window.location.href = "index.html?expired=1";
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (response.status === 204) return null;

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (body && (body.message || body.error)) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return body;
}

// Deterministic, fun avatar for the logged-in owner — seeded by email
// so the same owner always sees the same avatar. No account data leaves
// the browser other than this seed.
function ownerAvatarUrl(seed) {
  const s = encodeURIComponent(seed || "owner");
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${s}&backgroundColor=23282e`;
}
