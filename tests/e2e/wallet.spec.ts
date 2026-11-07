import { clipboard, expect, makeSeed, opened, openVault, row, tab, test, voucherCard } from './helpers';

const quick = (p: import('@playwright/test').Page) => p.getByPlaceholder(/在此粘贴礼品卡号/);

test('tokens: reveal, copy, edit, delete once', async ({ page }) => {
  const p = await openVault(page);
  await tab(p, 'Token 密钥');
  const r = row(p, 'DeepSeek Key');
  await r.getByRole('button', { name: /显示/ }).click();
  await expect(r).toContainText('sk-d98f7e6a5b4c3d2e1f0a9b8c7d6e5f4a');
  await r.getByRole('button', { name: '复制密钥' }).click();
  await expect.poll(() => clipboard(p)).toBe('sk-d98f7e6a5b4c3d2e1f0a9b8c7d6e5f4a');

  await r.locator('h3').click();
  await p.getByPlaceholder(/^例如: OpenAI 主/).fill('Renamed Key');
  await p.locator('.fixed.inset-0 button[type=submit]').click();
  await expect(row(p, 'Renamed Key')).toBeVisible();

  await row(p, 'Renamed Key').getByRole('button', { name: '更多操作' }).click();
  await p.locator('.surface-pop').getByRole('button', { name: '删除密钥' }).click();
  await expect(p.locator('main div.group')).toHaveCount(1);
  expect(p.confirms).toHaveLength(1);
});

test('voucher stays pending after opening the provider, until confirmed', async ({ page }) => {
  const p = await openVault(page);
  await tab(p, '礼品券直充');
  await voucherCard(p, 'Steam').getByRole('button', { name: '一键充值使用' }).click();
  await expect(voucherCard(p, 'Steam')).toContainText('兑换成功后请确认');
  expect((await opened(p)).at(-1)).toContain('steampowered.com');
  await expect(p.getByRole('button', { name: '待使用 (2)' })).toBeVisible();

  await voucherCard(p, 'Steam').getByRole('button', { name: '已兑换' }).click();
  await expect(p.getByRole('button', { name: '已核销 (1)' })).toBeVisible();

  await p.getByRole('button', { name: /^已核销/ }).click();
  await voucherCard(p, 'Steam').getByRole('button', { name: '撤销核销' }).click();
  await expect(p.getByRole('button', { name: '已核销 (0)' })).toBeVisible();
});

test('voucher can be edited and keeps its status', async ({ page }) => {
  const p = await openVault(page);
  await tab(p, '礼品券直充');
  await voucherCard(p, 'Steam').getByRole('button', { name: '编辑卡券' }).click();
  await expect(p.getByText('编辑礼品卡券')).toBeVisible();
  await p.locator('.fixed.inset-0 input').nth(1).fill('Steam 新名称');
  await p.getByRole('button', { name: '保存修改' }).click();
  await expect(voucherCard(p, 'Steam 新名称')).toContainText('K3T7P-99MQ2-8XB44');
  await p.reload();
  await tab(p, '礼品券直充');
  await expect(voucherCard(p, 'Steam 新名称')).toBeVisible();
});

test('voucher delete asks once; mark redeemed works without opening anything', async ({ page }) => {
  const p = await openVault(page);
  await tab(p, '礼品券直充');
  await voucherCard(p, 'Steam').getByRole('button', { name: '标记为已核销' }).click();
  await expect(p.getByRole('button', { name: '已核销 (1)' })).toBeVisible();
  await voucherCard(p, 'Apple').getByRole('button', { name: '删除' }).click();
  await expect(p.getByRole('button', { name: '待使用 (0)' })).toBeVisible();
  expect(p.confirms).toHaveLength(1);
});

test('quick bar never claims a channel for an unknown code', async ({ page }) => {
  const p = await openVault(page);
  await tab(p, '礼品券直充');
  await expect(p.locator('main')).not.toContainText('OpenAI');
  await quick(p).fill('hello-world');
  await expect(p.getByText('未识别，请在左侧手动选择服务')).toBeVisible();
  await p.locator('form button[type=submit]').click();
  await expect(p.getByText('无法识别该券码')).toBeVisible();
  expect(await opened(p)).toEqual([]);
});

test('quick bar confirms stored codes only after the user says so', async ({ page }) => {
  const p = await openVault(page);
  await tab(p, '礼品券直充');
  await quick(p).fill('K3T7P-99MQ2-8XB44');
  await p.locator('form button[type=submit]').click();
  await expect(p.getByRole('button', { name: '已兑换，核销此券' })).toBeVisible();
  await expect(p.getByRole('button', { name: '待使用 (2)' })).toBeVisible();
  await p.getByRole('button', { name: '已兑换，核销此券' }).click();
  await expect(p.getByRole('button', { name: '已核销 (1)' })).toBeVisible();
});

test('Apple helper: copy, open, complete renews and redeems', async ({ page }) => {
  const p = await openVault(page);
  await row(p, 'ChatGPT Plus').getByRole('button', { name: '去充值' }).click();
  const m = p.locator('.fixed.inset-0').last();
  await expect(m).toContainText('Apple 礼品卡网页充值助手');
  await m.getByRole('button', { name: /复制账号/ }).click();
  await expect.poll(() => clipboard(p)).toBe('coder@example.com');
  await m.getByRole('button', { name: /在新标签页打开/ }).click();
  await expect.poll(async () => (await opened(p)).at(-1)).toContain('apple.com');
  await m.getByRole('button', { name: /我已完成充值/ }).click();
  await expect(row(p, 'ChatGPT Plus')).not.toContainText('已逾期');
  await tab(p, '礼品券直充');
  await expect(p.getByRole('button', { name: '已核销 (1)' })).toBeVisible();
});

test('lifetime purchases add nothing to monthly totals, in both places', async ({ page }) => {
  const seed = makeSeed();
  seed.subscriptions[0].cycle = 'lifetime';
  const p = await openVault(page, seed);
  await tab(p, '支出统计');
  await expect(p.locator('main')).toContainText('总月均支出');
  const text = await p.locator('main').innerText();
  expect(text.match(/预估月度总支出\s*¥\s*([\d.]+)/)![1]).toBe(text.match(/总月均支出\s*¥\s*([\d.]+)/)![1]);
});

test.describe('phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('bottom tabs, token search, no sideways scrolling', async ({ page }) => {
    const p = await openVault(page);
    for (const t of ['Token 密钥', '礼品券直充', '支出统计', '我的订阅']) {
      await tab(p, t);
      await expect(p.locator('h1')).toHaveText(t);
      expect(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await tab(p, 'Token 密钥');
    await p.getByLabel('搜索密钥').fill('deep');
    await expect(p.locator('main div.group')).toHaveCount(1);
  });
});
