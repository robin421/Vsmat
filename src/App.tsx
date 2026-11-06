import React, { useState, useEffect } from 'react';
import { AppData, SubscriptionItem, TokenItem, VoucherItem } from './types';
import {
  loadVaultData,
  saveVaultData,
  advanceBillingDate,
  clearSessionPassword,
  INITIAL_MOCK_DATA,
} from './lib/storage';
import { checkAndSendRenewalNotifications } from './lib/notifications';
import { Navbar } from './components/layout/Navbar';
import { QuickRechargeBar } from './components/dashboard/QuickRechargeBar';
import { UrgentReminderBanner } from './components/dashboard/UrgentReminderBanner';
import { OverviewStats } from './components/dashboard/OverviewStats';
import { TokenList } from './components/tokens/TokenList';
import { TokenModal } from './components/tokens/TokenModal';
import { SubscriptionList } from './components/subscriptions/SubscriptionList';
import { SubscriptionModal } from './components/subscriptions/SubscriptionModal';
import { SmartAccountModal } from './components/subscriptions/SmartAccountModal';
import { VoucherStash } from './components/recharge/VoucherStash';
import { VoucherModal } from './components/recharge/VoucherModal';
import { AppleWebRedeemModal } from './components/recharge/AppleWebRedeemModal';
import { SpendAnalytics } from './components/analytics/SpendAnalytics';
import { MasterPasswordModal } from './components/auth/MasterPasswordModal';

export function App() {
  const [appData, setAppData] = useState<AppData>(INITIAL_MOCK_DATA);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscriptions' | 'tokens' | 'vouchers' | 'analytics'>('subscriptions');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isInitialSetup, setIsInitialSetup] = useState(false);

  // Modals state
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [editingToken, setEditingToken] = useState<TokenItem | null>(null);

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<SubscriptionItem | null>(null);

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherItem | null>(null);

  // Apple Method 1 (Web Redeem) Modal
  const [isAppleModalOpen, setIsAppleModalOpen] = useState(false);
  const [appleVoucherCode, setAppleVoucherCode] = useState('');
  const [appleActiveSub, setAppleActiveSub] = useState<SubscriptionItem | null>(null);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const { data, isLocked: locked, requiresSetup } = await loadVaultData();
        setAppData(data);
        setIsLocked(locked);
        if (locked) {
          setIsPasswordModalOpen(true);
        } else if (requiresSetup) {
          setIsInitialSetup(true);
          setIsPasswordModalOpen(true);
        } else {
          if (data.settings.enableBrowserNotifications) {
            checkAndSendRenewalNotifications(data.subscriptions);
          }
        }
      } catch (err) {
        console.error('Failed to init vault:', err);
      }
    }
    init();
  }, []);

  // Sync to encrypted storage on data changes
  const updateAppData = async (newData: AppData) => {
    setAppData(newData);
    await saveVaultData(newData);
  };

  // Password Unlock
  const handleUnlock = async (password: string, remember: boolean): Promise<boolean> => {
    try {
      const { data } = await loadVaultData(password);
      data.settings.rememberUnlocked = remember;
      setAppData(data);
      setIsLocked(false);
      setIsPasswordModalOpen(false);
      return true;
    } catch {
      return false;
    }
  };

  // Password Setup
  const handleSetupPassword = async (password: string, remember: boolean) => {
    const updated = {
      ...appData,
      settings: {
        ...appData.settings,
        isConfigured: true,
        rememberUnlocked: remember,
      },
    };
    setAppData(updated);
    await saveVaultData(updated, password);
    setIsLocked(false);
    setIsPasswordModalOpen(false);
  };

  const handleLockVault = () => {
    clearSessionPassword();
    setIsLocked(true);
    setIsPasswordModalOpen(true);
  };

  // Mark a subscription as renewed
  const handleMarkRenewed = async (subId: string) => {
    const nextSubs = appData.subscriptions.map(sub => {
      if (sub.id !== subId) return sub;
      const nextDate = advanceBillingDate(sub.nextBillingDate, sub.cycle);
      const newHistoryItem = {
        id: 'h-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        amount: sub.price,
        currency: sub.currency,
        note: `自动顺延续费至 ${nextDate}`,
      };
      return {
        ...sub,
        nextBillingDate: nextDate,
        history: [newHistoryItem, ...(sub.history || [])],
        updatedAt: new Date().toISOString().split('T')[0],
      };
    });

    await updateAppData({
      ...appData,
      subscriptions: nextSubs,
    });
  };

  // Open Apple Web Redeem Modal (Method 1)
  const handleOpenAppleWebRedeem = (code?: string, sub?: SubscriptionItem) => {
    const effectiveSub = sub || appData.subscriptions.find(s => s.serviceKey === 'openai' || s.paymentMethod?.includes('Apple')) || appData.subscriptions[0];
    const appleVoucher = appData.vouchers.find(v => v.serviceKey === 'apple' && v.status === 'unredeemed');
    const effectiveCode = code || appleVoucher?.code || 'X89A-24B8-90CD-EF12';

    setAppleVoucherCode(effectiveCode);
    setAppleActiveSub(effectiveSub || null);
    setIsAppleModalOpen(true);
  };

  // Token Handlers
  const handleSaveToken = async (tokenData: Partial<TokenItem>) => {
    let nextTokens: TokenItem[];
    if (tokenData.id) {
      nextTokens = appData.tokens.map(t => (t.id === tokenData.id ? ({ ...t, ...tokenData } as TokenItem) : t));
    } else {
      const newToken: TokenItem = {
        ...tokenData,
        id: 'token-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      } as TokenItem;
      nextTokens = [newToken, ...appData.tokens];
    }
    await updateAppData({ ...appData, tokens: nextTokens });
  };

  const handleDeleteToken = async (id: string) => {
    if (!confirm('确定要删除该 Token 密钥吗？')) return;
    const nextTokens = appData.tokens.filter(t => t.id !== id);
    await updateAppData({ ...appData, tokens: nextTokens });
  };

  // Subscription Handlers
  const handleSaveSubscription = async (subData: Partial<SubscriptionItem>) => {
    let nextSubs: SubscriptionItem[];
    if (subData.id) {
      nextSubs = appData.subscriptions.map(s => (s.id === subData.id ? ({ ...s, ...subData } as SubscriptionItem) : s));
    } else {
      const newSub: SubscriptionItem = {
        ...subData,
        id: 'sub-' + Date.now(),
        history: [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      } as SubscriptionItem;
      nextSubs = [newSub, ...appData.subscriptions];
    }
    await updateAppData({ ...appData, subscriptions: nextSubs });
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('确定要删除该订阅账号记录吗？')) return;
    const nextSubs = appData.subscriptions.filter(s => s.id !== id);
    await updateAppData({ ...appData, subscriptions: nextSubs });
  };

  // Voucher Handlers
  const handleSaveVoucher = async (vData: Partial<VoucherItem>) => {
    let nextVouchers: VoucherItem[];
    if (vData.id) {
      nextVouchers = appData.vouchers.map(v => (v.id === vData.id ? ({ ...v, ...vData } as VoucherItem) : v));
    } else {
      const newV: VoucherItem = {
        ...vData,
        id: 'voucher-' + Date.now(),
        createdAt: new Date().toISOString().split('T')[0],
      } as VoucherItem;
      nextVouchers = [newV, ...appData.vouchers];
    }
    await updateAppData({ ...appData, vouchers: nextVouchers });
  };

  const handleUpdateVoucherStatus = async (id: string, status: 'unredeemed' | 'redeemed') => {
    const nextVouchers = appData.vouchers.map(v => (v.id === id ? { ...v, status } : v));
    await updateAppData({ ...appData, vouchers: nextVouchers });
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!confirm('确定要删除该卡券记录吗？')) return;
    const nextVouchers = appData.vouchers.filter(v => v.id !== id);
    await updateAppData({ ...appData, vouchers: nextVouchers });
  };

  // Toggle preferred currency
  const handleToggleCurrency = async () => {
    const nextCur = appData.settings.preferredCurrency === 'CNY' ? 'USD' : 'CNY';
    await updateAppData({
      ...appData,
      settings: { ...appData.settings, preferredCurrency: nextCur },
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-sans selection:bg-zinc-900 selection:text-white antialiased">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSmartParser={() => setIsSmartModalOpen(true)}
        onLockVault={handleLockVault}
        isLocked={isLocked}
        appData={appData}
        onImportBackup={updateAppData}
        preferredCurrency={appData.settings.preferredCurrency}
        onToggleCurrency={handleToggleCurrency}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Tab 1: Subscriptions (Clean & Spacious) */}
        {activeTab === 'subscriptions' && (
          <div className="animate-fadeIn space-y-6">
            {/* Urgent Warning Banner (Minimal & focused) */}
            <UrgentReminderBanner
              subscriptions={appData.subscriptions}
              onMarkRenewed={handleMarkRenewed}
              onOpenRechargeWithService={(key, sub) => {
                if (key === 'apple' || sub?.paymentMethod?.includes('Apple') || sub?.serviceKey === 'openai') {
                  handleOpenAppleWebRedeem(undefined, sub);
                } else {
                  setActiveTab('vouchers');
                }
              }}
            />

            {/* Subscription List */}
            <SubscriptionList
              subscriptions={appData.subscriptions}
              onAddNew={() => {
                setEditingSub(null);
                setIsSubModalOpen(true);
              }}
              onOpenSmartParser={() => setIsSmartModalOpen(true)}
              onEdit={(sub) => {
                setEditingSub(sub);
                setIsSubModalOpen(true);
              }}
              onDelete={handleDeleteSubscription}
              onMarkRenewed={handleMarkRenewed}
              onQuickRecharge={(key, sub) => {
                if (key === 'apple' || sub?.paymentMethod?.includes('Apple') || sub?.serviceKey === 'openai') {
                  handleOpenAppleWebRedeem(undefined, sub);
                } else {
                  setActiveTab('vouchers');
                }
              }}
              searchTerm={searchQuery}
            />
          </div>
        )}

        {/* Tab 2: Tokens (Clean & Spacious) */}
        {activeTab === 'tokens' && (
          <div className="animate-fadeIn space-y-6">
            <TokenList
              tokens={appData.tokens}
              onAddNew={() => {
                setEditingToken(null);
                setIsTokenModalOpen(true);
              }}
              onEdit={(token) => {
                setEditingToken(token);
                setIsTokenModalOpen(true);
              }}
              onDelete={handleDeleteToken}
              searchTerm={searchQuery}
            />
          </div>
        )}

        {/* Tab 3: Vouchers & Top-up */}
        {activeTab === 'vouchers' && (
          <div className="space-y-6 animate-fadeIn">
            <QuickRechargeBar
              onOpenAppleWebRedeem={(code) => handleOpenAppleWebRedeem(code)}
              onRechargeComplete={(serviceKey, code) => {
                const v = appData.vouchers.find(item => item.code.replace(/\s+/g, '') === code.replace(/\s+/g, ''));
                if (v) {
                  handleUpdateVoucherStatus(v.id, 'redeemed');
                }
              }}
            />
            <VoucherStash
              vouchers={appData.vouchers}
              onAddNew={() => {
                setEditingVoucher(null);
                setIsVoucherModalOpen(true);
              }}
              onDelete={handleDeleteVoucher}
              onUpdateStatus={handleUpdateVoucherStatus}
              onOpenAppleWebRedeem={(code) => handleOpenAppleWebRedeem(code)}
            />
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            <OverviewStats
              subscriptions={appData.subscriptions}
              tokens={appData.tokens}
              vouchers={appData.vouchers}
              usdToCnyRate={appData.settings.usdToCnyRate}
              preferredCurrency={appData.settings.preferredCurrency}
            />
            <SpendAnalytics
              subscriptions={appData.subscriptions}
              preferredCurrency={appData.settings.preferredCurrency}
              usdToCnyRate={appData.settings.usdToCnyRate}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <AppleWebRedeemModal
        isOpen={isAppleModalOpen}
        onClose={() => setIsAppleModalOpen(false)}
        voucherCode={appleVoucherCode}
        accountEmail={appleActiveSub?.accountEmail || 'vip_subscriber@gmail.com'}
        passwordNote={appleActiveSub?.passwordNote || 'ApplePass#2026'}
        onConfirmRecharged={() => {
          if (appleActiveSub) {
            handleMarkRenewed(appleActiveSub.id);
          }
          const v = appData.vouchers.find(item => item.code.replace(/\s+/g, '') === appleVoucherCode.replace(/\s+/g, ''));
          if (v) {
            handleUpdateVoucherStatus(v.id, 'redeemed');
          }
        }}
      />

      <SmartAccountModal
        isOpen={isSmartModalOpen}
        onClose={() => setIsSmartModalOpen(false)}
        onSaveSubscription={handleSaveSubscription}
        onSaveToken={handleSaveToken}
      />

      <TokenModal
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onSave={handleSaveToken}
        initialData={editingToken}
      />

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSave={handleSaveSubscription}
        onDelete={handleDeleteSubscription}
        initialData={editingSub}
      />

      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onSave={handleSaveVoucher}
        initialData={editingVoucher}
      />

      <MasterPasswordModal
        isOpen={isPasswordModalOpen}
        isInitialSetup={isInitialSetup}
        onUnlock={handleUnlock}
        onSetup={handleSetupPassword}
      />
    </div>
  );
}
