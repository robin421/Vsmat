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
      <div className="flex flex-col sm:flex-row items-center justify-between p-4.5 rounded-2xl bg-white border border-[#EBEBEB] text-xs text-[#717171] gap-3 airbnb-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] text-[#222222] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#FF385C]" />
          </div>
          <span className="font-medium text-[#222222]">AirCover 智能守护中：未来 7 天内无临期待续费项目，所有服务运转良好。</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadICalendarFile(subscriptions)}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD] hover:border-[#222222] transition flex items-center gap-1.5 font-semibold text-xs shadow-2xs active:scale-[0.98]"
            title="一键将全部订阅生成系统日历事件，导入 Mac / iPhone 闹钟"
          >
            <Calendar className="w-3.5 h-3.5 text-[#FF385C]" />
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
    <div className="rounded-3xl bg-white border border-[#EBEBEB] p-5 sm:p-6 airbnb-card relative">
      {/* Top Header Row (Airbnb AirCover Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EBEBEB]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF0F2] border border-[#FFCCD3] text-[#FF385C] flex items-center justify-center shrink-0 shadow-2xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#222222] tracking-tight">充值与续费提醒</h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF0F2] text-[#FF385C] font-bold border border-[#FFCCD3]">
                {urgentSubs.length} 项待处理
              </span>
            </div>
            <p className="text-xs text-[#717171] mt-0.5">
              及时充值确保 API 与服务正常运转。支持导出至系统日历设置 Mac / iPhone 强力响铃提醒。
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => downloadICalendarFile(subscriptions)}
            className="text-xs px-3.5 py-2 rounded-full bg-white hover:bg-[#F7F7F7] active:scale-[0.98] text-[#222222] border border-[#DDDDDD] hover:border-[#222222] transition flex items-center gap-1.5 font-semibold shadow-2xs"
            title="把所有续费日程导入 Mac / iPhone 日历，提前1天和3天响铃提醒"
          >
            <Calendar className="w-3.5 h-3.5 text-[#FF385C]" />
            <span>一键同步日历 (.ics)</span>
          </button>

          <button
            onClick={handleEnableNotification}
            className="text-xs px-3.5 py-2 rounded-full bg-white hover:bg-[#F7F7F7] active:scale-[0.98] text-[#222222] border border-[#DDDDDD] hover:border-[#222222] transition flex items-center gap-1.5 font-semibold shadow-2xs"
            title="开启网页桌面系统通知"
          >
            <Bell className="w-3.5 h-3.5 text-[#FF385C]" />
            <span>桌面通知</span>
          </button>
        </div>
      </div>

      {notificationStatus && (
        <div className="mt-3 py-1.5 px-3.5 rounded-xl bg-[#FFF0F2] border border-[#FFCCD3] text-xs text-[#FF385C] font-semibold animate-fadeIn">
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
              className="rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] hover:border-[#DDDDDD] p-3.5 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <BrandBadge serviceKey={sub.serviceKey} name={sub.name} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#222222] truncate">{sub.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        isOverdue
                          ? 'bg-[#c13515] text-white'
                          : isToday
                          ? 'bg-[#FF385C] text-white'
                          : 'bg-[#FFF0F2] text-[#FF385C] border border-[#FFCCD3]'
                      }`}
                    >
                      {isOverdue ? `已逾期 ${Math.abs(days)}d` : isToday ? '今日到期' : `还剩 ${days}d`}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-[#717171] truncate mt-0.5">
                    {sub.currency} {sub.price} · {sub.nextBillingDate}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenRechargeWithService(sub.serviceKey, sub)}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-[#EBEBEB] active:scale-95 text-[#222222] text-[11px] font-semibold border border-[#DDDDDD] transition flex items-center gap-1 shadow-2xs"
                >
                  <ArrowUpRight className="w-3 h-3 text-[#717171]" />
                  <span>去充值</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRenewClick(sub.id)}
                  className="px-3.5 py-1.5 rounded-full btn-rausch text-white text-[11px] font-semibold transition flex items-center gap-1 shadow-sm active:scale-95"
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
    </div>
  );
};
