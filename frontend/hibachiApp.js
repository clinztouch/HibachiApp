// hibachiApp.js

import { logout, initAuthHandlers } from './modules/auth.js';
import { fetchHabits, markHabitDone, unmarkHabitDone } from './modules/habits.js';
import { renderChartForHabit, renderStreakChartForHabit } from './modules/chart.js';
import { openEditModal, closeEditModal, submitEditForm } from './modules/modal.js';
import { toggleDarkMode, applySavedTheme } from './modules/theme.js';
import { isTokenExpired } from './modules/authHelpers.js';
import { showSpinner, hideSpinner } from './modules/spinner.js';

// ✅ Set base API URL for dev vs production
const BASE_API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://hibachiapp.onrender.com';

export let currentEditingHabitId = null;
export let lastFocusedElement = null;
export let trap = null;

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
});
