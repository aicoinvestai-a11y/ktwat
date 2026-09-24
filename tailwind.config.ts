import type { Config } from 'tailwindcss';

/**
 * Design System — خطوتي
 * ألوان هادئة، ودّية، عربية أولاً (RTL)، تباين عالٍ WCAG 2.2 AA.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sky: { 50: '#f1f8fd', 100: '#dceffa', 200: '#bde0f5', 300: '#8ecbee', 400: '#57ade2', 500: '#318fd0', 600: '#2172b0', 700: '#1d5c8f', 800: '#17496f' },
        mint: { 50: '#f0fbf6', 100: '#d9f5e7', 200: '#b3e9cf', 300: '#82d7b1', 400: '#4dbc8e', 500: '#2ba273', 600: '#1e825c', 700: '#1a684b' },
        sun: { 50: '#fffaeb', 100: '#fff1c6', 200: '#ffe087', 300: '#ffcb48', 400: '#f9b520', 500: '#e09606', 600: '#b47303', 700: '#8a5602' },
        grape: { 50: '#f7f5ff', 100: '#eeebff', 200: '#ded8ff', 300: '#c5b8ff', 400: '#a893f8', 500: '#8c72e6', 600: '#6d51c4', 700: '#573fa0' },
        peach: { 50: '#fff6f1', 100: '#ffe9dd', 200: '#ffd2b8', 300: '#ffb287', 400: '#fb8f57', 500: '#ee7132', 600: '#a8481a' },
        ink: { DEFAULT: '#26313d', soft: '#4c5b6b', mute: '#616e7d' },
        paper: { DEFAULT: '#fbfaf7', card: '#ffffff', line: '#e8e4db' },
      },
      fontFamily: {
        sans: ['var(--font-tajawal)', 'system-ui', 'sans-serif'],
        display: ['var(--font-kufi)', 'var(--font-tajawal)', 'sans-serif'],
      },
      fontSize: {
        // أحجام كبيرة مناسبة للأطفال — Mobile First
        'child-sm': ['1.125rem', { lineHeight: '1.9' }],
        'child-base': ['1.3125rem', { lineHeight: '1.9' }],
        'child-lg': ['1.625rem', { lineHeight: '1.7' }],
        'child-xl': ['2.125rem', { lineHeight: '1.5' }],
      },
      borderRadius: { xl2: '1.75rem', xl3: '2.25rem' },
      minHeight: { touch: '3.25rem' },
      minWidth: { touch: '3.25rem' },
      boxShadow: {
        soft: '0 6px 20px -8px rgba(38,49,61,0.18)',
        lift: '0 14px 34px -14px rgba(38,49,61,0.28)',
        focus: '0 0 0 4px rgba(49,143,208,0.35)',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(1)' }, '55%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)' } },
        sparkle: { '0%': { opacity: '0', transform: 'scale(.7)' }, '40%': { opacity: '1' }, '100%': { opacity: '0', transform: 'scale(1.25)' } },
        riseIn: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        pop: 'pop 480ms ease-out',
        sparkle: 'sparkle 900ms ease-out',
        riseIn: 'riseIn 420ms ease-out both',
        floaty: 'floaty 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
