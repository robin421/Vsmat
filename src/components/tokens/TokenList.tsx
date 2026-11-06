import React, { useMemo } from 'react';
import { Plus, Key } from 'lucide-react';
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
      {/* Top action toolbar (Minimalist, clean) */}
      <div className="flex items-center justify-between pb-1">
        <div className="text-xs text-slate-500 font-medium">
          共收录 {tokens.length} 个 API 密钥凭证 · 本地 AES-256 强加密保护
        </div>

        <button
          onClick={onAddNew}
          className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          收藏新密钥
        </button>
      </div>

      {/* Grid of Tokens */}
      {filteredTokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-white shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-subtle">
            <Key className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            {searchTerm ? '没有找到匹配的 Token 密钥' : '暂无收藏的 Token 密钥'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            添加您的 OpenAI、Claude、DeepSeek 或云服务 API Key，享受纯本地强加密保护。
          </p>
          <button
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition inline-flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            现在添加密钥
          </button>
        </div>
      )}
    </div>
  );
};
