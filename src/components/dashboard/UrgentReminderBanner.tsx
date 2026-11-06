import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  Clock
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
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-white/90 border border-black/[0.06] text-xs text-slate-600 gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-slate-700">未来 7 天内无临期待扣费项目，所有服务运转良好。</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadICalendarFile(subscriptions)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 transition flex items-center gap-1.5 font-semibold shadow-2xs active:scale-[0.98]"
            title="一键将全部订阅生成系统日历事件，导入 Mac/iPhone 闹钟"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
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
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 }
    });
    onMarkRenewed(subId);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-amber-500/[0.05] via-amber-500/[0.02] to-transparent border border-amber-200/80 p-4 sm:p-5 shadow-[0_2px_12px_rgba(245,158,11,0.06)] relative overflow-hidden">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100/90 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">充值与续费预警中心</h3>
              <span className="text-[11px] px-2 py-0.2 rounded-full bg-amber-100/90 text-amber-800 font-bold border border-amber-300/80">
                {urgentSubs.length} 项待处理
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              及时充值确保 API 与服务不断流。支持一键导出到系统日历，由 Mac / iPhone 提前 1 天和 3 天强力响铃提醒。
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => downloadICalendarFile(subscriptions)}
            className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 border border-slate-200/90 transition flex items-center gap-1.5 font-semibold shadow-2xs"
            title="把所有续费日程导入 Mac / iPhone 日历，提前1天和3天响铃提醒"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>一键同步日历闹钟 (.ics)</span>
          </button>

          <button
            onClick={handleEnableNotification}
            className="text-xs px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-700 border border-slate-200/90 transition flex items-center gap-1.5 font-semibold shadow-2xs"
            title="开启网页桌面系统通知"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>桌面通知</span>
          </button>
        </div>
      </div>

      {notificationStatus && (
        <div className="mt-2.5 py-1 px-3 rounded-lg bg-amber-100/80 border border-amber-200 text-xs text-amber-800 font-medium animate-fadeIn">
          {notificationStatus}
        </div>
      )}

      {/* Elegant Horizontal Urgent Items Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3.5">
        {urgentSubs.map(({ sub, days }) => {
          const isOverdue = days < 0;
          const isToday = days === 0;

          return (
            <div
              key={sub.id}
              className="rounded-xl bg-white border border-amber-200/70 p-3 shadow-2xs hover:shadow-subtle hover:border-amber-300 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <BrandBadge serviceKey={sub.serviceKey} name={sub.name} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">{sub.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ${
                        isOverdue
                          ? 'bg-red-100 text-red-700'
                          : isToday
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {isOverdue ? `逾期 ${Math.abs(days)}d` : isToday ? '今天扣费' : `还剩 ${days}d`}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                    {sub.currency} {sub.price} · {sub.nextBillingDate}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenRechargeWithService(sub.serviceKey, sub)}
                  className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 active:scale-95 text-blue-700 text-[11px] font-semibold border border-blue-200/60 transition flex items-center gap-1"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>去充值</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRenewClick(sub.id)}
                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 text-[11px] font-semibold border border-emerald-200/60 transition flex items-center gap-1"
                  title="顺延续费一个周期"
                >
                  <RefreshCw className="w-3 h-3 text-emerald-600" />
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
