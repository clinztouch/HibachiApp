// public/scripts/resetPassword.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('resetForm');
    const messageEl = document.getElementById('message');
  
    // Extract token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
  
    if (!token) {
      messageEl.textContent = 'Invalid reset link.';
      return;
    }
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('newPassword').value.trim();
  
      if (!password) {
        messageEl.textContent = 'Password is required.';
        return;
      }
  
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password })
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          messageEl.textContent = data.message || 'Reset failed';
          messageEl.style.color = 'red';
          return;
        }
  
        Toastify({
          text: "✅ Password reset successful!",
          duration: 4000,
          gravity: "top",
          backgroundColor: "#4CAF50"
        }).showToast();
  
        messageEl.textContent = 'Success! You can now log in.';
        messageEl.style.color = 'green';
        form.reset();
      } catch (err) {
        messageEl.textContent = 'Something went wrong.';
        messageEl.style.color = 'red';
        console.error(err);
      }
    });
  });
  