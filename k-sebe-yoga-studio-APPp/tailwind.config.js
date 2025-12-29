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
      // APP-specific overrides (merge with preset)
      colors: {
        brand: {
          light: '#fdfbf7',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
};
