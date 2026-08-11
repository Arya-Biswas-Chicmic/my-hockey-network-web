import LayoutStyles from '@theme/Layout';

import useTheme from './useTheme';

/**
 * Custom hook to get common layout styles based on the current theme.
 * It uses the LayoutStyles function to generate styles with the current theme colors.
 */
const useLayoutStyles = () => {
  const { Colors } = useTheme();
  const Layout = LayoutStyles({ Colors });
  return Layout;
};

export default useLayoutStyles;
