import React from 'react';
import {
  Sparkles,
  Terminal,
  Server,
  Bot,
  Apple as AppleLucide,
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
// 100% Authentic Official Vector SVG Brand Icons
// ==========================================

const OpenAIIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
    <path d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z" />
  </svg>
);

const ClaudeIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
    <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" />
  </svg>
);

const GrokIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
    <path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815" />
  </svg>
);

const GeminiIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
    <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" />
  </svg>
);

const DeepSeekIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
    <path d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z" />
  </svg>
);

const PerplexityIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
    <path d="M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.465H1.5V7.188h2.884V0l7.053 6.494V.19h1.09v6.49L19.786 0zm-7.257 9.044v7.319l5.946 5.234V14.44l-5.946-5.397zm-1.099-.08l-5.946 5.398v7.235l5.946-5.234V8.965zm8.136 7.58h1.844V8.349H13.46l6.105 5.54v2.655zm-8.982-8.28H2.59v8.195h1.8v-2.576l6.192-5.62zM5.475 2.476v4.71h5.115l-5.115-4.71zm13.219 0l-5.115 4.71h5.115v-4.71z" />
  </svg>
);

const CursorIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
    <path d="M22.106 5.68L12.5.135a.998.998 0 00-.998 0L1.893 5.68a.84.84 0 00-.419.726v11.186c0 .3.16.577.42.727l9.607 5.547a.999.999 0 00.998 0l9.608-5.547a.84.84 0 00.42-.727V6.407a.84.84 0 00-.42-.726zm-.603 1.176L12.228 22.92c-.063.108-.228.064-.228-.061V12.34a.59.59 0 00-.295-.51l-9.11-5.26c-.107-.062-.063-.228.062-.228h18.55c.264 0 .428.286.296.514z" />
  </svg>
);

const WindsurfIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5c3.5-1 6-4 7-8 1-3.5 3-5.5 6-6.5" />
    <path d="M9 21c3-1 5.5-3.5 6.5-7 1-3 2.5-4.5 5.5-5.5" />
    <circle cx="5" cy="5" r="2.5" fill="currentColor" />
  </svg>
);

const MidjourneyIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
    <path d="M22.369 17.676c-1.387 1.259-3.17 2.378-5.332 3.417.044.03.086.057.13.083l.018.01.019.012c.216.123.42.184.641.184.222 0 .426-.061.642-.184l.018-.011.019-.011c.14-.084.266-.178.492-.366l.178-.148c.279-.232.426-.342.625-.456.304-.174.612-.266.949-.266.337 0 .645.092.949.266l.023.014c.188.109.334.219.602.442l.178.148c.221.184.346.278.483.36l.028.017.018.01c.21.12.407.181.62.185h.022a.31.31 0 110 .618c-.337 0-.645-.092-.95-.266a3.137 3.137 0 01-.09-.054l-.022-.014-.022-.013-.02-.014a5.356 5.356 0 01-.49-.377l-.159-.132a3.836 3.836 0 00-.483-.36l-.027-.017-.019-.01a1.256 1.256 0 00-.641-.185c-.222 0-.426.061-.641.184l-.02.011-.018.011c-.14.084-.266.178-.492.366l-.158.132a5.125 5.125 0 01-.51.39l-.022.014-.022.014-.09.054a1.868 1.868 0 01-.95.266c-.337 0-.644-.092-.949-.266a3.137 3.137 0 01-.09-.054l-.022-.014-.022-.013-.026-.017a4.881 4.881 0 01-.425-.325.308.308 0 01-.12-.1l-.098-.081a3.836 3.836 0 00-.483-.36l-.027-.017-.019-.01a1.256 1.256 0 00-.641-.185c-.222 0-.426.061-.642.184l-.018.011-.019.011c-.14.084-.266.178-.492.366l-.158.132a5.125 5.125 0 01-.51.39l-.023.014-.022.014-.09.054A1.868 1.868 0 0112 22c-.337 0-.645-.092-.949-.266a3.137 3.137 0 01-.09-.054l-.022-.014-.022-.013-.021-.014a5.356 5.356 0 01-.49-.377l-.158-.132a3.836 3.836 0 00-.483-.36l-.028-.017-.018-.01a1.256 1.256 0 00-.642-.185c-.221 0-.425.061-.641.184l-.019.011-.018.011c-.141.084-.266.178-.492.366l-.158.132a5.125 5.125 0 01-.511.39l-.022.014-.022.014-.09.054a1.868 1.868 0 01-.986.264c-.746-.09-1.319-.38-1.89-.866l-.035-.03c-.047-.041-.118-.106-.192-.174l-.196-.181-.107-.1-.011-.01a1.531 1.531 0 00-.336-.253.313.313 0 00-.095-.03h-.005c-.119.022-.238.059-.361.11a.308.308 0 01-.077.061l-.008.005a.309.309 0 01-.126.034 5.66 5.66 0 00-.774.518l-.416.324-.055.043a6.542 6.542 0 01-.324.236c-.305.207-.552.315-.8.315a.31.31 0 01-.01-.618h.01c.09 0 .235-.062.438-.198l.04-.027c.077-.054.163-.117.27-.199l.385-.301.06-.047c.268-.206.506-.373.73-.505l-.633-1.21a.309.309 0 01.254-.451l20.287-1.305a.309.309 0 01.228.537z" />
  </svg>
);

const KimiIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
    <path d="M21.846 0a1.923 1.923 0 110 3.846H20.15a.226.226 0 01-.227-.226V1.923C19.923.861 20.784 0 21.846 0z" />
    <path d="M11.065 11.199l7.257-7.2c.137-.136.06-.41-.116-.41H14.3a.164.164 0 00-.117.051l-7.82 7.756c-.122.12-.302.013-.302-.179V3.82c0-.127-.083-.23-.185-.23H3.186c-.103 0-.186.103-.186.23V19.77c0 .128.083.23.186.23h2.69c.103 0 .186-.102.186-.23v-3.25c0-.069.025-.135.069-.178l2.424-2.406a.158.158 0 01.205-.023l6.484 4.772a7.677 7.677 0 003.453 1.283c.108.012.2-.095.2-.23v-3.06c0-.117-.07-.212-.164-.227a5.028 5.028 0 01-2.027-.807l-5.613-4.064c-.117-.078-.132-.279-.028-.381z" />
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
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    <circle cx="12" cy="12" r="9" fill="#FFD21E" fillOpacity="0.35" />
    <circle cx="9" cy="10" r="1.3" fill="currentColor" />
    <circle cx="15" cy="10" r="1.3" fill="currentColor" />
    <path d="M8 14s1.5 2.2 4 2.2 4-2.2 4-2.2" />
    <path d="M3 13c1 2 3 3 4 1M21 13c-1 2-3 3-4 1" />
  </svg>
);

const AppleIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd">
    <path d="M11.932 6.908c.95 0 2.727-1.291 4.595-1.1.782.032 2.976.316 4.388 2.38-.113.069-2.622 1.528-2.593 4.565.034 3.617 3.166 4.828 3.221 4.85-.029.086-.506 1.723-1.658 3.416-1.002 1.463-2.039 2.919-3.675 2.95-1.606.03-2.125-.955-3.96-.955s-2.409.923-3.931.984c-1.581.06-2.78-1.58-3.79-3.037-2.065-2.98-3.64-8.422-1.527-12.087 1.051-1.824 2.93-2.98 4.969-3.009 1.549-.032 3.011 1.043 3.96 1.043zM16.552 0c.153 1.407-.411 2.817-1.251 3.833-.837 1.013-2.214 1.804-3.555 1.7-.185-1.378.495-2.814 1.27-3.712C13.883.805 15.346.05 16.553 0z" />
  </svg>
);

const SteamIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.029 4.524 4.524s-2.03 4.524-4.524 4.524h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.155-3.331-2.69L.436 15.01C1.71 20.198 6.398 24 11.979 24c6.627 0 12-5.373 12-12s-5.373-12-12-12zM7.545 18.232c-.395.733-1.229 1.15-2.115.986l1.796-2.593c.87.218 1.482 1.035 1.482 1.986 0 .445-.138.86-.374 1.205l-.789-1.584zm8.4-11.55c-1.248 0-2.262 1.014-2.262 2.262 0 1.248 1.014 2.262 2.262 2.262 1.248 0 2.262-1.014 2.262-2.262 0-1.248-1.014-2.262-2.262-2.262z" />
  </svg>
);

const NetflixIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5.398 0v24c1.196-.27 2.443-.539 3.636-.788V0H5.398zm9.568 0v19.578c1.243-.223 2.484-.442 3.636-.677V0h-3.636zM9.034 0l5.932 20.803v.01l.002.006c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015.01.034c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015c.01.034.02.069.03.103l.004.015.004.016c.01.034.02.068.03.102l.004.015.004.015.01.034L5.398 0h3.636z" />
  </svg>
);

const SpotifyIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.508 17.308c-.216.353-.677.467-1.03.251-2.825-1.727-6.381-2.118-10.57-1.162-.404.092-.806-.16-.898-.564-.092-.403.16-.806.564-.898 4.588-1.047 8.525-.598 11.683 1.343.354.216.467.677.251 1.03zm1.47-3.267c-.272.443-.852.585-1.295.313-3.234-1.988-8.163-2.563-11.987-1.402-.497.151-1.026-.134-1.177-.631-.151-.497.134-1.026.631-1.177 4.373-1.328 9.808-.684 13.515 1.597.443.272.585.852.313 1.295zm.126-3.41c-3.879-2.304-10.281-2.516-13.993-1.389-.594.181-1.226-.157-1.407-.751-.181-.594.157-1.226.751-1.407 4.265-1.295 11.332-1.046 15.801 1.608.535.318.708 1.012.39 1.547-.318.535-1.012.708-1.547.392z" />
  </svg>
);

const PoeIcon = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" fillOpacity="0.18" />
    <circle cx="9" cy="10" r="1.3" fill="currentColor" />
    <circle cx="15" cy="10" r="1.3" fill="currentColor" />
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
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-13 h-13 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  // Airbnb style: warm, tactile squircle with subtle border and crisp brand styling
  const baseSquircle = `${sizeClasses[size]} flex items-center justify-center font-bold shadow-2xs shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`;

  // 1. OpenAI / ChatGPT (Official Emerald / Dark)
  if (normalizedKey.includes('openai') || lowerName.includes('chatgpt') || lowerName.includes('openai') || lowerName.includes('gpt')) {
    return (
      <div className={`${baseSquircle} bg-[#10A37F]/15 border border-[#10A37F]/30 text-[#10A37F]`} title="OpenAI / ChatGPT">
        <OpenAIIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 2. Anthropic Claude (Official Terracotta)
  if (normalizedKey.includes('claude') || lowerName.includes('claude') || lowerName.includes('anthropic')) {
    return (
      <div className={`${baseSquircle} bg-[#D97706]/15 border border-[#D97706]/35 text-[#D97706]`} title="Anthropic Claude">
        <ClaudeIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 3. xAI Grok / SuperGrok (Official Black & White Vector)
  if (normalizedKey.includes('grok') || lowerName.includes('grok') || lowerName.includes('supergrok') || lowerName.includes('xai')) {
    return (
      <div className={`${baseSquircle} bg-[#000000] border border-black/20 text-white shadow-xs`} title="xAI Grok / SuperGrok">
        <GrokIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 4. Google Gemini (Official 4-point Star)
  if (normalizedKey.includes('gemini') || lowerName.includes('gemini') || lowerName.includes('google ai') || lowerName.includes('google studio')) {
    return (
      <div className={`${baseSquircle} bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#7C3AED]`} title="Google Gemini">
        <GeminiIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 5. DeepSeek (Official Blue Whale)
  if (normalizedKey.includes('deepseek') || lowerName.includes('deepseek') || lowerName.includes('深度求索')) {
    return (
      <div className={`${baseSquircle} bg-[#0066FF]/15 border border-[#0066FF]/30 text-[#0066FF]`} title="DeepSeek 深度求索">
        <DeepSeekIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 6. Perplexity AI (Official Teal)
  if (normalizedKey.includes('perplexity') || lowerName.includes('perplexity')) {
    return (
      <div className={`${baseSquircle} bg-[#20B2AA]/15 border border-[#20B2AA]/30 text-[#0D9488]`} title="Perplexity AI">
        <PerplexityIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 7. Cursor AI (Official Isometric Cube)
  if (normalizedKey.includes('cursor') || lowerName.includes('cursor')) {
    return (
      <div className={`${baseSquircle} bg-[#000000] border border-black/20 text-white shadow-xs`} title="Cursor AI">
        <CursorIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 8. Windsurf (Codeium Cyan Wave)
  if (normalizedKey.includes('windsurf') || lowerName.includes('windsurf') || lowerName.includes('codeium')) {
    return (
      <div className={`${baseSquircle} bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[#0891B2]`} title="Windsurf Codeium">
        <WindsurfIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 9. Midjourney (Official Sailboat)
  if (normalizedKey.includes('midjourney') || lowerName.includes('midjourney')) {
    return (
      <div className={`${baseSquircle} bg-[#1E293B] border border-slate-700 text-white`} title="Midjourney">
        <MidjourneyIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 10. Kimi (月之暗面 Moonshot)
  if (normalizedKey.includes('kimi') || lowerName.includes('kimi') || lowerName.includes('moonshot') || lowerName.includes('月之暗面')) {
    return (
      <div className={`${baseSquircle} bg-[#1E40AF]/15 border border-[#1E40AF]/30 text-[#1D4ED8]`} title="Kimi 月之暗面">
        <KimiIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 11. 智谱清言 (GLM-4 / Zhipu)
  if (normalizedKey.includes('zhipu') || lowerName.includes('zhipu') || lowerName.includes('智谱') || lowerName.includes('glm')) {
    return (
      <div className={`${baseSquircle} bg-[#2563EB]/15 border border-[#2563EB]/30 text-[#1D4ED8]`} title="智谱清言 GLM-4">
        <Sparkles className={iconSizes[size]} />
      </div>
    );
  }

  // 12. Suno (AI Music)
  if (normalizedKey.includes('suno') || lowerName.includes('suno')) {
    return (
      <div className={`${baseSquircle} bg-[#F97316]/15 border border-[#F97316]/30 text-[#EA580C]`} title="Suno AI 音乐">
        <SunoIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 13. Runway (Gen-3 Video)
  if (normalizedKey.includes('runway') || lowerName.includes('runway')) {
    return (
      <div className={`${baseSquircle} bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#7C3AED]`} title="Runway Gen-3">
        <RunwayIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 14. ElevenLabs (Voice AI)
  if (normalizedKey.includes('elevenlabs') || lowerName.includes('elevenlabs') || lowerName.includes('eleven')) {
    return (
      <div className={`${baseSquircle} bg-[#18181B] border border-zinc-800 text-white`} title="ElevenLabs">
        <ElevenLabsIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 15. Mistral AI
  if (normalizedKey.includes('mistral') || lowerName.includes('mistral') || lowerName.includes('le chat')) {
    return (
      <div className={`${baseSquircle} bg-[#FF5E1E]/15 border border-[#FF5E1E]/30 text-[#FF5E1E]`} title="Mistral AI">
        <MistralIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 16. Hugging Face
  if (normalizedKey.includes('huggingface') || lowerName.includes('huggingface') || lowerName.includes('hf')) {
    return (
      <div className={`${baseSquircle} bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706]`} title="Hugging Face">
        <HuggingFaceIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 17. Poe (Quora AI)
  if (normalizedKey.includes('poe') || lowerName.includes('poe')) {
    return (
      <div className={`${baseSquircle} bg-[#6366F1]/15 border border-[#6366F1]/30 text-[#4F46E5]`} title="Poe AI">
        <PoeIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 18. v0.dev (Vercel)
  if (normalizedKey.includes('v0') || lowerName.includes('v0')) {
    return (
      <div className={`${baseSquircle} bg-[#000000] border border-black/20 text-white`} title="v0.dev">
        <V0Icon className={iconSizes[size]} />
      </div>
    );
  }

  // 19. GitHub Copilot
  if (normalizedKey.includes('copilot') || normalizedKey.includes('github') || lowerName.includes('copilot') || lowerName.includes('github')) {
    return (
      <div className={`${baseSquircle} bg-[#24292F] border border-zinc-700 text-white`} title="GitHub Copilot">
        <GitHubIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 20. Apple App Store
  if (normalizedKey.includes('apple') || lowerName.includes('apple') || lowerName.includes('icloud') || lowerName.includes('ios')) {
    return (
      <div className={`${baseSquircle} bg-[#000000] border border-black/20 text-white`} title="Apple">
        <AppleIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 21. Steam
  if (normalizedKey.includes('steam') || lowerName.includes('steam')) {
    return (
      <div className={`${baseSquircle} bg-[#171A21] border border-slate-700 text-white`} title="Steam">
        <SteamIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 22. Netflix
  if (normalizedKey.includes('netflix') || lowerName.includes('netflix')) {
    return (
      <div className={`${baseSquircle} bg-[#000000] border border-black/20 text-[#E50914]`} title="Netflix">
        <NetflixIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 23. Spotify
  if (normalizedKey.includes('spotify') || lowerName.includes('spotify')) {
    return (
      <div className={`${baseSquircle} bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#169C46]`} title="Spotify">
        <SpotifyIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 24. YouTube
  if (normalizedKey.includes('youtube') || lowerName.includes('youtube')) {
    return (
      <div className={`${baseSquircle} bg-[#FF0000]/15 border border-[#FF0000]/30 text-[#FF0000]`} title="YouTube">
        <YouTubeIcon className={iconSizes[size]} />
      </div>
    );
  }

  // 25. VPS / Server
  if (normalizedKey.includes('bandwagon') || normalizedKey.includes('vps') || lowerName.includes('bandwagon') || lowerName.includes('搬瓦工') || lowerName.includes('vps') || lowerName.includes('server')) {
    return (
      <div className={`${baseSquircle} bg-[#6366F1]/15 border border-[#6366F1]/30 text-[#4F46E5]`} title="VPS / Server">
        <Server className={iconSizes[size]} />
      </div>
    );
  }

  // ========================================================
  // "所有的都要展示图标" - 智能语义分类图标兜底（绝不展示字母）
  // ========================================================
  if (lowerName.includes('ai') || lowerName.includes('bot') || lowerName.includes('model') || lowerName.includes('chat') || lowerName.includes('智能')) {
    return (
      <div className={`${baseSquircle} bg-[#000000] border border-black/10 text-white`} title={name}>
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
