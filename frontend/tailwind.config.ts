/**
 * Tailwind 설정 — 10 §3 design token 4종(Color·Typography·Spacing·Component primitives) 매핑.
 * theme.extend가 styles.css의 CSS Variables(:root)를 인용 — Variables가 SoT.
 * ADR-0038 §3 BLOCK 정합 (12-scaffolding §8 styling 솔루션 → Tailwind).
 */
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          500: 'var(--color-primary-500)',
          700: 'var(--color-primary-700)',
        },
        secondary: {
          500: 'var(--color-secondary-500)',
          700: 'var(--color-secondary-700)',
        },
        neutral: {
          0: 'var(--color-neutral-0)',
          100: 'var(--color-neutral-100)',
          300: 'var(--color-neutral-300)',
          700: 'var(--color-neutral-700)',
          900: 'var(--color-neutral-900)',
        },
        danger: {
          500: 'var(--color-danger-500)',
          700: 'var(--color-danger-700)',
        },
      },
      fontFamily: {
        sans: 'var(--font-family-base)',
        mono: 'var(--font-family-mono)',
      },
      fontSize: {
        xs: ['var(--text-xs)', { lineHeight: '1rem' }],
        sm: ['var(--text-sm)', { lineHeight: '1.25rem' }],
        base: ['var(--text-base)', { lineHeight: '1.5rem' }],
        lg: ['var(--text-lg)', { lineHeight: '1.75rem' }],
        xl: ['var(--text-xl)', { lineHeight: '1.75rem' }],
        '2xl': ['var(--text-2xl)', { lineHeight: '2rem' }],
        '3xl': ['var(--text-3xl)', { lineHeight: '2.25rem' }],
      },
      fontWeight: {
        regular: 'var(--font-weight-regular)',
        semibold: 'var(--font-weight-semibold)',
        bold: 'var(--font-weight-bold)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        12: 'var(--space-12)',
      },
    },
  },
  plugins: [forms],
};

export default config;
