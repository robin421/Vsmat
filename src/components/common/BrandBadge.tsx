import React from 'react';
import {
  Sparkles,
  Terminal,
  Server,
  Bot,
  Apple,
  Globe,
  Cpu,
  Gamepad2,
  Layers,
  Key,
  Shield,
  Film,
  Music,
  Code,
  CreditCard,
  Cloud,
  Zap,
  Compass
} from 'lucide-react';

interface BrandBadgeProps {
  serviceKey?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ==========================================
// Official Vector SVG Icons for Hot AI Apps
// ==========================================

const OpenAIIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.784a4.482 4.482 0 0 1 2.366-1.973V12.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 8.784zm16.597 3.855l-5.833-3.387L15.119 8.1a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 10.12V7.785a.075.075 0 0 1 .033-.062L14.28 4.94a4.5 4.5 0 0 1 6.667 4.676zM8.543 14.77l-2.02-1.168a.071.071 0 0 1-.038-.052V7.967a4.504 4.504 0 0 1 7.37-3.454l-.142.081L8.934 7.352a.795.795 0 0 0-.392.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.607 1.5-2.602-1.5z"/>
  </svg>
);

const ClaudeIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.8 2.5a1.2 1.2 0 0 0-2.3 0l-.8 3.5a1.2 1.2 0 0 1-.9.9l-3.5.8a1.2 1.2 0 0 0 0 2.3l3.5.8a1.2 1.2 0 0 1 .9.9l.8 3.5a1.2 1.2 0 0 0 2.3 0l.8-3.5a1.2 1.2 0 0 1 .9-.9l3.5-.8a1.2 1.2 0 0 0 0-2.3l-3.5-.8a1.2 1.2 0 0 1-.9-.9l-.8-3.5z" />
    <circle cx="18" cy="18" r="2.5" />
    <circle cx="6" cy="18" r="2" />
  </svg>
);

const GeminiIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z" />
  </svg>
);

const GrokIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <line x1="5.6" y1="18.4" x2="18.4" y2="5.6" />
  </svg>
);

const DeepSeekIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.5 11.2c-.3-3.8-3.4-6.8-7.2-7.1-4.3-.3-8 2.8-8.6 7.1-.4 2.8.7 5.5 2.8 7.2 1.6 1.3 3.6 1.9 5.6 1.7 3.2-.3 6-2.2 7-5.2.3-.8.4-1.6.4-2.5v-1.2zm-9.5 5.3c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"/>
    <circle cx="9.5" cy="10" r="1.3" fill="#ffffff" />
  </svg>
);

const PerplexityIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

const CursorIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const WindsurfIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 3v18M7 3l11 7-11 5" fill="currentColor" fillOpacity="0.25" />
    <path d="M3 21h18" />
  </svg>
);

const MidjourneyIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18l9 3 9-3" />
    <path d="M12 3v18" />
    <path d="M12 3l7 10H5l7-10z" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

const KimiIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-7-7 7 7 0 0 1-2-2z" fill="currentColor" fillOpacity="0.2" />
    <path d="M8 8v8M14 8l-5 4 5 4" strokeWidth="2.2" />
  </svg>
);

const SunoIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="10" width="2.5" height="4" rx="1.25" />
    <rect x="7.5" y="6" width="2.5" height="12" rx="1.25" />
    <rect x="12" y="3" width="2.5" height="18" rx="1.25" />
    <rect x="16.5" y="7" width="2.5" height="10" rx="1.25" />
    <rect x="21" y="10" width="2.5" height="4" rx="1.25" />
  </svg>
);

const RunwayIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="6 21 8 3 16 3 18 21 6 21" fill="currentColor" fillOpacity="0.2" />
    <line x1="12" y1="6" x2="12" y2="9" />
    <line x1="12" y1="13" x2="12" y2="17" />
  </svg>
);

const ElevenLabsIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <rect x="7" y="4" width="3.5" height="16" rx="1.75" />
    <rect x="13.5" y="4" width="3.5" height="16" rx="1.75" />
  </svg>
);

const MistralIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="5" width="4" height="4" rx="1" />
    <rect x="6.5" y="9" width="4" height="4" rx="1" />
    <rect x="11" y="13" width="4" height="4" rx="1" />
    <rect x="15.5" y="9" width="4" height="4" rx="1" />
    <rect x="18" y="5" width="4" height="4" rx="1" />
  </svg>
);

const HuggingFaceIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" fill="#FFD21E" fillOpacity="0.25" />
    <circle cx="9" cy="10" r="1.3" fill="currentColor" />
    <circle cx="15" cy="10" r="1.3" fill="currentColor" />
    <path d="M8 14s1.5 2.2 4 2.2 4-2.2 4-2.2" />
    <path d="M3 13c1 2 3 3 4 1M21 13c-1 2-3 3-4 1" />
  </svg>
);

const PoeIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.15" />
    <circle cx="9" cy="10" r="1" fill="currentColor" />
    <circle cx="15" cy="10" r="1" fill="currentColor" />
  </svg>
);

const V0Icon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 3 22 20 2 20" />
  </svg>
);

const GitHubIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const YouTubeIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const BrandBadge: React.FC<BrandBadgeProps> = ({
  serviceKey = '',
  name,
  size = 'md',
  className = '',
}) => {
  const normalizedKey = (serviceKey || '').toLowerCase();
  const lowerName = (name || '').toLowerCase();

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl text-xs',
    md: 'w-10 h-10 rounded-2xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Airbnb style: warm, tactile squircle with subtle border and crisp brand styling
  const baseSquircle = `${sizeClasses[size]} flex items-center justify-center font-bold shadow-2xs shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`;

  // 1. OpenAI / ChatGPT
  if (normalizedKey.includes('openai') || lowerName.includes('chatgpt') || lowerName.includes('openai') || lowerName.includes('gpt')) {
    return (
      <div className={`${baseSquircle} bg-[#10A37F]/10 border border-[#10A37F]/25 text-[#10A37F]`} title="OpenAI / ChatGPT">
        <OpenAIIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 2. Anthropic Claude
  if (normalizedKey.includes('claude') || lowerName.includes('claude') || lowerName.includes('anthropic')) {
    return (
      <div className={`${baseSquircle} bg-[#D97706]/10 border border-[#D97706]/25 text-[#D97706]`} title="Anthropic Claude">
        <ClaudeIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 3. xAI Grok / SuperGrok
  if (normalizedKey.includes('grok') || lowerName.includes('grok') || lowerName.includes('supergrok') || lowerName.includes('xai')) {
    return (
      <div className={`${baseSquircle} bg-[#222222] border border-black text-white`} title="xAI Grok / SuperGrok">
        <GrokIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 4. Google Gemini
  if (normalizedKey.includes('gemini') || lowerName.includes('gemini') || lowerName.includes('google ai') || lowerName.includes('google studio')) {
    return (
      <div className={`${baseSquircle} bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 text-[#8B5CF6]`} title="Google Gemini">
        <GeminiIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 5. DeepSeek (深度求索)
  if (normalizedKey.includes('deepseek') || lowerName.includes('deepseek') || lowerName.includes('深度求索')) {
    return (
      <div className={`${baseSquircle} bg-[#3B82F6]/10 border border-[#3B82F6]/25 text-[#2563EB]`} title="DeepSeek 深度求索">
        <DeepSeekIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 6. Perplexity AI
  if (normalizedKey.includes('perplexity') || lowerName.includes('perplexity')) {
    return (
      <div className={`${baseSquircle} bg-[#20B2AA]/10 border border-[#20B2AA]/25 text-[#0D9488]`} title="Perplexity AI">
        <PerplexityIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 7. Cursor AI
  if (normalizedKey.includes('cursor') || lowerName.includes('cursor')) {
    return (
      <div className={`${baseSquircle} bg-[#6366F1]/10 border border-[#6366F1]/25 text-[#4F46E5]`} title="Cursor AI">
        <CursorIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 8. Windsurf (Codeium)
  if (normalizedKey.includes('windsurf') || lowerName.includes('windsurf') || lowerName.includes('codeium')) {
    return (
      <div className={`${baseSquircle} bg-[#06B6D4]/10 border border-[#06B6D4]/25 text-[#0891B2]`} title="Windsurf (Codeium)">
        <WindsurfIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 9. Midjourney
  if (normalizedKey.includes('midjourney') || lowerName.includes('midjourney')) {
    return (
      <div className={`${baseSquircle} bg-[#EC4899]/10 border border-[#EC4899]/25 text-[#DB2777]`} title="Midjourney">
        <MidjourneyIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 10. Kimi (月之暗面)
  if (normalizedKey.includes('kimi') || lowerName.includes('kimi') || lowerName.includes('moonshot')) {
    return (
      <div className={`${baseSquircle} bg-[#0284C7]/10 border border-[#0284C7]/25 text-[#0284C7]`} title="Kimi (月之暗面)">
        <KimiIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 11. 智谱清言 (GLM-4)
  if (normalizedKey.includes('zhipu') || lowerName.includes('zhipu') || lowerName.includes('chatglm') || lowerName.includes('智谱')) {
    return (
      <div className={`${baseSquircle} bg-[#2563EB]/10 border border-[#2563EB]/25 text-[#1D4ED8]`} title="智谱清言 (GLM-4)">
        <Cpu className={iconSizes[size]} />
      </div>
    );
  }

  // 12. Suno (AI 音乐)
  if (normalizedKey.includes('suno') || lowerName.includes('suno')) {
    return (
      <div className={`${baseSquircle} bg-[#F97316]/10 border border-[#F97316]/25 text-[#EA580C]`} title="Suno AI 音乐">
        <SunoIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 13. Runway (AI 视频)
  if (normalizedKey.includes('runway') || lowerName.includes('runway')) {
    return (
      <div className={`${baseSquircle} bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 text-[#7C3AED]`} title="Runway AI 视频">
        <RunwayIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 14. ElevenLabs (AI 语音)
  if (normalizedKey.includes('elevenlabs') || lowerName.includes('elevenlabs') || lowerName.includes('eleven labs')) {
    return (
      <div className={`${baseSquircle} bg-[#18181B] border border-black text-white`} title="ElevenLabs AI 语音">
        <ElevenLabsIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 15. Hugging Face
  if (normalizedKey.includes('huggingface') || lowerName.includes('hugging') || lowerName.includes('hf')) {
    return (
      <div className={`${baseSquircle} bg-[#FFD21E]/15 border border-[#FFD21E]/30 text-[#D97706]`} title="Hugging Face">
        <HuggingFaceIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 16. Mistral AI
  if (normalizedKey.includes('mistral') || lowerName.includes('mistral')) {
    return (
      <div className={`${baseSquircle} bg-[#FF5E1E]/10 border border-[#FF5E1E]/25 text-[#FF5E1E]`} title="Mistral AI">
        <MistralIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 17. Poe
  if (normalizedKey.includes('poe') || lowerName.includes('poe')) {
    return (
      <div className={`${baseSquircle} bg-[#6366F1]/10 border border-[#6366F1]/25 text-[#4F46E5]`} title="Poe AI">
        <PoeIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 18. v0 (Vercel)
  if (normalizedKey.includes('v0') || lowerName.includes('v0')) {
    return (
      <div className={`${baseSquircle} bg-black border border-black text-white`} title="v0.dev">
        <V0Icon className={iconSizes[size]} />
      </div>
    );
  }

  // 19. GitHub (Copilot)
  if (normalizedKey.includes('github') || lowerName.includes('github') || lowerName.includes('copilot')) {
    return (
      <div className={`${baseSquircle} bg-[#24292F] border border-[#24292F] text-white`} title="GitHub Copilot">
        <GitHubIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 20. Apple
  if (normalizedKey.includes('apple') || lowerName.includes('apple') || lowerName.includes('ios') || lowerName.includes('icloud')) {
    return (
      <div className={`${baseSquircle} bg-[#F7F7F7] border border-[#EBEBEB] text-[#222222]`} title="Apple">
        <Apple className={iconSizes[size]} />
      </div>
    );
  }

  // 21. Steam
  if (normalizedKey.includes('steam') || lowerName.includes('steam')) {
    return (
      <div className={`${baseSquircle} bg-[#171A21] border border-[#171A21] text-white`} title="Steam">
        <Gamepad2 className={iconSizes[size]} />
      </div>
    );
  }

  // 22. Netflix
  if (normalizedKey.includes('netflix') || lowerName.includes('netflix')) {
    return (
      <div className={`${baseSquircle} bg-[#E50914]/10 border border-[#E50914]/25 text-[#E50914]`} title="Netflix">
        <Film className={iconSizes[size]} />
      </div>
    );
  }

  // 23. Spotify
  if (normalizedKey.includes('spotify') || lowerName.includes('spotify')) {
    return (
      <div className={`${baseSquircle} bg-[#1DB954]/10 border border-[#1DB954]/25 text-[#1DB954]`} title="Spotify">
        <Music className={iconSizes[size]} />
      </div>
    );
  }

  // 24. YouTube
  if (normalizedKey.includes('youtube') || lowerName.includes('youtube') || lowerName.includes('yt')) {
    return (
      <div className={`${baseSquircle} bg-[#FF0000]/10 border border-[#FF0000]/25 text-[#FF0000]`} title="YouTube Premium">
        <YouTubeIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 25. VPS / Servers
  if (normalizedKey.includes('bandwagon') || normalizedKey.includes('vps') || lowerName.includes('bandwagon') || lowerName.includes('搬瓦工') || lowerName.includes('vps') || lowerName.includes('server')) {
    return (
      <div className={`${baseSquircle} bg-[#6366F1]/10 border border-[#6366F1]/25 text-[#4F46E5]`} title="VPS / Server">
        <Server className={iconSizes[size]} />
      </div>
    );
  }

  // ========================================================
  // "所有的都要展示图标" - 智能语义分类图标兜底（绝不展示字母）
  // ========================================================
  if (lowerName.includes('ai') || lowerName.includes('bot') || lowerName.includes('model') || lowerName.includes('chat') || lowerName.includes('智能')) {
    return (
      <div className={`${baseSquircle} bg-[#FFF0F2] border border-[#FFCCD3] text-[#FF385C]`} title={name}>
        <Sparkles className={iconSizes[size]} />
      </div>
    );
  }

  if (lowerName.includes('code') || lowerName.includes('dev') || lowerName.includes('git') || lowerName.includes('terminal') || lowerName.includes('开发')) {
    return (
      <div className={`${baseSquircle} bg-[#EEF2FF] border border-[#C7D2FE] text-[#4F46E5]`} title={name}>
        <Code className={iconSizes[size]} />
      </div>
    );
  }

  if (lowerName.includes('server') || lowerName.includes('cloud') || lowerName.includes('host') || lowerName.includes('vpn') || lowerName.includes('域名') || lowerName.includes('主机')) {
    return (
      <div className={`${baseSquircle} bg-[#F3F4F6] border border-[#E5E7EB] text-[#374151]`} title={name}>
        <Server className={iconSizes[size]} />
      </div>
    );
  }

  if (lowerName.includes('video') || lowerName.includes('movie') || lowerName.includes('film') || lowerName.includes('tv') || lowerName.includes('影视') || lowerName.includes('视频')) {
    return (
      <div className={`${baseSquircle} bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]`} title={name}>
        <Film className={iconSizes[size]} />
      </div>
    );
  }

  if (lowerName.includes('music') || lowerName.includes('audio') || lowerName.includes('sound') || lowerName.includes('音乐') || lowerName.includes('播客')) {
    return (
      <div className={`${baseSquircle} bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]`} title={name}>
        <Music className={iconSizes[size]} />
      </div>
    );
  }

  if (lowerName.includes('game') || lowerName.includes('play') || lowerName.includes('游戏')) {
    return (
      <div className={`${baseSquircle} bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7]`} title={name}>
        <Gamepad2 className={iconSizes[size]} />
      </div>
    );
  }

  if (lowerName.includes('card') || lowerName.includes('pay') || lowerName.includes('bank') || lowerName.includes('钱包') || lowerName.includes('支付')) {
    return (
      <div className={`${baseSquircle} bg-[#FEFCE8] border border-[#FEF08A] text-[#CA8A04]`} title={name}>
        <CreditCard className={iconSizes[size]} />
      </div>
    );
  }

  // 全局默认高质感图标：温暖质感 Airbnb squircle + Sparkles 徽章
  return (
    <div className={`${baseSquircle} bg-[#F7F7F7] border border-[#EBEBEB] text-[#222222]`} title={name}>
      <Sparkles className={iconSizes[size]} />
    </div>
  );
};
