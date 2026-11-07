import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Download,
  Upload,
  CreditCard,
  Key,
  Gift,
  PieChart,
  Search,
  ChevronDown,
  Plus,
  Settings,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { exportBackup } from '../../lib/storage';
import { buildAiSubDealUrl } from '../../lib/aisubdeal';
import { AppData } from '../../types';
import { useI18n, SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n';

interface NavbarProps {
  activeTab: 'subscriptions' | 'tokens' | 'vouchers' | 'analytics';
  onTabChange: (tab: 'subscriptions' | 'tokens' | 'vouchers' | 'analytics') => void;
  onNewSubscription: () => void;
  onLockVault: () => void;
  isLocked: boolean;
  appData: AppData;
  onImportBackup: (fileText: string) => void | Promise<void>;
  preferredCurrency: 'CNY' | 'USD';
  onToggleCurrency: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenSecurityModal: () => void;
  onOpenSettings: () => void;
  onLanguageChange?: (lang: SupportedLanguage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onNewSubscription,
  onLockVault,
  isLocked,
  appData,
  onImportBackup,
  preferredCurrency,
  onToggleCurrency,
  searchQuery,
  onSearchChange,
  onOpenSecurityModal,
  onOpenSettings,
  onLanguageChange,
}) => {
  const { t, format, language, setLanguage } = useI18n();
  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleExport = () => {
    exportBackup(appData).catch((err) => window.alert(err instanceof Error ? err.message : '导出失败'));
    setShowBackupMenu(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      void onImportBackup(String(reader.result ?? ''));
    };
    reader.onerror = () => window.alert('读取备份文件失败');
    reader.readAsText(file);
    input.value = ''; // allow re-selecting the same file
    setShowBackupMenu(false);
  };

  const handleSelectLanguage = (langCode: SupportedLanguage) => {
    setLanguage(langCode);
    onLanguageChange?.(langCode);
    setShowLangMenu(false);
  };

  interface NavItemDef {
    key: 'subscriptions' | 'tokens' | 'vouchers' | 'analytics';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }

  const navItems: NavItemDef[] = [
    { key: 'subscriptions', label: t.common.navSubscriptions, icon: CreditCard, count: appData.subscriptions.length },
    { key: 'tokens', label: t.common.navTokens, icon: Key, count: appData.tokens.length },
    { key: 'vouchers', label: t.common.navVouchers, icon: Gift, count: appData.vouchers.filter(v => v.status === 'unredeemed').length },
    { key: 'analytics', label: t.common.navAnalytics, icon: PieChart },
  ];

  const utilityButton = 'h-9 rounded-lg bg-white hover:bg-inset border border-line text-ink-soft hover:text-ink transition-colors flex items-center justify-center';

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 h-14 px-4 flex items-center justify-between gap-3 bg-white border-b border-line lg:fixed lg:inset-y-0 lg:left-0 lg:h-auto lg:w-60 lg:flex-col lg:items-stretch lg:justify-start lg:gap-0 lg:px-3 lg:py-5 lg:border-b-0 lg:border-r">

      {/* Brand */}
      <div
        onClick={onOpenSecurityModal}
        className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none lg:order-1 lg:px-2 lg:mb-5"
        title={t.common.viewSecurityWhitepaper}
      >
        <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-white shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-ink leading-none">{t.common.appName}</span>
            <span className="hidden sm:inline text-[11px] px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-700 font-semibold leading-none whitespace-nowrap">
              AES-256
            </span>
          </div>
          <span className="hidden lg:block text-xs text-muted leading-none mt-1.5 whitespace-nowrap">
            {t.common.tagline}
          </span>
        </div>
      </div>

      {/* AISubDeal Ecosystem Link + Local-only trust signal (sidebar foot) */}
      <div className="hidden lg:flex lg:flex-col lg:gap-2 lg:order-5 lg:mt-auto mb-3">
        <a
          href={buildAiSubDealUrl('/pricing/', language)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-brand-50/70 hover:bg-brand-100/80 border border-brand-200/60 text-left transition-colors block"
          title={t.aisubdeal.navLink}
        >
          <span className="flex items-center justify-between gap-1.5 text-xs font-semibold text-brand-800 whitespace-nowrap">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-700 shrink-0" />
              <span>{t.aisubdeal.navLink}</span>
            </span>
            <ExternalLink className="w-3 h-3 text-brand-600 shrink-0" />
          </span>
          <span className="block text-[11px] text-brand-700 mt-0.5 pl-5 truncate">
            {t.aisubdeal.navSub}
          </span>
        </a>

        <button
          type="button"
          onClick={onOpenSecurityModal}
          className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-left transition-colors cursor-pointer"
          title={t.common.viewSecurityWhitepaper}
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-emerald-800 whitespace-nowrap">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            {t.common.offlineBadge}
          </span>
          <span className="block text-xs text-emerald-700 mt-0.5 pl-6">{t.common.offlineBadgeSub}</span>
        </button>
      </div>

      {/* Search */}
      <div className="field hidden md:flex md:flex-1 md:max-w-xs lg:flex-none lg:max-w-none lg:order-3 items-center h-9 lg:h-10 rounded-lg px-3 gap-2 lg:mb-4">
        <Search className="w-4 h-4 text-muted shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t.common.searchPlaceholder}
          aria-label={t.common.searchAriaLabel}
          className="w-full min-w-0 text-[13px] text-ink placeholder:text-muted outline-none bg-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            aria-label={t.common.clearSearch}
            className="w-5 h-5 rounded-md bg-inset hover:bg-line text-muted text-xs flex items-center justify-center transition-colors shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* Sections: sidebar list on desktop, bottom tab bar on phones */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex bg-white border-t border-line pb-[env(safe-area-inset-bottom)] lg:static lg:order-4 lg:flex-col lg:gap-1 lg:border-0 lg:pb-0">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex-1 lg:flex-none h-16 lg:h-10 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-2.5 lg:px-3 lg:rounded-lg text-xs lg:text-sm whitespace-nowrap select-none transition-colors ${
                isActive
                  ? 'text-brand-700 font-semibold lg:bg-brand-50'
                  : 'text-muted hover:text-ink font-medium lg:hover:bg-inset'
              }`}
            >
              <Icon className="w-5 h-5 lg:w-[18px] lg:h-[18px]" />
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className={`absolute top-1.5 left-1/2 ml-2.5 lg:static lg:ml-auto min-w-[18px] lg:min-w-[22px] px-1 text-[11px] lg:text-xs text-center rounded-full leading-[18px] lg:leading-5 font-semibold ${
                  isActive ? 'bg-brand-700 text-white' : 'bg-inset text-muted'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 lg:contents">
        <button
          onClick={onNewSubscription}
          className="h-9 lg:h-10 w-9 lg:w-auto lg:order-2 lg:mb-3 rounded-lg btn-primary font-semibold text-sm flex items-center justify-center gap-1.5"
          title={t.common.newSubscription}
          aria-label={t.common.newSubscription}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden lg:inline">{t.common.newSubscription}</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 lg:order-6">
          {/* Currency Toggle */}
          <button
            onClick={onToggleCurrency}
            className={`${utilityButton} w-9 lg:flex-1 text-sm font-semibold`}
            title={format(t.common.switchCurrency, {
              currency: preferredCurrency,
              nextCurrency: preferredCurrency === 'CNY' ? 'USD ($)' : 'CNY (¥)',
            })}
            aria-label="Toggle currency"
          >
            {preferredCurrency === 'CNY' ? '¥' : '$'}
          </button>

          {/* Language Selector */}
          <div className="relative lg:flex-1">
            <button
              onClick={() => {
                setShowLangMenu(!showLangMenu);
                setShowBackupMenu(false);
              }}
              className={`${utilityButton} w-full px-1.5 gap-1 text-xs font-medium`}
              title={t.common.language}
              aria-label={t.common.language}
              aria-expanded={showLangMenu}
            >
              <Globe className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="truncate hidden sm:inline lg:hidden xl:inline">{currentLangObj.name}</span>
              <span className="truncate inline sm:hidden lg:inline xl:hidden font-semibold">{currentLangObj.code.toUpperCase()}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 lg:right-auto lg:left-0 lg:mt-0 lg:bottom-full lg:mb-2 w-44 rounded-2xl surface-pop p-1.5 z-50 text-sm animate-fadeIn">
                <div className="px-2.5 py-1 text-xs font-semibold text-muted">
                  {t.common.language}
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium text-xs flex items-center justify-between transition-colors ${
                      language === lang.code
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-ink hover:bg-inset'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    {language === lang.code && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Backup Menu */}
          <div className="relative lg:flex-1">
            <button
              onClick={() => {
                setShowBackupMenu(!showBackupMenu);
                setShowLangMenu(false);
              }}
              className={`${utilityButton} w-full px-2 gap-1`}
              title={t.common.backupAndRestore}
              aria-label={t.common.backupAndRestore}
              aria-expanded={showBackupMenu}
            >
              <Download className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 text-muted" />
            </button>

            {showBackupMenu && (
              <div className="absolute right-0 mt-2 lg:right-auto lg:left-0 lg:mt-0 lg:bottom-full lg:mb-2 w-64 rounded-2xl surface-pop p-1.5 z-50 text-sm animate-fadeIn">
                <div className="px-3 pt-2 pb-1 text-sm font-semibold text-ink">
                  {t.common.dataSecurityTitle}
                </div>
                <div className="px-3 pb-2 text-xs text-muted leading-relaxed">
                  {t.common.dataSecurityDesc}
                </div>
                <button
                  onClick={handleExport}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-inset text-ink font-medium flex items-center gap-2.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-muted" />
                  <span>{t.common.exportBackup}</span>
                </button>
                <label className="w-full text-left px-3 py-2 rounded-lg hover:bg-inset text-ink font-medium flex items-center gap-2.5 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-muted" />
                  <span>{t.common.importBackup}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
                <div className="my-1 border-t border-line" />
                <button
                  onClick={() => {
                    setShowBackupMenu(false);
                    onOpenSecurityModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 text-emerald-800 font-medium flex items-center gap-2.5 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.common.viewSecurityWhitepaper}</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenSettings}
            className={`${utilityButton} w-9 lg:flex-1`}
            title={t.common.settings}
            aria-label={t.common.settings}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onLockVault}
            className={`h-9 w-9 lg:flex-1 rounded-lg border flex items-center justify-center transition-colors ${
              isLocked
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white hover:bg-inset border-line text-ink-soft hover:text-ink'
            }`}
            title={isLocked ? t.common.vaultLocked : t.common.lockVault}
            aria-label={isLocked ? t.common.vaultLocked : t.common.lockVault}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
