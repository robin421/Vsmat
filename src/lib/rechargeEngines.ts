import { PRESET_SERVICES, getPresetByKey } from '../types/presets';
import { PresetService } from '../types';
import { safeHttpUrl } from './url';

export type RechargeExecutionResult =
  | {
      success: true;
      service: PresetService;
      url: string;
      isDirectRedeem: boolean;
      message: string;
    }
  | { success: false; message: string };

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

  // Never guess: opening the wrong provider's site with a gift code is worse than asking.
  const service =
    serviceKey && serviceKey !== 'custom' ? getPresetByKey(serviceKey) : detectVoucherService(cleanCode);
  if (!service) {
    return { success: false, message: '无法识别该券码所属服务，请先在上方手动选择服务后再充值。' };
  }

  // 1. Copy to clipboard
  try {
    if (cleanCode && navigator.clipboard) {
      await navigator.clipboard.writeText(cleanCode);
    }
  } catch (err) {
    console.warn('Clipboard write permission not granted', err);
  }

  // 2. Determine target URL (http/https only)
  let isDirectRedeem = false;
  let targetUrl = safeHttpUrl(customRechargeUrl) || safeHttpUrl(service.rechargeUrl) || safeHttpUrl(service.portalUrl);

  if (service.directRedeemUrlPattern && cleanCode) {
    const direct = safeHttpUrl(service.directRedeemUrlPattern.replace('{CODE}', encodeURIComponent(cleanCode)));
    if (direct) {
      targetUrl = direct;
      isDirectRedeem = true;
    }
  }

  if (!targetUrl) {
    return { success: false, message: `【${service.name}】没有可用的充值链接，券码已复制，请手动前往官网兑换。` };
  }

  // 3. Open in browser
  window.open(targetUrl, '_blank', 'noopener,noreferrer');

  const message = isDirectRedeem
    ? `已为您一键生成【${service.name}】官方兑换直达页面，兑换码已预填并复制到剪贴板！`
    : `已为您极速直达【${service.name}】充值中心！礼品券码已自动复制，直接在页面粘贴 (Cmd+V) 即可！`;

  return { success: true, service, url: targetUrl, isDirectRedeem, message };
}
