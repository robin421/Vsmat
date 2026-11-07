import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { SubscriptionItem } from '../../types';
import { getDaysUntil, requestNotificationPermission, checkAndSendRenewalNotifications } from '../../lib/notifications';
import { downloadICalendarFile } from '../../lib/calendar';
import { BrandBadge } from '../common/BrandBadge';
import confetti from 'canvas-confetti';

interface UrgentReminderBannerProps {
  subscriptions: SubscriptionItem[];
  onMarkRenewed: (subId: string) => boolean;
  onOpenRechargeWithService: (serviceKey: string, sub?: SubscriptionItem) => void;
}

export const UrgentReminderBanner: React.FC<UrgentReminderBannerProps> = ({
  subscriptions,
  onMarkRenewed,
  onOpenRechargeWithService,
}) => {
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const urgentSubs = subscriptions
    .filter(sub => sub.cycle !== 'lifetime')
    .map(sub => ({ sub, days: getDaysUntil(sub.nextBillingDate) }))
    .filter(item => item.days <= 7)
    .sort((a, b) => a.days - b.days);

  if (urgentSubs.length === 0) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl surface-card gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-sm font-medium text-ink">AirCover 智能守护中：未来 7 天内无临期待续费项目，所有服务运转良好。</span>
        </div>
        <button
          onClick={() => downloadICalendarFile(subscriptions)}
          className="h-9 px-3 rounded-lg bg-inset hover:bg-line text-ink-soft transition-colors flex items-center justify-center gap-1.5 font-semibold text-[13px] whitespace-nowrap shrink-0"
          title="一键将全部订阅生成系统日历事件，导入 Mac / iPhone 闹钟"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>导出到系统日历 (.ics)</span>
        </button>
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
    if (!onMarkRenewed(subId)) return;
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const quietButton = 'h-8 px-2.5 rounded-lg text-muted hover:text-ink hover:bg-inset transition-colors flex items-center gap-1.5 font-medium text-[13px] whitespace-nowrap';

  return (
    <section>
      <div className="flex flex-col row:flex-row row:items-center justify-between gap-x-4 gap-y-2 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-ink tracking-tight whitespace-nowrap">充值与续费提醒</h3>
            <span className="text-xs px-1.5 h-5 inline-flex items-center rounded-md bg-amber-100 text-amber-800 font-semibold whitespace-nowrap">
              {urgentSubs.length} 项待处理
            </span>
          </div>
          <p className="text-[13px] text-muted mt-0.5 text-pretty">
            及时充值确保 API 与服务正常运转。支持导出至系统日历设置 Mac / iPhone 强力响铃提醒。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 -ml-2.5 row:ml-0 shrink-0">
          <button
            onClick={() => downloadICalendarFile(subscriptions)}
            className={quietButton}
            title="把所有续费日程导入 Mac / iPhone 日历，提前1天和3天响铃提醒"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>一键同步日历 (.ics)</span>
          </button>
          <button onClick={handleEnableNotification} className={quietButton} title="开启网页桌面系统通知">
            <Bell className="w-3.5 h-3.5" />
            <span>桌面通知</span>
          </button>
        </div>
      </div>

      {notificationStatus && (
        <div className="mb-3 py-2 px-3 rounded-lg bg-amber-50 text-amber-800 text-sm font-medium animate-fadeIn">
          {notificationStatus}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 min-[1100px]:grid-cols-3 gap-3">
        {urgentSubs.map(({ sub, days }) => {
          const isOverdue = days < 0;
          const isToday = days === 0;

          return (
            <div key={sub.id} className="rounded-2xl surface-card p-3.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <BrandBadge serviceKey={sub.serviceKey} name={sub.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-ink truncate" title={sub.name}>{sub.name}</div>
                  <div className="text-xs text-muted mt-0.5 whitespace-nowrap">
                    {sub.currency} {sub.price} · {sub.nextBillingDate}
                  </div>
                </div>
                <span
                  className={`text-xs px-1.5 h-5 inline-flex items-center rounded-md font-semibold shrink-0 whitespace-nowrap ${
                    isOverdue
                      ? 'bg-rose-50 text-rose-700'
                      : isToday
                      ? 'bg-ink text-white'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {isOverdue ? `已逾期 ${Math.abs(days)}d` : isToday ? '今日到期' : `还剩 ${days}d`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => onOpenRechargeWithService(sub.serviceKey, sub)}
                  className="h-8 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-[13px] font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap active:scale-95"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>去充值</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRenewClick(sub.id)}
                  className="h-8 rounded-lg bg-inset hover:bg-line text-ink-soft text-[13px] font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap active:scale-95"
                  title="顺延续费一个周期"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>已续费</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
