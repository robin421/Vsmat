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
    <div className="space-y-4">
      {/* Top action toolbar */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-zinc-700" />
          <span>共收录 <strong className="text-zinc-900 font-mono">{tokens.length}</strong> 个 API 密钥凭证 · 硬件级 AES-256 本地加密</span>
        </div>

        <button
          onClick={onAddNew}
          className="h-9 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-300" />
          <span>收藏新密钥</span>
        </button>
      </div>

      {/* Grid of Tokens */}
      {filteredTokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
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
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-200 bg-white shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Key className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 mb-1">
            {searchTerm ? '未找到匹配的 API Token' : '暂无 API 密钥'}
          </h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
            集中管理 OpenAI、Claude、DeepSeek、GitHub 等服务的开发调用密钥。
          </p>
          <button
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-medium text-xs transition inline-flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>收藏第一个密钥</span>
          </button>
        </div>
      )}
    </div>
  );
};
