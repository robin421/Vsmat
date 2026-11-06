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
      if (inputText.trim()) {
        const res = parseSmartText(inputText);
        setParsed(res);
      } else {
        setParsed(null);
      }
    }
  }, [inputText, activeTab]);

  if (!isOpen) return null;

  // Process an image (from file, drop, or clipboard)
  const handleProcessImage = async (file: File | Blob) => {
    try {
      setActiveTab('image');
      setOcrLoading(true);
      setOcrProgress(5);
      setOcrStatus('正在读取图像数据...');

      // Preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewImageUrl(objectUrl);

      // Run OCR
      const extractedText = await recognizeSubscriptionScreenshot(file, (percent, status) => {
        setOcrProgress(percent);
        setOcrStatus(status);
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
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    });

    setInputText('');
    setPreviewImageUrl(null);
    setParsed(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xl overflow-y-auto max-h-[92vh] text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-subtle">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                智能识别录入订阅
              </h3>
              <p className="text-xs text-slate-500">
                支持直接粘贴苹果/谷歌订阅截图或发货文本，自动提取续费时间与金额
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 mt-4 text-xs">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'image'
                ? 'bg-white text-blue-600 shadow-subtle'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>📸 截图 / 图片识别 (支持 Cmd+V 粘贴)</span>
          </button>

          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'text'
                ? 'bg-white text-blue-600 shadow-subtle'
                : 'text-slate-600 hover:text-slate-900'
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
              className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/60 hover:bg-blue-50/20 transition group"
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
                    className="max-h-40 rounded-xl object-contain shadow-subtle border border-slate-200"
                  />
                  <span className="text-xs text-blue-600 font-medium group-hover:underline">
                    点击更换截图或重新粘贴
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-subtle group-hover:scale-105 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      点击上传 或 在此处直接按 <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-xs shadow-subtle">Cmd+V</kbd> 粘贴截图
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      支持 iPhone 苹果订阅页面截图、账单截图等，纯本地离线 OCR 识别
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* OCR Progress Bar */}
            {ocrLoading && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    {ocrStatus || '正在识别图像字符...'}
                  </span>
                  <span>{ocrProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-200 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-200"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Text Input Area */}
        {activeTab === 'text' && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                粘贴包含账号/密码/密钥/续费时间的文本:
              </label>
              <button
                type="button"
                onClick={handlePasteClipboardText}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                读取剪贴板
              </button>
            </div>

            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`例如粘贴文本：
服务: Claude Pro
金额: ¥3,000 /月
续费日期: 2026-11-14
账号: vip_subscriber@gmail.com`}
              className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl p-3 text-xs font-mono text-slate-900 outline-none leading-relaxed transition shadow-subtle"
            />
          </div>
        )}

        {/* Live Parsed Preview Cards */}
        {parsed && (
          <div className="mt-4 space-y-3 p-4 rounded-xl bg-slate-50 border border-blue-200/80 animate-fadeIn">
            <div className="text-xs font-bold text-blue-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                识别结果
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                已自动匹配提取
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Service */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-subtle">
                <div className="text-[10px] text-slate-400 mb-0.5 font-medium">服务名称</div>
                <div className="font-bold text-slate-900">{parsed.serviceName || '未识别'}</div>
              </div>

              {/* Cost & Currency */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-subtle">
                <div className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1 font-medium">
                  <DollarSign className="w-3 h-3 text-emerald-600" /> 续费金额与币种
                </div>
                <div className="font-mono text-slate-900 font-bold">
                  {parsed.currency} {parsed.price} ({parsed.cycle === 'monthly' ? '月付' : parsed.cycle})
                </div>
              </div>

              {/* Renewal Date */}
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-subtle sm:col-span-2">
                <div className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1 font-medium">
                  <Calendar className="w-3 h-3 text-blue-600" /> 下期扣费时间 (更新日)
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  {parsed.nextBillingDate}
                </div>
              </div>

              {/* Payment Method / Channel */}
              {parsed.paymentMethod && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-subtle sm:col-span-2">
                  <div className="text-[10px] text-slate-400 mb-0.5 font-medium">支付渠道推断</div>
                  <div className="font-medium text-slate-800">{parsed.paymentMethod}</div>
                </div>
              )}

              {/* Account Email (if found) */}
              {parsed.accountEmail && (
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-subtle sm:col-span-2">
                  <div className="text-[10px] text-slate-400 mb-0.5 flex items-center gap-1 font-medium">
                    <Mail className="w-3 h-3 text-blue-600" /> 账号邮箱
                  </div>
                  <div className="font-mono text-slate-800 truncate">{parsed.accountEmail}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!parsed || ocrLoading}
            onClick={handleConfirmSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/30 transition active:scale-95"
          >
            <span>一键确认并录入</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
