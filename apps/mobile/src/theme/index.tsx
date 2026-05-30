/**
 * Mobile theme system — light + dark token palettes (design-system.tokens.json).
 *
 * Every screen reads its colour tokens via `useTheme().c` instead of a local
 * hardcoded `const C`. Flipping the mode (Dashboard moon icon / Theme screen)
 * re-renders every consumer with the dark palette. Mode is persisted to
 * AsyncStorage and defaults to the OS appearance.
 *
 * Token keys are the union of every `C.<key>` used across the screens, so a
 * screen's `const C = useTheme().c` is a drop-in replacement for its old
 * inline object.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeTokens {
  primary: string;
  primary50: string;
  secondary: string;
  secondaryD: string;
  secondaryBg: string;
  accent: string;
  accentD: string;
  info: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  onPrimary: string;
  bg: string;
  bgElevated: string;
  bgMuted: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  border: string;
  borderStrong: string;
}

export const lightTokens: ThemeTokens = {
  primary: '#0D783C',
  primary50: '#EAF6EE',
  secondary: '#518E6D',
  secondaryD: '#3C6B51',
  secondaryBg: '#EAF6EE',
  accent: '#F1D412',
  accentD: '#B69D08',
  info: '#0E7490',
  warning: '#9A8407',
  warningBg: '#FBF5D6',
  danger: '#B42318',
  dangerBg: '#FBEAE8',
  onPrimary: '#FFFFFF',
  bg: '#FAFDFA',
  bgElevated: '#FFFFFF',
  bgMuted: '#F1F5F2',
  fg: '#0F1A14',
  fgMuted: '#4A5A52',
  fgSubtle: '#7A8A82',
  border: '#DDE6E0',
  borderStrong: '#BFCFC6',
};

// Warm-tinted dark palette (never pure black), per the spec's dark tokens.
export const darkTokens: ThemeTokens = {
  primary: '#5DB683', // light-adapted brand for contrast on dark
  primary50: '#10301E', // dark tint behind primary icons
  secondary: '#7FB496',
  secondaryD: '#518E6D',
  secondaryBg: '#16271E',
  accent: '#F8E353',
  accentD: '#F1D412',
  info: '#38BDF8',
  warning: '#F8E353',
  warningBg: '#2A2710',
  danger: '#FF6B5B',
  dangerBg: '#2E1714',
  onPrimary: '#06140C',
  bg: '#0A1410',
  bgElevated: '#101C16',
  bgMuted: '#162720',
  fg: '#FAFDFA',
  fgMuted: '#A8B7AE',
  fgSubtle: '#7A8A82',
  border: '#1F2D26',
  borderStrong: '#2E3F37',
};

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** The active token palette — use as `const C = useTheme().c`. */
  c: ThemeTokens;
  /** Whether the resolved appearance is dark. */
  isDark: boolean;
  /** The user's chosen mode (may be 'system'). */
  mode: ThemeMode;
  /** Set an explicit mode (persisted). */
  setMode: (m: ThemeMode) => void;
  /** Quick light⇄dark flip (used by the moon icon). */
  toggle: () => void;
}

const STORAGE_KEY = 'nesso.themeMode';

const ThemeContext = createContext<ThemeContextValue>({
  c: lightTokens,
  isDark: false,
  mode: 'system',
  setMode: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [systemDark, setSystemDark] = useState(Appearance.getColorScheme() === 'dark');

  // Load persisted mode once.
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (active && (v === 'light' || v === 'dark' || v === 'system')) setModeState(v);
    });
    return () => {
      active = false;
    };
  }, []);

  // Track OS appearance changes (only matters when mode === 'system').
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemDark(colorScheme === 'dark');
    });
    return () => sub.remove();
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    void AsyncStorage.setItem(STORAGE_KEY, m);
  }, []);

  const isDark = mode === 'system' ? systemDark : mode === 'dark';

  const toggle = useCallback(() => {
    setMode(isDark ? 'light' : 'dark');
  }, [isDark, setMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ c: isDark ? darkTokens : lightTokens, isDark, mode, setMode, toggle }),
    [isDark, mode, setMode, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
