import { SubscriptionItem } from '../types';
import { daysFromToday, todayLocal } from './date';

export function getDaysUntil(dateStr: string): number {
  return daysFromToday(dateStr) ?? 999;
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

const NOTIFIED_KEY = 'vsmat_notified_v1';
const ICON = '/icon-192.png';

const localDateKey = todayLocal;

/** Ids already notified today (ids are random UUIDs, not secrets). */
function loadNotifiedToday(): Set<string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || 'null');
    if (parsed && parsed.date === localDateKey() && Array.isArray(parsed.ids)) {
      return new Set(parsed.ids as string[]);
    }
  } catch {
    /* ignore corrupt value */
  }
  return new Set();
}

function saveNotifiedToday(ids: Set<string>) {
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify({ date: localDateKey(), ids: [...ids] }));
  } catch {
    /* storage full / unavailable: worst case we notify again */
  }
}

/**
 * Notify about overdue / due / soon-due subscriptions, at most once per
 * subscription per day (opening the app repeatedly won't re-spam).
 */
export function checkAndSendRenewalNotifications(subscriptions: SubscriptionItem[]) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const notified = loadNotifiedToday();

  for (const sub of subscriptions) {
    if (notified.has(sub.id) || sub.cycle === 'lifetime') continue;
    const days = getDaysUntil(sub.nextBillingDate);
    const options = { icon: ICON, tag: `vsmat-renewal-${sub.id}` };

    if (days < 0) {
      new Notification(`⚠️【Vsmat 续费已逾期】${sub.name}`, {
        ...options,
        body: `该服务已于 ${Math.abs(days)} 天前到期，金额 ${sub.currency} ${sub.price}，请尽快充值或更新！`,
      });
    } else if (days === 0) {
      new Notification(`🔔【Vsmat 今日扣费提醒】${sub.name}`, {
        ...options,
        body: `今天将扣费/续费 ${sub.currency} ${sub.price}，请确认余额或使用礼品券充值！`,
      });
    } else if (days <= 3) {
      new Notification(`⏳【Vsmat 续费倒计时: ${days} 天】${sub.name}`, {
        ...options,
        body: `距离续费仅剩 ${days} 天 (${sub.nextBillingDate})，费用 ${sub.currency} ${sub.price}。`,
      });
    } else {
      continue;
    }
    notified.add(sub.id);
  }

  saveNotifiedToday(notified);
}
