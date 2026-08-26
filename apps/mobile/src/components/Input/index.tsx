import { forwardRef, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

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

import styles from '@/components/Input/styles';

export type InputProps = Omit<
  TextInputProps,
  'style' | 'placeholderTextColor'
> &
  Pick<AccessibilityProps, 'accessibilityLabel'> & {
    label?: string;
    error?: string;
    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    rightAccessory?: ReactNode;
  };

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      containerStyle,
      inputStyle,
      rightAccessory,
      editable = true,
      ...props
    },
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
      <View
        style={
          containerStyle
            ? [dynamicStyles.container, containerStyle]
            : dynamicStyles.container
        }
      >
        {!!label && <Text style={dynamicStyles.label}>{label}</Text>}
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
            style={
              inputStyle
                ? [dynamicStyles.input, inputStyle]
                : dynamicStyles.input
            }
          />
          {rightAccessory}
        </View>
        {!!error && (
          <Text accessibilityRole="alert" style={dynamicStyles.errorText}>
            {error}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';

export default Input;
