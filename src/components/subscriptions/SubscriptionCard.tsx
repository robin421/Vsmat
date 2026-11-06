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
  CreditCard,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionItem } from '../../types';
import { getDaysUntil } from '../../lib/notifications';
import { convertToUSD } from '../../lib/currencies';
import { BrandBadge } from '../common/BrandBadge';
import { safeHttpUrl } from '../../lib/url';

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

  const categoryLabelMap: Record<string, string> = {
    ai: 'AI 智能应用',
    developer: '开发工具平台',
    server: '服务器与网络',
    productivity: '生产力办公',
    entertainment: '流媒体娱乐',
    other: '订阅服务',
  };

  const rail = isOverdue ? 'bg-rose-600' : isToday ? 'bg-black' : isExpiringSoon ? 'bg-amber-500' : '';

  return (
    <div
      onClick={() => onEdit(subscription)}
      className="group relative rounded-2xl p-5 flex flex-col justify-between surface-card cursor-pointer"
    >
      {/* Status rail: the only place colour carries meaning on a card */}
      {rail && <span aria-hidden className={`absolute left-0 top-5 bottom-5 w-1 rounded-r-full ${rail}`} />}

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <BrandBadge serviceKey={subscription.serviceKey} name={subscription.name} size="md" />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-black tracking-tight leading-snug break-words" title={subscription.name}>
                {subscription.name}
              </h3>
              <span className="block text-xs text-muted mt-0.5">
                {categoryLabelMap[subscription.category] || '订阅服务'}
              </span>
            </div>
          </div>

          {/* Countdown & actions */}
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span
              className={`text-xs px-2 h-6 inline-flex items-center rounded-md font-semibold whitespace-nowrap font-mono mr-1 ${
                isOverdue
                  ? 'bg-rose-600 text-white'
                  : isToday
                  ? 'bg-black text-white'
                  : isExpiringSoon
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-inset text-ink-soft'
              }`}
            >
              {isOverdue
                ? `已逾期 ${Math.abs(days)} 天`
                : isToday
                ? '今日到期'
                : `还剩 ${days} 天`}
            </span>

            <button
              type="button"
              onClick={() => onEdit(subscription)}
              className="w-8 h-8 rounded-lg text-muted hover:text-black hover:bg-inset flex items-center justify-center transition-colors"
              title="编辑订阅"
              aria-label="编辑订阅"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-lg text-muted hover:text-black hover:bg-inset flex items-center justify-center transition-colors"
                title="更多操作"
                aria-label="更多操作"
                aria-expanded={showMenu}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-40 rounded-xl surface-pop p-1.5 z-20 text-sm animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      onEdit(subscription);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-inset text-ink font-medium flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted" />
                    <span>编辑详情</span>
                  </button>

                  {subscription.portalUrl && (
                    <a
                      href={safeHttpUrl(subscription.portalUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-inset text-ink font-medium flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-muted" />
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
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-700 font-medium flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除订阅</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ledger block: account · next billing · payment · password */}
        <div className="rounded-xl border border-line divide-y divide-line mb-4" onClick={(e) => e.stopPropagation()}>
          {/* Account (shown in full, never truncated) */}
          <div className="flex items-center justify-between gap-2 py-2.5 px-3.5 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
              <span
                className="font-mono text-[13px] text-ink select-all break-all leading-normal"
                title={subscription.accountEmail || '未录入账号'}
              >
                {subscription.accountEmail || (
                  <span className="text-muted font-normal font-sans text-xs inline-flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>未绑定账号（点击卡片可补充）</span>
                  </span>
                )}
              </span>
            </div>

            {subscription.accountEmail && (
              <button
                type="button"
                onClick={handleCopyEmail}
                className="h-7 px-2 rounded-md hover:bg-inset text-muted hover:text-black text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                title="一键复制完整账号"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>复制</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Next billing date and price */}
          <div className="flex items-center justify-between gap-3 py-3 px-3.5">
            <div className="flex items-center gap-2 text-xs text-muted whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>下期:</span>
              <span className="font-mono text-[13px] font-medium text-ink">{subscription.nextBillingDate}</span>
            </div>

            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-lg font-semibold text-black font-mono leading-none">
                  {subscription.currency} {subscription.price}
                </span>
                <span className="text-xs text-muted">/{cycleTextMap[subscription.cycle] || '期'}</span>
              </div>
              {subscription.currency !== 'USD' && (
                <div className="text-xs text-muted font-mono mt-1" title="按全局汇率折算">
                  ≈ ${convertToUSD(subscription.price, subscription.currency).toFixed(2)} USD
                </div>
              )}
            </div>
          </div>

          {/* Payment method & notes */}
          {(subscription.paymentMethod || subscription.notes) && (
            <div className="flex items-center justify-between gap-3 py-2.5 px-3.5 text-xs text-muted">
              {subscription.paymentMethod && (
                <span className="flex items-center gap-2 truncate" title={subscription.paymentMethod}>
                  <CreditCard className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{subscription.paymentMethod}</span>
                </span>
              )}
              {subscription.notes && (
                <span className="truncate max-w-[170px] text-right" title={subscription.notes}>
                  {subscription.notes}
                </span>
              )}
            </div>
          )}

          {/* Password */}
          {subscription.passwordNote && (
            <div className="flex items-center justify-between gap-2 py-2.5 px-3.5 text-sm">
              <span className="flex items-center gap-2 truncate font-mono text-[13px] text-ink">
                <Lock className="w-3.5 h-3.5 text-muted shrink-0" />
                <span className="truncate">{showPassword ? subscription.passwordNote : '••••••••••••'}</span>
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-7 h-7 rounded-md text-muted hover:text-black hover:bg-inset flex items-center justify-center transition-colors"
                  title={showPassword ? '隐藏密码' : '显示密码'}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="h-7 px-2 rounded-md hover:bg-inset text-muted hover:text-black flex items-center gap-1 text-xs font-medium transition-colors"
                >
                  {copiedPassword ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span className={copiedPassword ? 'text-emerald-700 font-semibold' : ''}>{copiedPassword ? '已复制' : '复制'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions: obsidian primary + outline secondary */}
      <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onQuickRecharge(subscription.serviceKey, subscription)}
          className="h-10 px-3 rounded-lg btn-primary font-semibold text-sm flex items-center justify-center gap-1.5"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>去充值</span>
        </button>

        <button
          type="button"
          onClick={handleRenew}
          className="h-10 px-3 rounded-lg bg-white hover:bg-inset border border-line-strong hover:border-ink text-black font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 active:scale-[0.985]"
        >
          <RefreshCw className="w-4 h-4 text-ink-soft" />
          <span>我已续费</span>
        </button>
      </div>
    </div>
  );
};
