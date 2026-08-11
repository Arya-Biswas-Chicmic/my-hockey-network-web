import { ColorValue, ImageStyle, TextStyle, ViewStyle } from 'react-native';

import { ThemeColors } from './constants';

export type Style = ViewStyle | TextStyle | ImageStyle;
type StyleFunctionWithNumber = (value: number) => Style;
type StyleFunctionWithColor = (color?: ColorValue) => Style;
// Define the shape of the returned layout styles
type LayoutStyleType = {
  flex: Style;
  center: Style;
  backgroundColor: StyleFunctionWithColor;
  padding: StyleFunctionWithNumber;
};

export default function LayoutStyles({
  Colors,
}: {
  Colors: ThemeColors;
}): LayoutStyleType {
  return {
    flex: { flex: 1 },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    backgroundColor: color => ({
      backgroundColor: color,
    }),
    padding: (value: number) => ({
      padding: value,
    }),
  };
}
