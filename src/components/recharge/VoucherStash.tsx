import React, { useState } from 'react';
import { Gift, Plus, Copy, Check, Zap, Trash2, CheckCircle2, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VoucherItem } from '../../types';
import { getPresetByKey } from '../../types/presets';
import { execute1ClickRecharge } from '../../lib/rechargeEngines';

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
        particleCount: 50,
        spread: 60,
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
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200 text-xs">
            <button
              onClick={() => setFilter('unredeemed')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'unredeemed'
                  ? 'bg-white text-blue-600 font-semibold shadow-subtle border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              待使用 ({vouchers.filter(v => v.status === 'unredeemed').length})
            </button>
            <button
              onClick={() => setFilter('redeemed')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'redeemed'
                  ? 'bg-white text-blue-600 font-semibold shadow-subtle border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              已核销 ({vouchers.filter(v => v.status === 'redeemed').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-white text-blue-600 font-semibold shadow-subtle border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部 ({vouchers.length})
            </button>
          </div>
        </div>

        <button
          onClick={onAddNew}
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          存入礼品卡券
        </button>
      </div>

      {/* Grid of Vouchers */}
      {filteredVouchers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVouchers.map(voucher => {
            const preset = getPresetByKey(voucher.serviceKey);
            const isRedeemed = voucher.status === 'redeemed';

            return (
              <div
                key={voucher.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition bg-white shadow-subtle ${
                  isRedeemed
                    ? 'border-slate-200 opacity-60 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-elevated'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold border bg-slate-100 text-slate-800 border-slate-200 shadow-subtle">
                        {voucher.serviceName.slice(0, 1)}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {voucher.serviceName}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          {voucher.createdAt} 录入
                        </span>
                      </div>
                    </div>

                    {/* Amount badge */}
                    {voucher.amount ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                        {voucher.currency} {voucher.amount}
                      </span>
                    ) : null}
                  </div>

                  {/* Code box */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs mb-3">
                    <span className="truncate text-slate-800 font-semibold">
                      {voucher.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(voucher.id, voucher.code)}
                      className="hover:text-blue-600 text-slate-500 ml-2 text-[11px] flex items-center gap-1 shrink-0"
                    >
                      {copiedId === voucher.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {voucher.notes && (
                    <p className="text-xs text-slate-500 mb-3 truncate">
                      {voucher.notes}
                    </p>
                  )}
                </div>

                {/* Card footer */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  {!isRedeemed ? (
                    <button
                      type="button"
                      onClick={() => handle1ClickRecharge(voucher)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm shadow-blue-600/20 active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      一键充值使用
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(voucher.id, 'unredeemed')}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition"
                    >
                      撤销核销
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDelete(voucher.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
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
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-white shadow-subtle">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-subtle">
            <Gift className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">
            {filter === 'redeemed' ? '暂无已核销的卡券' : '卡券包暂为空'}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            把平时买的 Apple 礼品卡、Steam 充值码或各类 AI 服务代金券存进这里，随时一键充值使用。
          </p>
          <button
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition inline-flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            存入第一张礼品券
          </button>
        </div>
      )}
    </div>
  );
};
