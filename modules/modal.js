import { trapFocus, releaseFocusTrap } from './accessibility.js';
import { authFetch } from './api.js';


const modal = document.getElementById('editHabitModal');
const form = document.getElementById('editHabitForm');
const nameInput = document.getElementById('habitName');
const frequencySelect = document.getElementById('habitFrequency');

export function openEditModal(e) {
  const habitId = e.target.dataset.id;
  const habit = window.allHabits?.find(h => h._id === habitId);
  if (!habit) return;

  window.currentEditingHabitId = habitId;
  nameInput.value = habit.name || habit.title || '';
  frequencySelect.value = habit.frequency || 'daily';

  modal.classList.remove('hidden');
  modal.classList.add('open');
  trapFocus(modal.querySelector('.modal-content'));
}

export function closeEditModal() {
  modal.classList.add('hidden');
  modal.classList.remove('open');
  releaseFocusTrap();
}

export async function submitEditForm(e) {
  e.preventDefault();
  const updatedName = nameInput.value.trim();
  const updatedFrequency = frequencySelect.value;
  const habitId = window.currentEditingHabitId;
  const token = localStorage.getItem('token');

  if (!habitId || !updatedName) return;

  try {
    const response = await authFetch('/api/habits', {
      method: 'POST',
      body: JSON.stringify({ name: newHabitName }),
    });

    if (!response.ok) {
      console.error('Failed to update habit:', await response.text());
      return;
    }

    closeEditModal();
    if (typeof window.fetchHabits === 'function') {
      await window.fetchHabits(); // trigger re-render
    }
  } catch (err) {
    console.error('Error updating habit:', err);
  }
}
