import React, { useState, useMemo } from 'react';
import { Plus, Sparkles, Filter, CreditCard } from 'lucide-react';
import { SubscriptionItem, ServiceCategory } from '../../types';
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

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter(sub => {
        const matchesSearch =
          !searchTerm ||
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sub.accountEmail && sub.accountEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (sub.paymentMethod && sub.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCat = selectedCategory === 'all' || sub.category === selectedCategory;

        if (filterUrgentOnly) {
          const days = getDaysUntil(sub.nextBillingDate);
          return matchesSearch && matchesCat && days <= 7;
        }

        return matchesSearch && matchesCat;
      })
      .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
  }, [subscriptions, searchTerm, selectedCategory, filterUrgentOnly]);

  return (
    <div className="space-y-4">
      {/* Clean, Minimalist Toolbar (No messy tags, no duplicate search bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        {/* Compact Category Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                selectedCategory === 'all'
                  ? 'bg-white text-blue-600 shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 ({subscriptions.length})
            </button>
            <button
              onClick={() => setSelectedCategory('ai')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                selectedCategory === 'ai'
                  ? 'bg-white text-blue-600 shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI 订阅
            </button>
            <button
              onClick={() => setSelectedCategory('developer')}
              className={`px-3 py-1.5 rounded-lg transition font-medium ${
                selectedCategory === 'developer'
                  ? 'bg-white text-blue-600 shadow-subtle'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              开发与工具
            </button>
          </div>

          <button
            onClick={() => setFilterUrgentOnly(!filterUrgentOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              filterUrgentOnly
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 shadow-subtle'
            }`}
          >
            仅看待续费
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSmartParser}
            className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/20 active:scale-95"
            title="整段粘贴文本自动录入"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>智能粘贴录入</span>
          </button>

          <button
            onClick={onAddNew}
            className="h-9 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition flex items-center justify-center gap-1 shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建订阅</span>
          </button>
        </div>
      </div>

      {/* Grid of Subscriptions (Spacious cards with min-width) */}
      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-white shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-subtle">
            <CreditCard className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            {searchTerm || filterUrgentOnly ? '没有符合条件的订阅' : '暂无订阅记录'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            点击“智能粘贴录入”，整段粘贴商家发货或邮件文本，一秒自动识别归集。
          </p>
          <button
            onClick={onOpenSmartParser}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition inline-flex items-center gap-1.5 shadow-sm shadow-blue-600/30"
          >
            <Sparkles className="w-4 h-4" />
            智能文本粘贴录入
          </button>
        </div>
      )}
    </div>
  );
};
