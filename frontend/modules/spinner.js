// frontend/modules/auth.js
import { showSpinner, hideSpinner } from './spinner.js';
import { API_BASE } from './config.js';

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    showSpinner();
    const res = await fetch(`${API_BASE}/api/auth/login`, { … });
    // handle response …
  } finally {
    hideSpinner();
  }
});
