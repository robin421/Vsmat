import React from 'react';
import { DollarSign, Key, Gift, TrendingUp, ShieldCheck } from 'lucide-react';
import { SubscriptionItem, TokenItem, VoucherItem } from '../../types';
import { convertToUSD } from '../../lib/currencies';

interface OverviewStatsProps {
  subscriptions: SubscriptionItem[];
  tokens: TokenItem[];
  vouchers: VoucherItem[];
  usdToCnyRate: number;
  preferredCurrency: 'CNY' | 'USD';
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({
  subscriptions,
  tokens,
  vouchers,
  usdToCnyRate,
  preferredCurrency,
}) => {
  let monthlyTotalUSD = 0;
  for (const sub of subscriptions) {
    if (!sub.autoRenew && sub.cycle === 'lifetime') continue;
    const priceInUSD = convertToUSD(sub.price, sub.currency, usdToCnyRate);

    switch (sub.cycle) {
      case 'monthly':
        monthlyTotalUSD += priceInUSD;
        break;
      case 'quarterly':
        monthlyTotalUSD += priceInUSD / 3;
        break;
      case 'semi-annually':
        monthlyTotalUSD += priceInUSD / 6;
        break;
      case 'annually':
        monthlyTotalUSD += priceInUSD / 12;
        break;
      case 'prepaid':
        monthlyTotalUSD += priceInUSD / 3;
        break;
    }
  }

  const monthlyTotalCNY = monthlyTotalUSD * usdToCnyRate;
  const annualTotalUSD = monthlyTotalUSD * 12;
  const annualTotalCNY = monthlyTotalCNY * 12;

  const unredeemedVouchers = vouchers.filter(v => v.status === 'unredeemed');

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Monthly Expense Card */}
      <div className="p-5 rounded-2xl bg-brand-900 text-white flex flex-col justify-between gap-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-white/80">预估月度总支出</span>
          <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-4xl font-semibold text-white font-mono tracking-tight leading-none">
            {preferredCurrency === 'CNY' ? `¥ ${monthlyTotalCNY.toFixed(1)}` : `$ ${monthlyTotalUSD.toFixed(1)}`}
          </div>
          <div className="text-xs font-mono text-white/70 mt-2">
            折合 {preferredCurrency === 'CNY' ? `$ ${monthlyTotalUSD.toFixed(1)}` : `¥ ${monthlyTotalCNY.toFixed(1)}`}
          </div>
        </div>
      </div>

      {/* Annual Expense Card */}
      <div className="p-5 rounded-2xl bg-white surface-card flex flex-col justify-between gap-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink-soft">预估年度总支出</span>
          <div className="w-8 h-8 rounded-lg bg-inset text-ink-soft flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-ink font-mono tracking-tight leading-none">
            {preferredCurrency === 'CNY' ? `¥ ${annualTotalCNY.toFixed(0)}` : `$ ${annualTotalUSD.toFixed(0)}`}
          </div>
          <div className="text-xs font-mono text-muted mt-2">
            共 {subscriptions.length} 项有效订阅服务
          </div>
        </div>
      </div>

      {/* Secret Keys Stored */}
      <div className="p-5 rounded-2xl bg-white surface-card flex flex-col justify-between gap-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink-soft">保险箱加密密钥</span>
          <div className="w-8 h-8 rounded-lg bg-inset text-ink-soft flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-ink font-mono tracking-tight leading-none flex items-baseline gap-1.5">
            <span>{tokens.length}</span>
            <span className="text-sm font-normal text-muted font-sans">个 API Key</span>
          </div>
          <div className="text-xs text-muted mt-2 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>AES-256-GCM 本地加密</span>
          </div>
        </div>
      </div>

      {/* Pending Vouchers */}
      <div className="p-5 rounded-2xl bg-white surface-card flex flex-col justify-between gap-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink-soft">待核销礼品卡券</span>
          <div className="w-8 h-8 rounded-lg bg-inset text-ink-soft flex items-center justify-center">
            <Gift className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-ink font-mono tracking-tight leading-none flex items-baseline gap-1.5">
            <span>{unredeemedVouchers.length}</span>
            <span className="text-sm font-normal text-muted font-sans">张待使用</span>
          </div>
          <div className="text-xs text-muted mt-2">
            随时一键直达充值
          </div>
        </div>
      </div>
    </div>
  );
};
