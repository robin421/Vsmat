export type BillingCycle = 'monthly' | 'quarterly' | 'semi-annually' | 'annually' | 'prepaid' | 'lifetime';

export type SubscriptionStatus = 'active' | 'expiring-soon' | 'expired' | 'paused';

export type ServiceCategory = 'ai' | 'developer' | 'server' | 'productivity' | 'entertainment' | 'other';

export interface BillingHistoryRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  note?: string;
  voucherCodeUsed?: string;
}

export interface TokenItem {
  id: string;
  name: string;
  serviceKey: string;
  token: string;
  baseUrl?: string;
  accountEmail?: string;
  organizationId?: string;
  tags: string[];
  expiresAt?: string; // YYYY-MM-DD
  balance?: string;
  consoleUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  serviceKey: string;
  category: ServiceCategory;
  accountEmail: string;
  passwordNote?: string;
  twoFactorNote?: string;
  cycle: BillingCycle;
  price: number;
  currency: 'USD' | 'CNY' | 'EUR' | 'HKD' | 'GBP' | 'JPY';
  nextBillingDate: string; // YYYY-MM-DD
  autoRenew: boolean;
  paymentMethod?: string;
  portalUrl?: string;
  rechargeUrl?: string;
  notes?: string;
  history: BillingHistoryRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface VoucherItem {
  id: string;
  serviceKey: string;
  serviceName: string;
  code: string;
  amount?: number;
  currency?: string;
  status: 'unredeemed' | 'redeemed' | 'expired';
  redeemedAt?: string;
  redeemUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface AppSettings {
  isConfigured: boolean;
  masterPasswordHash?: string;
  salt?: string;
  rememberUnlocked: boolean;
  enableBrowserNotifications: boolean;
  preferredCurrency: 'CNY' | 'USD';
  usdToCnyRate: number;
  autoLockMinutes: number;
}

export interface AppData {
  tokens: TokenItem[];
  subscriptions: SubscriptionItem[];
  vouchers: VoucherItem[];
  settings: AppSettings;
}

export interface PresetService {
  key: string;
  name: string;
  category: ServiceCategory;
  brandColor: string;
  iconBg: string;
  defaultPrice?: number;
  defaultCurrency?: 'USD' | 'CNY';
  defaultCycle?: BillingCycle;
  portalUrl: string;
  rechargeUrl: string;
  consoleUrl?: string;
  defaultBaseUrl?: string;
  directRedeemUrlPattern?: string; // e.g. "https://apps.apple.com/redeem?code={CODE}"
}
