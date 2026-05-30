/**
 * Firebase phone auth wrapper.
 *
 * @react-native-firebase ships native code that is only present inside an
 * EAS dev build or a production build. Stock Expo Go does NOT bundle it,
 * so even `require('@react-native-firebase/auth')` triggers the
 * "Native module RNFBAppModule not found" runtime error.
 *
 * We guard the `require` two ways:
 *   1. Skip it entirely when running in Expo Go (Constants.appOwnership === 'expo')
 *   2. Wrap the require in try/catch as a belt-and-braces fallback for
 *      other environments where the native module might be missing
 *      (web, Snack, future Expo runtimes).
 *
 * Password login remains the only auth path that works in Expo Go;
 * the OTP UI surfaces a clear "needs a dev build" notice instead.
 */
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

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

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let cached: RNFirebaseAuthModule | null = null;
function loadAuth(): RNFirebaseAuthModule | null {
  if (isExpoGo || Platform.OS === 'web') return null;
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
  return loadAuth() !== null;
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
