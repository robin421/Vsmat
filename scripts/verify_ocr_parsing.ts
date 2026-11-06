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
}

testOCRExtraction();
