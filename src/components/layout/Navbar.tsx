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
  ChevronDown
} from 'lucide-react';
import { exportBackup } from '../../lib/storage';
import { AppData } from '../../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'subscriptions' | 'tokens' | 'vouchers' | 'analytics';
  onTabChange: (tab: 'dashboard' | 'subscriptions' | 'tokens' | 'vouchers' | 'analytics') => void;
  onOpenSmartParser: () => void;
  onLockVault: () => void;
  isLocked: boolean;
  appData: AppData;
  onImportBackup: (importedData: AppData) => void;
  preferredCurrency: 'CNY' | 'USD';
  onToggleCurrency: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenSmartParser,
  onLockVault,
  isLocked,
  appData,
  onImportBackup,
  preferredCurrency,
  onToggleCurrency,
  searchQuery,
  onSearchChange,
}) => {
  const [showBackupMenu, setShowBackupMenu] = useState(false);

  const handleExport = () => {
    exportBackup(appData);
    setShowBackupMenu(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.tokens && parsed.subscriptions) {
          onImportBackup(parsed);
          alert('数据备份已成功导入！');
        } else {
          alert('备份文件格式不正确');
        }
      } catch {
        alert('解析备份文件失败');
      }
    };
    reader.readAsText(file);
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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-zinc-200/80 shadow-2xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 lg:gap-6">
        
        {/* Brand Area */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-2xs ring-1 ring-zinc-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-zinc-950 font-sans">Vsmat</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-600 font-medium border border-zinc-200/80 tracking-wide font-mono">
                AES-256
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline leading-none mt-0.5">
              端到端本地加密金库
            </span>
          </div>
        </div>

        {/* Global Spotlight Search Bar */}
        <div className="relative flex-1 max-w-xs md:max-w-sm hidden md:block">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="全局搜索服务、账号、密钥..."
            className="w-full h-9 pl-9 pr-12 rounded-xl bg-zinc-50 hover:bg-zinc-100/70 focus:bg-white border border-zinc-200/80 focus:border-zinc-400 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition-all duration-150 shadow-2xs"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-600 text-[10px] flex items-center justify-center transition"
            >
              ✕
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-zinc-400 border border-zinc-200 shadow-2xs pointer-events-none">
              ⌘K
            </kbd>
          )}
        </div>

        {/* Minimalist Segmented Navigation Tabs */}
        <nav className="flex items-center p-1 rounded-xl bg-zinc-100 border border-zinc-200/80">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 select-none ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-2xs border border-zinc-200/70 font-semibold'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`} />
                <span className="hidden sm:inline">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full leading-tight ${
                    isActive ? 'bg-zinc-900 text-white font-semibold' : 'bg-zinc-200 text-zinc-700'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Smart Paste Quick Action */}
          <button
            onClick={onOpenSmartParser}
            className="h-9 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-all active:scale-[0.98]"
            title="一键粘贴/截图智能解析录入"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span className="hidden lg:inline">智能录入</span>
          </button>

          {/* Currency Toggle */}
          <button
            onClick={onToggleCurrency}
            className="h-9 w-9 rounded-xl bg-white hover:bg-zinc-50 active:scale-[0.98] text-zinc-800 border border-zinc-200/90 text-xs font-mono font-bold flex items-center justify-center transition shadow-2xs"
            title={`当前显示币种：${preferredCurrency}，点击切换为 ${preferredCurrency === 'CNY' ? 'USD ($)' : 'CNY (¥)'}`}
          >
            {preferredCurrency === 'CNY' ? '¥' : '$'}
          </button>

          {/* Backup Menu */}
          <div className="relative">
            <button
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              className="h-9 px-2.5 rounded-xl bg-white hover:bg-zinc-50 active:scale-[0.98] text-zinc-700 border border-zinc-200/90 text-xs transition flex items-center gap-1 shadow-2xs"
              title="本地加密备份与恢复"
            >
              <Download className="w-3.5 h-3.5 text-zinc-600" />
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {showBackupMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-zinc-200 p-1.5 shadow-xl z-50 text-xs animate-fadeIn">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  数据安全与迁移
                </div>
                <button
                  onClick={handleExport}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-800 flex items-center gap-2 transition"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-600" />
                  <span>导出本地备份 (.json)</span>
                </button>
                <label className="w-full text-left px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-800 flex items-center gap-2 cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-zinc-600" />
                  <span>导入本地备份 (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Lock Vault Button */}
          <button
            onClick={onLockVault}
            className={`h-9 w-9 rounded-xl border flex items-center justify-center transition active:scale-[0.98] shadow-2xs ${
              isLocked
                ? 'bg-zinc-100 border-zinc-300 text-zinc-900 font-bold'
                : 'bg-white hover:bg-zinc-50 border-zinc-200/90 text-zinc-600 hover:text-zinc-900'
            }`}
            title={isLocked ? '保险箱已锁定' : '立即锁定保险箱'}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-zinc-900" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
