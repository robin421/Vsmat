import React from 'react';
import { PieChart } from 'lucide-react';
import { SubscriptionItem, ServiceCategory } from '../../types';
import { convertToUSD } from '../../lib/currencies';

interface SpendAnalyticsProps {
  subscriptions: SubscriptionItem[];
  preferredCurrency: 'CNY' | 'USD';
  usdToCnyRate: number;
}

export const SpendAnalytics: React.FC<SpendAnalyticsProps> = ({
  subscriptions,
  preferredCurrency,
  usdToCnyRate,
}) => {
  // Executive Business Palette: Obsidian Black primary + Babu Teal + warm neutrals
  const categoryNames: Record<ServiceCategory, { label: string; color: string; dot: string }> = {
    // Categorical hues are kept clear of the status colours (green/amber/red) reserved for meaning.
    ai: { label: 'AI 大模型与服务', color: 'bg-brand-700', dot: 'bg-brand-700' },
    developer: { label: '开发者工具与平台', color: 'bg-[#16A3B8]', dot: 'bg-[#16A3B8]' },
    server: { label: '服务器 / VPS / 域名', color: 'bg-[#8E93A6]', dot: 'bg-[#8E93A6]' },
    productivity: { label: '生产力办公工具', color: 'bg-[#8A5CF0]', dot: 'bg-[#8A5CF0]' },
    entertainment: { label: '流媒体影音娱乐', color: 'bg-[#EC6FA8]', dot: 'bg-[#EC6FA8]' },
    other: { label: '其他杂项', color: 'bg-[#D3D6E2]', dot: 'bg-[#D3D6E2]' },
  };

  const getMonthlyAmountInUSD = (sub: SubscriptionItem): number => {
    const p = convertToUSD(sub.price, sub.currency, usdToCnyRate);

    switch (sub.cycle) {
      case 'monthly': return p;
      case 'quarterly': return p / 3;
      case 'semi-annually': return p / 6;
      case 'annually': return p / 12;
      case 'prepaid': return p / 3;
      default: return p;
    }
  };

  const totalsByCategory: Record<ServiceCategory, number> = {
    ai: 0,
    developer: 0,
    server: 0,
    productivity: 0,
    entertainment: 0,
    other: 0,
  };

  let grandTotalUSD = 0;
  for (const sub of subscriptions) {
    const m = getMonthlyAmountInUSD(sub);
    totalsByCategory[sub.category] = (totalsByCategory[sub.category] || 0) + m;
    grandTotalUSD += m;
  }

  const grandTotal = preferredCurrency === 'CNY' ? grandTotalUSD * usdToCnyRate : grandTotalUSD;
  const symbol = preferredCurrency === 'CNY' ? '¥' : '$';

  return (
    <div className="space-y-6">
      {/* Category breakdown card */}
      <div className="p-5 sm:p-6 rounded-3xl surface-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-ink tracking-tight whitespace-nowrap">按业务类别支出分布</h3>
              <p className="text-sm text-muted mt-0.5">各模块均摊月度支出占比与财务汇总</p>
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-sm text-muted whitespace-nowrap">总月均支出</div>
            <div className="text-2xl font-bold text-ink tracking-tight whitespace-nowrap">
              {symbol} {grandTotal.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-2.5 rounded-full bg-inset overflow-hidden flex gap-0.5 mb-6">
          {(Object.keys(totalsByCategory) as ServiceCategory[]).map(cat => {
            const amount = totalsByCategory[cat];
            const pct = grandTotalUSD > 0 ? (amount / grandTotalUSD) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={cat}
                style={{ width: `${pct}%` }}
                className={`${categoryNames[cat].color} rounded-full transition-all`}
                title={`${categoryNames[cat].label}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Breakdown grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {(Object.keys(totalsByCategory) as ServiceCategory[]).map(cat => {
            const amountUSD = totalsByCategory[cat];
            const amount = preferredCurrency === 'CNY' ? amountUSD * usdToCnyRate : amountUSD;
            const pct = grandTotalUSD > 0 ? (amountUSD / grandTotalUSD) * 100 : 0;

            return (
              <div
                key={cat}
                className="py-3 border-b border-line flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${categoryNames[cat].dot}`} />
                  <div>
                    <div className="text-sm font-medium text-ink whitespace-nowrap">{categoryNames[cat].label}</div>
                    <div className="text-xs text-muted">{pct.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="flex items-baseline gap-0.5 whitespace-nowrap">
                  <div className="text-sm font-semibold text-ink">
                    {symbol} {amount.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted font-sans">/月</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
