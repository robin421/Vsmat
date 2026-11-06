import React from 'react';
import { Sparkles, Terminal, Server, Bot, Apple, Globe, Cpu, Gamepad2, Layers, Key, Shield, Film, Music, Code } from 'lucide-react';

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

  // Restrained, premium monochrome styling: Dark zinc squircle with subtle light ring
  const baseSquircle = `${sizeClasses[size]} bg-zinc-900 text-zinc-100 flex items-center justify-center font-bold shadow-2xs ring-1 ring-zinc-800 shrink-0 ${className}`;

  if (normalizedKey.includes('openai') || lowerName.includes('chatgpt') || lowerName.includes('openai')) {
    return (
      <div className={baseSquircle} title="OpenAI / ChatGPT">
        <Sparkles className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('claude') || lowerName.includes('claude') || lowerName.includes('anthropic')) {
    return (
      <div className={baseSquircle} title="Anthropic Claude">
        <Bot className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('deepseek') || lowerName.includes('deepseek') || lowerName.includes('深度求索')) {
    return (
      <div className={baseSquircle} title="DeepSeek">
        <Cpu className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('gemini') || lowerName.includes('gemini') || lowerName.includes('google')) {
    return (
      <div className={baseSquircle} title="Google Gemini">
        <Sparkles className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('cursor') || lowerName.includes('cursor')) {
    return (
      <div className={baseSquircle} title="Cursor AI">
        <Terminal className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('apple') || lowerName.includes('apple') || lowerName.includes('ios') || lowerName.includes('icloud')) {
    return (
      <div className={baseSquircle} title="Apple">
        <Apple className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('steam') || lowerName.includes('steam')) {
    return (
      <div className={baseSquircle} title="Steam">
        <Gamepad2 className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('bandwagon') || normalizedKey.includes('vps') || lowerName.includes('bandwagon') || lowerName.includes('搬瓦工') || lowerName.includes('vps')) {
    return (
      <div className={baseSquircle} title="VPS / Server">
        <Server className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('github') || lowerName.includes('github')) {
    return (
      <div className={baseSquircle} title="GitHub">
        <Code className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('netflix') || lowerName.includes('netflix')) {
    return (
      <div className={baseSquircle} title="Netflix">
        <Film className={iconSizes[size]} />
      </div>
    );
  }

  if (normalizedKey.includes('spotify') || lowerName.includes('spotify')) {
    return (
      <div className={baseSquircle} title="Spotify">
        <Music className={iconSizes[size]} />
      </div>
    );
  }

  // Fallback: Elegant Monochrome Monogram
  const initial = (name || 'V').trim().slice(0, 1).toUpperCase();

  return (
    <div className={`${baseSquircle} font-mono tracking-tight`}>
      <span>{initial}</span>
    </div>
  );
};
