import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background system
        bg: {
          DEFAULT: '#0B0F19',
          panel: '#111827',
          'panel-light': '#172033',
        },
        // Border
        border: {
          DEFAULT: '#1F2937',
          light: '#2A3447',
        },
        // Brand
        brand: {
          DEFAULT: '#2563FF',
          hover: '#1E54E5',
          subtle: 'rgba(37, 99, 255, 0.12)',
        },
        accent: {
          DEFAULT: '#27D0C3',
          hover: '#1FB8AC',
          subtle: 'rgba(39, 208, 195, 0.12)',
        },
        // Text
        fg: {
          DEFAULT: '#F9FAFB',
          muted: '#9CA3AF',
          subtle: '#6B7280',
          dark: '#111827',
        },
        // Status
        success: {
          DEFAULT: '#10B981',
          subtle: 'rgba(16, 185, 129, 0.12)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          subtle: 'rgba(245, 158, 11, 0.12)',
        },
        danger: {
          DEFAULT: '#EF4444',
          subtle: 'rgba(239, 68, 68, 0.12)',
        },
        info: {
          DEFAULT: '#3B82F6',
          subtle: 'rgba(59, 130, 246, 0.12)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        'panel': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'panel-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        'glow-brand': '0 0 0 1px rgba(37, 99, 255, 0.3), 0 0 20px rgba(37, 99, 255, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 250ms ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
