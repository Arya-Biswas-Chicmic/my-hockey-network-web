import { forwardRef, useMemo, useState } from 'react';

import {
  AccessibilityProps,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import useStyles from '@hooks/useStyles';
import { FONT } from '@utils/constants';

import styles from './styles';

export type InputProps = Omit<
  TextInputProps,
  'style' | 'placeholderTextColor'
> &
  Pick<AccessibilityProps, 'accessibilityLabel'> & {
    label?: string;
    error?: string;
    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
  };

const Input = forwardRef<TextInput, InputProps>(
  (
    { label, error, containerStyle, inputStyle, editable = true, ...props },
    ref,
  ) => {
    const { dynamicStyles, Colors } = useStyles(styles);
    const [focused, setFocused] = useState(false);

    const disabled = editable === false;

    const placeholderTextColor = useMemo(() => {
      return Colors.mutedText as string;
    }, [Colors.mutedText]);

    const inputContainerStyle = useMemo(() => {
      return [
        dynamicStyles.inputContainer,
        focused && dynamicStyles.inputContainerFocused,
        !!error && dynamicStyles.inputContainerError,
        disabled && dynamicStyles.inputContainerDisabled,
      ];
    }, [
      dynamicStyles.inputContainer,
      dynamicStyles.inputContainerDisabled,
      dynamicStyles.inputContainerError,
      dynamicStyles.inputContainerFocused,
      disabled,
      error,
      focused,
    ]);

    return (
      <View style={[dynamicStyles.container, containerStyle]}>
        {!!label && (
          <Text style={[dynamicStyles.label, { fontFamily: FONT.MEDIUM }]}>
            {label}
          </Text>
        )}
        <View style={inputContainerStyle}>
          <TextInput
            ref={ref}
            {...props}
            editable={!disabled}
            onFocus={e => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={e => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            placeholderTextColor={placeholderTextColor}
            style={[
              dynamicStyles.input,
              { fontFamily: FONT.REGULAR },
              inputStyle,
            ]}
          />
        </View>
        {!!error && (
          <Text
            accessibilityRole="alert"
            style={[dynamicStyles.errorText, { fontFamily: FONT.REGULAR }]}
          >
            {error}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';

export default Input;
