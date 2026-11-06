import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CreditCard,
  Trash2,
  Sparkles,
  Edit3,
  Upload,
  Image as ImageIcon,
  Check,
  Copy,
  Loader2,
  Calendar,
  DollarSign,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionItem, BillingCycle, ServiceCategory, CurrencyCode, TokenItem } from '../../types';
import { PRESET_SERVICES, getPresetByKey } from '../../types/presets';
import { SUPPORTED_CURRENCIES, convertToUSD } from '../../lib/currencies';
import { getDaysUntil } from '../../lib/notifications';
import { parseSmartText, ParsedSmartInput } from '../../lib/parser';
import { recognizeSubscriptionScreenshot } from '../../lib/ocrEngine';
import { todayLocal } from '../../lib/date';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sub: Partial<SubscriptionItem>) => void;
  onDelete?: (id: string) => void;
  initialData?: SubscriptionItem | null;
  onSaveToken?: (token: Partial<TokenItem>) => void;
}

const COMMON_PAYMENT_METHODS = [
  'Apple 订阅 (印区)',
  'Apple 订阅 (土区)',
  'Apple 订阅 (菲区)',
  'Apple 订阅 (巴区)',
  'Apple 订阅 (美区)',
  '虚拟信用卡',
  '微信 / 支付宝',
  '礼品卡直充',
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
  onSaveToken,
}) => {
  // Mode selection: smart scanner or manual form
  const [entryMode, setEntryMode] = useState<'smart' | 'manual'>('smart');
  const [smartTab, setSmartTab] = useState<'image' | 'text'>('image');
  const [smartText, setSmartText] = useState('');

  // OCR state
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [hasExtractedFromSmart, setHasExtractedFromSmart] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [serviceKey, setServiceKey] = useState('custom');
  const [category, setCategory] = useState<ServiceCategory>('ai');
  const [accountEmail, setAccountEmail] = useState('');
  const [passwordNote, setPasswordNote] = useState('');
  const [twoFactorNote, setTwoFactorNote] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [portalUrl, setPortalUrl] = useState('');
  const [rechargeUrl, setRechargeUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [extractedApiKey, setExtractedApiKey] = useState<string | undefined>(undefined);
  const [alsoSaveToken, setAlsoSaveToken] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize or reset form state on open/initialData changes
  useEffect(() => {
    if (initialData) {
      setEntryMode('manual');
      setName(initialData.name);
      setServiceKey(initialData.serviceKey || 'custom');
      setCategory(initialData.category || 'ai');
      setAccountEmail(initialData.accountEmail || '');
      setPasswordNote(initialData.passwordNote || '');
      setTwoFactorNote(initialData.twoFactorNote || '');
      setCycle(initialData.cycle || 'monthly');
      setPrice(initialData.price !== undefined ? String(initialData.price) : '');
      setCurrency(initialData.currency || 'USD');
      setNextBillingDate(initialData.nextBillingDate || '');
      setPaymentMethod(initialData.paymentMethod || '');
      setPortalUrl(initialData.portalUrl || '');
      setRechargeUrl(initialData.rechargeUrl || '');
      setNotes(initialData.notes || '');
      setHasExtractedFromSmart(false);
      setPreviewImageUrl(null);
    } else {
      setEntryMode('smart');
      setName('');
      setServiceKey('custom');
      setCategory('ai');
      setAccountEmail('');
      setPasswordNote('');
      setTwoFactorNote('');
      setCycle('monthly');
      setPrice('');
      setCurrency('USD');
      const d = new Date();
      d.setDate(d.getDate() + 30);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setNextBillingDate(`${yyyy}-${mm}-${dd}`);
      setPaymentMethod('');
      setPortalUrl('');
      setRechargeUrl('');
      setNotes('');
      setHasExtractedFromSmart(false);
      setPreviewImageUrl(null);
      setSmartText('');
      setExtractedApiKey(undefined);
    }
  }, [initialData, isOpen]);

  // Global paste listener for screenshot image (Cmd+V)
  useEffect(() => {
    if (!isOpen || entryMode !== 'smart' || smartTab !== 'image') return;

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
  }, [isOpen, entryMode, smartTab]);

  const populateFromParsed = (parsed: ParsedSmartInput) => {
    if (parsed.serviceName) setName(parsed.serviceName);
    if (parsed.serviceKey) setServiceKey(parsed.serviceKey);
    if (parsed.category) setCategory(parsed.category);
    if (parsed.price !== undefined) setPrice(String(parsed.price));
    if (parsed.currency) setCurrency(parsed.currency);
    if (parsed.cycle) setCycle(parsed.cycle);
    if (parsed.nextBillingDate) setNextBillingDate(parsed.nextBillingDate);
    if (parsed.paymentMethod) setPaymentMethod(parsed.paymentMethod);
    if (parsed.accountEmail) setAccountEmail(parsed.accountEmail);
    if (parsed.password) setPasswordNote(parsed.password);
    if (parsed.twoFactorNote) setTwoFactorNote(parsed.twoFactorNote);
    if (parsed.notes) setNotes(parsed.notes);
    if (parsed.apiKey) setExtractedApiKey(parsed.apiKey);

    // If preset has portal/recharge URL, prefill them
    if (parsed.serviceKey && parsed.serviceKey !== 'custom') {
      const p = getPresetByKey(parsed.serviceKey);
      if (p?.portalUrl && !portalUrl) setPortalUrl(p.portalUrl);
      if (p?.rechargeUrl && !rechargeUrl) setRechargeUrl(p.rechargeUrl);
    }

    setHasExtractedFromSmart(true);
  };

  const handleProcessImage = async (imageFile: File) => {
    setOcrLoading(true);
    setOcrProgress(10);
    setOcrStatus('正在加载离线 OCR 识别引擎...');

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewImageUrl(objectUrl);

    try {
      const text = await recognizeSubscriptionScreenshot(imageFile, (p, s) => {
        setOcrProgress(Math.round(p * 100));
        setOcrStatus(s);
      });

      const parsed = parseSmartText(text);
      populateFromParsed(parsed);
      setOcrLoading(false);
    } catch (err: any) {
      console.error('Image OCR error:', err);
      setOcrLoading(false);
      alert('图片识别失败，请确保截图清晰后重试');
    }
  };

  const handleSmartTextChange = (text: string) => {
    setSmartText(text);
    if (!text.trim()) return;
    const parsed = parseSmartText(text);
    populateFromParsed(parsed);
  };

  const handlePasteClipboardText = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSmartText(text);
        const parsed = parseSmartText(text);
        populateFromParsed(parsed);
      }
    } catch {}
  };

  const handleServiceChange = (key: string) => {
    setServiceKey(key);
    if (key === 'custom') return;
    const p = getPresetByKey(key);
    if (p) {
      if (!name || PRESET_SERVICES.some((s) => s.name === name)) {
        setName(p.name);
      }
      setCategory(p.category);
      // 价格与币种严格以用户的截图录入为准，绝不擅自覆盖或篡改！
      if (!price && p.defaultPrice) setPrice(String(p.defaultPrice));
      if (!currency && p.defaultCurrency) setCurrency(p.defaultCurrency);
      if (p.defaultCycle) setCycle(p.defaultCycle);
      if (p.portalUrl) setPortalUrl(p.portalUrl);
      if (p.rechargeUrl) setRechargeUrl(p.rechargeUrl);
    }
  };

  if (!isOpen) return null;

  // Real-time calculated fields
  const numPrice = parseFloat(price) || 0;
  const usdConverted = convertToUSD(numPrice, currency);
  const daysUntil = getDaysUntil(nextBillingDate);
  const cycleTextMap: Record<string, string> = {
    monthly: '月',
    quarterly: '季',
    'semi-annually': '半年',
    annually: '年',
    prepaid: '按量',
    lifetime: '终身',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialData?.id,
      name: name.trim(),
      serviceKey: serviceKey || 'custom',
      category,
      accountEmail: accountEmail.trim(),
      passwordNote: passwordNote.trim() || undefined,
      twoFactorNote: twoFactorNote.trim() || undefined,
      cycle,
      price: numPrice,
      currency,
      nextBillingDate,
      autoRenew: true,
      paymentMethod: paymentMethod.trim() || undefined,
      portalUrl: portalUrl.trim() || undefined,
      rechargeUrl: rechargeUrl.trim() || undefined,
      notes: notes.trim() || (hasExtractedFromSmart ? '智能识图录入' : undefined),
      history: initialData?.history || [],
      createdAt: initialData?.createdAt || todayLocal(),
      updatedAt: todayLocal(),
    });

    // Save token if extracted
    if (extractedApiKey && alsoSaveToken && onSaveToken) {
      onSaveToken({
        name: `${name || 'AI'} API Key`,
        serviceKey: serviceKey || 'custom',
        token: extractedApiKey,
        accountEmail: accountEmail.trim() || undefined,
        tags: ['智能录入', serviceKey || 'ai'],
        notes: `关联订阅: ${name}`,
        createdAt: todayLocal(),
        updatedAt: todayLocal(),
      });
    }

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-950/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-line p-5 sm:p-7 shadow-pop overflow-y-auto max-h-[92vh] text-ink surface-card">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-700 text-white border border-ink/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">
                {initialData ? '编辑订阅详情' : '新建订阅'}
              </h3>
              <p className="text-xs text-muted">
                {initialData ? '修改账号、金额、到期时间与登录备忘' : '选择智能识别提取或手动填表录入'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-line-strong hover:bg-inset flex items-center justify-center text-muted hover:text-ink transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unified Mode Selection Tabs (智能识别 / 手动填表) */}
        {!initialData && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-inset border border-line rounded-2xl mt-4">
            <button
              type="button"
              onClick={() => setEntryMode('smart')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                entryMode === 'smart'
                  ? 'bg-white text-ink border border-line-strong'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-ink" />
              <span>智能识别 (截图/发货单)</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('manual')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                entryMode === 'manual'
                  ? 'bg-white text-ink border border-line-strong'
                  : 'text-muted hover:text-ink'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-ink" />
              <span>手动填写表单</span>
            </button>
          </div>
        )}

        {/* Local Security & Privacy Assurance Strip */}
        <div className="mt-3.5 flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 font-medium">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate sm:whitespace-normal">100% 纯本地离线解析与加密存储，所有截图与账号密码绝不离开您的设备。</span>
          </div>
          <span className="font-mono text-[11px] text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shrink-0 hidden sm:inline">
            无云端上传
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-sm">
          {/* ========================================================= */}
          {/* 方式 1: 智能识别录入 (OCR / 文本粘贴) */}
          {/* ========================================================= */}
          {entryMode === 'smart' && (
            <div className="space-y-3">
              {/* Image / Text Switcher Tabs */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSmartTab('image')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                    smartTab === 'image'
                      ? 'bg-ink text-white'
                      : 'bg-inset text-muted hover:text-ink border border-line'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>账单截图 (按 Cmd+V 直接粘贴)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSmartTab('text')}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                    smartTab === 'text'
                      ? 'bg-ink text-white'
                      : 'bg-inset text-muted hover:text-ink border border-line'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>发货邮件 / 文本粘贴</span>
                </button>
              </div>

              {/* Tab Content A: Screenshot Upload & Paste */}
              {smartTab === 'image' && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative rounded-2xl border-2 border-dashed border-line-strong hover:border-ink bg-inset hover:bg-white p-5 text-center cursor-pointer transition group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleProcessImage(file);
                    }}
                    className="hidden"
                  />

                  {previewImageUrl ? (
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={previewImageUrl}
                        alt="截图预览"
                        className="max-h-36 rounded-xl object-contain border border-line"
                      />
                      <span className="text-xs text-muted font-medium group-hover:underline">
                        点击更换截图，或直接按 Cmd+V 粘贴新截图
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="w-10 h-10 rounded-lg bg-white text-ink border border-line flex items-center justify-center mx-auto group-hover:scale-105 transition">
                        <Upload className="w-5 h-5 text-ink" />
                      </div>
                      <p className="text-xs font-semibold text-ink">
                        点击上传 或 在此直接按 <kbd className="px-1.5 py-0.5 rounded bg-white border border-line font-mono text-xs">Cmd+V</kbd> 粘贴截图
                      </p>
                      <p className="text-xs text-muted">
                        支持 iPhone 苹果订阅页面截图、SuperGrok、ChatGPT、Claude 账单，纯本地离线 OCR (零网络上传)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content B: Plain text */}
              {smartTab === 'text' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-ink">
                      粘贴发票、邮件通知或账号文本：
                    </label>
                    <button
                      type="button"
                      onClick={handlePasteClipboardText}
                      className="text-xs text-muted hover:text-ink flex items-center gap-1 font-medium transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>从剪贴板读取</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={smartText}
                    onChange={(e) => handleSmartTextChange(e.target.value)}
                    placeholder="例如:
SuperGrok 印度区 700 INR/月
扣费时间：2026-11-18
账号：vip_user@gmail.com"
                    className="w-full bg-inset border border-line-strong rounded-xl p-3 text-xs font-mono text-ink outline-none focus:border-ink"
                  />
                </div>
              )}

              {/* OCR Progress Indicator */}
              {ocrLoading && (
                <div className="p-3.5 rounded-2xl bg-inset border border-line-strong space-y-1.5 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between text-ink font-semibold">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-ink animate-spin" />
                      <span>{ocrStatus}</span>
                    </div>
                    <span className="font-mono">{ocrProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-700 transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 核心录入信息区域（包含全部用户要求字段，支持手动编辑与补全账号） */}
          {/* ========================================================= */}
          <div className="pt-2 border-t border-line space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                {entryMode === 'smart' && hasExtractedFromSmart ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>识别结果与详情核对（可直接编辑）</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-ink" />
                    <span>订阅核心信息</span>
                  </>
                )}
              </span>
              {numPrice > 0 && (
                <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  折合约 ${usdConverted.toFixed(2)} USD
                </span>
              )}
            </div>

            {/* 1. 服务名称 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-ink flex items-center gap-1">
                  服务名称 <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted">快捷模板:</span>
                  <select
                    value={serviceKey}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="text-xs bg-inset border border-line-strong rounded-lg px-1.5 py-0.5 text-ink outline-none"
                  >
                    <option value="custom">自定义 / 手输</option>
                    {PRESET_SERVICES.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如: SuperGrok / ChatGPT Plus / Claude Pro"
                className="w-full h-10 bg-inset border border-line-strong focus:border-ink focus:bg-white rounded-lg px-3 text-sm font-semibold text-ink outline-none transition"
              />
            </div>

            {/* 2. 续费金额与币种 (含折算 USD 实时统计) */}
            <div className="p-3 rounded-2xl bg-inset border border-line space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-ink" />
                  <span>续费金额与币种</span>
                </label>
                {currency !== 'USD' && numPrice > 0 && (
                  <span className="text-xs text-muted font-mono">
                    折合约 <strong className="text-ink">${usdConverted.toFixed(2)} USD</strong>，按全局汇率自动统计
                  </span>
                )}
              </div>

              <div className="grid grid-cols-12 gap-2">
                {/* 币种选择 */}
                <div className="col-span-5 sm:col-span-5">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-10 bg-white border border-line-strong focus:border-ink rounded-lg px-2 text-sm font-medium text-ink outline-none"
                  >
                    <optgroup label="🔥 热门低价与跨区订阅 (aisubdeal 推荐)">
                      {SUPPORTED_CURRENCIES.filter((c) => c.popularRank < 20).map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({c.symbol} {c.nameZh})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🌐 全球主流货币">
                      {SUPPORTED_CURRENCIES.filter((c) => c.popularRank >= 20).map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({c.symbol} {c.nameZh})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* 金额数值 */}
                <div className="col-span-4 sm:col-span-4">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="700"
                    className="w-full h-10 bg-white border border-line-strong focus:border-ink rounded-lg px-3 font-mono font-semibold text-sm text-ink outline-none"
                  />
                </div>

                {/* 扣费周期 */}
                <div className="col-span-3 sm:col-span-3">
                  <select
                    value={cycle}
                    onChange={(e) => setCycle(e.target.value as BillingCycle)}
                    className="w-full h-10 bg-white border border-line-strong focus:border-ink rounded-lg px-2 text-sm text-ink outline-none font-medium"
                  >
                    <option value="monthly">/月</option>
                    <option value="quarterly">/季</option>
                    <option value="semi-annually">/半年</option>
                    <option value="annually">/年</option>
                    <option value="prepaid">/按量</option>
                    <option value="lifetime">/买断</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. 扣费时间与倒计时 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-ink flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-ink" />
                  <span>扣费时间 (更新日) <span className="text-rose-500">*</span></span>
                </label>
                {nextBillingDate && (
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded-full font-semibold ${
                      daysUntil <= 0
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : daysUntil <= 7
                        ? 'bg-amber-50 text-amber-900 border border-amber-200'
                        : 'bg-inset text-ink border border-line-strong'
                    }`}
                  >
                    {daysUntil <= 0 ? '今日或已逾期' : `还剩 ${daysUntil} 天`}
                  </span>
                )}
              </div>
              <input
                type="date"
                required
                value={nextBillingDate}
                onChange={(e) => setNextBillingDate(e.target.value)}
                className="w-full h-10 bg-inset border border-line-strong focus:border-ink focus:bg-white rounded-lg px-3 font-mono font-semibold text-sm text-ink outline-none transition"
              />
            </div>

            {/* 4. 支付渠道 (快捷建议与自填) */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                支付渠道
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="例如: Apple 订阅 (印区) / 美区礼品卡 / 虚拟卡"
                className="w-full h-10 bg-inset border border-line-strong focus:border-ink focus:bg-white rounded-lg px-3 text-sm font-medium text-ink outline-none transition"
              />
              {/* Quick suggestion chips */}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COMMON_PAYMENT_METHODS.slice(0, 5).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`text-xs px-2 py-0.5 rounded-lg border transition ${
                      paymentMethod === m
                        ? 'bg-ink text-white border-ink'
                        : 'bg-white text-muted hover:text-ink border-line-strong'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. 账号 (若截图未识别到，清晰提示并支持手动输入) */}
            <div className="p-3 rounded-2xl bg-white border border-line space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-ink" />
                  <span>服务账号 / 登录邮箱</span>
                </label>
                {!accountEmail.trim() ? (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    未从截图识别到，可在此手动添加
                  </span>
                ) : (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    已录入
                  </span>
                )}
              </div>
              <input
                type="text"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="请输入登录邮箱或账号 (例如: user@gmail.com)"
                className={`w-full h-10 rounded-xl px-3 font-mono text-xs text-ink outline-none transition ${
                  !accountEmail.trim()
                    ? 'bg-amber-50/40 border border-amber-300 focus:border-ink focus:bg-white'
                    : 'bg-inset border border-line-strong focus:border-ink focus:bg-white'
                }`}
              />
            </div>

            {/* 展开更多信息 (密码备忘、2FA、直达充值链接) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-muted hover:text-ink font-semibold flex items-center gap-1 transition"
              >
                <span>{showAdvanced ? '收起高级设置' : '展开高级选项 (密码备忘、分类、直达链接)'}</span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="mt-2.5 p-3.5 rounded-2xl bg-inset border border-line space-y-3 animate-fadeIn text-xs">
                  {/* Category & Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">所属分类</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                        className="w-full h-9 bg-white border border-line-strong rounded-xl px-2.5 text-xs text-ink outline-none"
                      >
                        <option value="ai">AI 智能模型</option>
                        <option value="developer">开发工具与托管</option>
                        <option value="server">服务器与网络</option>
                        <option value="productivity">生产力办公</option>
                        <option value="entertainment">影音娱乐</option>
                        <option value="other">其他类别</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">密码备忘 (本地加密)</label>
                      <input
                        type="text"
                        value={passwordNote}
                        onChange={(e) => setPasswordNote(e.target.value)}
                        placeholder="登录密码备忘"
                        className="w-full h-9 bg-white border border-line-strong rounded-xl px-2.5 font-mono text-xs text-ink outline-none"
                      />
                    </div>
                  </div>

                  {/* Portal & Recharge URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">官方管理后台 URL</label>
                      <input
                        type="text"
                        value={portalUrl}
                        onChange={(e) => setPortalUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full h-9 bg-white border border-line-strong rounded-xl px-2.5 font-mono text-xs text-ink outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink mb-1">充值兑换直达 URL</label>
                      <input
                        type="text"
                        value={rechargeUrl}
                        onChange={(e) => setRechargeUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full h-9 bg-white border border-line-strong rounded-xl px-2.5 font-mono text-xs text-ink outline-none"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">备注说明</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="家庭组共享、续费信用卡绑定说明等..."
                      className="w-full h-9 bg-white border border-line-strong rounded-xl px-2.5 text-xs text-ink outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-line">
            {initialData && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`确定要删除订阅「${name || initialData.name}」吗？`)) {
                    onDelete(initialData.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>删除订阅</span>
              </button>
            ) : (
              <div className="text-xs text-muted flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>端到端 AES-256 本地加密存储</span>
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-inset text-ink border border-line-strong text-xs font-semibold transition"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={ocrLoading || !name.trim()}
                className="h-10 px-5 rounded-lg bg-brand-700 hover:bg-brand-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <span>{initialData ? '保存修改' : '确认并录入订阅'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
