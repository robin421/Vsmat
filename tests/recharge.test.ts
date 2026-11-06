import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectVoucherService, execute1ClickRecharge, sanitizeVoucherCode } from '../src/lib/rechargeEngines';
import { safeHttpUrl } from '../src/lib/url';

afterEach(() => vi.restoreAllMocks());

describe('voucher detection', () => {
  it('sanitizes', () => expect(sanitizeVoucherCode(' x89a 24b8 \n90cd ef12 ')).toBe('X89A24B890CDEF12'));

  it.each([
    ['X89A24B890CDEF12', 'apple'],
    ['K3T7P-99MQ2-8XB44', 'steam'],
    ['AB12-CD34EF-GH56', 'amazon'],
  ])('%s -> %s', (code, key) => expect(detectVoucherService(code)?.key).toBe(key));

  it('returns null for unrecognised input', () => {
    expect(detectVoucherService('hello')).toBeNull();
    expect(detectVoucherService('')).toBeNull();
  });
});

describe('execute1ClickRecharge', () => {
  it('does not open anything or guess a service for unknown codes', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const res = await execute1ClickRecharge('zzz');
    expect(res.success).toBe(false);
    expect(open).not.toHaveBeenCalled();
  });

  it('opens the detected provider with noopener', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const res = await execute1ClickRecharge('K3T7P-99MQ2-8XB44');
    expect(res.success).toBe(true);
    expect(open).toHaveBeenCalledWith(expect.stringMatching(/^https:\/\//), '_blank', 'noopener,noreferrer');
  });

  it('ignores non-http custom URLs', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    await execute1ClickRecharge('K3T7P-99MQ2-8XB44', 'steam', 'javascript:alert(1)');
    expect(open.mock.calls[0][0]).not.toMatch(/^javascript:/);
  });
});

describe('safeHttpUrl', () => {
  it('allows only http(s)', () => {
    expect(safeHttpUrl('https://a.com/x')).toBe('https://a.com/x');
    expect(safeHttpUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeHttpUrl('data:text/html,<script>')).toBeUndefined();
    expect(safeHttpUrl('')).toBeUndefined();
    expect(safeHttpUrl(undefined)).toBeUndefined();
  });
});
