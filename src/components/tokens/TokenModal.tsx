import React, { useState, useEffect } from 'react';
import { X, Key, Sparkles, ExternalLink } from 'lucide-react';
import { TokenItem } from '../../types';
import { PRESET_SERVICES, getPresetByKey } from '../../types/presets';
import { safeHttpUrl } from '../../lib/url';
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
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-line p-6 sm:p-7 surface-card overflow-y-auto max-h-[92vh] text-ink">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-700 text-white border border-ink/10 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">
                {initialData ? t.tokens.modalTitleEdit : t.tokens.modalTitleNew}
              </h3>
              <p className="text-xs text-muted">
                {t.tokens.modalDesc}
              </p>
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
          {/* Preset selector */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              {t.tokens.fieldService}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SERVICES.filter(p => p.category === 'ai' || p.category === 'developer').map(p => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handleServiceChange(p.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                    serviceKey === p.key
                      ? 'bg-ink text-white border-ink'
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
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-muted hover:text-ink border-line'
                }`}
              >
                {t.subModal.customService}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t.tokens.fieldName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. OpenAI GPT-4 Production Key"
              className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 text-sm text-ink outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t.tokens.fieldKey} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="sk-proj-..."
              className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 font-mono text-xs text-ink outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t.tokens.fieldBaseUrl}
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 font-mono text-xs text-ink outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                {t.tokens.fieldEmail}
              </label>
              <input
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="dev@company.com"
                className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 text-sm text-ink outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                {t.tokens.fieldOrgId}
              </label>
              <input
                type="text"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                placeholder="org-..."
                className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 text-sm text-ink outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t.tokens.fieldBalance}
            </label>
            <input
              type="text"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="e.g. $48.50 left (exp: 2026-12)"
              className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 text-sm text-ink outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              {t.tokens.fieldTags}
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="production, llm, team-a"
              className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 text-sm text-ink outline-none"
            />
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
              className="w-full h-10 bg-white border border-line focus:border-ink rounded-lg px-3 text-sm text-ink outline-none font-mono text-xs"
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
              placeholder="Notes..."
              className="w-full p-2.5 bg-white border border-line focus:border-ink rounded-lg text-sm text-ink outline-none resize-none"
            />
          </div>

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
              className="px-5 py-2.5 rounded-lg btn-primary text-xs font-semibold transition"
            >
              {initialData ? t.common.save : t.tokens.addNew}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
