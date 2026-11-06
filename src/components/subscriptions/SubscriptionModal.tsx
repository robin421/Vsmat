import React, { useState, useEffect } from 'react';
import { X, CreditCard, Trash2, ArrowUpRight } from 'lucide-react';
import { SubscriptionItem, BillingCycle, ServiceCategory } from '../../types';
import { PRESET_SERVICES, getPresetByKey } from '../../types/presets';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: Partial<SubscriptionItem>) => void;
  onDelete?: (id: string) => void;
  initialData?: SubscriptionItem | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [serviceKey, setServiceKey] = useState('custom');
  const [category, setCategory] = useState<ServiceCategory>('ai');
  const [accountEmail, setAccountEmail] = useState('');
  const [passwordNote, setPasswordNote] = useState('');
  const [twoFactorNote, setTwoFactorNote] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'CNY' | 'EUR' | 'HKD' | 'GBP' | 'JPY'>('USD');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [portalUrl, setPortalUrl] = useState('');
  const [rechargeUrl, setRechargeUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setServiceKey(initialData.serviceKey || 'custom');
      setCategory(initialData.category || 'ai');
      setAccountEmail(initialData.accountEmail || '');
      setPasswordNote(initialData.passwordNote || '');
      setTwoFactorNote(initialData.twoFactorNote || '');
      setCycle(initialData.cycle || 'monthly');
      setPrice(initialData.price !== undefined ? String(initialData.price) : '');
      setCurrency(initialData.currency || 'USD');
      setNextBillingDate(initialData.nextBillingDate || '');
      setPaymentMethod(initialData.paymentMethod || '');
      setPortalUrl(initialData.portalUrl || '');
      setRechargeUrl(initialData.rechargeUrl || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setServiceKey('custom');
      setCategory('ai');
      setAccountEmail('');
      setPasswordNote('');
      setTwoFactorNote('');
      setCycle('monthly');
      setPrice('');
      setCurrency('USD');
      const d = new Date();
      d.setDate(d.getDate() + 30);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setNextBillingDate(`${yyyy}-${mm}-${dd}`);
      setPaymentMethod('');
      setPortalUrl('');
      setRechargeUrl('');
      setNotes('');
    }
  }, [initialData, isOpen]);

  const handleServiceChange = (key: string) => {
    setServiceKey(key);
    if (key === 'custom') return;
    const p = getPresetByKey(key);
    if (p) {
      if (!name || PRESET_SERVICES.some(s => s.name === name)) {
        setName(p.name);
      }
      setCategory(p.category);
      if (p.defaultPrice && !price) setPrice(String(p.defaultPrice));
      if (p.defaultCurrency) setCurrency(p.defaultCurrency);
      if (p.defaultCycle) setCycle(p.defaultCycle);
      if (p.portalUrl) setPortalUrl(p.portalUrl);
      if (p.rechargeUrl) setRechargeUrl(p.rechargeUrl);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData?.id,
      name: name.trim(),
      serviceKey: serviceKey || 'custom',
      category,
      accountEmail: accountEmail.trim(),
      passwordNote: passwordNote.trim() || undefined,
      twoFactorNote: twoFactorNote.trim() || undefined,
      cycle,
      price: parseFloat(price) || 0,
      currency,
      nextBillingDate,
      autoRenew: true,
      paymentMethod: paymentMethod.trim() || undefined,
      portalUrl: portalUrl.trim() || undefined,
      rechargeUrl: rechargeUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      history: initialData?.history || [],
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-[#EBEBEB] p-6 sm:p-7 shadow-2xl overflow-y-auto max-h-[92vh] text-[#222222] airbnb-card">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F2] text-[#FF385C] border border-[#FFCCD3] flex items-center justify-center shadow-2xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#222222]">
                {initialData ? '编辑订阅详情' : '新建订阅记录'}
              </h3>
              <p className="text-xs text-[#717171]">
                {initialData ? '修改账号、金额、到期时间与登录备忘' : '录入新的周期续费服务或账号'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-[#DDDDDD] hover:bg-[#F7F7F7] flex items-center justify-center text-[#717171] hover:text-[#222222] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          {/* Preset selector */}
          <div>
            <label className="block text-xs font-semibold text-[#222222] mb-1.5">
              快捷服务模板
            </label>
            <select
              value={serviceKey}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-3.5 text-xs font-medium text-[#222222] outline-none transition shadow-2xs"
            >
              <option value="custom">-- 自定义服务 (自行输入) --</option>
              {PRESET_SERVICES.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                服务名称 <span className="text-[#FF385C]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: ChatGPT Plus / Cursor / Netflix"
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-3.5 text-xs font-medium text-[#222222] outline-none transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                所属类别
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-3.5 text-xs font-medium text-[#222222] outline-none transition shadow-2xs"
              >
                <option value="ai">AI 智能模型</option>
                <option value="developer">开发工具与托管</option>
                <option value="server">服务器与网络</option>
                <option value="productivity">生产力办公</option>
                <option value="entertainment">影音娱乐</option>
                <option value="other">其他类别</option>
              </select>
            </div>
          </div>

          {/* Account credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                登录账号 / 邮箱
              </label>
              <input
                type="text"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-3.5 font-mono text-xs text-[#222222] outline-none transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                登录密码备忘 (本地强加密)
              </label>
              <input
                type="text"
                value={passwordNote}
                onChange={(e) => setPasswordNote(e.target.value)}
                placeholder="登录密码或安全提示"
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-3.5 font-mono text-xs text-[#222222] outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Pricing & Cycle */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                续费周期
              </label>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value as BillingCycle)}
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-2.5 text-xs text-[#222222] outline-none transition shadow-2xs"
              >
                <option value="monthly">按月付 (Monthly)</option>
                <option value="quarterly">按季度 (Quarterly)</option>
                <option value="semi-annually">半年付 (Semi-annual)</option>
                <option value="annually">按年付 (Annually)</option>
                <option value="prepaid">余额扣款 (Prepaid)</option>
                <option value="lifetime">买断制 (Lifetime)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                金额
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="20"
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-3 font-mono text-xs text-[#222222] outline-none transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                币种
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-2.5 text-xs text-[#222222] outline-none transition shadow-2xs"
              >
                <option value="USD">USD ($)</option>
                <option value="CNY">CNY (¥)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="EUR">EUR (€)</option>
                <option value="HKD">HKD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {/* Next Billing Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                下期扣费/续费日 <span className="text-[#FF385C]">*</span>
              </label>
              <input
                type="date"
                required
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-3 font-mono text-xs text-[#222222] outline-none transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                付款方式 / 充值渠道
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="例如: 美区 Apple 礼品卡 / 信用卡"
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-3 text-xs text-[#222222] outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Direct URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                官方管理后台 URL
              </label>
              <input
                type="text"
                value={portalUrl}
                onChange={(e) => setPortalUrl(e.target.value)}
                placeholder="https://..."
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-3 font-mono text-xs text-[#222222] outline-none transition shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#222222] mb-1.5">
                充值兑换直达 URL
              </label>
              <input
                type="text"
                value={rechargeUrl}
                onChange={(e) => setRechargeUrl(e.target.value)}
                placeholder="https://apps.apple.com/redeem"
                className="w-full h-11 bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl px-3 font-mono text-xs text-[#222222] outline-none transition shadow-2xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#222222] mb-1.5">
              备注备忘
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录家庭共享成员、绑定手机、订阅注意事项等..."
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] focus:border-[#222222] focus:bg-white rounded-xl p-3 text-xs text-[#222222] outline-none transition shadow-2xs"
            />
          </div>

          {/* Action buttons (Airbnb Style) */}
          <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB]">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(initialData.id);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl text-[#c13515] hover:bg-[#FFF0F2] text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除此订阅</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD] text-xs font-semibold transition"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl btn-rausch text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
              >
                <span>{initialData ? '保存修改' : '确认添加'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
