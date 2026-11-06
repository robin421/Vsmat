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
        // Brand: "vault green" — deep, calm, tied to the one promise the product makes (your data stays safe).
        brand: {
          50: '#E8F4EF', 100: '#CFE9DF', 200: '#A2D3C1', 300: '#6DB89F', 400: '#3A9A7C',
          500: '#1B7F62', 600: '#0F6B52', 700: '#0B5844', 800: '#094637', 900: '#0A2C24', 950: '#061C17',
        },
        // Neutrals carry a faint green undertone so they sit with the brand instead of fighting it.
        ink: { DEFAULT: '#14211D', soft: '#43524D' },
        muted: '#586A64', // secondary text (5.8:1 on white)
        subtle: '#8A9A95', // placeholders / disabled only
        canvas: '#F1F5F3', // page background
        inset: '#EAF0EE', // recessed fills
        line: { DEFAULT: '#DAE3DF', strong: '#C0CDC8' },
        // Status signals (remap the Tailwind palettes used across components)
        emerald: { 50: '#E8F4EF', 100: '#CFE9DF', 200: '#A2D3C1', 300: '#6DB89F', 400: '#3A9A7C', 500: '#1B7F62', 600: '#0F6B52', 700: '#0B5844', 800: '#094637', 900: '#0A2C24' },
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
        card: '0 1px 0 rgba(10,44,36,0.05), 0 1px 3px rgba(10,44,36,0.06)',
        pop: '0 16px 40px -10px rgba(10,44,36,0.28), 0 2px 6px rgba(10,44,36,0.08)',
        '2xs': '0 1px 1px rgba(10,44,36,0.05)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(2px)' }, to: { opacity: '1', transform: 'none' } },
      },
      animation: { fadeIn: 'fadeIn 140ms ease-out' },
    },
  },
  plugins: [],
};
