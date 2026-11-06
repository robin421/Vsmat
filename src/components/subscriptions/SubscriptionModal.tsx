import React, { useState, useEffect } from 'react';
import { X, CreditCard, Sparkles, ExternalLink } from 'lucide-react';
import { SubscriptionItem, BillingCycle, ServiceCategory } from '../../types';
import { PRESET_SERVICES, getPresetByKey } from '../../types/presets';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: Partial<SubscriptionItem>) => void;
  initialData?: SubscriptionItem | null;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [serviceKey, setServiceKey] = useState('openai');
  const [category, setCategory] = useState<ServiceCategory>('ai');
  const [accountEmail, setAccountEmail] = useState('');
  const [passwordNote, setPasswordNote] = useState('');
  const [twoFactorNote, setTwoFactorNote] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [price, setPrice] = useState('20');
  const [currency, setCurrency] = useState<'USD' | 'CNY' | 'EUR' | 'HKD' | 'GBP' | 'JPY'>('USD');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [portalUrl, setPortalUrl] = useState('');
  const [rechargeUrl, setRechargeUrl] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setServiceKey(initialData.serviceKey);
      setCategory(initialData.category);
      setAccountEmail(initialData.accountEmail);
      setPasswordNote(initialData.passwordNote || '');
      setTwoFactorNote(initialData.twoFactorNote || '');
      setCycle(initialData.cycle);
      setPrice(String(initialData.price));
      setCurrency(initialData.currency);
      setNextBillingDate(initialData.nextBillingDate);
      setPaymentMethod(initialData.paymentMethod || '');
      setPortalUrl(initialData.portalUrl || '');
      setRechargeUrl(initialData.rechargeUrl || '');
      setNotes(initialData.notes || '');
    } else {
      const p = getPresetByKey('openai');
      setName('ChatGPT Plus');
      setServiceKey('openai');
      setCategory('ai');
      setAccountEmail('vip_subscriber@gmail.com');
      setPasswordNote('ApplePass#2026');
      setTwoFactorNote('Google Authenticator');
      setCycle(p.defaultCycle || 'monthly');
      setPrice(String(p.defaultPrice || 20));
      setCurrency(p.defaultCurrency || 'USD');
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setNextBillingDate(d.toISOString().split('T')[0]);
      setPaymentMethod('美区 Apple ID / 礼品卡充值');
      setPortalUrl(p.portalUrl);
      setRechargeUrl(p.rechargeUrl);
      setNotes('');
    }
  }, [initialData, isOpen]);

  const handleServiceChange = (key: string) => {
    setServiceKey(key);
    const p = getPresetByKey(key);
    if (!initialData) {
      setName(p.name);
      setCategory(p.category);
      if (p.defaultPrice) setPrice(String(p.defaultPrice));
      if (p.defaultCurrency) setCurrency(p.defaultCurrency);
      if (p.defaultCycle) setCycle(p.defaultCycle);
      setPortalUrl(p.portalUrl);
      setRechargeUrl(p.rechargeUrl);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData?.id,
      name: name.trim(),
      serviceKey,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-subtle">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {initialData ? '编辑订阅与续费账号' : '添加新订阅与续费'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {/* Preset selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              预置服务模板
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

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                服务名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: ChatGPT Plus"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                所属类别
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle text-xs"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                登录账号 / 邮箱
              </label>
              <input
                type="text"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                登录密码备忘 (本地强加密)
              </label>
              <input
                type="text"
                value={passwordNote}
                onChange={(e) => setPasswordNote(e.target.value)}
                placeholder="密码提示或明文"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              />
            </div>
          </div>

          {/* Pricing & Cycle */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                续费周期
              </label>
              <select
                value={cycle}
                onChange={(e) => setCycle(e.target.value as BillingCycle)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              >
                <option value="monthly">按月 (Monthly)</option>
                <option value="quarterly">按季 (Quarterly)</option>
                <option value="semi-annually">半年付 (Semi-annual)</option>
                <option value="annually">按年 (Annually)</option>
                <option value="prepaid">余额充值型 (Prepaid)</option>
                <option value="lifetime">终身买断 (Lifetime)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                金额
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                币种
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-2.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                下期扣费/续费日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                付款方式 / 充值渠道
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="例如: 美区 Apple 礼品卡 / 虚拟卡"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              />
            </div>
          </div>

          {/* Direct URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                官方管理后台 URL
              </label>
              <input
                type="text"
                value={portalUrl}
                onChange={(e) => setPortalUrl(e.target.value)}
                placeholder="https://chatgpt.com/#settings/Account"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                充值兑换直达 URL
              </label>
              <input
                type="text"
                value={rechargeUrl}
                onChange={(e) => setRechargeUrl(e.target.value)}
                placeholder="https://apps.apple.com/redeem"
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 font-mono text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              备注备忘
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如: 该账号绑定的家庭共享信息、退订注意事项..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 shadow-subtle"
            />
          </div>

          {/* Action buttons */}
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
              保存订阅
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
