import React, { useState, useMemo } from 'react';
import { Plus, CreditCard, Search, X } from 'lucide-react';
import { SubscriptionItem } from '../../types';
import { SubscriptionCard } from './SubscriptionCard';
import { getDaysUntil } from '../../lib/notifications';
import { monthlyAmountUSD } from '../../lib/currencies';
import { useI18n } from '../../i18n';

interface SubscriptionListProps {
  subscriptions: SubscriptionItem[];
  onAddNew: () => void;
  onEdit: (sub: SubscriptionItem) => void;
  onDelete: (id: string) => void;
  onMarkRenewed: (id: string) => boolean;
  onQuickRecharge: (serviceKey: string, sub?: SubscriptionItem) => void;
  searchTerm?: string;
  usdToCnyRate?: number;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onAddNew,
  onEdit,
  onDelete,
  onMarkRenewed,
  onQuickRecharge,
  searchTerm = '',
  usdToCnyRate,
}) => {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');

  const effectiveSearch = localSearch.trim() || searchTerm.trim();

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter(sub => {
        const matchesSearch =
          !effectiveSearch ||
          sub.name.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
          (sub.accountEmail && sub.accountEmail.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
          (sub.paymentMethod && sub.paymentMethod.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
          (sub.notes && sub.notes.toLowerCase().includes(effectiveSearch.toLowerCase()));

        const matchesCat =
          selectedCategory === 'all' ||
          sub.category === selectedCategory ||
          (selectedCategory === 'other' && !['ai', 'developer', 'server'].includes(sub.category));

        if (filterUrgentOnly) {
          const days = getDaysUntil(sub.nextBillingDate);
          return matchesSearch && matchesCat && sub.cycle !== 'lifetime' && days <= 7;
        }

        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'price') {
          return monthlyAmountUSD(b, usdToCnyRate) - monthlyAmountUSD(a, usdToCnyRate);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        // Lifetime purchases have no due date, so they go last
        if ((a.cycle === 'lifetime') !== (b.cycle === 'lifetime')) return a.cycle === 'lifetime' ? 1 : -1;
        return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
      });
  }, [subscriptions, effectiveSearch, selectedCategory, filterUrgentOnly, sortBy, usdToCnyRate]);

  return (
    <div className="space-y-4">
      {/* Category Pills & Search Toolbar */}
      <div className="flex flex-col row:flex-row row:items-center justify-between gap-3.5 pb-1">
        {/* Left: Category Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-inset text-sm max-w-full overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 h-8 rounded-lg transition-colors font-medium select-none whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t.subscriptions.categoryAll} ({subscriptions.length})
            </button>
            <button
              onClick={() => setSelectedCategory('ai')}
              className={`px-3 h-8 rounded-lg transition-colors font-medium select-none whitespace-nowrap ${
                selectedCategory === 'ai'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t.subscriptions.categoryAi}
            </button>
            <button
              onClick={() => setSelectedCategory('developer')}
              className={`px-3 h-8 rounded-lg transition-colors font-medium select-none whitespace-nowrap ${
                selectedCategory === 'developer'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t.subscriptions.categoryDev}
            </button>
            <button
              onClick={() => setSelectedCategory('server')}
              className={`px-3 h-8 rounded-lg transition-colors font-medium select-none whitespace-nowrap ${
                selectedCategory === 'server'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t.subscriptions.categoryServer}
            </button>
          </div>

          {/* Urgent Filter Toggle */}
          <button
            onClick={() => setFilterUrgentOnly(!filterUrgentOnly)}
            className={`px-3.5 h-10 rounded-xl text-sm font-medium border transition-colors whitespace-nowrap active:scale-[0.985] ${
              filterUrgentOnly
                ? 'bg-brand-700 text-white border-brand-700'
                : 'bg-white text-ink-soft hover:bg-inset border-line'
            }`}
          >
            {t.subscriptions.filterUrgent}
          </button>
        </div>

        {/* Right: Search & Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <select
            aria-label="Sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="field h-10 rounded-xl px-2.5 text-sm text-ink-soft outline-none shrink-0"
          >
            <option value="date">{t.subscriptions.sortDue}</option>
            <option value="price">{t.subscriptions.sortPrice}</option>
            <option value="name">{t.subscriptions.sortName}</option>
          </select>

          {/* Quick Search Input */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={t.subscriptions.searchPlaceholder}
              className="field w-full h-10 pl-9 pr-8 rounded-xl text-sm text-ink placeholder:text-muted outline-none"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Add New Subscription */}
          <button
            onClick={onAddNew}
            className="h-10 px-4 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 transition-colors font-semibold text-sm flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
            title={t.common.newSubscription}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.common.newSubscription}</span>
          </button>
        </div>
      </div>

      {/* Grid of Subscriptions */}
      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 row:block row:bg-white row:rounded-2xl row:shadow-card row:divide-y row:divide-line">
          {filteredSubscriptions.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkRenewed={onMarkRenewed}
              onQuickRecharge={onQuickRecharge}
              usdToCnyRate={usdToCnyRate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl surface-card">
          <div className="w-12 h-12 rounded-lg bg-brand-700 text-white flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-ink mb-1">
            {effectiveSearch || filterUrgentOnly ? t.subscriptions.emptyTitleFiltered : t.subscriptions.emptyTitle}
          </h4>
          <p className="text-sm text-muted max-w-sm mx-auto mb-5">
            {t.subscriptions.emptyDesc}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onAddNew}
              className="h-10 px-5 rounded-lg btn-primary font-semibold text-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t.subscriptions.emptyCta}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
