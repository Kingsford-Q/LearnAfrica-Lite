const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5080';
const TOKEN_KEY = 'la_access_token';

let accessToken = sessionStorage.getItem(TOKEN_KEY) || null;
let refreshPromise = null;

export function setAccessToken(token) {
  accessToken = token;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function doFetch(path, options) {
  const headers = new Headers(options.headers || {});
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include', // sends the httpOnly refresh-token cookie
  });
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = doFetch('/api/auth/refresh', { method: 'POST' })
      .then(async (res) => {
        if (!res.ok) {
          setAccessToken(null);
          // Lets AuthContext know the session is definitively gone (refresh-token
          // cookie missing/expired) so it can clear stale "logged in" UI state.
          // Harmless no-op for visitors who were never authenticated in the first
          // place — AuthContext only acts on this if it currently has a user.
          window.dispatchEvent(new Event('auth:session-expired'));
          return null;
        }
        const data = await res.json();
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(path, options = {}) {
  let res = await doFetch(path, options);

  if (res.status === 401 && path !== '/api/auth/refresh' && path !== '/api/auth/login' && path !== '/api/auth/login/2fa') {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(path, options);
    }
  }

  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch {
      // no JSON body
    }
    throw new ApiError(res.status, body?.message || res.statusText, body);
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  put: (path, body) => request(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData }),
};

export function fileUrl(relativeUrl) {
  if (!relativeUrl) return relativeUrl;
  // Already-absolute URLs (http/https) and inline data/blob URIs (e.g. avatars
  // uploaded as base64) must be returned as-is — prefixing them with BASE_URL
  // would produce an invalid, unloadable src.
  if (/^(https?:|data:|blob:)/.test(relativeUrl)) return relativeUrl;
  return `${BASE_URL}${relativeUrl}`;
}
