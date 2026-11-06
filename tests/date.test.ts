import { afterEach, describe, expect, it, vi } from 'vitest';
import { addMonthsClamped, daysFromToday, formatLocalDate, parseLocalDate, todayLocal } from '../src/lib/date';
import { advanceBillingDate } from '../src/lib/storage';

afterEach(() => vi.useRealTimers());

describe('date helpers', () => {
  it('clamps month-end instead of overflowing', () => {
    expect(advanceBillingDate('2026-01-31', 'monthly')).toBe('2026-02-28');
    expect(advanceBillingDate('2028-01-31', 'monthly')).toBe('2028-02-29');
    expect(advanceBillingDate('2026-08-31', 'quarterly')).toBe('2026-11-30');
    expect(advanceBillingDate('2024-02-29', 'annually')).toBe('2025-02-28');
    expect(advanceBillingDate('2026-03-15', 'semi-annually')).toBe('2026-09-15');
  });

  it('crosses year boundaries', () => {
    expect(advanceBillingDate('2026-12-15', 'monthly')).toBe('2027-01-15');
  });

  it('rejects impossible dates', () => {
    expect(parseLocalDate('2026-02-30')).toBeNull();
    expect(parseLocalDate('not-a-date')).toBeNull();
    expect(parseLocalDate('2026-02-28')).not.toBeNull();
  });

  it('counts calendar days from today in local time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 6, 0, 30)); // 00:30 local
    expect(todayLocal()).toBe('2026-11-06');
    expect(daysFromToday('2026-11-06')).toBe(0);
    expect(daysFromToday('2026-11-07')).toBe(1);
    expect(daysFromToday('2026-11-01')).toBe(-5);
    vi.setSystemTime(new Date(2026, 10, 6, 23, 59));
    expect(daysFromToday('2026-11-07')).toBe(1);
    expect(daysFromToday('garbage')).toBeNull();
  });

  it('addMonthsClamped does not mutate its input', () => {
    const d = new Date(2026, 0, 31);
    addMonthsClamped(d, 1);
    expect(formatLocalDate(d)).toBe('2026-01-31');
  });
});
