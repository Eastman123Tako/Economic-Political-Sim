import type { GameDate } from './types';

export const START_DATE: GameDate = { year: 1949, month: 1 };
export const END_DATE: GameDate = { year: 1991, month: 12 };

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatDate(d: GameDate): string {
  return `${MONTH_NAMES[d.month - 1]} ${d.year}`;
}

export function addMonths(d: GameDate, n: number): GameDate {
  const total = (d.year * 12 + (d.month - 1)) + n;
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

export function dateToIndex(d: GameDate): number {
  return d.year * 12 + (d.month - 1);
}

export function compareDates(a: GameDate, b: GameDate): number {
  return dateToIndex(a) - dateToIndex(b);
}

export function isDateInRange(d: GameDate, start: GameDate, end: GameDate): boolean {
  return compareDates(d, start) >= 0 && compareDates(d, end) <= 0;
}

export function isGameOver(d: GameDate): boolean {
  return compareDates(d, END_DATE) > 0;
}

export function monthsBetween(a: GameDate, b: GameDate): number {
  return dateToIndex(b) - dateToIndex(a);
}
