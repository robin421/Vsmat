import React, { useState, useEffect } from 'react';
import { X, Key, Sparkles, ExternalLink } from 'lucide-react';
import { TokenItem } from '../../types';
import { PRESET_SERVICES, getPresetByKey } from '../../types/presets';

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (token: Partial<TokenItem>) => void;
  initialData?: TokenItem | null;
}

export const TokenModal: React.FC<TokenModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [serviceKey, setServiceKey] = useState('openai');
  const [token, setToken] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [balance, setBalance] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [notes, setNotes] = useState('');
  const [consoleUrl, setConsoleUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setServiceKey(initialData.serviceKey);
      setToken(initialData.token);
      setBaseUrl(initialData.baseUrl || '');
      setAccountEmail(initialData.accountEmail || '');
      setOrganizationId(initialData.organizationId || '');
      setBalance(initialData.balance || '');
      setTagsStr((initialData.tags || []).join(', '));
      setNotes(initialData.notes || '');
      setConsoleUrl(initialData.consoleUrl || '');
    } else {
      const defaultPreset = getPresetByKey('openai');
      setName('OpenAI API Key');
      setServiceKey('openai');
      setToken('');
      setBaseUrl(defaultPreset.defaultBaseUrl || '');
      setAccountEmail('');
      setOrganizationId('');
      setBalance('');
      setTagsStr('主力, 生产环境');
      setNotes('');
      setConsoleUrl(defaultPreset.consoleUrl || '');
    }
  }, [initialData, isOpen]);

  const handleServiceChange = (key: string) => {
    setServiceKey(key);
    const p = getPresetByKey(key);
    if (!initialData) {
      setName(`${p.name} Key`);
      if (p.defaultBaseUrl) setBaseUrl(p.defaultBaseUrl);
      if (p.consoleUrl) setConsoleUrl(p.consoleUrl);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !token.trim()) return;

    const tags = tagsStr
      .split(/[,，\s]+/)
      .map(t => t.trim())
      .filter(Boolean);

    onSave({
      id: initialData?.id,
      name: name.trim(),
      serviceKey,
      token: token.trim(),
      baseUrl: baseUrl.trim() || undefined,
      accountEmail: accountEmail.trim() || undefined,
      organizationId: organizationId.trim() || undefined,
      balance: balance.trim() || undefined,
      tags,
      notes: notes.trim() || undefined,
      consoleUrl: consoleUrl.trim() || undefined,
      updatedAt: new Date().toISOString().split('T')[0],
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-subtle">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? '编辑 API Token 密钥' : '收藏新 API Token 密钥'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {/* Preset Service Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              预置服务模板
            </label>
            <select
              value={serviceKey}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle text-xs"
            >
              {PRESET_SERVICES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Key Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              密钥备注名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如: OpenAI GPT-4o 生产主密钥"
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle text-xs"
            />
          </div>

          {/* Secret Token Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              API Token 密钥值 <span className="text-blue-600 font-normal">* (将进行 AES-256-GCM 强加密)</span>
            </label>
            <textarea
              required
              rows={2}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="例如: sk-proj-xxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
            />
          </div>

          {/* Base URL (Endpoint) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Base URL (API 端点)
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="例如: https://api.openai.com/v1"
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
            />
          </div>

          {/* Grid: Account email & Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                所属账号邮箱
              </label>
              <input
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                当前余额/配额备注
              </label>
              <input
                type="text"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="例如: 剩余 $50 / 充足"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              标签 (逗号分隔)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="生产环境, GPT-4, 个人自用"
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
            />
          </div>

          {/* Console URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>官方控制台链接</span>
              {consoleUrl && (
                <a
                  href={consoleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 text-xs flex items-center gap-1 hover:underline font-normal"
                >
                  测试跳转 <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>
            <input
              type="text"
              value={consoleUrl}
              onChange={(e) => setConsoleUrl(e.target.value)}
              placeholder="https://platform.openai.com/api-keys"
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              安全备忘与说明
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如: 绑定的信用卡、重置周期或组织成员说明..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-xs font-semibold"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/30 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              保存到加密保险箱
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
