import React from 'react';
import { VaultDial } from '../common/VaultDial';
import { DollarSign, Key, Gift, TrendingUp, ShieldCheck } from 'lucide-react';
import { SubscriptionItem, TokenItem, VoucherItem } from '../../types';
import { monthlyAmountUSD } from '../../lib/currencies';

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
  const monthlyTotalUSD = subscriptions.reduce((sum, sub) => sum + monthlyAmountUSD(sub, usdToCnyRate), 0);

  const monthlyTotalCNY = monthlyTotalUSD * usdToCnyRate;
  const annualTotalUSD = monthlyTotalUSD * 12;
  const annualTotalCNY = monthlyTotalCNY * 12;

  const unredeemedVouchers = vouchers.filter(v => v.status === 'unredeemed');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 row:grid-cols-4 gap-4">
      {/* Monthly Expense Card */}
      <div className="relative overflow-hidden p-5 rounded-2xl bg-brand-700 text-white flex flex-col justify-between gap-5">
        <VaultDial className="absolute -right-16 -bottom-20 w-56 h-56 text-white/[0.08]" />
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-brand-100 whitespace-nowrap">预估月度总支出</span>
          <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="relative text-[34px] font-bold text-white tracking-tight leading-none whitespace-nowrap">
            {preferredCurrency === 'CNY' ? `¥ ${monthlyTotalCNY.toFixed(1)}` : `$ ${monthlyTotalUSD.toFixed(1)}`}
          </div>
          <div className="relative text-xs text-brand-100 mt-2">
            折合 {preferredCurrency === 'CNY' ? `$ ${monthlyTotalUSD.toFixed(1)}` : `¥ ${monthlyTotalCNY.toFixed(1)}`}
          </div>
        </div>
      </div>

      {/* Annual Expense Card */}
      <div className="p-5 rounded-2xl bg-white surface-card flex flex-col justify-between gap-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink-soft whitespace-nowrap">预估年度总支出</span>
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 shrink-0 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-[28px] font-bold text-ink tracking-tight leading-none whitespace-nowrap">
            {preferredCurrency === 'CNY' ? `¥ ${annualTotalCNY.toFixed(0)}` : `$ ${annualTotalUSD.toFixed(0)}`}
          </div>
          <div className="text-xs text-muted mt-2">
            共 {subscriptions.length} 项有效订阅服务
          </div>
        </div>
      </div>

      {/* Secret Keys Stored */}
      <div className="p-5 rounded-2xl bg-white surface-card flex flex-col justify-between gap-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink-soft whitespace-nowrap">保险箱加密密钥</span>
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 shrink-0 flex items-center justify-center">
            <Key className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-[28px] font-bold text-ink tracking-tight leading-none whitespace-nowrap flex items-baseline gap-1.5">
            <span>{tokens.length}</span>
            <span className="text-sm font-normal text-muted font-sans">个 API Key</span>
          </div>
          <div className="text-xs text-muted mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>AES-256-GCM 本地加密</span>
          </div>
        </div>
      </div>

      {/* Pending Vouchers */}
      <div className="p-5 rounded-2xl bg-white surface-card flex flex-col justify-between gap-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink-soft whitespace-nowrap">待核销礼品卡券</span>
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 shrink-0 flex items-center justify-center">
            <Gift className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-[28px] font-bold text-ink tracking-tight leading-none whitespace-nowrap flex items-baseline gap-1.5">
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
