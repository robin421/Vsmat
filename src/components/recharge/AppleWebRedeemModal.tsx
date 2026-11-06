import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, ExternalLink, Globe, Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AppleWebRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherCode: string;
  accountEmail?: string;
  passwordNote?: string;
  onConfirmRecharged?: () => void;
}

export const AppleWebRedeemModal: React.FC<AppleWebRedeemModalProps> = ({
  isOpen,
  onClose,
  voucherCode,
  accountEmail = 'vip_subscriber@gmail.com',
  passwordNote = 'ApplePass#2026',
  onConfirmRecharged,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const cleanCode = voucherCode.trim().replace(/\s+/g, '').toUpperCase();
  const webRedeemUrl = `https://apps.apple.com/redeem?code=${encodeURIComponent(cleanCode)}`;

  const handleCopyEmail = async () => {
    if (!accountEmail) return;
    try {
      await navigator.clipboard.writeText(accountEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyPassword = async () => {
    if (!passwordNote) return;
    try {
      await navigator.clipboard.writeText(passwordNote);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleOpenWebRedeem = async () => {
    // 1. Copy code to clipboard
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopiedCode(true);
    } catch {}

    // 2. Open official Apple web redeem page
    window.open(webRedeemUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyIncognitoLink = async () => {
    try {
      await navigator.clipboard.writeText(webRedeemUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {}
  };

  const handleComplete = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    if (onConfirmRecharged) onConfirmRecharged();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#EBEBEB] p-6 sm:p-7 airbnb-card text-[#222222]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F2] border border-[#FFCCD3] flex items-center justify-center text-[#FF385C] shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#222222]">
                  Apple 礼品卡网页充值助手
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF0F2] text-[#FF385C] font-semibold border border-[#FFCCD3]">
                  免退系统号
                </span>
              </div>
              <p className="text-xs text-[#717171] mt-0.5">
                在浏览器中直接登录目标 Apple ID 兑换，无需退出电脑系统账号
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#DDDDDD] hover:border-[#222222] text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Security Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
          <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>无需退出当前 Mac 的日常 iCloud 账号：</strong>
            系统将在浏览器中打开 Apple 官方 Web 兑换通道。在网页中输入下方为您准备好的目标美区账号即可兑换，绝不混淆或充错！
          </div>
        </div>

        {/* Credentials Card (1Password Style) */}
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 space-y-3">
          {/* Target Apple ID Email */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">目标 Apple ID 账号:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-subtle">
                {accountEmail} <span className="text-blue-600 font-normal">🇺🇸 美区</span>
              </span>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1 shadow-subtle"
                title="一键复制账号"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? '已复制' : '复制账号'}</span>
              </button>
            </div>
          </div>

          {/* Password */}
          {passwordNote && (
            <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">目标账号密码:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-subtle">
                  {showPassword ? passwordNote : '••••••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-white"
                  title={showPassword ? '隐藏' : '显示'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1 shadow-subtle"
                  title="一键复制密码"
                >
                  {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPassword ? '已复制' : '复制密码'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Gift Card Code */}
          <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">礼品卡兑换码:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-subtle tracking-wider">
                {cleanCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1 shadow-subtle"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? '已复制' : '复制券码'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-5 space-y-2.5">
          {/* Main CTA */}
          <button
            type="button"
            onClick={handleOpenWebRedeem}
            className="w-full h-11 rounded-xl btn-rausch text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <ExternalLink className="w-4 h-4 text-white" />
            <span>在新标签页打开 Apple 官方兑换页</span>
          </button>

          {/* Incognito Helper */}
          <button
            type="button"
            onClick={handleCopyIncognitoLink}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#F7F7F7] text-[#222222] font-semibold text-xs border border-[#DDDDDD] hover:border-[#222222] transition flex items-center justify-center gap-1.5 shadow-2xs"
            title="复制带码链接，可在浏览器的无痕/隐私窗口粘贴打开"
          >
            {copiedUrl ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#FF385C]" />
                <span className="text-[#FF385C] font-semibold">直达链接已复制！去浏览器按 Cmd+Shift+N 打开无痕窗口即可粘贴！</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#717171]" />
                <span>复制链接并在浏览器【无痕/隐私窗口】打开 (推荐，账号完全隔离)</span>
              </>
            )}
          </button>
        </div>

        {/* Finish / Auto-Advance renewal */}
        <div className="mt-4 pt-3.5 border-t border-[#EBEBEB] flex items-center justify-between text-xs">
          <span className="text-[#717171]">已在网页完成兑换充值？</span>
          <button
            type="button"
            onClick={handleComplete}
            className="px-4 py-2 rounded-xl bg-[#FFF0F2] hover:bg-[#FFE2E6] text-[#FF385C] font-bold border border-[#FFCCD3] transition flex items-center gap-1.5 active:scale-95 shadow-2xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF385C]" />
            <span>我已完成充值 (自动顺延下期续费)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
