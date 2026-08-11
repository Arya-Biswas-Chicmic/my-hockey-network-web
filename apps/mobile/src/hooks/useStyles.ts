import { ThemeColors } from '@theme/constants';

import useLayoutStyles from './useLayoutStyles';
import useTheme from './useTheme';

/**
 * Custom hook to apply dynamic styles based on the current theme.
 * It provides access to the theme colors, layout styles, and theme management functions.
 *
 * @param styleFunction - A function that takes theme colors and returns styles.
 * @returns An object containing dynamic styles, colors, layout styles, and theme management functions.
 */
const useStyles = <T extends (colors: ThemeColors) => ReturnType<T>>(
  styleFunction: T,
) => {
  const { darkMode, Colors, currentTheme, changeTheme, toggleTheme } =
    useTheme();
  const Layout = useLayoutStyles();
  return {
    dynamicStyles: styleFunction(Colors),
    Colors,
    darkMode,
    Layout,
    currentTheme,
    changeTheme,
    toggleTheme,
  };
};

export default useStyles;
