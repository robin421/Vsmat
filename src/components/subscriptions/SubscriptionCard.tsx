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
  onMarkRenewed: (id: string) => boolean;
  onQuickRecharge: (serviceKey: string, sub?: SubscriptionItem) => void;
  usdToCnyRate?: number;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete,
  onMarkRenewed,
  onQuickRecharge,
  usdToCnyRate,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isLifetime = subscription.cycle === 'lifetime';
  const days = getDaysUntil(subscription.nextBillingDate);
  const isOverdue = !isLifetime && days < 0;
  const isToday = !isLifetime && days === 0;
  const isExpiringSoon = !isLifetime && days > 0 && days <= 7;

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
    if (!onMarkRenewed(subscription.id)) return;
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
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

  const isUrgent = isOverdue || isToday || isExpiringSoon;
  const copyButton = 'h-7 px-1.5 rounded-md hover:bg-inset text-muted hover:text-ink text-xs font-medium flex items-center gap-1 transition-colors shrink-0';

  return (
    <div
      onClick={() => onEdit(subscription)}
      className="group relative cursor-pointer bg-white rounded-2xl shadow-card p-4 flex flex-col gap-3 row:grid row:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)_minmax(0,1fr)_6.5rem_16.5rem] row:items-center row:gap-5 row:px-5 row:py-4 row:bg-transparent row:shadow-none row:rounded-none row:first:rounded-t-2xl row:last:rounded-b-2xl row:hover:bg-canvas/70 transition-colors"
    >
      {/* Service */}
      <div className="flex items-center gap-3 min-w-0 pr-16 row:pr-0">
        <BrandBadge serviceKey={subscription.serviceKey} name={subscription.name} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-ink tracking-tight leading-snug truncate" title={subscription.name}>
            {subscription.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-1.5 h-5 inline-flex items-center rounded-md font-semibold whitespace-nowrap ${
                isOverdue
                  ? 'bg-rose-50 text-rose-700'
                  : isToday
                  ? 'bg-ink text-white'
                  : isExpiringSoon
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-inset text-muted'
              }`}
            >
              {isLifetime
                ? '买断'
                : isOverdue
                ? `已逾期 ${Math.abs(days)} 天`
                : isToday
                ? '今日到期'
                : `还剩 ${days} 天`}
            </span>
            <span className="text-xs text-muted truncate">
              {categoryLabelMap[subscription.category] || '订阅服务'}
            </span>
          </div>
        </div>
      </div>

      {/* Credentials */}
      <div className="min-w-0 text-[13px] text-ink-soft" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 min-h-7">
          <span className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 text-subtle shrink-0" />
            <span className="break-all select-all" title={subscription.accountEmail || '未录入账号'}>
              {subscription.accountEmail || (
                <span className="text-muted text-xs inline-flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>未绑定账号（点击卡片可补充）</span>
                </span>
              )}
            </span>
          </span>
          {subscription.accountEmail && (
            <button type="button" onClick={handleCopyEmail} className={copyButton} title="一键复制完整账号" aria-label="一键复制完整账号">
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className={`row:hidden ${copiedEmail ? 'text-emerald-700 font-semibold' : ''}`}>{copiedEmail ? '已复制' : '复制'}</span>
            </button>
          )}
        </div>

        {subscription.passwordNote && (
          <div className="flex items-center justify-between gap-2 min-h-7">
            <span className="flex items-center gap-2 min-w-0">
              <Lock className="w-3.5 h-3.5 text-subtle shrink-0" />
              <span className="truncate">{showPassword ? subscription.passwordNote : '••••••••••••'}</span>
            </span>
            <span className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-7 h-7 rounded-md text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition-colors"
                title={showPassword ? '隐藏密码' : '显示密码'}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button type="button" onClick={handleCopyPassword} className={copyButton} title="复制" aria-label="复制密码">
                {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className={`row:hidden ${copiedPassword ? 'text-emerald-700 font-semibold' : ''}`}>{copiedPassword ? '已复制' : '复制'}</span>
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Billing: date + channel, then price */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-line row:contents">
        <div className="min-w-0 text-[13px]">
          <div className="flex items-center gap-1.5 whitespace-nowrap text-muted">
            <Calendar className="w-3.5 h-3.5 text-subtle shrink-0" />
            <span>下期:</span>
            <span className="font-medium text-ink">{isLifetime ? '无需续费' : subscription.nextBillingDate}</span>
          </div>
          {(subscription.paymentMethod || subscription.notes) && (
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted min-w-0">
              {subscription.paymentMethod && (
                <>
                  <CreditCard className="w-3.5 h-3.5 text-subtle shrink-0" />
                  <span className="truncate" title={subscription.paymentMethod}>{subscription.paymentMethod}</span>
                </>
              )}
              {subscription.notes && (
                <span className="truncate text-subtle" title={subscription.notes}>{subscription.notes}</span>
              )}
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end gap-0.5 whitespace-nowrap">
            <span className="text-[17px] font-bold text-ink tracking-tight leading-none">
              {subscription.currency} {subscription.price}
            </span>
            <span className="text-xs text-muted">/{cycleTextMap[subscription.cycle] || '期'}</span>
          </div>
          {subscription.currency !== 'USD' && (
            <div className="text-xs text-muted mt-1 whitespace-nowrap" title="按全局汇率折算">
              ≈ ${convertToUSD(subscription.price, subscription.currency, usdToCnyRate).toFixed(2)} USD
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 row:flex row:items-center row:justify-end" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onQuickRecharge(subscription.serviceKey, subscription)}
          className={`h-9 px-3 rounded-lg font-semibold text-[13px] flex items-center justify-center gap-1 whitespace-nowrap transition-colors active:scale-[0.985] ${isLifetime ? 'col-span-2' : ''} ${
            isUrgent ? 'btn-primary' : 'bg-brand-50 hover:bg-brand-100 text-brand-700'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>去充值</span>
        </button>

        {!isLifetime && (
          <button
            type="button"
            onClick={handleRenew}
            className="h-9 px-3 rounded-lg bg-inset hover:bg-line text-ink-soft font-semibold text-[13px] transition-colors flex items-center justify-center gap-1 whitespace-nowrap active:scale-[0.985]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>我已续费</span>
          </button>
        )}

        <div className="absolute top-3 right-3 row:static flex items-center">
          <button
            type="button"
            onClick={() => onEdit(subscription)}
            className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition-colors"
            title="编辑订阅"
            aria-label="编辑订阅"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-lg text-muted hover:text-ink hover:bg-inset flex items-center justify-center transition-colors"
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
    </div>
  );
};
