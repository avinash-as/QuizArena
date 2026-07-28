/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Theme-aware surface tokens (via CSS variables in index.css)
        surface:    'rgb(var(--surface) / <alpha-value>)',
        elevated:   'rgb(var(--elevated) / <alpha-value>)',
        subtle:     'rgb(var(--subtle) / <alpha-value>)',
        border:     'rgb(var(--border) / <alpha-value>)',
        borderStrong:'rgb(var(--border-strong) / <alpha-value>)',
        fg:         'rgb(var(--fg) / <alpha-value>)',
        muted:      'rgb(var(--muted) / <alpha-value>)',
        soft:       'rgb(var(--soft) / <alpha-value>)',

        // Brand — premium emerald
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Gold — coins/rewards
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        // Coral — danger/errors, warmer than red
        coral: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        accent: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },

        // Backward compat — old d11 aliases used across existing components
        d11: {
          bg:     'rgb(var(--surface))',
          card:   'rgb(var(--elevated))',
          border: 'rgb(var(--border))',
          green:  '#10b981',
          yellow: '#f59e0b',
          orange: '#f97316',
          red:    '#f43f5e',
          purple: '#8b5cf6',
          blue:   '#3b82f6',
        },
      },
      fontFamily: {
        display: ['"Sora"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow-brand':  '0 0 40px -8px rgb(16 185 129 / 0.45)',
        'glow-gold':   '0 0 40px -8px rgb(245 158 11 / 0.5)',
        'card-hover':  '0 20px 50px -20px rgb(0 0 0 / 0.3)',
        'inset-line':  'inset 0 1px 0 0 rgb(255 255 255 / 0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': 'radial-gradient(at 20% 20%, rgb(16 185 129 / 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(139 92 246 / 0.12) 0px, transparent 50%), radial-gradient(at 40% 100%, rgb(245 158 11 / 0.08) 0px, transparent 50%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.06 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'rise': 'rise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
      keyframes: {
        ticker:   { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        rise:     { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
