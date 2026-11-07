import React from 'react';
import { PieChart } from 'lucide-react';
import { SubscriptionItem, ServiceCategory } from '../../types';
import { monthlyAmountUSD } from '../../lib/currencies';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();

  const categoryNames: Record<ServiceCategory, { label: string; color: string; dot: string }> = {
    ai: { label: t.subscriptions.catAiLabel, color: 'bg-brand-700', dot: 'bg-brand-700' },
    developer: { label: t.subscriptions.catDevLabel, color: 'bg-[#16A3B8]', dot: 'bg-[#16A3B8]' },
    server: { label: t.subscriptions.catServerLabel, color: 'bg-[#8E93A6]', dot: 'bg-[#8E93A6]' },
    productivity: { label: t.subscriptions.catProdLabel, color: 'bg-[#8A5CF0]', dot: 'bg-[#8A5CF0]' },
    entertainment: { label: t.subscriptions.catEntLabel, color: 'bg-[#EC6FA8]', dot: 'bg-[#EC6FA8]' },
    other: { label: t.subscriptions.catOtherLabel, color: 'bg-[#D3D6E2]', dot: 'bg-[#D3D6E2]' },
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
    const m = monthlyAmountUSD(sub, usdToCnyRate);
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
              <h3 className="text-lg font-bold text-ink tracking-tight whitespace-nowrap">
                {t.analytics.distributionTitle}
              </h3>
              <p className="text-sm text-muted mt-0.5">
                {t.analytics.distributionDesc}
              </p>
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-sm text-muted whitespace-nowrap">{t.analytics.totalMonthlySpend}</div>
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

        {/* Category list items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(totalsByCategory) as ServiceCategory[]).map(cat => {
            const amountUSD = totalsByCategory[cat];
            const amount = preferredCurrency === 'CNY' ? amountUSD * usdToCnyRate : amountUSD;
            const pct = grandTotalUSD > 0 ? (amountUSD / grandTotalUSD) * 100 : 0;
            const count = subscriptions.filter(s => s.category === cat).length;

            return (
              <div key={cat} className="p-3.5 rounded-2xl bg-inset/50 border border-line flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${categoryNames[cat].dot} shrink-0`} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">
                      {categoryNames[cat].label}
                    </div>
                    <div className="text-xs text-muted">
                      {count} 个服务 · {pct.toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-ink">
                    {symbol} {amount.toFixed(1)}
                  </div>
                  <div className="text-[11px] text-muted">/月</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
