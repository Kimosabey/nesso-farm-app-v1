/**
 * Dynamic Expo config.
 *
 * Why this exists (rather than a static app.json):
 *   - Firebase native plugins require `googleServicesFile` to point at a
 *     real file. The Android/iOS config files are gitignored and only
 *     present on developer machines that have downloaded them from the
 *     Firebase console. With a static path the metro/expo CLI errors on
 *     boot — here we conditionally include the field only when the file
 *     actually exists.
 *   - Same idea for the icon assets — they live outside git in this repo,
 *     so we drop the field if the placeholder isn't there yet.
 */
const fs = require('fs');
const path = require('path');

const rel = (p) => (fs.existsSync(path.resolve(__dirname, p)) ? p : undefined);

module.exports = () => {
  const androidGoogleServices = rel('./google-services.json');
  const iosGoogleServices = rel('./GoogleService-Info.plist');
  const icon = rel('./assets/icon.png');
  const splash = rel('./assets/splash.png');
  const adaptiveIcon = rel('./assets/adaptive-icon.png');

  const plugins = [
    'expo-splash-screen',
    'expo-localization',
    'expo-camera',
    'expo-location',
    'expo-font',
    'expo-notifications',
    'expo-sqlite',
    [
      '@sentry/react-native/expo',
      {
        organization: 'harshimos-team',
        project: 'nesso-mobile',
      },
    ],
    ['expo-build-properties', { ios: { useFrameworks: 'static' } }],
  ];

  // Only wire Firebase native plugins if the config files are present —
  // otherwise the dev server fails to start before any of our code runs.
  if (androidGoogleServices || iosGoogleServices) {
    plugins.push('@react-native-firebase/app');
    plugins.push('@react-native-firebase/auth');
  }

  return {
    expo: {
      name: 'Nesso',
      slug: 'nesso',
      scheme: 'nesso',
      version: '0.0.1',
      orientation: 'portrait',
      ...(icon ? { icon } : {}),
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      splash: {
        ...(splash ? { image: splash } : {}),
        resizeMode: 'contain',
        backgroundColor: '#0D783C',
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: 'app.nesso.farmer',
        ...(iosGoogleServices ? { googleServicesFile: iosGoogleServices } : {}),
        infoPlist: {
          NSLocationWhenInUseUsageDescription:
            'Nesso uses your location to map farms accurately and tag field activities.',
          NSCameraUsageDescription:
            'Nesso uses the camera to capture ID proofs, farm photos, and scan batch QR codes.',
          NSPhotoLibraryUsageDescription:
            'Nesso may save and read photos for KYC and farm documentation.',
          ITSAppUsesNonExemptEncryption: false,
        },
      },
      android: {
        package: 'app.nesso.farmer',
        ...(androidGoogleServices ? { googleServicesFile: androidGoogleServices } : {}),
        adaptiveIcon: {
          ...(adaptiveIcon ? { foregroundImage: adaptiveIcon } : {}),
          backgroundColor: '#0D783C',
        },
        permissions: [
          'ACCESS_FINE_LOCATION',
          'ACCESS_COARSE_LOCATION',
          'CAMERA',
          'INTERNET',
          'ACCESS_NETWORK_STATE',
          'POST_NOTIFICATIONS',
          'android.permission.CAMERA',
          'android.permission.RECORD_AUDIO',
          'android.permission.ACCESS_COARSE_LOCATION',
          'android.permission.ACCESS_FINE_LOCATION',
        ],
      },
      // Web is intentionally NOT a supported target for this app:
      //   - @react-native-firebase/* has no web shim
      //   - @sentry/react-native has no web shim
      //   - expo-sqlite's web target uses wa-sqlite (WASM) which Metro
      //     can't bundle without extra config
      // Leaving `web` undefined makes `expo start` skip the web prompt
      // and `localhost:8081` only act as the Metro bundler endpoint for
      // native devices. Reintroduce only when we ship a real web client.
      plugins,
      extra: {
        eas: { projectId: '225186ac-02a2-4849-abea-9e2ff813a520' },
        router: { origin: false },
      },
      owner: 'harshimos-team',
    },
  };
};
