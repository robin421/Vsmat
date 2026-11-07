import { describe, it, expect } from 'vitest';
import { interpolate, detectDefaultLanguage, SUPPORTED_LANGUAGES } from '../src/i18n';
import { zh } from '../src/i18n/locales/zh';
import { en } from '../src/i18n/locales/en';
import { ja } from '../src/i18n/locales/ja';
import { ko } from '../src/i18n/locales/ko';

describe('i18n system', () => {
  it('supports zh, en, ja, ko languages', () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toEqual(['zh', 'en', 'ja', 'ko']);
    expect(detectDefaultLanguage()).toBe('zh');
  });

  it('unifies "7天" wording across Chinese translations and avoids "7d"', () => {
    // Check that overdue and days left in Chinese use "天" instead of "d"
    expect(zh.reminder.overdueDays).toContain('天');
    expect(zh.reminder.daysLeft).toContain('天');

    const formattedLeft = interpolate(zh.reminder.daysLeft, { days: 7 });
    const formattedOverdue = interpolate(zh.reminder.overdueDays, { days: 7 });

    expect(formattedLeft).toBe('还剩 7 天');
    expect(formattedOverdue).toBe('已逾期 7 天');
    expect(formattedLeft).not.toMatch(/7d/);
    expect(formattedOverdue).not.toMatch(/7d/);

    expect(zh.subscriptions.filterUrgent).toBe('仅待续费 (≤7天)');
    expect(zh.reminder.airCoverClean).toContain('未来 7 天内无临期待续费项目');
  });

  it('provides native natural translations for en, ja, ko', () => {
    // English
    expect(interpolate(en.reminder.daysLeft, { days: 7 })).toBe('7 days left');
    expect(interpolate(en.reminder.overdueDays, { days: 7 })).toBe('Overdue 7 days');
    expect(en.reminder.dueToday).toBe('Renews today');

    // Japanese
    expect(interpolate(ja.reminder.daysLeft, { days: 7 })).toBe('残り 7日');
    expect(interpolate(ja.reminder.overdueDays, { days: 7 })).toBe('期限切れ 7日');
    expect(ja.reminder.dueToday).toBe('本日更新');

    // Korean
    expect(interpolate(ko.reminder.daysLeft, { days: 7 })).toBe('7일 남음');
    expect(interpolate(ko.reminder.overdueDays, { days: 7 })).toBe('7일 연체됨');
    expect(ko.reminder.dueToday).toBe('오늘 갱신');
  });

  it('interpolates template parameters correctly', () => {
    expect(interpolate('Hello {name}!', { name: 'Vsmat' })).toBe('Hello Vsmat!');
    expect(interpolate('{count} items left', { count: 3 })).toBe('3 items left');
    expect(interpolate('No params here')).toBe('No params here');
  });

  it('verifies all locale dictionaries have matching keys and non-empty values', () => {
    const dictionaries = [
      { lang: 'zh', dict: zh },
      { lang: 'en', dict: en },
      { lang: 'ja', dict: ja },
      { lang: 'ko', dict: ko },
    ];

    const zhSections = Object.keys(zh) as (keyof typeof zh)[];

    for (const { lang, dict } of dictionaries) {
      for (const section of zhSections) {
        expect(dict[section], `Missing section ${section} in ${lang}`).toBeDefined();
        const zhKeys = Object.keys(zh[section]);
        for (const k of zhKeys) {
          const val = (dict[section] as Record<string, string>)[k];
          expect(typeof val, `${lang}.${section}.${k} should be a string`).toBe('string');
          expect(val.length, `${lang}.${section}.${k} should not be empty`).toBeGreaterThan(0);
        }
      }
    }
  });
});
