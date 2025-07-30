// scripts/resetPassword.js
import { API_BASE } from '../modules/config.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resetForm');
  const messageEl = document.getElementById('message');

  // Extract token from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    messageEl.textContent = 'Invalid or missing reset token.';
    messageEl.style.color = 'red';
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('newPassword').value.trim();

    if (!password) {
      messageEl.textContent = 'Password is required.';
      messageEl.style.color = 'red';
      return;
    }

    try {
      form.querySelector('button').disabled = true;

      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (!res.ok) {
        messageEl.textContent = data.message || 'Reset failed.';
        messageEl.style.color = 'red';
        return;
      }
      if (password.length < 8) {
        messageEl.textContent = 'Password must be at least 8 characters.';
        messageEl.style.color = 'red';
        return;
      }      

      Toastify({
        text: "✅ Password reset successful!",
        duration: 4000,
        gravity: "top",
        position: "right",
        backgroundColor: "#4CAF50",
      }).showToast();

      messageEl.textContent = 'Success! You can now log in.';
      messageEl.style.color = 'green';
      form.reset();

      // Optional: redirect to login after a delay
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);

    } catch (err) {
      messageEl.textContent = 'Something went wrong.';
      messageEl.style.color = 'red';
      console.error('Reset error:', err);
    } finally {
      form.querySelector('button').disabled = false;
    }
  });

if (!res.ok) {
  const errorMsg = data?.message || 'Reset failed.';
  Toastify({
    text: `❌ ${errorMsg}`,
    duration: 4000,
    gravity: "top",
    position: "right",
    backgroundColor: "#e74c3c",
  }).showToast();

  messageEl.textContent = errorMsg;
  messageEl.style.color = 'red';
  return;
}
if (data.message && data.message.toLowerCase().includes('expired')) {
  messageEl.innerHTML = 'Reset link expired. <a href="/forgot-password">Request a new one</a>.';
}
});
