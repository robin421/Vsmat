import { SubscriptionItem } from '../types';
import { SupportedLanguage } from '../i18n/types';
import { monthlyAmountUSD } from './currencies';

export const AISUBDEAL_BASE_URL = 'https://www.aisubdeal.com';
const CACHE_STORAGE_KEY = 'vsmat_aisubdeal_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface AiSubDealBenchmark {
  /** Slug on aisubdeal.com/pricing/{slug}/ */
  productSlug: string;
  /** Corresponding Vsmat preset key */
  serviceKey: string;
  /** Plan name e.g. Plus, Pro, Advanced */
  planName: string;
  /** US App Store / official baseline monthly price in USD */
  usPriceUSD: number;
  /** Cheapest global storefront info */
  cheapest: {
    countryCode: string;
    countryFlag: string;
    regionLabelZh: string;
    regionLabelEn: string;
    currency: string;
    localPrice: number;
    usdPrice: number;
    /** Percentage saved vs US price, e.g. 21 means 21% cheaper */
    savePercent: number;
    paymentMethodHint: string;
  };
}

/**
 * Curated & verified baseline snapshot from aisubdeal.com/datasets/subscription-prices/latest.json.
 * Guarantees 100% offline availability with zero network dependency required.
 */
export const AISUBDEAL_BENCHMARKS: Record<string, AiSubDealBenchmark> = {
  openai: {
    productSlug: 'chatgpt',
    serviceKey: 'openai',
    planName: 'Plus',
    usPriceUSD: 19.99,
    cheapest: {
      countryCode: 'PH',
      countryFlag: '🇵🇭',
      regionLabelZh: '菲律宾区',
      regionLabelEn: 'Philippines',
      currency: 'PHP',
      localPrice: 999,
      usdPrice: 15.84,
      savePercent: 21,
      paymentMethodHint: 'Apple 订阅 (菲区)',
    },
  },
  claude: {
    productSlug: 'claude',
    serviceKey: 'claude',
    planName: 'Pro',
    usPriceUSD: 20.0,
    cheapest: {
      countryCode: 'PK',
      countryFlag: '🇵🇰',
      regionLabelZh: '巴基斯坦区',
      regionLabelEn: 'Pakistan',
      currency: 'PKR',
      localPrice: 4900,
      usdPrice: 17.72,
      savePercent: 11,
      paymentMethodHint: 'Apple 订阅 (巴区)',
    },
  },
  gemini: {
    productSlug: 'gemini',
    serviceKey: 'gemini',
    planName: 'Advanced',
    usPriceUSD: 19.99,
    cheapest: {
      countryCode: 'EG',
      countryFlag: '🇪🇬',
      regionLabelZh: '埃及区',
      regionLabelEn: 'Egypt',
      currency: 'EGP',
      localPrice: 699.99,
      usdPrice: 12.99,
      savePercent: 35,
      paymentMethodHint: 'Apple 订阅 (埃及)',
    },
  },
  perplexity: {
    productSlug: 'perplexity',
    serviceKey: 'perplexity',
    planName: 'Pro',
    usPriceUSD: 19.99,
    cheapest: {
      countryCode: 'PH',
      countryFlag: '🇵🇭',
      regionLabelZh: '菲律宾区',
      regionLabelEn: 'Philippines',
      currency: 'PHP',
      localPrice: 999,
      usdPrice: 15.84,
      savePercent: 21,
      paymentMethodHint: 'Apple 订阅 (菲区)',
    },
  },
  github: {
    productSlug: 'copilot',
    serviceKey: 'github',
    planName: 'Pro',
    usPriceUSD: 19.99,
    cheapest: {
      countryCode: 'NG',
      countryFlag: '🇳🇬',
      regionLabelZh: '尼日利亚区',
      regionLabelEn: 'Nigeria',
      currency: 'NGN',
      localPrice: 17000,
      usdPrice: 12.61,
      savePercent: 37,
      paymentMethodHint: 'Apple 订阅 (尼区)',
    },
  },
  grok: {
    productSlug: 'grok',
    serviceKey: 'grok',
    planName: 'SuperGrok',
    usPriceUSD: 30.0,
    cheapest: {
      countryCode: 'IN',
      countryFlag: '🇮🇳',
      regionLabelZh: '印度区',
      regionLabelEn: 'India',
      currency: 'INR',
      localPrice: 700,
      usdPrice: 8.29,
      savePercent: 72,
      paymentMethodHint: 'Apple 订阅 (印区)',
    },
  },
  kimi: {
    productSlug: 'kimi',
    serviceKey: 'kimi',
    planName: 'Plus',
    usPriceUSD: 19.0,
    cheapest: {
      countryCode: 'PH',
      countryFlag: '🇵🇭',
      regionLabelZh: '菲律宾区',
      regionLabelEn: 'Philippines',
      currency: 'PHP',
      localPrice: 999,
      usdPrice: 15.84,
      savePercent: 17,
      paymentMethodHint: 'Apple 订阅 (菲区)',
    },
  },
  zhipu: {
    productSlug: 'glm',
    serviceKey: 'zhipu',
    planName: 'Lite',
    usPriceUSD: 18.0,
    cheapest: {
      countryCode: 'CN',
      countryFlag: '🇨🇳',
      regionLabelZh: '中国区',
      regionLabelEn: 'China',
      currency: 'CNY',
      localPrice: 118,
      usdPrice: 16.28,
      savePercent: 10,
      paymentMethodHint: 'Apple 订阅 (国区)',
    },
  },
  suno: {
    productSlug: 'suno',
    serviceKey: 'suno',
    planName: 'Pro',
    usPriceUSD: 10.0,
    cheapest: {
      countryCode: 'PK',
      countryFlag: '🇵🇰',
      regionLabelZh: '巴基斯坦区',
      regionLabelEn: 'Pakistan',
      currency: 'PKR',
      localPrice: 2450,
      usdPrice: 8.86,
      savePercent: 11,
      paymentMethodHint: 'Apple 订阅 (巴区)',
    },
  },
  runway: {
    productSlug: 'runway',
    serviceKey: 'runway',
    planName: 'Standard',
    usPriceUSD: 18.99,
    cheapest: {
      countryCode: 'PH',
      countryFlag: '🇵🇭',
      regionLabelZh: '菲律宾区',
      regionLabelEn: 'Philippines',
      currency: 'PHP',
      localPrice: 999,
      usdPrice: 15.84,
      savePercent: 17,
      paymentMethodHint: 'Apple 订阅 (菲区)',
    },
  },
  mistral: {
    productSlug: 'le-chat',
    serviceKey: 'mistral',
    planName: 'Pro',
    usPriceUSD: 14.98,
    cheapest: {
      countryCode: 'PH',
      countryFlag: '🇵🇭',
      regionLabelZh: '菲律宾区',
      regionLabelEn: 'Philippines',
      currency: 'PHP',
      localPrice: 748.75,
      usdPrice: 11.87,
      savePercent: 21,
      paymentMethodHint: 'Apple 订阅 (菲区)',
    },
  },
  poe: {
    productSlug: 'poe',
    serviceKey: 'poe',
    planName: 'Plus',
    usPriceUSD: 19.99,
    cheapest: {
      countryCode: 'PH',
      countryFlag: '🇵🇭',
      regionLabelZh: '菲律宾区',
      regionLabelEn: 'Philippines',
      currency: 'PHP',
      localPrice: 999,
      usdPrice: 15.84,
      savePercent: 21,
      paymentMethodHint: 'Apple 订阅 (菲区)',
    },
  },
  spotify: {
    productSlug: 'spotify',
    serviceKey: 'spotify',
    planName: 'Individual',
    usPriceUSD: 12.99,
    cheapest: {
      countryCode: 'NG',
      countryFlag: '🇳🇬',
      regionLabelZh: '尼日利亚区',
      regionLabelEn: 'Nigeria',
      currency: 'NGN',
      localPrice: 1600,
      usdPrice: 1.19,
      savePercent: 91,
      paymentMethodHint: 'Apple 订阅 (尼区)',
    },
  },
  netflix: {
    productSlug: 'netflix',
    serviceKey: 'netflix',
    planName: 'Standard',
    usPriceUSD: 19.99,
    cheapest: {
      countryCode: 'PK',
      countryFlag: '🇵🇰',
      regionLabelZh: '巴基斯坦区',
      regionLabelEn: 'Pakistan',
      currency: 'PKR',
      localPrice: 800,
      usdPrice: 2.89,
      savePercent: 86,
      paymentMethodHint: 'Apple 订阅 (巴区)',
    },
  },
  youtube: {
    productSlug: 'youtube',
    serviceKey: 'youtube',
    planName: 'Premium',
    usPriceUSD: 20.99,
    cheapest: {
      countryCode: 'NG',
      countryFlag: '🇳🇬',
      regionLabelZh: '尼日利亚区',
      regionLabelEn: 'Nigeria',
      currency: 'NGN',
      localPrice: 2200,
      usdPrice: 1.63,
      savePercent: 92,
      paymentMethodHint: 'Apple 订阅 (尼区)',
    },
  },
  capcut: {
    productSlug: 'capcut',
    serviceKey: 'capcut',
    planName: 'Pro',
    usPriceUSD: 19.99,
    cheapest: {
      countryCode: 'PH',
      countryFlag: '🇵🇭',
      regionLabelZh: '菲律宾区',
      regionLabelEn: 'Philippines',
      currency: 'PHP',
      localPrice: 480,
      usdPrice: 7.61,
      savePercent: 62,
      paymentMethodHint: 'Apple 订阅 (菲区)',
    },
  },
  cursor: {
    productSlug: 'cursor',
    serviceKey: 'cursor',
    planName: 'Pro',
    usPriceUSD: 20.0,
    cheapest: {
      countryCode: 'US',
      countryFlag: '🇺🇸',
      regionLabelZh: '美区直订',
      regionLabelEn: 'United States',
      currency: 'USD',
      localPrice: 20,
      usdPrice: 20.0,
      savePercent: 0,
      paymentMethodHint: 'Apple 订阅 (美区)',
    },
  },
  midjourney: {
    productSlug: 'midjourney',
    serviceKey: 'midjourney',
    planName: 'Basic',
    usPriceUSD: 10.0,
    cheapest: {
      countryCode: 'US',
      countryFlag: '🇺🇸',
      regionLabelZh: '美区直订',
      regionLabelEn: 'United States',
      currency: 'USD',
      localPrice: 10,
      usdPrice: 10.0,
      savePercent: 0,
      paymentMethodHint: '虚拟信用卡',
    },
  },
  windsurf: {
    productSlug: 'windsurf',
    serviceKey: 'windsurf',
    planName: 'Pro',
    usPriceUSD: 15.0,
    cheapest: {
      countryCode: 'US',
      countryFlag: '🇺🇸',
      regionLabelZh: '美区直订',
      regionLabelEn: 'United States',
      currency: 'USD',
      localPrice: 15,
      usdPrice: 15.0,
      savePercent: 0,
      paymentMethodHint: '虚拟信用卡',
    },
  },
  elevenlabs: {
    productSlug: 'elevenlabs',
    serviceKey: 'elevenlabs',
    planName: 'Starter',
    usPriceUSD: 5.0,
    cheapest: {
      countryCode: 'US',
      countryFlag: '🇺🇸',
      regionLabelZh: '美区直订',
      regionLabelEn: 'United States',
      currency: 'USD',
      localPrice: 5,
      usdPrice: 5.0,
      savePercent: 0,
      paymentMethodHint: '虚拟信用卡',
    },
  },
  deepseek: {
    productSlug: 'deepseek',
    serviceKey: 'deepseek',
    planName: 'API',
    usPriceUSD: 10.0,
    cheapest: {
      countryCode: 'CN',
      countryFlag: '🇨🇳',
      regionLabelZh: '官方直充',
      regionLabelEn: 'China',
      currency: 'CNY',
      localPrice: 50,
      usdPrice: 6.9,
      savePercent: 31,
      paymentMethodHint: '微信 / 支付宝',
    },
  },
};

/**
 * Alias lookup table mapping aisubdeal slugs & common names to Vsmat serviceKey
 */
export const SLUG_TO_SERVICE_KEY: Record<string, string> = {
  chatgpt: 'openai',
  openai: 'openai',
  claude: 'claude',
  anthropic: 'claude',
  gemini: 'gemini',
  google: 'gemini',
  perplexity: 'perplexity',
  copilot: 'github',
  github: 'github',
  grok: 'grok',
  x: 'grok',
  supergrok: 'grok',
  kimi: 'kimi',
  glm: 'zhipu',
  zhipu: 'zhipu',
  suno: 'suno',
  runway: 'runway',
  'le-chat': 'mistral',
  mistral: 'mistral',
  poe: 'poe',
  spotify: 'spotify',
  netflix: 'netflix',
  youtube: 'youtube',
  capcut: 'capcut',
  cursor: 'cursor',
  midjourney: 'midjourney',
  windsurf: 'windsurf',
  elevenlabs: 'elevenlabs',
  deepseek: 'deepseek',
};

/**
 * Currency code to aisubdeal gift card country slug mapping
 */
const CURRENCY_TO_GIFT_CARD_SLUG: Record<string, string> = {
  TRY: 'turkey',
  PHP: 'philippines',
  PKR: 'pakistan',
  NGN: 'nigeria',
  BRL: 'brazil',
  INR: 'india',
  IDR: 'indonesia',
  JPY: 'japan',
  USD: 'united-states',
  CAD: 'canada',
};

/**
 * Currency code to aisubdeal tax-free billing address country code mapping
 */
const CURRENCY_TO_ADDRESS_CC: Record<string, string> = {
  PHP: 'ph',
  PKR: 'pk',
  NGN: 'ng',
  EGP: 'eg',
  ARS: 'ar',
  BRL: 'br',
  INR: 'in',
  MXN: 'mx',
  USD: 'us',
  CAD: 'ca',
  JPY: 'jp',
  KRW: 'kr',
  GBP: 'gb',
  EUR: 'fr',
  AUD: 'au',
  DKK: 'dk',
};

const COUNTRY_FLAG_MAP: Record<string, { flag: string; zh: string; en: string; hint: string }> = {
  TR: { flag: '🇹🇷', zh: '土耳其区', en: 'Turkey', hint: 'Apple 订阅 (土区)' },
  PH: { flag: '🇵🇭', zh: '菲律宾区', en: 'Philippines', hint: 'Apple 订阅 (菲区)' },
  PK: { flag: '🇵🇰', zh: '巴基斯坦区', en: 'Pakistan', hint: 'Apple 订阅 (巴区)' },
  NG: { flag: '🇳🇬', zh: '尼日利亚区', en: 'Nigeria', hint: 'Apple 订阅 (尼区)' },
  EG: { flag: '🇪🇬', zh: '埃及区', en: 'Egypt', hint: 'Apple 订阅 (埃及)' },
  IN: { flag: '🇮🇳', zh: '印度区', en: 'India', hint: 'Apple 订阅 (印区)' },
  ID: { flag: '🇮🇩', zh: '印尼区', en: 'Indonesia', hint: 'Apple 订阅 (印尼)' },
  BR: { flag: '🇧🇷', zh: '巴西区', en: 'Brazil', hint: 'Apple 订阅 (巴西)' },
  AR: { flag: '🇦🇷', zh: '阿根廷区', en: 'Argentina', hint: 'Apple 订阅 (阿根廷)' },
  MY: { flag: '🇲🇾', zh: '马来西亚区', en: 'Malaysia', hint: 'Apple 订阅 (大马区)' },
  VN: { flag: '🇻🇳', zh: '越南区', en: 'Vietnam', hint: 'Apple 订阅 (越南区)' },
  JP: { flag: '🇯🇵', zh: '日本区', en: 'Japan', hint: 'Apple 订阅 (日区)' },
  CN: { flag: '🇨🇳', zh: '中国区', en: 'China', hint: 'Apple 订阅 (国区)' },
  US: { flag: '🇺🇸', zh: '美国区', en: 'United States', hint: 'Apple 订阅 (美区)' },
};

/**
 * Build a localized aisubdeal.com URL with UTM source tracking.
 * Matches Vsmat's 4 languages ('zh' | 'en' | 'ja' | 'ko') to aisubdeal's exact locale prefixes.
 */
export function buildAiSubDealUrl(
  path = '/',
  lang: SupportedLanguage = 'zh',
  extraParams?: Record<string, string>
): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const normalizedPath = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  const langPrefix = lang === 'en' ? '' : `/${lang}`;
  const url = new URL(`${AISUBDEAL_BASE_URL}${langPrefix}${normalizedPath}`);
  url.searchParams.set('utm_source', 'vsmat');
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) {
      if (v) url.searchParams.set(k, v);
    }
  }
  return url.toString();
}

/**
 * Resolve canonical Vsmat serviceKey from any serviceKey, aisubdeal slug, or name
 */
export function resolveServiceKey(keyOrSlug?: string, serviceName?: string): string {
  if (keyOrSlug) {
    const clean = keyOrSlug.trim().toLowerCase();
    if (SLUG_TO_SERVICE_KEY[clean]) return SLUG_TO_SERVICE_KEY[clean];
    if (AISUBDEAL_BENCHMARKS[clean]) return clean;
  }
  if (serviceName) {
    const lower = serviceName.toLowerCase();
    for (const [slug, mappedKey] of Object.entries(SLUG_TO_SERVICE_KEY)) {
      if (lower.includes(slug)) return mappedKey;
    }
  }
  return keyOrSlug || 'custom';
}

/**
 * Get benchmark data for a service if available
 */
export function getSubscriptionBenchmark(
  serviceKeyOrSlug?: string,
  serviceName?: string
): AiSubDealBenchmark | undefined {
  const resolved = resolveServiceKey(serviceKeyOrSlug, serviceName);
  return AISUBDEAL_BENCHMARKS[resolved];
}

/**
 * Get the localized aisubdeal.com pricing comparison URL for a service
 */
export function getServicePricingUrl(
  serviceKeyOrSlug?: string,
  lang: SupportedLanguage = 'zh',
  serviceName?: string,
  medium?: string
): string {
  const extra = medium ? { utm_medium: medium } : undefined;
  const benchmark = getSubscriptionBenchmark(serviceKeyOrSlug, serviceName);
  if (benchmark) {
    return buildAiSubDealUrl(`/pricing/${benchmark.productSlug}/`, lang, extra);
  }
  return buildAiSubDealUrl('/pricing/', lang, extra);
}

/**
 * Get the localized aisubdeal.com Apple Gift Card regional buying guide URL
 */
export function getGiftCardGuideUrl(
  currencyCode?: string,
  lang: SupportedLanguage = 'zh',
  medium?: string
): string {
  const extra = medium ? { utm_medium: medium } : undefined;
  const code = (currencyCode || '').toUpperCase();
  const slug = CURRENCY_TO_GIFT_CARD_SLUG[code];
  if (slug) {
    return buildAiSubDealUrl(`/gift-cards/${slug}/`, lang, extra);
  }
  return buildAiSubDealUrl('/gift-cards/', lang, extra);
}

/**
 * Get the localized aisubdeal.com tax-free billing address generator URL
 */
export function getAddressToolUrl(
  currencyCode?: string,
  lang: SupportedLanguage = 'zh',
  medium?: string
): string {
  const extra = medium ? { utm_medium: medium } : undefined;
  const code = (currencyCode || '').toUpperCase();
  const cc = CURRENCY_TO_ADDRESS_CC[code];
  if (cc) {
    return buildAiSubDealUrl(`/address/${cc}/`, lang, extra);
  }
  return buildAiSubDealUrl('/address/', lang, extra);
}

export interface SubscriptionDealEvaluation {
  benchmark: AiSubDealBenchmark;
  userMonthlyUSD: number;
  usBaselineUSD: number;
  floorMonthlyUSD: number;
  /** How much user currently saves per month vs US official price (USD) */
  savedVsUsUSD: number;
  /** Percentage currently saved vs US official price (0-99) */
  savedVsUsPercent: number;
  /** How much MORE user could save per month by switching to the cheapest region (USD) */
  potentialExtraSaveUSD: number;
  /** Percentage user could save compared to their current monthly spend */
  potentialExtraSavePercent: number;
  /** Whether the user is already on a discounted regional plan (saving >= 5% vs US) */
  isAlreadyDiscounted: boolean;
  /** Whether switching to the floor region can save at least $1.50/mo and >= 8% */
  canOptimizeFurther: boolean;
}

/**
 * Compare a user's subscription against AISubDeal's US baseline and global floor price
 */
export function evaluateSubscriptionDeal(
  sub: Pick<SubscriptionItem, 'serviceKey' | 'name' | 'price' | 'currency' | 'cycle'>,
  usdToCnyRate = 7.25
): SubscriptionDealEvaluation | null {
  if (sub.cycle === 'lifetime' || sub.price <= 0) return null;
  const benchmark = getSubscriptionBenchmark(sub.serviceKey, sub.name);
  if (!benchmark) return null;

  const userMonthlyUSD = monthlyAmountUSD(sub, usdToCnyRate);
  if (userMonthlyUSD <= 0) return null;

  const usBaselineUSD = benchmark.usPriceUSD;
  const floorMonthlyUSD = benchmark.cheapest.usdPrice;

  const savedVsUsUSD = Math.max(0, usBaselineUSD - userMonthlyUSD);
  const savedVsUsPercent =
    usBaselineUSD > 0 ? Math.max(0, Math.round((savedVsUsUSD / usBaselineUSD) * 100)) : 0;

  const potentialExtraSaveUSD = Math.max(0, userMonthlyUSD - floorMonthlyUSD);
  const potentialExtraSavePercent =
    userMonthlyUSD > 0
      ? Math.max(0, Math.round((potentialExtraSaveUSD / userMonthlyUSD) * 100))
      : 0;

  const isAlreadyDiscounted = savedVsUsPercent >= 5 && savedVsUsUSD >= 0.8;
  const canOptimizeFurther =
    potentialExtraSaveUSD >= 1.2 && potentialExtraSavePercent >= 8 && benchmark.cheapest.savePercent > 0;

  return {
    benchmark,
    userMonthlyUSD,
    usBaselineUSD,
    floorMonthlyUSD,
    savedVsUsUSD,
    savedVsUsPercent,
    potentialExtraSaveUSD,
    potentialExtraSavePercent,
    isAlreadyDiscounted,
    canOptimizeFurther,
  };
}

export interface PortfolioSavingsSummary {
  /** Total monthly USD saved across all active subscriptions compared to US baseline */
  totalSavedVsUsMonthlyUSD: number;
  /** Total annual USD saved compared to US baseline */
  totalSavedVsUsAnnualUSD: number;
  /** Total additional monthly USD the user could save by switching to floor regions */
  totalPotentialExtraMonthlyUSD: number;
  /** Total additional annual USD the user could save */
  totalPotentialExtraAnnualUSD: number;
  /** Subscriptions that can be optimized further, sorted by highest potential savings */
  optimizableItems: Array<{
    subscription: SubscriptionItem;
    evaluation: SubscriptionDealEvaluation;
  }>;
  /** Count of subscriptions already enjoying regional discounts */
  discountedCount: number;
}

/**
 * Summarize regional pricing savings and optimization opportunities across all subscriptions
 */
export function summarizePortfolioSavings(
  subscriptions: SubscriptionItem[],
  usdToCnyRate = 7.25
): PortfolioSavingsSummary {
  let totalSavedVsUsMonthlyUSD = 0;
  let totalPotentialExtraMonthlyUSD = 0;
  let discountedCount = 0;
  const optimizableItems: Array<{
    subscription: SubscriptionItem;
    evaluation: SubscriptionDealEvaluation;
  }> = [];

  for (const sub of subscriptions) {
    const evalResult = evaluateSubscriptionDeal(sub, usdToCnyRate);
    if (!evalResult) continue;

    if (evalResult.isAlreadyDiscounted) {
      totalSavedVsUsMonthlyUSD += evalResult.savedVsUsUSD;
      discountedCount += 1;
    }

    if (evalResult.canOptimizeFurther) {
      totalPotentialExtraMonthlyUSD += evalResult.potentialExtraSaveUSD;
      optimizableItems.push({ subscription: sub, evaluation: evalResult });
    }
  }

  optimizableItems.sort(
    (a, b) => b.evaluation.potentialExtraSaveUSD - a.evaluation.potentialExtraSaveUSD
  );

  return {
    totalSavedVsUsMonthlyUSD,
    totalSavedVsUsAnnualUSD: totalSavedVsUsMonthlyUSD * 12,
    totalPotentialExtraMonthlyUSD,
    totalPotentialExtraAnnualUSD: totalPotentialExtraMonthlyUSD * 12,
    optimizableItems,
    discountedCount,
  };
}

interface RawDatasetRow {
  productSlug?: string;
  plan?: string;
  countryCode?: string;
  localPrice?: number;
  localCurrency?: string;
  usdPrice?: number;
  vsUSPercent?: number;
  planStatus?: string;
}

/**
 * Apply rows from aisubdeal's latest.json dataset to update in-memory benchmarks.
 */
function applyDatasetRows(rows: RawDatasetRow[]): void {
  if (!Array.isArray(rows)) return;
  const bySlug: Record<string, RawDatasetRow[]> = {};
  for (const r of rows) {
    if (!r || r.planStatus !== 'current' || !r.productSlug || typeof r.usdPrice !== 'number') continue;
    if (!bySlug[r.productSlug]) bySlug[r.productSlug] = [];
    bySlug[r.productSlug].push(r);
  }

  for (const benchmark of Object.values(AISUBDEAL_BENCHMARKS)) {
    const slugRows = bySlug[benchmark.productSlug];
    if (!slugRows || slugRows.length === 0) continue;

    // Filter rows matching the primary plan name if available
    const planMatches = slugRows.filter(
      (r) => r.plan && r.plan.toLowerCase() === benchmark.planName.toLowerCase()
    );
    const candidates = planMatches.length > 0 ? planMatches : slugRows;
    candidates.sort((a, b) => (a.usdPrice ?? 9999) - (b.usdPrice ?? 9999));

    const minRow = candidates[0];
    const usRow = candidates.find((r) => r.countryCode === 'US');

    if (usRow && typeof usRow.usdPrice === 'number' && usRow.usdPrice > 0) {
      benchmark.usPriceUSD = usRow.usdPrice;
    }

    if (
      minRow &&
      minRow.countryCode &&
      minRow.localCurrency &&
      typeof minRow.localPrice === 'number' &&
      typeof minRow.usdPrice === 'number'
    ) {
      const cc = minRow.countryCode.toUpperCase();
      const meta = COUNTRY_FLAG_MAP[cc];
      const savePct =
        typeof minRow.vsUSPercent === 'number' && minRow.vsUSPercent < 0
          ? Math.abs(Math.round(minRow.vsUSPercent))
          : benchmark.usPriceUSD > minRow.usdPrice
          ? Math.round(((benchmark.usPriceUSD - minRow.usdPrice) / benchmark.usPriceUSD) * 100)
          : 0;

      benchmark.cheapest = {
        countryCode: cc,
        countryFlag: meta?.flag || '🌐',
        regionLabelZh: meta?.zh || `${cc} 区`,
        regionLabelEn: meta?.en || cc,
        currency: minRow.localCurrency.toUpperCase(),
        localPrice: minRow.localPrice,
        usdPrice: minRow.usdPrice,
        savePercent: Math.max(0, savePct),
        paymentMethodHint: meta?.hint || `Apple 订阅 (${cc})`,
      };
    }
  }
}

/**
 * Silent, non-blocking sync with aisubdeal.com's price dataset cache.
 * Respects strict offline-first CSP (`connect-src 'self'`) by reading cached dataset rows
 * without making unsolicited cross-origin requests unless explicitly requested.
 */
export async function syncAiSubDealDataset(options?: { allowNetwork?: boolean }): Promise<boolean> {
  try {
    const cachedRaw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (cachedRaw) {
      const parsed = JSON.parse(cachedRaw) as { timestamp: number; data: RawDatasetRow[] };
      if (parsed?.data && Array.isArray(parsed.data)) {
        applyDatasetRows(parsed.data);
        if (!options?.allowNetwork || Date.now() - (parsed.timestamp || 0) < CACHE_TTL_MS) {
          return true;
        }
      }
    }
  } catch {
    // Ignore storage read errors
  }

  if (!options?.allowNetwork) {
    return true;
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(`${AISUBDEAL_BASE_URL}/datasets/subscription-prices/latest.json`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);

    if (!res.ok) return false;
    const json = (await res.json()) as { data?: RawDatasetRow[] };
    if (json?.data && Array.isArray(json.data)) {
      applyDatasetRows(json.data);
      try {
        localStorage.setItem(
          CACHE_STORAGE_KEY,
          JSON.stringify({ timestamp: Date.now(), data: json.data })
        );
      } catch {
        // Ignore quota errors
      }
      return true;
    }
  } catch {
    // Offline or CORS blocked — built-in snapshot remains active
  }
  return false;
}
