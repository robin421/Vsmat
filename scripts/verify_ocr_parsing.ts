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

  console.log('\n🧪 测试 Case 3: aisubdeal 热门菲区 ChatGPT Plus (PHP 999 & 28 November)...');
  const ocrOutputPhilippines = `
< Subscriptions
ChatGPT Plus
Renews 28 November
₱999.00
Options
`;
  const parsedPh = parseSmartText(ocrOutputPhilippines);
  if (parsedPh.currency !== 'PHP') throw new Error('Expected PHP, got ' + parsedPh.currency);
  if (parsedPh.price !== 999) throw new Error('Expected 999, got ' + parsedPh.price);
  if (parsedPh.paymentMethod !== 'Apple 订阅 (菲区)') throw new Error('Expected Apple 订阅 (菲区), got ' + parsedPh.paymentMethod);
  console.log('✅ 菲区验证通过！PHP 999.00, Apple 订阅 (菲区)');

  console.log('\n🧪 测试 Case 4: aisubdeal 热门巴基斯坦区 Claude Pro (PKR 4,900 & 15 December)...');
  const ocrOutputPakistan = `
< Subscriptions
Claude Pro
Renews 15 December
PKR 4,900
`;
  const parsedPk = parseSmartText(ocrOutputPakistan);
  if (parsedPk.currency !== 'PKR') throw new Error('Expected PKR, got ' + parsedPk.currency);
  if (parsedPk.price !== 4900) throw new Error('Expected 4900, got ' + parsedPk.price);
  if (parsedPk.paymentMethod !== 'Apple 订阅 (巴区)') throw new Error('Expected Apple 订阅 (巴区), got ' + parsedPk.paymentMethod);
  console.log('✅ 巴区验证通过！PKR 4900, Apple 订阅 (巴区)');

  console.log('\n🧪 测试 Case 5: 真实印度区 xAI SuperGrok 截图提取 (₹700 / 3700 & 18 November)...');
  const ocrOutputIndiaGrok = `
13:47 b= ssuyes "0 @5%
4 Subscriptions x
Active
Grok
ヴ superGrok 3700 >
Renews 18 November
Options
Renewal Receipt Emails ()
A receipt will be sent to you each time one of
your subscriptions renews. Receipts are
always available in Apple Account settings >
Purchase History.
`;
  const parsedIn = parseSmartText(ocrOutputIndiaGrok);
  console.log('印度区解析结果:');
  console.log('  服务名称:', parsedIn.serviceName);
  console.log('  服务标识:', parsedIn.serviceKey);
  console.log('  金额:', parsedIn.price);
  console.log('  币种:', parsedIn.currency);
  console.log('  下期续费日:', parsedIn.nextBillingDate);
  console.log('  支付方式:', parsedIn.paymentMethod);

  if (parsedIn.serviceKey !== 'grok') throw new Error('Expected grok, got ' + parsedIn.serviceKey);
  if (parsedIn.serviceName !== 'SuperGrok') throw new Error('Expected SuperGrok, got ' + parsedIn.serviceName);
  if (parsedIn.currency !== 'INR') throw new Error('Expected INR, got ' + parsedIn.currency);
  if (parsedIn.price !== 700) throw new Error('Expected 700, got ' + parsedIn.price);
  if (parsedIn.paymentMethod !== 'Apple 订阅 (印区)') throw new Error('Expected Apple 订阅 (印区), got ' + parsedIn.paymentMethod);
  if (!parsedIn.nextBillingDate?.endsWith('-11-18')) throw new Error('Expected date ending in -11-18, got ' + parsedIn.nextBillingDate);
  console.log('✅ 印度区验证通过！SuperGrok, ₹700 INR, Apple 订阅 (印区), 2026-11-18');
}

testOCRExtraction();
