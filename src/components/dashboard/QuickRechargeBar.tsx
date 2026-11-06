import React, { useState } from 'react';
import { Zap, ExternalLink, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRESET_SERVICES, getPresetByKey } from '../../types/presets';
import { execute1ClickRecharge, detectVoucherService } from '../../lib/rechargeEngines';

interface QuickRechargeBarProps {
  onRechargeComplete?: (serviceKey: string, code: string) => void;
  onOpenAppleWebRedeem?: (code: string) => void;
}

export const QuickRechargeBar: React.FC<QuickRechargeBarProps> = ({
  onRechargeComplete,
  onOpenAppleWebRedeem,
}) => {
  const [code, setCode] = useState('');
  const [selectedService, setSelectedService] = useState('auto');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const detectedService = detectVoucherService(code);
  const effectiveService = selectedService === 'auto'
    ? (detectedService || getPresetByKey('openai'))
    : getPresetByKey(selectedService);

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

    if (effectiveService.key === 'apple' && onOpenAppleWebRedeem) {
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

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      setIsCopied(true);
      setToastMessage(result.message);
      setTimeout(() => setIsCopied(false), 3000);

      if (onRechargeComplete) {
        onRechargeComplete(result.service.key, code.trim());
      }
    } catch (err) {
      console.error(err);
      setToastMessage('充值跳转失败，请手动打开目标网站');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-line p-6 sm:p-7 surface-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-brand-700 text-white flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-ink tracking-tight">
                粘贴礼品券一键充值
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-md bg-inset text-ink-soft font-medium border border-line">
                极速直达
              </span>
            </div>
            <p className="text-sm text-muted mt-1">
              粘贴 Apple 礼品卡直接唤出【网页端免退号兑换】，粘贴 AI 服务兑换码自动复制并秒开充值台
            </p>
          </div>
        </div>

        {/* Quick paste button */}
        <button
          type="button"
          onClick={handlePasteFromClipboard}
          className="self-start md:self-auto h-9 text-sm px-3.5 rounded-lg bg-white hover:bg-inset text-ink border border-line-strong hover:border-ink transition-colors flex items-center gap-1.5 font-semibold active:scale-[0.985]"
        >
          <Copy className="w-3.5 h-3.5 text-muted" />
          <span>从剪贴板粘贴</span>
        </button>
      </div>

      <form onSubmit={handleRecharge} className="space-y-3.5">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Service selector */}
          <div className="sm:w-60 shrink-0">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="field w-full h-12 rounded-lg px-3.5 text-sm font-medium text-ink outline-none"
            >
              <option value="auto">
                {detectedService ? `识别为: ${detectedService.name}` : '⚡ 自动智能识别服务'}
              </option>
              {PRESET_SERVICES.filter(p => p.key !== 'custom').map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
              <option value="custom">其他自定义服务</option>
            </select>
          </div>

          {/* Voucher input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="在此粘贴礼品卡号、兑换码或卡密 (如 X89A-24B8... 或 AAAAA-BBBBB-CCCCC)"
              className="field w-full h-12 rounded-lg pl-4 pr-10 text-sm font-mono text-ink placeholder:text-muted outline-none"
            />
            {code && (
              <button
                type="button"
                onClick={() => setCode('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink"
              >
                ✕
              </button>
            )}
          </div>

          {/* Execute Recharge Button */}
          <button
            type="submit"
            disabled={!code.trim()}
            className="h-12 px-6 rounded-lg font-semibold text-sm btn-primary disabled:bg-line-strong disabled:text-white disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-white stroke-[2.5]" />
                <span>已复制并打开!</span>
              </>
            ) : (
              <>
                <span>一键充值跳转</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Channel Helper Tag */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted pt-1">
          <span>目标通道:</span>
          <span className="px-2 py-0.5 rounded-md font-semibold text-xs bg-inset text-ink border border-line">
            {effectiveService.name}
          </span>
          {effectiveService.key === 'apple' ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              ✓ 专享【网页端免退号】独立兑换通道
            </span>
          ) : effectiveService.directRedeemUrlPattern ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              ✓ 支持带码直达自动兑换
            </span>
          ) : (
            <span className="text-muted flex items-center gap-1">
              ✓ 自动复制券码并打开官方后台
            </span>
          )}
        </div>
      </form>

      {/* Feedback alert toast */}
      {toastMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-inset border border-line text-sm text-ink flex items-start gap-2.5 animate-fadeIn">
          <ExternalLink className="w-4 h-4 text-ink shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{toastMessage}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-muted hover:text-ink ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
