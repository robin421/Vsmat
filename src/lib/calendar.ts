import { SubscriptionItem } from '../types';

/**
 * Generates RFC 5545 iCalendar (.ics) file content
 * Includes alarms (VALARM) 3 days before, 1 day before, and day-of.
 */
export function generateICalendarData(subscriptions: SubscriptionItem[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vsmat Vault//Subscription Renewal Reminder//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Vsmat 订阅续费提醒',
    'X-WR-TIMEZONE:Asia/Shanghai',
  ];

  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  for (const sub of subscriptions) {
    if (!sub.nextBillingDate || sub.cycle === 'lifetime') continue;
    // Format date YYYYMMDD
    const dateStr = sub.nextBillingDate.replace(/-/g, '');
    const uid = `sub-${sub.id}-${dateStr}@vsmat.vault`;
    const summary = `🔔【续费充值提醒】${sub.name} (扣费 ${sub.currency} ${sub.price})`;
    const description = [
      `服务名称: ${sub.name}`,
      `扣费金额: ${sub.currency} ${sub.price} (${sub.cycle})`,
      `关联账号: ${sub.accountEmail || '未指定'}`,
      sub.paymentMethod ? `支付方式: ${sub.paymentMethod}` : '',
      sub.rechargeUrl ? `充值直达: ${sub.rechargeUrl}` : '',
      sub.portalUrl ? `管理后台: ${sub.portalUrl}` : '',
      '提示: 可以在 Vsmat 中一键完成礼品券充值与顺延。'
    ].filter(Boolean).join('\\n');

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART;VALUE=DATE:${dateStr}`,
      `DTEND;VALUE=DATE:${dateStr}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      sub.portalUrl ? `URL:${sub.portalUrl}` : '',
      'STATUS:CONFIRMED',

      // Alarm 1: 3 days in advance
      'BEGIN:VALARM',
      'TRIGGER:-P3D',
      'ACTION:DISPLAY',
      `DESCRIPTION:提前3天续费提醒: ${sub.name} 即将扣费`,
      'END:VALARM',

      // Alarm 2: 1 day in advance
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      `DESCRIPTION:明天续费提醒: ${sub.name} 明日扣费 ${sub.currency} ${sub.price}`,
      'END:VALARM',

      // Alarm 3: Morning of the renewal
      'BEGIN:VALARM',
      'TRIGGER;VALUE=DATE-TIME:19760401T005545Z',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      `DESCRIPTION:今日到期扣费: ${sub.name} 今日续费`,
      'END:VALARM',

      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Triggers a browser download of the .ics file
 */
export function downloadICalendarFile(subscriptions: SubscriptionItem[], filename = 'vsmat-reminders.ics') {
  const icsData = generateICalendarData(subscriptions);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
