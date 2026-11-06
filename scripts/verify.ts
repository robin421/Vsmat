import { parseSmartText } from '../src/lib/parser';
import { sanitizeVoucherCode, detectVoucherService, execute1ClickRecharge } from '../src/lib/rechargeEngines';
import { generateICalendarData } from '../src/lib/calendar';
import { generateSalt, deriveKey, encryptWithKey, decryptWithKey } from '../src/lib/crypto';
import { advanceBillingDate } from '../src/lib/storage';
import { SubscriptionItem } from '../src/types';

async function runTests() {
  console.log('🚀 开始验证 Vsmat 核心逻辑...\n');

  // 1. Web Crypto (AES-256-GCM + PBKDF2)
  console.log('1️⃣ 测试 Web Crypto 加解密与主密码验证:');
  const salt = generateSalt();
  const password = 'MyMasterSecretPassword2026!';
  const key = await deriveKey(password, salt);

  const secretPlain = 'sk-proj-super-secret-api-key-test-123456';
  const cipher = await encryptWithKey(secretPlain, key);
  const decrypted = await decryptWithKey(cipher, key);
  if (decrypted !== secretPlain) throw new Error('Decryption mismatch');
  console.log('   ✓ AES-256-GCM 加密与解密回环匹配成功');

  try {
    await decryptWithKey(cipher, await deriveKey('WrongPassword', salt));
    throw new Error('Should have failed with wrong password');
  } catch (err: any) {
    if (err.name !== 'WrongPasswordError') throw err;
    console.log('   ✓ 错误密码解密拦截验证通过:', err.message);
  }

  // 2. Smart Paste Parser
  console.log('\n2️⃣ 测试智能文本解析引擎 (Smart Paste Parser):');
  const sampleText1 = `
服务: OpenAI ChatGPT Plus
账号: my_developer_account@gmail.com
密码: MyStrongPassword!2026
API Key: sk-proj-1234567890abcdefghijklmnopqrstuvwxyz
到期日期: 2026-11-28
金额: $20/月
备注: 绑定了主力卡
`;
  const res1 = parseSmartText(sampleText1);
  if (res1.serviceKey !== 'openai') throw new Error('Service key mismatch: ' + res1.serviceKey);
  if (res1.accountEmail !== 'my_developer_account@gmail.com') throw new Error('Email mismatch');
  if (res1.password !== 'MyStrongPassword!2026') throw new Error('Password mismatch');
  if (!res1.apiKey?.startsWith('sk-proj-')) throw new Error('API key mismatch');
  if (res1.price !== 20 || res1.currency !== 'USD') throw new Error('Price mismatch');
  if (res1.nextBillingDate !== '2026-11-28') throw new Error('Date mismatch');
  console.log('   ✓ 结构化发卡/邮件文本解析成功:', {
    service: res1.serviceName,
    email: res1.accountEmail,
    price: `${res1.currency} ${res1.price}`,
    date: res1.nextBillingDate
  });

  const sampleText2 = `vip_user@outlook.com----SuperPass9988----sk-ant-api03-abcdef123456`;
  const res2 = parseSmartText(sampleText2);
  if (res2.accountEmail !== 'vip_user@outlook.com') throw new Error('Delimiter email failed');
  if (res2.password !== 'SuperPass9988') throw new Error('Delimiter pass failed');
  if (res2.apiKey !== 'sk-ant-api03-abcdef123456') throw new Error('Delimiter key failed');
  console.log('   ✓ 分隔符格式 (----) 解析成功:', {
    email: res2.accountEmail,
    pass: res2.password,
    key: res2.apiKey?.slice(0, 10) + '...'
  });

  // 3. Recharge Engine & Voucher Detection
  console.log('\n3️⃣ 测试礼品券与直充引擎 (Recharge Engines):');
  const appleCode = 'X89A-24B8-90CD-EF12';
  const detectedApple = detectVoucherService(appleCode);
  if (detectedApple?.key !== 'apple') throw new Error('Apple code detection failed');
  console.log('   ✓ 成功识别 Apple 礼品卡代码，直达模式支持:', detectedApple.directRedeemUrlPattern);

  const steamCode = 'AAAAA-BBBBB-CCCCC';
  const detectedSteam = detectVoucherService(steamCode);
  if (detectedSteam?.key !== 'steam') throw new Error('Steam code detection failed');
  console.log('   ✓ 成功识别 Steam 充值卡代码');

  // 4. Billing date advancement
  console.log('\n4️⃣ 测试续费周期顺延 (Advance Billing Date):');
  const d1 = advanceBillingDate('2026-11-05', 'monthly');
  if (d1 !== '2026-12-05') throw new Error('Monthly advance failed: ' + d1);
  const d2 = advanceBillingDate('2026-11-05', 'annually');
  if (d2 !== '2027-11-05') throw new Error('Annually advance failed: ' + d2);
  console.log('   ✓ 月付续费顺延至:', d1);
  console.log('   ✓ 年付续费顺延至:', d2);

  // 5. Calendar .ics generation
  console.log('\n5️⃣ 测试系统日历 (.ics) 闹钟导出:');
  const mockSub: SubscriptionItem = {
    id: 'sub-test-1',
    name: 'ChatGPT Plus 续费测试',
    serviceKey: 'openai',
    category: 'ai',
    accountEmail: 'test@example.com',
    cycle: 'monthly',
    price: 20,
    currency: 'USD',
    nextBillingDate: '2026-11-20',
    autoRenew: true,
    portalUrl: 'https://chatgpt.com',
    history: [],
    createdAt: '2026-11-01',
    updatedAt: '2026-11-01',
  };
  const icsData = generateICalendarData([mockSub]);
  if (!icsData.includes('BEGIN:VCALENDAR') || !icsData.includes('TRIGGER:-P3D') || !icsData.includes('TRIGGER:-P1D')) {
    throw new Error('ICS missing alarm tags');
  }
  console.log('   ✓ RFC 5545 日历数据生成成功，包含提前 3 天与 1 天系统闹钟');

  console.log('\n🎉 全部核心功能测试 100% 验证通过！');
}

runTests().catch(err => {
  console.error('❌ 测试失败:', err);
  process.exit(1);
});
