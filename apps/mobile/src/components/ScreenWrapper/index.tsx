import { PropsWithChildren } from 'react';

import { StyleProp, View, ViewStyle } from 'react-native';

import Header, { HeaderProps } from '@components/Header';
import { HEADER_HEIGHT } from '@components/Header/constants';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ScreenWrapperProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  headerProps?: HeaderProps;
  showHeader?: boolean;
}>;

const ScreenWrapper = ({
  style,
  contentStyle,
  headerProps,
  showHeader = true,
  children,
}: ScreenWrapperProps) => {
  const insets = useSafeAreaInsets();
  const topPadding = (showHeader ? HEADER_HEIGHT : 0) + insets.top;

  return (
    <View style={[{ flex: 1 }, style]}>
      {showHeader ? <Header {...headerProps} /> : null}
      <View style={[{ flex: 1, paddingTop: topPadding }, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

export default ScreenWrapper;
