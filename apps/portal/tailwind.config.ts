import type { Config } from 'tailwindcss';
import preset from '@nesso/design-system/tailwind-preset';

const config: Config = {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx,mdx}', '../../packages/design-system/src/**/*.{ts,tsx}'],
  plugins: [],
};
export default config;
