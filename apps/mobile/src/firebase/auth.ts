/**
 * Firebase phone auth wrapper.
 *
 * This module requires the native @react-native-firebase modules and therefore
 * only works inside an EAS dev build or production build — NOT in Expo Go.
 * The app must still boot in Expo Go, so we lazy-require the modules.
 */
import { Platform } from 'react-native';

export interface OtpConfirmation {
  /** Confirm the 6-digit SMS code and return a Firebase ID token. */
  confirm(code: string): Promise<string>;
}

interface RNFirebaseAuthModule {
  default: () => {
    signInWithPhoneNumber: (phone: string) => Promise<{
      confirm: (code: string) => Promise<{
        user: { getIdToken: () => Promise<string> } | null;
      }>;
    }>;
  };
}

let cached: RNFirebaseAuthModule | null = null;
function loadAuth(): RNFirebaseAuthModule | null {
  if (cached) return cached;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('@react-native-firebase/auth') as RNFirebaseAuthModule;
    return cached;
  } catch {
    return null;
  }
}

export function isPhoneOtpAvailable(): boolean {
  return loadAuth() !== null && Platform.OS !== 'web';
}

/**
 * Trigger an OTP SMS for an Indian mobile number (10 digits, +91 prepended here).
 * Returns a confirmation object whose .confirm(code) yields a Firebase ID token.
 */
export async function sendOtp(tenDigitMobile: string): Promise<OtpConfirmation> {
  const mod = loadAuth();
  if (!mod) {
    throw new Error('Phone OTP requires a dev build. Use password login in Expo Go.');
  }
  const auth = mod.default();
  const confirmation = await auth.signInWithPhoneNumber(`+91${tenDigitMobile}`);
  return {
    async confirm(code: string): Promise<string> {
      const result = await confirmation.confirm(code);
      if (!result.user) {
        throw new Error('Could not confirm code');
      }
      return result.user.getIdToken();
    },
  };
}
