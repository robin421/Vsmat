import React, { useState } from 'react';
import { Zap, ExternalLink, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRESET_SERVICES, getPresetByKey } from '../../types/presets';
import { execute1ClickRecharge, detectVoucherService } from '../../lib/rechargeEngines';
import { getGiftCardGuideUrl } from '../../lib/aisubdeal';
import { useI18n } from '../../i18n';

interface QuickRechargeBarProps {
  /** True when the code matches a voucher stored in the wallet. */
  isStoredVoucher?: (code: string) => boolean;
  onConfirmRedeemed?: (code: string) => void;
  onOpenAppleWebRedeem?: (code: string) => void;
}

export const QuickRechargeBar: React.FC<QuickRechargeBarProps> = ({
  isStoredVoucher,
  onConfirmRedeemed,
  onOpenAppleWebRedeem,
}) => {
  const { t, language } = useI18n();
  const [code, setCode] = useState('');
  const [selectedService, setSelectedService] = useState('auto');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  const detectedService = detectVoucherService(code);
  const effectiveService = selectedService === 'auto' ? detectedService : getPresetByKey(selectedService);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCode(text.trim());
      }
    } catch {}
  };

  const handleRecharge = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;

    if (effectiveService?.key === 'apple' && onOpenAppleWebRedeem) {
      onOpenAppleWebRedeem(code.trim());
      return;
    }

    try {
      const result = await execute1ClickRecharge(
        code,
        selectedService === 'auto' ? undefined : selectedService
      );

      if (!result.success) {
        setToastMessage(result.message);
        return;
      }

      setIsCopied(true);
      setToastMessage(result.message);
      setTimeout(() => setIsCopied(false), 3000);

      // A stored voucher only counts as used once the user confirms it
      setPendingCode(isStoredVoucher?.(code.trim()) ? code.trim() : null);
    } catch (err) {
      console.error(err);
      setToastMessage('充值跳转失败，请手动打开目标网站');
    }
  };

  return (
    <div className="rounded-3xl surface-card p-5 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-ink tracking-tight whitespace-nowrap">
                {t.vouchers.quickTitle}
              </h2>
              <span className="text-xs px-2 h-5 inline-flex items-center rounded-full bg-brand-50 text-brand-700 font-semibold whitespace-nowrap">
                {t.vouchers.quickBadge}
              </span>
            </div>
            <p className="text-sm text-muted mt-1 text-pretty">
              {t.vouchers.quickDesc}
            </p>
          </div>
        </div>

        {/* Quick paste & Gift card guide buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <a
            href={getGiftCardGuideUrl(undefined, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 text-[13px] px-3 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 transition-colors flex items-center gap-1.5 font-semibold whitespace-nowrap"
          >
            <span>🎁 {t.aisubdeal.giftCardGuideLink}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="h-9 text-[13px] px-3 rounded-lg bg-inset hover:bg-line text-ink-soft transition-colors flex items-center gap-1.5 font-semibold whitespace-nowrap active:scale-[0.985]"
          >
            <Copy className="w-3.5 h-3.5 text-muted" />
            <span>{t.vouchers.pasteBtn}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleRecharge} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="sm:w-48 shrink-0">
            <select
              aria-label="选择目标服务"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="field w-full h-11 rounded-xl px-3 text-sm text-ink outline-none font-medium"
            >
              <option value="auto">
                ⚡ {t.vouchers.autoDetect} {detectedService ? `(${detectedService.name})` : ''}
              </option>
              {PRESET_SERVICES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t.vouchers.inputPlaceholder}
              className="field w-full h-11 px-3.5 rounded-xl text-sm font-mono text-ink placeholder:font-sans placeholder:text-muted outline-none"
            />
            {code && (
              <button
                type="button"
                onClick={() => setCode('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs w-5 h-5 flex items-center justify-center rounded-md hover:bg-line"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="h-11 px-5 rounded-xl btn-primary disabled:bg-brand-200 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors"
          >
            <span>{t.vouchers.rechargeBtn}</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic feedback helper */}
        {code.trim() && (
          <div className="text-xs flex items-center justify-between gap-2 px-1 animate-fadeIn text-muted">
            <div className="flex items-center gap-1.5 truncate">
              {effectiveService ? (
                <>
                  <span className="px-2 h-6 inline-flex items-center rounded-md font-semibold text-xs bg-brand-50 text-brand-700">
                    {effectiveService.name}
                  </span>
                  {effectiveService.key === 'apple' ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      支持免换号网页兑换
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      点击后自动复制卡密并打开官方充值台
                    </span>
                  )}
                </>
              ) : (
                <span className="text-amber-700 font-medium">{t.vouchers.unrecognizedCode}</span>
              )}
            </div>
            {isCopied && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1 shrink-0">
                <Check className="w-3.5 h-3.5" />
                {t.common.copied}
              </span>
            )}
          </div>
        )}

        {/* Confirmation prompt when the redeemed code belongs to a stored voucher */}
        {pendingCode && onConfirmRedeemed && (
          <div
            role="status"
            className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3 animate-fadeIn"
          >
            <span>{t.vouchers.confirmRedeemedToast}</span>
            <button
              type="button"
              onClick={() => {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                onConfirmRedeemed(pendingCode);
                setPendingCode(null);
                setCode('');
              }}
              className="h-7 px-2.5 rounded-md btn-primary text-xs font-semibold whitespace-nowrap shrink-0"
            >
              {t.vouchers.confirmRedeemedAction}
            </button>
          </div>
        )}

        {toastMessage && !pendingCode && (
          <div className="text-xs text-muted px-1">{toastMessage}</div>
        )}
      </form>
    </div>
  );
};
