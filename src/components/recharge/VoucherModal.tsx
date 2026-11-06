import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
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
      serviceName: serviceName.trim() || '通用礼品卡券',
      amount: amount ? parseFloat(amount) : undefined,
      currency,
      status: initialData?.status || 'unredeemed',
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white border border-[#EBEBEB] p-6 sm:p-7 airbnb-card overflow-y-auto max-h-[90vh] text-[#222222]">
        <div className="flex items-center justify-between pb-4 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF4EB] text-[#FC642D] border border-[#FFE0D3] flex items-center justify-center shadow-2xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#222222]">
                {initialData ? '编辑礼品卡券' : '存入新礼品卡券'}
              </h3>
              <p className="text-xs text-[#717171]">
                加密存放充值卡密，支持一键直达充值
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#DDDDDD] hover:border-[#222222] text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {/* Voucher Code */}
          <div>
            <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
              卡券密文 / 代码 <span className="text-[#FF385C]">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="例如: X89A-24B8-90CD-EF12"
              className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 font-mono text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
            />
          </div>

          {/* Service Selector */}
          <div>
            <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
              目标服务渠道
            </label>
            <select
              value={serviceKey}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 text-xs text-zinc-800 outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
            >
              {PRESET_SERVICES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
              <option value="custom">其他通用自定义服务</option>
            </select>
          </div>

          {/* Service Name */}
          <div>
            <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
              卡券显示名称
            </label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="例如: 美区 Apple App Store 充值卡"
              className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
            />
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
                面值金额
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25"
                className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 font-mono text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
                币种
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs font-medium"
              >
                <option value="TRY">TRY (₺ 土耳其里拉)</option>
                <option value="USD">USD ($ 美元)</option>
                <option value="CNY">CNY (¥ 人民币)</option>
                <option value="EUR">EUR (€ 欧元)</option>
                <option value="GBP">GBP (£ 英镑)</option>
                <option value="JPY">JPY (¥ 日元)</option>
                <option value="HKD">HKD ($ 港币)</option>
                <option value="SGD">SGD (S$ 新加坡元)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#222222] font-semibold mb-1.5">
              备注备忘
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如: 淘宝购买美区卡、打折券..."
              className="w-full h-10 bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl px-3 text-xs text-[#222222] outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EBEBEB]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD] hover:border-[#222222] text-xs font-semibold transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl btn-rausch text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
            >
              <span>存入券包</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
