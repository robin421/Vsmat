export interface CurrencyDef {
  code: string;
  symbol: string;
  nameZh: string;
  flag: string;
  popularRank: number;
  rateToUSD: number; // 多少该货币等于 1 USD
  appStoreRegionName: string;
}

/**
 * aisubdeal.com 热门跨区订阅与全球主流 App Store 完整货币清单
 */
export const SUPPORTED_CURRENCIES: CurrencyDef[] = [
  // 热门低价与跨区订阅首选 (aisubdeal Top 推荐地区)
  { code: 'TRY', symbol: '₺', nameZh: '土耳其里拉', flag: '🇹🇷', popularRank: 1, rateToUSD: 34.5, appStoreRegionName: 'Apple 订阅 (土区)' },
  { code: 'PHP', symbol: '₱', nameZh: '菲律宾比索', flag: '🇵🇭', popularRank: 2, rateToUSD: 58.5, appStoreRegionName: 'Apple 订阅 (菲区)' },
  { code: 'PKR', symbol: 'Rs', nameZh: '巴基斯坦卢比', flag: '🇵🇰', popularRank: 3, rateToUSD: 278, appStoreRegionName: 'Apple 订阅 (巴区)' },
  { code: 'NGN', symbol: '₦', nameZh: '尼日利亚奈拉', flag: '🇳🇬', popularRank: 4, rateToUSD: 1680, appStoreRegionName: 'Apple 订阅 (尼区)' },
  { code: 'EGP', symbol: 'E£', nameZh: '埃及镑', flag: '🇪🇬', popularRank: 5, rateToUSD: 49.3, appStoreRegionName: 'Apple 订阅 (埃及)' },
  { code: 'ARS', symbol: '$', nameZh: '阿根廷比索', flag: '🇦🇷', popularRank: 6, rateToUSD: 1000, appStoreRegionName: 'Apple 订阅 (阿根廷)' },
  { code: 'BRL', symbol: 'R$', nameZh: '巴西雷亚尔', flag: '🇧🇷', popularRank: 7, rateToUSD: 5.8, appStoreRegionName: 'Apple 订阅 (巴西)' },
  { code: 'INR', symbol: '₹', nameZh: '印度卢比', flag: '🇮🇳', popularRank: 8, rateToUSD: 84.4, appStoreRegionName: 'Apple 订阅 (印区)' },
  { code: 'IDR', symbol: 'Rp', nameZh: '印尼卢比(盾)', flag: '🇮🇩', popularRank: 9, rateToUSD: 15700, appStoreRegionName: 'Apple 订阅 (印尼)' },
  { code: 'MYR', symbol: 'RM', nameZh: '马来西亚林吉特', flag: '🇲🇾', popularRank: 10, rateToUSD: 4.38, appStoreRegionName: 'Apple 订阅 (大马区)' },
  { code: 'VND', symbol: '₫', nameZh: '越南盾', flag: '🇻🇳', popularRank: 11, rateToUSD: 25300, appStoreRegionName: 'Apple 订阅 (越南区)' },
  { code: 'THB', symbol: '฿', nameZh: '泰铢', flag: '🇹🇭', popularRank: 12, rateToUSD: 34.2, appStoreRegionName: 'Apple 订阅 (泰区)' },
  { code: 'UAH', symbol: '₴', nameZh: '乌克兰格里夫纳', flag: '🇺🇦', popularRank: 13, rateToUSD: 41.3, appStoreRegionName: 'Apple 订阅 (乌克兰)' },
  { code: 'PLN', symbol: 'zł', nameZh: '波兰兹罗提', flag: '🇵🇱', popularRank: 14, rateToUSD: 4.02, appStoreRegionName: 'Apple 订阅 (波兰)' },
  { code: 'ZAR', symbol: 'R', nameZh: '南非兰特', flag: '🇿🇦', popularRank: 15, rateToUSD: 17.6, appStoreRegionName: 'Apple 订阅 (南非)' },
  { code: 'MXN', symbol: '$', nameZh: '墨西哥比索', flag: '🇲🇽', popularRank: 16, rateToUSD: 20.1, appStoreRegionName: 'Apple 订阅 (墨西哥)' },

  // 全球主流核心货币与亚太地区
  { code: 'USD', symbol: '$', nameZh: '美元', flag: '🇺🇸', popularRank: 20, rateToUSD: 1, appStoreRegionName: 'Apple 订阅 (美区)' },
  { code: 'CNY', symbol: '¥', nameZh: '人民币', flag: '🇨🇳', popularRank: 21, rateToUSD: 7.25, appStoreRegionName: 'Apple 订阅 (国区)' },
  { code: 'JPY', symbol: '¥', nameZh: '日元', flag: '🇯🇵', popularRank: 22, rateToUSD: 154, appStoreRegionName: 'Apple 订阅 (日区)' },
  { code: 'HKD', symbol: 'HK$', nameZh: '港币', flag: '🇭🇰', popularRank: 23, rateToUSD: 7.78, appStoreRegionName: 'Apple 订阅 (港区)' },
  { code: 'TWD', symbol: 'NT$', nameZh: '新台币', flag: '🇹🇼', popularRank: 24, rateToUSD: 32.2, appStoreRegionName: 'Apple 订阅 (台区)' },
  { code: 'SGD', symbol: 'S$', nameZh: '新加坡元', flag: '🇸🇬', popularRank: 25, rateToUSD: 1.32, appStoreRegionName: 'Apple 订阅 (新区)' },
  { code: 'EUR', symbol: '€', nameZh: '欧元', flag: '🇪🇺', popularRank: 26, rateToUSD: 0.92, appStoreRegionName: 'Apple 订阅 (欧区)' },
  { code: 'GBP', symbol: '£', nameZh: '英镑', flag: '🇬🇧', popularRank: 27, rateToUSD: 0.77, appStoreRegionName: 'Apple 订阅 (英区)' },
  { code: 'CAD', symbol: 'CA$', nameZh: '加拿大元', flag: '🇨🇦', popularRank: 28, rateToUSD: 1.39, appStoreRegionName: 'Apple 订阅 (加区)' },
  { code: 'AUD', symbol: 'AU$', nameZh: '澳大利亚元', flag: '🇦🇺', popularRank: 29, rateToUSD: 1.52, appStoreRegionName: 'Apple 订阅 (澳区)' },
  { code: 'KRW', symbol: '₩', nameZh: '韩元', flag: '🇰🇷', popularRank: 30, rateToUSD: 1380, appStoreRegionName: 'Apple 订阅 (韩区)' },
  { code: 'DKK', symbol: 'kr', nameZh: '丹麦克朗', flag: '🇩🇰', popularRank: 31, rateToUSD: 6.90, appStoreRegionName: 'Apple 订阅 (丹麦)' },
];

const CURRENCY_MAP: Record<string, CurrencyDef> = {};
for (const item of SUPPORTED_CURRENCIES) {
  CURRENCY_MAP[item.code.toUpperCase()] = item;
}

/**
 * 根据代码获取货币定义
 */
export function getCurrencyDef(code: string): CurrencyDef | undefined {
  if (!code) return undefined;
  return CURRENCY_MAP[code.toUpperCase()];
}

/**
 * 获取货币符号（如 ₺, ₱, Rs, $, ¥ 等）
 */
export function getCurrencySymbol(code: string): string {
  const def = getCurrencyDef(code);
  return def ? def.symbol : code;
}

/**
 * 将任意支持的货币金额换算为美元 (USD)
 */
export function convertToUSD(amount: number, currency: string, usdToCnyRate = 7.25): number {
  if (!amount || isNaN(amount)) return 0;
  const curr = (currency || 'USD').toUpperCase();
  if (curr === 'USD') return amount;
  if (curr === 'CNY') return amount / usdToCnyRate;

  const def = CURRENCY_MAP[curr];
  if (def && def.rateToUSD > 0) {
    return amount / def.rateToUSD;
  }
  return amount; // 未知货币默认按 1:1 处理
}

/** Monthly cost in USD. One-off lifetime purchases are not a recurring cost. */
export function monthlyAmountUSD(
  sub: { price: number; currency: string; cycle: string },
  usdToCnyRate?: number
): number {
  const usd = convertToUSD(sub.price, sub.currency, usdToCnyRate);
  switch (sub.cycle) {
    case 'lifetime': return 0;
    case 'quarterly': return usd / 3;
    case 'semi-annually': return usd / 6;
    case 'annually': return usd / 12;
    case 'prepaid': return usd / 3;
    default: return usd;
  }
}
