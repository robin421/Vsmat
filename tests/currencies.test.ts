import { describe, expect, it } from 'vitest';
import { convertToUSD, monthlyAmountUSD } from '../src/lib/currencies';

describe('monthlyAmountUSD', () => {
  it.each([
    ['monthly', 30],
    ['quarterly', 10],
    ['semi-annually', 5],
    ['annually', 2.5],
    ['prepaid', 10],
    ['lifetime', 0],
  ])('%s', (cycle, expected) => {
    expect(monthlyAmountUSD({ price: 30, currency: 'USD', cycle })).toBeCloseTo(expected);
  });

  it('honours the configured CNY rate', () => {
    expect(monthlyAmountUSD({ price: 80, currency: 'CNY', cycle: 'monthly' }, 8)).toBeCloseTo(10);
    expect(convertToUSD(80, 'CNY', 8)).toBeCloseTo(10);
  });

  it('compares across currencies, not raw numbers', () => {
    const inr = monthlyAmountUSD({ price: 700, currency: 'INR', cycle: 'monthly' });
    const usd = monthlyAmountUSD({ price: 49, currency: 'USD', cycle: 'monthly' });
    expect(inr).toBeLessThan(usd);
  });
});
