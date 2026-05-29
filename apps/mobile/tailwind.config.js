const preset = require('@nesso/design-system/tailwind-preset');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset, require('nativewind/preset')],
  content: [
    './App.tsx',
    './src/**/*.{ts,tsx}',
    '../../packages/design-system/src/**/*.{ts,tsx}',
  ],
  plugins: [],
};
