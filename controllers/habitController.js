import Habit from '../models/Habit.js';
import calculateStreak from '../utils/streakCalculator.js';

// Utility to calculate progress stats
const calculateProgressStats = (progress) => {
  const completedDays = progress.filter(p => p.completed).length;
  const totalDays = progress.length;
  return {
    completedDays,
    totalDays,
    completionRate: totalDays ? (completedDays / totalDays * 100).toFixed(2) : 0
  };
};

// CREATE a new habit
export async function createHabit(req, res) {
  const userId = req.user.id;
  const { title, goal } = req.body;

  try {
    if (!title || !goal) {
      return res.status(400).json({ message: 'Title and goal are required' });
    }

    const habit = new Habit({
      title,
      goal,
      user: userId,
      progress: [],
      longestStreak: 0,
    });

    await habit.save();
    res.status(201).json({ message: 'Habit created successfully', habit });

  } catch (error) {
    console.error('[createHabit ERROR]:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// GET all habits
export async function getHabits(req, res) {
  try {
    const habits = await Habit.find({ user: req.user._id });

    const habitsWithStreaks = habits.map(habit => {
      const { currentStreak, longestStreak } = calculateStreak(habit.progress || []);
      return {
        ...habit.toObject(),
        streak: { current: currentStreak, longest: longestStreak }
      };
    });

    res.json(habitsWithStreaks);
  } catch (error) {
    console.error('[getHabits ERROR]:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// controllers/habitController.js
export async function updateHabit(req, res) {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const habit = await Habit.findById(id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    if (title) habit.title = title;
    if (description) habit.description = description;

    await habit.save();
    res.json({ message: 'Habit updated', habit });
  } catch (err) {
    console.error('[updateHabit ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
}
 

// MARK habit as done for today
export async function markHabit(req, res) {
  const habitId = req.params.id;
  const userId = req.user._id;
  const today = new Date().toISOString().split('T')[0];

  try {
    const habit = await Habit.findOne({ _id: habitId, user: userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const alreadyMarked = habit.progress.find(
      (entry) => new Date(entry.date).toISOString().split('T')[0] === today
    );

    if (alreadyMarked) {
      alreadyMarked.completed = true;
    } else {
      habit.progress.push({ date: new Date(), completed: true });
    }

    const { currentStreak, longestStreak } = calculateStreak(habit.progress);

    if (longestStreak > (habit.longestStreak || 0)) {
      habit.longestStreak = longestStreak;
    }

    await habit.save();

    res.status(200).json({
      message: 'Habit marked as done',
      streak: { current: currentStreak, longest: habit.longestStreak },
    });

  } catch (error) {
    console.error('Error in markHabit:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

// EDIT habit
export async function editHabit(req, res) {
  try {
    const habitId = req.params.id;
    const updates = req.body;

    const habit = await Habit.findOneAndUpdate(
      { _id: habitId, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    console.error('[editHabit ERROR]:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// DELETE habit
export async function deleteHabit(req, res) {
  try {
    const habitId = req.params.id;

    const habit = await Habit.findOneAndDelete({ _id: habitId, user: req.user.id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    res.json({ message: `Habit '${habit.title}' deleted successfully.` });
  } catch (error) {
    console.error('[deleteHabit ERROR]:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
}

// ADD completion
export async function addCompletion(req, res) {
  const { habitId } = req.params;
  const { date } = req.body;
  const userId = req.user.id;

  try {
    const habit = await Habit.findOne({ _id: habitId, user: userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const isAlreadyMarked = habit.progress.some(entry => {
      return new Date(entry.date).toISOString().split('T')[0] === date;
    });

    if (isAlreadyMarked) {
      return res.status(400).json({ message: 'Already marked complete for this day' });
    }

    habit.progress.push({
      date: new Date(date),
      completed: true,
    });

    await habit.save();

    res.status(201).json({ message: 'Completion added', habit });
  } catch (err) {
    console.error('Error in addCompletion:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// REMOVE completion
export async function removeCompletion(req, res) {
  const { habitId, date } = req.params;
  const userId = req.user.id;

  try {
    const habit = await Habit.findOne({ _id: habitId, user: userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const originalLength = habit.progress.length;

    habit.progress = habit.progress.filter(entry => {
      return new Date(entry.date).toISOString().split('T')[0] !== date;
    });

    if (habit.progress.length === originalLength) {
      return res.status(404).json({ message: 'Completion not found for that date' });
    }

    await habit.save();

    res.status(200).json({ message: 'Completion removed', habit });
  } catch (err) {
    console.error('Error in removeCompletion:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Optional: Mark with raw date (alternative version)
export async function markHabitCompletion(req, res) {
  const habitId = req.params.id;
  const { date } = req.body;

  try {
    const habit = await Habit.findOne({ _id: habitId, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    if (!habit.progress.includes(date)) {
      habit.progress.push(date);
    }

    await habit.save();
    res.json({ message: 'Habit marked as complete', habit });
  } catch (error) {
    console.error('[markHabitCompletion ERROR]:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
