import React from 'react';
import { DollarSign, Key, CreditCard, Gift, TrendingUp } from 'lucide-react';
import { SubscriptionItem, TokenItem, VoucherItem } from '../../types';

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
  // Calculate monthly normalized expense
  let monthlyTotalUSD = 0;
  for (const sub of subscriptions) {
    if (!sub.autoRenew && sub.cycle === 'lifetime') continue;
    let priceInUSD = sub.price;
    if (sub.currency === 'CNY') priceInUSD = sub.price / usdToCnyRate;
    else if (sub.currency === 'EUR') priceInUSD = sub.price * 1.08;
    else if (sub.currency === 'HKD') priceInUSD = sub.price / 7.8;
    else if (sub.currency === 'JPY') priceInUSD = sub.price / 155;

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
        monthlyTotalUSD += priceInUSD / 3; // estimate amortized
        break;
    }
  }

  const monthlyTotalCNY = monthlyTotalUSD * usdToCnyRate;
  const annualTotalUSD = monthlyTotalUSD * 12;
  const annualTotalCNY = monthlyTotalCNY * 12;

  const unredeemedVouchers = vouchers.filter(v => v.status === 'unredeemed');

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Monthly Expense Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-elevated transition flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">预估月度总支出</span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
            {preferredCurrency === 'CNY' ? `¥ ${monthlyTotalCNY.toFixed(1)}` : `$ ${monthlyTotalUSD.toFixed(1)}`}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            折合 {preferredCurrency === 'CNY' ? `$ ${monthlyTotalUSD.toFixed(1)}` : `¥ ${monthlyTotalCNY.toFixed(1)}`}
          </div>
        </div>
      </div>

      {/* Annual Expense Card */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-elevated transition flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">预估年度总支出</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
            {preferredCurrency === 'CNY' ? `¥ ${annualTotalCNY.toFixed(0)}` : `$ ${annualTotalUSD.toFixed(0)}`}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            共 {subscriptions.length} 项有效订阅服务
          </div>
        </div>
      </div>

      {/* Secret Keys Stored */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-elevated transition flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">保险箱加密密钥</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
            {tokens.length} <span className="text-xs text-slate-500 font-normal">个 API Key</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            AES-256-GCM 强加密保护
          </div>
        </div>
      </div>

      {/* Unused Vouchers */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-subtle hover:shadow-elevated transition flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium">待核销礼品卡券</span>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Gift className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-xl font-extrabold text-slate-900 font-mono tracking-tight">
            {unredeemedVouchers.length} <span className="text-xs text-slate-500 font-normal">张待使用</span>
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-0.5">
            支持一键直达充值
          </div>
        </div>
      </div>
    </div>
  );
};
