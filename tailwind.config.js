/** @type {import('tailwindcss').Config} */
// Design tokens for Vsmat — a local-only vault + renewal ledger.
// Monochrome "obsidian" base (brand), one semantic signal per meaning:
//   secure (emerald) · due (amber) · overdue (rose). Everything else is ink on paper.
const fontCJK = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", "WenQuanYi Micro Hei"';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutrals
        ink: { DEFAULT: '#1B1D21', soft: '#4B5058' },
        muted: '#5F6670', // secondary text (5.9:1 on white)
        subtle: '#8B919B', // placeholders / disabled only
        canvas: '#F4F5F7', // page background
        inset: '#F1F2F4', // recessed fills inside cards
        line: { DEFAULT: '#E3E6EA', strong: '#C9CED5' },
        // Semantic signals (these also remap the Tailwind palettes used across components)
        emerald: { 50: '#EAF6F0', 100: '#D3EDE1', 200: '#A9DBC4', 300: '#6FC2A0', 400: '#33A47B', 500: '#0F8F65', 600: '#0B7A55', 700: '#096448', 800: '#0A503B', 900: '#093F30' },
        amber: { 50: '#FFF6E5', 100: '#FFEBC2', 200: '#F6D58E', 300: '#EBB84F', 400: '#D99A1C', 500: '#BF7F08', 600: '#A15C00', 700: '#834A00', 800: '#6B3D03', 900: '#4F2D05' },
        rose: { 50: '#FDEEEC', 100: '#FADAD6', 200: '#F3B6AE', 300: '#E98A7F', 400: '#D95C4E', 500: '#C93A2B', 600: '#B42318', 700: '#982016', 800: '#7A1B13', 900: '#5E160F' },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Variable"', '"IBM Plex Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', ...fontCJK.split(', ').map((s) => s.replace(/"/g, '')), 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', ...fontCJK.split(', ').map((s) => s.replace(/"/g, '')), 'monospace'],
      },
      // Radius scale by role: chips 6 · controls 8/10 · cards 12 · sheets 16
      borderRadius: { md: '6px', lg: '8px', xl: '10px', '2xl': '12px', '3xl': '16px' },
      boxShadow: {
        // One hairline + one soft lift. No glows.
        card: '0 1px 0 rgba(20,24,31,0.04), 0 1px 2px rgba(20,24,31,0.04)',
        pop: '0 12px 32px -8px rgba(20,24,31,0.18), 0 2px 6px rgba(20,24,31,0.06)',
        '2xs': '0 1px 1px rgba(20,24,31,0.04)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(2px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { fadeIn: 'fadeIn 140ms ease-out' },
    },
  },
  plugins: [],
};
