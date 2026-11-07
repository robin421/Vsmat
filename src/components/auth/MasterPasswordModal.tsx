import React, { useState, useEffect, useRef } from 'react';
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

  const canUseBio = !isInitialSetup && isBiometricsSupported && isBiometricsEnrolled && Boolean(onBiometricUnlock);
  const [mode, setMode] = useState<'biometric' | 'password'>('password');
  const userSwitchedToPasswordRef = useRef(false);
  const autoTriggeredRef = useRef(false);

  // Default to biometric mode whenever biometrics are configured
  useEffect(() => {
    if (canUseBio && !userSwitchedToPasswordRef.current) {
      setMode('biometric');
    } else if (!canUseBio) {
      setMode('password');
    }
  }, [canUseBio]);

  // When in biometric mode, auto-invoke biometrics prompt so user doesn't have to select or click
  useEffect(() => {
    if (!isOpen || mode !== 'biometric' || !onBiometricUnlock) return;
    if (autoTriggeredRef.current) return;
    autoTriggeredRef.current = true;

    const timer = setTimeout(() => {
      void (async () => {
        setBioLoading(true);
        setError(null);
        try {
          const ok = await onBiometricUnlock();
          if (!ok) {
            setError(t.auth.bioCancelled);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          // If browser restricts user gesture on auto-invoking navigator.credentials.get, wait gracefully
          if (!msg.includes('NotAllowedError') && !msg.includes('user denied')) {
            setError(msg || t.auth.bioFailed);
          }
        } finally {
          setBioLoading(false);
        }
      })();
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen, mode, onBiometricUnlock, t.auth]);

  if (!isOpen) return null;

  const handleManualBioUnlock = async () => {
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
        {/* Prominent Cross-domain Migration Card for New Domain Users */}
        {isInitialSetup && !isLegacyDomain() && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-900">
                  {t.migration.alreadyHaveDataTitle}
                </div>
                <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                  {t.migration.alreadyHaveDataDesc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => requestMigrationFromOldDomain()}
              className="mt-3 w-full h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>{t.migration.migrateBtn}</span>
            </button>
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 border-t border-amber-200" />
              <span className="text-[11px] text-amber-700/80 font-medium">{t.migration.orStartFresh}</span>
              <div className="flex-1 border-t border-amber-200" />
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-700 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            {isInitialSetup ? (
              <KeyRound className="w-7 h-7" />
            ) : mode === 'biometric' ? (
              <Fingerprint className="w-7 h-7 animate-pulse" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-ink">
            {isInitialSetup
              ? t.auth.titleSetup
              : mode === 'biometric'
                ? t.auth.bioWaiting
                : t.auth.titleUnlock}
          </h2>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">
            {isInitialSetup
              ? t.auth.descSetup
              : mode === 'biometric'
                ? t.auth.bioWaitingDesc
                : t.auth.descUnlock}
          </p>
        </div>

        {/* Biometrics-First Dedicated Unlock Interface */}
        {!isInitialSetup && canUseBio && mode === 'biometric' ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4">
              <button
                type="button"
                onClick={handleManualBioUnlock}
                disabled={bioLoading}
                className="group relative w-24 h-24 rounded-full bg-brand-50 hover:bg-brand-100 border-2 border-brand-300 hover:border-brand-500 text-brand-700 flex flex-col items-center justify-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer"
                title={t.auth.bioTouchToUnlock}
              >
                <span className="absolute inset-0 rounded-full bg-brand-400/20 animate-ping opacity-60 pointer-events-none" />
                <Fingerprint className="w-10 h-10 text-brand-700 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-bold text-brand-800">
                  {bioLoading ? '验证中...' : (biometricsLabel || t.auth.bioTouchToUnlock)}
                </span>
              </button>

              {error && (
                <div role="alert" className="mt-4 p-3 rounded-xl bg-rose-50 text-xs text-rose-700 font-medium flex items-center gap-2 max-w-xs text-center">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-line text-center">
              <button
                type="button"
                onClick={() => {
                  userSwitchedToPasswordRef.current = true;
                  setError(null);
                  setMode('password');
                }}
                className="text-xs text-muted hover:text-ink font-semibold underline underline-offset-4 transition cursor-pointer"
              >
                {t.auth.switchToPassword}
              </button>
            </div>
          </div>
        ) : (
          /* Password Form Interface */
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

            {!isInitialSetup && canUseBio && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    userSwitchedToPasswordRef.current = false;
                    autoTriggeredRef.current = false;
                    setError(null);
                    setMode('biometric');
                  }}
                  className="text-xs text-brand-700 hover:text-brand-800 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>{t.auth.switchToBio}</span>
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
