import { Platform } from 'react-native';

import { FONT_WEIGHTS } from './constants';

import { RFValue } from 'react-native-responsive-fontsize';

/**
 * Checks if the current platform is iOS.
 *
 * @returns {boolean} - True if the platform is iOS, false otherwise.
 */
export const isIos = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * Checks if the current platform is Android.
 *
 * @returns {boolean} - True if the platform is Android, false otherwise.
 */
export const isAndroid = (): boolean => {
  return Platform.OS === 'android';
};

export const boldText = isAndroid() ? FONT_WEIGHTS[700] : FONT_WEIGHTS[600];

export const _scaleText = (fontSize: number) => {
  return RFValue(fontSize);
};
