import React from 'react';
import { PieChart, TrendingUp, DollarSign, Layers } from 'lucide-react';
import { SubscriptionItem, ServiceCategory } from '../../types';

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
  const categoryNames: Record<ServiceCategory, { label: string; color: string; bg: string }> = {
    ai: { label: 'AI 大模型与服务', color: 'bg-emerald-500', bg: 'text-emerald-700' },
    developer: { label: '开发者工具与平台', color: 'bg-blue-500', bg: 'text-blue-700' },
    server: { label: '服务器 / VPS / 域名', color: 'bg-indigo-500', bg: 'text-indigo-700' },
    productivity: { label: '生产力办公工具', color: 'bg-amber-500', bg: 'text-amber-700' },
    entertainment: { label: '流媒体影音娱乐', color: 'bg-rose-500', bg: 'text-rose-700' },
    other: { label: '其他杂项', color: 'bg-slate-400', bg: 'text-slate-700' },
  };

  const getMonthlyAmountInUSD = (sub: SubscriptionItem): number => {
    let p = sub.price;
    if (sub.currency === 'CNY') p = p / usdToCnyRate;
    else if (sub.currency === 'EUR') p = p * 1.08;
    else if (sub.currency === 'HKD') p = p / 7.8;
    else if (sub.currency === 'JPY') p = p / 155;

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
    <div className="space-y-4">
      {/* Category breakdown card */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-subtle">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">按业务类别支出分布</h3>
              <p className="text-xs text-slate-500">各模块均摊月度支出占比与汇总</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">总月均支出</div>
            <div className="text-base font-bold font-mono text-slate-900">
              {symbol} {grandTotal.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex mb-4">
          {(Object.keys(totalsByCategory) as ServiceCategory[]).map(cat => {
            const amount = totalsByCategory[cat];
            const pct = grandTotalUSD > 0 ? (amount / grandTotalUSD) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={cat}
                style={{ width: `${pct}%` }}
                className={`${categoryNames[cat].color} transition-all`}
                title={`${categoryNames[cat].label}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Breakdown table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(totalsByCategory) as ServiceCategory[]).map(cat => {
            const amountUSD = totalsByCategory[cat];
            const amount = preferredCurrency === 'CNY' ? amountUSD * usdToCnyRate : amountUSD;
            const pct = grandTotalUSD > 0 ? (amountUSD / grandTotalUSD) * 100 : 0;

            return (
              <div key={cat} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${categoryNames[cat].color}`} />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">{categoryNames[cat].label}</div>
                    <div className="text-[11px] text-slate-400">{pct.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-slate-900">
                    {symbol} {amount.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-400">/月</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
