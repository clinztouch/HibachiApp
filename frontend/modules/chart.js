// modules/chart.js


export function renderChartForHabit(habit) {
  const ctx = document.getElementById('habitChart').getContext('2d');
  const data = {
    labels: habit.progress.map(p => p.date),
    datasets: [{
      label: habit.title,
      data: habit.progress.map(p => p.completed ? 1 : 0),
      backgroundColor: '#4caf50'
    }]
  };

  if (window.habitChart) {
    window.habitChart.destroy();
  }

  window.habitChart = new Chart(ctx, {
    type: 'bar',
    data,
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}


export function renderStreakChartForHabit(habit) {
  const ctx = document.getElementById('streakChart').getContext('2d');

  if (window.streakChart) {
    window.streakChart.destroy();
  }

  const { labels, counts } = generateStreakTimeline(habit.progress || []);

  window.streakChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Completed (1 = Yes, 0 = No)',
        data: counts,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: {
            stepSize: 1,
            callback: val => val === 1 ? '✅' : '❌'
          }
        }
      }
    }
  });
}

function generateStreakTimeline(progress) {
  const map = {};
  progress.forEach(p => {
    map[p.date] = p.completed ? 1 : 0;
  });

  const result = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      value: map[dateStr] || 0
    });
  }

  return {
    labels: result.map(r => r.date),
    counts: result.map(r => r.value)
  };
}

