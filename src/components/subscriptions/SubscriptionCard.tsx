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
  ArrowUpRight,
  CreditCard
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

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!subscription.accountEmail) return;
    try {
      await navigator.clipboard.writeText(subscription.accountEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {}
  };

  const handleCopyPassword = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!subscription.passwordNote) return;
    try {
      await navigator.clipboard.writeText(subscription.passwordNote);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    } catch {}
  };

  const handleRenew = (e: React.MouseEvent) => {
    e.stopPropagation();
    confetti({
      particleCount: 30,
      spread: 50,
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
      onClick={() => onEdit(subscription)}
      className={`group relative rounded-2xl bg-white p-5 flex flex-col justify-between transition-all duration-200 card-ambient border cursor-pointer ${
        isOverdue
          ? 'border-red-300 ring-1 ring-red-100'
          : isExpiringSoon || isToday
          ? 'border-zinc-300 ring-1 ring-zinc-200/50'
          : 'border-zinc-200/80 hover:border-zinc-300 hover:shadow-subtle'
      }`}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <BrandBadge serviceKey={subscription.serviceKey} name={subscription.name} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-zinc-950 tracking-tight truncate leading-snug">
                  {subscription.name}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono mt-0.5">
                <span className="truncate max-w-[160px] sm:max-w-[200px]">{subscription.accountEmail || '未录入账号'}</span>
                {subscription.accountEmail && (
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="hover:text-zinc-900 text-zinc-400 p-0.5 transition"
                    title="复制账号"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-zinc-800" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Days Remaining Pill & Actions */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap font-mono tracking-tight ${
                isOverdue
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : isToday
                  ? 'bg-zinc-900 text-white font-semibold'
                  : isExpiringSoon
                  ? 'bg-zinc-900 text-white font-medium'
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200/70'
              }`}
            >
              {isOverdue
                ? `已逾期 ${Math.abs(days)} 天`
                : isToday
                ? '今日到期'
                : `还剩 ${days} 天`}
            </span>

            {/* Direct Edit Button */}
            <button
              type="button"
              onClick={() => onEdit(subscription)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition"
              title="编辑订阅"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Overflow Action Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition"
                title="更多操作"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-zinc-200 p-1.5 shadow-xl z-20 text-xs animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      onEdit(subscription);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-800 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>编辑详情</span>
                  </button>

                  {subscription.portalUrl && (
                    <a
                      href={subscription.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-800 flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                      <span>官方后台</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`确定要删除订阅「${subscription.name}」吗？`)) {
                        onDelete(subscription.id);
                      }
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

        {/* Clean Middle Strip: Date & Price */}
        <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium whitespace-nowrap">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-zinc-400 font-normal">下期:</span>
            <span className="font-semibold text-zinc-900 font-mono tracking-tight">{subscription.nextBillingDate}</span>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-zinc-950 font-mono">
              {subscription.currency} {subscription.price}
            </span>
            <span className="text-xs text-zinc-400 font-medium ml-1">/{cycleTextMap[subscription.cycle] || '期'}</span>
          </div>
        </div>

        {/* Payment Method & Notes (if any) */}
        {(subscription.paymentMethod || subscription.notes) && (
          <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500 mb-2.5 px-1 truncate">
            {subscription.paymentMethod && (
              <span className="flex items-center gap-1 truncate text-zinc-500">
                <CreditCard className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate">{subscription.paymentMethod}</span>
              </span>
            )}
            {subscription.notes && (
              <span className="text-zinc-400 truncate max-w-[150px]" title={subscription.notes}>
                {subscription.notes}
              </span>
            )}
          </div>
        )}

        {/* Password Strip (Minimalist Vault Style) */}
        {subscription.passwordNote && (
          <div
            className="flex items-center justify-between text-xs py-1.5 px-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/50 mb-3 font-mono text-zinc-600"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="flex items-center gap-1.5 truncate">
              <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{showPassword ? subscription.passwordNote : '••••••••••••'}</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-zinc-400 hover:text-zinc-700 transition"
                title={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="hover:text-zinc-900 text-zinc-500 flex items-center gap-1 font-sans text-[11px] transition"
              >
                {copiedPassword ? <Check className="w-3.5 h-3.5 text-zinc-800" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPassword ? '已复制' : '复制密码'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dual Action Buttons (Restrained Monochrome Aesthetic) */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onQuickRecharge(subscription.serviceKey, subscription)}
          className="h-9 px-3 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-xs transition flex items-center justify-center gap-1.5 border border-zinc-200/90 shadow-2xs active:scale-[0.98]"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600" />
          <span>去充值</span>
        </button>

        <button
          type="button"
          onClick={handleRenew}
          className="h-9 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white font-medium text-xs transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98]"
          title="点击将下期扣费时间自动往后顺延一个周期"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />
          <span>我已续费</span>
        </button>
      </div>
    </div>
  );
};
