import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { AppData, SubscriptionItem, TokenItem, VoucherItem } from './types';
import {
  advanceBillingDate,
  exportBackup,
  parseBackup,
  probeBackup,
} from './lib/storage';
import { todayLocal as todayStr } from './lib/date';
import { useVault } from './hooks/useVault';
import { checkAndSendRenewalNotifications } from './lib/notifications';
import { Navbar } from './components/layout/Navbar';
import { UrgentReminderBanner } from './components/dashboard/UrgentReminderBanner';
import { SubscriptionList } from './components/subscriptions/SubscriptionList';
import { MasterPasswordModal } from './components/auth/MasterPasswordModal';
import { ShieldCheck, AlertCircle, X } from 'lucide-react';

// Code-split: tabs/modals the user hasn't opened yet are fetched on demand.
const TokenList = lazy(() => import('./components/tokens/TokenList').then((m) => ({ default: m.TokenList })));
const TokenModal = lazy(() => import('./components/tokens/TokenModal').then((m) => ({ default: m.TokenModal })));
const SubscriptionModal = lazy(() => import('./components/subscriptions/SubscriptionModal').then((m) => ({ default: m.SubscriptionModal })));
const VoucherStash = lazy(() => import('./components/recharge/VoucherStash').then((m) => ({ default: m.VoucherStash })));
const VoucherModal = lazy(() => import('./components/recharge/VoucherModal').then((m) => ({ default: m.VoucherModal })));
const AppleWebRedeemModal = lazy(() => import('./components/recharge/AppleWebRedeemModal').then((m) => ({ default: m.AppleWebRedeemModal })));
const SpendAnalytics = lazy(() => import('./components/analytics/SpendAnalytics').then((m) => ({ default: m.SpendAnalytics })));
const OverviewStats = lazy(() => import('./components/dashboard/OverviewStats').then((m) => ({ default: m.OverviewStats })));
const QuickRechargeBar = lazy(() => import('./components/dashboard/QuickRechargeBar').then((m) => ({ default: m.QuickRechargeBar })));
const DataSecurityModal = lazy(() => import('./components/common/DataSecurityModal').then((m) => ({ default: m.DataSecurityModal })));

const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

export function App() {
  const { data: appData, status, loadError, saveError, dismissSaveError, update, setup, unlock, lock } = useVault();
  const isLocked = status === 'locked';
  const isPasswordModalOpen = status === 'setup' || status === 'locked';
  const isInitialSetup = status === 'setup';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'subscriptions' | 'tokens' | 'vouchers' | 'analytics'>('subscriptions');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Modals state
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

  // Renewal notifications: once per unlock, only after real data is available
  const notifiedRef = useRef(false);
  useEffect(() => {
    if (status === 'ready' && !notifiedRef.current) {
      notifiedRef.current = true;
      if (appData.settings.enableBrowserNotifications) {
        checkAndSendRenewalNotifications(appData.subscriptions);
      }
    }
    if (status === 'locked') notifiedRef.current = false;
  }, [status, appData]);

  const handleUnlock = (password: string, remember: boolean) => unlock(password, remember);
  const handleSetupPassword = (password: string, remember: boolean) => setup(password, remember);
  const handleLockVault = () => void lock();

  // Replace the vault contents with a backup file, after validation + confirmation
  const handleImportBackup = async (text: string) => {
    try {
      const probe = probeBackup(text);
      let password: string | undefined;
      if (probe.kind === 'encrypted' && probe.needsPassword) {
        const entered = window.prompt('该备份使用了不同的主密码加密，请输入备份文件的主密码：');
        if (!entered) return;
        password = entered;
      }
      const imported = await parseBackup(text, password);
      const summary = `${imported.tokens.length} 个 Token、${imported.subscriptions.length} 个订阅、${imported.vouchers.length} 张卡券`;
      if (!window.confirm(`备份包含 ${summary}。\n导入将【覆盖】当前保险箱内容，确定继续吗？\n（覆盖前会先自动下载一份当前数据的加密备份）`)) return;
      await exportBackup(appData, `vsmat-before-import-${todayStr()}.vsmat.json`);
      update({ ...imported, settings: { ...imported.settings, isConfigured: true } });
      window.alert('数据备份已成功导入！');
    } catch (err) {
      window.alert(err instanceof Error ? err.message : '导入备份失败');
    }
  };

  // Mark a subscription as renewed
  const handleMarkRenewed = (subId: string) => {
    update((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub) => {
        if (sub.id !== subId) return sub;
        const nextDate = advanceBillingDate(sub.nextBillingDate, sub.cycle);
        const newHistoryItem = {
          id: newId('h'),
          date: todayStr(),
          amount: sub.price,
          currency: sub.currency,
          note: `自动顺延续费至 ${nextDate}`,
        };
        return {
          ...sub,
          nextBillingDate: nextDate,
          history: [newHistoryItem, ...(sub.history || [])],
          updatedAt: todayStr(),
        };
      }),
    }));
  };

  // Open Apple Web Redeem Modal (Method 1)
  const handleOpenAppleWebRedeem = (code?: string, sub?: SubscriptionItem) => {
    const effectiveSub = sub || appData.subscriptions.find(s => s.serviceKey === 'openai' || s.paymentMethod?.includes('Apple')) || appData.subscriptions[0];
    const appleVoucher = appData.vouchers.find(v => v.serviceKey === 'apple' && v.status === 'unredeemed');

    setAppleVoucherCode(code || appleVoucher?.code || '');
    setAppleActiveSub(effectiveSub || null);
    setIsAppleModalOpen(true);
  };

  // Token Handlers
  const handleSaveToken = (tokenData: Partial<TokenItem>) => {
    update((prev) => {
      if (tokenData.id) {
        return {
          ...prev,
          tokens: prev.tokens.map(t => (t.id === tokenData.id ? ({ ...t, ...tokenData } as TokenItem) : t)),
        };
      }
      const newToken = {
        ...tokenData,
        id: newId('token'),
        createdAt: todayStr(),
        updatedAt: todayStr(),
      } as TokenItem;
      return { ...prev, tokens: [newToken, ...prev.tokens] };
    });
  };

  const handleDeleteToken = (id: string) => {
    if (!confirm('确定要删除该 Token 密钥吗？')) return;
    update((prev) => ({ ...prev, tokens: prev.tokens.filter(t => t.id !== id) }));
  };

  // Subscription Handlers
  const handleSaveSubscription = (subData: Partial<SubscriptionItem>) => {
    update((prev) => {
      if (subData.id) {
        return {
          ...prev,
          subscriptions: prev.subscriptions.map(s => (s.id === subData.id ? ({ ...s, ...subData } as SubscriptionItem) : s)),
        };
      }
      const newSub = {
        ...subData,
        id: newId('sub'),
        history: [],
        createdAt: todayStr(),
        updatedAt: todayStr(),
      } as SubscriptionItem;
      return { ...prev, subscriptions: [newSub, ...prev.subscriptions] };
    });
  };

  const handleDeleteSubscription = (id: string) => {
    if (!confirm('确定要删除该订阅账号记录吗？')) return;
    update((prev) => ({ ...prev, subscriptions: prev.subscriptions.filter(s => s.id !== id) }));
  };

  // Voucher Handlers
  const handleSaveVoucher = (vData: Partial<VoucherItem>) => {
    update((prev) => {
      if (vData.id) {
        return {
          ...prev,
          vouchers: prev.vouchers.map(v => (v.id === vData.id ? ({ ...v, ...vData } as VoucherItem) : v)),
        };
      }
      const newV = { ...vData, id: newId('voucher'), createdAt: todayStr() } as VoucherItem;
      return { ...prev, vouchers: [newV, ...prev.vouchers] };
    });
  };

  const handleUpdateVoucherStatus = (id: string, status: 'unredeemed' | 'redeemed') => {
    update((prev) => ({ ...prev, vouchers: prev.vouchers.map(v => (v.id === id ? { ...v, status } : v)) }));
  };

  const handleDeleteVoucher = (id: string) => {
    if (!confirm('确定要删除该卡券记录吗？')) return;
    update((prev) => ({ ...prev, vouchers: prev.vouchers.filter(v => v.id !== id) }));
  };

  // Toggle preferred currency
  const handleToggleCurrency = () => {
    update((prev) => ({
      ...prev,
      settings: { ...prev.settings, preferredCurrency: prev.settings.preferredCurrency === 'CNY' ? 'USD' : 'CNY' },
    }));
  };

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="font-semibold text-ink">无法加载保险箱</p>
          <p className="text-sm text-muted">{loadError}</p>
          <p className="text-xs text-muted">为避免覆盖你的数据，应用已停止。请先从备份恢复或检查浏览器存储。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans antialiased">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewSubscription={() => {
          setEditingSub(null);
          setIsSubModalOpen(true);
        }}
        onLockVault={handleLockVault}
        isLocked={isLocked}
        appData={appData}
        onImportBackup={handleImportBackup}
        preferredCurrency={appData.settings.preferredCurrency}
        onToggleCurrency={handleToggleCurrency}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
      />

      {saveError && (
        <div role="alert" className="bg-rose-50 border-b border-rose-200 text-rose-700 text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>保存失败，最近的修改可能未写入本地：{saveError}</span>
          <button onClick={dismissSaveError} aria-label="关闭" className="ml-2"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <Suspense fallback={<div className="flex-1" aria-busy="true" />}>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
          <div className="space-y-8 animate-fadeIn">
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
      </Suspense>

      {/* Executive Clean Footer with Security & Privacy Guarantee */}
      <footer className="mt-auto py-8 border-t border-line text-center text-xs text-muted bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-black">Vsmat 本地加密金库</span>
            <span className="text-subtle">· 100% 纯前端离线架构 · 无后端服务器 · 零云端数据库</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="text-black hover:text-ink-soft underline decoration-line-strong hover:decoration-black transition font-medium"
            >
              数据安全与隐私白皮书
            </button>
            <span>·</span>
            <span className="font-mono text-subtle">AES-256-GCM 本地加密</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Suspense fallback={null}>
      {isSecurityModalOpen && (
        <DataSecurityModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
          onOpenExport={() => void exportBackup(appData)}
        />
      )}

      {isAppleModalOpen && (
        <AppleWebRedeemModal
          isOpen={isAppleModalOpen}
          onClose={() => setIsAppleModalOpen(false)}
          voucherCode={appleVoucherCode}
          accountEmail={appleActiveSub?.accountEmail || ''}
          passwordNote={appleActiveSub?.passwordNote || ''}
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
      )}

      {isSubModalOpen && (
        <SubscriptionModal
          isOpen={isSubModalOpen}
          onClose={() => setIsSubModalOpen(false)}
          onSave={handleSaveSubscription}
          onDelete={handleDeleteSubscription}
          initialData={editingSub}
          onSaveToken={handleSaveToken}
        />
      )}

      {isTokenModalOpen && (
        <TokenModal
          isOpen={isTokenModalOpen}
          onClose={() => setIsTokenModalOpen(false)}
          onSave={handleSaveToken}
          initialData={editingToken}
        />
      )}

      {isVoucherModalOpen && (
        <VoucherModal
          isOpen={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          onSave={handleSaveVoucher}
          initialData={editingVoucher}
        />
      )}

      </Suspense>

      <MasterPasswordModal
        isOpen={isPasswordModalOpen}
        isInitialSetup={isInitialSetup}
        onUnlock={handleUnlock}
        onSetup={handleSetupPassword}
      />
    </div>
  );
}
