import { BillingCycle, SubscriptionItem } from '../types';
import { getPresetByKey } from '../types/presets';
import { getCurrencyDef } from './currencies';
import { getSubscriptionBenchmark, resolveServiceKey } from './aisubdeal';
import { todayLocal } from './date';

const VALID_CYCLES: BillingCycle[] = [
  'monthly',
  'quarterly',
  'semi-annually',
  'annually',
  'prepaid',
  'lifetime',
];

function addMonthsToToday(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Parse URL query parameters for 1-click subscription import from aisubdeal.com.
 *
 * Supported formats:
 * 1) Full parameters:
 *    ?action=import_sub&service=chatgpt&name=ChatGPT+Plus&price=999&currency=PHP&cycle=monthly&region=PH
 * 2) Shorthand service slug (auto-fills aisubdeal floor price):
 *    ?aisubdeal=chatgpt
 */
export function parseUrlImportParams(search: string): Partial<SubscriptionItem> | null {
  if (!search || !search.includes('=')) return null;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
  } catch {
    return null;
  }

  const action = params.get('action')?.trim().toLowerCase();
  const aisubdealQuickSlug = params.get('aisubdeal')?.trim();
  const rawService = params.get('service')?.trim() || aisubdealQuickSlug || '';

  if (action !== 'import_sub' && !aisubdealQuickSlug) {
    return null;
  }

  const serviceKey = resolveServiceKey(rawService, params.get('name') || undefined);
  const preset = getPresetByKey(serviceKey);
  const benchmark = getSubscriptionBenchmark(serviceKey, params.get('name') || undefined);

  const rawPlan = params.get('plan')?.trim();
  const rawName = params.get('name')?.trim();
  const defaultName =
    rawName ||
    (preset.key !== 'custom'
      ? rawPlan && !preset.name.toLowerCase().includes(rawPlan.toLowerCase())
        ? `${preset.name} (${rawPlan})`
        : preset.name
      : rawService || 'AI Subscription');

  // Price & Currency: explicit params take precedence, then aisubdeal floor price, then preset default
  const rawPrice = params.get('price')?.trim();
  const parsedPrice = rawPrice ? parseFloat(rawPrice) : NaN;
  const price =
    !isNaN(parsedPrice) && parsedPrice >= 0
      ? parsedPrice
      : benchmark?.cheapest.localPrice ?? preset.defaultPrice ?? 20;

  const rawCurrency = params.get('currency')?.trim().toUpperCase();
  const currency =
    rawCurrency && /^[A-Z]{3}$/.test(rawCurrency)
      ? rawCurrency
      : benchmark?.cheapest.currency ?? preset.defaultCurrency ?? 'USD';

  const rawCycle = params.get('cycle')?.trim().toLowerCase() as BillingCycle | undefined;
  const cycle: BillingCycle =
    rawCycle && VALID_CYCLES.includes(rawCycle)
      ? rawCycle
      : preset.defaultCycle || 'monthly';

  const currencyDef = getCurrencyDef(currency);
  const rawPaymentMethod = params.get('payment')?.trim();
  const paymentMethod =
    rawPaymentMethod ||
    currencyDef?.appStoreRegionName ||
    benchmark?.cheapest.paymentMethodHint ||
    '';

  const nextBillingDate =
    params.get('nextBillingDate')?.trim() ||
    (cycle === 'annually' ? addMonthsToToday(12) : addMonthsToToday(1));

  const notes =
    params.get('notes')?.trim() ||
    (benchmark
      ? `来自 AISubDeal 比价导入 (${benchmark.cheapest.countryFlag} ${currency} ${price})`
      : '来自 AISubDeal 一键导入');

  return {
    id: '', // Empty ID signals a pre-populated NEW subscription
    name: defaultName,
    serviceKey: preset.key,
    category: preset.category,
    accountEmail: params.get('email')?.trim() || '',
    cycle,
    price,
    currency,
    nextBillingDate,
    autoRenew: true,
    paymentMethod,
    portalUrl: preset.portalUrl || '',
    rechargeUrl: preset.rechargeUrl || '',
    notes,
    history: [],
    createdAt: todayLocal(),
    updatedAt: todayLocal(),
  };
}

/**
 * Clean import query parameters from the browser address bar so refreshing doesn't re-trigger.
 */
export function clearUrlImportParams(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    const keysToRemove = [
      'action',
      'aisubdeal',
      'service',
      'name',
      'plan',
      'price',
      'currency',
      'cycle',
      'region',
      'payment',
      'email',
      'nextBillingDate',
      'notes',
    ];
    let modified = false;
    for (const k of keysToRemove) {
      if (url.searchParams.has(k)) {
        url.searchParams.delete(k);
        modified = true;
      }
    }
    if (modified) {
      const nextSearch = url.searchParams.toString();
      const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`;
      window.history.replaceState({}, document.title, nextUrl);
    }
  } catch {
    // Ignore history API errors
  }
}
