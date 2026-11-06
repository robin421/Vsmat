import React, { useState, useMemo } from 'react';
import { Plus, Sparkles, CreditCard, Search, ArrowUpDown, X } from 'lucide-react';
import { SubscriptionItem } from '../../types';
import { SubscriptionCard } from './SubscriptionCard';
import { getDaysUntil } from '../../lib/notifications';

interface SubscriptionListProps {
  subscriptions: SubscriptionItem[];
  onAddNew: () => void;
  onEdit: (sub: SubscriptionItem) => void;
  onDelete: (id: string) => void;
  onMarkRenewed: (id: string) => void;
  onQuickRecharge: (serviceKey: string, sub?: SubscriptionItem) => void;
  searchTerm?: string;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onAddNew,
  onEdit,
  onDelete,
  onMarkRenewed,
  onQuickRecharge,
  searchTerm = '',
}) => {
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
          return matchesSearch && matchesCat && days <= 7;
        }

        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'price') {
          return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime();
      });
  }, [subscriptions, effectiveSearch, selectedCategory, filterUrgentOnly, sortBy]);

  return (
    <div className="space-y-5">
      {/* Airbnb Style Category Pills & Search Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-1">
        {/* Left: Category Switcher (Airbnb Experiences Bar) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-inset border border-line text-sm max-w-full overflow-x-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 h-8 rounded-md transition-colors font-medium select-none whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-white text-black font-semibold'
                  : 'text-muted hover:text-black'
              }`}
            >
              全部 ({subscriptions.length})
            </button>
            <button
              onClick={() => setSelectedCategory('ai')}
              className={`px-3.5 h-8 rounded-md transition-colors font-medium select-none whitespace-nowrap ${
                selectedCategory === 'ai'
                  ? 'bg-white text-black font-semibold'
                  : 'text-muted hover:text-black'
              }`}
            >
              AI 智能
            </button>
            <button
              onClick={() => setSelectedCategory('developer')}
              className={`px-3.5 h-8 rounded-md transition-colors font-medium select-none whitespace-nowrap ${
                selectedCategory === 'developer'
                  ? 'bg-white text-black font-semibold'
                  : 'text-muted hover:text-black'
              }`}
            >
              开发与工具
            </button>
            <button
              onClick={() => setSelectedCategory('server')}
              className={`px-3.5 h-8 rounded-md transition-colors font-medium select-none whitespace-nowrap ${
                selectedCategory === 'server'
                  ? 'bg-white text-black font-semibold'
                  : 'text-muted hover:text-black'
              }`}
            >
              服务器网络
            </button>
          </div>

          {/* Urgent Filter Toggle */}
          <button
            onClick={() => setFilterUrgentOnly(!filterUrgentOnly)}
            className={`px-3.5 h-9 rounded-lg text-sm font-medium border transition-colors active:scale-[0.985] ${
              filterUrgentOnly
                ? 'bg-black text-white border-black'
                : 'bg-white text-ink hover:bg-inset border-line-strong hover:border-ink'
            }`}
          >
            仅待续费 (≤7天)
          </button>
        </div>

        {/* Right: Search & Action Buttons (Executive Monochrome Style) */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Quick Search Input */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="搜索订阅名称或账号..."
              className="field w-full h-9 pl-9 pr-8 rounded-lg text-sm text-ink placeholder:text-muted outline-none"
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

          {/* Add New Subscription (Executive Primary CTA) */}
          <button
            onClick={onAddNew}
            className="h-9 px-4 rounded-lg btn-primary font-semibold text-sm flex items-center justify-center gap-1.5 shrink-0"
            title="新建订阅（支持截图智能识别与手动录入）"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span>新建订阅</span>
          </button>
        </div>
      </div>

      {/* Grid of Subscriptions */}
      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubscriptions.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onEdit={onEdit}
              onDelete={onDelete}
              onMarkRenewed={onMarkRenewed}
              onQuickRecharge={onQuickRecharge}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-line-strong bg-white">
          <div className="w-12 h-12 rounded-lg bg-black text-white flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-black mb-1">
            {effectiveSearch || filterUrgentOnly ? '没有符合条件的订阅记录' : '暂无订阅记录'}
          </h4>
          <p className="text-sm text-muted max-w-sm mx-auto mb-5">
            点击下方“新建订阅”录入你的第一个服务，支持账单截图智能识别或手动填表。
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onAddNew}
              className="h-10 px-5 rounded-lg btn-primary font-semibold text-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>新建订阅</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
