import React, { useState } from 'react';
import { AlertCircle, Check, Fingerprint, KeyRound, Settings, X, Globe } from 'lucide-react';
import { AppSettings } from '../../types';
import { useDismiss } from '../../hooks/useDismiss';
import { MIN_PASSWORD_LENGTH, STRENGTH_LABELS, passwordStrength } from '../../lib/password';
import { requestNotificationPermission } from '../../lib/notifications';
import { BiometricInfo } from '../../lib/biometrics';
import { useI18n, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onChangeSettings: (patch: Partial<AppSettings>) => void;
  onChangeRemember: (remember: boolean) => void;
  /** Resolves false when the current password is wrong. */
  onChangePassword: (current: string, next: string) => Promise<boolean>;
  isBiometricsSupported?: boolean;
  isBiometricsEnrolled?: boolean;
  biometricsInfo?: BiometricInfo;
  onToggleBiometrics?: (enable: boolean) => Promise<boolean>;
}

const inputClass = 'field w-full h-10 rounded-lg px-3 text-sm outline-none';
const rowClass = 'flex items-center justify-between gap-4 py-3';

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-brand-700' : 'bg-line-strong'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-2xs transition-transform ${checked ? 'translate-x-4' : ''}`} />
  </button>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  onChangeRemember,
  onChangePassword,
  isBiometricsSupported = false,
  isBiometricsEnrolled = false,
  biometricsInfo,
  onToggleBiometrics,
}) => {
  useDismiss(isOpen, onClose);
  const { t, format, language, setLanguage } = useI18n();

  const [rate, setRate] = useState(String(settings.usdToCnyRate));
  const [notifyHint, setNotifyHint] = useState<string | null>(null);
  const [bioHint, setBioHint] = useState<string | null>(null);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmNext, setConfirmNext] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const autoLockOptions = [
    { value: 0, label: t.settings.lockNever },
    { value: 5, label: t.settings.lock5m },
    { value: 15, label: t.settings.lock15m },
    { value: 30, label: t.settings.lock30m },
    { value: 60, label: t.settings.lock60m },
  ];

  const handleLanguageChange = (code: SupportedLanguage) => {
    setLanguage(code);
    onChangeSettings({ language: code });
  };

  const handleToggleBio = async (on: boolean) => {
    if (!onToggleBiometrics) return;
    setBioHint(null);
    try {
      if (on) setBioHint(t.auth.bioBtn);
      await onToggleBiometrics(on);
      setBioHint(on ? t.settings.biometricsDesc : t.settings.biometricsTitle);
    } catch (err) {
      setBioHint(err instanceof Error ? err.message : t.auth.bioFailed);
    }
  };

  const commitRate = () => {
    const n = Number(rate);
    if (Number.isFinite(n) && n > 0) onChangeSettings({ usdToCnyRate: n });
    else setRate(String(settings.usdToCnyRate));
  };

  const handleNotifications = async (on: boolean) => {
    setNotifyHint(null);
    if (on && !(await requestNotificationPermission())) {
      setNotifyHint(t.reminder.notificationDenied);
      return;
    }
    onChangeSettings({ enableBrowserNotifications: on });
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwDone(false);
    if (next.length < MIN_PASSWORD_LENGTH) {
      return setPwError(format(t.settings.errMinLength, { min: MIN_PASSWORD_LENGTH }));
    }
    if (next !== confirmNext) return setPwError(t.settings.errMismatch);
    if (next === current) return setPwError(t.settings.errSame);

    setSaving(true);
    try {
      if (await onChangePassword(current, next)) {
        setCurrent('');
        setNext('');
        setConfirmNext('');
        setPwDone(true);
      } else {
        setPwError(t.settings.errCurrentWrong);
      }
    } catch (err) {
      setPwError(err instanceof Error ? err.message : t.auth.pwWrong);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={t.settings.title} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl surface-pop p-5 sm:p-7 max-h-[92vh] overflow-y-auto text-ink">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">{t.settings.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="w-8 h-8 rounded-full border border-line-strong hover:border-ink text-muted hover:text-ink flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-line">
          {/* Display Language */}
          <div className={rowClass}>
            <div className="min-w-0">
              <div className="text-sm font-medium flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-brand-700" />
                <span>{t.settings.languageTitle}</span>
              </div>
              <div className="text-xs text-muted mt-0.5">{t.settings.languageDesc}</div>
            </div>
            <select
              aria-label={t.settings.languageTitle}
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="field h-9 rounded-lg px-2 text-sm outline-none shrink-0 font-medium"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className={rowClass}>
            <div className="min-w-0">
              <div className="text-sm font-medium">{t.settings.autoLockTitle}</div>
              <div className="text-xs text-muted mt-0.5">{t.settings.autoLockDesc}</div>
            </div>
            <select
              aria-label={t.settings.autoLockTitle}
              value={settings.autoLockMinutes}
              onChange={(e) => onChangeSettings({ autoLockMinutes: Number(e.target.value) })}
              className="field h-9 rounded-lg px-2 text-sm outline-none shrink-0"
            >
              {!autoLockOptions.some((o) => o.value === settings.autoLockMinutes) && (
                <option value={settings.autoLockMinutes}>{settings.autoLockMinutes} min</option>
              )}
              {autoLockOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className={rowClass}>
            <div className="min-w-0">
              <div className="text-sm font-medium">{t.settings.rememberTitle}</div>
              <div className="text-xs text-muted mt-0.5">{t.settings.rememberDesc}</div>
            </div>
            <Toggle label={t.settings.rememberTitle} checked={settings.rememberUnlocked} onChange={onChangeRemember} />
          </div>

          {isBiometricsSupported && onToggleBiometrics && (
            <div className={rowClass}>
              <div className="min-w-0">
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-brand-700" />
                  <span>{biometricsInfo?.name || t.settings.biometricsTitle}</span>
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {bioHint || biometricsInfo?.description || t.settings.biometricsDesc}
                </div>
              </div>
              <Toggle
                label={biometricsInfo?.short || t.settings.biometricsTitle}
                checked={isBiometricsEnrolled || !!settings.biometricsEnabled}
                onChange={(v) => void handleToggleBio(v)}
              />
            </div>
          )}

          <div className={rowClass}>
            <div className="min-w-0">
              <div className="text-sm font-medium">{t.settings.notificationsTitle}</div>
              <div className="text-xs text-muted mt-0.5">{notifyHint || t.settings.notificationsDesc}</div>
            </div>
            <Toggle label={t.settings.notificationsTitle} checked={settings.enableBrowserNotifications} onChange={(v) => void handleNotifications(v)} />
          </div>

          <div className={rowClass}>
            <div className="min-w-0">
              <div className="text-sm font-medium">{t.settings.exchangeRateTitle}</div>
              <div className="text-xs text-muted mt-0.5">{t.settings.exchangeRateDesc}</div>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              aria-label={t.settings.exchangeRateTitle}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              onBlur={commitRate}
              className="field w-24 h-9 rounded-lg px-2.5 text-sm text-right outline-none shrink-0"
            />
          </div>
        </div>

        <form onSubmit={handlePassword} className="pt-4 border-t border-line space-y-2.5">
          <div>
            <div className="text-sm font-medium">{t.settings.passwordSection}</div>
            <div className="text-xs text-muted mt-0.5">{t.settings.passwordSectionDesc}</div>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            aria-label={t.settings.currentPwPlaceholder}
            placeholder={t.settings.currentPwPlaceholder}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            autoComplete="new-password"
            aria-label={t.settings.newPwPlaceholder}
            placeholder={t.settings.newPwPlaceholder}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={inputClass}
          />
          {next && (
            <p className="text-xs text-muted" aria-live="polite">
              {format(t.settings.pwStrength, {
                strength: STRENGTH_LABELS[passwordStrength(next)],
                min: MIN_PASSWORD_LENGTH,
              })}
            </p>
          )}
          <input
            type="password"
            autoComplete="new-password"
            aria-label={t.settings.confirmPwPlaceholder}
            placeholder={t.settings.confirmPwPlaceholder}
            value={confirmNext}
            onChange={(e) => setConfirmNext(e.target.value)}
            className={inputClass}
          />

          {pwError && (
            <div role="alert" className="p-2.5 rounded-lg bg-rose-50 text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pwError}</span>
            </div>
          )}
          {pwDone && (
            <div role="status" className="p-2.5 rounded-lg bg-emerald-50 text-xs text-emerald-800 font-medium flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{t.settings.pwSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !current || !next || !confirmNext}
            className="w-full h-10 rounded-lg btn-primary disabled:bg-brand-200 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>{saving ? t.settings.pwProcessing : t.settings.pwSubmit}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
