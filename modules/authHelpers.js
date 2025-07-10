
// modules/authHelpers.js

export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const [, payloadBase64] = token.split('.');
    const payload = JSON.parse(atob(payloadBase64));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  } catch (err) {
    console.error('Invalid token:', err);
    return true;
  }
}

export function initTokenWatcher() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const [, payloadBase64] = token.split('.');
    const payload = JSON.parse(atob(payloadBase64));

    const expiresInMs = payload.exp * 1000 - Date.now();
    if (expiresInMs <= 0) {
      handleExpiry();
      return;
    }

    // Auto-logout timer
    setTimeout(handleExpiry, expiresInMs - 100); // buffer of 100ms

  } catch (err) {
    console.error('Failed to parse token:', err);
    handleExpiry();
  }

  function handleExpiry() {
    localStorage.removeItem('token');

    //  Show a message or redirect
    alert('Your session has expired. Please log in again.');

    // Redirect or reload to show login
    window.location.reload();
  }
}
