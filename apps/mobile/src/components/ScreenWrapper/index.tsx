import { PropsWithChildren, useMemo } from 'react';

import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import Header, { HeaderProps } from '@components/Header';
import { HEADER_HEIGHT } from '@components/Header/constants';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ScreenWrapperProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  headerProps?: HeaderProps;
  showHeader?: boolean;
}>;

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
});

const ScreenWrapper = ({
  style,
  contentStyle,
  headerProps,
  showHeader = true,
  children,
}: ScreenWrapperProps) => {
  const insets = useSafeAreaInsets();
  const topPadding = (showHeader ? HEADER_HEIGHT : 0) + insets.top;

  const wrapperStyle = useMemo(
    () => (style ? [styles.flexContainer, style] : styles.flexContainer),
    [style],
  );

  const innerContentStyle = useMemo(
    () => [styles.flexContainer, { paddingTop: topPadding }, contentStyle],
    [topPadding, contentStyle],
  );

  return (
    <View style={wrapperStyle}>
      {showHeader ? <Header {...headerProps} /> : null}
      <View style={innerContentStyle}>{children}</View>
    </View>
  );
};

export default ScreenWrapper;
