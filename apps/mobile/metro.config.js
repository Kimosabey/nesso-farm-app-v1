// Metro config — monorepo aware + NativeWind v4 (Expo SDK 54).
//
// Notes on pnpm + Expo monorepo resolution:
//   - We watch the workspace root so changes in packages/* hot-reload.
//   - Both the app's node_modules and the workspace root's node_modules
//     are added to the resolver path.
//   - `disableHierarchicalLookup` is intentionally LEFT OUT (default false).
//     With pnpm's nested symlink layout, transitive deps like
//     `expo-modules-core` and `react-native-css-interop/jsx-runtime` live
//     inside `node_modules/.pnpm/<pkg>@<ver>/node_modules/`. Metro needs
//     to traverse up to find them — setting `disableHierarchicalLookup`
//     blocks that traversal and breaks the bundle.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Defensive: if anyone hits the bundler with platform=web (e.g. opens
// localhost:8081 in a browser), expo-sqlite's web/worker.ts imports a
// .wasm binary that Metro doesn't know how to handle by default. We
// don't actually support web (see app.config.js `platforms`), but
// teaching Metro to treat wasm as an asset keeps the bundler from
// erroring out and spamming the dev terminal.
if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];
}

// lucide-react-native v1.x ships ESM barrel exports as .mjs files.
// Metro's default sourceExts doesn't include 'mjs', so it can't
// resolve the per-icon chunks like ./icons/app-window-mac.mjs.
// Adding mjs to sourceExts fixes the resolution whether we're on
// v0.x (CJS, doesn't need this) or v1.x (ESM barrel, does need this).
if (!config.resolver.sourceExts.includes('mjs')) {
  config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];
}

module.exports = withNativeWind(config, { input: './global.css' });
