import { useMemo, useState } from 'react';

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import Button from '@components/Button';
import Input from '@components/Input';
import ScreenWrapper from '@components/ScreenWrapper';
import useStyles from '@hooks/useStyles';
import { ROUTES } from '../../navigation/constants';
import { RootStackParamList } from '../../navigation/types';
import { useForgotPasswordMutation } from '@redux/ApiReducer';
import { FONT } from '@utils/constants';
import { isValidEmail, sanitizeEmail } from '@utils/validation';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';

type Props = NativeStackScreenProps<RootStackParamList, ROUTES.FORGOT_PASSWORD>;

const ForgotPasswordScreen = ({ navigation }: Props) => {
  const { dynamicStyles, Layout, Colors } = useStyles(styles);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const [email, setEmail] = useState('');
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<{ email?: boolean }>({});

  const emailError = useMemo(() => {
    if (!touched.email) return undefined;
    const e = sanitizeEmail(email);
    if (!e) return 'Email is required.';
    if (!isValidEmail(e)) return 'Enter a valid email.';
    return undefined;
  }, [email, touched.email]);

  const canSubmit = useMemo(() => {
    const e = sanitizeEmail(email);
    return !!e && isValidEmail(e);
  }, [email]);

  const onSubmit = async () => {
    Keyboard.dismiss();
    setTouched({ email: true });
    setSubmitError(undefined);
    setSuccess(undefined);
    if (!canSubmit || isLoading) return;

    try {
      const res = await forgotPassword({
        email: sanitizeEmail(email),
      }).unwrap();
      setSuccess(res?.message || 'If your email exists, we sent a reset link.');
      setTimeout(() => navigation.navigate(ROUTES.LOGIN), 600);
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        'Unable to request reset. Please try again.';
      setSubmitError(message);
    }
  };

  return (
    <ScreenWrapper
      style={dynamicStyles.screen}
      headerProps={{ title: 'Reset password' }}
    >
      <Pressable
        style={Layout.flex}
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <KeyboardAvoidingView
          style={Layout.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={dynamicStyles.card}>
            <Text style={[dynamicStyles.title, { fontFamily: FONT.BOLD }]}>
              Forgot password
            </Text>
            <Text
              style={[dynamicStyles.subtitle, { fontFamily: FONT.REGULAR }]}
            >
              We’ll email you a reset link.
            </Text>

            <View style={dynamicStyles.form}>
              <Input
                accessibilityLabel="Email"
                label="Email"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setSubmitError(undefined);
                  setSuccess(undefined);
                }}
                onBlur={() => setTouched({ email: true })}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="done"
                error={emailError}
                placeholder="you@example.com"
              />

              {!!submitError && (
                <Text
                  accessibilityRole="alert"
                  style={[dynamicStyles.message, { color: Colors.error }]}
                >
                  {submitError}
                </Text>
              )}
              {!!success && (
                <Text style={[dynamicStyles.message, { color: Colors.text }]}>
                  {success}
                </Text>
              )}

              <Button
                title="Send reset link"
                onPress={onSubmit}
                loading={isLoading}
                disabled={!canSubmit}
                accessibilityLabel="Send reset link"
              />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to login"
                onPress={() => navigation.navigate(ROUTES.LOGIN)}
                disabled={isLoading}
                style={dynamicStyles.bottomLink}
              >
                <Text style={[dynamicStyles.link, { fontFamily: FONT.MEDIUM }]}>
                  Back to login
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </ScreenWrapper>
  );
};

export default ForgotPasswordScreen;
