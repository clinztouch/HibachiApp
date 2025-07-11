




// modules/utils/dateUtils.js
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function isDateInCurrentWeek(date) {
  const now = new Date();
  const firstDay = new Date(now);
  firstDay.setDate(now.getDate() - now.getDay());
  firstDay.setHours(0, 0, 0, 0);

  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  lastDay.setHours(23, 59, 59, 999);

  return date >= firstDay && date <= lastDay;
}

export function isDateInCurrentMonth(date) {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function isDateInCurrentRange(date, range) {
  const now = new Date();
  const past = new Date(now);

  if (range === '7') past.setDate(now.getDate() - 6);
  else if (range === '14') past.setDate(now.getDate() - 13);
  else if (range === '30') past.setDate(now.getDate() - 29);

  past.setHours(0, 0, 0, 0);
  now.setHours(23, 59, 59, 999);

  return date >= past && date <= now;
}
