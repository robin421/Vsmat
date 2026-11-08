/**
 * Google Analytics 4 (GA4) Analytics and Event Tracking
 * Measurement ID: G-NH7S05CJCG
 * 
 * Strict Zero-Knowledge Safeguards:
 * 1. NEVER track raw secrets, API tokens, passwords, voucher codes, or vault payloads.
 * 2. Only tracks aggregated categories, count brackets, and user interaction states.
 * 3. Gracefully silences in test/development/offline environments.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const DEFAULT_GA_ID = 'G-NH7S05CJCG';

let isInitialized = false;

export function initGA(measurementId: string = DEFAULT_GA_ID): void {
  if (typeof window === 'undefined' || isInitialized || !measurementId || !measurementId.startsWith('G-')) {
    return;
  }

  // Never load GA in local development, 127.0.0.1, or automated test runners
  const hostname = window.location.hostname;
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '' ||
    hostname.endsWith('.local')
  ) {
    return;
  }

  try {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false, // controlled manually for SPA route changes
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure',
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.onerror = () => {
      console.info('[Analytics] GA4 script blocked or offline, continuing safely');
    };
    document.head.appendChild(script);

    isInitialized = true;
  } catch (err) {
    console.warn('[Analytics] Failed to initialize GA4:', err);
  }
}

export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  try {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href,
    });
  } catch {
    // silent
  }
}

export function trackEvent(eventName: string, params: Record<string, string | number | boolean> = {}): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  try {
    window.gtag('event', eventName, params);
  } catch {
    // silent
  }
}

// ==========================================
// 1. 激活与初始化埋点 (Activation)
// ==========================================

export function trackAppActivated(authType: 'password' | 'webauthn', locale: string): void {
  trackEvent('app_activated', {
    auth_type: authType,
    locale,
  });
}

export function trackVaultUnlocked(method: 'password' | 'biometrics', rememberEnabled: boolean): void {
  trackEvent('vault_unlocked', {
    unlock_method: method,
    remember_enabled: rememberEnabled,
  });
}

export function trackBackupRestored(itemCountBracket: string): void {
  trackEvent('backup_restored', {
    bracket: itemCountBracket,
  });
}

export function trackExportBackup(): void {
  trackEvent('export_backup_created', {
    encrypted: true,
  });
}

// ==========================================
// 2. 使用深度埋点 (Engagement Depth)
// ==========================================

function getCountBracket(count: number): string {
  if (count <= 1) return '1';
  if (count <= 5) return '2-5';
  if (count <= 10) return '6-10';
  return '10+';
}

export function trackSubscriptionAdded(
  category: string,
  currency: string,
  isLifetime: boolean,
  totalSubscriptions: number
): void {
  trackEvent('subscription_added', {
    category: category || 'general',
    currency,
    is_lifetime: isLifetime,
    total_bracket: getCountBracket(totalSubscriptions),
  });
}

export function trackTokenAdded(provider: string, totalTokens: number): void {
  trackEvent('token_added', {
    provider: provider || 'custom',
    total_bracket: getCountBracket(totalTokens),
  });
}

export function trackVoucherAdded(channel: string, totalVouchers: number): void {
  trackEvent('voucher_added', {
    channel: channel || 'custom',
    total_bracket: getCountBracket(totalVouchers),
  });
}

export function trackVoucherRedeemed(channel: string, method: 'mac_web_link' | 'app_store' | 'manual'): void {
  trackEvent('voucher_redeemed', {
    channel: channel || 'custom',
    method,
  });
}

export function trackOcrScanCompleted(success: boolean, detectedLang?: string): void {
  trackEvent('ocr_scan_completed', {
    success,
    detected_lang: detectedLang || 'unknown',
  });
}

// ==========================================
// 3. 生态导流与通用操作埋点 (Ecosystem)
// ==========================================

export function trackSubdealOutboundClick(source: string, product?: string): void {
  trackEvent('subdeal_outbound_click', {
    source,
    product: product || 'general',
  });
}

export function trackCurrencySwitched(toCurrency: 'CNY' | 'USD'): void {
  trackEvent('currency_switched', {
    to_currency: toCurrency,
  });
}
