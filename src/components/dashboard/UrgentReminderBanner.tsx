import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { SubscriptionItem } from '../../types';
import { getDaysUntil, requestNotificationPermission, checkAndSendRenewalNotifications } from '../../lib/notifications';
import { downloadICalendarFile } from '../../lib/calendar';
import { BrandBadge } from '../common/BrandBadge';
import confetti from 'canvas-confetti';

interface UrgentReminderBannerProps {
  subscriptions: SubscriptionItem[];
  onMarkRenewed: (subId: string) => void;
  onOpenRechargeWithService: (serviceKey: string, sub?: SubscriptionItem) => void;
}

export const UrgentReminderBanner: React.FC<UrgentReminderBannerProps> = ({
  subscriptions,
  onMarkRenewed,
  onOpenRechargeWithService,
}) => {
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const urgentSubs = subscriptions
    .map(sub => ({ sub, days: getDaysUntil(sub.nextBillingDate) }))
    .filter(item => item.days <= 7)
    .sort((a, b) => a.days - b.days);

  if (urgentSubs.length === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-white border border-line text-xs text-muted gap-3 surface-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[999px] bg-inset border border-line text-ink flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-ink" />
          </div>
          <span className="font-medium text-ink">AirCover 智能守护中：未来 7 天内无临期待续费项目，所有服务运转良好。</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadICalendarFile(subscriptions)}
            className="h-9 px-3.5 rounded-lg bg-white hover:bg-inset active:scale-[0.985] text-ink border border-line-strong hover:border-ink transition-colors flex items-center gap-1.5 font-semibold text-sm"
            title="一键将全部订阅生成系统日历事件，导入 Mac / iPhone 闹钟"
          >
            <Calendar className="w-3.5 h-3.5 text-ink" />
            <span>导出到系统日历 (.ics)</span>
          </button>
        </div>
      </div>
    );
  }

  const handleEnableNotification = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationStatus('已开启系统桌面通知权限！');
      checkAndSendRenewalNotifications(subscriptions);
      setTimeout(() => setNotificationStatus(null), 4000);
    } else {
      setNotificationStatus('请在浏览器地址栏允许通知权限');
      setTimeout(() => setNotificationStatus(null), 4000);
    }
  };

  const handleRenewClick = (subId: string) => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
    onMarkRenewed(subId);
  };

  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 sm:p-6 shadow-card relative">
      {/* Top Header Row (Airbnb AirCover Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-ink tracking-tight">充值与续费提醒</h3>
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-600 text-white font-semibold whitespace-nowrap">
                {urgentSubs.length} 项待处理
              </span>
            </div>
            <p className="text-sm text-muted mt-0.5 max-w-xl">
              及时充值确保 API 与服务正常运转。支持导出至系统日历设置 Mac / iPhone 强力响铃提醒。
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => downloadICalendarFile(subscriptions)}
            className="h-9 px-3.5 rounded-lg bg-white hover:bg-inset active:scale-[0.985] text-ink border border-line-strong hover:border-ink transition-colors flex items-center gap-1.5 font-semibold text-sm"
            title="把所有续费日程导入 Mac / iPhone 日历，提前1天和3天响铃提醒"
          >
            <Calendar className="w-3.5 h-3.5 text-ink" />
            <span>一键同步日历 (.ics)</span>
          </button>

          <button
            onClick={handleEnableNotification}
            className="h-9 px-3.5 rounded-lg bg-white hover:bg-inset active:scale-[0.985] text-ink border border-line-strong hover:border-ink transition-colors flex items-center gap-1.5 font-semibold text-sm"
            title="开启网页桌面系统通知"
          >
            <Bell className="w-3.5 h-3.5 text-ink" />
            <span>桌面通知</span>
          </button>
        </div>
      </div>

      {notificationStatus && (
        <div className="mt-3 py-1.5 px-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold animate-fadeIn">
          {notificationStatus}
        </div>
      )}

      {/* Horizontal Urgent Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
        {urgentSubs.map(({ sub, days }) => {
          const isOverdue = days < 0;
          const isToday = days === 0;

          return (
            <div
              key={sub.id}
              className={`rounded-xl bg-white border border-amber-200 border-l-[3px] p-3.5 flex flex-col gap-3 ${
                isOverdue ? 'border-l-rose-600' : isToday ? 'border-l-ink' : 'border-l-amber-500'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <BrandBadge serviceKey={sub.serviceKey} name={sub.name} size="sm" />
                <span className="text-sm font-semibold text-ink truncate flex-1 min-w-0" title={sub.name}>{sub.name}</span>
                <span
                  className={`text-xs font-mono px-1.5 h-5 inline-flex items-center rounded-md font-semibold shrink-0 whitespace-nowrap ${
                    isOverdue
                      ? 'bg-rose-600 text-white'
                      : isToday
                      ? 'bg-ink text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isOverdue ? `已逾期 ${Math.abs(days)}d` : isToday ? '今日到期' : `还剩 ${days}d`}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
                <p className="text-xs font-mono text-muted whitespace-nowrap">
                  {sub.currency} {sub.price} · {sub.nextBillingDate}
                </p>
                <div className="grid grid-cols-2 sm:flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenRechargeWithService(sub.serviceKey, sub)}
                    className="h-8 px-2.5 rounded-lg bg-white hover:bg-inset active:scale-95 text-ink text-xs font-semibold border border-line-strong transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                  >
                    <ArrowUpRight className="w-3 h-3 text-muted" />
                    <span>去充值</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRenewClick(sub.id)}
                    className="h-8 px-2.5 rounded-lg btn-primary text-xs font-semibold flex items-center justify-center gap-1 whitespace-nowrap"
                    title="顺延续费一个周期"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>已续费</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
