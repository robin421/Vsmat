import { expect, lockVault, makeSeed, openVault, PW, row, tab, test, unlock } from './helpers';

const settings = (p: import('@playwright/test').Page) => p.locator('header button[aria-label="设置"]').click();

test('fresh vault: password required, nothing readable at rest, no CSP violations', async ({ page }) => {
  const p = await openVault(page, null);
  await expect(p.getByText('暂无订阅记录')).toBeVisible();
  const raw = await p.evaluate(() => localStorage.getItem('vsmat_vault_storage_v1'));
  expect(JSON.parse(raw!).v).toBe(2);
  expect(raw).not.toContain('settings');
  expect(p.problems).toEqual([]);
});

test('lock, wrong password, unlock', async ({ page }) => {
  const p = await openVault(page);
  await lockVault(p);
  await expect(p.getByText('解锁 Vsmat 保险箱')).toBeVisible();
  await expect(p.getByText('ChatGPT Plus')).toHaveCount(0);
  await unlock(p, 'definitely not right');
  await expect(p.getByText('主密码错误')).toBeVisible();
  await unlock(p, PW);
  await expect(p.getByRole('heading', { name: 'ChatGPT Plus' })).toBeVisible();
});

test('Esc closes dialogs but never the unlock screen', async ({ page }) => {
  const p = await openVault(page);
  await p.locator('header').getByRole('button', { name: '新建订阅' }).click();
  await expect(p.getByText('选择智能识别提取或手动填表录入')).toBeVisible();
  await p.keyboard.press('Escape');
  await expect(p.getByText('选择智能识别提取或手动填表录入')).toBeHidden();

  await lockVault(p);
  await p.keyboard.press('Escape');
  await expect(p.getByText('解锁 Vsmat 保险箱')).toBeVisible();
});

test('backdrop closes the security dialog but not a form', async ({ page }) => {
  const p = await openVault(page);
  await p.locator('footer button').click();
  await expect(p.getByText('数据安全与纯本地架构说明')).toBeVisible();
  await p.mouse.click(10, 450);
  await expect(p.getByText('数据安全与纯本地架构说明')).toBeHidden();

  await p.locator('header').getByRole('button', { name: '新建订阅' }).click();
  await expect(p.getByText('选择智能识别提取或手动填表录入')).toBeVisible();
  await p.mouse.click(10, 450);
  await expect(p.getByText('选择智能识别提取或手动填表录入')).toBeVisible();
});

test('auto-lock fires, closes open dialogs and revokes the remembered key', async ({ page }) => {
  const seed = makeSeed();
  seed.settings.autoLockMinutes = 0.05; // 3 seconds
  const p = await openVault(page, seed);
  await row(p, 'Kimi Plus').locator('h3').click();
  await expect(p.getByText('编辑订阅详情')).toBeVisible();
  await expect(p.getByText('解锁 Vsmat 保险箱')).toBeVisible({ timeout: 8000 });
  await expect(p.getByText('编辑订阅详情')).toBeHidden();
  await p.reload();
  await expect(p.getByText('解锁 Vsmat 保险箱')).toBeVisible();
});

test('settings: change master password', async ({ page }) => {
  const p = await openVault(page);
  await settings(p);
  await p.getByLabel('当前主密码').fill('wrong password here');
  await p.getByLabel('新主密码', { exact: true }).fill('a brand new passphrase');
  await p.getByLabel('确认新主密码').fill('a brand new passphrase');
  await p.getByRole('button', { name: '修改主密码' }).click();
  await expect(p.getByText('当前主密码不正确')).toBeVisible();

  await p.getByLabel('当前主密码').fill(PW);
  await p.getByRole('button', { name: '修改主密码' }).click();
  await expect(p.getByText('主密码已修改')).toBeVisible();
  await p.keyboard.press('Escape');

  await lockVault(p);
  await unlock(p, PW);
  await expect(p.getByText('主密码错误')).toBeVisible();
  await unlock(p, 'a brand new passphrase');
  await expect(p.getByRole('heading', { name: 'ChatGPT Plus' })).toBeVisible();
});

test('settings: exchange rate reaches every amount', async ({ page }) => {
  const p = await openVault(page);
  await expect(row(p, 'Kimi Plus')).toContainText('$13.79');
  await settings(p);
  await p.getByLabel('美元兑人民币汇率').fill('8');
  await p.getByLabel('美元兑人民币汇率').blur();
  await p.keyboard.press('Escape');
  await expect(row(p, 'Kimi Plus')).toContainText('$12.50');
  await tab(p, '支出统计');
  await expect(p.locator('main')).toContainText('总月均支出');
  const text = await p.locator('main').innerText();
  const monthly = Number(text.match(/预估月度总支出\s*¥\s*([\d.]+)/)![1]);
  const breakdown = Number(text.match(/总月均支出\s*¥\s*([\d.]+)/)![1]);
  expect(monthly).toBeCloseTo(breakdown, 1);
  await p.reload();
  await settings(p);
  await expect(p.getByLabel('美元兑人民币汇率')).toHaveValue('8');
});

test('settings: auto-lock choice and remember toggle persist', async ({ page }) => {
  const p = await openVault(page);
  await settings(p);
  await p.getByLabel('自动锁定').selectOption('5');
  await p.keyboard.press('Escape');
  await p.reload();
  await settings(p);
  await expect(p.getByLabel('自动锁定')).toHaveValue('5');

  await p.getByRole('switch', { name: '记住解锁状态' }).click();
  await expect(p.getByRole('switch', { name: '记住解锁状态' })).toHaveAttribute('aria-checked', 'false');
  await p.reload();
  await expect(p.getByText('解锁 Vsmat 保险箱')).toBeVisible();
});

test('settings: notifications toggle', async ({ page }) => {
  const p = await openVault(page);
  await settings(p);
  const toggle = p.getByRole('switch', { name: '续费桌面通知' });
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
});

test('encrypted backup exports, and restores into another vault', async ({ page, browser }) => {
  const p = await openVault(page);
  await p.locator('header button[aria-label="备份与恢复"]').click();
  const [download] = await Promise.all([p.waitForEvent('download'), p.getByText('导出本地备份').click()]);
  const file = await download.path();

  const other = await browser.newPage();
  const q = await openVault(other, null);
  await q.locator('header button[aria-label="备份与恢复"]').click();
  await q.setInputFiles('input[type=file]', file);
  await expect(q.getByRole('heading', { name: 'ChatGPT Plus' })).toBeVisible();
  await other.close();
});
