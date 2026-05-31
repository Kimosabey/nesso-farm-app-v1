/**
 * Mobile i18n runtime — mirrors the theme Provider + hook pattern.
 *
 * Lightweight, dependency-free: plain React context + a nested-key lookup with
 * {{var}} interpolation. `en` is the source of truth; `hi` and `kn` are bundled
 * for the core key set. Every other locale (and any missing key) falls back to
 * `en`, then finally to the key string itself.
 *
 * Locale is persisted to AsyncStorage under `@nesso/language` — the exact key the
 * Language screen reads/writes — so switching language anywhere updates the whole
 * app and survives restarts. Changing the locale produces a new context value, so
 * every `useT()` consumer re-renders with the new strings.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nesso/language';

/** The 12 supported languages (same list the Language screen renders). */
export const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
] as const;

export type Language = (typeof languages)[number];

/** A translation tree — nested objects of strings, looked up by dot-path. */
type TranslationTree = { [key: string]: string | TranslationTree };

const en: TranslationTree = {
  common: {
    app: { name: 'Nesso', tagline: 'Farm-to-fork traceability' },
    search: 'Search',
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      approve: 'Approve',
      reject: 'Reject',
      next: 'Next',
      back: 'Back',
      retry: 'Retry',
      search: 'Search',
      signIn: 'Sign in',
    },
    status: {
      loading: 'Loading…',
      saved: 'Saved',
      offline: 'Offline',
      synced: 'Synced',
      syncing: 'Syncing…',
    },
    tabs: {
      home: 'Home',
      farmers: 'Farmers',
      verify: 'Verify',
      farms: 'Farms',
      register: 'Register',
    },
  },
  auth: {
    login: {
      title: 'Welcome to Nesso',
      subtitle: "Log in with your mobile number. We'll send an OTP to verify.",
      phoneLabel: 'Phone',
      phoneHint: 'Standard SMS rates may apply.',
      passwordLabel: 'Password',
      send_otp: 'Send OTP',
      sign_in: 'Sign in',
      usePassword: 'Staff? Sign in with password',
      useOtp: 'Use phone OTP instead',
      needHelp: 'Need help signing in?',
      terms: "By continuing you agree to Nesso's Terms & Privacy Policy",
    },
    otp: {
      title: 'Verify your number',
      verify: 'Verify',
      resend: 'Resend code',
    },
  },
  dashboard: {
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    thisSeason: 'This season',
    quickActions: 'Quick actions',
    jumpTo: 'Jump to',
    recentActivity: 'Recent activity',
    seeAll: 'See all',
    allSynced: 'All synced',
    qa: {
      register: 'Register',
      addFarm: 'Add farm',
      activity: 'Activity',
      scanGrn: 'Scan GRN',
    },
  },
  farmers: {
    title: 'Farmers',
    inCluster: '{{count}} in your cluster',
    searchPlaceholder: 'Search name or village',
    noMatch: 'No farmers match.',
  },
  filters: {
    all: 'All',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
  },
  settings: {
    account: 'Account',
    app: 'App',
    support: 'Support',
    language: 'Language',
    theme: 'Theme & display',
    notifications: 'Notifications',
    syncHealth: 'Sync health',
    offlineMaps: 'Offline maps',
    help: 'Help & docs',
    about: 'About Nesso',
    logout: 'Log out',
  },
};

const hi: TranslationTree = {
  common: {
    app: { name: 'Nesso', tagline: 'खेत से थाली तक ट्रेसबिलिटी' },
    search: 'खोजें',
    actions: {
      save: 'सहेजें',
      cancel: 'रद्द करें',
      approve: 'स्वीकृत करें',
      reject: 'अस्वीकार करें',
      next: 'आगे',
      back: 'वापस',
      retry: 'पुनः प्रयास',
      search: 'खोजें',
      signIn: 'साइन इन करें',
    },
    status: {
      loading: 'लोड हो रहा है…',
      saved: 'सहेजा गया',
      offline: 'ऑफ़लाइन',
      synced: 'सिंक हो गया',
      syncing: 'सिंक हो रहा है…',
    },
    tabs: {
      home: 'होम',
      farmers: 'किसान',
      verify: 'सत्यापन',
      farms: 'खेत',
      register: 'पंजीकरण',
    },
  },
  auth: {
    login: {
      title: 'Nesso में आपका स्वागत है',
      subtitle: 'अपने मोबाइल नंबर से लॉग इन करें। हम पुष्टि के लिए एक OTP भेजेंगे।',
      phoneLabel: 'फ़ोन',
      phoneHint: 'मानक SMS दरें लागू हो सकती हैं।',
      passwordLabel: 'पासवर्ड',
      send_otp: 'OTP भेजें',
      sign_in: 'साइन इन करें',
      usePassword: 'स्टाफ़? पासवर्ड से साइन इन करें',
      useOtp: 'फ़ोन OTP का उपयोग करें',
      needHelp: 'साइन इन में मदद चाहिए?',
      terms: 'जारी रखते हुए आप Nesso की शर्तें और गोपनीयता नीति से सहमत हैं।',
    },
    otp: {
      title: 'अपना नंबर सत्यापित करें',
      verify: 'सत्यापित करें और जारी रखें',
      resend: 'कोड पुनः भेजें',
    },
  },
  dashboard: {
    greetingMorning: 'सुप्रभात',
    greetingAfternoon: 'नमस्कार',
    greetingEvening: 'शुभ संध्या',
    thisSeason: 'इस मौसम',
    quickActions: 'त्वरित कार्य',
    jumpTo: 'यहाँ जाएँ',
    recentActivity: 'हाल की गतिविधि',
    seeAll: 'सभी देखें',
    allSynced: 'सब सिंक हो गया',
    qa: {
      register: 'पंजीकरण',
      addFarm: 'खेत जोड़ें',
      activity: 'गतिविधि',
      scanGrn: 'GRN स्कैन',
    },
  },
  farmers: {
    title: 'किसान',
    inCluster: 'आपके क्लस्टर में {{count}}',
    searchPlaceholder: 'नाम या गाँव खोजें',
    noMatch: 'कोई किसान नहीं मिला।',
  },
  filters: {
    all: 'सभी',
    approved: 'स्वीकृत',
    pending: 'लंबित',
    rejected: 'अस्वीकृत',
  },
  settings: {
    account: 'खाता',
    app: 'ऐप',
    support: 'सहायता',
    language: 'भाषा',
    theme: 'थीम और प्रदर्शन',
    notifications: 'सूचनाएँ',
    syncHealth: 'सिंक स्थिति',
    offlineMaps: 'ऑफ़लाइन नक्शे',
    help: 'सहायता और दस्तावेज़',
    about: 'Nesso के बारे में',
    logout: 'लॉग आउट',
  },
};

const kn: TranslationTree = {
  common: {
    app: { name: 'Nesso', tagline: 'ಹೊಲದಿಂದ ತಟ್ಟೆಗೆ ಪತ್ತೆಹಚ್ಚುವಿಕೆ' },
    search: 'ಹುಡುಕಿ',
    actions: {
      save: 'ಉಳಿಸಿ',
      cancel: 'ರದ್ದುಮಾಡಿ',
      approve: 'ಅನುಮೋದಿಸಿ',
      reject: 'ತಿರಸ್ಕರಿಸಿ',
      next: 'ಮುಂದೆ',
      back: 'ಹಿಂದೆ',
      retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      search: 'ಹುಡುಕಿ',
      signIn: 'ಸೈನ್ ಇನ್',
    },
    status: {
      loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
      saved: 'ಉಳಿಸಲಾಗಿದೆ',
      offline: 'ಆಫ್‌ಲೈನ್',
      synced: 'ಸಿಂಕ್ ಆಗಿದೆ',
      syncing: 'ಸಿಂಕ್ ಆಗುತ್ತಿದೆ…',
    },
    tabs: {
      home: 'ಮುಖಪುಟ',
      farmers: 'ರೈತರು',
      verify: 'ಪರಿಶೀಲನೆ',
      farms: 'ಹೊಲಗಳು',
      register: 'ನೋಂದಣಿ',
    },
  },
  auth: {
    login: {
      title: 'Nesso ಗೆ ಸುಸ್ವಾಗತ',
      subtitle: 'ನಿಮ್ಮ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯಿಂದ ಲಾಗಿನ್ ಆಗಿ. ದೃಢೀಕರಣಕ್ಕಾಗಿ ನಾವು OTP ಕಳುಹಿಸುತ್ತೇವೆ.',
      phoneLabel: 'ಫೋನ್',
      phoneHint: 'ಪ್ರಮಾಣಿತ SMS ದರಗಳು ಅನ್ವಯಿಸಬಹುದು.',
      passwordLabel: 'ಪಾಸ್‌ವರ್ಡ್',
      send_otp: 'OTP ಕಳುಹಿಸಿ',
      sign_in: 'ಸೈನ್ ಇನ್',
      usePassword: 'ಸಿಬ್ಬಂದಿ? ಪಾಸ್‌ವರ್ಡ್‌ನಿಂದ ಸೈನ್ ಇನ್',
      useOtp: 'ಫೋನ್ OTP ಬಳಸಿ',
      needHelp: 'ಸೈನ್ ಇನ್ ಗೆ ಸಹಾಯ ಬೇಕೆ?',
      terms: 'ಮುಂದುವರಿಯುವ ಮೂಲಕ ನೀವು Nesso ನ ನಿಯಮಗಳು ಮತ್ತು ಗೌಪ್ಯತಾ ನೀತಿಗೆ ಒಪ್ಪುತ್ತೀರಿ.',
    },
    otp: {
      title: 'ನಿಮ್ಮ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ',
      verify: 'ಪರಿಶೀಲಿಸಿ ಮುಂದುವರಿಯಿರಿ',
      resend: 'ಕೋಡ್ ಮತ್ತೆ ಕಳುಹಿಸಿ',
    },
  },
  dashboard: {
    greetingMorning: 'ಶುಭೋದಯ',
    greetingAfternoon: 'ಶುಭ ಮಧ್ಯಾಹ್ನ',
    greetingEvening: 'ಶುಭ ಸಂಜೆ',
    thisSeason: 'ಈ ಋತು',
    quickActions: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
    jumpTo: 'ಇಲ್ಲಿಗೆ ಹೋಗಿ',
    recentActivity: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ',
    seeAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
    allSynced: 'ಎಲ್ಲಾ ಸಿಂಕ್ ಆಗಿದೆ',
    qa: {
      register: 'ನೋಂದಣಿ',
      addFarm: 'ಹೊಲ ಸೇರಿಸಿ',
      activity: 'ಚಟುವಟಿಕೆ',
      scanGrn: 'GRN ಸ್ಕ್ಯಾನ್',
    },
  },
  farmers: {
    title: 'ರೈತರು',
    inCluster: 'ನಿಮ್ಮ ಕ್ಲಸ್ಟರ್‌ನಲ್ಲಿ {{count}}',
    searchPlaceholder: 'ಹೆಸರು ಅಥವಾ ಗ್ರಾಮ ಹುಡುಕಿ',
    noMatch: 'ಯಾವುದೇ ರೈತರು ಹೊಂದಿಕೆಯಾಗಲಿಲ್ಲ.',
  },
  filters: {
    all: 'ಎಲ್ಲಾ',
    approved: 'ಅನುಮೋದಿತ',
    pending: 'ಬಾಕಿ',
    rejected: 'ತಿರಸ್ಕೃತ',
  },
  settings: {
    account: 'ಖಾತೆ',
    app: 'ಆ್ಯಪ್',
    support: 'ಬೆಂಬಲ',
    language: 'ಭಾಷೆ',
    theme: 'ಥೀಮ್ ಮತ್ತು ಪ್ರದರ್ಶನ',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    syncHealth: 'ಸಿಂಕ್ ಆರೋಗ್ಯ',
    offlineMaps: 'ಆಫ್‌ಲೈನ್ ನಕ್ಷೆಗಳು',
    help: 'ಸಹಾಯ ಮತ್ತು ದಾಖಲೆಗಳು',
    about: 'Nesso ಬಗ್ಗೆ',
    logout: 'ಲಾಗ್ ಔಟ್',
  },
};

/** Bundled locales. Unbundled locales fall back to `en` at lookup time. */
export const resources: Record<string, TranslationTree> = { en, hi, kn };

/** Resolve a dot-path (`auth.login.send_otp`) against a tree → string | undefined. */
function lookup(tree: TranslationTree | undefined, key: string): string | undefined {
  if (!tree) return undefined;
  let node: string | TranslationTree | undefined = tree;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = node[part];
  }
  return typeof node === 'string' ? node : undefined;
}

/** Replace `{{var}}` tokens with values from `vars`. */
function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;

interface LanguageContextValue {
  /** Active locale code (e.g. 'en', 'hi', 'kn'). */
  locale: string;
  /** Switch locale (persisted to AsyncStorage `@nesso/language`). */
  setLocale: (code: string) => void;
  /** Translate a dot-path key, with {{var}} interpolation + en/key fallback. */
  t: TFunction;
  /** The 12-entry language list. */
  languages: typeof languages;
}

function translate(locale: string, key: string, vars?: Record<string, string | number>): string {
  const value = lookup(resources[locale], key) ?? lookup(resources.en, key) ?? key;
  return interpolate(value, vars);
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key, vars) => translate('en', key, vars),
  languages,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState('en');

  // Load the persisted locale once.
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (active && v) setLocaleState(v);
    });
    return () => {
      active = false;
    };
  }, []);

  const setLocale = useCallback((code: string) => {
    setLocaleState(code);
    void AsyncStorage.setItem(STORAGE_KEY, code);
  }, []);

  const t = useCallback<TFunction>((key, vars) => translate(locale, key, vars), [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, t, languages }),
    [locale, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** Access the active locale, switcher, and `t()` translator. */
export function useT(): LanguageContextValue {
  return useContext(LanguageContext);
}
