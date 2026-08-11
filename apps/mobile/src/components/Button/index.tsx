import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import useStyles from '@hooks/useStyles';
import { FONT } from '@utils/constants';

import styles from './styles';

export type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
};

const Button = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  accessibilityLabel,
}: ButtonProps) => {
  const { dynamicStyles, Colors } = useStyles(styles);

  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        dynamicStyles.button,
        isDisabled && dynamicStyles.buttonDisabled,
        pressed && !isDisabled && dynamicStyles.buttonPressed,
      ]}
    >
      <View style={dynamicStyles.content}>
        {loading ? (
          <ActivityIndicator color={Colors.onPrimary as string} />
        ) : (
          <Text style={[dynamicStyles.text, { fontFamily: FONT.SEMI_BOLD }]}>
            {title}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export default Button;
