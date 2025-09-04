import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Polaris-inspired color system
        teal: {
          50: '#f6fffe',
          100: '#e6fefc',
          200: '#d1fef8',
          300: '#a7fdf2',
          400: '#6df7e8',
          500: '#17d1c9', // Primary teal (Polaris style)
          600: '#08918d',
          700: '#0b726f',
          800: '#0d5d5a',
          900: '#0f4d4a',
        },

        // Original primary colors from design guide
        primary: {
          DEFAULT: '#2563EB',
          foreground: '#FFFFFF',
        },

        // Enhanced slate grayscale palette (Polaris gray)
        slate: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },

        // Polaris gray system
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Background and foreground
        background: '#FFFFFF',
        foreground: '#0F172A',
        // Card colors
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
        // Popover
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
        // Input
        input: '#E2E8F0',
        // Border
        border: '#E2E8F0',
        // Ring
        ring: '#2563EB',
        // Semantic colors
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#10B981',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#64748B',
          foreground: '#94A3B8',
        },
        accent: {
          DEFAULT: '#F1F5F9',
          foreground: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
