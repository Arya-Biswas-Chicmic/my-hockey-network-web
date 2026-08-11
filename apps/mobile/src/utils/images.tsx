import { Asset } from 'expo-asset';

export const IMAGES = {
  MONEY: require('@assets/images/money.png'),
};

export const DARK_IMAGES = {
  MONEY: require('@assets/images/money.png'),
};

// preload images
export const preloadImages = () =>
  Object.keys({ ...IMAGES, ...DARK_IMAGES }).map(key => {
    return Asset.fromModule(
      (IMAGES as { [key: string]: ReturnType<typeof require> })?.[key] ||
        (DARK_IMAGES as { [key: string]: ReturnType<typeof require> })?.[key],
    ).downloadAsync();
  });
