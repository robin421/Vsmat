import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, ExternalLink, Edit2, Trash2, Globe, Mail, MoreHorizontal } from 'lucide-react';
import { TokenItem } from '../../types';
import { getPresetByKey } from '../../types/presets';

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
    <div className="relative rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition p-5 flex flex-col justify-between shadow-subtle hover:shadow-elevated">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border bg-slate-100 text-slate-800 border-slate-200 shadow-subtle shrink-0">
              {token.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {token.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono truncate mt-0.5">
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
                <div className="absolute right-0 mt-1 w-32 rounded-xl bg-white border border-slate-200 p-1 shadow-xl z-20 text-xs">
                  <button
                    onClick={() => {
                      onEdit(token);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>编辑密钥</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(token.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除密钥</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Token Key Value Strip */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-medium">
            <span>API Token 密钥:</span>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showKey ? '隐藏' : '显示'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-slate-800 font-semibold truncate select-all">
              {showKey ? token.token : maskedToken}
            </span>
          </div>
        </div>

        {/* Base URL (if present) */}
        {token.baseUrl && (
          <div className="text-xs text-slate-500 font-mono truncate flex items-center gap-1.5 mb-2">
            <Globe className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{token.baseUrl}</span>
          </div>
        )}
      </div>

      {/* Copy Action Button */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-mono truncate max-w-[150px]">
          {token.balance || '正常可用'}
        </span>
        <button
          type="button"
          onClick={handleCopyKey}
          className="h-9 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition flex items-center gap-1.5 border border-blue-200/70 shadow-subtle active:scale-95"
        >
          {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedKey ? '已复制' : '复制密钥'}</span>
        </button>
      </div>
    </div>
  );
};
