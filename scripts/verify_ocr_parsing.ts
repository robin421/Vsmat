import { parseSmartText } from '../src/lib/parser';

function testOCRExtraction() {
  console.log('🧪 开始测试 Apple 订阅截图 OCR 文本语义提取...\n');

  const ocrOutputFromUserImage = `
21:12 4 1 人 53
< サブ スク リプ ショ ン XX
有効
Claude
¥* Claude Pro - Monthly ~~ ¥3,000
更新 日 : 11 月 14 日
オプ ショ ン
low Apple One
バン ドル する と 、
も っ と 楽し め ま す 。Apple TV、
Apple Music、
Apple Arcade な ど を 、
お 得 な 月 額 料 金 で 楽し み ま し ょ う 。
無料 で 体験 する
更新 の 領収 書 メ ー ル 49%
`;

  const parsed = parseSmartText(ocrOutputFromUserImage);

  console.log('解析结果:');
  console.log('  服务名称:', parsed.serviceName);
  console.log('  服务标识:', parsed.serviceKey);
  console.log('  周期:', parsed.cycle);
  console.log('  金额:', parsed.price);
  console.log('  币种:', parsed.currency);
  console.log('  下期续费日:', parsed.nextBillingDate);
  console.log('  支付方式:', parsed.paymentMethod);

  if (parsed.serviceKey !== 'claude') throw new Error('Service key should be claude');
  if (parsed.price !== 3000) throw new Error('Price should be 3000, got: ' + parsed.price);
  if (parsed.currency !== 'JPY') throw new Error('Currency should be JPY, got: ' + parsed.currency);
  if (parsed.cycle !== 'monthly') throw new Error('Cycle should be monthly, got: ' + parsed.cycle);
  if (!parsed.nextBillingDate?.endsWith('-11-14')) throw new Error('Renewal date should end with -11-14, got: ' + parsed.nextBillingDate);

  console.log('\n✅ 验证 100% 通过！用户 Apple 订阅截图成功自动提取出 Claude Pro, ¥3,000 JPY, 11月14日！');

  console.log('\n🧪 测试 Case 2: Apple 土区 ChatGPT Plus 截图提取 (₺499,99 & 4 December)...');
  const ocrOutputTurkeyChatGPT = `
13:14
< Subscriptions X
Active
ChatGPT
ChatGPT Plus
Continues
4 December
₺499,99 >
Options
Renewal Receipt Emails
`;

  const parsedTurkey = parseSmartText(ocrOutputTurkeyChatGPT);
  console.log('土区解析结果:');
  console.log('  服务名称:', parsedTurkey.serviceName);
  console.log('  服务标识:', parsedTurkey.serviceKey);
  console.log('  金额:', parsedTurkey.price);
  console.log('  币种:', parsedTurkey.currency);
  console.log('  下期续费日:', parsedTurkey.nextBillingDate);
  console.log('  支付方式:', parsedTurkey.paymentMethod);

  if (parsedTurkey.serviceKey !== 'openai') throw new Error('Service key should be openai');
  if (parsedTurkey.price !== 499.99) throw new Error('Price should be 499.99, got: ' + parsedTurkey.price);
  if (parsedTurkey.currency !== 'TRY') throw new Error('Currency should be TRY, got: ' + parsedTurkey.currency);
  if (parsedTurkey.paymentMethod !== 'Apple 订阅 (土区)') throw new Error('Payment method should be Apple 订阅 (土区), got: ' + parsedTurkey.paymentMethod);
  if (!parsedTurkey.nextBillingDate?.endsWith('-12-04')) throw new Error('Renewal date should end with -12-04, got: ' + parsedTurkey.nextBillingDate);

  console.log('\n✅ 验证 100% 通过！土区 Apple 订阅截图成功自动提取出 ChatGPT Plus, ₺499.99 TRY, 12月04日！');
}

testOCRExtraction();
