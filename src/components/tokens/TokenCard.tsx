import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, ExternalLink, Edit2, Trash2, Globe, MoreHorizontal } from 'lucide-react';
import { TokenItem } from '../../types';
import { getPresetByKey } from '../../types/presets';
import { BrandBadge } from '../common/BrandBadge';

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

  const handleCopyKey = async () => {
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
    <div className="group relative rounded-2xl bg-white p-5 flex flex-col justify-between transition-all duration-200 card-ambient border border-black/[0.06] hover:border-black/[0.12]">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <BrandBadge serviceKey={token.serviceKey} name={token.name} size="md" />
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 tracking-tight truncate leading-snug">
                {token.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono truncate mt-0.5 max-w-[190px]">
                {token.accountEmail || preset.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {token.consoleUrl && (
              <a
                href={token.consoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                title="打开官方控制台"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Overflow Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-32 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/[0.08] p-1.5 shadow-xl z-20 text-xs animate-fadeIn">
                  <button
                    onClick={() => {
                      onEdit(token);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>编辑密钥</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(token.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除密钥</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Token Key Value Strip (Vault Style) */}
        <div className="bg-slate-50/90 border border-black/[0.04] rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
            <span className="tracking-wide uppercase text-[10px]">API Token 密钥</span>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-slate-500 hover:text-slate-800 transition flex items-center gap-1 text-[11px]"
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showKey ? '隐藏' : '显示'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-slate-800 font-semibold truncate select-all tracking-tight">
              {showKey ? token.token : maskedToken}
            </span>
          </div>
        </div>

        {/* Base URL (if present) */}
        {token.baseUrl && (
          <div className="text-xs text-slate-500 font-mono truncate flex items-center gap-1.5 mb-2">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{token.baseUrl}</span>
          </div>
        )}
      </div>

      {/* Copy Action & Balance Footer */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-mono truncate max-w-[150px] font-medium">
          {token.balance || '正常可用'}
        </span>
        <button
          type="button"
          onClick={handleCopyKey}
          className="h-9 px-3.5 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 font-semibold text-xs transition flex items-center gap-1.5 border border-blue-200/70 shadow-2xs active:scale-[0.98]"
        >
          {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedKey ? '已复制' : '复制密钥'}</span>
        </button>
      </div>
    </div>
  );
};
