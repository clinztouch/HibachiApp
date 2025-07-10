const API_BASE = '/api/habits';

function getToken() {
  return localStorage.getItem('token');
}

// Fetch all habits and store in global for reuse
export async function fetchHabits() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(API_BASE, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const habits = await res.json();
    window.allHabits = habits; // Optional global usage
    renderHabits(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
  }
}

// POST a new completion
export async function markHabitDone(habitId, date, token = getToken()) {
  try {
    await fetch(`${API_BASE}/${habitId}/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ date })
    });
  } catch (error) {
    console.error('Error marking habit done:', error);
  }
}

// DELETE a completion
export async function unmarkHabitDone(habitId, date, token = getToken()) {
  try {
    await fetch(`${API_BASE}/${habitId}/completions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ date })
    });
  } catch (error) {
    console.error('Error unmarking habit:', error);
  }
}

// DELETE a habit
export async function deleteHabit(e) {
  const habitId = e.target.dataset.id;
  const token = getToken();
  if (!habitId || !token) return;

  const confirmed = confirm('Are you sure you want to delete this habit?');
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE}/${habitId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to delete habit');

    // Animate and remove card from DOM
    const card = document.querySelector(`[data-id="${habitId}"]`)?.closest('.habit-card');
    if (card) {
      card.classList.add('removing');
      setTimeout(() => card.remove(), 400);
    }

    fetchHabits(); // Refresh habit list
  } catch (error) {
    console.error('Error deleting habit:', error);
  }
}

// Optional: Render function (can also be in a separate UI module)
function renderHabits(habits) {
  // Placeholder – customize per your app’s rendering needs
  const container = document.getElementById('habitList');
  if (!container) return;

  container.innerHTML = '';
  habits.forEach(habit => {
    const card = document.createElement('div');
    card.className = 'habit-card adding';
    card.setAttribute('data-id', habit._id);
    card.innerHTML = `
      <h3>${habit.name}</h3>
      <label class="checkbox-label">
        <input type="checkbox" class="styled-checkbox complete-toggle" data-id="${habit._id}" ${habit.completedToday ? 'checked' : ''} />
        <span class="custom-checkbox"></span>
        Completed today
      </label>
      <div class="action-buttons">
        <button class="edit-habit-btn" data-id="${habit._id}">Edit</button>
        <button class="delete-habit-btn" data-id="${habit._id}">Delete</button>
      </div>
    `;
    container.appendChild(card);
  });
}
