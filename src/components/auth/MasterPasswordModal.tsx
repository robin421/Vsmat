import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Fingerprint } from 'lucide-react';
import { MIN_PASSWORD_LENGTH, STRENGTH_LABELS, passwordStrength } from '../../lib/password';

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
  biometricsLabel = '触控 ID (Touch ID)',
  onBiometricUnlock,
}) => {
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
        setError('已取消触控 ID 验证，可输入主密码解锁');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '触控 ID 验证失败');
    } finally {
      setBioLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError('请输入主密码');
      return;
    }

    setLoading(true);
    try {
      if (isInitialSetup) {
        if (password.length < MIN_PASSWORD_LENGTH) {
          setError(`主密码至少需要 ${MIN_PASSWORD_LENGTH} 位`);
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('两次输入的密码不一致');
          setLoading(false);
          return;
        }
        await onSetup(password, remember, isBiometricsSupported && enableBiometrics);
      } else {
        const success = await onUnlock(password, remember);
        if (!success) {
          setError('主密码错误，解密失败');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white border border-line p-7 surface-card text-ink shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white border border-ink/10 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-ink">
            {isInitialSetup ? '设置保险箱主密码' : '解锁 Vsmat 保险箱'}
          </h2>
          <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
            {isInitialSetup
              ? '所有凭证与账号均在本机进行 AES-256-GCM 强加密，安全无外泄'
              : '验证触控 ID 或输入主密码以解密您的 API Key 与订阅资产'}
          </p>
        </div>

        {/* Touch ID quick unlock shortcut if enrolled */}
        {!isInitialSetup && isBiometricsEnrolled && onBiometricUnlock && (
          <div className="mb-4">
            <button
              type="button"
              disabled={bioLoading || loading}
              onClick={handleBioUnlock}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-brand-700 via-brand-800 to-indigo-700 hover:from-brand-800 hover:to-indigo-800 text-white font-semibold text-sm shadow-sm hover:shadow transition flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-50"
            >
              <Fingerprint className="w-5 h-5 text-white/90 animate-pulse" />
              <span>{bioLoading ? '请轻触触控 ID...' : `使用 ${biometricsLabel} 快速解锁`}</span>
            </button>
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line" /></div>
              <span className="relative bg-white px-3 text-[11px] text-muted">或使用主密码解锁</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              主密码 (Master Password)
            </label>
            <input
              type="password"
              autoFocus={!isBiometricsEnrolled}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入主密码"
              className="w-full h-11 bg-inset border border-line-strong focus:border-ink rounded-lg px-3.5 text-sm text-ink outline-none transition"
            />
          </div>

          {isInitialSetup && password && (
            <p className="text-xs text-muted -mt-2" aria-live="polite">
              强度：{STRENGTH_LABELS[passwordStrength(password)]}（至少 {MIN_PASSWORD_LENGTH} 位，建议混合大小写、数字、符号或使用长口令）。忘记主密码将无法恢复数据。
            </p>
          )}

          {isInitialSetup && (
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                再次确认主密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入主密码"
                className="w-full h-11 bg-inset border border-line-strong focus:border-ink rounded-lg px-3.5 text-sm text-ink outline-none transition"
              />
            </div>
          )}

          {/* Options: Remember & Touch ID enrollment */}
          <div className="pt-1 space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-muted cursor-pointer select-none font-medium">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-line-strong bg-white accent-brand-700"
              />
              <span>记住解锁状态（仅在本设备保存不可导出的解锁密钥，主动锁定或空闲超时后需重新输入）</span>
            </label>

            {isInitialSetup && isBiometricsSupported && (
              <label className="flex items-center gap-2.5 text-xs text-muted cursor-pointer select-none font-medium pt-0.5">
                <input
                  type="checkbox"
                  checked={enableBiometrics}
                  onChange={(e) => setEnableBiometrics(e.target.checked)}
                  className="w-4 h-4 rounded border-line-strong bg-white accent-brand-700"
                />
                <span className="flex items-center gap-1.5 text-ink font-semibold">
                  <Fingerprint className="w-3.5 h-3.5 text-brand-700" />
                  <span>同时启用 {biometricsLabel} 快速解锁</span>
                </span>
              </label>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || bioLoading}
            className="w-full h-11 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm transition flex items-center justify-center gap-2 mt-2 active:scale-95 disabled:opacity-40"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? '处理中...' : isInitialSetup ? '完成设置并开启保险箱' : '立即解锁'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
