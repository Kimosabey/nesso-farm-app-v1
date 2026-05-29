/**
 * @nesso/i18n
 *
 * 12-language i18next resource bundles. EN is the source of truth.
 * Other locales fall back to EN when keys are missing.
 *
 * Add new keys here first, then run `pnpm i18n:scan` to flag locales
 * needing translation.
 */

import enCommon from '../resources/en/common.json';
import enAuth from '../resources/en/auth.json';

export const supportedLocales = [
  'en', // English
  'hi', // Hindi
  'kn', // Kannada
  'bn', // Bengali
  'te', // Telugu
  'ta', // Tamil
  'ml', // Malayalam
  'mr', // Marathi
  'or', // Odia
  'gu', // Gujarati
  'tr', // Turkish
  'vi', // Vietnamese
] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = 'en';

export const localeDisplayName: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  kn: 'ಕನ್ನಡ',
  bn: 'বাংলা',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  ml: 'മലയാളം',
  mr: 'मराठी',
  or: 'ଓଡ଼ିଆ',
  gu: 'ગુજરાતી',
  tr: 'Türkçe',
  vi: 'Tiếng Việt',
};

export const resources = {
  en: { common: enCommon, auth: enAuth },
} as const;

export type Namespace = keyof (typeof resources)['en'];
