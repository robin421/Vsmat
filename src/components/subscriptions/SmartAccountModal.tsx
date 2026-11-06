import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Mail, Lock, Key, Calendar, DollarSign, Check, Copy, ArrowRight, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { parseSmartText, ParsedSmartInput } from '../../lib/parser';
import { recognizeSubscriptionScreenshot } from '../../lib/ocrEngine';
import { SubscriptionItem, TokenItem } from '../../types';
import confetti from 'canvas-confetti';

interface SmartAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSubscription: (sub: Partial<SubscriptionItem>) => void;
  onSaveToken?: (token: Partial<TokenItem>) => void;
}

export const SmartAccountModal: React.FC<SmartAccountModalProps> = ({
  isOpen,
  onClose,
  onSaveSubscription,
  onSaveToken,
}) => {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [inputText, setInputText] = useState('');
  const [parsed, setParsed] = useState<ParsedSmartInput | null>(null);
  const [alsoSaveToken, setAlsoSaveToken] = useState(true);

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clipboard paste listener (Cmd+V on image!)
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleProcessImage(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Live-parse on text change in text mode
  useEffect(() => {
    if (activeTab === 'text') {
      if (!inputText.trim()) {
        setParsed(null);
        return;
      }
      const result = parseSmartText(inputText);
      setParsed(result);
    }
  }, [inputText, activeTab]);

  const handleProcessImage = async (imageFile: File) => {
    setOcrLoading(true);
    setOcrProgress(5);
    setOcrStatus('正在加载图像与离线引擎...');

    // Preview
    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewImageUrl(objectUrl);

    try {
      const extractedText = await recognizeSubscriptionScreenshot(imageFile, (p, s) => {
        setOcrProgress(Math.round(p * 100));
        setOcrStatus(s);
      });

      // Parse the extracted text
      const parsedResult = parseSmartText(extractedText);
      setParsed(parsedResult);
      setOcrLoading(false);
    } catch (err: any) {
      console.error('Image processing failed:', err);
      setOcrLoading(false);
      alert('图片识别失败，请确保截图清晰后重试');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessImage(file);
    }
  };

  const handlePasteClipboardText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputText(text);
    } catch {}
  };

  const handleConfirmSave = () => {
    if (!parsed) return;

    // 1. Save subscription
    const subData: Partial<SubscriptionItem> = {
      name: parsed.serviceName || '智能录入订阅',
      serviceKey: parsed.serviceKey || 'custom',
      category: parsed.category || 'ai',
      accountEmail: parsed.accountEmail || '',
      passwordNote: parsed.password,
      twoFactorNote: parsed.twoFactorNote,
      cycle: parsed.cycle || 'monthly',
      price: parsed.price || 20,
      currency: parsed.currency || 'USD',
      nextBillingDate: parsed.nextBillingDate || new Date().toISOString().split('T')[0],
      autoRenew: true,
      paymentMethod: parsed.paymentMethod || 'Apple 订阅',
      notes: parsed.notes || '智能图片识别录入',
      history: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    onSaveSubscription(subData);

    // 2. If API Key extracted and toggle on, save token
    if (parsed.apiKey && alsoSaveToken && onSaveToken) {
      onSaveToken({
        name: `${parsed.serviceName || 'AI'} API Key`,
        serviceKey: parsed.serviceKey || 'custom',
        token: parsed.apiKey,
        accountEmail: parsed.accountEmail,
        tags: ['智能录入', parsed.serviceKey || 'ai'],
        notes: `关联订阅: ${parsed.serviceName || ''}`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });

    setInputText('');
    setPreviewImageUrl(null);
    setParsed(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-[#EBEBEB] p-6 sm:p-7 airbnb-card overflow-y-auto max-h-[92vh] text-[#222222]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F2] text-[#FF385C] border border-[#FFCCD3] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#222222]">
                智能识别录入订阅
              </h3>
              <p className="text-xs text-[#717171]">
                支持直接粘贴苹果/谷歌订阅截图或发货文本，自动提取续费时间与金额
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#DDDDDD] hover:border-[#222222] text-[#717171] hover:text-[#222222] hover:bg-[#F7F7F7] flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs (Airbnb segmented control) */}
        <div className="flex items-center p-1 rounded-full bg-[#F7F7F7] border border-[#EBEBEB] mt-4 text-xs">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-2 rounded-full font-semibold transition flex items-center justify-center gap-1.5 select-none ${
              activeTab === 'image'
                ? 'bg-white text-[#222222] shadow-xs border border-[#DDDDDD]/70'
                : 'text-[#717171] hover:text-[#222222]'
            }`}
          >
            <ImageIcon className={`w-3.5 h-3.5 ${activeTab === 'image' ? 'text-[#FF385C]' : 'text-[#717171]'}`} />
            <span>📸 截图识别 (按 Cmd+V 直接粘贴)</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-2 rounded-full font-semibold transition flex items-center justify-center gap-1.5 select-none ${
              activeTab === 'text'
                ? 'bg-white text-[#222222] shadow-xs border border-[#DDDDDD]/70'
                : 'text-[#717171] hover:text-[#222222]'
            }`}
          >
            <span>📝 纯文本粘贴解析</span>
          </button>
        </div>

        {/* Tab 1: Image Upload / Paste Dropzone */}
        {activeTab === 'image' && (
          <div className="mt-4 space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleProcessImage(file);
              }}
              className="border-2 border-dashed border-[#EBEBEB] hover:border-zinc-400 rounded-2xl p-6 text-center cursor-pointer bg-zinc-50/60 hover:bg-zinc-50 transition group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewImageUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={previewImageUrl}
                    alt="截图预览"
                    className="max-h-40 rounded-xl object-contain shadow-2xs border border-[#EBEBEB]"
                  />
                  <span className="text-xs text-zinc-600 font-medium group-hover:underline">
                    点击更换截图或重新粘贴
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 text-[#222222] border border-[#EBEBEB] flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      点击上传 或 在此处直接按 <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#EBEBEB] font-mono text-xs shadow-2xs">Cmd+V</kbd> 粘贴截图
                    </p>
                    <p className="text-xs text-[#717171] mt-1">
                      支持 iPhone 苹果订阅页面截图、账单截图等，纯本地离线 OCR 识别
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* OCR Progress Indicator */}
            {ocrLoading && (
              <div className="p-3.5 rounded-2xl bg-[#FFF0F2] border border-[#FFCCD3] space-y-1.5 text-xs animate-fadeIn">
                <div className="flex items-center justify-between text-[#FF385C] font-semibold">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#FF385C] animate-spin" />
                    <span>{ocrStatus}</span>
                  </div>
                  <span className="font-mono">{ocrProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#FFE2E6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF385C] transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Text Input Mode */}
        {activeTab === 'text' && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#222222]">
                直接粘贴账号发货单、邮件通知或订阅文本：
              </label>
              <button
                type="button"
                onClick={handlePasteClipboardText}
                className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1 font-medium transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>从剪贴板填入</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="例如:
ChatGPT Plus 账号：user@example.com
密码：MySecretPass123
下期续费：2026-12-08
金额：20 USD/月"
              className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs font-mono text-zinc-900 outline-none focus:bg-white focus:border-[#222222] shadow-2xs"
            />
          </div>
        )}

        {/* Live Parsing Preview Card */}
        {parsed && (
          <div className="mt-4 rounded-xl border border-[#EBEBEB] bg-zinc-50 p-4 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#EBEBEB]/80 pb-2">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#222222]" />
                识别结果预览
              </span>
              <span className="text-[11px] font-mono text-[#717171]">
                可核对后一键存入保险箱
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Service Name */}
              <div className="p-2.5 rounded-lg bg-white border border-[#EBEBEB] shadow-2xs">
                <div className="text-[10px] text-zinc-400 mb-0.5 font-medium">服务名称</div>
                <div className="font-bold text-zinc-900">{parsed.serviceName || '未识别'}</div>
              </div>

              {/* Cost & Currency */}
              <div className="p-2.5 rounded-lg bg-white border border-[#EBEBEB] shadow-2xs">
                <div className="text-[10px] text-zinc-400 mb-0.5 flex items-center gap-1 font-medium">
                  <DollarSign className="w-3 h-3 text-[#717171]" /> 续费金额与币种
                </div>
                <div className="font-mono text-zinc-900 font-bold">
                  {parsed.currency} {parsed.price} ({parsed.cycle === 'monthly' ? '月付' : parsed.cycle})
                </div>
              </div>

              {/* Renewal Date */}
              <div className="p-2.5 rounded-lg bg-white border border-[#EBEBEB] shadow-2xs sm:col-span-2">
                <div className="text-[10px] text-zinc-400 mb-0.5 flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3 text-[#717171]" /> 下期扣费时间 (更新日)
                </div>
                <div className="font-mono font-bold text-zinc-900 text-sm">
                  {parsed.nextBillingDate}
                </div>
              </div>

              {/* Payment Method / Channel */}
              {parsed.paymentMethod && (
                <div className="p-2.5 rounded-lg bg-white border border-[#EBEBEB] shadow-2xs sm:col-span-2">
                  <div className="text-[10px] text-zinc-400 mb-0.5 font-medium">支付渠道推断</div>
                  <div className="font-medium text-[#222222]">{parsed.paymentMethod}</div>
                </div>
              )}

              {/* Account Email (if found) */}
              {parsed.accountEmail && (
                <div className="p-2.5 rounded-lg bg-white border border-[#EBEBEB] shadow-2xs sm:col-span-2">
                  <div className="text-[10px] text-zinc-400 mb-0.5 flex items-center gap-1 font-medium">
                    <Mail className="w-3 h-3 text-[#717171]" /> 账号邮箱
                  </div>
                  <div className="font-mono text-[#222222] truncate">{parsed.accountEmail}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-[#EBEBEB]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD] hover:border-[#222222] text-xs font-semibold transition"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!parsed || ocrLoading}
            onClick={handleConfirmSave}
            className="px-6 py-2.5 rounded-xl btn-rausch disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95"
          >
            <span>一键确认并录入</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
