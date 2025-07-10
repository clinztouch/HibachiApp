import { authFetch } from './api.js';
import { onHabitChange } from '../hibachiApp.js';

/**
 * Fetch all habits and store them globally.
 */
export async function fetchHabits() {
  const res = await authFetch('/api/habits');
  const data = await res.json();
  window.allHabits = data;
  renderHabitList(data);
  onHabitChange();
}

/**
 * Mark a habit as completed for a given date.
 */
export async function markHabitDone(habitId, date) {
  return authFetch(`/api/habits/${habitId}/completions`, {
    method: 'POST',
    body: JSON.stringify({ date }),
  });
}

/**
 * Remove a completion entry from a habit.
 */
export async function unmarkHabitDone(habitId, date) {
  return authFetch(`/api/habits/${habitId}/completions`, {
    method: 'DELETE',
    body: JSON.stringify({ date }),
  });
}

/**
 * Mark a habit as done (alternate single-endpoint approach).
 */
export async function markHabit(id) {
  const res = await authFetch(`/api/habits/${id}/mark`, {
    method: 'PATCH',
  });

  const data = await res.json();
  if (!res.ok) alert(data.message || 'Could not mark habit');
  else await fetchHabits();
}

/**
 * Edit a habit’s title and goal.
 */
export async function editHabit(id, updatedTitle, updatedGoal) {
  const res = await authFetch(`/api/habits/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: updatedTitle, goal: updatedGoal })
  });

  const data = await res.json();
  if (!res.ok) alert(data.message || 'Edit failed');
  else await fetchHabits();
}

/**
 * Delete a habit by ID.
 */
export async function deleteHabit(id) {
  if (!confirm('Delete this habit?')) return;

  const res = await authFetch(`/api/habits/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) alert('Could not delete habit');
  else await fetchHabits();
}

/**
 * Render the list of habits with edit/delete buttons and checkboxes.
 */
function renderHabitList(habits) {
  const list = document.getElementById('habitList');
  list.innerHTML = '';

  habits.forEach(habit => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <label>
        <input type="checkbox" class="complete-toggle" data-id="${habit._id}" ${isHabitDoneToday(habit) ? 'checked' : ''}>
        ${habit.title}
      </label>
      <button class="edit-habit-btn" data-id="${habit._id}">Edit</button>
      <button class="delete-habit-btn" data-id="${habit._id}">Delete</button>
    `;
    list.appendChild(listItem);
  });
}

function isHabitDoneToday(habit) {
  const today = new Date().toISOString().split('T')[0];
  return habit.completions?.includes(today);
}
