const { calculateStreak } = require("./calculateStreaks");

exports.calculateProgress = (progress) => {
    const totalDays = progress.length;
    const completedDays = progress.filter(p => p.completed).length;
    const streak = calculateStreak(progress);

    return {
        totalDays,
        completedDays,
        completionRate: totalDays ? Math.round((completedDays / totalDays) * 100) : 0,
        streak
    };
};

function calculateStreak(progress) {
    const sorted = progress
    .filter(p => p.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

    let streak = 0;
    let today = new Date();

    for (let p of sorted) {
        const progressDate = new Date(p.date);
        if (progressDate.toDateString() === today.toDateString()) {
            streak++;
            today.setDate(today.getDate() - 1);
        }else {
            break;
        }
    }
    return streak;
}