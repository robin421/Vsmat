import React, { useState } from 'react';
import { AlertTriangle, Bell, Calendar, Clock, CheckCircle2, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import { SubscriptionItem } from '../../types';
import { getDaysUntil, requestNotificationPermission, checkAndSendRenewalNotifications } from '../../lib/notifications';
import { downloadICalendarFile } from '../../lib/calendar';
import { getPresetByKey } from '../../types/presets';
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
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 gap-3 shadow-subtle">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>当前未来 7 天内无临期续费项目，全部订阅状态良好。</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadICalendarFile(subscriptions)}
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition flex items-center gap-1.5 font-medium shadow-subtle"
            title="一键将全部订阅生成系统日历事件，导入 Mac/iPhone 闹钟"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            导出到系统日历 (.ics)
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
      spread: 50,
      origin: { y: 0.6 }
    });
    onMarkRenewed(subId);
  };

  return (
    <div className="rounded-2xl bg-amber-50/70 border border-amber-200/90 p-5 shadow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 animate-pulse shadow-subtle">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              充值与续费预警中心
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                {urgentSubs.length} 个待充值
              </span>
            </h3>
            <p className="text-xs text-amber-800/80">
              为防止服务中断，请及时充值或完成续费扣款。支持一键导入系统日历享受强力闹钟！
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => downloadICalendarFile(subscriptions)}
            className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 transition flex items-center gap-1.5 font-semibold shadow-subtle"
            title="把所有续费日程导入 Mac / iPhone 日历，提前1天和3天响铃提醒"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            一键同步日历闹钟 (.ics)
          </button>

          <button
            onClick={handleEnableNotification}
            className="text-xs px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition flex items-center gap-1.5 font-medium shadow-subtle"
            title="开启系统级通知弹窗"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            桌面通知
          </button>
        </div>
      </div>

      {notificationStatus && (
        <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-xs text-blue-800 flex items-center gap-2 shadow-subtle">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          {notificationStatus}
        </div>
      )}

      {/* Urgent cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {urgentSubs.map(({ sub, days }) => {
          const preset = getPresetByKey(sub.serviceKey);
          const isOverdue = days < 0;
          const isToday = days === 0;

          return (
            <div
              key={sub.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition bg-white shadow-subtle ${
                isOverdue
                  ? 'border-red-300 bg-red-50/30'
                  : isToday
                  ? 'border-amber-300 bg-amber-50/30'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border bg-slate-100 text-slate-800 border-slate-200">
                      {sub.name.slice(0, 1)}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[150px]">
                        {sub.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono truncate max-w-[150px]">
                        {sub.accountEmail || '未指定邮箱'}
                      </p>
                    </div>
                  </div>

                  {/* Urgency Badge */}
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      isOverdue
                        ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                        : isToday
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isOverdue ? `已逾期 ${Math.abs(days)} 天` : isToday ? '今日扣费!' : `还剩 ${days} 天`}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100 mb-2">
                  <span className="text-slate-500">扣费金额:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {sub.currency} {sub.price}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onOpenRechargeWithService(sub.serviceKey, sub)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition flex items-center justify-center gap-1 shadow-subtle"
                >
                  <ExternalLink className="w-3 h-3" />
                  去充值
                </button>

                <button
                  type="button"
                  onClick={() => handleRenewClick(sub.id)}
                  className="py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition flex items-center justify-center gap-1 shadow-subtle"
                  title="点击将下期扣费时间自动往后顺延一个周期"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  我已续费
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
