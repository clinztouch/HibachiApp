// Automatically switches between local and production
export const API_BASE =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://hibachiapp.onrender.com';
