import { expect, type Page, test as base } from '@playwright/test';

export const PW = 'correct horse battery';
const KEY = 'vsmat_vault_storage_v1';

const day = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString('sv-SE');
};

const sub = (id: string, name: string, serviceKey: string, category: string, price: number, currency: string, cycle: string, days: number, paymentMethod: string) => ({
  id, name, serviceKey, category, accountEmail: 'coder@example.com', passwordNote: 'hunter2-note', cycle, price, currency,
  nextBillingDate: day(days), autoRenew: true, paymentMethod, portalUrl: 'https://example.com', rechargeUrl: 'https://example.com',
  history: [], createdAt: day(-60), updatedAt: day(-2),
});

export const makeSeed = () => ({
  tokens: [
    { id: 't1', name: 'OpenAI Key', serviceKey: 'openai', token: 'sk-proj-abc123987456xyz99887766554433221100', accountEmail: 'a@example.com', tags: [], consoleUrl: 'https://platform.openai.com/api-keys', createdAt: day(-3), updatedAt: day(-1) },
    { id: 't2', name: 'DeepSeek Key', serviceKey: 'deepseek', token: 'sk-d98f7e6a5b4c3d2e1f0a9b8c7d6e5f4a', accountEmail: 'b@example.com', tags: [], createdAt: day(-3), updatedAt: day(-1) },
  ],
  subscriptions: [
    sub('s1', 'ChatGPT Plus', 'openai', 'ai', 20, 'USD', 'monthly', -2, 'Apple 订阅 (美区)'),
    sub('s2', 'SuperGrok', 'grok', 'ai', 700, 'INR', 'monthly', 2, 'Apple 订阅 (印区)'),
    sub('s3', 'Cursor Pro', 'cursor', 'developer', 20, 'USD', 'monthly', 6, 'WildCard'),
    sub('s4', 'Bandwagon VPS', 'vps', 'server', 49.99, 'USD', 'annually', 39, 'Alipay'),
    sub('s5', 'Kimi Plus', 'kimi', 'ai', 100, 'CNY', 'monthly', 25, 'Alipay'),
  ],
  vouchers: [
    { id: 'v1', serviceKey: 'apple', serviceName: 'Apple 礼品卡', code: 'X89A-24B8-90CD-EF12', amount: 25, currency: 'USD', status: 'unredeemed', createdAt: day(-5) },
    { id: 'v2', serviceKey: 'steam', serviceName: 'Steam 钱包码', code: 'K3T7P-99MQ2-8XB44', amount: 100, currency: 'CNY', status: 'unredeemed', createdAt: day(-3) },
  ],
  settings: { isConfigured: true, rememberUnlocked: true, enableBrowserNotifications: false, preferredCurrency: 'CNY', usdToCnyRate: 7.25, autoLockMinutes: 0 },
});

export type Seed = ReturnType<typeof makeSeed>;

export type AppPage = Page & { confirms: string[]; problems: string[] };

/** Stubs the parts that leave the browser, so calls can be asserted in every engine. */
async function instrument(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as Record<string, unknown>;
    const opened: string[] = [];
    w.__opened = opened;
    window.open = ((url: string) => { opened.push(url); return null; }) as typeof window.open;
    let clip = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (t: string) => { clip = t; }, readText: async () => clip },
    });
    const notes: string[] = [];
    w.__notes = notes;
    class FakeNotification {
      static permission = 'granted';
      static requestPermission = async () => 'granted';
      constructor(title: string) { notes.push(title); }
    }
    w.Notification = FakeNotification;
  });
}

export async function openVault(page: Page, seed: Seed | null = makeSeed()): Promise<AppPage> {
  const app = page as AppPage;
  app.confirms = [];
  app.problems = [];
  page.on('dialog', async (d) => { app.confirms.push(d.message()); await d.accept(d.type() === 'prompt' ? PW : undefined); });
  page.on('pageerror', (e) => app.problems.push(String(e)));
  page.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) app.problems.push(m.text().slice(0, 200)); });
  await instrument(page);
  if (seed) {
    await page.addInitScript(([k, v]) => {
      if (!localStorage.getItem(k) && !sessionStorage.getItem('seeded')) {
        localStorage.setItem(k, v);
        sessionStorage.setItem('seeded', '1');
      }
    }, [KEY, JSON.stringify(seed)]);
  }
  await page.goto('/');
  await expect(page.getByText('设置保险箱主密码')).toBeVisible();
  const pw = page.locator('input[type=password]');
  await pw.nth(0).fill(PW);
  await pw.nth(1).fill(PW);
  await page.click('button[type=submit]');
  await expect(page.getByText('设置保险箱主密码')).toBeHidden();
  return app;
}

export const tab = (p: Page, name: string) => p.locator('nav button').filter({ hasText: name }).click();
export const row = (p: Page, name: string) => p.locator('main div.group').filter({ hasText: name }).first();
export const voucherCard = (p: Page, name: string) => p.locator('main .grid .surface-card').filter({ hasText: name }).first();
export const opened = (p: Page) => p.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
export const clipboard = (p: Page) => p.evaluate(() => navigator.clipboard.readText());
export const dueDate = async (p: Page, name: string) => (await row(p, name).innerText()).match(/下期:\s*([\d-]+)/)?.[1];
export const lockVault = (p: Page) => p.locator('header button[aria-label="立即锁定保险箱"]').click();
export const unlock = async (p: Page, password: string) => {
  await p.locator('input[type=password]').first().fill(password);
  await p.click('button[type=submit]');
};

export const test = base;
export { expect };
