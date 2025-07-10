// modules/api.js
import { isTokenExpired } from './authHelpers.js';

/**
 * Makes an authenticated fetch request with token handling and auto JSON parsing.
 * @param {string} url - API endpoint
 * @param {object} options - fetch options (method, headers, body, etc.)
 * @returns {Promise<object>} - { data, error, status }
 */
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    handleExpiredToken();
    return { data: null, error: 'Session expired', status: 401 };
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const isJSON = response.headers.get('content-type')?.includes('application/json');
    const body = isJSON ? await response.json() : await response.text();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) handleExpiredToken();
      return { data: null, error: body?.message || body || 'Request failed', status: response.status };
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
  window.location.reload(); // or redirect to login page
}
