import { SubscriptionItem } from '../types';

export function getDaysUntil(dateStr: string): number {
  if (!dateStr) return 999;
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }

  return false;
}

export function checkAndSendRenewalNotifications(subscriptions: SubscriptionItem[]) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  for (const sub of subscriptions) {
    const days = getDaysUntil(sub.nextBillingDate);
    if (days < 0) {
      new Notification(`⚠️【Vsmat 续费已逾期】${sub.name}`, {
        body: `该服务已于 ${Math.abs(days)} 天前到期，金额 ${sub.currency} ${sub.price}，请尽快充值或更新！`,
        icon: '/favicon.ico',
      });
    } else if (days === 0) {
      new Notification(`🔔【Vsmat 今日扣费提醒】${sub.name}`, {
        body: `今天将扣费/续费 ${sub.currency} ${sub.price}，请确认余额或使用礼品券充值！`,
        icon: '/favicon.ico',
      });
    } else if (days <= 3) {
      new Notification(`⏳【Vsmat 续费倒计时: ${days} 天】${sub.name}`, {
        body: `距离续费仅剩 ${days} 天 (${sub.nextBillingDate})，费用 ${sub.currency} ${sub.price}。`,
        icon: '/favicon.ico',
      });
    }
  }
}
