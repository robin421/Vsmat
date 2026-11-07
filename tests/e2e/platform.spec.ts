import path from 'node:path';
import { expect, openVault, tab, test } from './helpers';

test.skip(({ browserName }) => browserName !== 'chromium', 'service worker control and OCR timing are checked in Chromium');

test('every tab and dialog opens offline', async ({ page, context }) => {
  const p = await openVault(page);
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.reload();
  await expect(p.getByRole('heading', { name: 'ChatGPT Plus' })).toBeVisible();
  await context.setOffline(true);
  await p.reload();
  for (const t of ['Token 密钥', '礼品券直充', '支出统计']) {
    await tab(p, t);
    await expect(p.locator('h1')).toHaveText(t);
  }
  await p.locator('header button[aria-label="设置"]').click();
  await expect(p.getByLabel('自动锁定')).toBeVisible();
  await context.setOffline(false);
});

for (const [name, file, expected] of [
  ['English', 'ocr-en.png', 'ChatGPT Plus'],
  ['Japanese', 'ocr-jp.png', 'Apple'],
] as const) {
  test(`OCR reads a ${name} screenshot with no cross-origin requests`, async ({ page, context }) => {
    test.setTimeout(120_000);
    const external: string[] = [];
    context.on('request', (r) => {
      const u = new URL(r.url());
      if (u.hostname !== '127.0.0.1' && !['data:', 'blob:'].includes(u.protocol)) external.push(r.url());
    });
    const p = await openVault(page, null);
    await p.locator('header').getByRole('button', { name: '新建订阅' }).click();
    await p.setInputFiles('input[type=file]', path.join(import.meta.dirname, 'fixtures', file));
    await expect.poll(
      () => p.evaluate(() => [...document.querySelectorAll('.fixed.inset-0 input')].map((i) => (i as HTMLInputElement).value).join('|')),
      { timeout: 90_000 }
    ).toContain(expected);
    expect(external).toEqual([]);
    expect(p.problems).toEqual([]);
  });
}
