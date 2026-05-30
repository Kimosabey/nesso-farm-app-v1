/**
 * Persisted auth + preferences via AsyncStorage.
 * Phase 6 swaps to MMKV (needs dev client). Expo Go uses AsyncStorage today.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const K_ACCESS = '@nesso/auth/access';
const K_REFRESH = '@nesso/auth/refresh';
const K_USER = '@nesso/auth/user';
const K_LANG = '@nesso/prefs/lang';

export interface PersistedUser {
  id: string;
  phone: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export const keychain = {
  async setSession(input: {
    accessToken: string;
    refreshToken: string;
    user: PersistedUser;
  }): Promise<void> {
    await AsyncStorage.multiSet([
      [K_ACCESS, input.accessToken],
      [K_REFRESH, input.refreshToken],
      [K_USER, JSON.stringify(input.user)],
    ]);
  },
  async getAccess(): Promise<string | null> {
    return AsyncStorage.getItem(K_ACCESS);
  },
  async getRefresh(): Promise<string | null> {
    return AsyncStorage.getItem(K_REFRESH);
  },
  async getUser(): Promise<PersistedUser | null> {
    const raw = await AsyncStorage.getItem(K_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedUser;
    } catch {
      return null;
    }
  },
  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([K_ACCESS, K_REFRESH, K_USER]);
  },
  async getLang(): Promise<string | null> {
    return AsyncStorage.getItem(K_LANG);
  },
  async setLang(lang: string): Promise<void> {
    await AsyncStorage.setItem(K_LANG, lang);
  },
};
