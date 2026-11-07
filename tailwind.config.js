/** @type {import('tailwindcss').Config} */
// Design tokens for Vsmat: a personal wallet for subscriptions, keys and gift cards.
// Cobalt is the brand; amber (due) and coral (overdue) are reserved for billing status,
// teal for "stored safely". Neutrals lean slightly blue so they sit with the brand.
const fontCJK = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", "WenQuanYi Micro Hei"';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: { row: '1360px' }, // wide enough for list rows; below this items are cards
      colors: {
        brand: {
          50: '#F0F4FF', 100: '#E3EAFF', 200: '#CAD7FF', 300: '#A8BBFF', 400: '#7F98FB', 500: '#5F7DF7',
          600: '#4C6DF3', 700: '#3F60EC', 800: '#3351D6', 900: '#2A43B0', 950: '#1E2F7D',
        },
        ink: { DEFAULT: '#16192B', soft: '#3F4459' },
        muted: '#646A80', // secondary text (5.2:1 on white)
        subtle: '#8E93A6', // placeholders / disabled only
        canvas: '#F6F7FB', // page background
        inset: '#EFF0F6', // recessed fills
        line: { DEFAULT: '#E6E8F0', strong: '#D3D6E2' },
        emerald: { 50: '#E6F6F1', 100: '#CCEDE3', 200: '#9EDCCB', 300: '#66C6AC', 400: '#2FA98A', 500: '#0F9274', 600: '#0B7D63', 700: '#0A6651', 800: '#0A5241', 900: '#093F33' },
        amber: { 50: '#FFF5E6', 100: '#FFE8C4', 200: '#FFD591', 300: '#FBBD58', 400: '#F2A32B', 500: '#DC8A0E', 600: '#B56E05', 700: '#8F5604', 800: '#6F4306', 900: '#523208' },
        rose: { 50: '#FEEFEE', 100: '#FDDCDA', 200: '#FBBAB6', 300: '#F68F89', 400: '#EE645C', 500: '#E0453D', 600: '#C9302A', 700: '#A82620', 800: '#86201B', 900: '#661A16' },
      },
      fontFamily: {
        sans: ['"Figtree Variable"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', ...fontCJK.split(', ').map((s) => s.replace(/"/g, '')), 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', ...fontCJK.split(', ').map((s) => s.replace(/"/g, '')), 'monospace'],
      },
      // Radius by role: chips 6 / controls 10 / inner panels 12 / cards 16 / heroes and sheets 20
      borderRadius: { md: '6px', lg: '10px', xl: '12px', '2xl': '16px', '3xl': '20px' },
      boxShadow: {
        card: '0 1px 2px rgba(22,25,43,0.04), 0 6px 20px -8px rgba(22,25,43,0.08)',
        pop: '0 20px 48px -12px rgba(20,27,77,0.28), 0 2px 8px rgba(20,27,77,0.08)',
        '2xs': '0 1px 2px rgba(22,25,43,0.06)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(2px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { fadeIn: 'fadeIn 140ms ease-out' },
    },
  },
  plugins: [],
};
