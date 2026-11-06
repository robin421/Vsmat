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
  // Airbnb inspired palette: Rausch Red hero accent + warm neutrals
  const categoryNames: Record<ServiceCategory, { label: string; color: string; dot: string }> = {
    ai: { label: 'AI 大模型与服务', color: 'bg-[#FF385C]', dot: 'bg-[#FF385C] ring-[#FFCCD3]' },
    developer: { label: '开发者工具与平台', color: 'bg-[#222222]', dot: 'bg-[#222222] ring-[#DDDDDD]' },
    server: { label: '服务器 / VPS / 域名', color: 'bg-[#717171]', dot: 'bg-[#717171] ring-[#EBEBEB]' },
    productivity: { label: '生产力办公工具', color: 'bg-[#E00B41]', dot: 'bg-[#E00B41] ring-[#FFCCD3]' },
    entertainment: { label: '流媒体影音娱乐', color: 'bg-[#B0B0B0]', dot: 'bg-[#B0B0B0] ring-[#EBEBEB]' },
    other: { label: '其他杂项', color: 'bg-[#DDDDDD]', dot: 'bg-[#DDDDDD] ring-[#F7F7F7]' },
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
    <div className="space-y-5">
      {/* Category breakdown card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#EBEBEB] airbnb-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF0F2] text-[#FF385C] border border-[#FFCCD3] flex items-center justify-center shadow-2xs">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#222222] tracking-tight">按业务类别支出分布</h3>
              <p className="text-xs text-[#717171] mt-0.5">各模块均摊月度支出占比与财务汇总</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#717171] font-medium">总月均支出</div>
            <div className="text-xl font-bold font-mono text-[#222222] tracking-tight">
              {symbol} {grandTotal.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div className="w-full h-3 rounded-full bg-[#F7F7F7] p-0.5 overflow-hidden flex gap-1 mb-6 border border-[#EBEBEB]">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {(Object.keys(totalsByCategory) as ServiceCategory[]).map(cat => {
            const amountUSD = totalsByCategory[cat];
            const amount = preferredCurrency === 'CNY' ? amountUSD * usdToCnyRate : amountUSD;
            const pct = grandTotalUSD > 0 ? (amountUSD / grandTotalUSD) * 100 : 0;

            return (
              <div
                key={cat}
                className="p-4 rounded-2xl bg-[#F7F7F7] hover:bg-[#F2F2F2] border border-[#EBEBEB] flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${categoryNames[cat].dot} ring-2 ring-offset-1`} />
                  <div>
                    <div className="text-xs font-bold text-[#222222]">{categoryNames[cat].label}</div>
                    <div className="text-[11px] font-mono text-[#717171] font-medium">{pct.toFixed(1)}%</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-[#222222] tracking-tight">
                    {symbol} {amount.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-[#717171] font-sans">/月</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
