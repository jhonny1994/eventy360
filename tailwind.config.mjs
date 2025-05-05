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
  // Theme object is largely removed for v4, configuration moves to CSS @theme
  theme: {
    extend: {
      // Keep font variables if you reference them directly elsewhere,
      // but the primary definition moves to CSS @theme
      // fontFamily: {
      //   sans: ['var(--font-tajawal)', 'sans-serif'], 
      //   inter: ['var(--font-inter)', 'sans-serif'], 
      // },
      // Remove color definitions, keyframes, animations, borderRadius 
      // if they are intended to be handled by base Tailwind/CSS vars/plugins
    },
  },
  // Plugins configuration remains
  plugins: [
    flowbitePlugin
  ],
};

export default config; 