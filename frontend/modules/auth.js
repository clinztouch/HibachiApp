
import { authFetch } from './api.js';
import { showSpinner, hideSpinner } from './spinner.js';

// ---------------- Toast Helper ----------------
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

// ---------------- Utility ----------------
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) {
  return emailRegex.test(email);
}

function setBtnBusy(btn, busy, idleText, busyText) {
  if (!btn) return;
  btn.disabled = busy;
  btn.textContent = busy ? busyText : idleText;
}

// ---------------- Login ----------------
function handleLogin(onSuccess) {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const passwordInput = form.querySelector('input[type="password"]');
  const toggleBtn = document.getElementById('toggleLoginPassword');
  togglePasswordVisibility(toggleBtn, passwordInput);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      showToast('Please fill in both fields', 'orange');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('Invalid email format', 'orange');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    setBtnBusy(submitBtn, true, 'Login', 'Logging in…');
    showSpinner();

    const { data, error, status } = await authFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    hideSpinner();
    setBtnBusy(submitBtn, false, 'Login', 'Logging in…');

    if (status === 200) {
      localStorage.setItem('token', data.token);
      showToast('Login successful!', 'green');
      window.location.href = '/dashboard.html'; // auto‑redirect
      onSuccess?.();
    } else {
      showToast(error || 'Login failed', 'red');
    }
  });
}

// ---------------- Register ----------------
function handleRegister(onSuccess) {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const passwordInput = form.querySelector('input[type="password"]');
  const toggleBtn = document.getElementById('toggleRegisterPassword');
  togglePasswordVisibility(toggleBtn, passwordInput);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail')?.value.trim();
    const password = passwordInput?.value;

    if (!email || !password) {
      showToast('Please fill in both fields', 'orange');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('Invalid email format', 'orange');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    setBtnBusy(submitBtn, true, 'Sign Up', 'Signing up…');
    showSpinner();

    const { data, error, status } = await authFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    hideSpinner();
    setBtnBusy(submitBtn, false, 'Sign Up', 'Signing up…');

    if (status === 200) {
      localStorage.setItem('token', data.token);
      showToast('Registration successful! Check your email.', 'green');
      onSuccess?.();
    } else {
      showToast(error || 'Registration failed', 'red');
    }
  });
}

// ---------------- Resend Verification ----------------
function handleResendVerification() {
  const btn = document.getElementById('resendBtn');
  const emailInput = document.getElementById('registerEmail');
  if (!btn || !emailInput) return;

  btn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) {
      showToast('Please enter your email first', 'orange');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('Invalid email format', 'orange');
      return;
    }
    setBtnBusy(btn, true, 'Resend', 'Sending…');
    showSpinner();

    const { data, error, status } = await authFetch('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    hideSpinner();
    setBtnBusy(btn, false, 'Resend', 'Sending…');
    showToast(data?.message || error || 'Request finished', status === 200 ? 'green' : 'red');
  });
}

// ---------------- Password Visibility ----------------
function togglePasswordVisibility(toggleBtn, pwdInput) {
  if (!toggleBtn || !pwdInput) return;
  toggleBtn.addEventListener('click', () => {
    const hidden = pwdInput.type === 'password';
    pwdInput.type = hidden ? 'text' : 'password';
    toggleBtn.textContent = hidden ? '🙈' : '👁️';
  });
}

// ---------------- Logout ----------------
export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/';
}

// ---------------- Initialiser ----------------
export function initAuthHandlers(onLoginSuccess) {
  handleLogin(onLoginSuccess);
  handleRegister(onLoginSuccess);
  handleResendVerification();
}
