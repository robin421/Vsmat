import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, ExternalLink, Globe, Lock, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useDismiss, closeOnBackdrop } from '../../hooks/useDismiss';
import { useI18n } from '../../i18n';

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
  useDismiss(isOpen, onClose);
  const { t } = useI18n();

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
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/40 backdrop-blur-sm animate-fadeIn" onClick={closeOnBackdrop(onClose)}>
      <div className="w-full max-w-lg rounded-3xl bg-white border border-line p-6 sm:p-7 surface-card text-ink">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center font-bold text-lg">
              
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-ink">
                  {t.vouchers.appleWebModalTitle}
                </h3>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {t.vouchers.appleWebModalDesc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            className="w-8 h-8 rounded-full border border-line-strong hover:border-ink text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Guide List */}
        <div className="mt-4 space-y-3">
          {/* Step 1: Voucher Code Copy */}
          <div className="p-3.5 rounded-2xl bg-inset border border-line space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-brand-700 text-white flex items-center justify-center text-[10px]">1</span>
                <span>{t.vouchers.appleStep1}</span>
              </span>
              <span className="text-muted font-mono">{cleanCode.length} chars</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-xs sm:text-sm tracking-wider font-bold text-ink bg-white px-3 py-2 rounded-xl border border-line-strong select-all truncate">
                {cleanCode || 'NO-CODE-PROVIDED'}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="h-9 px-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold flex items-center gap-1 transition shrink-0"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? t.common.copied : t.vouchers.appleCopyCode}</span>
              </button>
            </div>
          </div>

          {/* Credentials info if account available */}
          {accountEmail && (
            <div className="p-3.5 rounded-2xl bg-white border border-line space-y-2">
              <div className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-700" />
                <span>目标订阅账号凭证（方便网页登录时对照）</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-inset font-medium">
                  <span className="text-muted truncate select-all">{accountEmail}</span>
                  <button onClick={handleCopyEmail} className="text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1 shrink-0">
                    {copiedEmail ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedEmail ? t.common.copied : t.vouchers.appleCopyAccount}</span>
                  </button>
                </div>
                {passwordNote && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-inset font-medium">
                    <span className="text-muted truncate select-all">
                      {showPassword ? passwordNote : '••••••••••••'}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setShowPassword(!showPassword)} className="text-muted hover:text-ink">
                        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      <button onClick={handleCopyPassword} className="text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1">
                        {copiedPassword ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedPassword ? t.common.copied : t.common.copy}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Step 2 & Step 3 */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={handleOpenWebRedeem}
              className="w-full h-11 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
            >
              <span>{t.vouchers.appleOpenPage}</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleCopyIncognitoLink}
              className="w-full h-9 rounded-xl border border-line text-xs font-semibold text-muted hover:text-ink hover:bg-inset transition flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedUrl ? '链接已复制，请粘贴到无痕窗口打开' : '复制直达链接（建议在浏览器无痕/隐私窗口打开）'}</span>
            </button>

            <button
              type="button"
              onClick={handleComplete}
              className="w-full h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 border border-emerald-200 mt-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t.vouchers.appleConfirmDone}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
