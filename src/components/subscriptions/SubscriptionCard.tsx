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

  return (
    <div
      onClick={() => onEdit(subscription)}
      className={`group relative rounded-3xl bg-white p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 airbnb-card border cursor-pointer ${
        isOverdue
          ? 'border-rose-300 ring-1 ring-rose-400/20'
          : isExpiringSoon || isToday
          ? 'border-amber-300'
          : 'border-[#EBEBEB] hover:border-[#222222]'
      }`}
    >
      <div>
        {/* Top Header Row (Executive Business Style) */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <BrandBadge serviceKey={subscription.serviceKey} name={subscription.name} size="md" />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-[#000000] tracking-tight leading-snug break-words" title={subscription.name}>
                {subscription.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-medium text-[#717171]">
                  {categoryLabelMap[subscription.category] || '订阅服务'}
                </span>
              </div>
            </div>
          </div>

          {/* Days Remaining Pill & Actions */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap font-mono tracking-tight ${
                isOverdue
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : isToday
                  ? 'bg-[#000000] text-white'
                  : isExpiringSoon
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD]'
              }`}
            >
              {isOverdue
                ? `已逾期 ${Math.abs(days)} 天`
                : isToday
                ? '今日到期'
                : `还剩 ${days} 天`}
            </span>

            {/* Circular Edit Button */}
            <button
              type="button"
              onClick={() => onEdit(subscription)}
              className="w-8 h-8 rounded-full text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] flex items-center justify-center transition"
              title="编辑订阅"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            {/* Overflow Action Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] flex items-center justify-center transition"
                title="更多操作"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 mt-1 w-36 rounded-2xl bg-white border border-[#EBEBEB] p-2 airbnb-card z-20 text-xs animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      onEdit(subscription);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F7F7F7] text-[#222222] font-medium flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#717171]" />
                    <span>编辑详情</span>
                  </button>

                  {subscription.portalUrl && (
                    <a
                      href={safeHttpUrl(subscription.portalUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F7F7F7] text-[#222222] font-medium flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#000000]" />
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
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 font-medium flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除订阅</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* Full-width Dedicated Account Email Strip (100% 完整显示账号，绝不截断) */}
        {/* ========================================================= */}
        <div
          className="flex items-center justify-between py-2 px-3 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] mb-3 text-xs font-mono text-[#222222] group/account hover:border-[#DDDDDD] transition"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Mail className="w-3.5 h-3.5 text-[#717171] shrink-0" />
            <span
              className="font-medium text-[#222222] select-all break-all leading-normal"
              title={subscription.accountEmail || '未录入账号'}
            >
              {subscription.accountEmail || (
                <span className="text-[#888888] font-normal italic font-sans text-[11px] flex items-center gap-1">
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
              className="h-6 px-2 rounded-lg bg-white border border-[#DDDDDD] hover:border-[#222222] text-[#717171] hover:text-[#222222] text-[11px] font-sans font-medium flex items-center gap-1 transition shrink-0 shadow-2xs"
              title="一键复制完整账号"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">已复制</span>
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

        {/* Clean Middle Strip: Date & Price */}
        <div className="flex items-center justify-between py-3 px-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] mb-3">
          <div className="flex items-center gap-1.5 text-xs text-[#717171] font-medium whitespace-nowrap">
            <Calendar className="w-4 h-4 text-[#000000] shrink-0" />
            <span>下期:</span>
            <span className="font-bold text-[#000000] font-mono tracking-tight">{subscription.nextBillingDate}</span>
          </div>

          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-base font-extrabold text-[#000000] font-mono">
                {subscription.currency} {subscription.price}
              </span>
              <span className="text-xs text-[#717171] font-medium">/{cycleTextMap[subscription.cycle] || '期'}</span>
            </div>
            {subscription.currency !== 'USD' && (
              <div className="text-[10px] text-[#717171] font-mono tracking-tight mt-0.5" title="按全局汇率折算">
                ≈ ${convertToUSD(subscription.price, subscription.currency).toFixed(2)} USD
              </div>
            )}
          </div>
        </div>

        {/* Payment Method & Notes (if any) */}
        {(subscription.paymentMethod || subscription.notes) && (
          <div className="flex items-center justify-between gap-2 text-[11px] text-[#717171] mb-3 px-1">
            {subscription.paymentMethod && (
              <span className="flex items-center gap-1 truncate text-[#717171]" title={subscription.paymentMethod}>
                <CreditCard className="w-3 h-3 text-[#717171] shrink-0" />
                <span className="truncate">{subscription.paymentMethod}</span>
              </span>
            )}
            {subscription.notes && (
              <span className="text-[#717171] truncate max-w-[170px] text-right" title={subscription.notes}>
                {subscription.notes}
              </span>
            )}
          </div>
        )}

        {/* Password Strip (Airbnb Vault Style) */}
        {subscription.passwordNote && (
          <div
            className="flex items-center justify-between text-xs py-2 px-3 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] mb-3.5 font-mono text-[#222222]"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="flex items-center gap-1.5 truncate">
              <Lock className="w-3.5 h-3.5 text-[#717171] shrink-0" />
              <span className="truncate">{showPassword ? subscription.passwordNote : '••••••••••••'}</span>
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#717171] hover:text-[#222222] transition"
                title={showPassword ? '隐藏密码' : '显示密码'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="h-6 px-2 rounded-lg bg-white border border-[#DDDDDD] hover:border-[#222222] text-[#717171] hover:text-[#222222] flex items-center gap-1 font-sans text-[11px] font-medium transition shadow-2xs"
              >
                {copiedPassword ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPassword ? '已复制' : '复制'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dual Action Buttons (Executive Monochrome Primary + Crisp Outline) */}
      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-[#EBEBEB]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onQuickRecharge(subscription.serviceKey, subscription)}
          className="h-10 px-3 rounded-xl bg-[#000000] hover:bg-[#222222] text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
          <span>去充值</span>
        </button>

        <button
          type="button"
          onClick={handleRenew}
          className="h-10 px-3 rounded-xl bg-white hover:bg-[#F7F7F7] border border-[#DDDDDD] hover:border-[#000000] text-[#000000] font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#555555]" />
          <span>我已续费</span>
        </button>
      </div>
    </div>
  );
};
