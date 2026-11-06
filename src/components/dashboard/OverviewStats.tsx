import React from 'react';
import { DollarSign, Key, Gift, TrendingUp, ShieldCheck } from 'lucide-react';
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Monthly Expense Card */}
      <div className="p-5 rounded-2xl bg-white border border-black/[0.06] card-ambient transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-600">预估月度总支出</span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center shadow-2xs">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {preferredCurrency === 'CNY' ? `¥ ${monthlyTotalCNY.toFixed(1)}` : `$ ${monthlyTotalUSD.toFixed(1)}`}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 font-medium">
            折合 {preferredCurrency === 'CNY' ? `$ ${monthlyTotalUSD.toFixed(1)}` : `¥ ${monthlyTotalCNY.toFixed(1)}`}
          </div>
        </div>
      </div>

      {/* Annual Expense Card */}
      <div className="p-5 rounded-2xl bg-white border border-black/[0.06] card-ambient transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-600">预估年度总支出</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shadow-2xs">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {preferredCurrency === 'CNY' ? `¥ ${annualTotalCNY.toFixed(0)}` : `$ ${annualTotalUSD.toFixed(0)}`}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 font-medium">
            共 {subscriptions.length} 项有效订阅服务
          </div>
        </div>
      </div>

      {/* Secret Keys Stored */}
      <div className="p-5 rounded-2xl bg-white border border-black/[0.06] card-ambient transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-600">保险箱加密密钥</span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/80 flex items-center justify-center shadow-2xs">
            <Key className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight flex items-baseline gap-1.5">
            <span>{tokens.length}</span>
            <span className="text-xs font-normal text-slate-400 font-sans">个 API Key</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>AES-256-GCM 强加密保护</span>
          </div>
        </div>
      </div>

      {/* Pending Vouchers */}
      <div className="p-5 rounded-2xl bg-white border border-black/[0.06] card-ambient transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold text-slate-600">待核销礼品卡券</span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/80 flex items-center justify-center shadow-2xs">
            <Gift className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight flex items-baseline gap-1.5">
            <span>{unredeemedVouchers.length}</span>
            <span className="text-xs font-normal text-slate-400 font-sans">张待使用</span>
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            随时一键直达充值
          </div>
        </div>
      </div>
    </div>
  );
};
