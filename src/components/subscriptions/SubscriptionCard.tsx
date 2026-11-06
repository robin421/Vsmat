import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Copy, Check, ExternalLink, RefreshCw, Edit2, Trash2, Calendar, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionItem } from '../../types';
import { getPresetByKey } from '../../types/presets';
import { getDaysUntil } from '../../lib/notifications';

interface SubscriptionCardProps {
  subscription: SubscriptionItem;
  onEdit: (sub: SubscriptionItem) => void;
  onDelete: (id: string) => void;
  onMarkRenewed: (id: string) => void;
  onQuickRecharge: (serviceKey: string, sub?: SubscriptionItem) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete,
  onMarkRenewed,
  onQuickRecharge,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const preset = getPresetByKey(subscription.serviceKey);
  const days = getDaysUntil(subscription.nextBillingDate);
  const isOverdue = days < 0;
  const isToday = days === 0;
  const isExpiringSoon = days > 0 && days <= 7;

  const handleCopyEmail = async () => {
    if (!subscription.accountEmail) return;
    try {
      await navigator.clipboard.writeText(subscription.accountEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {}
  };

  const handleCopyPassword = async () => {
    if (!subscription.passwordNote) return;
    try {
      await navigator.clipboard.writeText(subscription.passwordNote);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch {}
  };

  const handleRenew = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
    onMarkRenewed(subscription.id);
  };

  const cycleTextMap: Record<string, string> = {
    monthly: '月',
    quarterly: '季',
    'semi-annually': '半年',
    annually: '年',
    prepaid: '按量',
    lifetime: '终身',
  };

  return (
    <div className={`relative rounded-2xl border transition bg-white p-5 shadow-subtle hover:shadow-elevated flex flex-col justify-between ${
      isOverdue
        ? 'border-red-300 ring-1 ring-red-100'
        : isToday
        ? 'border-amber-300 ring-1 ring-amber-100'
        : 'border-slate-200/90'
    }`}>
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border bg-slate-100 text-slate-800 border-slate-200 shadow-subtle shrink-0">
              {subscription.name.slice(0, 1)}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {subscription.name}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                <span className="truncate">{subscription.accountEmail || '未录入账号'}</span>
                {subscription.accountEmail && (
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="hover:text-blue-600 text-slate-400 p-0.5"
                    title="复制账号"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Days Remaining Pill */}
          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${
                isOverdue
                  ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                  : isToday
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                  : isExpiringSoon
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {isOverdue
                ? `逾期 ${Math.abs(days)} 天`
                : isToday
                ? '今日到期'
                : `还剩 ${days} 天`}
            </span>

            {/* Overflow Action Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                title="更多操作"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-slate-200 p-1 shadow-xl z-20 text-xs">
                  <button
                    onClick={() => {
                      onEdit(subscription);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>编辑详情</span>
                  </button>

                  {subscription.portalUrl && (
                    <a
                      href={subscription.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span>官方后台</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      onDelete(subscription.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除订阅</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clean Middle Strip: Date & Price (Apple Passwords Style) */}
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50/80 border border-slate-200/80 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>下期续费:</span>
            <span className="font-semibold text-slate-800 font-mono">{subscription.nextBillingDate}</span>
          </div>

          <div className="text-right">
            <span className="text-sm font-bold text-slate-900 font-mono">
              {subscription.currency} {subscription.price}
            </span>
            <span className="text-xs text-slate-500 ml-0.5">/{cycleTextMap[subscription.cycle] || '期'}</span>
          </div>
        </div>

        {/* Password Strip (Minimalist, only shown if present) */}
        {subscription.passwordNote && (
          <div className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50/50 border border-slate-200/60 mb-3 font-mono text-slate-600">
            <span className="flex items-center gap-1.5 truncate">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{showPassword ? subscription.passwordNote : '••••••••••••'}</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="hover:text-blue-600 text-slate-500 flex items-center gap-1 font-sans text-[11px]"
              >
                {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPassword ? '已复制' : '复制密码'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Buttons (Spacious & Clean) */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onQuickRecharge(subscription.serviceKey, subscription)}
          className="h-9 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-blue-200/70 shadow-subtle active:scale-95"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>去充值</span>
        </button>

        <button
          type="button"
          onClick={handleRenew}
          className="h-9 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-emerald-200/70 shadow-subtle active:scale-95"
          title="点击将下期扣费时间自动往后顺延一个周期"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>我已续费</span>
        </button>
      </div>
    </div>
  );
};
