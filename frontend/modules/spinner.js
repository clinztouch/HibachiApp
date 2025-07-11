// frontend/modules/auth.js
import { showSpinner, hideSpinner } from './spinner.js';
import { API_BASE } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();

    const email = loginForm.email?.value.trim();
    const password = loginForm.password?.value;

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      showSpinner();

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        alert('Login successful!');
        window.location.href = '/dashboard.html'; // or wherever you want to redirect
      } else {
        alert(data.message || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong.');
    } finally {
      hideSpinner();
    }
  });
});
