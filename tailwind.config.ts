import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'var(--ink)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
          4: 'var(--ink-4)',
        },
        primary: '#4f46e5',
        surface: {
          DEFAULT: 'var(--surface)',
          soft: 'var(--surface-soft)',
          elevated: 'var(--surface-elevated)',
        },
        card: 'var(--card)',
        line: {
          DEFAULT: 'var(--line)',
          soft: 'var(--line-soft)',
          strong: 'var(--line-strong)',
        },
        tint: {
          DEFAULT: 'var(--tint)',
          strong: 'var(--tint-strong)',
          icon: 'var(--tint-icon)',
          soft: 'var(--tint-soft)',
        },
        hero: {
          DEFAULT: 'var(--hero)',
          alt: 'var(--hero-2)',
        },
        track: 'var(--track)',
        'brand-solid': 'var(--brand-solid)',
        'brand-solid-hover': 'var(--brand-solid-hover)',
        danger: 'var(--danger)',
        warn: 'var(--warn)',
        brand: {
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: 'var(--brand-300)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
