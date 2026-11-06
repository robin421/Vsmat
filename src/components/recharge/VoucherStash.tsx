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
          <div className="flex items-center p-0.5 rounded-lg bg-inset border border-line text-sm max-w-full overflow-x-auto">
            <button
              onClick={() => setFilter('unredeemed')}
              className={`px-3.5 h-8 rounded-md transition-colors select-none font-medium whitespace-nowrap ${
                filter === 'unredeemed'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              待使用 ({vouchers.filter(v => v.status === 'unredeemed').length})
            </button>
            <button
              onClick={() => setFilter('redeemed')}
              className={`px-3.5 h-8 rounded-md transition-colors select-none font-medium whitespace-nowrap ${
                filter === 'redeemed'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              已核销 ({vouchers.filter(v => v.status === 'redeemed').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 h-8 rounded-md transition-colors select-none font-medium whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              全部 ({vouchers.length})
            </button>
          </div>
        </div>

        <button
          onClick={onAddNew}
          className="h-9 px-4 rounded-lg btn-primary font-semibold text-sm flex items-center justify-center gap-1.5 shrink-0"
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
                className={`group p-5 rounded-2xl flex flex-col justify-between surface-card ${
                  isRedeemed ? 'opacity-60 !bg-inset' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <div className="flex items-center gap-3">
                      <BrandBadge serviceKey={voucher.serviceKey} name={voucher.serviceName} size="sm" />
                      <div>
                        <h4 className="text-sm font-semibold text-ink leading-snug">
                          {voucher.serviceName}
                        </h4>
                        <span className="text-xs font-mono text-muted">
                          {voucher.createdAt} 录入
                        </span>
                      </div>
                    </div>

                    {/* Amount badge */}
                    {voucher.amount ? (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-inset text-ink font-mono font-semibold border border-line">
                        {voucher.currency} {voucher.amount}
                      </span>
                    ) : null}
                  </div>

                  {/* Code box */}
                  <div className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-dashed border-line-strong font-mono text-[13px] mb-3.5">
                    <span className="truncate text-ink font-medium select-all">
                      {voucher.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(voucher.id, voucher.code)}
                      className="hover:text-ink text-muted ml-2 w-7 h-7 -mr-1.5 rounded-md hover:bg-inset text-xs flex items-center justify-center shrink-0 transition-colors"
                      title="复制卡密"
                    >
                      {copiedId === voucher.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {voucher.notes && (
                    <p className="text-sm text-muted mb-3 truncate">
                      {voucher.notes}
                    </p>
                  )}
                </div>

                {/* Card footer */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  {!isRedeemed ? (
                    <button
                      type="button"
                      onClick={() => handle1ClickRecharge(voucher)}
                      className="flex-1 h-10 px-4 rounded-lg btn-primary font-semibold text-sm flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>一键充值使用</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(voucher.id, 'unredeemed')}
                      className="flex-1 h-10 px-4 rounded-lg bg-white hover:bg-line text-muted text-sm font-semibold transition-colors border border-line"
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
                    className="w-10 h-10 rounded-lg text-muted hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors"
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
        <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-line-strong bg-white">
          <div className="w-12 h-12 rounded-lg bg-brand-700 text-white flex items-center justify-center mx-auto mb-4">
            <Gift className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-ink mb-1">
            {filter === 'redeemed' ? '暂无已核销的卡券' : '卡券包暂为空'}
          </h4>
          <p className="text-sm text-muted max-w-sm mx-auto mb-5">
            把购买的 Apple 礼品卡、Steam 充值码或各类 AI 服务代金券存进这里，随时一键直达充值使用。
          </p>
          <button
            onClick={onAddNew}
            className="h-10 px-5 rounded-lg btn-primary font-semibold text-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>存入第一张礼品券</span>
          </button>
        </div>
      )}
    </div>
  );
};
