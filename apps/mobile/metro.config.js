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

module.exports = withNativeWind(config, { input: './global.css' });
