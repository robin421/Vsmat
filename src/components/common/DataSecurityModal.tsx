import React from 'react';
import { ShieldCheck, Lock, HardDrive, Cpu, EyeOff, CheckCircle2, X, Terminal, ExternalLink, Download } from 'lucide-react';

interface DataSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExport?: () => void;
}

export const DataSecurityModal: React.FC<DataSecurityModalProps> = ({
  isOpen,
  onClose,
  onOpenExport,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-[#EBEBEB] p-6 sm:p-8 airbnb-card max-h-[90vh] overflow-y-auto text-[#222222] shadow-2xl">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#000000] text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#000000] tracking-tight">
                  数据安全与纯本地架构说明
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  100% 纯本地离线
                </span>
              </div>
              <p className="text-xs text-[#717171] mt-0.5">
                Vsmat 采用严格的零知识（Zero-Knowledge）纯前端架构，您的私密信息绝不上传云端
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#DDDDDD] hover:border-[#222222] text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] flex items-center justify-center transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Guarantee Banner */}
        <div className="my-5 p-4 rounded-2xl bg-[#000000] text-white space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>核心承诺：没有后端服务器，没有云端数据库</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            您录入的<strong>所有服务账号、登录密码、API Token 密钥、截图及发票</strong>，均仅保存在您当前设备浏览器的内部存储中。无论发生什么，我们都不会且无法获取您的任何敏感数据。
          </p>
        </div>

        {/* 4 Security Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#000000]">
              <HardDrive className="w-4 h-4 text-[#000000]" />
              <span>1. 本地存储 (LocalStorage)</span>
            </div>
            <p className="text-[11px] text-[#717171] leading-relaxed">
              数据保存在浏览器的 <code className="text-[#000000] font-mono bg-white px-1 py-0.5 rounded border border-[#DDDDDD]">vsmat_vault_storage_v1</code> 隔离沙箱中，物理上完全归属于您的设备。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#000000]">
              <Lock className="w-4 h-4 text-[#000000]" />
              <span>2. 硬件级 AES-256-GCM 加密</span>
            </div>
            <p className="text-[11px] text-[#717171] leading-relaxed">
              使用浏览器原生 Web Crypto API 硬件加速芯片进行端到端加解密，即使设备被盗也无法逆向破解高熵密文。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#000000]">
              <Cpu className="w-4 h-4 text-[#000000]" />
              <span>3. WebAssembly 本地离线 OCR</span>
            </div>
            <p className="text-[11px] text-[#717171] leading-relaxed">
              智能识别通过本地编译的 Tesseract.js Wasm 引擎在浏览器内存中运行，<strong>截图图片永不发送给任何云端视觉 API</strong>。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#000000]">
              <EyeOff className="w-4 h-4 text-[#000000]" />
              <span>4. 零追踪与零遥测</span>
            </div>
            <p className="text-[11px] text-[#717171] leading-relaxed">
              绝无任何第三方分析统计代码（无 Google Analytics、无广告 SDK），100% 干净透明，断开 Wi-Fi 仍可完整离线运行。
            </p>
          </div>
        </div>

        {/* How to verify section (Self-Auditable) */}
        <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] space-y-3 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#000000]">
            <Terminal className="w-4 h-4 text-[#000000]" />
            <span>您可以随时通过以下 2 种方式自行验证：</span>
          </div>
          <div className="space-y-2 text-xs text-[#555555]">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#000000] text-white flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">1</span>
              <div>
                <strong>查看网络请求（Network 监控）</strong>：在键盘按 <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#DDDDDD] text-[11px]">F12</kbd> 打开开发者工具，切到 <em>Network (网络)</em> 标签页。录入任何账号或上传截图，没有任何带有您个人信息的请求发往任何服务器。
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-[#000000] text-white flex items-center justify-center text-[10px] shrink-0 font-bold mt-0.5">2</span>
              <div>
                <strong>拔掉网线 / 断网测试</strong>：将电脑切换为飞行模式或关闭 Wi-Fi，Vsmat 的所有查询、录入、解密、汇率换算依然完全正常可用。
              </div>
            </div>
          </div>
        </div>

        {/* Data sovereignty & Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#EBEBEB]">
          <div className="text-xs text-[#717171] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>数据主权完全属于您，建议定期导出加密备份</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenExport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenExport();
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white hover:bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD] hover:border-[#222222] text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>立即导出备份 (.json)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#000000] hover:bg-[#222222] text-white text-xs font-bold transition shadow-sm"
            >
              我知道了
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
