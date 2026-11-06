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
        monthlyTotalUSD += priceInUSD / 3;
        break;
    }
  }

  const monthlyTotalCNY = monthlyTotalUSD * usdToCnyRate;
  const annualTotalUSD = monthlyTotalUSD * 12;
  const annualTotalCNY = monthlyTotalCNY * 12;

  const unredeemedVouchers = vouchers.filter(v => v.status === 'unredeemed');

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4.5">
      {/* Monthly Expense Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#EBEBEB] airbnb-card transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#717171] mb-2">
          <span className="font-semibold text-[#222222]">预估月度总支出</span>
          <div className="w-9 h-9 rounded-2xl bg-[#FFF0F2] text-[#FF385C] border border-[#FFCCD3] flex items-center justify-center shadow-2xs">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#222222] font-mono tracking-tight">
            {preferredCurrency === 'CNY' ? `¥ ${monthlyTotalCNY.toFixed(1)}` : `$ ${monthlyTotalUSD.toFixed(1)}`}
          </div>
          <div className="text-[11px] font-mono text-[#717171] mt-1 font-medium">
            折合 {preferredCurrency === 'CNY' ? `$ ${monthlyTotalUSD.toFixed(1)}` : `¥ ${monthlyTotalCNY.toFixed(1)}`}
          </div>
        </div>
      </div>

      {/* Annual Expense Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#EBEBEB] airbnb-card transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#717171] mb-2">
          <span className="font-semibold text-[#222222]">预估年度总支出</span>
          <div className="w-9 h-9 rounded-2xl bg-[#FFF0F2] text-[#FF385C] border border-[#FFCCD3] flex items-center justify-center shadow-2xs">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#222222] font-mono tracking-tight">
            {preferredCurrency === 'CNY' ? `¥ ${annualTotalCNY.toFixed(0)}` : `$ ${annualTotalUSD.toFixed(0)}`}
          </div>
          <div className="text-[11px] font-mono text-[#717171] mt-1 font-medium">
            共 {subscriptions.length} 项有效订阅服务
          </div>
        </div>
      </div>

      {/* Secret Keys Stored */}
      <div className="p-6 rounded-3xl bg-white border border-[#EBEBEB] airbnb-card transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#717171] mb-2">
          <span className="font-semibold text-[#222222]">保险箱加密密钥</span>
          <div className="w-9 h-9 rounded-2xl bg-[#FFF0F2] text-[#FF385C] border border-[#FFCCD3] flex items-center justify-center shadow-2xs">
            <Key className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#222222] font-mono tracking-tight flex items-baseline gap-1.5">
            <span>{tokens.length}</span>
            <span className="text-xs font-normal text-[#717171] font-sans">个 API Key</span>
          </div>
          <div className="text-[11px] text-[#717171] font-medium mt-1 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF385C]" />
            <span>AES-256-GCM 本地加密</span>
          </div>
        </div>
      </div>

      {/* Pending Vouchers */}
      <div className="p-6 rounded-3xl bg-white border border-[#EBEBEB] airbnb-card transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-[#717171] mb-2">
          <span className="font-semibold text-[#222222]">待核销礼品卡券</span>
          <div className="w-9 h-9 rounded-2xl bg-[#FFF0F2] text-[#FF385C] border border-[#FFCCD3] flex items-center justify-center shadow-2xs">
            <Gift className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#222222] font-mono tracking-tight flex items-baseline gap-1.5">
            <span>{unredeemedVouchers.length}</span>
            <span className="text-xs font-normal text-[#717171] font-sans">张待使用</span>
          </div>
          <div className="text-[11px] text-[#FF385C] font-semibold mt-1">
            随时一键直达充值
          </div>
        </div>
      </div>
    </div>
  );
};
