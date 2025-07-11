// modules/api.js
import { isTokenExpired } from './authHelpers.js';
import { API_BASE } from '../config.js';          // ← ADD THIS

/**
 * Auth‑aware fetch that auto‑prefixes API_BASE when you pass a relative path.
 * @param {string} urlOrPath – '/api/habits'  OR  'https://…/api/habits'
 * @param {object} options – fetch options (method, headers, body, etc.)
 * @returns {Promise<{ data:any, error:string|null, status:number }>}
 */
export async function authFetch(urlOrPath, options = {}) {
  // ▶ 1. Build the final URL
  const url = urlOrPath.startsWith('http')
    ? urlOrPath
    : `${API_BASE}${urlOrPath}`;

  // ▶ 2. Token check
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    handleExpiredToken();
    return { data: null, error: 'Session expired', status: 401 };
  }

  // ▶ 3. Headers
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });

    // ▶ 4. Parse JSON when available
    const isJSON = response.headers
      .get('content-type')
      ?.includes('application/json');
    const body = isJSON ? await response.json() : await response.text();

    // ▶ 5. Error handling
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        handleExpiredToken();
      }
      return {
        data: null,
        error: body?.message || body || 'Request failed',
        status: response.status
      };
    }

    return { data: body, error: null, status: response.status };
  } catch (err) {
    return { data: null, error: err.message || 'Fetch failed', status: 500 };
  }
}

/**
 * Clears token and reloads page on expired session.
 */
function handleExpiredToken() {
  localStorage.removeItem('token');
  alert('Session expired. Please log in again.');
  window.location.reload();
}
