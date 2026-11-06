import { PRESET_SERVICES, getPresetByKey } from '../types/presets';
import { PresetService } from '../types';

export interface RechargeExecutionResult {
  success: boolean;
  service: PresetService;
  url: string;
  isDirectRedeem: boolean;
  message: string;
}

/**
 * Clean up voucher code (remove spaces, trim, uppercase if needed)
 */
export function sanitizeVoucherCode(code: string): string {
  return code.trim().replace(/\s+/g, '').toUpperCase();
}

/**
 * Intelligent guesser for voucher provider based on format
 */
export function detectVoucherService(code: string): PresetService | null {
  const clean = sanitizeVoucherCode(code);
  if (!clean) return null;

  const noDash = clean.replace(/-/g, '');

  // Apple Gift Card: 16 alphanumeric characters, commonly starts with X (with or without hyphens)
  if (/^X[A-Z0-9]{15}$/.test(noDash) || (noDash.length === 16 && /^[A-Z0-9]{16}$/.test(noDash) && clean.startsWith('X'))) {
    return getPresetByKey('apple');
  }

  // Steam Key: 15 chars (often 5x5x5 like AAAAA-BBBBB-CCCCC)
  if ((clean.split('-').length === 3 && noDash.length === 15) || (noDash.length === 15 && /^[A-Z0-9]{15}$/.test(noDash))) {
    return getPresetByKey('steam');
  }

  // Amazon Gift Card: 14-15 chars, frequently XXXX-XXXXXX-XXXX
  if (/^[A-Z0-9]{4}-[A-Z0-9]{6}-[A-Z0-9]{4,5}$/.test(clean) || (noDash.length >= 14 && noDash.length <= 15 && clean.includes('-'))) {
    return getPresetByKey('amazon');
  }

  // Google Play: 16 chars with hyphens (e.g. XXXX-XXXX-XXXX-XXXX)
  if (clean.split('-').length === 4 && noDash.length === 16) {
    return getPresetByKey('googleplay');
  }

  return null;
}

/**
 * Execute 1-click recharge:
 * 1. Copies voucher code to clipboard
 * 2. Generates direct redeem URL or target billing portal URL
 * 3. Opens target page in new tab
 */
export async function execute1ClickRecharge(
  voucherCode: string,
  serviceKey?: string,
  customRechargeUrl?: string
): Promise<RechargeExecutionResult> {
  const cleanCode = sanitizeVoucherCode(voucherCode);
  let service: PresetService;

  if (serviceKey && serviceKey !== 'custom') {
    service = getPresetByKey(serviceKey);
  } else {
    // Auto-detect
    const detected = detectVoucherService(cleanCode);
    service = detected || getPresetByKey('openai'); // default to OpenAI or custom
  }

  // 1. Copy to clipboard
  try {
    if (cleanCode && navigator.clipboard) {
      await navigator.clipboard.writeText(cleanCode);
    }
  } catch (err) {
    console.warn('Clipboard write permission not granted', err);
  }

  // 2. Determine target URL
  let targetUrl = customRechargeUrl || service.rechargeUrl || service.portalUrl;
  let isDirectRedeem = false;

  if (service.directRedeemUrlPattern && cleanCode) {
    targetUrl = service.directRedeemUrlPattern.replace('{CODE}', encodeURIComponent(cleanCode));
    isDirectRedeem = true;
  }

  if (!targetUrl) {
    targetUrl = 'https://www.google.com';
  }

  // 3. Open in browser
  window.open(targetUrl, '_blank', 'noopener,noreferrer');

  let message = '';
  if (isDirectRedeem) {
    message = `已为您一键生成【${service.name}】官方兑换直达页面，兑换码已预填并复制到剪贴板！`;
  } else {
    message = `已为您极速直达【${service.name}】充值中心！礼品券码已自动复制，直接在页面粘贴 (Cmd+V) 即可！`;
  }

  return {
    success: true,
    service,
    url: targetUrl,
    isDirectRedeem,
    message,
  };
}
