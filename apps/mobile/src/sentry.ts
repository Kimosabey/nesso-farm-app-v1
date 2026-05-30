/**
 * Sentry initialization for the Nesso mobile app.
 *
 * @sentry/react-native is a native module — it has a JS fallback that no-ops
 * cleanly in Expo Go, so the app stays runnable there. Crash reporting only
 * fires properly inside an EAS dev build / production build.
 */
import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initSentry(): void {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    enableAutoSessionTracking: true,
    enableNative: !__DEV__ || !!process.env.EXPO_PUBLIC_SENTRY_NATIVE,
  });
}

export const sentry = Sentry;
