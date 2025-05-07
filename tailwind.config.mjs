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

    },
  },
  plugins: [
    flowbitePlugin
  ],
};

export default config; 