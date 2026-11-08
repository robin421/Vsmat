import React from 'react';
import { ShieldCheck, Lock, HardDrive, Cpu, EyeOff, CheckCircle2, X, Terminal, ExternalLink, Download } from 'lucide-react';
import { useDismiss, closeOnBackdrop } from '../../hooks/useDismiss';
import { useI18n } from '../../i18n';
import brandLogo from '../../assets/logo.png';

interface DataSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExport?: () => void;
}

export const DataSecurityModal: React.FC<DataSecurityModalProps> = ({
  isOpen,
  onClose,
  onOpenExport,
}) => {
  useDismiss(isOpen, onClose);
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/50 backdrop-blur-sm animate-fadeIn" onClick={closeOnBackdrop(onClose)}>
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-line p-6 sm:p-8 surface-card max-h-[90vh] overflow-y-auto text-ink shadow-pop">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-line">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black flex items-center justify-center shrink-0 border border-zinc-800 shadow-sm">
              <img src={brandLogo} alt="Vsmat" className="w-full h-full object-cover select-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-ink tracking-tight">
                  {t.security.title}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                  {t.security.badge}
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {t.security.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-line-strong hover:border-ink text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Guarantee Banner */}
        <div className="my-5 p-4 rounded-2xl bg-brand-700 text-white space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>{t.security.corePromiseTitle}</span>
          </div>
          <p className="text-xs text-line-strong leading-relaxed">
            {t.security.corePromiseText}
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-inset border border-line space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-ink">
              <HardDrive className="w-4 h-4 text-brand-700" />
              <span>{t.security.pillar1Title}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t.security.pillar1Desc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-inset border border-line space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-ink">
              <Cpu className="w-4 h-4 text-brand-700" />
              <span>{t.security.pillar2Title}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t.security.pillar2Desc}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-inset border border-line space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-ink">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.security.pillar3Title}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {t.security.pillar3Desc}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-5 border-t border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {onOpenExport ? (
            <button
              onClick={() => {
                onClose();
                onOpenExport();
              }}
              className="h-9 px-4 rounded-lg bg-inset hover:bg-line text-ink text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.security.exportCta}</span>
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="h-9 px-5 rounded-lg btn-primary text-xs font-semibold transition"
          >
            {t.security.closeCta}
          </button>
        </div>
      </div>
    </div>
  );
};
