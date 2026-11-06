import { PRESET_SERVICES } from '../types/presets';
import { BillingCycle, ServiceCategory } from '../types';

export interface ParsedSmartInput {
  serviceKey?: string;
  serviceName?: string;
  category?: ServiceCategory;
  accountEmail?: string;
  password?: string;
  apiKey?: string;
  price?: number;
  currency?: 'USD' | 'CNY' | 'EUR' | 'HKD' | 'GBP' | 'JPY';
  cycle?: BillingCycle;
  nextBillingDate?: string;
  twoFactorNote?: string;
  paymentMethod?: string;
  notes?: string;
  rawText: string;
}

/**
 * Intelligent parser that extracts credentials, tokens, billing info from arbitrary text and OCR extracts
 */
export function parseSmartText(text: string): ParsedSmartInput {
  const result: ParsedSmartInput = {
    rawText: text.trim(),
  };

  if (!text || !text.trim()) return result;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const remainingNotes: string[] = [];

  // Check language hints
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF]/.test(text) || text.includes('更新') || text.includes('サブスクリプション');
  const lowerText = text.toLowerCase();

  // 1. Identify Service
  for (const preset of PRESET_SERVICES) {
    if (preset.key === 'custom') continue;
    const matchTerms = [
      preset.key,
      preset.name.toLowerCase(),
      preset.key === 'openai' ? 'chatgpt' : '',
      preset.key === 'openai' ? 'gpt-4' : '',
      preset.key === 'claude' ? 'anthropic' : '',
      preset.key === 'deepseek' ? '深度求索' : '',
      preset.key === 'gemini' ? 'google ai' : '',
    ].filter(Boolean);

    if (matchTerms.some(term => lowerText.includes(term))) {
      result.serviceKey = preset.key;
      result.serviceName = preset.name;
      result.category = preset.category;
      if (preset.defaultPrice) result.price = preset.defaultPrice;
      if (preset.defaultCurrency) result.currency = preset.defaultCurrency;
      if (preset.defaultCycle) result.cycle = preset.defaultCycle;
      break;
    }
  }

  // If text mentions Claude Pro specifically
  if (/claude\s*pro/i.test(text)) {
    result.serviceKey = 'claude';
    result.serviceName = 'Claude Pro';
    result.category = 'ai';
  } else if (/chatgpt\s*plus/i.test(text)) {
    result.serviceKey = 'openai';
    result.serviceName = 'ChatGPT Plus';
    result.category = 'ai';
  }

  // 2. Billing Cycle Detection (Monthly, Yearly, etc.)
  if (/monthly|月額|月付|1\s*か月/i.test(text)) {
    result.cycle = 'monthly';
  } else if (/annually|yearly|年額|年付|1\s*年/i.test(text)) {
    result.cycle = 'annually';
  } else if (/quarterly|季付|3\s*か月/i.test(text)) {
    result.cycle = 'quarterly';
  }

  // 3. Delimiter-based format (e.g. email----password----token)
  for (const line of lines) {
    if (line.includes('----')) {
      const parts = line.split('----').map(p => p.trim());
      if (parts.length >= 2) {
        for (const p of parts) {
          if (!result.accountEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p)) {
            result.accountEmail = p;
          } else if (!result.apiKey && (p.startsWith('sk-') || p.startsWith('ghp_') || p.startsWith('gsk_'))) {
            result.apiKey = p;
          } else if (!result.password && p.length >= 6 && !p.includes(' ') && !p.includes('@')) {
            result.password = p;
          }
        }
      }
    }
  }

  // 4. Line by line patterns
  for (const line of lines) {
    // Email / Account
    const emailMatch = line.match(/(?:账号|用户名|登录|邮箱|account|username|email|user)\s*[:：=]\s*([^\s]+)/i);
    if (emailMatch && !result.accountEmail) {
      result.accountEmail = emailMatch[1].trim();
      continue;
    }

    // Password
    const passMatch = line.match(/(?:密码|口令|password|passwd|pwd)\s*[:：=]\s*([^\s]+)/i);
    if (passMatch && !result.password) {
      result.password = passMatch[1].trim();
      continue;
    }

    // API Key / Token
    const keyMatch = line.match(/(?:key|token|密钥|apikey|api_key|sk)\s*[:：=]\s*([^\s]+)/i);
    if (keyMatch && !result.apiKey) {
      result.apiKey = keyMatch[1].trim();
      continue;
    }

    // 2FA / Backup code
    const twoFaMatch = line.match(/(?:2fa|二步验证|双重验证|验证码|备用码)\s*[:：=]\s*([^\s]+)/i);
    if (twoFaMatch && !result.twoFactorNote) {
      result.twoFactorNote = twoFaMatch[1].trim();
      continue;
    }

    // Amount & Currency (Handles ¥3,000, $20, €15, etc.)
    const priceMatch =
      line.match(/([$¥€£HK$])\s*([\d,]+(?:\.\d+)?)/i) ||
      line.match(/([\d,]+(?:\.\d+)?)\s*(?:円|元|USD|CNY|JPY|美元|\$)/i) ||
      line.match(/(?:金额|价格|费用|price|cost|amount)\s*[:：=]\s*([$¥€£]?\s*[\d,.]+)/i);

    if (priceMatch) {
      const fullMatch = priceMatch[0];
      const cleanNumStr = (priceMatch[2] || priceMatch[1] || fullMatch).replace(/,/g, '').match(/[\d.]+/);
      if (cleanNumStr) {
        result.price = parseFloat(cleanNumStr[0]);
        if (fullMatch.includes('$') || /usd|美元/i.test(fullMatch)) {
          result.currency = 'USD';
        } else if (fullMatch.includes('¥') || fullMatch.includes('円')) {
          result.currency = hasJapanese ? 'JPY' : 'CNY';
        } else if (fullMatch.includes('€') || /eur/i.test(fullMatch)) {
          result.currency = 'EUR';
        } else if (/cny|元|人民币/i.test(fullMatch)) {
          result.currency = 'CNY';
        }
      }
    }

    // Date recognition:
    // Pattern A: YYYY-MM-DD or YYYY/MM/DD
    const fullDateMatch = line.match(/(?:到期|续费|截止|更新|expire|renewal|valid)?\s*[:：=]?\s*(\d{4})[-/年.](\d{1,2})[-/月.](\d{1,2})/i);
    if (fullDateMatch && !result.nextBillingDate) {
      const y = fullDateMatch[1];
      const m = fullDateMatch[2].padStart(2, '0');
      const d = fullDateMatch[3].padStart(2, '0');
      result.nextBillingDate = `${y}-${m}-${d}`;
      continue;
    }

    // Pattern B: M月D日 (like Apple screenshot: 更新 日 : 11 月 14 日 or 11月14日)
    const monthDayMatch = line.match(/(?:更新\s*日|续订\s*日|到期\s*日|续费\s*日)?\s*[:：=]?\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/i);
    if (monthDayMatch && !result.nextBillingDate) {
      const targetMonth = parseInt(monthDayMatch[1], 10);
      const targetDay = parseInt(monthDayMatch[2], 10);

      const now = new Date();
      let year = now.getFullYear();

      // Check if this date has passed in current year
      const testDate = new Date(year, targetMonth - 1, targetDay);
      if (testDate.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
        year += 1;
      }

      result.nextBillingDate = `${year}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
      continue;
    }

    // Raw email fallback anywhere in text
    if (!result.accountEmail) {
      const rawEmail = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (rawEmail) {
        result.accountEmail = rawEmail[0];
        continue;
      }
    }

    // Raw API Key fallback (sk-..., ghp_..., etc.)
    if (!result.apiKey) {
      const rawKey = line.match(/(sk-[a-zA-Z0-9_-]{20,}|ghp_[a-zA-Z0-9]{20,}|gsk_[a-zA-Z0-9]{20,})/);
      if (rawKey) {
        result.apiKey = rawKey[0];
        continue;
      }
    }

    remainingNotes.push(line);
  }

  // Payment method inference (Apple subscription if mentions sub/apple)
  if (hasJapanese || /apple\s*one|サブスクリプション/i.test(text)) {
    result.paymentMethod = hasJapanese ? 'Apple 订阅 (日区)' : 'Apple 订阅';
  }

  if (remainingNotes.length > 0 && !result.notes) {
    result.notes = remainingNotes.slice(0, 3).join(' ');
  }

  // Defaults if missing
  if (!result.serviceKey) result.serviceKey = 'custom';
  if (!result.serviceName) result.serviceName = '自定义订阅服务';
  if (!result.currency) result.currency = 'USD';
  if (!result.cycle) result.cycle = 'monthly';
  if (!result.nextBillingDate) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    result.nextBillingDate = d.toISOString().split('T')[0];
  }

  return result;
}
