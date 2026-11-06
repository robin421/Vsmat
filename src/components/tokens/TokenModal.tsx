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
  const [serviceKey, setServiceKey] = useState('custom');
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
      setName('');
      setServiceKey('custom');
      setToken('');
      setBaseUrl('');
      setAccountEmail('');
      setOrganizationId('');
      setBalance('');
      setTagsStr('');
      setNotes('');
      setConsoleUrl('');
    }
  }, [initialData, isOpen]);

  const handleServiceChange = (key: string) => {
    setServiceKey(key);
    if (key === 'custom') return;
    const p = getPresetByKey(key);
    if (!initialData && p) {
      if (!name || PRESET_SERVICES.some(s => s.name === name)) {
        setName(`${p.name} API Key`);
      }
      if (p.defaultBaseUrl) setBaseUrl(p.defaultBaseUrl);
      if (p.consoleUrl) setConsoleUrl(p.consoleUrl);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !token.trim()) return;

    const tags = tagsStr
      .split(/[,，]/)
      .map((t) => t.trim())
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
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#EBEBEB] p-6 sm:p-7 airbnb-card overflow-y-auto max-h-[92vh] text-[#222222]">
        <div className="flex items-center justify-between pb-4 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#000000] text-white border border-black/10 flex items-center justify-center shadow-2xs">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#222222]">
                {initialData ? '编辑 API Token 密钥' : '添加新 API Token 密钥'}
              </h3>
              <p className="text-xs text-[#717171]">
                端到端强加密保存开发凭证与调用 Endpoint
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {/* Preset selector */}
          <div>
            <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
              快速预填服务模板
            </label>
            <select
              value={serviceKey}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 text-zinc-800 outline-none focus:bg-white focus:border-[#222222] shadow-2xs text-xs"
            >
              <option value="custom">-- 自定义服务 (自行输入) --</option>
              {PRESET_SERVICES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name & Token */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
                密钥标识名称 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: OpenAI 主主力 Key / DeepSeek 生产环境"
                className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
                API Token / 密钥明文 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 font-mono text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
              />
            </div>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
              API Base URL (中转 / 代理反代地址)
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 font-mono text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
            />
          </div>

          {/* Account & Org */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
                归属账号 / 邮箱
              </label>
              <input
                type="text"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 font-mono text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
                Organization / Project ID
              </label>
              <input
                type="text"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                placeholder="org-..."
                className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 font-mono text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
              />
            </div>
          </div>

          {/* Balance & Status */}
          <div>
            <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
              额度与余额备忘
            </label>
            <input
              type="text"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="例如: 剩余 $48.50 (有效期至 2026-12)"
              className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
              标签 (逗号分隔)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="生产环境, GPT-4, 个人自用"
              className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
            />
          </div>

          {/* Console URL */}
          <div>
            <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5 flex items-center justify-between">
              <span>官方控制台链接</span>
              {consoleUrl && (
                <a
                  href={consoleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-600 text-xs flex items-center gap-1 hover:text-[#222222] font-normal"
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
              className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 font-mono text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
              安全备忘与说明
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如: 绑定的信用卡、重置周期或组织成员说明..."
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBEBEB]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD] hover:border-[#222222] transition text-xs font-semibold"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl btn-rausch text-white font-bold transition text-xs flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <span>保存到加密保险箱</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
