exports = function calculateStreak(progress) {
  if (!Array.isArray(progress) || progress.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sorted = [...progress]
    .filter(p => p.completed)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date);
    const curr = new Date(sorted[i].date);

    const diff = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      longestStreak = Math.max(longestStreak, streak);
      streak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, streak);

  // Current streak: count backwards from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let cs = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const date = new Date(sorted[i].date);
    date.setHours(0, 0, 0, 0);

    const expected = new Date(today);
    expected.setDate(today.getDate() - cs);

    if (date.getTime() === expected.getTime()) {
      cs++;
    } else {
      break;
    }
  }

  return { currentStreak: cs, longestStreak };
};
