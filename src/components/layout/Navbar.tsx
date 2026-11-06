import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Download,
  Upload,
  Sparkles,
  Key,
  CreditCard,
  Gift,
  PieChart,
  Search,
  ChevronDown,
  Plus
} from 'lucide-react';
import { exportBackup } from '../../lib/storage';
import { AppData } from '../../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'subscriptions' | 'tokens' | 'vouchers' | 'analytics';
  onTabChange: (tab: 'dashboard' | 'subscriptions' | 'tokens' | 'vouchers' | 'analytics') => void;
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
}) => {
  const [showBackupMenu, setShowBackupMenu] = useState(false);

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

  interface NavItemDef {
    key: 'dashboard' | 'subscriptions' | 'tokens' | 'vouchers' | 'analytics';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
  }

  const navItems: NavItemDef[] = [
    { key: 'subscriptions', label: '我的订阅', icon: CreditCard, count: appData.subscriptions.length },
    { key: 'tokens', label: 'Token 密钥', icon: Key, count: appData.tokens.length },
    { key: 'vouchers', label: '礼品券直充', icon: Gift, count: appData.vouchers.filter(v => v.status === 'unredeemed').length },
    { key: 'analytics', label: '支出统计', icon: PieChart },
  ];

  return (
    <header className="sticky top-0 z-40 bg-brand-900 border-b border-brand-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 min-h-16 py-2 lg:py-0 flex flex-wrap lg:flex-nowrap items-center justify-between gap-x-3 gap-y-1 lg:gap-x-4">

        {/* Brand: obsidian seal + wordmark */}
        <div
          onClick={onOpenSecurityModal}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer group select-none"
          title="点击查看数据安全与 100% 纯本地离线架构说明"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white group-hover:bg-brand-400 transition-colors">
            <ShieldCheck className="w-[18px] h-[18px]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[17px] tracking-tight text-white leading-none">Vsmat</span>
              <span className="hidden sm:inline text-xs px-1.5 py-px rounded-md bg-white/10 text-brand-100 font-medium border border-white/15 font-mono">
                AES-256
              </span>
            </div>
            <span className="text-xs text-brand-200 hidden 2xl:inline leading-none mt-1 whitespace-nowrap">
              纯本地加密金库 · 零云端上传
            </span>
          </div>
        </div>

        {/* Local-only trust signal (desktop) */}
        <button
          type="button"
          onClick={onOpenSecurityModal}
          className="hidden 2xl:flex items-center gap-2 px-2.5 h-7 rounded-md bg-brand-800 hover:bg-brand-700 border border-brand-700 text-brand-100 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
          title="点击查看数据安全白皮书"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-brand-300"></span>
          <span>100% 纯本地离线</span>
          <span className="text-brand-300">· 零云端存储</span>
        </button>

        {/* Search */}
        <div className="field relative flex-1 max-w-[17rem] xl:max-w-xs 2xl:max-w-sm hidden md:flex items-center h-9 rounded-lg px-3 gap-2">
          <Search className="w-3.5 h-3.5 text-muted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索任何服务、账号或密钥..."
            aria-label="搜索"
            className="w-full min-w-0 text-[13px] text-ink placeholder:text-muted outline-none bg-transparent"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              aria-label="清除搜索"
              className="w-5 h-5 rounded-md bg-inset hover:bg-line text-muted text-xs flex items-center justify-center transition-colors shrink-0"
            >
              ✕
            </button>
          ) : (
            <kbd className="hidden 2xl:inline text-xs font-mono px-1.5 py-px rounded-md bg-inset text-muted border border-line pointer-events-none shrink-0">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Section tabs: underline style; second row on small screens */}
        <nav className="order-last w-full lg:order-none lg:w-auto flex items-stretch self-stretch overflow-x-auto gap-0 lg:gap-1 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 border-t border-white/10 lg:border-0">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex-1 lg:flex-none shrink-0 flex items-center justify-center gap-1.5 px-3 lg:px-3.5 h-11 lg:h-16 text-sm whitespace-nowrap select-none transition-colors border-b-2 -mb-px lg:mb-0 ${
                  isActive
                    ? 'text-white font-semibold border-brand-300'
                    : 'text-brand-200 hover:text-white font-medium border-transparent'
                }`}
              >
                <Icon className="w-4 h-4 hidden xl:block" />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-xs font-mono px-1.5 min-w-[20px] text-center rounded-md leading-5 font-medium ${
                    isActive ? 'bg-brand-300 text-brand-950' : 'bg-white/10 text-brand-100'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onNewSubscription}
            className="h-9 px-3.5 rounded-lg bg-brand-300 hover:bg-brand-200 text-brand-950 transition-colors font-semibold text-sm flex items-center gap-1.5"
            title="新建订阅（支持截图智能识别与手动录入）"
            aria-label="新建订阅"
          >
            <Plus className="w-4 h-4 stroke-[2.25]" />
            <span className="hidden sm:inline">新建订阅</span>
          </button>

          <button
            onClick={onToggleCurrency}
            className="h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white text-sm font-mono font-semibold flex items-center justify-center transition-colors"
            title={`当前显示币种：${preferredCurrency}，点击切换为 ${preferredCurrency === 'CNY' ? 'USD ($)' : 'CNY (¥)'}`}
            aria-label="切换币种"
          >
            {preferredCurrency === 'CNY' ? '¥' : '$'}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              className="h-9 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors flex items-center gap-1"
              title="本地加密备份与恢复"
              aria-label="备份与恢复"
              aria-expanded={showBackupMenu}
            >
              <Download className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 text-brand-200" />
            </button>

            {showBackupMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl surface-pop p-1.5 z-50 text-sm animate-fadeIn">
                <div className="px-3 pt-2 pb-1 text-xs font-semibold text-ink">
                  数据安全与迁移
                </div>
                <div className="px-3 pb-2 text-xs text-muted leading-relaxed">
                  数据 100% 驻留于本机 LocalStorage，无云端数据库。建议定期导出备份。
                </div>
                <button
                  onClick={handleExport}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-inset text-ink font-medium flex items-center gap-2.5 transition-colors"
                >
                  <Download className="w-4 h-4 text-ink-soft" />
                  <span>导出本地备份 (.json)</span>
                </button>
                <label className="w-full text-left px-3 py-2 rounded-lg hover:bg-inset text-ink font-medium flex items-center gap-2.5 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-ink-soft" />
                  <span>导入本地备份 (.json)</span>
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
                  <span>查看数据安全白皮书</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onLockVault}
            className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors ${
              isLocked
                ? 'bg-amber-100 border-amber-300 text-amber-800'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
            }`}
            title={isLocked ? '保险箱已锁定' : '立即锁定保险箱'}
            aria-label={isLocked ? '保险箱已锁定' : '立即锁定保险箱'}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
