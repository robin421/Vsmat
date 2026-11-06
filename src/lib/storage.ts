import { AppData, SubscriptionItem, TokenItem, VoucherItem } from '../types';
import { encryptObject, decryptObject, generateSalt, hashPassword } from './crypto';

const STORAGE_KEY = 'vsmat_vault_storage_v1';
const SESSION_PASSWORD_KEY = 'vsmat_session_master_pw';

export const INITIAL_MOCK_DATA: AppData = {
  settings: {
    isConfigured: true,
    masterPasswordHash: '',
    salt: '',
    rememberUnlocked: true,
    enableBrowserNotifications: true,
    preferredCurrency: 'CNY',
    usdToCnyRate: 7.25,
    autoLockMinutes: 60,
  },
  tokens: [
    {
      id: 'token-openai-1',
      name: 'OpenAI GPT-4o Production Key',
      serviceKey: 'openai',
      token: 'sk-proj-abc123987456xyz99887766554433221100aabbcc',
      baseUrl: 'https://api.openai.com/v1',
      accountEmail: 'my_work_ai@gmail.com',
      organizationId: 'org-AlphaTech2026',
      tags: ['生产环境', 'GPT-4o', '主力API'],
      balance: '$45.20 / $100 额度',
      consoleUrl: 'https://platform.openai.com/api-keys',
      notes: '绑定了主力 Visa 卡，每月初自动扣费充值',
      createdAt: '2026-10-01',
      updatedAt: '2026-11-01',
    },
    {
      id: 'token-deepseek-1',
      name: 'DeepSeek V3 / R1 推理 Token',
      serviceKey: 'deepseek',
      token: 'sk-d98f7e6a5b4c3d2e1f0a9b8c7d6e5f4a',
      baseUrl: 'https://api.deepseek.com',
      accountEmail: 'coder_dev@163.com',
      tags: ['DeepSeek-R1', '高性价比', '代码推理'],
      balance: '¥128.50 余额充裕',
      consoleUrl: 'https://platform.deepseek.com/api_keys',
      notes: '深度求索国产旗舰大模型 API',
      createdAt: '2026-10-15',
      updatedAt: '2026-11-02',
    },
    {
      id: 'token-claude-1',
      name: 'Anthropic Claude 3.5 Sonnet',
      serviceKey: 'claude',
      token: 'sk-ant-api03-abcdef1234567890abcdef1234567890',
      baseUrl: 'https://api.anthropic.com/v1',
      accountEmail: 'my_work_ai@gmail.com',
      tags: ['Claude 3.5', '长文本分析'],
      balance: '$28.00',
      consoleUrl: 'https://console.anthropic.com/settings/keys',
      notes: '用于复杂代码架构审查与长文本研究',
      createdAt: '2026-10-20',
      updatedAt: '2026-11-03',
    }
  ],
  subscriptions: [
    {
      id: 'sub-chatgpt-plus',
      name: 'ChatGPT Plus (土区 Apple 订阅)',
      serviceKey: 'openai',
      category: 'ai',
      accountEmail: 'vip_subscriber@gmail.com',
      passwordNote: 'ChatGPT#2026Safe!',
      twoFactorNote: 'Google Authenticator (6位动态码)',
      cycle: 'monthly',
      price: 499.99,
      currency: 'TRY',
      nextBillingDate: '2026-12-04',
      autoRenew: true,
      paymentMethod: 'Apple 订阅 (土区)',
      portalUrl: 'https://chatgpt.com/#settings/Account',
      rechargeUrl: 'https://apps.apple.com/redeem',
      notes: '土耳其区 Apple ID 订阅，每月 ₺499,99 (折合约 $14.5 / ¥105)',
      history: [
        { id: 'h1', date: '2026-11-04', amount: 499.99, currency: 'TRY', note: '土区 Apple ID 扣款 ₺499,99' },
        { id: 'h2', date: '2026-10-04', amount: 499.99, currency: 'TRY', note: '常规续费' },
      ],
      createdAt: '2026-08-01',
      updatedAt: '2026-11-06',
    },
    {
      id: 'sub-cursor-pro',
      name: 'Cursor Pro AI 编辑器',
      serviceKey: 'cursor',
      category: 'developer',
      accountEmail: 'coder_dev@163.com',
      passwordNote: 'Github一键登录关联',
      twoFactorNote: 'GitHub 2FA',
      cycle: 'monthly',
      price: 20,
      currency: 'USD',
      // Next billing 6 days from now
      nextBillingDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      autoRenew: true,
      paymentMethod: 'WildCard 虚拟卡 (尾号 6821)',
      portalUrl: 'https://www.cursor.com/settings',
      rechargeUrl: 'https://www.cursor.com/settings',
      notes: '编程主力工具，包含 Fast GPT-4o / Claude 3.5 次数',
      history: [
        { id: 'h3', date: '2026-10-11', amount: 20, currency: 'USD' }
      ],
      createdAt: '2026-09-11',
      updatedAt: '2026-11-02',
    },
    {
      id: 'sub-vps-bandwagon',
      name: 'Bandwagon 搬瓦工 CN2-GIA VPS',
      serviceKey: 'vps',
      category: 'server',
      accountEmail: 'my_work_ai@gmail.com',
      passwordNote: 'KiwiVM面板独立密码',
      cycle: 'annually',
      price: 49.99,
      currency: 'USD',
      nextBillingDate: '2026-12-15',
      autoRenew: true,
      paymentMethod: '支付宝 / Alipay',
      portalUrl: 'https://bwh88.net/clientarea.php',
      rechargeUrl: 'https://bwh88.net/clientarea.php?action=addfunds',
      notes: '主力开发海外节点与测试服务器',
      history: [
        { id: 'h4', date: '2025-12-15', amount: 49.99, currency: 'USD', note: '年付续费' }
      ],
      createdAt: '2024-12-15',
      updatedAt: '2026-10-01',
    }
  ],
  vouchers: [
    {
      id: 'v-apple-1',
      serviceKey: 'apple',
      serviceName: 'Apple App Store 礼品卡 (美区)',
      code: 'X89A-24B8-90CD-EF12',
      amount: 25,
      currency: 'USD',
      status: 'unredeemed',
      notes: '充值美区 Apple ID 用于续费 ChatGPT Plus',
      createdAt: '2026-11-01',
    },
    {
      id: 'v-steam-1',
      serviceKey: 'steam',
      serviceName: 'Steam 钱包充值码',
      code: 'K3T7P-99MQ2-8XB44',
      amount: 100,
      currency: 'CNY',
      status: 'unredeemed',
      notes: '促销囤货待充值',
      createdAt: '2026-11-03',
    }
  ]
};

export function getSessionPassword(): string | null {
  return sessionStorage.getItem(SESSION_PASSWORD_KEY);
}

export function setSessionPassword(password: string) {
  sessionStorage.setItem(SESSION_PASSWORD_KEY, password);
}

export function clearSessionPassword() {
  sessionStorage.removeItem(SESSION_PASSWORD_KEY);
}

/**
 * Loads vault data from localStorage.
 * If data is encrypted, decrypts using provided password or session password.
 */
export async function loadVaultData(password?: string): Promise<{ data: AppData; isLocked: boolean; requiresSetup: boolean }> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Fresh install, initialize with mock data
    return { data: INITIAL_MOCK_DATA, isLocked: false, requiresSetup: false };
  }

  try {
    const parsed = JSON.parse(raw);

    // If unencrypted format
    if (!parsed.isEncrypted) {
      return { data: parsed as AppData, isLocked: false, requiresSetup: false };
    }

    // Encrypted format
    const effectivePassword = password || getSessionPassword();
    if (!effectivePassword) {
      return {
        data: {
          settings: parsed.settings,
          tokens: [],
          subscriptions: [],
          vouchers: []
        },
        isLocked: true,
        requiresSetup: false,
      };
    }

    // Verify hash
    const hash = await hashPassword(effectivePassword, parsed.salt);
    if (hash !== parsed.hash) {
      throw new Error('主密码错误');
    }

    // Decrypt payload
    const decryptedData: AppData = await decryptObject(parsed.payload, effectivePassword, parsed.salt);
    setSessionPassword(effectivePassword);
    return { data: decryptedData, isLocked: false, requiresSetup: false };
  } catch (err) {
    console.error('Error loading vault data:', err);
    throw err;
  }
}

/**
 * Saves vault data to localStorage, optionally encrypted.
 */
export async function saveVaultData(data: AppData, password?: string): Promise<void> {
  const effectivePassword = password || getSessionPassword();

  if (!effectivePassword) {
    // Unencrypted or remember mode
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return;
  }

  let salt = data.settings.salt;
  if (!salt) {
    salt = generateSalt();
    data.settings.salt = salt;
  }

  const hash = await hashPassword(effectivePassword, salt);
  data.settings.masterPasswordHash = hash;

  const payload = await encryptObject(data, effectivePassword, salt);

  const storageEnvelope = {
    isEncrypted: true,
    salt,
    hash,
    payload,
    settings: data.settings,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageEnvelope));
  setSessionPassword(effectivePassword);
}

/**
 * Advance next billing date based on billing cycle when user clicks "我已续费"
 */
export function advanceBillingDate(currentDateStr: string, cycle: string): string {
  const d = new Date(currentDateStr + 'T00:00:00');
  if (isNaN(d.getTime())) {
    const now = new Date();
    d.setTime(now.getTime());
  }

  switch (cycle) {
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'quarterly':
      d.setMonth(d.getMonth() + 3);
      break;
    case 'semi-annually':
      d.setMonth(d.getMonth() + 6);
      break;
    case 'annually':
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      d.setMonth(d.getMonth() + 1);
      break;
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Export backup as downloadable JSON
 */
export function exportBackup(data: AppData, filename = 'vsmat-backup.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
