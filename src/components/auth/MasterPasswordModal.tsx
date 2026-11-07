import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Fingerprint, ArrowLeftRight } from 'lucide-react';
import { MIN_PASSWORD_LENGTH, STRENGTH_LABELS, passwordStrength } from '../../lib/password';
import { useI18n } from '../../i18n';
import { isLegacyDomain, requestMigrationFromOldDomain } from '../../lib/migration';

interface MasterPasswordModalProps {
  isOpen: boolean;
  isInitialSetup: boolean;
  onUnlock: (password: string, remember: boolean) => Promise<boolean>;
  onSetup: (password: string, remember: boolean, enableBiometrics?: boolean) => Promise<void>;
  isBiometricsSupported?: boolean;
  isBiometricsEnrolled?: boolean;
  biometricsLabel?: string;
  onBiometricUnlock?: () => Promise<boolean>;
}

export const MasterPasswordModal: React.FC<MasterPasswordModalProps> = ({
  isOpen,
  isInitialSetup,
  onUnlock,
  onSetup,
  isBiometricsSupported = false,
  isBiometricsEnrolled = false,
  biometricsLabel,
  onBiometricUnlock,
}) => {
  const { t, format } = useI18n();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [enableBiometrics, setEnableBiometrics] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  if (!isOpen) return null;

  const handleBioUnlock = async () => {
    if (!onBiometricUnlock) return;
    setError(null);
    setBioLoading(true);
    try {
      const ok = await onBiometricUnlock();
      if (!ok) {
        setError(t.auth.bioCancelled);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.auth.bioFailed);
    } finally {
      setBioLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError(t.auth.pwRequired);
      return;
    }

    setLoading(true);
    try {
      if (isInitialSetup) {
        if (password.length < MIN_PASSWORD_LENGTH) {
          setError(format(t.auth.pwMinLength, { min: MIN_PASSWORD_LENGTH }));
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError(t.auth.pwMismatch);
          setLoading(false);
          return;
        }
        await onSetup(password, remember, isBiometricsSupported && enableBiometrics);
      } else {
        const success = await onUnlock(password, remember);
        if (!success) {
          setError(t.auth.pwWrong);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isInitialSetup ? t.auth.titleSetup : t.auth.titleUnlock}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/60 backdrop-blur-md animate-fadeIn"
    >
      <div className="w-full max-w-md rounded-3xl bg-white border border-line p-6 sm:p-8 surface-card shadow-pop text-ink">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            {isInitialSetup ? <KeyRound className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-ink">
            {isInitialSetup ? t.auth.titleSetup : t.auth.titleUnlock}
          </h2>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">
            {isInitialSetup ? t.auth.descSetup : t.auth.descUnlock}
          </p>
        </div>

        {/* Biometrics quick button */}
        {!isInitialSetup && isBiometricsSupported && isBiometricsEnrolled && onBiometricUnlock && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleBioUnlock}
              disabled={bioLoading}
              className="w-full h-11 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-95 border border-brand-200"
            >
              <Fingerprint className="w-5 h-5 text-brand-700" />
              <span>{bioLoading ? '正在验证...' : biometricsLabel || t.auth.bioBtn}</span>
            </button>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 border-t border-line" />
              <span className="text-xs text-muted">或输入密码</span>
              <div className="flex-1 border-t border-line" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              {t.settings.currentPwPlaceholder}
            </label>
            <input
              type="password"
              autoFocus
              autoComplete={isInitialSetup ? 'new-password' : 'current-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.auth.pwPlaceholder}
              className="w-full h-11 bg-inset border border-line-strong focus:border-ink rounded-xl px-3.5 text-sm text-ink outline-none"
            />
          </div>

          {isInitialSetup && (
            <>
              {password && (
                <p className="text-xs text-muted" aria-live="polite">
                  {format(t.settings.pwStrength, {
                    strength: STRENGTH_LABELS[passwordStrength(password)],
                    min: MIN_PASSWORD_LENGTH,
                  })}
                </p>
              )}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  {t.settings.confirmPwPlaceholder}
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.auth.confirmPwPlaceholder}
                  className="w-full h-11 bg-inset border border-line-strong focus:border-ink rounded-xl px-3.5 text-sm text-ink outline-none"
                />
              </div>
            </>
          )}

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded text-brand-700 focus:ring-brand-700"
              />
              <span className="text-xs text-muted">{t.auth.rememberUnlock}</span>
            </label>

            {isInitialSetup && isBiometricsSupported && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableBiometrics}
                  onChange={(e) => setEnableBiometrics(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-700 focus:ring-brand-700"
                />
                <span className="text-xs text-muted">{t.auth.enableBio}</span>
              </label>
            )}
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-xl bg-rose-50 text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl btn-primary font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-95"
          >
            <span>{loading ? '处理中...' : isInitialSetup ? t.auth.btnSetup : t.auth.btnUnlock}</span>
          </button>
        </form>

        {isInitialSetup && !isLegacyDomain() && (
          <div className="mt-5 pt-4 border-t border-line text-center">
            <p className="text-xs text-muted mb-2">
              {t.migration.setupHint}
            </p>
            <button
              type="button"
              onClick={() => requestMigrationFromOldDomain()}
              className="w-full h-10 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
            >
              <ArrowLeftRight className="w-4 h-4 text-amber-700" />
              <span>{t.migration.migrateBtn}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
