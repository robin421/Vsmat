import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Edit2,
  Trash2,
  Calendar,
  MoreHorizontal,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionItem } from '../../types';
import { getDaysUntil } from '../../lib/notifications';
import { BrandBadge } from '../common/BrandBadge';

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
    <div
      className={`group relative rounded-2xl bg-white p-5 flex flex-col justify-between transition-all duration-200 card-ambient border ${
        isOverdue
          ? 'border-red-300 ring-2 ring-red-100'
          : isToday
          ? 'border-amber-300 ring-2 ring-amber-100'
          : isExpiringSoon
          ? 'border-amber-200 ring-1 ring-amber-100/50'
          : 'border-black/[0.06] hover:border-black/[0.12]'
      }`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <BrandBadge serviceKey={subscription.serviceKey} name={subscription.name} size="md" />
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 tracking-tight truncate leading-snug">
                {subscription.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-0.5">
                <span className="truncate max-w-[170px] sm:max-w-[210px]">{subscription.accountEmail || '未录入账号'}</span>
                {subscription.accountEmail && (
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="hover:text-blue-600 text-slate-400 p-0.5 transition"
                    title="复制账号"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Days Remaining Pill & Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`text-xs px-2.5 py-0.8 rounded-full font-bold whitespace-nowrap font-mono tracking-tight ${
                isOverdue
                  ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                  : isToday
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                  : isExpiringSoon
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-100/80 text-slate-600 border border-slate-200/60'
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
                <div className="absolute right-0 mt-1 w-36 rounded-2xl bg-white/95 backdrop-blur-xl border border-black/[0.08] p-1.5 shadow-xl z-20 text-xs animate-fadeIn">
                  <button
                    onClick={() => {
                      onEdit(subscription);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>编辑详情</span>
                  </button>

                  {subscription.portalUrl && (
                    <a
                      href={subscription.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2"
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
                    className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除订阅</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clean Middle Strip: Date & Price */}
        <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-50/90 border border-black/[0.04] mb-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-400 font-normal">下期:</span>
            <span className="font-semibold text-slate-800 font-mono tracking-tight">{subscription.nextBillingDate}</span>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-slate-900 font-mono">
              {subscription.currency} {subscription.price}
            </span>
            <span className="text-xs text-slate-400 font-medium ml-1">/{cycleTextMap[subscription.cycle] || '期'}</span>
          </div>
        </div>

        {/* Password Strip (Minimalist Vault Style) */}
        {subscription.passwordNote && (
          <div className="flex items-center justify-between text-xs py-1.5 px-3.5 rounded-xl bg-slate-50/50 border border-black/[0.03] mb-3 font-mono text-slate-600">
            <span className="flex items-center gap-1.5 truncate">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{showPassword ? subscription.passwordNote : '••••••••••••'}</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="hover:text-blue-600 text-slate-500 flex items-center gap-1 font-sans text-[11px] transition"
              >
                {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPassword ? '已复制' : '复制密码'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dual Action Buttons (High Finish & Tactile Click) */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onQuickRecharge(subscription.serviceKey, subscription)}
          className="h-9 px-3 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-blue-200/70 shadow-2xs active:scale-[0.98]"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>去充值</span>
        </button>

        <button
          type="button"
          onClick={handleRenew}
          className="h-9 px-3 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 text-emerald-800 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-emerald-200/70 shadow-2xs active:scale-[0.98]"
          title="点击将下期扣费时间自动往后顺延一个周期"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>我已续费</span>
        </button>
      </div>
    </div>
  );
};
