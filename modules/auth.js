import { authFetch } from './api.js';

// 🔔 Toast utility
function showToast(message, color = '#333') {
  Toastify({
    text: message,
    duration: 3000,
    close: true,
    gravity: 'top',
    position: 'right',
    style: { background: color }
  }).showToast();
}

// 🔐 Login Handler
function handleLogin(onLoginSuccess) {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = e.target.email?.value.trim();
    const password = e.target.password?.value;

    if (!email || !password) {
      showToast('Please fill in both fields', 'orange');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        showToast('Login successful!', 'green');
        onLoginSuccess();
      } else {
        showToast(data.message || 'Login failed', 'red');
      }
    } catch (err) {
      console.error('Login Error:', err);
      showToast('Network error', 'red');
    }
  });
}

// 📝 Register Handler
function handleRegister(onLoginSuccess) {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('registerEmail')?.value.trim();
    const password = document.getElementById('registerPassword')?.value;

    if (!email || !password) {
      showToast('Please fill in both fields', 'orange');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || 'Registration failed', 'red');
        return;
      }

      localStorage.setItem('token', data.token);
      showToast('Registration successful! Check your email.', 'green');
      onLoginSuccess();
    } catch (err) {
      console.error('Register Error:', err);
      showToast('Server error', 'red');
    }
  });
}

// 🔁 Resend Verification
function handleResendVerification() {
  const resendBtn = document.getElementById('resendBtn');
  const emailInput = document.getElementById('registerEmail');

  if (!resendBtn || !emailInput) return;

  resendBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) {
      showToast('Please enter your email first', 'orange');
      return;
    }

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      showToast(data.message, res.ok ? 'green' : 'red');
    } catch (err) {
      console.error('Resend Error:', err);
      showToast('Something went wrong', 'red');
    }
  });
}

// 🚪 Logout
export function logout() {
  localStorage.removeItem('token');
  window.location.reload();
}

// 📦 Init all handlers
export function initAuthHandlers(onLoginSuccess) {
  handleLogin(onLoginSuccess);
  handleRegister(onLoginSuccess);
  handleResendVerification();
}
