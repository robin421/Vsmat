import { clipboard, dueDate, expect, makeSeed, openVault, row, tab, test } from './helpers';

test('double-clicking renew only affects the clicked row', async ({ page }) => {
  const p = await openVault(page);
  const before = await dueDate(p, 'Cursor Pro');
  const grok = await dueDate(p, 'SuperGrok');
  await row(p, 'SuperGrok').getByRole('button', { name: '我已续费' }).dblclick();
  await expect.poll(() => dueDate(p, 'SuperGrok')).not.toBe(grok);
  expect(await dueDate(p, 'Cursor Pro')).toBe(before);
});

test('renewal shows in history, persists, and can be undone', async ({ page }) => {
  const p = await openVault(page);
  const original = await dueDate(p, 'Bandwagon VPS');
  await row(p, 'Bandwagon VPS').getByRole('button', { name: '我已续费' }).click();
  await expect.poll(() => dueDate(p, 'Bandwagon VPS')).not.toBe(original);

  await p.reload();
  await row(p, 'Bandwagon VPS').locator('h3').click();
  await expect(p.getByText('续费记录')).toBeVisible();
  await expect(p.getByText('共 1 次')).toBeVisible();

  await p.getByRole('button', { name: '撤销' }).click();
  await expect(p.getByText('编辑订阅详情')).toBeHidden();
  await expect.poll(() => dueDate(p, 'Bandwagon VPS')).toBe(original);
  await row(p, 'Bandwagon VPS').locator('h3').click();
  await expect(p.getByText('还没有续费记录')).toBeVisible();
});

test('saving an edit keeps the renewal history', async ({ page }) => {
  const p = await openVault(page);
  await row(p, 'Bandwagon VPS').getByRole('button', { name: '我已续费' }).click();
  await row(p, 'Bandwagon VPS').locator('h3').click();
  await p.locator('.fixed.inset-0 button[type=submit]').click();
  await expect(p.getByText('编辑订阅详情')).toBeHidden();
  await row(p, 'Bandwagon VPS').locator('h3').click();
  await expect(p.getByText('共 1 次')).toBeVisible();
});

test('deleting a subscription asks once, from the menu and from the dialog', async ({ page }) => {
  const p = await openVault(page);
  await row(p, 'Kimi Plus').getByRole('button', { name: '更多操作' }).click();
  await p.getByRole('button', { name: '删除订阅' }).click();
  await expect(row(p, 'Kimi Plus')).toHaveCount(0);
  expect(p.confirms).toHaveLength(1);

  await row(p, 'Bandwagon VPS').locator('h3').click();
  await p.locator('.fixed.inset-0').getByRole('button', { name: '删除订阅' }).click();
  await expect(row(p, 'Bandwagon VPS')).toHaveCount(0);
  expect(p.confirms).toHaveLength(2);
});

test('lifetime purchases never count down or remind', async ({ page }) => {
  const seed = makeSeed();
  seed.subscriptions[0].cycle = 'lifetime';
  const p = await openVault(page, seed);
  const r = row(p, 'ChatGPT Plus');
  await expect(r).toContainText('买断');
  await expect(r).toContainText('无需续费');
  await expect(r).not.toContainText('已逾期');
  await expect(r.getByRole('button', { name: '我已续费' })).toHaveCount(0);
  await expect(p.getByText('2 项待处理')).toBeVisible();
  expect(await p.locator('main div.group h3').last().innerText()).toBe('ChatGPT Plus');
});

test('sorting compares converted monthly cost, not raw numbers', async ({ page }) => {
  const p = await openVault(page);
  await p.getByLabel('排序方式').selectOption('price');
  const names = await p.locator('main div.group h3').allInnerTexts();
  expect(names[0]).toBe('ChatGPT Plus'); // $20 (first of the two) beats ₹700 and ¥100
  expect(names.indexOf('SuperGrok')).toBeGreaterThan(names.indexOf('Kimi Plus'));
  await p.getByLabel('排序方式').selectOption('name');
  expect((await p.locator('main div.group h3').allInnerTexts())[0]).toBe('Bandwagon VPS');
});

test('filters, search and credentials', async ({ page }) => {
  const p = await openVault(page);
  await p.getByRole('button', { name: '开发与工具' }).click();
  await expect(p.locator('main div.group')).toHaveCount(1);
  await p.getByRole('button', { name: /全部/ }).click();
  await p.getByRole('button', { name: /仅待续费/ }).click();
  await expect(p.locator('main div.group')).toHaveCount(3);
  await p.getByRole('button', { name: /仅待续费/ }).click();

  await p.getByPlaceholder('搜索订阅名称或账号...').fill('kimi');
  await expect(p.locator('main div.group')).toHaveCount(1);
  await row(p, 'Kimi Plus').getByRole('button', { name: '显示密码' }).click();
  await expect(row(p, 'Kimi Plus')).toContainText('hunter2-note');
  await row(p, 'Kimi Plus').getByRole('button', { name: '复制密码' }).click();
  await expect.poll(() => clipboard(p)).toBe('hunter2-note');
});

test('smart text fills the form and saves; API keys become tokens', async ({ page }) => {
  const p = await openVault(page);
  await p.locator('header').getByRole('button', { name: '新建订阅' }).click();
  await p.getByText('发货邮件 / 文本粘贴').click();
  await p.locator('.fixed.inset-0 textarea').first().fill('服务: OpenAI API\n账号: k@x.io\nAPI Key: sk-proj-1234567890abcdefghijklmnopqrstuvwxyz\n到期日期: 2027-01-01\n金额: $5/月\n');
  await p.getByRole('button', { name: '确认并录入订阅' }).click();
  await expect(row(p, 'k@x.io')).toContainText('2027-01-01');
  await tab(p, 'Token 密钥');
  await expect(p.locator('main div.group')).toHaveCount(3);
});
