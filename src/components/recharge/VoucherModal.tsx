import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { VoucherItem } from '../../types';
import { PRESET_SERVICES, getPresetByKey } from '../../types/presets';
import { detectVoucherService } from '../../lib/rechargeEngines';
import { SUPPORTED_CURRENCIES } from '../../lib/currencies';
import { useDismiss } from '../../hooks/useDismiss';
import { useI18n } from '../../i18n';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (voucher: Partial<VoucherItem>) => void;
  initialData?: VoucherItem | null;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  useDismiss(isOpen, onClose);
  const { t } = useI18n();

  const [code, setCode] = useState('');
  const [serviceKey, setServiceKey] = useState('apple');
  const [serviceName, setServiceName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code);
      setServiceKey(initialData.serviceKey);
      setServiceName(initialData.serviceName);
      setAmount(initialData.amount ? String(initialData.amount) : '');
      setCurrency(initialData.currency || 'USD');
      setNotes(initialData.notes || '');
    } else {
      setCode('');
      setServiceKey('apple');
      setServiceName('Apple App Store');
      setAmount('');
      setCurrency('USD');
      setNotes('');
    }
  }, [initialData, isOpen]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (!initialData && newCode.trim().length >= 8) {
      const detected = detectVoucherService(newCode);
      if (detected) {
        setServiceKey(detected.key);
        setServiceName(detected.name);
      }
    }
  };

  const handleServiceChange = (key: string) => {
    setServiceKey(key);
    const p = getPresetByKey(key);
    setServiceName(p.name);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    onSave({
      id: initialData?.id,
      code: code.trim().toUpperCase(),
      serviceKey,
      serviceName: serviceName.trim() || 'Gift Card',
      amount: amount ? parseFloat(amount) : undefined,
      currency,
      status: initialData?.status || 'unredeemed',
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white border border-line p-6 sm:p-7 surface-card overflow-y-auto max-h-[90vh] text-ink">
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-inset text-ink-soft flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">
                {initialData ? t.vouchers.modalTitleEdit : t.vouchers.modalTitleNew}
              </h3>
              <p className="text-xs text-muted">
                {t.tokens.modalDesc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            className="w-8 h-8 rounded-full border border-line-strong hover:border-ink text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {/* Voucher Code */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              {t.vouchers.fieldCode} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="e.g. X89A-24B8-90CD-EF12"
              className="w-full h-10 bg-inset border border-line-strong rounded-lg px-3 font-mono text-sm text-ink outline-none focus:border-ink"
            />
          </div>

          {/* Service Selector */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              {t.tokens.fieldService}
            </label>
            <select
              value={serviceKey}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full h-10 bg-inset border border-line-strong rounded-lg px-3 text-sm text-ink outline-none focus:border-ink"
            >
              {PRESET_SERVICES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
              <option value="custom">{t.subModal.customService}</option>
            </select>
          </div>

          {/* Service Name */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              {t.tokens.fieldName}
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g. Apple App Store Card"
              className="w-full h-10 bg-inset border border-line-strong rounded-lg px-3 text-sm text-ink outline-none focus:border-ink"
            />
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                {t.vouchers.fieldAmount}
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25"
                className="w-full h-10 bg-inset border border-line-strong rounded-lg px-3 font-mono text-sm text-ink outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                {t.subModal.fieldCurrency}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 bg-inset border border-line-strong rounded-lg px-2 text-sm text-ink outline-none focus:border-ink font-medium"
              >
                {SUPPORTED_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              {t.subModal.fieldNotes}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Purchased online, regional balance..."
              className="w-full h-10 bg-inset border border-line-strong rounded-lg px-3 text-sm text-ink outline-none focus:border-ink"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-inset text-ink border border-line-strong hover:border-ink text-xs font-semibold transition"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <span>{initialData ? t.common.save : t.vouchers.addNew}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
