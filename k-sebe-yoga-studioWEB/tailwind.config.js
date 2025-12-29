/** @type {import('tailwindcss').Config} */
import preset from '../shared/styles/tailwind.preset.js';

export default {
  presets: [preset],
  content: [
    './index.html',
    './**/*.{js,ts,jsx,tsx}',
    '../shared/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // WEB-specific overrides (merge with preset)
      colors: {
        brand: {
          light: '#f9f9f9',
          accent: '#fceeb5',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        waveform: 'waveform 1s infinite ease-in-out',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        waveform: {
          '0%, 100%': { height: '8px', opacity: '0.5' },
          '50%': { height: '24px', opacity: '1' },
        },
      },
    },
  },
};
