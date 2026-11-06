import React from 'react';
import { Sparkles, Terminal, Server, Bot, Apple, Globe, Cpu, Gamepad2, Layers, Key, Shield } from 'lucide-react';

interface BrandBadgeProps {
  serviceKey?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({
  serviceKey = '',
  name,
  size = 'md',
  className = '',
}) => {
  const normalizedKey = (serviceKey || '').toLowerCase();
  const lowerName = (name || '').toLowerCase();

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Determine specific brand styling
  if (normalizedKey.includes('openai') || lowerName.includes('chatgpt') || lowerName.includes('openai')) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-700/20 ring-1 ring-emerald-500/30 shrink-0 ${className}`}
        title="OpenAI"
      >
        <Sparkles className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('claude') || lowerName.includes('claude') || lowerName.includes('anthropic')) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-center font-bold shadow-sm shadow-amber-600/20 ring-1 ring-amber-500/30 shrink-0 ${className}`}
        title="Anthropic Claude"
      >
        <Bot className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('deepseek') || lowerName.includes('deepseek') || lowerName.includes('深度求索')) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-600/20 ring-1 ring-blue-500/30 shrink-0 ${className}`}
        title="DeepSeek"
      >
        <Cpu className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('gemini') || lowerName.includes('gemini') || lowerName.includes('google')) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center font-bold shadow-sm shadow-purple-600/20 ring-1 ring-purple-500/30 shrink-0 ${className}`}
        title="Google Gemini"
      >
        <Sparkles className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('cursor') || lowerName.includes('cursor')) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-slate-900 via-zinc-800 to-slate-950 text-sky-400 flex items-center justify-center font-bold shadow-sm shadow-slate-900/25 ring-1 ring-zinc-700/40 shrink-0 ${className}`}
        title="Cursor Pro AI"
      >
        <Terminal className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('apple') || lowerName.includes('apple') || lowerName.includes('ios') || lowerName.includes('icloud')) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-neutral-800 via-neutral-900 to-black text-white flex items-center justify-center font-bold shadow-sm shadow-black/20 ring-1 ring-white/10 shrink-0 ${className}`}
        title="Apple"
      >
        <Apple className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('steam') || lowerName.includes('steam')) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 text-blue-300 flex items-center justify-center font-bold shadow-sm shadow-blue-950/20 ring-1 ring-slate-700/30 shrink-0 ${className}`}
        title="Steam"
      >
        <Gamepad2 className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('bandwagon') || normalizedKey.includes('vps') || lowerName.includes('bandwagon') || lowerName.includes('搬瓦工') || lowerName.includes('vps')) {
    return (
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-700/20 ring-1 ring-sky-500/30 shrink-0 ${className}`}
        title="Bandwagon VPS"
      >
        <Server className={iconSizes[size]} />
      </div>
    );
  }

  // Fallback: Elegant Squircle Monogram with deterministic dynamic gradient
  const initial = (name || 'V').trim().slice(0, 1).toUpperCase();
  const charCode = initial.charCodeAt(0) || 65;
  const gradientStyles = [
    'from-blue-500 to-indigo-600 ring-blue-400/20',
    'from-violet-500 to-purple-600 ring-violet-400/20',
    'from-emerald-500 to-teal-600 ring-emerald-400/20',
    'from-rose-500 to-pink-600 ring-rose-400/20',
    'from-amber-500 to-orange-600 ring-amber-400/20',
    'from-slate-700 to-slate-900 ring-slate-600/20',
  ];
  const selectedGrad = gradientStyles[charCode % gradientStyles.length];

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br ${selectedGrad} text-white flex items-center justify-center font-bold tracking-tight shadow-sm ring-1 shrink-0 ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
};
