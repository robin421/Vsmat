import React, { useMemo } from 'react';
import { Plus, Key, ShieldCheck, Search } from 'lucide-react';
import { TokenItem } from '../../types';
import { TokenCard } from './TokenCard';
import { useI18n } from '../../i18n';

interface TokenListProps {
  tokens: TokenItem[];
  onAddNew: () => void;
  onEdit: (token: TokenItem) => void;
  onDelete: (id: string) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

export const TokenList: React.FC<TokenListProps> = ({
  tokens,
  onAddNew,
  onEdit,
  onDelete,
  searchTerm = '',
  onSearchChange,
}) => {
  const { t, format } = useI18n();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm text-muted">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{format(t.tokens.headerTotal, { count: tokens.length })}</span>
        </div>

        <button
          onClick={onAddNew}
          className="h-10 px-4 rounded-xl btn-primary font-semibold text-sm flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>{t.tokens.addNew}</span>
        </button>
      </div>

      {/* The global search lives in the header from tablet width up */}
      {onSearchChange && (
        <div className="field md:hidden flex items-center h-10 rounded-xl px-3 gap-2">
          <Search className="w-4 h-4 text-muted shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.tokens.searchPlaceholder}
            aria-label={t.tokens.searchPlaceholder}
            className="w-full min-w-0 text-sm text-ink placeholder:text-muted outline-none bg-transparent"
          />
        </div>
      )}

      {/* Grid of Tokens */}
      {filteredTokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 row:block row:bg-white row:rounded-2xl row:shadow-card row:divide-y row:divide-line">
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
        <div className="text-center py-16 px-4 rounded-2xl surface-card">
          <div className="w-12 h-12 rounded-lg bg-brand-700 text-white flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-ink mb-1">
            {searchTerm ? t.tokens.emptyTitleFiltered : t.tokens.emptyTitle}
          </h4>
          <p className="text-sm text-muted max-w-sm mx-auto mb-5">
            {t.tokens.emptyDesc}
          </p>
          <button
            onClick={onAddNew}
            className="h-10 px-5 rounded-lg btn-primary font-semibold text-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t.tokens.emptyCta}</span>
          </button>
        </div>
      )}
    </div>
  );
};
