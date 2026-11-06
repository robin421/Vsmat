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
      className="group relative rounded-2xl p-5 flex flex-col justify-between surface-card cursor-pointer"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <BrandBadge serviceKey={token.serviceKey} name={token.name} size="md" />
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-black tracking-tight truncate leading-snug">
                {token.name}
              </h3>
              <p className="text-xs text-muted font-mono mt-1 break-all select-all" title={token.accountEmail || preset.name}>
                {token.accountEmail || preset.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {token.consoleUrl && (
              <a
                href={safeHttpUrl(token.consoleUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg text-muted hover:text-black hover:bg-inset flex items-center justify-center transition-colors"
                title="打开官方控制台"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={() => onEdit(token)}
              className="w-8 h-8 rounded-lg text-muted hover:text-black hover:bg-inset flex items-center justify-center transition-colors"
              title="编辑密钥"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Overflow Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-lg text-muted hover:text-black hover:bg-inset flex items-center justify-center transition-colors"
                title="更多操作"
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

        {/* Token Key Value Strip (Airbnb Vault Style) */}
        <div className="rounded-xl border border-line px-3.5 py-3 mb-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span className="font-medium">API Token 密钥</span>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-muted hover:text-black transition-colors flex items-center gap-1 text-xs"
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showKey ? '隐藏' : '显示'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[13px] text-ink font-medium truncate select-all">
              {showKey ? token.token : maskedToken}
            </span>
          </div>
        </div>

        {/* Base URL (if present) */}
        {token.baseUrl && (
          <div className="text-xs text-muted font-mono truncate flex items-center gap-2 mb-4 px-0.5">
            <Globe className="w-3.5 h-3.5 text-muted shrink-0" />
            <span className="truncate">{token.baseUrl}</span>
          </div>
        )}
      </div>

      {/* Copy Action & Balance Footer */}
      <div className="pt-1 flex items-center justify-between gap-3" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs text-ink-soft font-mono truncate">
          {token.balance || '状态正常'}
        </span>
        <button
          type="button"
          onClick={handleCopyKey}
          className="h-10 px-4 rounded-lg btn-primary font-semibold text-sm flex items-center gap-1.5 shrink-0"
        >
          {copiedKey ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedKey ? '已复制' : '复制密钥'}</span>
        </button>
      </div>
    </div>
  );
};
