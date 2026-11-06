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
    <div className="relative overflow-hidden rounded-3xl bg-white border border-[#EBEBEB] p-6 sm:p-7 airbnb-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#000000] text-white flex items-center justify-center shadow-2xs shrink-0">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#222222] tracking-tight">
                粘贴礼品券一键充值
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F7F7F7] text-[#000000] font-bold border border-[#DDDDDD]">
                极速直达
              </span>
            </div>
            <p className="text-xs text-[#717171] mt-0.5">
              粘贴 Apple 礼品卡直接唤出【网页端免退号兑换】，粘贴 AI 服务兑换码自动复制并秒开充值台
            </p>
          </div>
        </div>

        {/* Quick paste button */}
        <button
          type="button"
          onClick={handlePasteFromClipboard}
          className="self-start md:self-auto text-xs px-4 py-2 rounded-full bg-white hover:bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD] hover:border-[#222222] transition flex items-center gap-1.5 font-semibold shadow-2xs active:scale-[0.98]"
        >
          <Copy className="w-3.5 h-3.5 text-[#717171]" />
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
              className="w-full h-12 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-2xl px-4 text-xs font-semibold text-[#222222] outline-none transition shadow-2xs"
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
              className="w-full h-12 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-2xl pl-4 pr-10 text-xs font-mono font-medium text-[#222222] placeholder:text-[#717171] outline-none transition shadow-2xs"
            />
            {code && (
              <button
                type="button"
                onClick={() => setCode('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#717171] hover:text-[#222222]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Execute Recharge Button */}
          <button
            type="submit"
            disabled={!code.trim()}
            className="h-12 px-6 rounded-2xl font-bold text-xs text-white bg-[#000000] hover:bg-[#222222] disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]"
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
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#717171] pt-1">
          <span>目标通道:</span>
          <span className="px-3 py-1 rounded-full font-bold text-xs bg-[#F7F7F7] text-[#222222] border border-[#EBEBEB]">
            {effectiveService.name}
          </span>
          {effectiveService.key === 'apple' ? (
            <span className="text-[#000000] font-semibold flex items-center gap-1">
              ✓ 专享【网页端免退号】独立兑换通道
            </span>
          ) : effectiveService.directRedeemUrlPattern ? (
            <span className="text-[#000000] font-semibold flex items-center gap-1">
              ✓ 支持带码直达自动兑换
            </span>
          ) : (
            <span className="text-[#717171] flex items-center gap-1">
              ✓ 自动复制券码并打开官方后台
            </span>
          )}
        </div>
      </form>

      {/* Feedback alert toast */}
      {toastMessage && (
        <div className="mt-4 p-3.5 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD] text-xs text-[#222222] font-medium flex items-start gap-2.5 animate-fadeIn shadow-2xs">
          <ExternalLink className="w-4 h-4 text-[#000000] shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{toastMessage}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#717171] hover:text-[#222222] ml-2"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
