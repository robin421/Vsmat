import { describe, expect, it } from 'vitest';
import {
  buildAiSubDealUrl,
  getServicePricingUrl,
  getGiftCardGuideUrl,
  getAddressToolUrl,
  evaluateSubscriptionDeal,
  summarizePortfolioSavings,
} from '../src/lib/aisubdeal';
import { parseUrlImportParams } from '../src/lib/urlImport';
import { getPresetByKey } from '../src/types/presets';
import { SubscriptionItem } from '../src/types';

describe('AISubDeal URL builders & i18n routing', () => {
  it('generates localized aisubdeal URLs with utm_source=vsmat', () => {
    expect(buildAiSubDealUrl('/pricing/chatgpt/', 'zh')).toBe(
      'https://www.aisubdeal.com/zh/pricing/chatgpt/?utm_source=vsmat'
    );
    expect(buildAiSubDealUrl('/pricing/chatgpt/', 'en')).toBe(
      'https://www.aisubdeal.com/pricing/chatgpt/?utm_source=vsmat'
    );
    expect(buildAiSubDealUrl('/pricing/chatgpt/', 'ja')).toBe(
      'https://www.aisubdeal.com/ja/pricing/chatgpt/?utm_source=vsmat'
    );
    expect(buildAiSubDealUrl('/pricing/chatgpt/', 'ko')).toBe(
      'https://www.aisubdeal.com/ko/pricing/chatgpt/?utm_source=vsmat'
    );
  });

  it('resolves service pricing URLs from preset keys or slugs', () => {
    expect(getServicePricingUrl('openai', 'zh')).toContain('/zh/pricing/chatgpt/');
    expect(getServicePricingUrl('github', 'en')).toContain('/pricing/copilot/');
    expect(getServicePricingUrl('custom', 'zh', 'Claude Pro')).toContain('/zh/pricing/claude/');
  });

  it('maps currencies to regional gift card guides and tax-free billing address tools', () => {
    expect(getGiftCardGuideUrl('PHP', 'zh')).toContain('/zh/gift-cards/philippines/');
    expect(getGiftCardGuideUrl('TRY', 'en')).toContain('/gift-cards/turkey/');
    expect(getAddressToolUrl('PKR', 'ko')).toContain('/ko/address/pk/');
    expect(getAddressToolUrl('NGN', 'ja')).toContain('/ja/address/ng/');
  });
});

describe('Preset alias resolution', () => {
  it('resolves aisubdeal slugs and new presets accurately', () => {
    expect(getPresetByKey('chatgpt').key).toBe('openai');
    expect(getPresetByKey('copilot').key).toBe('github');
    expect(getPresetByKey('youtube').key).toBe('youtube');
    expect(getPresetByKey('capcut').key).toBe('capcut');
  });
});

describe('Subscription deal evaluation & portfolio savings', () => {
  it('identifies when a US-priced subscription can be optimized further', () => {
    const evalResult = evaluateSubscriptionDeal({
      serviceKey: 'openai',
      name: 'ChatGPT Plus',
      price: 20,
      currency: 'USD',
      cycle: 'monthly',
    });
    expect(evalResult).not.toBeNull();
    expect(evalResult!.canOptimizeFurther).toBe(true);
    expect(evalResult!.potentialExtraSaveUSD).toBeGreaterThan(3);
  });

  it('identifies when a regional subscription is already discounted vs US price', () => {
    const evalResult = evaluateSubscriptionDeal({
      serviceKey: 'youtube',
      name: 'YouTube Premium',
      price: 2200,
      currency: 'NGN',
      cycle: 'monthly',
    });
    expect(evalResult).not.toBeNull();
    expect(evalResult!.isAlreadyDiscounted).toBe(true);
    expect(evalResult!.savedVsUsPercent).toBeGreaterThan(80);
  });

  it('summarizes portfolio savings across multiple subscriptions', () => {
    const subs: SubscriptionItem[] = [
      {
        id: 'sub-1',
        name: 'ChatGPT Plus',
        serviceKey: 'openai',
        category: 'ai',
        accountEmail: 'a@b.com',
        cycle: 'monthly',
        price: 20,
        currency: 'USD',
        nextBillingDate: '2026-12-01',
        autoRenew: true,
        history: [],
        createdAt: '2026-11-07',
        updatedAt: '2026-11-07',
      },
      {
        id: 'sub-2',
        name: 'Spotify Premium',
        serviceKey: 'spotify',
        category: 'entertainment',
        accountEmail: 'a@b.com',
        cycle: 'monthly',
        price: 1600,
        currency: 'NGN',
        nextBillingDate: '2026-12-01',
        autoRenew: true,
        history: [],
        createdAt: '2026-11-07',
        updatedAt: '2026-11-07',
      },
    ];

    const summary = summarizePortfolioSavings(subs, 7.25);
    expect(summary.discountedCount).toBe(1);
    expect(summary.totalSavedVsUsMonthlyUSD).toBeGreaterThan(10);
    expect(summary.optimizableItems.length).toBe(1);
    expect(summary.optimizableItems[0].subscription.id).toBe('sub-1');
  });
});

describe('URL 1-Click Import Parser', () => {
  it('parses full ?action=import_sub parameters from aisubdeal', () => {
    const imported = parseUrlImportParams(
      '?action=import_sub&service=chatgpt&plan=Plus&price=999&currency=PHP&cycle=monthly'
    );
    expect(imported).not.toBeNull();
    expect(imported!.id).toBe('');
    expect(imported!.serviceKey).toBe('openai');
    expect(imported!.price).toBe(999);
    expect(imported!.currency).toBe('PHP');
    expect(imported!.paymentMethod).toContain('菲区');
  });

  it('parses shorthand ?aisubdeal=claude using floor price defaults', () => {
    const imported = parseUrlImportParams('?aisubdeal=claude');
    expect(imported).not.toBeNull();
    expect(imported!.serviceKey).toBe('claude');
    expect(imported!.currency).toBe('PKR');
    expect(imported!.price).toBe(4900);
  });

  it('ignores unrelated query strings', () => {
    expect(parseUrlImportParams('?utm_source=google')).toBeNull();
    expect(parseUrlImportParams('')).toBeNull();
  });
});
