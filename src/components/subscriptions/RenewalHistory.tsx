import React from 'react';
import { History, Undo2 } from 'lucide-react';
import { BillingHistoryRecord } from '../../types';
import { convertToUSD } from '../../lib/currencies';

interface RenewalHistoryProps {
  history: BillingHistoryRecord[];
  preferredCurrency: 'CNY' | 'USD';
  usdToCnyRate: number;
  onUndoLatest: () => void;
}

export const RenewalHistory: React.FC<RenewalHistoryProps> = ({ history, preferredCurrency, usdToCnyRate, onUndoLatest }) => {
  const totalUSD = history.reduce((sum, h) => sum + convertToUSD(h.amount, h.currency, usdToCnyRate), 0);
  const total = preferredCurrency === 'CNY' ? `¥ ${(totalUSD * usdToCnyRate).toFixed(2)}` : `$ ${totalUSD.toFixed(2)}`;

  return (
    <div className="pt-4 border-t border-line">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-ink flex items-center gap-1.5 whitespace-nowrap">
          <History className="w-3.5 h-3.5" />
          续费记录
        </span>
        {history.length > 0 && (
          <span className="text-xs text-muted whitespace-nowrap">
            共 {history.length} 次，累计约 <span className="font-semibold text-ink">{total}</span>
          </span>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-xs text-muted">还没有续费记录，点击“我已续费”后会显示在这里。</p>
      ) : (
        <ul className="max-h-40 overflow-y-auto divide-y divide-line rounded-xl border border-line">
          {history.map((h, i) => (
            <li key={h.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
              <div className="min-w-0">
                <div className="font-medium text-ink whitespace-nowrap">{h.date}</div>
                {h.note && <div className="text-muted truncate" title={h.note}>{h.note}</div>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-ink whitespace-nowrap">{h.currency} {h.amount}</span>
                {i === 0 && h.previousBillingDate && (
                  <button
                    type="button"
                    onClick={onUndoLatest}
                    className="h-7 px-2 rounded-md bg-inset hover:bg-line text-ink-soft font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
                    title={`撤销这次续费，下期恢复为 ${h.previousBillingDate}`}
                  >
                    <Undo2 className="w-3 h-3" />
                    撤销
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
