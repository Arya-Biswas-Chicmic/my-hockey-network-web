import { ReactNode, useMemo } from 'react';

import { Pressable, Text, View } from 'react-native';

import useStyles from '@hooks/useStyles';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_ROOT_ROUTE_NAMES } from '../../navigation/tabRoutes';

import styles from './styles';

export type HeaderProps = {
  title?: string;
  leftComponent?: ReactNode;
  rightComponent?: ReactNode;
  centerComponent?: ReactNode;
  showBack?: boolean;
  onBackPress?: () => void;
  accessibilityLabelBack?: string;
};

const Header = ({
  title,
  leftComponent,
  rightComponent,
  centerComponent,
  showBack,
  onBackPress,
  accessibilityLabelBack = 'Go back',
}: HeaderProps) => {
  const { dynamicStyles } = useStyles(styles);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  const canGoBack = navigation.canGoBack?.() ?? false;
  const isTabRootScreen = TAB_ROOT_ROUTE_NAMES.includes(route.name);
  const shouldShowBack = useMemo(() => {
    if (typeof showBack === 'boolean') return showBack;
    return canGoBack && !isTabRootScreen;
  }, [canGoBack, isTabRootScreen, showBack]);

  const handleBack = () => {
    if (onBackPress) return onBackPress();
    if (canGoBack) navigation.goBack();
  };

  const containerStyle = useMemo(
    () => [dynamicStyles.container, { paddingTop: insets.top }],
    [dynamicStyles.container, insets.top],
  );

  return (
    <View style={containerStyle}>
      <View style={dynamicStyles.content}>
        <View style={dynamicStyles.side}>
          {leftComponent ? (
            leftComponent
          ) : shouldShowBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={accessibilityLabelBack}
              onPress={handleBack}
              hitSlop={10}
              style={dynamicStyles.backButton}
            >
              <Text style={dynamicStyles.backText}>{'‹'}</Text>
              <Text style={dynamicStyles.backLabel}>Back</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={dynamicStyles.center}>
          {centerComponent ? (
            centerComponent
          ) : (
            <Text numberOfLines={1} style={dynamicStyles.title}>
              {title || ''}
            </Text>
          )}
        </View>

        <View style={[dynamicStyles.side, dynamicStyles.sideRight]}>
          {rightComponent ?? null}
        </View>
      </View>
    </View>
  );
};

export default Header;
