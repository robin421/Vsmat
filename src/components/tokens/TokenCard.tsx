import React, { useState, useRef, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  Globe,
  MoreHorizontal,
  ChevronDown,
  Cpu,
  FileCode,
  FileText
} from 'lucide-react';
import { TokenItem } from '../../types';
import { getPresetByKey } from '../../types/presets';
import { BrandBadge } from '../common/BrandBadge';
import { safeHttpUrl } from '../../lib/url';
import { useI18n } from '../../i18n';

interface TokenCardProps {
  token: TokenItem;
  onEdit: (token: TokenItem) => void;
  onDelete: (id: string) => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, onEdit, onDelete }) => {
  const { t } = useI18n();
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);

  const copyMenuRef = useRef<HTMLDivElement | null>(null);

  const preset = getPresetByKey(token.serviceKey);
  const effectiveBaseUrl = token.baseUrl || preset.defaultBaseUrl || '';
  const effectiveModel = token.modelName || preset.defaultModel || '';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target as Node)) {
        setShowCopyMenu(false);
      }
    };
    if (showCopyMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCopyMenu]);

  const handleCopyKey = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(token.token);
      setCopiedKey(true);
      setShowCopyMenu(false);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {}
  };

  const buildConfigString = (format: 'text' | 'json' | 'env'): string => {
    if (format === 'json') {
      const obj: Record<string, string> = {
        apiKey: token.token,
      };
      if (effectiveBaseUrl) obj.baseUrl = effectiveBaseUrl;
      if (effectiveModel) obj.model = effectiveModel;
      return JSON.stringify(obj, null, 2);
    }

    if (format === 'env') {
      const lines: string[] = [];
      if (effectiveBaseUrl) lines.push(`OPENAI_BASE_URL="${effectiveBaseUrl}"`);
      lines.push(`OPENAI_API_KEY="${token.token}"`);
      if (effectiveModel) lines.push(`OPENAI_MODEL="${effectiveModel}"`);
      return lines.join('\n');
    }

    // Default: text note format with Base URL, Key, Model
    const parts: string[] = [];
    if (effectiveBaseUrl) parts.push(`Base URL: ${effectiveBaseUrl}`);
    parts.push(`API Key: ${token.token}`);
    if (effectiveModel) parts.push(`Model: ${effectiveModel}`);
    return parts.join('\n');
  };

  const handleCopyConfig = async (format: 'text' | 'json' | 'env', e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const content = buildConfigString(format);
      await navigator.clipboard.writeText(content);
      setCopiedConfig(true);
      setShowCopyMenu(false);
      setTimeout(() => setCopiedConfig(false), 2000);
    } catch {}
  };

  const maskedToken = token.token.length > 12
    ? `${token.token.slice(0, 7)}••••••••••••••••${token.token.slice(-4)}`
    : '••••••••••••••••';

  return (
    <div
      onClick={() => onEdit(token)}
      className="group relative cursor-pointer bg-white rounded-2xl shadow-card p-4 flex flex-col gap-3.5 row:grid row:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] row:items-center row:gap-5 row:px-5 row:py-4 row:bg-transparent row:shadow-none row:rounded-none row:first:rounded-t-2xl row:last:rounded-b-2xl row:hover:bg-canvas/70 transition-colors"
    >
      {/* 1. Identity */}
      <div className="flex items-center gap-3 min-w-0 pr-24 row:pr-0">
        <BrandBadge serviceKey={token.serviceKey} name={token.name} size="md" />
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink tracking-tight truncate leading-snug" title={token.name}>
            {token.name}
          </h3>
          <p className="text-xs text-muted mt-0.5 break-all select-all truncate" title={token.accountEmail || preset.name}>
            {token.accountEmail || preset.name}
          </p>
        </div>
      </div>

      {/* 2. Key & Model (核心三要素中的 密钥 与 模型) */}
      <div className="min-w-0 rounded-xl bg-inset px-3 py-2.5 row:bg-transparent row:p-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 text-xs text-muted mb-1">
          <span className="font-medium whitespace-nowrap">{t.tokens.tokenLabel}</span>
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="hover:text-ink transition-colors flex items-center gap-1 whitespace-nowrap font-medium"
          >
            {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showKey ? t.common.hide : t.common.show}</span>
          </button>
        </div>
        <div className="font-mono text-[13px] text-ink truncate select-all font-medium">
          {showKey ? token.token : maskedToken}
        </div>
        {effectiveModel && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-brand-800">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-brand-50 border border-brand-100 font-mono text-[11px] font-semibold truncate max-w-[200px]" title={`推荐模型: ${effectiveModel}`}>
              <Cpu className="w-3 h-3 text-brand-600 shrink-0" />
              <span className="truncate">{effectiveModel}</span>
            </span>
          </div>
        )}
      </div>

      {/* 3. Endpoint & Balance (核心三要素中的 域名 及 余额) */}
      <div className="min-w-0 text-[13px] flex items-center justify-between gap-3 row:block">
        {effectiveBaseUrl ? (
          <div className="text-muted truncate flex items-center gap-1.5 min-w-0" title={`Base URL: ${effectiveBaseUrl}`}>
            <Globe className="w-3.5 h-3.5 text-subtle shrink-0" />
            <span className="truncate font-mono text-xs text-ink/80">{effectiveBaseUrl}</span>
          </div>
        ) : (
          <div className="text-xs text-muted/60 italic">默认官方接口</div>
        )}
        <div className="font-semibold text-ink truncate row:mt-1.5 shrink-0 row:shrink text-xs sm:text-sm">
          {token.balance || t.tokens.statusOk}
        </div>
      </div>

      {/* 4. Actions (操作区：一键复制配置三要素 + 单独复制密钥 + 更多操作) */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {/* 一键复制配置 (三要素：域名+密钥+模型) 增强下拉组合 */}
        <div className="relative flex-1 row:flex-none" ref={copyMenuRef}>
          <div className="inline-flex rounded-lg shadow-sm">
            <button
              type="button"
              onClick={(e) => handleCopyConfig('text', e)}
              className="h-9 px-3 rounded-l-lg bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.985]"
              title={t.tokens.copyConfig}
            >
              {copiedConfig ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedConfig ? t.tokens.copiedKey : t.tokens.copyConfig}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCopyMenu(!showCopyMenu);
              }}
              className="h-9 px-1.5 rounded-r-lg bg-brand-800 hover:bg-brand-900 text-white border-l border-brand-600 transition-colors flex items-center justify-center active:scale-[0.985]"
              aria-label="选择复制格式"
              aria-expanded={showCopyMenu}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 复制格式下拉菜单 */}
          {showCopyMenu && (
            <div className="absolute right-0 mt-1 w-56 rounded-xl surface-pop p-1.5 z-30 text-xs shadow-pop animate-fadeIn">
              <div className="px-2 py-1 text-[11px] font-semibold text-muted border-b border-line mb-1">
                三要素一键导出 (域名 + 密钥 + 模型)
              </div>
              <button
                type="button"
                onClick={(e) => handleCopyConfig('text', e)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-inset text-ink font-medium flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-brand-600" />
                <span>{t.tokens.copyConfigText}</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleCopyConfig('json', e)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-inset text-ink font-medium flex items-center gap-2"
              >
                <FileCode className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.tokens.copyConfigJson}</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleCopyConfig('env', e)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-inset text-ink font-medium flex items-center gap-2"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.tokens.copyConfigEnv}</span>
              </button>
              <div className="my-1 border-t border-line" />
              <button
                type="button"
                onClick={handleCopyKey}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-inset text-ink font-medium flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5 text-muted" />
                <span>{t.tokens.copyKeyOnly}</span>
              </button>
            </div>
          )}
        </div>

        {/* 仅复制密钥按钮 (保留完全相同的角色和名称，确保 E2E 测试和单密钥复制畅通) */}
        <button
          type="button"
          onClick={handleCopyKey}
          className="h-9 px-3 rounded-lg bg-inset hover:bg-line-strong text-ink font-medium text-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.985] border border-line"
          title={t.tokens.copyKey}
        >
          {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
          <span>{copiedKey ? t.tokens.copiedKey : t.tokens.copyKey}</span>
        </button>

        {/* 外部控制台、编辑与更多菜单 */}
        <div className="absolute top-3 right-3 row:static flex items-center">
          {token.consoleUrl && (
            <a
              href={safeHttpUrl(token.consoleUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition-colors"
              title="Console"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={() => onEdit(token)}
            className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition-colors"
            title={t.common.edit}
            aria-label={t.common.edit}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition-colors"
              title={t.tokens.moreActions}
              aria-label={t.tokens.moreActions}
              aria-expanded={showMenu}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-36 rounded-xl surface-pop p-1.5 z-20 text-xs shadow-pop animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    onEdit(token);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-inset text-ink font-medium flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5 text-muted" />
                  <span>{t.tokens.editToken}</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(t.tokens.deleteConfirm)) {
                      onDelete(token.id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-700 font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.tokens.deleteToken}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
