import React, { useState, useEffect } from 'react';
import { X, Gift, Sparkles } from 'lucide-react';
import { VoucherItem } from '../../types';
import { PRESET_SERVICES, getPresetByKey } from '../../types/presets';
import { detectVoucherService } from '../../lib/rechargeEngines';

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
      setServiceName('Apple App Store 礼品卡');
      setAmount('25');
      setCurrency('USD');
      setNotes('待充值续费');
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
      code: code.trim(),
      serviceKey,
      serviceName: serviceName || getPresetByKey(serviceKey).name,
      amount: amount ? parseFloat(amount) : undefined,
      currency,
      status: initialData?.status || 'unredeemed',
      notes: notes.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xl text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-subtle">
              <Gift className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? '编辑礼品卡券' : '存入新礼品券 / 兑换码'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {/* Voucher Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              礼品卡号 / 兑换券码 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="例如: X89A-24B8-90CD-EF12 或 AAAAA-BBBBB-CCCCC"
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
            />
          </div>

          {/* Service Preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              所属平台 / 服务
            </label>
            <select
              value={serviceKey}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle text-xs"
            >
              {PRESET_SERVICES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                面额金额 (可选)
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                币种
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              >
                <option value="USD">USD ($)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="EUR">EUR (€)</option>
                <option value="HKD">HKD ($)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              备注备忘
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如: 淘宝购买美区卡、黑五打折券..."
              className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/30 transition active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              存入券包
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
