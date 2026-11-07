import React, { useState } from 'react';
import { Gift, Plus, Copy, Check, CheckCheck, Zap, Trash2, Edit2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { VoucherItem } from '../../types';
import { execute1ClickRecharge } from '../../lib/rechargeEngines';
import { getPresetByKey } from '../../types/presets';
import { BrandBadge } from '../common/BrandBadge';
import { useI18n } from '../../i18n';

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
  const { t } = useI18n();
  const [filter, setFilter] = useState<'all' | 'unredeemed' | 'redeemed'>('unredeemed');
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
              className={`px-3 h-8 rounded-lg transition-colors font-medium select-none whitespace-nowrap ${
                filter === 'unredeemed'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t.vouchers.filterUnredeemed} ({vouchers.filter(v => v.status === 'unredeemed').length})
            </button>
            <button
              onClick={() => setFilter('redeemed')}
              className={`px-3 h-8 rounded-lg transition-colors font-medium select-none whitespace-nowrap ${
                filter === 'redeemed'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t.vouchers.filterRedeemed} ({vouchers.filter(v => v.status === 'redeemed').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 h-8 rounded-lg transition-colors font-medium select-none whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-white text-ink font-semibold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t.vouchers.filterAll} ({vouchers.length})
            </button>
          </div>
        </div>

        <button
          onClick={onAddNew}
          className="h-10 px-4 rounded-xl btn-primary font-semibold text-sm flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>{t.vouchers.addNew}</span>
        </button>
      </div>

      {/* Grid of Vouchers */}
      {filteredVouchers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredVouchers.map((voucher) => {
            const preset = getPresetByKey(voucher.serviceKey);
            const isPending = pendingIds.includes(voucher.id);
            const isRedeemed = voucher.status === 'redeemed';

            return (
              <div
                key={voucher.id}
                className={`rounded-2xl surface-card p-4 flex flex-col justify-between gap-4 transition border ${
                  isRedeemed ? 'opacity-65' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BrandBadge serviceKey={voucher.serviceKey} name={voucher.serviceName} size="sm" />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-ink truncate" title={voucher.serviceName}>
                          {voucher.serviceName || preset.name}
                        </h4>
                        {voucher.amount !== undefined && (
                          <div className="text-xs text-muted mt-0.5">
                            {voucher.currency} {voucher.amount}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(voucher)}
                        className="w-7 h-7 rounded-md text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition"
                        title={t.common.edit}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定要删除这张卡券吗？')) {
                            onDelete(voucher.id);
                          }
                        }}
                        className="w-7 h-7 rounded-md text-muted hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition"
                        title={t.common.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Code Block */}
                  <div className="p-2.5 rounded-xl bg-inset font-mono text-xs flex items-center justify-between gap-2 border border-line">
                    <span className="truncate select-all text-ink font-semibold">{voucher.code}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(voucher.id, voucher.code)}
                      className="text-muted hover:text-ink transition flex items-center gap-1 shrink-0"
                    >
                      {copiedId === voucher.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {voucher.notes && (
                    <p className="text-xs text-muted mt-2 truncate" title={voucher.notes}>
                      {voucher.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-line flex items-center justify-between gap-2">
                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => markRedeemed(voucher.id)}
                      className="w-full h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.vouchers.confirmRedeemedAction}</span>
                    </button>
                  ) : isRedeemed ? (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(voucher.id, 'unredeemed')}
                      className="w-full h-8 px-3 rounded-lg bg-inset hover:bg-line text-muted font-medium text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{t.vouchers.markAsUnredeemed}</span>
                    </button>
                  ) : (
                    <div className="w-full grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handle1ClickRecharge(voucher)}
                        className="h-8 px-2.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center gap-1 transition active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{t.vouchers.rechargeBtn}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => markRedeemed(voucher.id)}
                        className="h-8 px-2.5 rounded-lg bg-inset hover:bg-line text-ink-soft font-semibold text-xs flex items-center justify-center gap-1 transition active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.vouchers.statusRedeemed}</span>
                      </button>
                    </div>
                  )}
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
          <h4 className="text-base font-semibold text-ink mb-1">{t.vouchers.emptyTitle}</h4>
          <p className="text-sm text-muted max-w-sm mx-auto mb-5">
            {t.vouchers.emptyDesc}
          </p>
          <button
            onClick={onAddNew}
            className="h-10 px-5 rounded-lg btn-primary font-semibold text-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t.vouchers.emptyCta}</span>
          </button>
        </div>
      )}
    </div>
  );
};
