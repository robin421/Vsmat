import React, { useState } from 'react';
import { AlertCircle, Check, KeyRound, Settings, X } from 'lucide-react';
import { AppSettings } from '../../types';
import { useDismiss } from '../../hooks/useDismiss';
import { MIN_PASSWORD_LENGTH, STRENGTH_LABELS, passwordStrength } from '../../lib/password';
import { requestNotificationPermission } from '../../lib/notifications';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onChangeSettings: (patch: Partial<AppSettings>) => void;
  onChangeRemember: (remember: boolean) => void;
  /** Resolves false when the current password is wrong. */
  onChangePassword: (current: string, next: string) => Promise<boolean>;
}

const AUTO_LOCK_OPTIONS = [
  { value: 0, label: '从不' },
  { value: 5, label: '5 分钟' },
  { value: 15, label: '15 分钟' },
  { value: 30, label: '30 分钟' },
  { value: 60, label: '60 分钟' },
];

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
}) => {
  useDismiss(isOpen, onClose);

  const [rate, setRate] = useState(String(settings.usdToCnyRate));
  const [notifyHint, setNotifyHint] = useState<string | null>(null);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmNext, setConfirmNext] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const commitRate = () => {
    const n = Number(rate);
    if (Number.isFinite(n) && n > 0) onChangeSettings({ usdToCnyRate: n });
    else setRate(String(settings.usdToCnyRate));
  };

  const handleNotifications = async (on: boolean) => {
    setNotifyHint(null);
    if (on && !(await requestNotificationPermission())) {
      setNotifyHint('浏览器未授予通知权限，请在地址栏的网站设置中允许');
      return;
    }
    onChangeSettings({ enableBrowserNotifications: on });
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwDone(false);
    if (next.length < MIN_PASSWORD_LENGTH) return setPwError(`新主密码至少需要 ${MIN_PASSWORD_LENGTH} 位`);
    if (next !== confirmNext) return setPwError('两次输入的新主密码不一致');
    if (next === current) return setPwError('新主密码不能与当前主密码相同');

    setSaving(true);
    try {
      if (await onChangePassword(current, next)) {
        setCurrent('');
        setNext('');
        setConfirmNext('');
        setPwDone(true);
      } else {
        setPwError('当前主密码不正确');
      }
    } catch (err) {
      setPwError(err instanceof Error ? err.message : '修改失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="设置" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl surface-pop p-5 sm:p-7 max-h-[92vh] overflow-y-auto text-ink">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">设置</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="w-8 h-8 rounded-full border border-line-strong hover:border-ink text-muted hover:text-ink flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-line">
          <div className={rowClass}>
            <div className="min-w-0">
              <div className="text-sm font-medium">自动锁定</div>
              <div className="text-xs text-muted mt-0.5">一段时间没有操作后锁定保险箱</div>
            </div>
            <select
              aria-label="自动锁定"
              value={settings.autoLockMinutes}
              onChange={(e) => onChangeSettings({ autoLockMinutes: Number(e.target.value) })}
              className="field h-9 rounded-lg px-2 text-sm outline-none shrink-0"
            >
              {!AUTO_LOCK_OPTIONS.some((o) => o.value === settings.autoLockMinutes) && (
                <option value={settings.autoLockMinutes}>{settings.autoLockMinutes} 分钟</option>
              )}
              {AUTO_LOCK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className={rowClass}>
            <div className="min-w-0">
              <div className="text-sm font-medium">记住解锁状态</div>
              <div className="text-xs text-muted mt-0.5">刷新页面后无需重新输入主密码</div>
            </div>
            <Toggle label="记住解锁状态" checked={settings.rememberUnlocked} onChange={onChangeRemember} />
          </div>

          <div className={rowClass}>
            <div className="min-w-0">
              <div className="text-sm font-medium">续费桌面通知</div>
              <div className="text-xs text-muted mt-0.5">{notifyHint || '解锁时提醒 3 天内到期的订阅'}</div>
            </div>
            <Toggle label="续费桌面通知" checked={settings.enableBrowserNotifications} onChange={(v) => void handleNotifications(v)} />
          </div>

          <div className={rowClass}>
            <div className="min-w-0">
              <div className="text-sm font-medium">美元兑人民币汇率</div>
              <div className="text-xs text-muted mt-0.5">其它币种使用内置参考汇率</div>
            </div>
            <input
              type="number"
              step="0.01"
              min="0.01"
              aria-label="美元兑人民币汇率"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              onBlur={commitRate}
              className="field w-24 h-9 rounded-lg px-2.5 text-sm text-right outline-none shrink-0"
            />
          </div>
        </div>

        <form onSubmit={handlePassword} className="pt-4 border-t border-line space-y-2.5">
          <div>
            <div className="text-sm font-medium">修改主密码</div>
            <div className="text-xs text-muted mt-0.5">已导出的备份不受影响，仍需用当时的主密码打开。</div>
          </div>
          <input type="password" autoComplete="current-password" aria-label="当前主密码" placeholder="当前主密码" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
          <input type="password" autoComplete="new-password" aria-label="新主密码" placeholder="新主密码" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
          {next && (
            <p className="text-xs text-muted" aria-live="polite">
              强度：{STRENGTH_LABELS[passwordStrength(next)]}（至少 {MIN_PASSWORD_LENGTH} 位）。忘记主密码将无法恢复数据。
            </p>
          )}
          <input type="password" autoComplete="new-password" aria-label="确认新主密码" placeholder="再次输入新主密码" value={confirmNext} onChange={(e) => setConfirmNext(e.target.value)} className={inputClass} />

          {pwError && (
            <div role="alert" className="p-2.5 rounded-lg bg-rose-50 text-xs text-rose-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pwError}</span>
            </div>
          )}
          {pwDone && (
            <div role="status" className="p-2.5 rounded-lg bg-emerald-50 text-xs text-emerald-800 font-medium flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>主密码已修改，下次解锁请使用新主密码</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !current || !next || !confirmNext}
            className="w-full h-10 rounded-lg btn-primary disabled:bg-brand-200 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>{saving ? '处理中...' : '修改主密码'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
