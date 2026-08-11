import { useColorScheme } from 'react-native';

import { setTheme } from '@redux/CommonReducer';
import { useAppDispatch, useAppSelector } from '@redux/store';
import { THEME, ThemeColors } from '@theme/constants';
import { DarkColors } from '@theme/darkTheme';
import { LightColors } from '@theme/lightTheme';

/**
 * Custom hook to manage and provide theme-related functionalities.
 * It determines the current theme based on the device's color scheme or user preference,
 * and provides functions to toggle or change the theme.
 *
 * @returns An object containing the current theme colors, dark mode status, current theme,
 *          and functions to toggle or change the theme.
 */
const useTheme = () => {
  let currentTheme: THEME = THEME.DEVICE;
  let Colors: ThemeColors;
  const theme = useAppSelector(state => state?.common?.theme);
  const deviceScheme = useColorScheme();
  if (theme === THEME.DEVICE || theme === undefined) {
    currentTheme = deviceScheme === 'dark' ? THEME.DARK : THEME.LIGHT;
  } else {
    currentTheme = theme;
  }
  if (currentTheme === THEME.DARK) {
    Colors = DarkColors;
  } else {
    Colors = LightColors;
  }
  const dispatch = useAppDispatch();
  const toggleTheme = () => {
    dispatch(setTheme(currentTheme === THEME.DARK ? THEME.LIGHT : THEME.DARK));
  };
  const changeTheme = (theme: THEME) => {
    dispatch(setTheme(theme));
  };

  return {
    Colors,
    darkMode: currentTheme === THEME.DARK,
    currentTheme,
    toggleTheme,
    changeTheme,
  };
};

export default useTheme;
