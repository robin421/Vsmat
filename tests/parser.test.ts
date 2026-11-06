import { describe, expect, it } from 'vitest';
import { parseSmartText } from '../src/lib/parser';

describe('parseSmartText', () => {
  it('extracts account, password, key, date and price', () => {
    const r = parseSmartText(`
服务: OpenAI ChatGPT Plus
账号: my_developer_account@gmail.com
密码: MyStrongPassword!2026
API Key: sk-proj-1234567890abcdefghijklmnopqrstuvwxyz
到期日期: 2026-11-28
金额: $20/月
`);
    expect(r.serviceKey).toBe('openai');
    expect(r.accountEmail).toBe('my_developer_account@gmail.com');
    expect(r.password).toBe('MyStrongPassword!2026');
    expect(r.apiKey?.startsWith('sk-proj-')).toBe(true);
    expect(r.price).toBe(20);
    expect(r.currency).toBe('USD');
    expect(r.nextBillingDate).toBe('2026-11-28');
  });

  it('falls back to a custom service with a future billing date', () => {
    const r = parseSmartText('随便一段文字');
    expect(r.serviceKey).toBe('custom');
    expect(r.nextBillingDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
