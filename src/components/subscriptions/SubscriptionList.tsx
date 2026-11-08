import React, { useState, useMemo } from 'react';
import { Plus, CreditCard, Search, X, ArrowLeftRight, Globe, ExternalLink, Zap } from 'lucide-react';
import { SubscriptionItem } from '../../types';
import { SubscriptionCard } from './SubscriptionCard';
import { getDaysUntil } from '../../lib/notifications';
import { monthlyAmountUSD } from '../../lib/currencies';
import { useI18n } from '../../i18n';
import { isLegacyDomain, requestMigrationFromOldDomain } from '../../lib/migration';
import { AISUBDEAL_BENCHMARKS, buildAiSubDealUrl, getServicePricingUrl } from '../../lib/aisubdeal';
import { trackSubdealOutboundClick } from '../../lib/analytics';

interface SubscriptionListProps {
  subscriptions: SubscriptionItem[];
  isLocked?: boolean;
  onAddNew: () => void;
  onEdit: (sub: SubscriptionItem) => void;
  onDelete: (id: string) => void;
  onMarkRenewed: (id: string) => boolean;
  onQuickRecharge: (serviceKey: string, sub?: SubscriptionItem) => void;
  onQuickImportDeal?: (serviceKey: string) => void;
  searchTerm?: string;
  usdToCnyRate?: number;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  isLocked = false,
  onAddNew,
  onEdit,
  onDelete,
  onMarkRenewed,
  onQuickRecharge,
  onQuickImportDeal,
  searchTerm = '',
  usdToCnyRate,
}) => {
  const { t, language } = useI18n();
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
            aria-label={t.subscriptions.sortAriaLabel}
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

          {/* AISubDeal Price Ranking Link */}
          <a
            href={buildAiSubDealUrl('/pricing/', language, { utm_medium: 'sub_toolbar' })}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackSubdealOutboundClick('sub_toolbar')}
            className="h-10 px-3 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 transition-colors font-semibold text-xs inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            title={t.aisubdeal.toolbarCompareBtn}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.aisubdeal.toolbarCompareBtn}</span>
            <ExternalLink className="w-3 h-3 text-brand-600" />
          </a>
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
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onAddNew}
              className="h-10 px-5 rounded-lg btn-primary font-semibold text-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{t.subscriptions.emptyCta}</span>
            </button>
            {!isLegacyDomain() && subscriptions.length === 0 && (
              <button
                type="button"
                onClick={() => requestMigrationFromOldDomain()}
                className="h-10 px-4 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-sm inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <ArrowLeftRight className="w-4 h-4 text-amber-700" />
                <span>{t.migration.migrateBtn}</span>
              </button>
            )}
          </div>

          {/* AISubDeal Floor Price Showcase for Empty Vault */}
          {!isLocked && !effectiveSearch && !filterUrgentOnly && subscriptions.length === 0 && (
            <div className="mt-8 pt-6 border-t border-line text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h5 className="text-sm font-bold text-ink flex items-center gap-1.5">
                    <span>{t.aisubdeal.emptyShowcaseTitle}</span>
                  </h5>
                  <p className="text-xs text-muted mt-0.5">
                    {t.aisubdeal.emptyShowcaseDesc}
                  </p>
                </div>
                <a
                  href={buildAiSubDealUrl('/pricing/', language, { utm_medium: 'empty_showcase_header' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSubdealOutboundClick('empty_showcase_header')}
                  className="text-xs font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1 self-start sm:self-auto shrink-0 transition-colors"
                >
                  <span>{t.aisubdeal.exploreAllDealsBtn}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(['openai', 'claude', 'gemini', 'perplexity'] as const).map((key) => {
                  const item = AISUBDEAL_BENCHMARKS[key];
                  if (!item) return null;
                  const nameMap: Record<string, string> = {
                    openai: 'ChatGPT Plus',
                    claude: 'Claude Pro',
                    gemini: 'Gemini Advanced',
                    perplexity: 'Perplexity Pro',
                  };
                  const displayName = nameMap[key] || item.productSlug;
                  const pricingUrl = getServicePricingUrl(item.productSlug, language, undefined, 'empty_card');

                  return (
                    <div
                      key={key}
                      className="p-3.5 rounded-xl bg-white border border-line hover:border-brand-300 transition-all shadow-sm flex flex-col justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm text-ink truncate">{displayName}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold whitespace-nowrap">
                            省 {item.cheapest.savePercent}%
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-ink-soft font-medium flex items-center gap-1">
                          <span>{item.cheapest.countryFlag}</span>
                          <span className="font-bold">{item.cheapest.currency} {item.cheapest.localPrice}</span>
                          <span className="text-muted text-[11px]">/月 (≈ ${item.cheapest.usdPrice})</span>
                        </div>
                        <div className="text-[11px] text-muted mt-0.5">
                          {item.cheapest.regionLabelZh || item.cheapest.regionLabelEn} · 原价 ${item.usPriceUSD}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-2 border-t border-line/60">
                        {onQuickImportDeal && (
                          <button
                            type="button"
                            onClick={() => onQuickImportDeal(key)}
                            className="flex-1 h-7 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold inline-flex items-center justify-center gap-1 transition-colors"
                            title={t.aisubdeal.quickImportAction}
                          >
                            <Zap className="w-3 h-3 text-brand-600" />
                            <span>{t.aisubdeal.quickImportAction}</span>
                          </button>
                        )}
                        <a
                          href={pricingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 px-2 rounded-lg bg-inset hover:bg-line text-muted hover:text-ink text-xs font-medium inline-flex items-center justify-center gap-1 transition-colors shrink-0"
                          title={t.aisubdeal.compareLink}
                        >
                          <span>{t.aisubdeal.compareLink}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
