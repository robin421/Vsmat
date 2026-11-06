import React, { useState } from 'react';
import { Lock, Shield, KeyRound, Check, AlertCircle } from 'lucide-react';

interface MasterPasswordModalProps {
  isOpen: boolean;
  isInitialSetup: boolean;
  onUnlock: (password: string, remember: boolean) => Promise<boolean>;
  onSetup: (password: string, remember: boolean) => Promise<void>;
}

export const MasterPasswordModal: React.FC<MasterPasswordModalProps> = ({
  isOpen,
  isInitialSetup,
  onUnlock,
  onSetup,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

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
        if (password.length < 6) {
          setError('主密码长度建议至少 6 位');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('两次输入的密码不一致');
          setLoading(false);
          return;
        }
        await onSetup(password, remember);
      } else {
        const success = await onUnlock(password, remember);
        if (!success) {
          setError('主密码错误，解密失败');
        }
      }
    } catch (err: any) {
      setError(err?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white border border-[#EBEBEB] p-7 airbnb-card text-[#222222]">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F2] text-[#FF385C] border border-[#FFCCD3] flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#222222]">
            {isInitialSetup ? '设置保险箱主密码' : '解锁 Vsmat 保险箱'}
          </h2>
          <p className="text-xs text-[#717171] mt-1 max-w-xs mx-auto">
            {isInitialSetup
              ? '所有 Token 密钥与账号信息将在本机进行 AES-256-GCM 强加密，安全无外泄'
              : '输入主密码以解密您的 API Token 密钥与订阅账号'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#222222] mb-1.5">
              主密码 (Master Password)
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入主密码"
              className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:bg-white focus:border-[#222222] rounded-xl px-3.5 text-sm font-mono text-[#222222] outline-none transition shadow-2xs"
            />
          </div>

          {isInitialSetup && (
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                再次确认主密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入主密码"
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:bg-white focus:border-[#222222] rounded-xl px-3.5 text-sm font-mono text-[#222222] outline-none transition shadow-2xs"
              />
            </div>
          )}

          {/* Remember on this machine */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 text-xs text-[#717171] cursor-pointer select-none font-medium">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-[#DDDDDD] bg-white accent-[#FF385C]"
              />
              <span>记住解锁状态 (本机信任免密，日常使用无需反复输入)</span>
            </label>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-[#FFF0F2] border border-[#FFCCD3] text-xs text-[#FF385C] font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FF385C] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl btn-rausch text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2 mt-2 active:scale-95 disabled:opacity-40"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? '处理中...' : isInitialSetup ? '完成设置并开启保险箱' : '立即解锁'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
