import packageJson from './package.json';

import type { ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';

const BUNDLE_IDENTIFIER = IS_DEV
  ? 'com.anonymous.expoboilerplate.dev'
  : 'com.anonymous.expoboilerplate';

const config: ExpoConfig = {
  name: IS_DEV ? 'expo-boilerplate-dev' : 'expo-boilerplate',
  slug: 'expo-boilerplate',
  version: packageJson.version,
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: BUNDLE_IDENTIFIER,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: BUNDLE_IDENTIFIER,
  },
  extra: {
    APP_VARIANT: process.env.APP_VARIANT,
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
  experiments: { reactCompiler: false },
  plugins: [
    'expo-build-properties',
    'expo-asset',
    'expo-font',
  ],
};

export default config;
