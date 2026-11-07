import React from 'react';
import { PieChart, Globe, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { SubscriptionItem, ServiceCategory } from '../../types';
import { monthlyAmountUSD } from '../../lib/currencies';
import {
  summarizePortfolioSavings,
  getServicePricingUrl,
  buildAiSubDealUrl,
} from '../../lib/aisubdeal';
import { BrandBadge } from '../common/BrandBadge';
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
  const { t, format, language } = useI18n();
  const savingsSummary = summarizePortfolioSavings(subscriptions, usdToCnyRate);
  const rate = preferredCurrency === 'CNY' ? usdToCnyRate : 1;

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

      {/* AISubDeal Regional Savings & Optimization Insights Card */}
      <div className="p-5 sm:p-6 rounded-3xl surface-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-ink tracking-tight">
                  {t.aisubdeal.analyticsTitle}
                </h3>
                <a
                  href={buildAiSubDealUrl('/pricing/', language)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-0.5 rounded-full bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold inline-flex items-center gap-1 transition"
                >
                  <span>aisubdeal.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-sm text-muted mt-0.5">
                {t.aisubdeal.analyticsDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Two KPI boxes: Current Regional Savings vs Potential Extra Savings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.aisubdeal.savedMonthlyLabel}</span>
              </div>
              <div className="text-2xl font-bold text-emerald-900 mt-1">
                {symbol} {(savingsSummary.totalSavedVsUsMonthlyUSD * rate).toFixed(1)}
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">
                {format(t.aisubdeal.savedAnnualLabel, {
                  amount: `${symbol} ${(savingsSummary.totalSavedVsUsAnnualUSD * rate).toFixed(0)}`,
                })}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-brand-800 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand-700" />
                <span>{t.aisubdeal.potentialMonthlyLabel}</span>
              </div>
              <div className="text-2xl font-bold text-brand-900 mt-1">
                {symbol} {(savingsSummary.totalPotentialExtraMonthlyUSD * rate).toFixed(1)}
              </div>
              <div className="text-xs text-brand-700 mt-0.5">
                {format(t.aisubdeal.potentialAnnualLabel, {
                  amount: `${symbol} ${(savingsSummary.totalPotentialExtraAnnualUSD * rate).toFixed(0)}`,
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Optimization List */}
        {savingsSummary.optimizableItems.length > 0 ? (
          <div className="space-y-2.5">
            {savingsSummary.optimizableItems.map(({ subscription: sub, evaluation }) => {
              const { cheapest } = evaluation.benchmark;
              const compareUrl = getServicePricingUrl(sub.serviceKey, language, sub.name);
              const extraSavedDisplay = (evaluation.potentialExtraSaveUSD * rate).toFixed(1);

              return (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-2xl bg-inset/60 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BrandBadge serviceKey={sub.serviceKey} name={sub.name} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink truncate">{sub.name}</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold whitespace-nowrap">
                          -{evaluation.potentialExtraSavePercent}% ({symbol} {extraSavedDisplay}/{t.subscriptions.perMonth})
                        </span>
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        {format(t.aisubdeal.floorRegionInfo, {
                          flag: cheapest.countryFlag,
                          currency: cheapest.currency,
                          price: cheapest.localPrice,
                          usd: cheapest.usdPrice.toFixed(2),
                        })}
                      </div>
                    </div>
                  </div>

                  <a
                    href={compareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 px-3.5 rounded-xl bg-white hover:bg-brand-50 text-brand-700 border border-line-strong text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 transition"
                  >
                    <span>{t.aisubdeal.optimizeAction}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-inset/50 border border-line text-xs text-ink-soft flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.aisubdeal.allOptimizedNotice}</span>
            </span>
            <a
              href={buildAiSubDealUrl('/pricing/', language)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 hover:text-brand-800 font-semibold inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>{t.aisubdeal.compareLink}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
