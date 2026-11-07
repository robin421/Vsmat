import React, { useState, useEffect } from 'react';
import { X, Key, ChevronDown, ChevronUp, Globe, Sparkles } from 'lucide-react';
import { TokenItem } from '../../types';
import { PRESET_SERVICES, getPresetByKey } from '../../types/presets';
import { useDismiss } from '../../hooks/useDismiss';
import { useI18n } from '../../i18n';

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
  useDismiss(isOpen, onClose);
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [serviceKey, setServiceKey] = useState('custom');
  const [token, setToken] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [modelName, setModelName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [balance, setBalance] = useState('');
  const [notes, setNotes] = useState('');
  const [consoleUrl, setConsoleUrl] = useState('');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setServiceKey(initialData.serviceKey);
      setToken(initialData.token);
      setBaseUrl(initialData.baseUrl || '');
      setModelName(initialData.modelName || '');
      setAccountEmail(initialData.accountEmail || '');
      setBalance(initialData.balance || '');
      setNotes(initialData.notes || '');
      setConsoleUrl(initialData.consoleUrl || '');
      if (initialData.accountEmail || initialData.balance || initialData.notes || initialData.consoleUrl) {
        setShowMore(true);
      }
    } else {
      setName('');
      setServiceKey('custom');
      setToken('');
      setBaseUrl('');
      setModelName('');
      setAccountEmail('');
      setBalance('');
      setNotes('');
      setConsoleUrl('');
      setShowMore(false);
    }
  }, [initialData, isOpen]);

  const handleServiceChange = (key: string) => {
    setServiceKey(key);
    if (key === 'custom') return;
    const p = getPresetByKey(key);
    if (!initialData && p) {
      if (!name || PRESET_SERVICES.some((s) => s.name === name || name.endsWith('API Key'))) {
        setName(`${p.name} Key`);
      }
      if (p.defaultBaseUrl) setBaseUrl(p.defaultBaseUrl);
      if (p.defaultModel) setModelName(p.defaultModel);
      if (p.consoleUrl) setConsoleUrl(p.consoleUrl);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !token.trim()) return;

    onSave({
      id: initialData?.id,
      name: name.trim(),
      serviceKey,
      token: token.trim(),
      baseUrl: baseUrl.trim() || undefined,
      modelName: modelName.trim() || undefined,
      accountEmail: accountEmail.trim() || undefined,
      balance: balance.trim() || undefined,
      notes: notes.trim() || undefined,
      consoleUrl: consoleUrl.trim() || undefined,
      tags: initialData?.tags || [],
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/40 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white border border-line p-6 sm:p-7 surface-card overflow-y-auto max-h-[92vh] text-ink">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-700 text-white border border-ink/10 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">
                {initialData ? t.tokens.modalTitleEdit : t.tokens.modalTitleNew}
              </h3>
              <p className="text-xs text-muted">{t.tokens.modalDesc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            className="w-9 h-9 rounded-full border border-line-strong hover:border-ink text-muted hover:text-ink flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Preset platform quick chips */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center justify-between">
              <span>{t.tokens.fieldService}</span>
              <span className="text-[11px] text-muted font-normal">点击自动补全域名与模型</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SERVICES.filter(
                (p) => p.category === 'ai' || p.category === 'developer'
              ).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleServiceChange(p.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    serviceKey === p.key
                      ? 'bg-ink text-white border-ink shadow-sm'
                      : 'bg-white text-muted hover:text-ink border-line'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleServiceChange('custom')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                  serviceKey === 'custom'
                    ? 'bg-ink text-white border-ink shadow-sm'
                    : 'bg-white text-muted hover:text-ink border-line'
                }`}
              >
                {t.subModal.customService}
              </button>
            </div>
          </div>

          {/* Key Label / Name */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t.tokens.fieldName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.tokens.placeholderName}
              className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 text-sm text-ink outline-none"
            />
          </div>

          {/* API Key Token */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1 flex items-center justify-between">
              <span>
                {t.tokens.fieldKey} <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                AES-256 加密
              </span>
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value.trim())}
              placeholder="sk-proj-..."
              className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 font-mono text-xs text-ink outline-none"
            />
          </div>

          {/* Base URL & Model Name (Two-Column Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-brand-700" />
                <span>{t.tokens.fieldBaseUrl}</span>
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={t.tokens.baseUrlPlaceholder}
                className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 font-mono text-xs text-ink outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{t.tokens.fieldModel}</span>
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder={t.tokens.modelPlaceholder}
                className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 font-mono text-xs text-ink outline-none"
              />
            </div>
          </div>

          {/* Collapsible toggle for optional fields */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1.5 py-1 select-none transition-colors"
            >
              {showMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showMore ? t.tokens.hideMoreOptions : t.tokens.moreOptions}</span>
            </button>
          </div>

          {/* Collapsible section */}
          {showMore && (
            <div className="p-3.5 rounded-2xl bg-inset/70 border border-line space-y-3 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    {t.tokens.fieldEmail}
                  </label>
                  <input
                    type="email"
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    placeholder="dev@example.com"
                    className="w-full h-9 bg-white border border-line focus:border-ink rounded-lg px-3 text-xs text-ink outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    {t.tokens.fieldBalance}
                  </label>
                  <input
                    type="text"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="例如: 剩余 $48.50"
                    className="w-full h-9 bg-white border border-line focus:border-ink rounded-lg px-3 text-xs text-ink outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  {t.tokens.fieldConsoleUrl}
                </label>
                <input
                  type="url"
                  value={consoleUrl}
                  onChange={(e) => setConsoleUrl(e.target.value)}
                  placeholder="https://platform.openai.com/api-keys"
                  className="w-full h-9 bg-white border border-line focus:border-ink rounded-lg px-3 text-xs font-mono text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  {t.tokens.fieldNotes}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="使用备忘、绑卡信息或模型速率限制..."
                  className="w-full p-2.5 bg-white border border-line focus:border-ink rounded-lg text-xs text-ink outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-line text-xs font-semibold text-ink hover:bg-inset transition"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg btn-primary text-xs font-semibold transition active:scale-95"
            >
              {initialData ? t.subModal.saveChanges : t.tokens.addNew}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
