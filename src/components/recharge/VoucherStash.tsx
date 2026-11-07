import React, { useState } from 'react';
import { Gift, Plus, Copy, Check, CheckCheck, Zap, Trash2, Edit2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VoucherItem } from '../../types';
import { execute1ClickRecharge } from '../../lib/rechargeEngines';
import { getPresetByKey } from '../../types/presets';
import { BrandBadge } from '../common/BrandBadge';

interface VoucherStashProps {
  vouchers: VoucherItem[];
  onAddNew: () => void;
  onEdit: (voucher: VoucherItem) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: 'unredeemed' | 'redeemed') => void;
  onOpenAppleWebRedeem?: (code: string) => void;
}

export const VoucherStash: React.FC<VoucherStashProps> = ({
  vouchers,
  onAddNew,
  onEdit,
  onDelete,
  onUpdateStatus,
  onOpenAppleWebRedeem,
}) => {
  const [filter, setFilter] = useState<'all' | 'unredeemed' | 'redeemed'>('unredeemed');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // Opened the provider's page, waiting for the user to confirm the redemption
  const [pendingIds, setPendingIds] = useState<string[]>([]);

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

      setPendingIds((ids) => (ids.includes(voucher.id) ? ids : [...ids, voucher.id]));
    } catch (err) {
      console.error(err);
    }
  };

  const markRedeemed = (id: string) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    setPendingIds((ids) => ids.filter((x) => x !== id));
    onUpdateStatus(id, 'redeemed');
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-inset text-sm max-w-full overflow-x-auto">
            <button
              onClick={() => setFilter('unredeemed')}
              className={`px-3 h-8 rounded-lg transition-colors select-none font-medium whitespace-nowrap ${
                filter === 'unredeemed'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              待使用 ({vouchers.filter(v => v.status === 'unredeemed').length})
            </button>
            <button
              onClick={() => setFilter('redeemed')}
              className={`px-3 h-8 rounded-lg transition-colors select-none font-medium whitespace-nowrap ${
                filter === 'redeemed'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              已核销 ({vouchers.filter(v => v.status === 'redeemed').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 h-8 rounded-lg transition-colors select-none font-medium whitespace-nowrap ${
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
          className="h-10 px-4 rounded-xl btn-primary font-semibold text-sm flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>存入礼品卡券</span>
        </button>
      </div>

      {/* Grid of Vouchers */}
      {filteredVouchers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 row:grid-cols-3 gap-4">
          {filteredVouchers.map(voucher => {
            const isRedeemed = voucher.status === 'redeemed';
            const tone = getPresetByKey(voucher.serviceKey).brandColor;

            return (
              <div key={voucher.id} className={`rounded-2xl overflow-hidden surface-card flex flex-col ${isRedeemed ? 'opacity-70' : ''}`}>
                {/* The card face, in the provider's colour */}
                <div
                  className="relative p-4 h-32 flex flex-col justify-between text-white"
                  style={{ background: isRedeemed ? '#8E93A6' : `color-mix(in srgb, ${tone} 55%, #141B4D)` }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="rounded-lg bg-white shrink-0">
                      <BrandBadge serviceKey={voucher.serviceKey} name={voucher.serviceName} size="sm" />
                    </span>
                    <h4 className="text-sm font-semibold truncate" title={voucher.serviceName}>
                      {voucher.serviceName}
                    </h4>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <span className="text-xs text-white/75 whitespace-nowrap">{voucher.createdAt} 录入</span>
                    {voucher.amount ? (
                      <span className="text-2xl font-bold tracking-tight leading-none whitespace-nowrap">
                        {voucher.currency} {voucher.amount}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 pl-3 pr-1 h-10 rounded-lg bg-inset font-mono text-[13px]">
                    <span className="truncate text-ink select-all">{voucher.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(voucher.id, voucher.code)}
                      className="w-8 h-8 rounded-md hover:bg-line text-muted hover:text-ink flex items-center justify-center shrink-0 transition-colors"
                      title="复制卡密"
                      aria-label="复制卡密"
                    >
                      {copiedId === voucher.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {voucher.notes && (
                    <p className="text-[13px] text-muted truncate" title={voucher.notes}>
                      {voucher.notes}
                    </p>
                  )}

                  {pendingIds.includes(voucher.id) && !isRedeemed && (
                    <div className="flex items-center justify-between gap-2 pl-3 pr-1.5 h-10 rounded-lg bg-amber-50 text-[13px] text-amber-800">
                      <span className="truncate">已打开兑换页，兑换成功后请确认</span>
                      <button
                        type="button"
                        onClick={() => markRedeemed(voucher.id)}
                        className="h-7 px-2.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold whitespace-nowrap transition-colors shrink-0"
                      >
                        已兑换
                      </button>
                    </div>
                  )}

                  <div className="mt-auto flex items-center gap-1">
                    {!isRedeemed ? (
                      <button
                        type="button"
                        onClick={() => handle1ClickRecharge(voucher)}
                        className="flex-1 h-10 px-4 rounded-lg btn-primary font-semibold text-sm flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>一键充值使用</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(voucher.id, 'unredeemed')}
                        className="flex-1 h-10 px-4 rounded-lg bg-inset hover:bg-line text-ink-soft text-sm font-semibold transition-colors"
                      >
                        撤销核销
                      </button>
                    )}

                    {!isRedeemed && (
                      <button
                        type="button"
                        onClick={() => markRedeemed(voucher.id)}
                        className="w-10 h-10 rounded-lg text-muted hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-colors shrink-0"
                        title="标记为已核销"
                        aria-label="标记为已核销"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onEdit(voucher)}
                      className="w-10 h-10 rounded-lg text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition-colors shrink-0"
                      title="编辑卡券"
                      aria-label="编辑卡券"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`确定要删除此卡券吗？`)) {
                          onDelete(voucher.id);
                        }
                      }}
                      className="w-10 h-10 rounded-lg text-muted hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors shrink-0"
                      title="删除"
                      aria-label="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-2xl surface-card">
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
