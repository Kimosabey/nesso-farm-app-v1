/**
 * @nesso/design-system
 *
 * Token-driven brand & UI system. Web + mobile share these primitives.
 * - tokens.json     · W3C Design Tokens (source of truth)
 * - tailwind-preset · Tailwind config shape (web + mobile)
 * - theme.css       · CSS variables, light + dark
 */

export const brand = {
  name: 'Nesso',
  org: 'NR Group',
  tagline: 'Farm-to-fork traceability',
} as const;

export const palette = {
  turfGreen: '#0D783C',
  turfGreen2: '#207647',
  primary300: '#5DB683',
  primary50: '#EAF6EE',
  goldenGlow: '#F1D412',
  jungleTeal: '#518E6D',
  jungleTealDeep: '#3C6B51',
  porcelain: '#FAFDFA',
  white: '#FFFFFF',
} as const;

export type Palette = typeof palette;

export const breakpoints = {
  sm: 640,
  md: 768, // tablet portrait+
  lg: 1024, // tablet landscape / laptop
  xl: 1280,
  '2xl': 1536,
} as const;

export const motion = {
  duration: { fast: 120, base: 200, slow: 320 },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    emphasized: 'cubic-bezier(0.32, 0.72, 0, 1)',
  },
  spring: { stiffness: 320, damping: 30 },
} as const;
