import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  Clock,
  AlertCircle
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

  // Filter subscriptions expiring within 7 days or overdue
  const urgentSubs = subscriptions
    .map(sub => ({ sub, days: getDaysUntil(sub.nextBillingDate) }))
    .filter(item => item.days <= 7)
    .sort((a, b) => a.days - b.days);

  if (urgentSubs.length === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-white border border-zinc-200/80 text-xs text-zinc-600 gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-zinc-800">未来 7 天内无临期待续费项目，所有周期服务运转正常。</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadICalendarFile(subscriptions)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200/90 transition flex items-center gap-1.5 font-medium shadow-2xs active:scale-[0.98]"
            title="一键将全部订阅生成系统日历事件，导入 Mac / iPhone 闹钟"
          >
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
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
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 }
    });
    onMarkRenewed(subId);
  };

  return (
    <div className="rounded-2xl bg-white border border-zinc-200/80 p-4 sm:p-5 shadow-2xs relative">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center shrink-0 shadow-2xs">
            <AlertCircle className="w-4 h-4 text-zinc-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-950 tracking-tight">充值与续费提醒</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 font-medium border border-zinc-200">
                {urgentSubs.length} 项待处理
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              及时充值确保 API 与服务正常运转。支持导出至系统日历设置 Mac / iPhone 响铃提醒。
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => downloadICalendarFile(subscriptions)}
            className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 active:scale-[0.98] text-zinc-700 border border-zinc-200/90 transition flex items-center gap-1.5 font-medium shadow-2xs"
            title="把所有续费日程导入 Mac / iPhone 日历，提前1天和3天响铃提醒"
          >
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>一键同步日历 (.ics)</span>
          </button>

          <button
            onClick={handleEnableNotification}
            className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 active:scale-[0.98] text-zinc-700 border border-zinc-200/90 transition flex items-center gap-1.5 font-medium shadow-2xs"
            title="开启网页桌面系统通知"
          >
            <Bell className="w-3.5 h-3.5 text-zinc-500" />
            <span>桌面通知</span>
          </button>
        </div>
      </div>

      {notificationStatus && (
        <div className="mt-2.5 py-1 px-3 rounded-lg bg-zinc-100 border border-zinc-200 text-xs text-zinc-800 font-medium animate-fadeIn">
          {notificationStatus}
        </div>
      )}

      {/* Horizontal Urgent Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3.5">
        {urgentSubs.map(({ sub, days }) => {
          const isOverdue = days < 0;
          const isToday = days === 0;

          return (
            <div
              key={sub.id}
              className="rounded-xl bg-zinc-50 border border-zinc-200/60 p-3 shadow-2xs hover:border-zinc-300 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <BrandBadge serviceKey={sub.serviceKey} name={sub.name} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900 truncate">{sub.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-medium shrink-0 ${
                        isOverdue
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : isToday
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-900 text-white'
                      }`}
                    >
                      {isOverdue ? `已逾期 ${Math.abs(days)}d` : isToday ? '今日到期' : `还剩 ${days}d`}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-500 truncate mt-0.5">
                    {sub.currency} {sub.price} · {sub.nextBillingDate}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenRechargeWithService(sub.serviceKey, sub)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 active:scale-95 text-zinc-800 text-[11px] font-medium border border-zinc-200/80 transition flex items-center gap-1 shadow-2xs"
                >
                  <ArrowUpRight className="w-3 h-3 text-zinc-500" />
                  <span>去充值</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRenewClick(sub.id)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-white text-[11px] font-medium transition flex items-center gap-1 shadow-2xs"
                  title="顺延续费一个周期"
                >
                  <RefreshCw className="w-3 h-3 text-zinc-300" />
                  <span>已续费</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
