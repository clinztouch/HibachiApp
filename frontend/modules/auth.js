// frontend/modules/auth.js
import { showSpinner, hideSpinner } from './spinner.js';
import { API_BASE } from './config.js';

// Get the form element
const loginForm = document.getElementById('loginForm');

// Optional: toast helper (if Toastify is included globally)
function showToast(msg, color = '#444') {
  Toastify({
    text: msg,
    duration: 3000,
    gravity: 'top',
    position: 'right',
    style: { background: color },
  }).showToast();
}

if (loginForm) {
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
