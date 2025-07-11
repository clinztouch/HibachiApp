import { isTokenExpired } from './authHelpers.js';
import { API_BASE } from './config.js';

/**
 * Performs an authenticated fetch request.
 * Automatically appends the API base URL and handles token expiry.
 *
 * @param {string} urlOrPath - Relative path (e.g., "/api/habits") or full URL
 * @param {object} options - fetch options (method, headers, body, etc.)
 * @returns {Promise<{ data: any, error: string | null, status: number }>}
 */
export async function authFetch(urlOrPath, options = {}) {
  const url = urlOrPath.startsWith('http') ? urlOrPath : `${API_BASE}${urlOrPath}`;

  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    return handleExpiredSession();
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const contentType = res.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const body = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      if ([401, 403].includes(res.status)) handleExpiredToken();
      return {
        data: null,
        error: body?.message || body || 'Request failed',
        status: res.status
      };
    }

    return { data: body, error: null, status: res.status };
  } catch (err) {
    return {
      data: null,
      error: err.message || 'Network error',
      status: 500
    };
  }
}

/**
 * Handles session expiration: removes token and refreshes the page.
 * @returns error response to caller
 */
function handleExpiredSession() {
  localStorage.removeItem('token');
  alert('Session expired. Please log in again.');
  window.location.reload();
  return { data: null, error: 'Session expired', status: 401 };
}
