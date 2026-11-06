/** Local-calendar date helpers. Dates are stored as `YYYY-MM-DD` (no time zone). */

const pad = (n: number) => String(n).padStart(2, '0');

export function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Today in the user's own time zone (unlike `toISOString()`, which is UTC). */
export function todayLocal(): string {
  return formatLocalDate(new Date());
}

export function parseLocalDate(dateStr: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) || d.getMonth() !== Number(m[2]) - 1 ? null : d;
}

/** Whole calendar days from today to `dateStr` (negative = overdue). */
export function daysFromToday(dateStr: string): number | null {
  const target = parseLocalDate(dateStr);
  if (!target) return null;
  const now = new Date();
  // Compare as UTC midnights of the local Y/M/D so DST shifts can't add/remove a day.
  const a = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a - b) / 86_400_000);
}

/** Add months, clamping to the last day of the target month (Jan 31 + 1mo = Feb 28/29). */
export function addMonthsClamped(d: Date, months: number): Date {
  const day = d.getDate();
  const result = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}
