import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--bg)',
        foreground: 'var(--fg)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        success: {
          DEFAULT: 'var(--success)',
          foreground: 'var(--success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          foreground: 'var(--warning-foreground)',
        },
        info: {
          DEFAULT: 'var(--info)',
          foreground: 'var(--info-foreground)',
        },
        brand: {
          DEFAULT: 'var(--brand)',
          50: 'var(--brand-50)',
          100: 'var(--brand-100)',
          200: 'var(--brand-200)',
          300: 'var(--brand-300)',
          400: 'var(--brand-400)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          700: 'var(--brand-700)',
          800: 'var(--brand-800)',
          900: 'var(--brand-900)',
          foreground: 'var(--brand-foreground)',
          electric: 'var(--brand-electric)',
          cyber: 'var(--brand-cyber)',
          deep: 'var(--brand-deep)',
          premium: 'var(--brand-premium)',
        },
        // Use Case Themed Colors
        'uc-healthcare': {
          DEFAULT: 'var(--uc-healthcare)',
          light: 'var(--uc-healthcare-light)',
        },
        'uc-finance': {
          DEFAULT: 'var(--uc-finance)',
          light: 'var(--uc-finance-light)',
        },
        'uc-government': {
          DEFAULT: 'var(--uc-government)',
          light: 'var(--uc-government-light)',
        },
        'uc-infrastructure': {
          DEFAULT: 'var(--uc-infrastructure)',
          light: 'var(--uc-infrastructure-light)',
        },
        'uc-pharma': {
          DEFAULT: 'var(--uc-pharma)',
          light: 'var(--uc-pharma-light)',
        },
        'uc-security': {
          DEFAULT: 'var(--uc-security)',
          light: 'var(--uc-security-light)',
        },
        'uc-compliance': {
          DEFAULT: 'var(--uc-compliance)',
          light: 'var(--uc-compliance-light)',
        },
        'uc-workflow': {
          DEFAULT: 'var(--uc-workflow)',
          light: 'var(--uc-workflow-light)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'Courier New', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': [
          '4.5rem',
          { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '900' },
        ],
        'display-lg': [
          '3.75rem',
          { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '800' },
        ],
        'display-md': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-sm': [
          '2.25rem',
          { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '700' },
        ],
        heading: ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.025em',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'glow-electric': 'var(--glow-electric)',
        'glow-cyber': 'var(--glow-cyber)',
        'glow-premium': 'var(--glow-premium)',
        'glow-danger': 'var(--glow-danger)',
        'glow-success': 'var(--glow-success)',
      },
      backgroundImage: {
        'gradient-brand': 'var(--gradient-brand)',
        'gradient-security': 'var(--gradient-security)',
        'gradient-premium': 'var(--gradient-premium)',
        'gradient-subtle': 'var(--gradient-subtle)',
        'mesh-brand': 'var(--mesh-brand)',
        'mesh-danger': 'var(--mesh-danger)',
        'mesh-success': 'var(--mesh-success)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-down': 'fadeDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
        elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        '0': '0ms',
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [],
};

export default config;
