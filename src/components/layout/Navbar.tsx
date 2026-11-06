import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Download, Upload, Sparkles, Key, CreditCard, Gift, LayoutDashboard, PieChart, Search } from 'lucide-react';
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
      } catch (err) {
        alert('解析备份文件失败');
      }
    };
    reader.readAsText(file);
    setShowBackupMenu(false);
  };

  const navItems = [
    { key: 'subscriptions', label: '我的订阅', icon: CreditCard },
    { key: 'tokens', label: 'Token 密钥', icon: Key },
    { key: 'vouchers', label: '礼品券直充', icon: Gift },
    { key: 'analytics', label: '支出统计', icon: PieChart },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">Vsmat</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                AES-256
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">密钥与订阅管理</p>
          </div>
        </div>

        {/* Global Single Search Bar (Unified & Calm) */}
        <div className="relative flex-1 max-w-xs md:max-w-sm hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索服务、账号、密钥..."
            className="w-full h-9 pl-9 pr-7 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Tabs (Minimalist Segmented Control) */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-subtle border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Smart Paste Quick Button */}
          <button
            onClick={onOpenSmartParser}
            className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-blue-600/20 transition active:scale-95"
            title="一键粘贴解析账号与密钥"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">智能录入</span>
          </button>

          {/* Currency Toggle */}
          <button
            onClick={onToggleCurrency}
            className="h-9 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 text-xs font-mono font-bold transition"
            title="切换币种显示"
          >
            {preferredCurrency === 'CNY' ? '¥' : '$'}
          </button>

          {/* Backup Menu */}
          <div className="relative">
            <button
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              className="h-9 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 text-xs transition flex items-center gap-1"
              title="备份与恢复"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {showBackupMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white border border-slate-200 p-1.5 shadow-xl z-50 text-xs animate-fadeIn">
                <button
                  onClick={handleExport}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>导出本地备份 (.json)</span>
                </button>
                <label className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-purple-600" />
                  <span>导入本地备份</span>
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

          {/* Lock Button */}
          <button
            onClick={onLockVault}
            className="h-9 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition"
            title={isLocked ? '已锁定' : '锁定保险箱'}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
