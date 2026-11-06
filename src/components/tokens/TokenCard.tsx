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
      className="group relative rounded-3xl bg-white p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 airbnb-card border border-[#EBEBEB] hover:border-[#DDDDDD] cursor-pointer"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <BrandBadge serviceKey={token.serviceKey} name={token.name} size="md" />
            <div className="min-w-0">
              <h3 className="text-base font-bold text-[#222222] tracking-tight truncate leading-snug">
                {token.name}
              </h3>
              <p className="text-xs text-[#717171] font-mono truncate mt-0.5 max-w-[190px]">
                {token.accountEmail || preset.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {token.consoleUrl && (
              <a
                href={token.consoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] flex items-center justify-center transition"
                title="打开官方控制台"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            <button
              type="button"
              onClick={() => onEdit(token)}
              className="w-8 h-8 rounded-full text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] flex items-center justify-center transition"
              title="编辑密钥"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Overflow Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] flex items-center justify-center transition"
                title="更多操作"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-36 rounded-2xl bg-white border border-[#EBEBEB] p-2 airbnb-card z-20 text-xs animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      onEdit(token);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F7F7F7] text-[#222222] font-medium flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#717171]" />
                    <span>编辑密钥</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`确定要删除密钥「${token.name}」吗？`)) {
                        onDelete(token.id);
                      }
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FFF0F2] text-[#c13515] font-medium flex items-center gap-2"
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
        <div className="bg-[#F7F7F7] border border-[#EBEBEB] rounded-2xl p-3.5 mb-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between text-[11px] text-[#717171] mb-1.5 font-medium">
            <span className="tracking-wide uppercase text-[10px] font-bold">API Token 密钥</span>
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-[#717171] hover:text-[#222222] transition flex items-center gap-1 text-[11px]"
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showKey ? '隐藏' : '显示'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-[#222222] font-bold truncate select-all tracking-tight">
              {showKey ? token.token : maskedToken}
            </span>
          </div>
        </div>

        {/* Base URL (if present) */}
        {token.baseUrl && (
          <div className="text-xs text-[#717171] font-mono truncate flex items-center gap-1.5 mb-2 px-1">
            <Globe className="w-3.5 h-3.5 text-[#717171] shrink-0" />
            <span className="truncate">{token.baseUrl}</span>
          </div>
        )}
      </div>

      {/* Copy Action & Balance Footer */}
      <div className="pt-3 border-t border-[#EBEBEB] flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <span className="text-xs text-[#717171] font-mono truncate max-w-[150px] font-medium">
          {token.balance || '状态正常'}
        </span>
        <button
          type="button"
          onClick={handleCopyKey}
          className="h-10 px-4 rounded-xl btn-rausch text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
        >
          {copiedKey ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedKey ? '已复制' : '复制密钥'}</span>
        </button>
      </div>
    </div>
  );
};
