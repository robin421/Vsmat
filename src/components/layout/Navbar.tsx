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
  onImportBackup: (importedData: AppData) => void;
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EBEBEB] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-3 lg:gap-6">
        
        {/* Brand Area (Executive Obsidian Monochrome) */}
        <div
          onClick={onOpenSecurityModal}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer group select-none"
          title="点击查看数据安全与 100% 纯本地离线架构说明"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#000000] border border-black/10 flex items-center justify-center text-white shadow-2xs group-hover:bg-[#222222] transition">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#000000] font-sans">Vsmat</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7F7F7] group-hover:bg-[#EBEBEB] text-[#555555] font-semibold border border-[#EBEBEB] tracking-wide font-mono transition">
                AES-256
              </span>
            </div>
            <span className="text-[11px] text-[#717171] font-medium hidden sm:inline leading-none mt-0.5 group-hover:text-[#000000] transition">
              纯本地加密金库 · 零云端上传
            </span>
          </div>
        </div>

        {/* Local Zero-Knowledge Trust Chip (Desktop) */}
        <button
          type="button"
          onClick={onOpenSecurityModal}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-medium transition cursor-pointer"
          title="点击查看数据安全白皮书"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>100% 纯本地离线</span>
          <span className="text-emerald-700/80 font-mono text-[10px]">· 零云端存储</span>
        </button>

        {/* Minimalist Floating Search Pill */}
        <div className="relative flex-1 max-w-sm md:max-w-md hidden md:flex items-center h-12 rounded-full bg-white border border-[#DDDDDD] airbnb-search-shadow px-3.5 transition-all">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="搜索任何服务、账号或密钥..."
              className="w-full text-xs font-semibold text-[#222222] placeholder:text-[#717171] placeholder:font-normal outline-none bg-transparent"
            />
          </div>
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="w-5 h-5 rounded-full bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#717171] text-xs flex items-center justify-center transition mr-1.5"
            >
              ✕
            </button>
          ) : (
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F7F7F7] text-[#717171] border border-[#EBEBEB] mr-2 pointer-events-none">
              ⌘K
            </kbd>
          )}
          {/* Circular Obsidian Search Icon Button */}
          <div className="w-8 h-8 rounded-full bg-[#000000] flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer hover:bg-[#222222] transition">
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>

        {/* Rounded Navigation Tabs (Executive Style) */}
        <nav className="flex items-center p-1 rounded-full bg-[#F7F7F7] border border-[#EBEBEB]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-white text-[#000000] shadow-[0_1px_4px_rgba(0,0,0,0.12)] font-bold'
                    : 'text-[#717171] hover:text-[#000000] hover:bg-white/60 font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#000000]' : 'text-[#717171]'}`} />
                <span className="hidden sm:inline">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full leading-tight font-bold ${
                    isActive ? 'bg-[#000000] text-white' : 'bg-[#EBEBEB] text-[#717171]'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Unified Add Subscription CTA (Executive Obsidian Monochrome) */}
          <button
            onClick={onNewSubscription}
            className="h-10 px-4 rounded-full bg-[#000000] hover:bg-[#222222] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
            title="新建订阅（支持截图智能识别与手动录入）"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="hidden sm:inline">新建订阅</span>
          </button>

          {/* Currency Toggle */}
          <button
            onClick={onToggleCurrency}
            className="h-10 w-10 rounded-full bg-white hover:bg-[#F7F7F7] border border-[#DDDDDD] hover:border-[#222222] text-[#222222] text-xs font-mono font-bold flex items-center justify-center transition shadow-2xs"
            title={`当前显示币种：${preferredCurrency}，点击切换为 ${preferredCurrency === 'CNY' ? 'USD ($)' : 'CNY (¥)'}`}
          >
            {preferredCurrency === 'CNY' ? '¥' : '$'}
          </button>

          {/* Backup Menu */}
          <div className="relative">
            <button
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              className="h-10 px-3 rounded-full bg-white hover:bg-[#F7F7F7] border border-[#DDDDDD] hover:border-[#222222] text-[#222222] text-xs transition flex items-center gap-1 shadow-2xs"
              title="本地加密备份与恢复"
            >
              <Download className="w-3.5 h-3.5 text-[#222222]" />
              <ChevronDown className="w-3 h-3 text-[#717171]" />
            </button>

            {showBackupMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-[#EBEBEB] p-2 airbnb-card z-50 text-xs animate-fadeIn shadow-xl">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#717171] uppercase tracking-wider">
                  数据安全与迁移
                </div>
                <div className="px-3 py-1 text-[11px] text-[#717171] leading-normal mb-1">
                  数据 100% 驻留于本机 LocalStorage，无云端数据库。建议定期导出备份。
                </div>
                <button
                  onClick={handleExport}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F7F7F7] text-[#222222] font-medium flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-[#000000]" />
                  <span>导出本地备份 (.json)</span>
                </button>
                <label className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F7F7F7] text-[#222222] font-medium flex items-center gap-2 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-[#000000]" />
                  <span>导入本地备份 (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
                <div className="my-1 border-t border-[#EBEBEB]" />
                <button
                  onClick={() => {
                    setShowBackupMenu(false);
                    onOpenSecurityModal();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 text-emerald-800 font-medium flex items-center gap-2 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>查看数据安全白皮书</span>
                </button>
              </div>
            )}
          </div>

          {/* Lock Vault Button */}
          <button
            onClick={onLockVault}
            className={`h-10 w-10 rounded-full border flex items-center justify-center transition active:scale-[0.98] shadow-2xs ${
              isLocked
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white hover:bg-[#F7F7F7] border-[#DDDDDD] hover:border-[#222222] text-[#222222]'
            }`}
            title={isLocked ? '保险箱已锁定' : '立即锁定保险箱'}
          >
            {isLocked ? <Lock className="w-4 h-4 text-amber-700" /> : <Unlock className="w-4 h-4 text-[#222222]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
