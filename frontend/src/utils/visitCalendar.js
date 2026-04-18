/** Helpers for visit-date booking (month grid, booking window). */

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/** How far ahead visitors may book (days from today). */
export const BOOKING_DAYS_AHEAD = 120;

export function getBookingDateBounds() {
  const min = startOfDay(new Date());
  const max = startOfDay(new Date());
  max.setDate(max.getDate() + BOOKING_DAYS_AHEAD);
  return { min, max };
}

export function isDateInBookingWindow(d) {
  const { min, max } = getBookingDateBounds();
  const t = startOfDay(d);
  return t.getTime() >= min.getTime() && t.getTime() <= max.getTime();
}

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

export function formatMonthYear(year, monthIndex) {
  return `${MONTHS[monthIndex]} ${year}`;
}

/**
 * Calendar cells for a month, Monday-first week rows.
 * Each cell: { type: 'pad' } | { type: 'day', date: Date }
 */
export function buildMonthGrid(year, monthIndex) {
  const firstDow = new Date(year, monthIndex, 1).getDay();
  const mondayOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < mondayOffset; i += 1) {
    cells.push({ type: 'pad' });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ type: 'day', date: new Date(year, monthIndex, day) });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ type: 'pad' });
  }
  return cells;
}

/** ISO date YYYY-MM-DD in local timezone */
export function toLocalDateKey(d) {
  const x = startOfDay(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const dd = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** First-of-month timestamps for comparing visible month vs booking window.s */
export function monthStartTs(year, monthIndex) {
  return new Date(year, monthIndex, 1).getTime();
}
