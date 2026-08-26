import { loadAsync } from 'expo-font';
import { mobileEnvironment } from '@/platform/environment';

export const API_BASE_URL = mobileEnvironment.apiBaseUrl;

export const FONT_WEIGHTS = {
  100: '100',
  200: '200',
  300: '300',
  400: '400', // Also known as "Regular"
  500: '500',
  600: '600',
  700: '700',
  800: '800',
  900: '900', // Heaviest weight
} as const;

export const FONT = {
  LIGHT: 'Signika-Negative-Light',
  REGULAR: 'Signika-Negative-Regular',
  MEDIUM: 'Signika-Negative-Medium',
  SEMI_BOLD: 'Signika-Negative-SemiBold',
  BOLD: 'Signika-Negative-Bold',
};

export const preloadFonts = async () => {
  try {
    await loadAsync({
      [FONT.LIGHT]: require('../../assets/fonts/SignikaNegative-Light.ttf'),
      [FONT.REGULAR]: require('../../assets/fonts/SignikaNegative-Regular.ttf'),
      [FONT.MEDIUM]: require('../../assets/fonts/SignikaNegative-Medium.ttf'),
      [FONT.SEMI_BOLD]: require('../../assets/fonts/SignikaNegative-SemiBold.ttf'),
      [FONT.BOLD]: require('../../assets/fonts/SignikaNegative-Bold.ttf'),
    });
  } catch (e) {
    console.warn('Font preloading note:', e);
  }
};
