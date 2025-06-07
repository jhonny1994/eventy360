import flowbitePlugin from 'flowbite/plugin';

/** @type {import('tailwindcss').Config} */
const config = {
  // Keep darkMode if using next-themes or similar
  darkMode: "class",
  // Content scanning remains essential
  content: [
    "./node_modules/flowbite/**/*.js",
    './src/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto-kufi-arabic)'],
      },
      colors: {
        'primary-blue': {
          light: '#0D47A1', // Light theme
          dark: '#90CAF9',  // Dark theme
        },
        'secondary-amber': {
          light: '#F57C00', // Light theme
          dark: '#FFD54F',  // Dark theme
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out forwards',
        'particle-1': 'particle1 0.6s ease-in-out forwards',
        'particle-2': 'particle2 0.6s ease-in-out forwards',
        'particle-3': 'particle3 0.6s ease-in-out forwards',
        'particle-4': 'particle4 0.6s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        particle1: {
          '0%': { transform: 'translate(0, 0)', opacity: 1 },
          '100%': { transform: 'translate(-10px, -10px)', opacity: 0 },
        },
        particle2: {
          '0%': { transform: 'translate(0, 0)', opacity: 1 },
          '100%': { transform: 'translate(10px, -10px)', opacity: 0 },
        },
        particle3: {
          '0%': { transform: 'translate(0, 0)', opacity: 1 },
          '100%': { transform: 'translate(-10px, 10px)', opacity: 0 },
        },
        particle4: {
          '0%': { transform: 'translate(0, 0)', opacity: 1 },
          '100%': { transform: 'translate(10px, 10px)', opacity: 0 },
        },
      },
    },
  },
  plugins: [
    flowbitePlugin
  ],
};

export default config; 