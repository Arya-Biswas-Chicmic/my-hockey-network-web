module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@utils': './src/utils',
          '@assets': './assets',
          '@theme': './src/theme',
          '@redux': './src/redux',
          '@hooks': './src/hooks',
          '@my-hockey-network/types': '../../packages/types/src/index.ts',
          '@my-hockey-network/constants': '../../packages/constants/src/index.ts',
          '@my-hockey-network/design-system': '../../packages/design-system/src/index.ts',
          '@my-hockey-network/utils': '../../packages/utils/src/index.ts',
          '@my-hockey-network/core': '../../packages/core/src/index.ts',
          '@my-hockey-network/auth': '../../packages/auth/src/index.ts',
          '@my-hockey-network/shared': '../../packages/shared/src/index.ts',
        },
      },
    ],
  ],
};
