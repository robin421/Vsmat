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

  // Auto-detect service from code
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

    // Special interception for Apple: open Method 1 Web Redeem Modal!
    if (effectiveService.key === 'apple' && onOpenAppleWebRedeem) {
      onOpenAppleWebRedeem(code.trim());
      return;
    }

    try {
      const result = await execute1ClickRecharge(
        code,
        selectedService === 'auto' ? undefined : selectedService
      );

      confetti({
        particleCount: 40,
        spread: 50,
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
    <div className="relative overflow-hidden rounded-2xl bg-white border border-zinc-200/80 p-5 sm:p-6 card-ambient">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-2xs shrink-0 ring-1 ring-zinc-800">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-950 tracking-tight">
                粘贴礼品券一键充值
              </h2>
              <span className="text-[11px] px-2 py-0.2 rounded-full bg-zinc-100 text-zinc-700 font-medium border border-zinc-200">
                极速直达
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              粘贴 Apple 礼品卡直接唤出【网页端免退号兑换】，粘贴 AI 服务兑换码自动复制并秒开充值台
            </p>
          </div>
        </div>

        {/* Quick paste button */}
        <button
          type="button"
          onClick={handlePasteFromClipboard}
          className="self-start md:self-auto text-xs px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition flex items-center gap-1.5 font-medium shadow-2xs active:scale-[0.98]"
        >
          <Copy className="w-3.5 h-3.5 text-zinc-500" />
          <span>从剪贴板粘贴</span>
        </button>
      </div>

      <form onSubmit={handleRecharge} className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
          {/* Service selector */}
          <div className="sm:w-56 shrink-0">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full h-11 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl px-3 text-xs font-medium text-zinc-800 outline-none transition shadow-2xs"
            >
              <option value="auto">
                {detectedService ? `识别为: ${detectedService.name}` : '自动智能识别服务'}
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
              className="w-full h-11 bg-zinc-50 border border-zinc-200 focus:border-zinc-400 focus:bg-white rounded-xl pl-4 pr-10 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 outline-none transition shadow-2xs"
            />
            {code && (
              <button
                type="button"
                onClick={() => setCode('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Execute Recharge Button */}
          <button
            type="submit"
            disabled={!code.trim()}
            className="h-11 px-5 rounded-xl font-medium text-xs text-white bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-zinc-300" />
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
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 pt-0.5">
          <span>目标通道:</span>
          <span className="px-2.5 py-0.5 rounded-lg font-medium text-xs bg-zinc-100 text-zinc-800 border border-zinc-200">
            {effectiveService.name}
          </span>
          {effectiveService.key === 'apple' ? (
            <span className="text-zinc-700 font-medium flex items-center gap-1">
              ✓ 专享【网页端免退号】独立兑换通道
            </span>
          ) : effectiveService.directRedeemUrlPattern ? (
            <span className="text-zinc-700 font-medium flex items-center gap-1">
              ✓ 支持带码直达自动兑换
            </span>
          ) : (
            <span className="text-zinc-500 flex items-center gap-1">
              ✓ 自动复制券码并打开官方后台
            </span>
          )}
        </div>
      </form>

      {/* Feedback alert toast */}
      {toastMessage && (
        <div className="mt-3.5 p-3 rounded-xl bg-zinc-100 border border-zinc-200 text-xs text-zinc-800 flex items-start gap-2 animate-fadeIn shadow-2xs">
          <ExternalLink className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{toastMessage}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-zinc-600 ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
