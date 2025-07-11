// frontend/modules/auth.js
import { showSpinner, hideSpinner } from './spinner.js';
import { API_BASE } from './config.js';
import { isTokenExpired } from './authHelpers.js';

// Toast helper
function showToast(msg, color = '#444') {
  Toastify({
    text: msg,
    duration: 3000,
    gravity: 'top',
    position: 'right',
    style: { background: color },
  }).showToast();
}

// Handles login logic
export function initLoginHandler() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();

    const email = e.target.email?.value.trim();
    const password = e.target.password?.value;

    if (!email || !password) {
      showToast('Please fill in both fields', 'orange');
      return;
    }

    try {
      showSpinner();

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      hideSpinner();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        showToast('Login successful!', 'green');
        window.location.href = '/dashboard.html';
      } else {
        showToast(data.message || 'Login failed', 'red');
      }
    } catch (err) {
      hideSpinner();
      console.error('Login error:', err);
      showToast('Something went wrong', 'red');
    }
  });
}

// App auth logic – show/hide sections based on token
export function initAuthHandlers(fetchHabitsCallback) {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authSection').style.display = 'block';
    return;
  }

  document.getElementById('mainApp').style.display = 'block';
  document.getElementById('authSection').style.display = 'none';

  if (typeof fetchHabitsCallback === 'function') {
    fetchHabitsCallback();
  }

  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.addEventListener('click', logout);
}

// Logout utility
export function logout() {
  localStorage.removeItem('token');
  location.reload();
}
