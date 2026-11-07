import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, ExternalLink, Edit2, Trash2, Globe, MoreHorizontal } from 'lucide-react';
import { TokenItem } from '../../types';
import { getPresetByKey } from '../../types/presets';
import { BrandBadge } from '../common/BrandBadge';
import { safeHttpUrl } from '../../lib/url';

interface TokenCardProps {
  token: TokenItem;
  onEdit: (token: TokenItem) => void;
  onDelete: (id: string) => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token, onEdit, onDelete }) => {
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const preset = getPresetByKey(token.serviceKey);

  const handleCopyKey = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(token.token);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {}
  };

  const maskedToken = token.token.length > 12
    ? `${token.token.slice(0, 7)}••••••••••••••••${token.token.slice(-4)}`
    : '••••••••••••••••';

  return (
    <div
      onClick={() => onEdit(token)}
      className="group relative cursor-pointer bg-white rounded-2xl shadow-card p-4 flex flex-col gap-3 row:grid row:grid-cols-[minmax(0,1.15fr)_minmax(0,1.3fr)_minmax(0,1fr)_auto] row:items-center row:gap-5 row:px-5 row:py-4 row:bg-transparent row:shadow-none row:rounded-none row:first:rounded-t-2xl row:last:rounded-b-2xl row:hover:bg-canvas/70 transition-colors"
    >
      {/* Identity */}
      <div className="flex items-center gap-3 min-w-0 pr-24 row:pr-0">
        <BrandBadge serviceKey={token.serviceKey} name={token.name} size="md" />
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-ink tracking-tight truncate leading-snug" title={token.name}>
            {token.name}
          </h3>
          <p className="text-xs text-muted mt-1 break-all select-all" title={token.accountEmail || preset.name}>
            {token.accountEmail || preset.name}
          </p>
        </div>
      </div>

      {/* Key */}
      <div className="min-w-0 rounded-xl bg-inset px-3 py-2 row:bg-transparent row:p-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 text-xs text-muted mb-1">
          <span className="font-medium whitespace-nowrap">API Token 密钥</span>
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="hover:text-ink transition-colors flex items-center gap-1 whitespace-nowrap"
          >
            {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showKey ? '隐藏' : '显示'}</span>
          </button>
        </div>
        <div className="font-mono text-[13px] text-ink truncate select-all">
          {showKey ? token.token : maskedToken}
        </div>
      </div>

      {/* Endpoint and balance */}
      <div className="min-w-0 text-[13px] flex items-center justify-between gap-3 row:block">
        {token.baseUrl && (
          <div className="text-muted truncate flex items-center gap-1.5 min-w-0">
            <Globe className="w-3.5 h-3.5 text-subtle shrink-0" />
            <span className="truncate">{token.baseUrl}</span>
          </div>
        )}
        <div className="font-semibold text-ink truncate row:mt-1 shrink-0 row:shrink">
          {token.balance || '状态正常'}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={handleCopyKey}
          className="flex-1 row:flex-none h-9 px-3 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-[13px] transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-[0.985]"
        >
          {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedKey ? '已复制' : '复制密钥'}</span>
        </button>

        <div className="absolute top-3 right-3 row:static flex items-center">
          {token.consoleUrl && (
            <a
              href={safeHttpUrl(token.consoleUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition-colors"
              title="打开官方控制台"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            type="button"
            onClick={() => onEdit(token)}
            className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition-colors"
            title="编辑密钥"
            aria-label="编辑密钥"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition-colors"
              title="更多操作"
              aria-label="更多操作"
              aria-expanded={showMenu}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-40 rounded-xl surface-pop p-1.5 z-20 text-sm animate-fadeIn"
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
                  <span>编辑密钥</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`确定要删除密钥「${token.name}」吗？`)) {
                      onDelete(token.id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-700 font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>删除密钥</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
