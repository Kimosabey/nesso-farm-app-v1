module.exports = function (api) {
  api.cache(true);
  return {
    // Expo SDK 54: `babel-preset-expo` already wires the worklets transform
    // via `react-native-worklets/plugin` (replaces the old reanimated/plugin).
    // Do NOT add `react-native-reanimated/plugin` here.
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: { '@': './src' },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
    ],
  };
};
