import { DARK_IMAGES, IMAGES } from '@utils/images';

import useTheme from './useTheme';

/*
 * Custom hook to get images based on the current theme.
 * It merges the default images with dark mode images if dark mode is enabled.
 */
const useImages = () => {
  const { darkMode } = useTheme();
  return { ...IMAGES, ...(darkMode ? DARK_IMAGES : {}) };
};

export default useImages;
