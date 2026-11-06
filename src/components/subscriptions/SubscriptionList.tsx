import React, { useState, useMemo } from 'react';
import { Plus, Sparkles, CreditCard, Search, ArrowUpDown, X } from 'lucide-react';
import { SubscriptionItem } from '../../types';
import { SubscriptionCard } from './SubscriptionCard';
import { getDaysUntil } from '../../lib/notifications';

interface SubscriptionListProps {
  subscriptions: SubscriptionItem[];
  onAddNew: () => void;
  onOpenSmartParser: () => void;
  onEdit: (sub: SubscriptionItem) => void;
  onDelete: (id: string) => void;
  onMarkRenewed: (id: string) => void;
  onQuickRecharge: (serviceKey: string, sub?: SubscriptionItem) => void;
  searchTerm?: string;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onAddNew,
  onOpenSmartParser,
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
    <div className="space-y-4">
      {/* Refined Monochrome Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-1">
        {/* Left: Category Switcher & Urgent Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Switcher Pill */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200/80 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition font-medium select-none ${
                selectedCategory === 'all'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              全部 ({subscriptions.length})
            </button>
            <button
              onClick={() => setSelectedCategory('ai')}
              className={`px-3 py-1.5 rounded-lg transition font-medium select-none ${
                selectedCategory === 'ai'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              AI 智能
            </button>
            <button
              onClick={() => setSelectedCategory('developer')}
              className={`px-3 py-1.5 rounded-lg transition font-medium select-none ${
                selectedCategory === 'developer'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              开发与工具
            </button>
            <button
              onClick={() => setSelectedCategory('server')}
              className={`px-3 py-1.5 rounded-lg transition font-medium select-none ${
                selectedCategory === 'server'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              服务器
            </button>
          </div>

          {/* Urgent Filter Toggle */}
          <button
            onClick={() => setFilterUrgentOnly(!filterUrgentOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition active:scale-[0.98] ${
              filterUrgentOnly
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                : 'bg-white text-zinc-700 hover:text-zinc-900 border-zinc-200/90 shadow-2xs'
            }`}
          >
            仅待续费 (≤7天)
          </button>
        </div>

        {/* Right: Search + Action Buttons (增 & 查) */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Quick Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="搜索订阅名称或账号..."
              className="w-full h-9 pl-8 pr-7 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 shadow-2xs transition"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Smart Paste (Secondary Tool) */}
          <button
            onClick={onOpenSmartParser}
            className="h-9 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-xs border border-zinc-200/80 transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] shrink-0"
            title="一键粘贴发货单或截图自动解析录入"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
            <span className="hidden sm:inline">智能解析</span>
          </button>

          {/* Add New Subscription (Primary Action - 增) */}
          <button
            onClick={onAddNew}
            className="h-9 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] shrink-0"
            title="手动新建周期订阅"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-300" />
            <span>新建订阅</span>
          </button>
        </div>
      </div>

      {/* Grid of Subscriptions */}
      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
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
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-200 bg-white shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200/80 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <CreditCard className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 mb-1">
            {effectiveSearch || filterUrgentOnly ? '没有符合条件的订阅记录' : '暂无订阅记录'}
          </h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
            点击下方“新建订阅”录入你的第一个周期服务，或使用“智能解析”批量导入。
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onAddNew}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-medium text-xs transition inline-flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新建订阅</span>
            </button>
            <button
              onClick={onOpenSmartParser}
              className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-xs border border-zinc-200/80 transition inline-flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
              <span>智能识别录入</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
