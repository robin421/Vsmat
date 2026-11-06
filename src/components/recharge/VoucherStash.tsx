import React, { useState } from 'react';
import { Gift, Plus, Copy, Check, Zap, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VoucherItem } from '../../types';
import { execute1ClickRecharge } from '../../lib/rechargeEngines';
import { BrandBadge } from '../common/BrandBadge';

interface VoucherStashProps {
  vouchers: VoucherItem[];
  onAddNew: () => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: 'unredeemed' | 'redeemed') => void;
  onOpenAppleWebRedeem?: (code: string) => void;
}

export const VoucherStash: React.FC<VoucherStashProps> = ({
  vouchers,
  onAddNew,
  onDelete,
  onUpdateStatus,
  onOpenAppleWebRedeem,
}) => {
  const [filter, setFilter] = useState<'all' | 'unredeemed' | 'redeemed'>('unredeemed');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredVouchers = vouchers.filter(v => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  const handleCopy = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handle1ClickRecharge = async (voucher: VoucherItem) => {
    if (voucher.serviceKey === 'apple' && onOpenAppleWebRedeem) {
      onOpenAppleWebRedeem(voucher.code);
      return;
    }

    try {
      const result = await execute1ClickRecharge(voucher.code, voucher.serviceKey);
      if (!result.success) {
        window.alert(result.message);
        return;
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      onUpdateStatus(voucher.id, 'redeemed');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] text-xs">
            <button
              onClick={() => setFilter('unredeemed')}
              className={`px-4 py-2 rounded-full transition select-none font-semibold ${
                filter === 'unredeemed'
                  ? 'bg-white text-[#222222] shadow-xs font-bold border border-[#DDDDDD]/70'
                  : 'text-[#717171] hover:text-[#222222]'
              }`}
            >
              待使用 ({vouchers.filter(v => v.status === 'unredeemed').length})
            </button>
            <button
              onClick={() => setFilter('redeemed')}
              className={`px-4 py-2 rounded-full transition select-none font-semibold ${
                filter === 'redeemed'
                  ? 'bg-white text-[#222222] shadow-xs font-bold border border-[#DDDDDD]/70'
                  : 'text-[#717171] hover:text-[#222222]'
              }`}
            >
              已核销 ({vouchers.filter(v => v.status === 'redeemed').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full transition select-none font-semibold ${
                filter === 'all'
                  ? 'bg-white text-[#222222] shadow-xs font-bold border border-[#DDDDDD]/70'
                  : 'text-[#717171] hover:text-[#222222]'
              }`}
            >
              全部 ({vouchers.length})
            </button>
          </div>
        </div>

        <button
          onClick={onAddNew}
          className="h-10 px-5 rounded-full bg-[#000000] hover:bg-[#222222] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shrink-0 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>存入礼品卡券</span>
        </button>
      </div>

      {/* Grid of Vouchers */}
      {filteredVouchers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVouchers.map(voucher => {
            const isRedeemed = voucher.status === 'redeemed';

            return (
              <div
                key={voucher.id}
                className={`group p-6 rounded-3xl flex flex-col justify-between transition-all duration-200 airbnb-card border ${
                  isRedeemed
                    ? 'border-[#EBEBEB] opacity-60 bg-[#F7F7F7]'
                    : 'border-[#EBEBEB] hover:border-[#DDDDDD] bg-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-3">
                      <BrandBadge serviceKey={voucher.serviceKey} name={voucher.serviceName} size="sm" />
                      <div>
                        <h4 className="text-sm font-bold text-[#222222] leading-tight">
                          {voucher.serviceName}
                        </h4>
                        <span className="text-[11px] font-mono text-[#717171]">
                          {voucher.createdAt} 录入
                        </span>
                      </div>
                    </div>

                    {/* Amount badge */}
                    {voucher.amount ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F7F7F7] text-[#000000] font-mono font-bold border border-[#DDDDDD]">
                        {voucher.currency} {voucher.amount}
                      </span>
                    ) : null}
                  </div>

                  {/* Code box */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] font-mono text-xs mb-3.5">
                    <span className="truncate text-[#222222] font-bold select-all tracking-tight">
                      {voucher.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(voucher.id, voucher.code)}
                      className="hover:text-[#000000] text-[#717171] ml-2 text-[11px] flex items-center gap-1 shrink-0 transition"
                      title="复制卡密"
                    >
                      {copiedId === voucher.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {voucher.notes && (
                    <p className="text-xs text-[#717171] mb-3 truncate px-1">
                      {voucher.notes}
                    </p>
                  )}
                </div>

                {/* Card footer */}
                <div className="pt-3 border-t border-[#EBEBEB] flex items-center justify-between gap-2.5">
                  {!isRedeemed ? (
                    <button
                      type="button"
                      onClick={() => handle1ClickRecharge(voucher)}
                      className="flex-1 h-10 px-4 rounded-xl bg-[#000000] hover:bg-[#222222] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>一键充值使用</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(voucher.id, 'unredeemed')}
                      className="flex-1 h-10 px-4 rounded-xl bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#717171] text-xs font-semibold transition"
                    >
                      撤销核销
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`确定要删除此卡券吗？`)) {
                        onDelete(voucher.id);
                      }
                    }}
                    className="w-10 h-10 rounded-xl text-[#717171] hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-[#DDDDDD] bg-white airbnb-card">
          <div className="w-14 h-14 rounded-2xl bg-[#000000] text-white border border-black/10 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
            <Gift className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#222222] mb-1">
            {filter === 'redeemed' ? '暂无已核销的卡券' : '卡券包暂为空'}
          </h4>
          <p className="text-xs text-[#717171] max-w-sm mx-auto mb-5">
            把购买的 Apple 礼品卡、Steam 充值码或各类 AI 服务代金券存进这里，随时一键直达充值使用。
          </p>
          <button
            onClick={onAddNew}
            className="px-5 py-2.5 rounded-full bg-[#000000] hover:bg-[#222222] text-white font-bold text-xs transition inline-flex items-center gap-1.5 shadow-md active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>存入第一张礼品券</span>
          </button>
        </div>
      )}
    </div>
  );
};
