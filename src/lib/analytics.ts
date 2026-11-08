/**
 * Google Analytics 4 (GA4) Integration with Zero-Knowledge Privacy Safeguards.
 * 
 * Strict Privacy Guarantees:
 * 1. NEVER collects user credentials, tokens, voucher codes, or vault payloads.
 * 2. Only tracks anonymous aggregate events (e.g. Page views, tab switches, ecosystem clicks).
 * 3. Gracefully degrades if network is blocked or CSP / adblockers prevent loading.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Default GA4 measurement ID for vsmat.aisubdeal.com
export const DEFAULT_GA_ID = 'G-P3J8N22B86'; // Will be replaced/set by dynamic config

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
    // 1. Setup dataLayer and gtag stub
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

    // 2. Load gtag script asynchronously
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.onerror = () => {
      // Offline mode or blocked by network, fail gracefully
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

export function trackEvent(action: string, category: string, label?: string, value?: number): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  try {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } catch {
    // silent
  }
}
