import React, { useMemo } from 'react';
import { Plus, Key, ShieldCheck } from 'lucide-react';
import { TokenItem } from '../../types';
import { TokenCard } from './TokenCard';

interface TokenListProps {
  tokens: TokenItem[];
  onAddNew: () => void;
  onEdit: (token: TokenItem) => void;
  onDelete: (id: string) => void;
  searchTerm?: string;
}

export const TokenList: React.FC<TokenListProps> = ({
  tokens,
  onAddNew,
  onEdit,
  onDelete,
  searchTerm = '',
}) => {
  const filteredTokens = useMemo(() => {
    return tokens.filter(t => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        t.name.toLowerCase().includes(term) ||
        (t.accountEmail && t.accountEmail.toLowerCase().includes(term)) ||
        (t.serviceKey && t.serviceKey.toLowerCase().includes(term))
      );
    });
  }, [tokens, searchTerm]);

  return (
    <div className="space-y-5">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5 text-xs text-[#717171] font-medium">
          <ShieldCheck className="w-4 h-4 text-[#FF385C]" />
          <span>共收录 <strong className="text-[#222222] font-mono">{tokens.length}</strong> 个 API 密钥凭证 · 硬件级 AES-256 本地加密</span>
        </div>

        <button
          onClick={onAddNew}
          className="h-10 px-5 rounded-full btn-rausch font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>收藏新密钥</span>
        </button>
      </div>

      {/* Grid of Tokens */}
      {filteredTokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTokens.map(token => (
            <TokenCard
              key={token.id}
              token={token}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-[#DDDDDD] bg-white airbnb-card">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF0F2] text-[#FF385C] border border-[#FFCCD3] flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
            <Key className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#222222] mb-1">
            {searchTerm ? '未找到匹配的 API Token' : '暂无 API 密钥'}
          </h4>
          <p className="text-xs text-[#717171] max-w-sm mx-auto mb-5">
            集中管理 OpenAI、Claude、DeepSeek、GitHub 等服务的开发调用密钥与 Endpoint。
          </p>
          <button
            onClick={onAddNew}
            className="px-5 py-2.5 rounded-full btn-rausch font-bold text-xs transition inline-flex items-center gap-1.5 shadow-md active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>收藏第一个密钥</span>
          </button>
        </div>
      )}
    </div>
  );
};
