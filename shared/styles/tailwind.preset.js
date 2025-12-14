/**
 * K Sebe Yoga Studio - Tailwind CSS Preset
 * Shared design tokens across WEB and APP
 *
 * Usage in tailwind.config.js:
 *   presets: [require('@ksebe/shared/styles/tailwind.preset.js')]
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      // Brand Colors
      colors: {
        brand: {
          green: '#57a773',
          mint: '#d4edda',
          yellow: '#f0c14b',
          dark: '#1a1a1a',
          text: '#2d3436',
          accent: '#fef3c7',
        },
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },

      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },

      // Spacing
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },

      // Border Radius (Rounded corners for yoga aesthetic)
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },

      // Shadows
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        glow: '0 0 20px rgba(87, 167, 115, 0.3)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },

      // Animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        blob: 'blob 7s infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'hand-swipe': 'handSwipe 2s ease-in-out infinite',
        scan: 'scan 2s linear infinite',
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
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        handSwipe: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(20px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },

      // Backdrop blur
      backdropBlur: {
        xs: '2px',
      },

      // Z-index scale
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },

      // Aspect ratios
      aspectRatio: {
        '4/3': '4 / 3',
        '3/4': '3 / 4',
        '9/16': '9 / 16',
      },

      // Safe area for mobile
      padding: {
        safe: 'env(safe-area-inset-bottom)',
      },
    },
  },

  plugins: [
    // Custom utilities plugin
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.safe-area-bottom': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.safe-area-top': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.animation-delay-2000': {
          'animation-delay': '2s',
        },
        '.animation-delay-4000': {
          'animation-delay': '4s',
        },
      });
    },
  ],
};
