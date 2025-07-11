// hibachiApp.js

import { logout, initAuthHandlers } from './modules/auth.js';
import { fetchHabits, markHabitDone, unmarkHabitDone } from './modules/habits.js';
import { renderChartForHabit, renderStreakChartForHabit } from './modules/chart.js';
import { openEditModal, closeEditModal, submitEditForm } from './modules/modal.js';
import { toggleDarkMode, applySavedTheme } from './modules/theme.js';
import { isTokenExpired } from './modules/authHelpers.js';
import { showSpinner, hideSpinner } from './modules/utils.js';


// ✅ Set base API URL for dev vs production
const BASE_API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://hibachiapp.onrender.com';

// Exported stateful variables
export let currentEditingHabitId = null;
export let lastFocusedElement = null;
export let trap = null;

// Toast helper
function showToast(message, success = true) {
  Toastify({
    text: message,
    duration: 3000,
    style: {
      background: success ? '#4CAF50' : '#f44336',
    }
  }).showToast();
}

export function onHabitChange() {
  const habitId = document.getElementById('habitSelect')?.value;
  const habit = window.allHabits?.find(h => h._id === habitId);

  if (habit) {
    renderChartForHabit(habit);
    renderStreakChartForHabit(habit);
  } else {
    window.habitChart?.destroy();
    window.streakChart?.destroy();
  }
}

function setupEventListeners() {
  document.getElementById('editHabitForm')?.addEventListener('submit', submitEditForm);
  document.getElementById('cancelEdit')?.addEventListener('click', closeEditModal);
  document.getElementById('habitSelect')?.addEventListener('change', onHabitChange);
  document.getElementById('dateRange')?.addEventListener('change', onHabitChange);
  document.getElementById('habitList')?.addEventListener('click', onHabitListClick);
  document.getElementById('habitList')?.addEventListener('change', onHabitCheckboxChange);
  document.getElementById('toggleDarkModeBtn')?.addEventListener('click', toggleDarkMode);
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
}

async function onHabitCheckboxChange(e) {
  if (!e.target.classList.contains('complete-toggle')) return;

  const habitId = e.target.dataset.id;
  const completed = e.target.checked;
  const today = new Date().toISOString().split('T')[0];
  const token = localStorage.getItem('token');

  try {
    if (completed) {
      await markHabitDone(habitId, today, token);
      showToast('Streak updated!');
    } else {
      await unmarkHabitDone(habitId, today, token);
    }

    await fetchHabits();
    onHabitChange();
  } catch (err) {
    showToast('Error updating streak', false);
    console.error('Failed to update habit streak:', err);
  }
}

function onHabitListClick(e) {
  if (e.target.classList.contains('edit-habit-btn')) {
    openEditModal(e);
  } else if (e.target.classList.contains('delete-habit-btn')) {
    const confirmed = confirm('Are you sure you want to delete this habit?');
    if (!confirmed) return;

    const habitId = e.target.dataset.id;
    const token = localStorage.getItem('token');

    fetch(`${BASE_API_URL}/api/habits/${habitId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(() => fetchHabits())
      .catch(err => showToast('Failed to delete habit', false));
  }
}

async function initializeApp() {
  applySavedTheme();
  setupEventListeners();
  initAuthHandlers(fetchHabits);

  const token = localStorage.getItem('token');
  const spinner = document.getElementById('spinner');

  if (token && !isTokenExpired(token)) {
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('authSection').style.display = 'none';
    spinner.style.display = 'block';

    try {
      await fetchHabits();
    } finally {
      spinner.style.display = 'none';
    }
  } else {
    localStorage.removeItem('token');
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('authSection').style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();

  // Habit Form Submit
  document.getElementById('habitForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = e.target.title.value.trim();
    const goal = e.target.description.value.trim();
    const token = localStorage.getItem('token');
    const spinner = document.getElementById('spinner');

    if (!title || !goal) {
      showToast('Please fill in both title and goal.', false);
      return;
    }

    spinner.style.display = 'block';

    try {
      const res = await fetch(`${BASE_API_URL}/api/habits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, goal })
      });

      const data = await res.json();

      if (res.ok) {
        showToast('New habit added!');
        await fetchHabits();
        e.target.reset();
      } else {
        showToast(data.message || 'Error creating habit.', false);
      }
    } catch (err) {
      showToast('Something went wrong', false);
      console.error(err);
    } finally {
      spinner.style.display = 'none';
    }
  });

  // Register Form Submit
  document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    showSpinner();

    const username = e.target.username.value.trim();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const messageEl = document.getElementById('registerMessage');

    if (messageEl) {
      messageEl.textContent = 'Creating account...';
      messageEl.style.color = 'black';
    }

    try {
      const res = await fetch(`${BASE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        messageEl.textContent = data.message || 'Registration failed';
        messageEl.style.color = 'red';
        return;
      }

      messageEl.textContent = '✅ Please check your email to verify your account before logging in.';
      messageEl.style.color = 'green';
      e.target.reset();
    } catch (err) {
      messageEl.textContent = 'Server error. Please try again.';
      messageEl.style.color = 'red';
    } finally {
      hideSpinner();
    }
  });

  // Resend Verification
  document.getElementById('resendBtn')?.addEventListener('click', async () => {
    const email = prompt('Enter your email to resend verification:');
    if (!email) return;

    try {
      const res = await fetch(`${BASE_API_URL}/api/auth/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      showToast(data.message || 'Check your email', res.ok);
    } catch (err) {
      showToast('Failed to resend verification. Try again later.', false);
      console.error(err);
    }
  });

  // Theme toggle
  const themeBtn = document.getElementById('toggleDarkModeBtn');
  themeBtn?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const isDark = currentTheme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    document.getElementById('darkModeIcon').textContent = newTheme === 'dark' ? '🌞' : '🌙';
  });

  // Apply saved theme on load
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.getElementById('darkModeIcon').textContent = savedTheme === 'dark' ? '🌞' : '🌙';
});

applySavedTheme();

// spinner.js
export function showSpinner() {
  document.getElementById('globalSpinner')?.classList.remove('hidden');
}

export function hideSpinner() {
  document.getElementById('globalSpinner')?.classList.add('hidden');
}
