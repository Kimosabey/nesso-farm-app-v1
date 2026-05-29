/**
 * @nesso/design-system · Tailwind preset
 *
 * Single source of truth for visual style across web + mobile.
 * All colors are CSS variables → theme switching is `data-theme="dark"` on root.
 * Token values live in ./tokens.json and ./src/theme.css.
 *
 * Used by:
 *   - apps/web         (Tailwind v3 in tailwind.config.ts)
 *   - apps/portal      (Tailwind v3 in tailwind.config.ts)
 *   - apps/mobile      (NativeWind v4 in tailwind.config.js)
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand scales (resolved values — never change, palette is validated)
        primary: {
          DEFAULT: '#0D783C',
          50: '#EAF6EE',
          100: '#C9E8D3',
          300: '#5DB683',
          500: '#0D783C',
          600: '#0A6232',
          700: '#207647',
          900: '#032816',
          fg: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#518E6D',
          50: '#EEF5F1',
          100: '#D3E5DB',
          300: '#7FB496',
          500: '#518E6D',
          700: '#3C6B51',
          900: '#1B2F24',
        },
        accent: {
          DEFAULT: '#F1D412',
          50: '#FFFCEB',
          100: '#FDF4B3',
          300: '#F8E353',
          500: '#F1D412',
          700: '#B69D08',
          900: '#5A4E04',
        },

        // Semantic — backed by CSS vars so theme switch is instant
        bg: 'rgb(var(--bg) / <alpha-value>)',
        'bg-elevated': 'rgb(var(--bg-elevated) / <alpha-value>)',
        'bg-muted': 'rgb(var(--bg-muted) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--fg-muted) / <alpha-value>)',
        'fg-subtle': 'rgb(var(--fg-subtle) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-strong': 'rgb(var(--border-strong) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
        info: 'rgb(var(--info) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '18px' }],
        sm: ['14px', { lineHeight: '22px' }],
        base: ['16px', { lineHeight: '26px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '30px' }],
        '2xl': ['24px', { lineHeight: '34px' }],
        '3xl': ['30px', { lineHeight: '38px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
        '5xl': ['48px', { lineHeight: '56px' }],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        xs: '0 1px 2px rgba(13, 40, 22, 0.04)',
        sm: '0 1px 3px rgba(13, 40, 22, 0.05)',
        md: '0 10px 30px -10px rgba(13, 40, 22, 0.16)',
        lg: '0 28px 60px -16px rgba(13, 40, 22, 0.24)',
        glow: '0 0 0 4px rgba(13, 120, 60, 0.18)',
      },
      transitionDuration: {
        fast: '120ms',
        DEFAULT: '200ms',
        slow: '320ms',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        emphasized: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
      // Tablet-aware breakpoints (matches the responsive contract)
      screens: {
        sm: '640px',
        md: '768px', // tablet portrait+
        lg: '1024px', // tablet landscape / laptop
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
};
