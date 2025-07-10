// modules/utils/streakCalculator.js

export default function calculateStreak(progress) {
  if (!Array.isArray(progress) || progress.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sorted = progress
    .filter(p => p.completed)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  let previousDate = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const entry of sorted) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    if (previousDate) {
      const expectedDate = new Date(previousDate);
      expectedDate.setDate(expectedDate.getDate() + 1);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (entryDate.getTime() === previousDate.getTime()) {
        // same day — skip
      } else {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    if (streak > longestStreak) {
      longestStreak = streak;
    }

    previousDate = entryDate;
  }

  // Calculate current streak
  let current = 0;
  let dateCursor = new Date(today);

  for (let i = sorted.length - 1; i >= 0; i--) {
    const entryDate = new Date(sorted[i].date);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === dateCursor.getTime()) {
      current++;
      dateCursor.setDate(dateCursor.getDate() - 1);
    } else if (entryDate.getTime() < dateCursor.getTime()) {
      break;
    }
  }

  return { currentStreak: current, longestStreak };
}
