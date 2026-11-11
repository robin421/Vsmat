import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  initGA,
  _resetGAForTesting,
  trackPageView,
  trackEvent,
  trackAppActivated,
  trackVaultUnlocked,
  trackBackupRestored,
  trackExportBackup,
  trackSubscriptionAdded,
  trackTokenAdded,
  trackVoucherAdded,
  trackVoucherRedeemed,
  trackOcrScanCompleted,
  trackSubdealOutboundClick,
  trackCurrencySwitched,
} from '../src/lib/analytics';

describe('Analytics (GA4 Zero-Knowledge Telemetry)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    _resetGAForTesting();
    window.dataLayer = [];
    window.gtag = vi.fn();
  });

  afterEach(() => {
    _resetGAForTesting();
    document.querySelectorAll('script[src*="googletagmanager"]').forEach((s) => s.remove());
  });

  it('silences GA initialization on localhost/127.0.0.1 without throwing', () => {
    // Current test environment is localhost / 127.0.0.1
    initGA('G-NH7S05CJCG');
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
  });

  it('pushes arguments object (not array) to dataLayer when initialized on production hostname', () => {
    const originalLocation = window.location;
    try {
      delete (window as unknown as { location: unknown }).location;
      window.location = new URL('https://vsmat.aisubdeal.com/') as unknown as Location;

      window.dataLayer = [];
      initGA('G-NH7S05CJCG');

      expect(document.querySelector('script[src*="googletagmanager"]')).not.toBeNull();
      expect(typeof window.gtag).toBe('function');

      // Call window.gtag and verify the item pushed to dataLayer is [object Arguments]
      window.gtag!('event', 'test_event', { foo: 'bar' });

      expect(window.dataLayer.length).toBeGreaterThan(0);
      const lastItem = window.dataLayer[window.dataLayer.length - 1];
      expect(Object.prototype.toString.call(lastItem)).toBe('[object Arguments]');
    } finally {
      (window as unknown as { location: unknown }).location = originalLocation;
    }
  });

  it('tracks generic events safely', () => {
    trackEvent('custom_action', { category: 'test' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'custom_action', { category: 'test' });
  });

  it('tracks page views safely', () => {
    trackPageView('/pricing', 'Pricing Page');
    expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/pricing',
      page_title: 'Pricing Page',
      page_location: window.location.href,
    });
  });

  it('tracks app activation without sensitive payload', () => {
    trackAppActivated('password', 'zh-CN');
    expect(window.gtag).toHaveBeenCalledWith('event', 'app_activated', {
      auth_type: 'password',
      locale: 'zh-CN',
    });
  });

  it('tracks vault unlocking method and remember state', () => {
    trackVaultUnlocked('biometrics', false);
    expect(window.gtag).toHaveBeenCalledWith('event', 'vault_unlocked', {
      unlock_method: 'biometrics',
      remember_enabled: false,
    });
  });

  it('tracks subscription depth with count brackets', () => {
    trackSubscriptionAdded('ai', 'USD', false, 1);
    expect(window.gtag).toHaveBeenCalledWith('event', 'subscription_added', {
      category: 'ai',
      currency: 'USD',
      is_lifetime: false,
      total_bracket: '1',
    });

    trackSubscriptionAdded('cloud', 'CNY', true, 4);
    expect(window.gtag).toHaveBeenCalledWith('event', 'subscription_added', {
      category: 'cloud',
      currency: 'CNY',
      is_lifetime: true,
      total_bracket: '2-5',
    });

    trackSubscriptionAdded('dev', 'USD', false, 15);
    expect(window.gtag).toHaveBeenCalledWith('event', 'subscription_added', {
      category: 'dev',
      currency: 'USD',
      is_lifetime: false,
      total_bracket: '10+',
    });
  });

  it('tracks tokens and vouchers lifecycle', () => {
    trackTokenAdded('openai', 3);
    expect(window.gtag).toHaveBeenCalledWith('event', 'token_added', {
      provider: 'openai',
      total_bracket: '2-5',
    });

    trackVoucherAdded('apple', 2);
    expect(window.gtag).toHaveBeenCalledWith('event', 'voucher_added', {
      channel: 'apple',
      total_bracket: '2-5',
    });

    trackVoucherRedeemed('apple', 'mac_web_link');
    expect(window.gtag).toHaveBeenCalledWith('event', 'voucher_redeemed', {
      channel: 'apple',
      method: 'mac_web_link',
    });
  });

  it('tracks OCR scan and backup events', () => {
    trackOcrScanCompleted(true, 'USD');
    expect(window.gtag).toHaveBeenCalledWith('event', 'ocr_scan_completed', {
      success: true,
      detected_lang: 'USD',
    });

    trackBackupRestored('3 items');
    expect(window.gtag).toHaveBeenCalledWith('event', 'backup_restored', {
      bracket: '3 items',
    });

    trackExportBackup();
    expect(window.gtag).toHaveBeenCalledWith('event', 'export_backup_created', {
      encrypted: true,
    });
  });

  it('tracks ecosystem outbound link clicks and currency switches', () => {
    trackSubdealOutboundClick('sidebar_nav', 'chatgpt');
    expect(window.gtag).toHaveBeenCalledWith('event', 'subdeal_outbound_click', {
      source: 'sidebar_nav',
      product: 'chatgpt',
    });

    trackCurrencySwitched('CNY');
    expect(window.gtag).toHaveBeenCalledWith('event', 'currency_switched', {
      to_currency: 'CNY',
    });
  });
});
