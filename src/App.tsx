import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { SubscriptionItem, TokenItem, VoucherItem } from './types';
import {
  advanceBillingDate,
  exportBackup,
  parseBackup,
  probeBackup,
} from './lib/storage';
import { todayLocal as todayStr } from './lib/date';
import { useVault } from './hooks/useVault';
import { checkAndSendRenewalNotifications } from './lib/notifications';
import { buildAiSubDealUrl, syncAiSubDealDataset } from './lib/aisubdeal';
import { parseUrlImportParams, clearUrlImportParams } from './lib/urlImport';
import {
  handleOutgoingAutoMigration,
  hasLocalVault,
  isLegacyDomain,
  startMigrationToNewDomain,
} from './lib/migration';
import { Navbar } from './components/layout/Navbar';
import { UrgentReminderBanner } from './components/dashboard/UrgentReminderBanner';
import { SubscriptionList } from './components/subscriptions/SubscriptionList';
import { MasterPasswordModal } from './components/auth/MasterPasswordModal';
import { ShieldCheck, AlertCircle, X } from 'lucide-react';
import { I18nProvider, useI18n, SupportedLanguage } from './i18n';

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
const SettingsModal = lazy(() => import('./components/settings/SettingsModal').then((m) => ({ default: m.SettingsModal })));
const DataSecurityModal = lazy(() => import('./components/common/DataSecurityModal').then((m) => ({ default: m.DataSecurityModal })));

const RENEW_GUARD_MS = 800;
const newId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

interface AppContentProps {
  vault: ReturnType<typeof useVault>;
}

function AppContent({ vault }: AppContentProps) {
  const { t, language, setLanguage } = useI18n();

  const {
    data: appData,
    status,
    loadError,
    saveError,
    isBiometricsSupported,
    isBiometricsEnrolled,
    biometricsInfo,
    dismissSaveError,
    update,
    setup,
    unlock,
    unlockBiometrics,
    toggleBiometrics,
    lock,
    changePassword,
    setRemember,
    justMigrated,
    clearJustMigrated,
  } = vault;

  const isLocked = status === 'locked';
  const isPasswordModalOpen = status === 'setup' || status === 'locked';
  const isInitialSetup = status === 'setup';

  const [showLegacyBanner, setShowLegacyBanner] = useState(false);
  const [showEmptyMigrationToast, setShowEmptyMigrationToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'tokens' | 'vouchers' | 'analytics'>('subscriptions');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const tabTitles = {
    subscriptions: t.common.navSubscriptions,
    tokens: t.common.navTokens,
    vouchers: t.common.navVouchers,
    analytics: t.common.navAnalytics,
  };

  // Renewal notifications: once per unlock, only after real data is available
  const notifiedRef = useRef(false);
  const pendingImportRef = useRef<Partial<SubscriptionItem> | null>(null);

  // Check URL for 1-click import from aisubdeal.com & silently sync latest dataset on boot
  useEffect(() => {
    if (handleOutgoingAutoMigration()) return;
    if (isLegacyDomain() && hasLocalVault()) {
      setShowLegacyBanner(true);
    }
    void syncAiSubDealDataset();
    if (typeof window !== 'undefined' && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('migration_empty') === '1') {
        setShowEmptyMigrationToast(true);
        searchParams.delete('migration_empty');
        const nextSearch = searchParams.toString();
        const nextUrl = window.location.pathname + (nextSearch ? `?${nextSearch}` : '') + window.location.hash;
        window.history.replaceState(null, '', nextUrl);
      }
      const imported = parseUrlImportParams(window.location.search);
      if (imported) {
        pendingImportRef.current = imported;
        clearUrlImportParams();
      }
    }
  }, []);

  useEffect(() => {
    if (status === 'ready') {
      if (isLegacyDomain() && handleOutgoingAutoMigration(appData)) {
        return;
      }
      if (!notifiedRef.current) {
        notifiedRef.current = true;
        if (appData.settings.enableBrowserNotifications) {
          checkAndSendRenewalNotifications(appData.subscriptions);
        }
      }
      if (pendingImportRef.current) {
        const prefill = pendingImportRef.current as SubscriptionItem;
        pendingImportRef.current = null;
        setActiveTab('subscriptions');
        setEditingSub(prefill);
        setIsSubModalOpen(true);
      }
    }
    if (status === 'locked') notifiedRef.current = false;
  }, [status, appData]);

  // Locking must not leave decrypted values on screen in an open modal
  useEffect(() => {
    if (status !== 'locked') return;
    setIsSecurityModalOpen(false);
    setIsSettingsOpen(false);
    setIsTokenModalOpen(false);
    setEditingToken(null);
    setIsSubModalOpen(false);
    setEditingSub(null);
    setIsVoucherModalOpen(false);
    setEditingVoucher(null);
    setIsAppleModalOpen(false);
    setAppleVoucherCode('');
    setAppleActiveSub(null);
  }, [status]);

  const handleUnlock = (password: string, remember: boolean) => unlock(password, remember);
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

  const lastRenewAtRef = useRef(0);
  const handleMarkRenewed = (subId: string): boolean => {
    const now = Date.now();
    if (now - lastRenewAtRef.current < RENEW_GUARD_MS) return false;
    lastRenewAtRef.current = now;

    update((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub) => {
        if (sub.id !== subId || sub.cycle === 'lifetime') return sub;
        const nextDate = advanceBillingDate(sub.nextBillingDate, sub.cycle);
        const newHistoryItem = {
          id: newId('h'),
          date: todayStr(),
          amount: sub.price,
          currency: sub.currency,
          note: `自动顺延续费至 ${nextDate}`,
          previousBillingDate: sub.nextBillingDate,
        };
        return {
          ...sub,
          nextBillingDate: nextDate,
          history: [newHistoryItem, ...(sub.history || [])],
          updatedAt: todayStr(),
        };
      }),
    }));
    return true;
  };

  const handleUndoRenewal = (subId: string) => {
    update((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((sub) => {
        const [latest, ...rest] = sub.history || [];
        if (sub.id !== subId || !latest?.previousBillingDate) return sub;
        return { ...sub, nextBillingDate: latest.previousBillingDate, history: rest, updatedAt: todayStr() };
      }),
    }));
  };

  const handleOpenAppleWebRedeem = (code?: string, sub?: SubscriptionItem) => {
    const effectiveSub = sub || appData.subscriptions.find(s => s.serviceKey === 'openai' || s.paymentMethod?.includes('Apple')) || appData.subscriptions[0];
    const appleVoucher = appData.vouchers.find(v => v.serviceKey === 'apple' && v.status === 'unredeemed');

    setAppleVoucherCode(code || appleVoucher?.code || '');
    setAppleActiveSub(effectiveSub || null);
    setIsAppleModalOpen(true);
  };

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
    update((prev) => ({ ...prev, tokens: prev.tokens.filter(t => t.id !== id) }));
  };

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
    update((prev) => ({ ...prev, subscriptions: prev.subscriptions.filter(s => s.id !== id) }));
  };

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
    update((prev) => ({ ...prev, vouchers: prev.vouchers.filter(v => v.id !== id) }));
  };

  const findVoucherByCode = (code: string) =>
    appData.vouchers.find(item => item.code.replace(/\s+/g, '') === code.replace(/\s+/g, ''));

  const handleToggleCurrency = () => {
    update((prev) => ({
      ...prev,
      settings: { ...prev.settings, preferredCurrency: prev.settings.preferredCurrency === 'CNY' ? 'USD' : 'CNY' },
    }));
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    update((prev) => ({
      ...prev,
      settings: { ...prev.settings, language: lang },
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
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans antialiased lg:pl-60 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
      {showLegacyBanner && (
        <aside className="bg-gradient-to-r from-amber-500 to-amber-600 text-brand-950 px-4 py-2.5 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-md z-40">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden>📢</span>
            <span>{t.migration.bannerText}</span>
          </div>
          <button
            type="button"
            onClick={() => startMigrationToNewDomain(undefined, status === 'ready' ? appData : undefined)}
            className="bg-brand-950 hover:bg-brand-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <span>{t.migration.bannerBtn}</span>
            <span aria-hidden>→</span>
          </button>
        </aside>
      )}

      {justMigrated && (
        <div
          role="status"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-pop text-xs font-semibold flex items-center gap-3 animate-fadeIn border border-emerald-500"
        >
          <span>{t.migration.successToast}</span>
          <button
            type="button"
            onClick={clearJustMigrated}
            className="text-white/80 hover:text-white ml-2 text-sm cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

      {showEmptyMigrationToast && (
        <div
          role="status"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white px-5 py-3 rounded-2xl shadow-pop text-xs font-semibold flex items-center gap-3 animate-fadeIn border border-amber-500 max-w-md text-center"
        >
          <span>{t.migration.emptySearchOldDomainToast}</span>
          <button
            type="button"
            onClick={() => setShowEmptyMigrationToast(false)}
            className="text-white/80 hover:text-white ml-2 text-sm cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      )}

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
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLanguageChange={handleLanguageChange}
      />

      {saveError && (
        <div role="alert" className="bg-rose-50 border-b border-rose-200 text-rose-700 text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{t.common.saveFailed} {saveError}</span>
          <button onClick={dismissSaveError} aria-label={t.common.close} className="ml-2"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <Suspense fallback={<div className="flex-1" aria-busy="true" />}>
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-9 space-y-6">
        <h1 className="text-2xl lg:text-[28px] font-bold tracking-tight text-ink leading-tight">{tabTitles[activeTab]}</h1>

        {/* Tab 1: Subscriptions (Clean & Spacious) */}
        {activeTab === 'subscriptions' && (
          <div className="animate-fadeIn space-y-6">
            {/* Urgent Warning Banner */}
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
              usdToCnyRate={appData.settings.usdToCnyRate}
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
              onSearchChange={setSearchQuery}
            />
          </div>
        )}

        {/* Tab 3: Vouchers & Top-up */}
        {activeTab === 'vouchers' && (
          <div className="space-y-6 animate-fadeIn">
            <QuickRechargeBar
              onOpenAppleWebRedeem={(code) => handleOpenAppleWebRedeem(code)}
              isStoredVoucher={(code) => findVoucherByCode(code) !== undefined}
              onConfirmRedeemed={(code) => {
                const v = findVoucherByCode(code);
                if (v) handleUpdateVoucherStatus(v.id, 'redeemed');
              }}
            />
            <VoucherStash
              vouchers={appData.vouchers}
              onAddNew={() => {
                setEditingVoucher(null);
                setIsVoucherModalOpen(true);
              }}
              onEdit={(voucher) => {
                setEditingVoucher(voucher);
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

      {/* Clean Footer with Security & Privacy Guarantee */}
      <footer className="mt-auto px-4 sm:px-6 lg:px-10 py-5 text-xs text-muted">
        <div className="max-w-[1160px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-ink-soft">{t.common.footerTitle}</span>
            <span className="hidden md:inline">· {t.common.footerSubtitle}</span>
          </div>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <a
              href={buildAiSubDealUrl('/pricing/', language)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 hover:text-brand-800 font-medium transition-colors"
            >
              {t.aisubdeal.navLink}
            </a>
            <span>·</span>
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="text-brand-700 hover:text-brand-800 font-medium transition-colors"
            >
              {t.common.footerWhitepaper}
            </button>
            <span>·</span>
            <span>{t.common.footerEncryption}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <Suspense fallback={null}>
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={appData.settings}
          onChangeSettings={(patch) => update((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))}
          onChangeRemember={setRemember}
          onChangePassword={changePassword}
          isBiometricsSupported={isBiometricsSupported}
          isBiometricsEnrolled={isBiometricsEnrolled}
          biometricsInfo={biometricsInfo}
          onToggleBiometrics={toggleBiometrics}
        />
      )}
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
          usdToCnyRate={appData.settings.usdToCnyRate}
          preferredCurrency={appData.settings.preferredCurrency}
          onUndoRenewal={handleUndoRenewal}
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
        onSetup={async (pw, remember, enableBio) => {
          await setup(pw, remember, enableBio);
        }}
        isBiometricsSupported={isBiometricsSupported}
        isBiometricsEnrolled={isBiometricsEnrolled}
        biometricsLabel={biometricsInfo.short}
        onBiometricUnlock={unlockBiometrics}
      />
    </div>
  );
}

export function App() {
  const vault = useVault();
  return (
    <I18nProvider
      language={vault.data.settings.language}
      onLanguageChange={(lang) => {
        vault.update((prev) => ({
          ...prev,
          settings: { ...prev.settings, language: lang },
        }));
      }}
    >
      <AppContent vault={vault} />
    </I18nProvider>
  );
}
