import React from 'react';
import { PieChart } from 'lucide-react';
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
  // Sophisticated monochrome / zinc scale
  const categoryNames: Record<ServiceCategory, { label: string; color: string; dot: string }> = {
    ai: { label: 'AI 大模型与服务', color: 'bg-zinc-900', dot: 'bg-zinc-900 ring-zinc-300' },
    developer: { label: '开发者工具与平台', color: 'bg-zinc-700', dot: 'bg-zinc-700 ring-zinc-300' },
    server: { label: '服务器 / VPS / 域名', color: 'bg-zinc-500', dot: 'bg-zinc-500 ring-zinc-200' },
    productivity: { label: '生产力办公工具', color: 'bg-zinc-400', dot: 'bg-zinc-400 ring-zinc-200' },
    entertainment: { label: '流媒体影音娱乐', color: 'bg-zinc-300', dot: 'bg-zinc-300 ring-zinc-100' },
    other: { label: '其他杂项', color: 'bg-zinc-200', dot: 'bg-zinc-200 ring-zinc-100' },
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
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200/80 card-ambient">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-white shadow-2xs ring-1 ring-zinc-800">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 tracking-tight">按业务类别支出分布</h3>
              <p className="text-xs text-zinc-500 mt-0.5">各模块均摊月度支出占比与财务汇总</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-400 font-medium">总月均支出</div>
            <div className="text-lg font-extrabold font-mono text-zinc-950 tracking-tight">
              {symbol} {grandTotal.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Multi-segment progress bar in monochrome zinc tones */}
        <div className="w-full h-3 rounded-full bg-zinc-100 p-0.5 overflow-hidden flex gap-0.5 mb-5 shadow-inner">
          {(Object.keys(totalsByCategory) as ServiceCategory[]).map(cat => {
            const amount = totalsByCategory[cat];
            const pct = grandTotalUSD > 0 ? (amount / grandTotalUSD) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={cat}
                style={{ width: `${pct}%` }}
                className={`${categoryNames[cat].color} rounded-sm transition-all`}
                title={`${categoryNames[cat].label}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Breakdown grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(totalsByCategory) as ServiceCategory[]).map(cat => {
            const amountUSD = totalsByCategory[cat];
            const amount = preferredCurrency === 'CNY' ? amountUSD * usdToCnyRate : amountUSD;
            const pct = grandTotalUSD > 0 ? (amountUSD / grandTotalUSD) * 100 : 0;

            return (
              <div
                key={cat}
                className="p-3.5 rounded-xl bg-zinc-50 hover:bg-zinc-100/60 border border-zinc-200/60 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${categoryNames[cat].dot} ring-2 ring-offset-1`} />
                  <div>
                    <div className="text-xs font-bold text-zinc-800">{categoryNames[cat].label}</div>
                    <div className="text-[11px] font-mono text-zinc-400 font-medium">{pct.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-extrabold text-zinc-950 tracking-tight">
                    {symbol} {amount.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-sans">/月</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
