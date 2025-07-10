function toggleAuthUI() {
  const token = localStorage.getItem('token');
  const loginForm = document.getElementById('loginForm');
  const mainApp = document.getElementById('mainApp');

  if (token) {
    loginForm?.classList.add('hidden');
    mainApp?.classList.remove('hidden');
  } else {
    loginForm?.classList.remove('hidden');
    mainApp?.classList.add('hidden');
  }
}
