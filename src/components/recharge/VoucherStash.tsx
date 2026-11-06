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
    // If Apple, trigger Method 1 Web Redeem Modal!
    if (voucher.serviceKey === 'apple' && onOpenAppleWebRedeem) {
      onOpenAppleWebRedeem(voucher.code);
      return;
    }

    try {
      await execute1ClickRecharge(voucher.code, voucher.serviceKey);

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });

      // Mark as redeemed
      onUpdateStatus(voucher.id, 'redeemed');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200 text-xs">
            <button
              onClick={() => setFilter('unredeemed')}
              className={`px-3 py-1.5 rounded-lg transition select-none font-medium ${
                filter === 'unredeemed'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              待使用 ({vouchers.filter(v => v.status === 'unredeemed').length})
            </button>
            <button
              onClick={() => setFilter('redeemed')}
              className={`px-3 py-1.5 rounded-lg transition select-none font-medium ${
                filter === 'redeemed'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              已核销 ({vouchers.filter(v => v.status === 'redeemed').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition select-none font-medium ${
                filter === 'all'
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              全部 ({vouchers.length})
            </button>
          </div>
        </div>

        <button
          onClick={onAddNew}
          className="h-10 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-2xs shrink-0 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-zinc-300" />
          <span>存入礼品卡券</span>
        </button>
      </div>

      {/* Grid of Vouchers */}
      {filteredVouchers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredVouchers.map(voucher => {
            const isRedeemed = voucher.status === 'redeemed';

            return (
              <div
                key={voucher.id}
                className={`group p-5 rounded-2xl flex flex-col justify-between transition-all duration-200 card-ambient border ${
                  isRedeemed
                    ? 'border-zinc-200 opacity-60 bg-zinc-50/50'
                    : 'border-zinc-200/80 hover:border-zinc-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <BrandBadge serviceKey={voucher.serviceKey} name={voucher.serviceName} size="sm" />
                      <div>
                        <h4 className="text-sm font-bold text-zinc-950 leading-tight">
                          {voucher.serviceName}
                        </h4>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {voucher.createdAt} 录入
                        </span>
                      </div>
                    </div>

                    {/* Amount badge */}
                    {voucher.amount ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-100 text-zinc-900 font-mono font-bold border border-zinc-200">
                        {voucher.currency} {voucher.amount}
                      </span>
                    ) : null}
                  </div>

                  {/* Code box */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/60 font-mono text-xs mb-3">
                    <span className="truncate text-zinc-900 font-bold select-all tracking-tight">
                      {voucher.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(voucher.id, voucher.code)}
                      className="hover:text-zinc-900 text-zinc-400 ml-2 text-[11px] flex items-center gap-1 shrink-0 transition"
                      title="复制卡密"
                    >
                      {copiedId === voucher.id ? <Check className="w-3.5 h-3.5 text-zinc-800" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {voucher.notes && (
                    <p className="text-xs text-zinc-500 mb-3 truncate">
                      {voucher.notes}
                    </p>
                  )}
                </div>

                {/* Card footer */}
                <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2">
                  {!isRedeemed ? (
                    <button
                      type="button"
                      onClick={() => handle1ClickRecharge(voucher)}
                      className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98]"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>一键充值使用</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(voucher.id, 'unredeemed')}
                      className="flex-1 py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium transition"
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
                    className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="删除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-zinc-200 bg-white shadow-2xs">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Gift className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-zinc-900 mb-1">
            {filter === 'redeemed' ? '暂无已核销的卡券' : '卡券包暂为空'}
          </h4>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
            把购买的 Apple 礼品卡、Steam 充值码或各类 AI 服务代金券存进这里，随时一键充值使用。
          </p>
          <button
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-medium text-xs transition inline-flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>存入第一张礼品券</span>
          </button>
        </div>
      )}
    </div>
  );
};
